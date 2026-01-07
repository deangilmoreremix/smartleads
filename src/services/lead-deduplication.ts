import { supabase } from '../lib/supabase';

export interface DuplicateLeadInfo {
  isDuplicate: boolean;
  existingLeadId?: string;
  existingCampaignId?: string;
  existingCampaignName?: string;
  lastContactedAt?: string;
  emailsSentCount?: number;
  hasReplied?: boolean;
}

export async function checkForDuplicateLead(
  email: string,
  userId: string,
  currentCampaignId?: string
): Promise<DuplicateLeadInfo> {
  const { data: existingLeads, error } = await supabase
    .from('leads')
    .select(`
      id,
      campaign_id,
      last_contacted_at,
      emails_sent_count,
      has_replied,
      campaigns (
        id,
        name
      )
    `)
    .eq('email', email)
    .eq('user_id', userId)
    .neq('campaign_id', currentCampaignId || '')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error checking for duplicate leads:', error);
    return { isDuplicate: false };
  }

  if (!existingLeads || existingLeads.length === 0) {
    return { isDuplicate: false };
  }

  const lead = existingLeads[0];
  const campaign = Array.isArray(lead.campaigns) ? lead.campaigns[0] : lead.campaigns;

  return {
    isDuplicate: true,
    existingLeadId: lead.id,
    existingCampaignId: lead.campaign_id,
    existingCampaignName: campaign?.name,
    lastContactedAt: lead.last_contacted_at,
    emailsSentCount: lead.emails_sent_count || 0,
    hasReplied: lead.has_replied || false,
  };
}

export async function findDuplicatesInCampaign(campaignId: string): Promise<{
  duplicates: Array<{
    email: string;
    leadIds: string[];
    count: number;
  }>;
  totalDuplicates: number;
}> {
  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, email')
    .eq('campaign_id', campaignId);

  if (error || !leads) {
    return { duplicates: [], totalDuplicates: 0 };
  }

  const emailMap = new Map<string, string[]>();

  leads.forEach((lead) => {
    const existing = emailMap.get(lead.email) || [];
    existing.push(lead.id);
    emailMap.set(lead.email, existing);
  });

  const duplicates = Array.from(emailMap.entries())
    .filter(([, leadIds]) => leadIds.length > 1)
    .map(([email, leadIds]) => ({
      email,
      leadIds,
      count: leadIds.length,
    }));

  return {
    duplicates,
    totalDuplicates: duplicates.reduce((sum, dup) => sum + (dup.count - 1), 0),
  };
}

export async function removeDuplicatesFromCampaign(
  campaignId: string,
  keepStrategy: 'first' | 'last' = 'first'
): Promise<{
  removedCount: number;
  keptCount: number;
}> {
  const { duplicates } = await findDuplicatesInCampaign(campaignId);

  let removedCount = 0;
  let keptCount = 0;

  for (const duplicate of duplicates) {
    const { data: leads, error } = await supabase
      .from('leads')
      .select('id, created_at')
      .in('id', duplicate.leadIds)
      .order('created_at', { ascending: keepStrategy === 'first' });

    if (error || !leads) {
      continue;
    }

    const toKeep = leads[0];
    const toRemove = leads.slice(1);

    if (toRemove.length > 0) {
      const { error: deleteError } = await supabase
        .from('leads')
        .delete()
        .in(
          'id',
          toRemove.map((l) => l.id)
        );

      if (!deleteError) {
        removedCount += toRemove.length;
        keptCount += 1;
      }
    }
  }

  return { removedCount, keptCount };
}

export async function shouldSkipLead(
  email: string,
  userId: string,
  currentCampaignId?: string
): Promise<{
  shouldSkip: boolean;
  reason?: string;
}> {
  const duplicateInfo = await checkForDuplicateLead(email, userId, currentCampaignId);

  if (!duplicateInfo.isDuplicate) {
    return { shouldSkip: false };
  }

  if (duplicateInfo.hasReplied) {
    return {
      shouldSkip: true,
      reason: `Already replied in campaign: ${duplicateInfo.existingCampaignName}`,
    };
  }

  if (duplicateInfo.lastContactedAt) {
    const daysSinceLastContact = Math.floor(
      (Date.now() - new Date(duplicateInfo.lastContactedAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastContact < 30) {
      return {
        shouldSkip: true,
        reason: `Recently contacted ${daysSinceLastContact} days ago in campaign: ${duplicateInfo.existingCampaignName}`,
      };
    }
  }

  return {
    shouldSkip: false,
    reason: `Previously contacted in ${duplicateInfo.existingCampaignName}, but eligible for re-engagement`,
  };
}

export async function mergeDuplicateLeadData(
  keepLeadId: string,
  mergeLeadId: string
): Promise<boolean> {
  const { data: keepLead } = await supabase
    .from('leads')
    .select('*')
    .eq('id', keepLeadId)
    .maybeSingle();

  const { data: mergeLead } = await supabase
    .from('leads')
    .select('*')
    .eq('id', mergeLeadId)
    .maybeSingle();

  if (!keepLead || !mergeLead) {
    return false;
  }

  const updatedData: any = {};

  if (!keepLead.phone && mergeLead.phone) {
    updatedData.phone = mergeLead.phone;
  }
  if (!keepLead.website && mergeLead.website) {
    updatedData.website = mergeLead.website;
  }
  if (!keepLead.decision_maker_name && mergeLead.decision_maker_name) {
    updatedData.decision_maker_name = mergeLead.decision_maker_name;
  }
  if ((mergeLead.review_count || 0) > (keepLead.review_count || 0)) {
    updatedData.review_count = mergeLead.review_count;
    updatedData.rating = mergeLead.rating;
  }

  if (Object.keys(updatedData).length > 0) {
    await supabase.from('leads').update(updatedData).eq('id', keepLeadId);
  }

  await supabase.from('leads').delete().eq('id', mergeLeadId);

  return true;
}
