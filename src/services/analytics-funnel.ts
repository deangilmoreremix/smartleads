import { supabase } from '../lib/supabase';

export interface FunnelData {
  leadsScraped: number;
  leadsQualified: number;
  emailsSent: number;
  emailsOpened: number;
  emailsReplied: number;
  meetingsScheduled: number;
  dealsConverted: number;
}

export interface FunnelStage {
  name: string;
  value: number;
  percentage: number;
  dropoff: number;
  color: string;
}

export interface CampaignComparison {
  campaignId: string;
  campaignName: string;
  leadsScraped: number;
  emailsSent: number;
  openRate: number;
  replyRate: number;
  conversionRate: number;
  costPerLead: number;
}

export interface DateRangeFunnel {
  date: string;
  data: FunnelData;
}

export async function getFunnelData(
  userId: string,
  campaignId?: string,
  startDate?: Date,
  endDate?: Date
): Promise<FunnelData> {
  let query = supabase.from('analytics_funnel').select('*').eq('user_id', userId);

  if (campaignId) {
    query = query.eq('campaign_id', campaignId);
  }

  if (startDate) {
    query = query.gte('date', startDate.toISOString().split('T')[0]);
  }

  if (endDate) {
    query = query.lte('date', endDate.toISOString().split('T')[0]);
  }

  const { data, error } = await query;

  if (error) throw error;

  const aggregated: FunnelData = {
    leadsScraped: 0,
    leadsQualified: 0,
    emailsSent: 0,
    emailsOpened: 0,
    emailsReplied: 0,
    meetingsScheduled: 0,
    dealsConverted: 0,
  };

  for (const row of data || []) {
    aggregated.leadsScraped += row.leads_scraped || 0;
    aggregated.leadsQualified += row.leads_qualified || 0;
    aggregated.emailsSent += row.emails_sent || 0;
    aggregated.emailsOpened += row.emails_opened || 0;
    aggregated.emailsReplied += row.emails_replied || 0;
    aggregated.meetingsScheduled += row.meetings_scheduled || 0;
    aggregated.dealsConverted += row.deals_converted || 0;
  }

  return aggregated;
}

export function calculateFunnelStages(data: FunnelData): FunnelStage[] {
  const stages: FunnelStage[] = [];
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#059669'];

  const values = [
    { name: 'Leads Scraped', value: data.leadsScraped },
    { name: 'Qualified', value: data.leadsQualified },
    { name: 'Contacted', value: data.emailsSent },
    { name: 'Opened', value: data.emailsOpened },
    { name: 'Replied', value: data.emailsReplied },
    { name: 'Meeting Scheduled', value: data.meetingsScheduled },
    { name: 'Converted', value: data.dealsConverted },
  ];

  const maxValue = Math.max(...values.map(v => v.value), 1);

  for (let i = 0; i < values.length; i++) {
    const current = values[i];
    const previous = i > 0 ? values[i - 1].value : current.value;
    const dropoff = previous > 0 ? ((previous - current.value) / previous) * 100 : 0;

    stages.push({
      name: current.name,
      value: current.value,
      percentage: (current.value / maxValue) * 100,
      dropoff: Math.round(dropoff),
      color: colors[i],
    });
  }

  return stages;
}

export async function getCampaignComparison(userId: string): Promise<CampaignComparison[]> {
  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select('id, name, total_leads, emails_sent, emails_opened, emails_replied, cost_per_lead')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw error;
  if (!campaigns || campaigns.length === 0) return [];

  const comparisons = await Promise.all(
    campaigns.map(async (c) => {
      const openRate = c.emails_sent > 0 ? (c.emails_opened / c.emails_sent) * 100 : 0;
      const replyRate = c.emails_sent > 0 ? (c.emails_replied / c.emails_sent) * 100 : 0;

      const { count: convertedCount } = await supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('campaign_id', c.id)
        .eq('pipeline_stage', 'converted');

      const conversionRate = c.total_leads > 0 ? ((convertedCount || 0) / c.total_leads) * 100 : 0;

      return {
        campaignId: c.id,
        campaignName: c.name,
        leadsScraped: c.total_leads || 0,
        emailsSent: c.emails_sent || 0,
        openRate: Math.round(openRate * 10) / 10,
        replyRate: Math.round(replyRate * 10) / 10,
        conversionRate: Math.round(conversionRate * 10) / 10,
        costPerLead: c.cost_per_lead || 0,
      };
    })
  );

  return comparisons;
}

