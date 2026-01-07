import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-Webhook-Secret',
};

interface WebhookPayload {
  event: string;
  timestamp?: string;
  data: Record<string, any>;
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

    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');
    const webhookSecret = req.headers.get('X-Webhook-Secret');

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing user_id parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: userSettings } = await supabaseClient
      .from('user_settings')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!userSettings) {
      return new Response(
        JSON.stringify({ error: 'Invalid user_id' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: WebhookPayload = await req.json();

    if (!payload.event || !payload.data) {
      return new Response(
        JSON.stringify({ error: 'Invalid payload: event and data are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result: Record<string, any> = {};

    switch (payload.event) {
      case 'lead.create': {
        const { campaign_id, business_name, email, phone, website, address, notes, custom_fields } = payload.data;

        if (!campaign_id || !business_name || !email) {
          return new Response(
            JSON.stringify({ error: 'campaign_id, business_name, and email are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: campaign } = await supabaseClient
          .from('campaigns')
          .select('id, user_id')
          .eq('id', campaign_id)
          .eq('user_id', userId)
          .maybeSingle();

        if (!campaign) {
          return new Response(
            JSON.stringify({ error: 'Campaign not found or not authorized' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: lead, error: leadError } = await supabaseClient
          .from('leads')
          .insert({
            campaign_id,
            user_id: userId,
            business_name,
            email: email.toLowerCase().trim(),
            phone,
            website,
            address,
            notes,
            custom_fields: custom_fields || {},
            source: 'webhook',
            status: 'new',
          })
          .select()
          .single();

        if (leadError) {
          throw new Error(`Failed to create lead: ${leadError.message}`);
        }

        await supabaseClient
          .from('campaigns')
          .update({ total_leads: campaign.total_leads + 1 })
          .eq('id', campaign_id);

        result = { lead_id: lead.id, message: 'Lead created successfully' };
        break;
      }

      case 'lead.update': {
        const { lead_id, updates } = payload.data;

        if (!lead_id || !updates) {
          return new Response(
            JSON.stringify({ error: 'lead_id and updates are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: lead } = await supabaseClient
          .from('leads')
          .select('id')
          .eq('id', lead_id)
          .eq('user_id', userId)
          .maybeSingle();

        if (!lead) {
          return new Response(
            JSON.stringify({ error: 'Lead not found or not authorized' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const allowedFields = ['pipeline_stage', 'status', 'notes', 'custom_fields', 'phone', 'website'];
        const sanitizedUpdates: Record<string, any> = {};
        for (const key of allowedFields) {
          if (updates[key] !== undefined) {
            sanitizedUpdates[key] = updates[key];
          }
        }

        if (sanitizedUpdates.pipeline_stage) {
          sanitizedUpdates.pipeline_stage_changed_at = new Date().toISOString();
        }

        const { error: updateError } = await supabaseClient
          .from('leads')
          .update(sanitizedUpdates)
          .eq('id', lead_id);

        if (updateError) {
          throw new Error(`Failed to update lead: ${updateError.message}`);
        }

        result = { message: 'Lead updated successfully' };
        break;
      }

      case 'lead.convert': {
        const { lead_id, deal_value, notes } = payload.data;

        if (!lead_id) {
          return new Response(
            JSON.stringify({ error: 'lead_id is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: lead } = await supabaseClient
          .from('leads')
          .select('id, campaign_id')
          .eq('id', lead_id)
          .eq('user_id', userId)
          .maybeSingle();

        if (!lead) {
          return new Response(
            JSON.stringify({ error: 'Lead not found or not authorized' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        await supabaseClient
          .from('leads')
          .update({
            pipeline_stage: 'converted',
            pipeline_stage_changed_at: new Date().toISOString(),
            status: 'converted',
            converted_at: new Date().toISOString(),
            deal_value: deal_value || null,
            notes: notes || null,
          })
          .eq('id', lead_id);

        await triggerOutgoingWebhooks(supabaseClient, userId, 'lead.converted', {
          lead_id,
          deal_value,
        });

        result = { message: 'Lead marked as converted' };
        break;
      }

      case 'campaign.pause': {
        const { campaign_id } = payload.data;

        if (!campaign_id) {
          return new Response(
            JSON.stringify({ error: 'campaign_id is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabaseClient
          .from('campaign_autopilot_settings')
          .update({ is_enabled: false })
          .eq('campaign_id', campaign_id);

        if (error) {
          throw new Error(`Failed to pause campaign: ${error.message}`);
        }

        result = { message: 'Campaign autopilot paused' };
        break;
      }

      case 'campaign.resume': {
        const { campaign_id } = payload.data;

        if (!campaign_id) {
          return new Response(
            JSON.stringify({ error: 'campaign_id is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabaseClient
          .from('campaign_autopilot_settings')
          .update({ is_enabled: true })
          .eq('campaign_id', campaign_id);

        if (error) {
          throw new Error(`Failed to resume campaign: ${error.message}`);
        }

        result = { message: 'Campaign autopilot resumed' };
        break;
      }

      case 'reply.create': {
        const { email_id, lead_id, reply_text, reply_subject, classification } = payload.data;

        if (!email_id || !lead_id) {
          return new Response(
            JSON.stringify({ error: 'email_id and lead_id are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: email } = await supabaseClient
          .from('emails')
          .select('id, campaign_id')
          .eq('id', email_id)
          .eq('user_id', userId)
          .maybeSingle();

        if (!email) {
          return new Response(
            JSON.stringify({ error: 'Email not found or not authorized' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        await supabaseClient
          .from('emails')
          .update({ status: 'replied', replied_at: new Date().toISOString() })
          .eq('id', email_id);

        await supabaseClient
          .from('leads')
          .update({
            status: 'replied',
            pipeline_stage: 'replied',
            pipeline_stage_changed_at: new Date().toISOString(),
          })
          .eq('id', lead_id);

        const { data: classificationRecord } = await supabaseClient
          .from('reply_classifications')
          .insert({
            email_id,
            lead_id,
            campaign_id: email.campaign_id,
            user_id: userId,
            classification: classification || 'other',
            confidence_score: 1.0,
            reply_text,
            reply_subject,
            is_reviewed: true,
          })
          .select()
          .single();

        await triggerOutgoingWebhooks(supabaseClient, userId, 'email.replied', {
          email_id,
          lead_id,
          classification: classification || 'other',
        });

        result = { classification_id: classificationRecord?.id, message: 'Reply recorded' };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown event type: ${payload.event}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    await supabaseClient.from('system_logs').insert({
      user_id: userId,
      level: 'info',
      category: 'webhook',
      message: `Incoming webhook processed: ${payload.event}`,
      metadata: { event: payload.event, result },
    });

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Webhook error:', error);

    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function triggerOutgoingWebhooks(
  supabase: any,
  userId: string,
  eventType: string,
  payload: Record<string, any>
) {
  try {
    const { data: webhooks } = await supabase
      .from('webhook_configurations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .contains('events', [eventType]);

    if (!webhooks || webhooks.length === 0) return;

    const fullPayload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      data: payload,
    };

    for (const webhook of webhooks) {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...webhook.headers,
      };

      if (webhook.secret) {
        headers['X-Webhook-Secret'] = webhook.secret;
      }

      fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(fullPayload),
      }).then(async (response) => {
        await supabase.from('webhook_deliveries').insert({
          webhook_id: webhook.id,
          user_id: userId,
          event_type: eventType,
          payload: fullPayload,
          status_code: response.status,
        });

        await supabase
          .from('webhook_configurations')
          .update({
            last_triggered_at: new Date().toISOString(),
            failure_count: response.ok ? 0 : webhook.failure_count + 1,
          })
          .eq('id', webhook.id);
      }).catch(async (err) => {
        await supabase.from('webhook_deliveries').insert({
          webhook_id: webhook.id,
          user_id: userId,
          event_type: eventType,
          payload: fullPayload,
          error_message: err.message,
        });
      });
    }
  } catch (err) {
    console.error('Error triggering outgoing webhooks:', err);
  }
}