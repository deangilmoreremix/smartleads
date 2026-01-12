import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import OpenAI from "npm:openai@4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CreateVariantRequest {
  templateId: string;
  variantCount?: number;
  variationType?: 'subject' | 'body' | 'both' | 'tone';
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { templateId, variantCount = 2, variationType = 'both' }: CreateVariantRequest = await req.json();

    const { data: template, error: templateError } = await supabase
      .from("email_templates")
      .select("*")
      .eq("id", templateId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (templateError || !template) {
      throw new Error("Template not found or access denied");
    }

    const { data: userPrefs } = await supabase
      .from("user_ai_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const openai = new OpenAI({ apiKey: openaiApiKey });

    const variants = [];
    const variantNames = ['A', 'B', 'C', 'D', 'E', 'F'];

    for (let i = 0; i < Math.min(variantCount, 6); i++) {
      try {
        let systemPrompt = `You are an expert at A/B testing cold emails. Generate a variant of the given email that tests different approaches while maintaining the core value proposition.`;
        let userPrompt = '';

        if (variationType === 'subject') {
          userPrompt = `Generate an alternative subject line for this email that takes a different approach:\n\nOriginal Subject: ${template.subject}\n\nBody: ${template.body}\n\nCreate a subject line that tests a different angle (e.g., if original is curiosity-driven, try value-driven; if question-based, try statement-based).`;
        } else if (variationType === 'body') {
          userPrompt = `Generate an alternative email body that takes a different approach:\n\nSubject: ${template.subject}\n\nOriginal Body: ${template.body}\n\nCreate a body that tests a different structure or tone while keeping the same subject line.`;
        } else if (variationType === 'tone') {
          const tones = ['professional', 'friendly', 'casual', 'consultative', 'authoritative'];
          const newTone = tones[i % tones.length];
          userPrompt = `Rewrite this email in a ${newTone} tone:\n\nSubject: ${template.subject}\n\nBody: ${template.body}\n\nMaintain the same value proposition but adjust the tone to be more ${newTone}.`;
        } else {
          const approaches = [
            'problem-focused (highlight pain points)',
            'solution-focused (emphasize benefits)',
            'curiosity-driven (ask compelling questions)',
            'social-proof driven (mention results/clients)',
            'direct and concise',
            'storytelling approach'
          ];
          const approach = approaches[i % approaches.length];
          userPrompt = `Create a variant of this email using a ${approach} approach:\n\nOriginal Subject: ${template.subject}\n\nOriginal Body: ${template.body}\n\nCreate both a new subject line and body that test this approach while maintaining the core offer.`;
        }

        const jsonSystemPrompt = systemPrompt + `\n\nYou MUST respond with valid JSON: {"subject": "the subject line", "body": "the email body"}`;
        const response = await openai.responses.create({
          model: 'gpt-5-mini',
          instructions: jsonSystemPrompt,
          input: userPrompt + '\n\nRespond with JSON only.',
          reasoning: { effort: 'none' },
          text: { format: { type: 'json_object' } },
        });

        const generatedContent = response.output?.[0]?.content?.[0]?.text || '{}';

        let variantSubject = template.subject;
        let variantBody = template.body;

        try {
          const parsed = JSON.parse(generatedContent);
          if (variationType === 'subject') {
            variantSubject = parsed.subject || template.subject;
            variantBody = template.body;
          } else if (variationType === 'body') {
            variantSubject = template.subject;
            variantBody = parsed.body || generatedContent;
          } else {
            variantSubject = parsed.subject || template.subject;
            variantBody = parsed.body || template.body;
          }
        } catch {
          const subjectMatch = generatedContent.match(/"subject"\s*:\s*"([^"]+)"/);
          const bodyMatch = generatedContent.match(/"body"\s*:\s*"([\s\S]*?)(?:"\s*,|\"\s*\})/);
          if (variationType === 'subject') {
            variantSubject = subjectMatch?.[1] || template.subject;
          } else if (variationType === 'body') {
            variantBody = bodyMatch?.[1]?.replace(/\\n/g, '\n') || generatedContent;
          } else {
            variantSubject = subjectMatch?.[1] || template.subject;
            variantBody = bodyMatch?.[1]?.replace(/\\n/g, '\n') || template.body;
          }
        }

        const { data: insertedVariant, error: insertError } = await supabase
          .from("template_variants")
          .insert({
            template_id: templateId,
            variant_name: variantNames[i],
            subject: variantSubject,
            body: variantBody,
            ai_prompt: userPrompt,
            sent_count: 0,
            open_count: 0,
            reply_count: 0,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting variant:', insertError);
          throw insertError;
        }

        variants.push(insertedVariant);
      } catch (error) {
        console.error(`Error generating variant ${i}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        variants,
        message: `Created ${variants.length} variant(s) for A/B testing`,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error creating variants:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to create variants",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});