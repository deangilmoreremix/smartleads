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
  errors: string[];
}> {
  const { duplicates } = await findDuplicatesInCampaign(campaignId);

  let removedCount = 0;
  let keptCount = 0;
  const errors: string[] = [];

  // Process duplicates sequentially to avoid race conditions
  for (const duplicate of duplicates) {
    try {
      // Re-fetch leads to ensure we have current data
      const { data: leads, error } = await supabase
        .from('leads')
        .select('id, created_at, email')
        .in('id', duplicate.leadIds)
        .eq('campaign_id', campaignId) // Ensure they still belong to this campaign
        .order('created_at', { ascending: keepStrategy === 'first' });

      if (error) {
        errors.push(`Failed to fetch duplicate leads for ${duplicate.email}: ${error.message}`);
        continue;
      }

      if (!leads || leads.length <= 1) {
        // No longer duplicates, skip
        continue;
      }

      const toKeep = leads[0];
      const toRemove = leads.slice(1);
      const idsToRemove = toRemove.map((l) => l.id);

      // Delete duplicate leads
      const { error: deleteError } = await supabase
        .from('leads')
        .delete()
        .in('id', idsToRemove);

      if (deleteError) {
        errors.push(
          `Failed to remove duplicates for ${duplicate.email}: ${deleteError.message}`
        );
        continue;
      }

      removedCount += toRemove.length;
      keptCount += 1;

      console.log(
        `Removed ${toRemove.length} duplicate(s) for ${duplicate.email}, kept lead ${toKeep.id}`
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      errors.push(`Error processing duplicate ${duplicate.email}: ${errorMsg}`);
      console.error(`Error processing duplicate ${duplicate.email}:`, err);
    }
  }

  return { removedCount, keptCount, errors };
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
): Promise<{ success: boolean; error?: string }> {
  try {
    // Fetch both leads
    const { data: keepLead, error: keepError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', keepLeadId)
      .maybeSingle();

    if (keepError) {
      return { success: false, error: `Failed to fetch keep lead: ${keepError.message}` };
    }

    const { data: mergeLead, error: mergeError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', mergeLeadId)
      .maybeSingle();

    if (mergeError) {
      return { success: false, error: `Failed to fetch merge lead: ${mergeError.message}` };
    }

    if (!keepLead || !mergeLead) {
      return { success: false, error: 'One or both leads not found' };
    }

    // Verify they belong to the same user
    if (keepLead.user_id !== mergeLead.user_id) {
      return { success: false, error: 'Cannot merge leads from different users' };
    }

    // Build update object with data from mergeLead
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

    // Update keepLead if there's data to merge
    if (Object.keys(updatedData).length > 0) {
      const { error: updateError } = await supabase
        .from('leads')
        .update(updatedData)
        .eq('id', keepLeadId);

      if (updateError) {
        return { success: false, error: `Failed to update lead: ${updateError.message}` };
      }
    }

    // Delete the merge lead
    const { error: deleteError } = await supabase
      .from('leads')
      .delete()
      .eq('id', mergeLeadId);

    if (deleteError) {
      return { success: false, error: `Failed to delete merge lead: ${deleteError.message}` };
    }

    console.log(`Successfully merged lead ${mergeLeadId} into ${keepLeadId}`);
    return { success: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: errorMsg };
  }
}
