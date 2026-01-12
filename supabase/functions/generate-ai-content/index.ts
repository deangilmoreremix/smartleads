import { createClient } from 'npm:@supabase/supabase-js@2';
import OpenAI from 'npm:openai@4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface GenerateContentRequest {
  systemPrompt: string;
  userPrompt: string;
  generateSubject?: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { systemPrompt, userPrompt, generateSubject }: GenerateContentRequest = await req.json();

    if (!systemPrompt || !userPrompt) {
      throw new Error('systemPrompt and userPrompt are required');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });

    if (generateSubject) {
      const jsonSystemPrompt = systemPrompt + `\n\nYou MUST respond with valid JSON: {"subject": "5-8 word subject line", "body": "the email body text"}`;
      const response = await openai.responses.create({
        model: 'gpt-5-mini',
        instructions: jsonSystemPrompt,
        input: userPrompt + '\n\nRespond with JSON only.',
        reasoning: { effort: 'none' },
        text: { format: { type: 'json_object' } },
      });

      const outputText = response.output?.[0]?.content?.[0]?.text || '{}';
      let parsed: { subject?: string; body?: string };
      try {
        parsed = JSON.parse(outputText);
      } catch {
        const subjectMatch = outputText.match(/"subject"\s*:\s*"([^"]+)"/);
        const bodyMatch = outputText.match(/"body"\s*:\s*"([\s\S]*?)(?:"\s*,|\"\s*\})/);
        parsed = {
          subject: subjectMatch?.[1] || 'Quick question',
          body: bodyMatch?.[1]?.replace(/\\n/g, '\n') || outputText,
        };
      }

      return new Response(
        JSON.stringify({ subject: parsed.subject || 'Quick question', body: parsed.body || '', content: parsed.body || '' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await openai.responses.create({
      model: 'gpt-5-mini',
      instructions: systemPrompt,
      input: userPrompt,
      reasoning: { effort: 'none' },
    });

    const content = response.output?.[0]?.content?.[0]?.text?.trim() || '';
    const contentArray = content.split('\n').filter(line => line.trim());

    return new Response(
      JSON.stringify({ content: contentArray, raw: content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('AI content generation error:', error);

    let statusCode = 500;
    let errorMessage = 'Failed to generate content';

    if (error.status === 429) {
      statusCode = 429;
      errorMessage = 'Rate limit reached. Please try again in a moment.';
    } else if (error.status === 401) {
      statusCode = 401;
      errorMessage = 'OpenAI API key is invalid';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});