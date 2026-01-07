import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface WebhookEvent {
  type: string;
  object: string;
  account_id: string;
  message_id: string;
  timestamp: string;
  data?: {
    email?: string;
    subject?: string;
    user_agent?: string;
    ip_address?: string;
    link_url?: string;
    error?: string;
  };
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
    const unipileDsn = Deno.env.get("UNIPILE_DSN");

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get raw body for signature verification
    const rawBody = await req.text();
    const event: WebhookEvent = JSON.parse(rawBody);

    // Verify webhook signature if DSN is configured
    if (unipileDsn) {
      const signature = req.headers.get("X-Unipile-Signature");
      if (!signature) {
        return new Response(
          JSON.stringify({ error: "Missing webhook signature" }),
          {
            status: 401,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Verify the signature using HMAC-SHA256
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(unipileDsn),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );

      const signatureBuffer = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(rawBody)
      );

      const computedSignature = Array.from(new Uint8Array(signatureBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      if (signature !== computedSignature) {
        return new Response(
          JSON.stringify({ error: "Invalid webhook signature" }),
          {
            status: 401,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }
    }
    console.log("Received webhook event:", event);

    const { data: email } = await supabase
      .from("emails")
      .select("id, lead_id, campaign_id")
      .eq("unipile_message_id", event.message_id)
      .maybeSingle();

    if (!email) {
      console.log(`Email not found for message_id: ${event.message_id}`);
      return new Response(
        JSON.stringify({ success: true, message: "Email not found, skipping" }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    let eventType = "delivered";
    if (event.type === "email.delivered") {
      eventType = "delivered";
    } else if (event.type === "email.opened" || event.type === "email.read") {
      eventType = "opened";
    } else if (event.type === "email.clicked") {
      eventType = "clicked";
    } else if (event.type === "email.bounced") {
      eventType = "bounced";
    } else if (event.type === "email.spam") {
      eventType = "spam_report";
    } else if (event.type === "email.replied") {
      eventType = "replied";
    } else if (event.type === "email.failed") {
      eventType = "failed";
    }

    const { error: insertError } = await supabase
      .from("email_tracking_events")
      .insert({
        email_id: email.id,
        event_type: eventType,
        event_timestamp: event.timestamp || new Date().toISOString(),
        raw_webhook_data: event,
        user_agent: event.data?.user_agent,
        ip_address: event.data?.ip_address,
        link_url: event.data?.link_url,
        error_details: event.data?.error,
      });

    if (insertError) {
      console.error("Error inserting tracking event:", insertError);
      throw insertError;
    }

    if (eventType === "replied" && email.lead_id) {
      await supabase
        .from("leads")
        .update({
          has_replied: true,
          replied_at: event.timestamp || new Date().toISOString(),
          status: "replied",
        })
        .eq("id", email.lead_id);

      await supabase
        .from("lead_sequence_progress")
        .update({
          is_paused: true,
          pause_reason: "Lead replied to email",
        })
        .eq("lead_id", email.lead_id);

      await supabase
        .from("emails")
        .update({
          status: "replied",
          replied_at: event.timestamp || new Date().toISOString(),
        })
        .eq("id", email.id);

      const { data: campaign } = await supabase
        .from("campaigns")
        .select("emails_replied")
        .eq("id", email.campaign_id)
        .maybeSingle();

      if (campaign) {
        await supabase
          .from("campaigns")
          .update({
            emails_replied: (campaign.emails_replied || 0) + 1,
          })
          .eq("id", email.campaign_id);
      }

      console.log(`Reply detected! Paused sequence for lead ${email.lead_id}`);
    }

    console.log(`Successfully processed ${eventType} event for email ${email.id}`);

    return new Response(
      JSON.stringify({ success: true, event_type: eventType }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to process webhook",
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
