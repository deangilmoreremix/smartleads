/*
  # Add System Monitoring and Logging Tables

  1. New Tables
    - `system_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable) - User associated with the log
      - `campaign_id` (uuid, nullable) - Campaign associated with the log
      - `lead_id` (uuid, nullable) - Lead associated with the log
      - `log_level` (text) - Log severity: info, warning, error, critical
      - `category` (text) - Log category: email_verification, email_sending, etc.
      - `message` (text) - Log message
      - `details` (jsonb) - Additional structured details
      - `error_message` (text, nullable) - Error message if applicable
      - `error_stack` (text, nullable) - Error stack trace if applicable
      - `created_at` (timestamptz) - When the log was created

  2. Indexes
    - Index on user_id for user-specific log queries
    - Index on log_level for filtering by severity
    - Index on category for filtering by component
    - Index on created_at for time-based queries
    - Composite index on (user_id, created_at) for user log history

  3. Security
    - Enable RLS on `system_logs` table
    - Add policy for authenticated users to read their own logs
    - Add policy for service role to insert logs
*/

-- Create system_logs table
CREATE TABLE IF NOT EXISTS system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  log_level text NOT NULL CHECK (log_level IN ('info', 'warning', 'error', 'critical')),
  category text NOT NULL CHECK (category IN (
    'email_verification',
    'email_sending',
    'sequence_processing',
    'lead_deduplication',
    'webhook',
    'authentication',
    'database',
    'api',
    'general'
  )),
  message text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  error_message text,
  error_stack text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_system_logs_category ON system_logs(category);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_created ON system_logs(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own logs
CREATE POLICY "Users can read own logs"
  ON system_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Service role can insert all logs
CREATE POLICY "Service role can insert logs"
  ON system_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Service role can read all logs
CREATE POLICY "Service role can read all logs"
  ON system_logs
  FOR SELECT
  TO service_role
  USING (true);

-- Create a function to clean up old logs (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_system_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM system_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;

-- Note: You can set up a cron job to run cleanup_old_system_logs() periodically
-- For example: SELECT cron.schedule('cleanup-logs', '0 2 * * *', 'SELECT cleanup_old_system_logs()');
