import { supabase } from '../lib/supabase';

export interface CampaignGroup {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  priority: number;
  global_daily_limit: number;
  is_active: boolean;
  created_at: string;
  campaigns?: CampaignInGroup[];
}

export interface CampaignInGroup {
  id: string;
  name: string;
  status: string;
  total_leads: number;
  emails_sent: number;
}

export async function getCampaignGroups(userId: string): Promise<CampaignGroup[]> {
  const { data, error } = await supabase
    .from('campaign_groups')
    .select(`
      *,
      campaigns (
        id,
        name,
        status,
        total_leads,
        emails_sent
      )
    `)
    .eq('user_id', userId)
    .order('priority', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createCampaignGroup(
  userId: string,
  name: string,
  description?: string,
  color?: string,
  priority?: number,
  globalDailyLimit?: number
): Promise<CampaignGroup> {
  const { data, error } = await supabase
    .from('campaign_groups')
    .insert({
      user_id: userId,
      name,
      description: description || null,
      color: color || '#3B82F6',
      priority: priority || 1,
      global_daily_limit: globalDailyLimit || 100,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCampaignGroup(
  groupId: string,
  updates: Partial<CampaignGroup>
): Promise<void> {
  const { error } = await supabase
    .from('campaign_groups')
    .update(updates)
    .eq('id', groupId);

  if (error) throw error;
}

export async function deleteCampaignGroup(groupId: string): Promise<void> {
  await supabase
    .from('campaigns')
    .update({ group_id: null })
    .eq('group_id', groupId);

  const { error } = await supabase
    .from('campaign_groups')
    .delete()
    .eq('id', groupId);

  if (error) throw error;
}

export async function assignCampaignToGroup(
  campaignId: string,
  groupId: string | null
): Promise<void> {
  const { error } = await supabase
    .from('campaigns')
    .update({ group_id: groupId })
    .eq('id', campaignId);

  if (error) throw error;
}

export async function getGroupStats(groupId: string): Promise<{
  totalCampaigns: number;
  activeCampaigns: number;
  totalLeads: number;
  totalEmailsSent: number;
  todayEmailsSent: number;
}> {
  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select('id, status, total_leads, emails_sent')
    .eq('group_id', groupId);

  if (error) throw error;

  const totalCampaigns = campaigns?.length || 0;
  const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0;
  const totalLeads = campaigns?.reduce((sum, c) => sum + (c.total_leads || 0), 0) || 0;
  const totalEmailsSent = campaigns?.reduce((sum, c) => sum + (c.emails_sent || 0), 0) || 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const campaignIds = campaigns?.map(c => c.id) || [];
  const { data: todayEmails } = await supabase
    .from('emails')
    .select('id')
    .in('campaign_id', campaignIds)
    .gte('sent_at', today.toISOString());

  return {
    totalCampaigns,
    activeCampaigns,
    totalLeads,
    totalEmailsSent,
    todayEmailsSent: todayEmails?.length || 0,
  };
}

export async function getUngroupedCampaigns(userId: string): Promise<CampaignInGroup[]> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('id, name, status, total_leads, emails_sent')
    .eq('user_id', userId)
    .is('group_id', null);

  if (error) throw error;
  return data || [];
}

export async function reorderGroups(groups: { id: string; priority: number }[]): Promise<void> {
  for (const group of groups) {
    await supabase
      .from('campaign_groups')
      .update({ priority: group.priority })
      .eq('id', group.id);
  }
}

export const GROUP_COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
];
