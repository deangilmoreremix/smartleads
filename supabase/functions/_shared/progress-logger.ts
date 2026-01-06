import { SupabaseClient } from 'npm:@supabase/supabase-js@2';

export interface ProgressLogOptions {
  jobId: string;
  supabase: SupabaseClient;
}

export class ProgressLogger {
  private jobId: string;
  private supabase: SupabaseClient;

  constructor(options: ProgressLogOptions) {
    this.jobId = options.jobId;
    this.supabase = options.supabase;
  }

  async log(
    message: string,
    options: {
      level?: 'info' | 'success' | 'warning' | 'error' | 'loading';
      icon?: string;
      metadata?: Record<string, unknown>;
    } = {}
  ) {
    const { level = 'info', icon = '💡', metadata = {} } = options;

    try {
      await this.supabase.from('agent_progress_logs').insert({
        job_id: this.jobId,
        log_level: level,
        icon,
        message,
        metadata,
      });
    } catch (error) {
      console.error('Failed to log progress:', error);
    }
  }

  async updateProgress(completedSteps: number, totalSteps: number) {
    try {
      await this.supabase
        .from('agent_jobs')
        .update({
          completed_steps: completedSteps,
          total_steps: totalSteps,
        })
        .eq('id', this.jobId);
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  }

  async updateStatus(
    status: 'initializing' | 'running' | 'completed' | 'failed',
    resultData?: Record<string, unknown>,
    errorMessage?: string
  ) {
    try {
      const updates: Record<string, unknown> = { status };

      if (resultData) {
        updates.result_data = resultData;
      }

      if (errorMessage) {
        updates.error_message = errorMessage;
      }

      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
        updates.progress_percentage = 100;
      }

      await this.supabase
        .from('agent_jobs')
        .update(updates)
        .eq('id', this.jobId);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }

  async info(message: string, icon = '💡') {
    await this.log(message, { level: 'info', icon });
  }

  async success(message: string, icon = '✅') {
    await this.log(message, { level: 'success', icon });
  }

  async loading(message: string, icon = '🔄') {
    await this.log(message, { level: 'loading', icon });
  }

  async warning(message: string, icon = '⚠️') {
    await this.log(message, { level: 'warning', icon });
  }

  async error(message: string, icon = '❌') {
    await this.log(message, { level: 'error', icon });
  }
}

export async function createAgentJob(
  supabase: SupabaseClient,
  userId: string,
  campaignId: string | null,
  jobType: 'lead_scraping' | 'email_generation' | 'email_sending' | 'contact_enrichment'
): Promise<string> {
  const jobId = crypto.randomUUID();

  await supabase.from('agent_jobs').insert({
    id: jobId,
    user_id: userId,
    campaign_id: campaignId,
    job_type: jobType,
    status: 'initializing',
    progress_percentage: 0,
    total_steps: 0,
    completed_steps: 0,
  });

  return jobId;
}
