/*
  # Add Email Sequences and Verification System

  ## 1. New Tables
    
    ### `email_sequence_steps`
    - `id` (uuid, primary key)
    - `campaign_id` (uuid, references campaigns)
    - `step_number` (integer) - Order in sequence (1, 2, 3...)
    - `delay_days` (integer) - Days to wait after previous step
    - `subject` (text) - Email subject line
    - `body` (text) - Email body content
    - `is_active` (boolean) - Whether step is enabled
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
    
    ### `lead_sequence_progress`
    - `id` (uuid, primary key)
    - `lead_id` (uuid, references leads)
    - `current_step` (integer) - Current step in sequence
    - `next_send_date` (timestamptz) - When to send next email
    - `is_paused` (boolean) - Paused due to reply or manual action
    - `pause_reason` (text) - Why sequence was paused
    - `completed_at` (timestamptz) - When sequence finished
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## 2. Modifications to Existing Tables
    
    ### `leads` table additions
    - `email_verified` (boolean) - Whether email passed verification
    - `verification_status` (text) - 'pending', 'valid', 'invalid', 'risky'
    - `verification_date` (timestamptz) - When verification occurred
    - `verification_details` (jsonb) - Detailed verification results
    - `has_replied` (boolean) - Whether lead has replied
    - `replied_at` (timestamptz) - When reply was received
    - `last_email_sent_at` (timestamptz) - Track last email sent time
    - `emails_sent_count` (integer) - Total emails sent in sequence

  ## 3. Indexes
    - Index on email for deduplication checking
    - Index on next_send_date for efficient scheduling queries
    - Index on verification_status for filtering

  ## 4. Security
    - Enable RLS on new tables
    - Add policies for authenticated user access based on ownership
*/

-- Create email_sequence_steps table
CREATE TABLE IF NOT EXISTS email_sequence_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  step_number integer NOT NULL,
  delay_days integer NOT NULL DEFAULT 0,
  subject text NOT NULL,
  body text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(campaign_id, step_number)
);

-- Create lead_sequence_progress table
CREATE TABLE IF NOT EXISTS lead_sequence_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_step integer DEFAULT 1,
  next_send_date timestamptz,
  is_paused boolean DEFAULT false,
  pause_reason text,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add verification columns to leads table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE leads ADD COLUMN email_verified boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE leads ADD COLUMN verification_status text DEFAULT 'pending';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'verification_date'
  ) THEN
    ALTER TABLE leads ADD COLUMN verification_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'verification_details'
  ) THEN
    ALTER TABLE leads ADD COLUMN verification_details jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'has_replied'
  ) THEN
    ALTER TABLE leads ADD COLUMN has_replied boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'replied_at'
  ) THEN
    ALTER TABLE leads ADD COLUMN replied_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'last_email_sent_at'
  ) THEN
    ALTER TABLE leads ADD COLUMN last_email_sent_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'emails_sent_count'
  ) THEN
    ALTER TABLE leads ADD COLUMN emails_sent_count integer DEFAULT 0;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_email_user ON leads(email, user_id);
CREATE INDEX IF NOT EXISTS idx_leads_verification_status ON leads(verification_status);
CREATE INDEX IF NOT EXISTS idx_sequence_progress_next_send ON lead_sequence_progress(next_send_date) WHERE is_paused = false AND completed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_sequence_steps_campaign ON email_sequence_steps(campaign_id, step_number);
CREATE INDEX IF NOT EXISTS idx_leads_replied ON leads(has_replied, replied_at);

-- Enable RLS
ALTER TABLE email_sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_sequence_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_sequence_steps
CREATE POLICY "Users can view own campaign sequence steps"
  ON email_sequence_steps FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = email_sequence_steps.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own campaign sequence steps"
  ON email_sequence_steps FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = email_sequence_steps.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own campaign sequence steps"
  ON email_sequence_steps FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = email_sequence_steps.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = email_sequence_steps.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own campaign sequence steps"
  ON email_sequence_steps FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = email_sequence_steps.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- RLS Policies for lead_sequence_progress
CREATE POLICY "Users can view own lead sequence progress"
  ON lead_sequence_progress FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leads
      JOIN campaigns ON campaigns.id = leads.campaign_id
      WHERE leads.id = lead_sequence_progress.lead_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own lead sequence progress"
  ON lead_sequence_progress FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads
      JOIN campaigns ON campaigns.id = leads.campaign_id
      WHERE leads.id = lead_sequence_progress.lead_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own lead sequence progress"
  ON lead_sequence_progress FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leads
      JOIN campaigns ON campaigns.id = leads.campaign_id
      WHERE leads.id = lead_sequence_progress.lead_id
      AND campaigns.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads
      JOIN campaigns ON campaigns.id = leads.campaign_id
      WHERE leads.id = lead_sequence_progress.lead_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own lead sequence progress"
  ON lead_sequence_progress FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leads
      JOIN campaigns ON campaigns.id = leads.campaign_id
      WHERE leads.id = lead_sequence_progress.lead_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_email_sequence_steps_updated_at ON email_sequence_steps;
CREATE TRIGGER update_email_sequence_steps_updated_at
  BEFORE UPDATE ON email_sequence_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lead_sequence_progress_updated_at ON lead_sequence_progress;
CREATE TRIGGER update_lead_sequence_progress_updated_at
  BEFORE UPDATE ON lead_sequence_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();