export async function getFunnelOverTime(
  userId: string,
  campaignId?: string,
  days: number = 30
): Promise<DateRangeFunnel[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  let query = supabase
    .from('analytics_funnel')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (campaignId) {
    query = query.eq('campaign_id', campaignId);
  }

  const { data, error } = await query;

  if (error) throw error;

  const byDate: Record<string, FunnelData> = {};

  for (const row of data || []) {
    const date = row.date;
    if (!byDate[date]) {
      byDate[date] = {
        leadsScraped: 0,
        leadsQualified: 0,
        emailsSent: 0,
        emailsOpened: 0,
        emailsReplied: 0,
        meetingsScheduled: 0,
        dealsConverted: 0,
      };
    }

    byDate[date].leadsScraped += row.leads_scraped || 0;
    byDate[date].leadsQualified += row.leads_qualified || 0;
    byDate[date].emailsSent += row.emails_sent || 0;
    byDate[date].emailsOpened += row.emails_opened || 0;
    byDate[date].emailsReplied += row.emails_replied || 0;
    byDate[date].meetingsScheduled += row.meetings_scheduled || 0;
    byDate[date].dealsConverted += row.deals_converted || 0;
  }

  return Object.entries(byDate).map(([date, data]) => ({ date, data }));
}

export async function updateFunnelMetrics(
  userId: string,
  campaignId: string,
  metrics: Partial<FunnelData>
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  const { data: existing } = await supabase
    .from('analytics_funnel')
    .select('*')
    .eq('user_id', userId)
    .eq('campaign_id', campaignId)
    .eq('date', today)
    .maybeSingle();

  if (existing) {
    const updates: any = {};
    if (metrics.leadsScraped !== undefined) updates.leads_scraped = existing.leads_scraped + metrics.leadsScraped;
    if (metrics.leadsQualified !== undefined) updates.leads_qualified = existing.leads_qualified + metrics.leadsQualified;
    if (metrics.emailsSent !== undefined) updates.emails_sent = existing.emails_sent + metrics.emailsSent;
    if (metrics.emailsOpened !== undefined) updates.emails_opened = existing.emails_opened + metrics.emailsOpened;
    if (metrics.emailsReplied !== undefined) updates.emails_replied = existing.emails_replied + metrics.emailsReplied;
    if (metrics.meetingsScheduled !== undefined) updates.meetings_scheduled = existing.meetings_scheduled + metrics.meetingsScheduled;
    if (metrics.dealsConverted !== undefined) updates.deals_converted = existing.deals_converted + metrics.dealsConverted;

    await supabase
      .from('analytics_funnel')
      .update(updates)
      .eq('id', existing.id);
  } else {
    await supabase.from('analytics_funnel').insert({
      user_id: userId,
      campaign_id: campaignId,
      date: today,
      leads_scraped: metrics.leadsScraped || 0,
      leads_qualified: metrics.leadsQualified || 0,
      emails_sent: metrics.emailsSent || 0,
      emails_opened: metrics.emailsOpened || 0,
      emails_replied: metrics.emailsReplied || 0,
      meetings_scheduled: metrics.meetingsScheduled || 0,
      deals_converted: metrics.dealsConverted || 0,
    });
  }
}

export function exportFunnelToCSV(data: FunnelData, campaignName?: string): string {
  const rows = [
    ['Metric', 'Value'],
    ['Leads Scraped', data.leadsScraped.toString()],
    ['Leads Qualified', data.leadsQualified.toString()],
    ['Emails Sent', data.emailsSent.toString()],
    ['Emails Opened', data.emailsOpened.toString()],
    ['Emails Replied', data.emailsReplied.toString()],
    ['Meetings Scheduled', data.meetingsScheduled.toString()],
    ['Deals Converted', data.dealsConverted.toString()],
  ];

  if (campaignName) {
    rows.unshift(['Campaign', campaignName]);
  }

  return rows.map(row => row.join(',')).join('\n');
}
