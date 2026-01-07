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

    const completion = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = completion.choices[0]?.message?.content?.trim() || '';

    if (generateSubject) {
      const lines = content.split('\n').filter(line => line.trim());
      const body = lines.join('\n');

      const subjectCompletion = await openai.chat.completions.create({
        model: 'gpt-5-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at writing compelling email subject lines. Write a short (5-8 words), personalized subject line. Be specific and relevant. Return ONLY the subject line, no quotes.'
          },
          {
            role: 'user',
            content: `Write a subject line for this email:\n\n${body}`
          }
        ],
        temperature: 0.8,
        max_tokens: 50,
      });

      const subject = subjectCompletion.choices[0]?.message?.content?.trim().replace(/^["']|["']$/g, '') || 'Quick question';

      return new Response(
        JSON.stringify({ subject, body, content }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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