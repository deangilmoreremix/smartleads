import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SequenceStep {
  id: string;
  campaign_id: string;
  step_number: number;
  delay_days: number;
  subject: string;
  body: string;
  is_active: boolean;
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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { batchSize = 50 } = await req.json().catch(() => ({}));

    const { data: readyLeads, error: fetchError } = await supabase
      .from("lead_sequence_progress")
      .select(`
        id,
        lead_id,
        current_step,
        next_send_date,
        leads!inner (
          id,
          campaign_id,
          email,
          business_name,
          has_replied,
          user_id,
          emails_sent_count,
          decision_maker_name,
          website,
          phone
        )
      `)
      .eq("is_paused", false)
      .eq("leads.user_id", user.id)
      .is("completed_at", null)
      .lte("next_send_date", new Date().toISOString())
      .limit(batchSize);

    if (fetchError) {
      throw fetchError;
    }

    let successful = 0;
    let failed = 0;
    let completed = 0;
    const errors: string[] = [];

    for (const progress of readyLeads || []) {
      const lead = progress.leads;
      if (!lead || lead.has_replied) continue;

      const { data: step, error: stepError } = await supabase
        .from("email_sequence_steps")
        .select("*")
        .eq("campaign_id", lead.campaign_id)
        .eq("step_number", progress.current_step)
        .eq("is_active", true)
        .maybeSingle();

      if (stepError || !step) {
        errors.push(`No active step found for lead ${lead.id}`);
        failed++;
        continue;
      }

      const personalizedSubject = personalizeContent(step.subject, lead);
      const personalizedBody = personalizeContent(step.body, lead);

      const { error: emailError } = await supabase
        .from("emails")
        .insert({
          campaign_id: step.campaign_id,
          lead_id: progress.lead_id,
          user_id: lead.user_id,
          subject: personalizedSubject,
          body: personalizedBody,
          status: "queued",
          personalization_data: {
            business_name: lead.business_name,
            email: lead.email,
          },
        });

      if (emailError) {
        errors.push(`Failed to create email for lead ${lead.id}: ${emailError.message}`);
        failed++;
        continue;
      }

      await supabase
        .from("leads")
        .update({
          last_email_sent_at: new Date().toISOString(),
          emails_sent_count: (lead.emails_sent_count || 0) + 1,
        })
        .eq("id", progress.lead_id);

      const nextStepNumber = progress.current_step + 1;

      const { data: nextStep } = await supabase
        .from("email_sequence_steps")
        .select("*")
        .eq("campaign_id", lead.campaign_id)
        .eq("step_number", nextStepNumber)
        .eq("is_active", true)
        .maybeSingle();

      if (!nextStep) {
        await supabase
          .from("lead_sequence_progress")
          .update({
            completed_at: new Date().toISOString(),
          })
          .eq("lead_id", progress.lead_id);

        completed++;
        successful++;
      } else {
        const nextSendDate = new Date();
        nextSendDate.setDate(nextSendDate.getDate() + nextStep.delay_days);

        await supabase
          .from("lead_sequence_progress")
          .update({
            current_step: nextStepNumber,
            next_send_date: nextSendDate.toISOString(),
          })
          .eq("lead_id", progress.lead_id);

        successful++;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: (readyLeads || []).length,
        successful,
        failed,
        completed,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error processing sequences:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to process sequences",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

function sanitizeValue(value: string): string {
  if (!value) return "";
  return value
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
}

function personalizeContent(content: string, leadDetails: any): string {
  let personalized = content;
  const businessName = sanitizeValue(leadDetails.business_name || "");
  const email = sanitizeValue(leadDetails.email || "");
  const firstName = sanitizeValue(leadDetails.decision_maker_name?.split(" ")[0] || "");
  const website = sanitizeValue(leadDetails.website || "");
  const phone = sanitizeValue(leadDetails.phone || "");
  personalized = personalized.replace(/\{\{business_name\}\}/g, businessName);
  personalized = personalized.replace(/\{\{email\}\}/g, email);
  personalized = personalized.replace(/\{\{first_name\}\}/g, firstName);
  personalized = personalized.replace(/\{\{website\}\}/g, website);
  personalized = personalized.replace(/\{\{phone\}\}/g, phone);
  return personalized;
}