/*
  # Add Daily Email Counter Reset

  1. Overview
    Implements automated daily reset of email counters to ensure proper Gmail account rotation
    every 24 hours. Critical for multi-account email sending functionality.

  2. New Features
    - Scheduled cron job to reset email counters at midnight UTC
    - `last_reset_at` timestamp column for debugging and verification
    - Automatic counter and timestamp updates

  3. Technical Details
    - Uses pg_cron extension (included in Supabase)
    - Runs daily at 00:00 UTC
    - Only resets active accounts
    - Updates tracking timestamp for monitoring

  4. Security
    - No security impact (internal database operation)
    - No RLS changes needed

  5. Important Notes
    - Uses IF NOT EXISTS for safe re-runs
    - Cron job recreated to include last_reset_at update
    - Job named 'reset-daily-email-counters' for easy management
*/

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Add last_reset_at timestamp for debugging
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gmail_accounts' AND column_name = 'last_reset_at'
  ) THEN
    ALTER TABLE gmail_accounts ADD COLUMN last_reset_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Remove existing cron job if it exists
SELECT cron.unschedule('reset-daily-email-counters')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'reset-daily-email-counters'
);

-- Schedule daily reset at midnight UTC
SELECT cron.schedule(
  'reset-daily-email-counters',
  '0 0 * * *',
  $$
    UPDATE gmail_accounts
    SET emails_sent_today = 0, last_reset_at = now()
    WHERE is_active = true
  $$
);
