import { supabase } from '../lib/supabase';

export interface QueuedLead {
  id: string;
  lead_id: string;
  campaign_id: string;
  email: string;
  business_name: string;
  priority_score: number;
  intent_score: number;
  website_health_score: number;
  recommended_approach: string;
  intent_signals: Array<{ type: string; strength: string; title: string }>;
  queue_status: 'pending' | 'ready' | 'processing' | 'sent' | 'failed' | 'skipped';
  scheduled_for: string | null;
  personalization_hints: Record<string, unknown>;
}

export interface QueueStats {
  total: number;
  pending: number;
  ready: number;
  processing: number;
  sent: number;
  failed: number;
  avgPriorityScore: number;
  highPriorityCount: number;
}

export async function getQueueStats(campaignId?: string): Promise<QueueStats> {
  let query = supabase.from('email_priority_queue').select('queue_status, priority_score');

  if (campaignId) {
    query = query.eq('campaign_id', campaignId);
  }

  const { data, error } = await query;

  if (error || !data) {
    return {
      total: 0,
      pending: 0,
      ready: 0,
      processing: 0,
      sent: 0,
      failed: 0,
      avgPriorityScore: 0,
      highPriorityCount: 0,
    };
  }

  const stats = {
    total: data.length,
    pending: data.filter(d => d.queue_status === 'pending').length,
    ready: data.filter(d => d.queue_status === 'ready').length,
    processing: data.filter(d => d.queue_status === 'processing').length,
    sent: data.filter(d => d.queue_status === 'sent').length,
    failed: data.filter(d => d.queue_status === 'failed').length,
    avgPriorityScore: data.length > 0
      ? Math.round(data.reduce((sum, d) => sum + (d.priority_score || 0), 0) / data.length)
      : 0,
    highPriorityCount: data.filter(d => (d.priority_score || 0) >= 70).length,
  };

  return stats;
}

