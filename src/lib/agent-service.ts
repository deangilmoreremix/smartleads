import { supabase } from './supabase';

export async function startLeadScrapingAgent(
  campaignId: string,
  campaignName: string,
  niche: string,
  location: string,
  apifySettings?: Record<string, unknown>
): Promise<string> {
  const { data, error } = await supabase.functions.invoke('scrape-google-maps', {
    body: {
      campaignId,
      niche,
      location,
      apifySettings,
      createAgentJob: true,
      campaignName,
    },
  });

  if (error) {
    throw error;
  }

  return data.jobId;
}

export async function startEmailGenerationAgent(
  campaignId: string,
  campaignName: string
): Promise<string> {
  const { data, error } = await supabase.functions.invoke('generate-ai-emails', {
    body: {
      campaignId,
      createAgentJob: true,
      campaignName,
    },
  });

  if (error) {
    throw error;
  }

  return data.jobId;
}

export async function startEmailSendingAgent(
  campaignId: string,
  campaignName: string
): Promise<string> {
  const { data, error } = await supabase.functions.invoke('send-emails', {
    body: {
      campaignId,
      createAgentJob: true,
      campaignName,
    },
  });

  if (error) {
    throw error;
  }

  return data.jobId;
}

export interface AgentJob {
  id: string;
  job_type: string;
  status: string;
  progress_percentage: number;
  result_data: Record<string, unknown>;
}

export async function getAgentJob(jobId: string): Promise<AgentJob | null> {
  const { data, error } = await supabase
    .from('agent_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) {
    console.error('Error fetching agent job:', error);
    return null;
  }

  return data as AgentJob;
}

export function subscribeToAgentJob(
  jobId: string,
  onUpdate: (job: AgentJob) => void
) {
  const subscription = supabase
    .channel(`agent_job_${jobId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'agent_jobs',
        filter: `id=eq.${jobId}`,
      },
      (payload) => {
        onUpdate(payload.new as AgentJob);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}
