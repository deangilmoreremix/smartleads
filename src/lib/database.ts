import { supabase } from './supabase';
import type { Database } from '../types/database';

type Tables = Database['public']['Tables'];
type Campaign = Tables['campaigns']['Row'];
type Lead = Tables['leads']['Row'];
type Email = Tables['emails']['Row'];
type CampaignJob = Tables['campaign_jobs']['Row'];
type Subscription = Tables['subscriptions']['Row'];

export interface CampaignStats {
  totalLeads: number;
  emailsSent: number;
  emailsOpened: number;
  emailsReplied: number;
  openRate: number;
  replyRate: number;
  leadsByStatus: Record<string, number>;
  emailsByStatus: Record<string, number>;
}

export interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalLeads: number;
  totalEmails: number;
  avgOpenRate: number;
  avgReplyRate: number;
  creditsRemaining: number;
}

export async function getCampaignStats(campaignId: string): Promise<CampaignStats> {
  const [leadsResult, emailsResult] = await Promise.all([
    supabase
      .from('leads')
      .select('status')
      .eq('campaign_id', campaignId),
    supabase
      .from('emails')
      .select('status')
      .eq('campaign_id', campaignId),
  ]);

  if (leadsResult.error) throw leadsResult.error;
  if (emailsResult.error) throw emailsResult.error;

  const leads = leadsResult.data || [];
  const emails = emailsResult.data || [];

  const leadsByStatus = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const emailsByStatus = emails.reduce((acc, email) => {
    acc[email.status] = (acc[email.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const emailsSent = emails.filter(e => ['sent', 'opened', 'clicked', 'replied'].includes(e.status)).length;
  const emailsOpened = emails.filter(e => ['opened', 'clicked', 'replied'].includes(e.status)).length;
  const emailsReplied = emails.filter(e => e.status === 'replied').length;

  return {
    totalLeads: leads.length,
    emailsSent,
    emailsOpened,
    emailsReplied,
    openRate: emailsSent > 0 ? (emailsOpened / emailsSent) * 100 : 0,
    replyRate: emailsSent > 0 ? (emailsReplied / emailsSent) * 100 : 0,
    leadsByStatus,
    emailsByStatus,
  };
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [campaignsResult, leadsResult, emailsResult, subscriptionResult] = await Promise.all([
    supabase
      .from('campaigns')
      .select('id, status, emails_sent, emails_opened, emails_replied')
      .eq('user_id', userId),
    supabase
      .from('leads')
      .select('id')
      .eq('user_id', userId),
    supabase
      .from('emails')
      .select('id')
      .eq('user_id', userId),
    supabase
      .from('subscriptions')
      .select('credits_remaining')
      .eq('user_id', userId)
      .maybeSingle(),
  ]);

  if (campaignsResult.error) throw campaignsResult.error;
  if (leadsResult.error) throw leadsResult.error;
  if (emailsResult.error) throw emailsResult.error;
  if (subscriptionResult.error) throw subscriptionResult.error;

  const campaigns = campaignsResult.data || [];
  const activeCampaigns = campaigns.filter(c => c.status === 'active');

  const totalSent = campaigns.reduce((sum, c) => sum + (c.emails_sent || 0), 0);
  const totalOpened = campaigns.reduce((sum, c) => sum + (c.emails_opened || 0), 0);
  const totalReplied = campaigns.reduce((sum, c) => sum + (c.emails_replied || 0), 0);

  return {
    totalCampaigns: campaigns.length,
    activeCampaigns: activeCampaigns.length,
    totalLeads: leadsResult.data?.length || 0,
    totalEmails: emailsResult.data?.length || 0,
    avgOpenRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
    avgReplyRate: totalSent > 0 ? (totalReplied / totalSent) * 100 : 0,
    creditsRemaining: subscriptionResult.data?.credits_remaining || 0,
  };
}

export async function getCampaignLeads(campaignId: string, filters?: {
  status?: string;
  emailType?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.emailType) {
    query = query.eq('email_type', filters.emailType);
  }

  if (filters?.search) {
    query = query.or(`business_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  return query;
}

export async function getCampaignEmails(campaignId: string, filters?: {
  status?: string;
  leadId?: string;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('emails')
    .select(`
      *,
      lead:leads(business_name, email)
    `, { count: 'exact' })
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.leadId) {
    query = query.eq('lead_id', filters.leadId);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  return query;
}

export async function getActiveCampaignJobs(campaignId: string) {
  const { data, error } = await supabase
    .from('campaign_jobs')
    .select('*')
    .eq('campaign_id', campaignId)
    .in('status', ['pending', 'processing'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateLeadStatus(leadId: string, status: Lead['status'], notes?: string) {
  const updates: Partial<Lead> = { status };
  if (notes) updates.notes = notes;

  const { data, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', leadId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEmailStatus(
  emailId: string,
  status: Email['status'],
  timestamp?: Date
) {
  const updates: Partial<Email> = { status };

  if (status === 'sent' && timestamp) {
    updates.sent_at = timestamp.toISOString();
  } else if (status === 'opened' && timestamp) {
    updates.opened_at = timestamp.toISOString();
  } else if (status === 'replied' && timestamp) {
    updates.replied_at = timestamp.toISOString();
  }

  const { data, error } = await supabase
    .from('emails')
    .update(updates)
    .eq('id', emailId)
    .select()
    .single();

  if (error) throw error;

  if (status === 'sent' || status === 'opened' || status === 'replied') {
    const { data: email } = await supabase
      .from('emails')
      .select('campaign_id, lead_id, user_id')
      .eq('id', emailId)
      .single();

    if (email) {
      await supabase.from('analytics_events').insert({
        user_id: email.user_id,
        campaign_id: email.campaign_id,
        lead_id: email.lead_id,
        email_id: emailId,
        event_type: `email_${status}`,
        event_data: { timestamp: timestamp?.toISOString() || new Date().toISOString() },
      });
    }
  }

  return data;
}

export async function bulkUpdateLeadStatus(
  leadIds: string[],
  status: Lead['status']
) {
  const { data, error } = await supabase
    .from('leads')
    .update({ status })
    .in('id', leadIds)
    .select();

  if (error) throw error;
  return data;
}

export async function getRecentAnalytics(userId: string, limit = 100) {
  const { data, error } = await supabase
    .from('analytics_events')
    .select(`
      *,
      campaign:campaigns(name),
      lead:leads(business_name)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function deductCredits(userId: string, amount: number) {
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    throw new Error('No subscription found');
  }

  if (subscription.credits_remaining < amount) {
    throw new Error('Insufficient credits');
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      credits_remaining: subscription.credits_remaining - amount,
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function searchLeads(userId: string, searchTerm: string, limit = 20) {
  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      campaign:campaigns(name)
    `)
    .eq('user_id', userId)
    .or(`business_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,website.ilike.%${searchTerm}%`)
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function exportCampaignData(campaignId: string) {
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();

  if (campaignError) throw campaignError;

  const { data: leads, error: leadsError } = await supabase
    .from('leads')
    .select('*')
    .eq('campaign_id', campaignId);

  if (leadsError) throw leadsError;

  const { data: emails, error: emailsError } = await supabase
    .from('emails')
    .select('*')
    .eq('campaign_id', campaignId);

  if (emailsError) throw emailsError;

  return {
    campaign,
    leads,
    emails,
  };
}
