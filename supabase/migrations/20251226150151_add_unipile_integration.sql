/*
  # Add Unipile Email Integration

  ## Overview
  Extends the system to support Unipile email provider with OAuth, webhook tracking, and A/B testing enhancements

  ## New Tables

  ### `email_tracking_events`
  Real-time webhook events from Unipile for email tracking
  - `id` (uuid, primary key)
  - `email_id` (uuid, references emails)
  - `event_type` (text) - delivered, opened, clicked, bounced, spam_report, replied
  - `event_timestamp` (timestamptz) - When the event occurred
  - `raw_webhook_data` (jsonb) - Full webhook payload for debugging
  - `user_agent` (text) - Browser/email client info
  - `ip_address` (text) - Location data
  - `link_url` (text) - For click events
  - `created_at` (timestamptz)

  ## Modified Tables

  ### `gmail_accounts`
  - `unipile_account_id` (text) - Unipile's unique account identifier
  - `unipile_provider` (text) - Provider type (GMAIL, OUTLOOK, etc.)
  - `unipile_connected_at` (timestamptz) - OAuth connection timestamp
  - `webhook_enabled` (boolean) - Whether webhooks are active

  ### `emails`
  - `variant_id` (uuid) - References template_variants for A/B testing
  - `unipile_message_id` (text) - Unipile's unique message ID for tracking

  ### `user_ai_preferences`
  - Update ai_model constraint to include gpt-5.2
  - Set gpt-5.2 as default

  ## Security
  - RLS enabled on email_tracking_events
  - Users can only access events for their own emails
  - Webhook endpoint validates signatures

  ## Important Notes
  - Uses IF NOT EXISTS for safe re-runs
  - Comprehensive indexing for webhook lookups
  - Support for future email providers beyond Gmail
*/

-- Add Unipile columns to gmail_accounts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gmail_accounts' AND column_name = 'unipile_account_id'
  ) THEN
    ALTER TABLE gmail_accounts ADD COLUMN unipile_account_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gmail_accounts' AND column_name = 'unipile_provider'
  ) THEN
    ALTER TABLE gmail_accounts ADD COLUMN unipile_provider text DEFAULT 'GMAIL';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gmail_accounts' AND column_name = 'unipile_connected_at'
  ) THEN
    ALTER TABLE gmail_accounts ADD COLUMN unipile_connected_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gmail_accounts' AND column_name = 'webhook_enabled'
  ) THEN
    ALTER TABLE gmail_accounts ADD COLUMN webhook_enabled boolean DEFAULT true;
  END IF;
END $$;

-- Add variant tracking to emails
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'emails' AND column_name = 'variant_id'
  ) THEN
    ALTER TABLE emails ADD COLUMN variant_id uuid REFERENCES template_variants(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'emails' AND column_name = 'unipile_message_id'
  ) THEN
    ALTER TABLE emails ADD COLUMN unipile_message_id text;
  END IF;
END $$;

-- Create email_tracking_events table
CREATE TABLE IF NOT EXISTS email_tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id uuid REFERENCES emails(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('delivered', 'opened', 'clicked', 'bounced', 'spam_report', 'replied', 'failed')),
  event_timestamp timestamptz NOT NULL DEFAULT now(),
  raw_webhook_data jsonb,
  user_agent text,
  ip_address text,
  link_url text,
  error_details text,
  created_at timestamptz DEFAULT now()
);

-- Update user_ai_preferences to support GPT-5.2
DO $$
BEGIN
  -- Drop the old constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'user_ai_preferences'
    AND constraint_name = 'user_ai_preferences_ai_model_check'
  ) THEN
    ALTER TABLE user_ai_preferences DROP CONSTRAINT user_ai_preferences_ai_model_check;
  END IF;

  -- Add new constraint with GPT-5.2
  ALTER TABLE user_ai_preferences
    ADD CONSTRAINT user_ai_preferences_ai_model_check
    CHECK (ai_model IN ('gpt-4', 'gpt-3.5', 'gpt-5.2', 'claude'));

  -- Update default to GPT-5.2
  ALTER TABLE user_ai_preferences
    ALTER COLUMN ai_model SET DEFAULT 'gpt-5.2';
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_tracking_email_id ON email_tracking_events(email_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_event_type ON email_tracking_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_tracking_timestamp ON email_tracking_events(event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_emails_variant_id ON emails(variant_id);
CREATE INDEX IF NOT EXISTS idx_emails_unipile_message_id ON emails(unipile_message_id);
CREATE INDEX IF NOT EXISTS idx_gmail_accounts_unipile_id ON gmail_accounts(unipile_account_id);

-- Enable RLS on email_tracking_events
ALTER TABLE email_tracking_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_tracking_events
CREATE POLICY "Users can view tracking events for own emails"
  ON email_tracking_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM emails
      JOIN campaigns ON campaigns.id = emails.campaign_id
      WHERE emails.id = email_tracking_events.email_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create tracking events"
  ON email_tracking_events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM emails
      JOIN campaigns ON campaigns.id = emails.campaign_id
      WHERE emails.id = email_tracking_events.email_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Function to update email status from tracking events
CREATE OR REPLACE FUNCTION update_email_status_from_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Update email status based on event type
  IF NEW.event_type = 'delivered' THEN
    UPDATE emails SET status = 'sent' WHERE id = NEW.email_id;
  ELSIF NEW.event_type = 'opened' THEN
    UPDATE emails SET opened_at = NEW.event_timestamp WHERE id = NEW.email_id AND opened_at IS NULL;
  ELSIF NEW.event_type = 'replied' THEN
    UPDATE emails SET replied_at = NEW.event_timestamp WHERE id = NEW.email_id AND replied_at IS NULL;
  ELSIF NEW.event_type = 'bounced' OR NEW.event_type = 'failed' THEN
    UPDATE emails SET status = 'failed', error_message = NEW.error_details WHERE id = NEW.email_id;
  END IF;

  -- Update template variant stats if variant_id exists
  IF NEW.event_type IN ('opened', 'replied') THEN
    UPDATE template_variants
    SET
      open_count = CASE WHEN NEW.event_type = 'opened' THEN open_count + 1 ELSE open_count END,
      reply_count = CASE WHEN NEW.event_type = 'replied' THEN reply_count + 1 ELSE reply_count END
    WHERE id = (SELECT variant_id FROM emails WHERE id = NEW.email_id)
    AND (SELECT variant_id FROM emails WHERE id = NEW.email_id) IS NOT NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic status updates
DROP TRIGGER IF EXISTS email_tracking_event_trigger ON email_tracking_events;
CREATE TRIGGER email_tracking_event_trigger
  AFTER INSERT ON email_tracking_events
  FOR EACH ROW
  EXECUTE FUNCTION update_email_status_from_event();
