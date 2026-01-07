import { supabase } from '../lib/supabase';

export interface PipelineStage {
  id: string;
  user_id: string;
  name: string;
  color: string;
  position: number;
  is_default: boolean;
  auto_advance_on: 'email_sent' | 'email_opened' | 'email_replied' | 'manual' | null;
}

export interface LeadWithPipeline {
  id: string;
  business_name: string;
  email: string;
  pipeline_stage: string;
  quality_score: number;
  status: string;
  rating: number | null;
  review_count: number;
  created_at: string;
}

export async function getPipelineStages(userId: string): Promise<PipelineStage[]> {
  const { data, error } = await supabase
    .from('lead_pipeline_stages')
    .select('*')
    .eq('user_id', userId)
    .order('position', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createPipelineStage(
  userId: string,
  name: string,
  color: string,
  position: number,
  autoAdvanceOn?: string | null
): Promise<PipelineStage> {
  const { data, error } = await supabase
    .from('lead_pipeline_stages')
    .insert({
      user_id: userId,
      name,
      color,
      position,
      auto_advance_on: autoAdvanceOn || null,
      is_default: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePipelineStage(
  stageId: string,
  updates: Partial<PipelineStage>
): Promise<void> {
  const { error } = await supabase
    .from('lead_pipeline_stages')
    .update(updates)
    .eq('id', stageId);

  if (error) throw error;
}

export async function deletePipelineStage(stageId: string): Promise<void> {
  const { error } = await supabase
    .from('lead_pipeline_stages')
    .delete()
    .eq('id', stageId);

  if (error) throw error;
}

export async function reorderPipelineStages(
  stages: { id: string; position: number }[]
): Promise<void> {
  for (const stage of stages) {
    await supabase
      .from('lead_pipeline_stages')
      .update({ position: stage.position })
      .eq('id', stage.id);
  }
}

export async function moveLeadToStage(
  leadId: string,
  stageName: string
): Promise<void> {
  const { error } = await supabase
    .from('leads')
    .update({
      pipeline_stage: stageName,
      pipeline_stage_changed_at: new Date().toISOString(),
    })
    .eq('id', leadId);

  if (error) throw error;
}

export async function bulkMoveLeadsToStage(
  leadIds: string[],
  stageName: string
): Promise<number> {
  const { error, count } = await supabase
    .from('leads')
    .update({
      pipeline_stage: stageName,
      pipeline_stage_changed_at: new Date().toISOString(),
    })
    .in('id', leadIds);

  if (error) throw error;
  return count || 0;
}

export async function getLeadsByPipelineStage(
  campaignId: string
): Promise<Record<string, LeadWithPipeline[]>> {
  const { data, error } = await supabase
    .from('leads')
    .select('id, business_name, email, pipeline_stage, quality_score, status, rating, review_count, created_at')
    .eq('campaign_id', campaignId)
    .order('quality_score', { ascending: false });

  if (error) throw error;

  const grouped: Record<string, LeadWithPipeline[]> = {};
  for (const lead of data || []) {
    const stage = lead.pipeline_stage || 'new';
    if (!grouped[stage]) grouped[stage] = [];
    grouped[stage].push(lead);
  }

  return grouped;
}

export async function getPipelineStats(campaignId: string): Promise<{
  stageCounts: Record<string, number>;
  totalLeads: number;
  conversionRate: number;
}> {
  const { data, error } = await supabase
    .from('leads')
    .select('pipeline_stage')
    .eq('campaign_id', campaignId);

  if (error) throw error;

  const stageCounts: Record<string, number> = {};
  for (const lead of data || []) {
    const stage = lead.pipeline_stage || 'new';
    stageCounts[stage] = (stageCounts[stage] || 0) + 1;
  }

  const totalLeads = data?.length || 0;
  const convertedLeads = stageCounts['converted'] || 0;
  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

  return {
    stageCounts,
    totalLeads,
    conversionRate,
  };
}

export async function autoAdvancePipeline(
  leadId: string,
  eventType: 'email_sent' | 'email_opened' | 'email_replied'
): Promise<void> {
  const { data: lead } = await supabase
    .from('leads')
    .select('user_id, pipeline_stage')
    .eq('id', leadId)
    .single();

  if (!lead) return;

  const { data: stages } = await supabase
    .from('lead_pipeline_stages')
    .select('name, position, auto_advance_on')
    .eq('user_id', lead.user_id)
    .eq('auto_advance_on', eventType)
    .order('position', { ascending: true })
    .limit(1);

  if (stages && stages.length > 0) {
    await moveLeadToStage(leadId, stages[0].name);
  }
}
