/*
  # Add Agent Progress Tracking System

  1. New Tables
    - `agent_jobs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `campaign_id` (uuid, foreign key, nullable)
      - `job_type` (text) - 'lead_scraping', 'email_generation', 'email_sending'
      - `status` (text) - 'initializing', 'running', 'completed', 'failed'
      - `progress_percentage` (integer) - 0-100
      - `total_steps` (integer)
      - `completed_steps` (integer)
      - `result_data` (jsonb) - Stores results like lead count, emails sent, etc.
      - `error_message` (text, nullable)
      - `started_at` (timestamptz)
      - `completed_at` (timestamptz, nullable)
      - `created_at` (timestamptz)
      
    - `agent_progress_logs`
      - `id` (uuid, primary key)
      - `job_id` (uuid, foreign key)
      - `timestamp` (timestamptz)
      - `log_level` (text) - 'info', 'success', 'warning', 'error'
      - `icon` (text) - Emoji or icon identifier
      - `message` (text)
      - `metadata` (jsonb, nullable) - Additional context
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Users can only view their own agent jobs and logs
    - Edge functions can insert logs using service role
*/

-- Create agent_jobs table
CREATE TABLE IF NOT EXISTS agent_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  job_type text NOT NULL CHECK (job_type IN ('lead_scraping', 'email_generation', 'email_sending', 'contact_enrichment')),
  status text NOT NULL DEFAULT 'initializing' CHECK (status IN ('initializing', 'running', 'completed', 'failed', 'cancelled')),
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  total_steps integer DEFAULT 0,
  completed_steps integer DEFAULT 0,
  result_data jsonb DEFAULT '{}'::jsonb,
  error_message text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create agent_progress_logs table
CREATE TABLE IF NOT EXISTS agent_progress_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES agent_jobs(id) ON DELETE CASCADE NOT NULL,
  timestamp timestamptz DEFAULT now(),
  log_level text NOT NULL DEFAULT 'info' CHECK (log_level IN ('info', 'success', 'warning', 'error', 'loading')),
  icon text NOT NULL DEFAULT '💡',
  message text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agent_jobs_user_id ON agent_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_jobs_campaign_id ON agent_jobs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_agent_jobs_status ON agent_jobs(status);
CREATE INDEX IF NOT EXISTS idx_agent_jobs_created_at ON agent_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_progress_logs_job_id ON agent_progress_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_agent_progress_logs_timestamp ON agent_progress_logs(timestamp);

-- Enable Row Level Security
ALTER TABLE agent_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_progress_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_jobs
CREATE POLICY "Users can view own agent jobs"
  ON agent_jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own agent jobs"
  ON agent_jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agent jobs"
  ON agent_jobs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for agent_progress_logs
CREATE POLICY "Users can view logs for their jobs"
  ON agent_progress_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agent_jobs
      WHERE agent_jobs.id = agent_progress_logs.job_id
      AND agent_jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert logs"
  ON agent_progress_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Function to auto-update progress percentage
CREATE OR REPLACE FUNCTION update_job_progress()
RETURNS trigger AS $$
BEGIN
  IF NEW.total_steps > 0 THEN
    NEW.progress_percentage := LEAST(100, (NEW.completed_steps * 100) / NEW.total_steps);
  END IF;
  
  IF NEW.status = 'completed' THEN
    NEW.progress_percentage := 100;
    IF NEW.completed_at IS NULL THEN
      NEW.completed_at := now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update progress
DROP TRIGGER IF EXISTS trigger_update_job_progress ON agent_jobs;
CREATE TRIGGER trigger_update_job_progress
  BEFORE UPDATE ON agent_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_job_progress();