export async function getQueuedLeads(
  campaignId: string,
  options: {
    status?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'priority_score' | 'scheduled_for' | 'created_at';
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<{ leads: QueuedLead[]; total: number }> {
  const { status, limit = 50, offset = 0, sortBy = 'priority_score', sortOrder = 'desc' } = options;

  let query = supabase
    .from('email_priority_queue')
    .select(`
      *,
      leads!inner(email, business_name)
    `, { count: 'exact' })
    .eq('campaign_id', campaignId);

  if (status) {
    query = query.eq('queue_status', status);
  }

  query = query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error || !data) {
    return { leads: [], total: 0 };
  }

  const leads: QueuedLead[] = data.map((item: Record<string, unknown>) => ({
    id: item.id as string,
    lead_id: item.lead_id as string,
    campaign_id: item.campaign_id as string,
    email: (item.leads as { email: string })?.email || '',
    business_name: (item.leads as { business_name: string })?.business_name || '',
    priority_score: (item.priority_score as number) || 0,
    intent_score: (item.intent_score as number) || 0,
    website_health_score: (item.website_health_score as number) || 0,
    recommended_approach: (item.recommended_approach as string) || 'standard',
    intent_signals: (item.intent_signals as Array<{ type: string; strength: string; title: string }>) || [],
    queue_status: item.queue_status as QueuedLead['queue_status'],
    scheduled_for: item.scheduled_for as string | null,
    personalization_hints: (item.personalization_hints as Record<string, unknown>) || {},
  }));

  return { leads, total: count || 0 };
}

export async function addLeadsToQueue(
  campaignId: string,
  leadIds: string[],
  options: {
    scheduledFor?: string;
    sendWindowStart?: string;
    sendWindowEnd?: string;
    timezone?: string;
    businessDaysOnly?: boolean;
  } = {}
): Promise<{ success: boolean; added: number; errors: string[] }> {
  const errors: string[] = [];
  let added = 0;

  const { data: leads, error: leadsError } = await supabase
    .from('leads')
    .select(`
      id,
      email,
      business_name,
      intent_score,
      priority_score,
      user_id
    `)
    .in('id', leadIds);

  if (leadsError || !leads) {
    return { success: false, added: 0, errors: ['Failed to fetch leads'] };
  }

  for (const lead of leads) {
    const { data: intentSignals } = await supabase
      .from('intent_signals')
      .select('signal_type, signal_strength, title')
      .eq('lead_id', lead.id)
      .eq('is_actionable', true)
      .order('relevance_score', { ascending: false })
      .limit(5);

    const { data: healthScore } = await supabase
      .from('website_health_scores')
      .select('overall_score')
      .eq('lead_id', lead.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const queueItem = {
      user_id: lead.user_id,
      campaign_id: campaignId,
      lead_id: lead.id,
      priority_score: lead.priority_score || 50,
      intent_score: lead.intent_score || 0,
      website_health_score: healthScore?.overall_score || 50,
      queue_status: 'pending',
      scheduled_for: options.scheduledFor || null,
      send_window_start: options.sendWindowStart || '09:00',
      send_window_end: options.sendWindowEnd || '17:00',
      timezone: options.timezone || 'America/New_York',
      business_days_only: options.businessDaysOnly ?? true,
      intent_signals: intentSignals || [],
      recommended_approach: getRecommendedApproach(lead.intent_score || 0, healthScore?.overall_score || 50),
    };

    const { error: insertError } = await supabase
      .from('email_priority_queue')
      .upsert(queueItem, { onConflict: 'lead_id,campaign_id' });

    if (insertError) {
      errors.push(`Lead ${lead.id}: ${insertError.message}`);
    } else {
      added++;
    }
  }

  return { success: errors.length === 0, added, errors };
}

function getRecommendedApproach(intentScore: number, healthScore: number): string {
  if (intentScore >= 70) return 'high_intent_aggressive';
  if (healthScore < 50) return 'website_improvement_pitch';
  if (intentScore >= 40) return 'moderate_interest_nurture';
  return 'standard_outreach';
}

export async function updateQueuePriorities(campaignId: string): Promise<{ updated: number }> {
  const { data: leads, error } = await supabase
    .from('leads')
    .select('id')
    .eq('campaign_id', campaignId);

  if (error || !leads) {
    return { updated: 0 };
  }

  const { error: rpcError } = await supabase.rpc('update_campaign_priority_scores', {
    p_campaign_id: campaignId,
  });

  if (rpcError) {
    console.error('Failed to update priorities:', rpcError);
    return { updated: 0 };
  }

  return { updated: leads.length };
}

export async function removeFromQueue(
  queueIds: string[]
): Promise<{ success: boolean; removed: number }> {
  const { error, count } = await supabase
    .from('email_priority_queue')
    .delete()
    .in('id', queueIds);

  if (error) {
    return { success: false, removed: 0 };
  }

  return { success: true, removed: count || 0 };
}

export async function updateQueueStatus(
  queueIds: string[],
  status: QueuedLead['queue_status']
): Promise<{ success: boolean }> {
  const { error } = await supabase
    .from('email_priority_queue')
    .update({ queue_status: status, updated_at: new Date().toISOString() })
    .in('id', queueIds);

  return { success: !error };
}

export async function scheduleQueueItems(
  queueIds: string[],
  scheduledFor: string
): Promise<{ success: boolean }> {
  const { error } = await supabase
    .from('email_priority_queue')
    .update({
      scheduled_for: scheduledFor,
      queue_status: 'ready',
      updated_at: new Date().toISOString(),
    })
    .in('id', queueIds);

  return { success: !error };
}

export async function getNextBatchToSend(
  campaignId: string,
  limit: number = 50
): Promise<QueuedLead[]> {
  const now = new Date();

  const { data, error } = await supabase
    .from('email_priority_queue')
    .select(`
      *,
      leads!inner(email, business_name)
    `)
    .eq('campaign_id', campaignId)
    .eq('queue_status', 'ready')
    .or(`scheduled_for.is.null,scheduled_for.lte.${now.toISOString()}`)
    .order('priority_score', { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map((item: Record<string, unknown>) => ({
    id: item.id as string,
    lead_id: item.lead_id as string,
    campaign_id: item.campaign_id as string,
    email: (item.leads as { email: string })?.email || '',
    business_name: (item.leads as { business_name: string })?.business_name || '',
    priority_score: (item.priority_score as number) || 0,
    intent_score: (item.intent_score as number) || 0,
    website_health_score: (item.website_health_score as number) || 0,
    recommended_approach: (item.recommended_approach as string) || 'standard',
    intent_signals: (item.intent_signals as Array<{ type: string; strength: string; title: string }>) || [],
    queue_status: item.queue_status as QueuedLead['queue_status'],
    scheduled_for: item.scheduled_for as string | null,
    personalization_hints: (item.personalization_hints as Record<string, unknown>) || {},
  }));
}

export function subscribeToQueueUpdates(
  campaignId: string,
  callback: (payload: { eventType: string; new: QueuedLead | null; old: QueuedLead | null }) => void
) {
  const channel = supabase
    .channel(`queue-${campaignId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'email_priority_queue',
        filter: `campaign_id=eq.${campaignId}`,
      },
      (payload) => {
        callback({
          eventType: payload.eventType,
          new: payload.new as QueuedLead | null,
          old: payload.old as QueuedLead | null,
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
