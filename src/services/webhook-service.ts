import { supabase } from '../lib/supabase';

export interface WebhookConfig {
  id: string;
  user_id: string;
  name: string;
  url: string;
  events: string[];
  secret: string | null;
  headers: Record<string, string>;
  is_active: boolean;
  last_triggered_at: string | null;
  failure_count: number;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  user_id: string;
  event_type: string;
  payload: Record<string, any>;
  status_code: number | null;
  response_body: string | null;
  error_message: string | null;
  attempt_count: number;
  delivered_at: string;
}

export type WebhookEventType =
  | 'scraping.completed'
  | 'email.sent'
  | 'email.opened'
  | 'email.replied'
  | 'email.bounced'
  | 'lead.created'
  | 'lead.converted'
  | 'campaign.started'
  | 'campaign.completed';

export const WEBHOOK_EVENT_DESCRIPTIONS: Record<WebhookEventType, string> = {
  'scraping.completed': 'When lead scraping finishes',
  'email.sent': 'When an email is sent',
  'email.opened': 'When an email is opened',
  'email.replied': 'When a reply is received',
  'email.bounced': 'When an email bounces',
  'lead.created': 'When a new lead is added',
  'lead.converted': 'When a lead is converted',
  'campaign.started': 'When a campaign starts',
  'campaign.completed': 'When a campaign completes',
};

export async function getWebhooks(userId: string): Promise<WebhookConfig[]> {
  const { data, error } = await supabase
    .from('webhook_configurations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createWebhook(
  userId: string,
  name: string,
  url: string,
  events: string[],
  secret?: string,
  headers?: Record<string, string>
): Promise<WebhookConfig> {
  const { data, error } = await supabase
    .from('webhook_configurations')
    .insert({
      user_id: userId,
      name,
      url,
      events,
      secret: secret || null,
      headers: headers || {},
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateWebhook(
  webhookId: string,
  updates: Partial<WebhookConfig>
): Promise<void> {
  const { error } = await supabase
    .from('webhook_configurations')
    .update(updates)
    .eq('id', webhookId);

  if (error) throw error;
}

export async function deleteWebhook(webhookId: string): Promise<void> {
  const { error } = await supabase
    .from('webhook_configurations')
    .delete()
    .eq('id', webhookId);

  if (error) throw error;
}

export async function testWebhook(webhookId: string): Promise<{
  success: boolean;
  statusCode?: number;
  error?: string;
}> {
  const { data: webhook } = await supabase
    .from('webhook_configurations')
    .select('*')
    .eq('id', webhookId)
    .single();

  if (!webhook) {
    return { success: false, error: 'Webhook not found' };
  }

  const testPayload = {
    event: 'test',
    timestamp: new Date().toISOString(),
    data: {
      message: 'This is a test webhook delivery',
    },
  };

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...webhook.headers,
    };

    if (webhook.secret) {
      headers['X-Webhook-Secret'] = webhook.secret;
    }

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(testPayload),
    });

    await supabase.from('webhook_deliveries').insert({
      webhook_id: webhookId,
      user_id: webhook.user_id,
      event_type: 'test',
      payload: testPayload,
      status_code: response.status,
      response_body: await response.text().catch(() => null),
    });

    return {
      success: response.ok,
      statusCode: response.status,
    };
  } catch (err: any) {
    await supabase.from('webhook_deliveries').insert({
      webhook_id: webhookId,
      user_id: webhook.user_id,
      event_type: 'test',
      payload: testPayload,
      error_message: err.message,
    });

    return {
      success: false,
      error: err.message,
    };
  }
}

export async function getWebhookDeliveries(
  webhookId: string,
  limit: number = 50
): Promise<WebhookDelivery[]> {
  const { data, error } = await supabase
    .from('webhook_deliveries')
    .select('*')
    .eq('webhook_id', webhookId)
    .order('delivered_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function triggerWebhooks(
  userId: string,
  eventType: WebhookEventType,
  payload: Record<string, any>
): Promise<void> {
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
    try {
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

        await supabase
          .from('webhook_configurations')
          .update({
            failure_count: webhook.failure_count + 1,
          })
          .eq('id', webhook.id);
      });
    } catch (err) {
      console.error('Error triggering webhook:', err);
    }
  }
}
