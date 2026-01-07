/*
  # Fix Production Security Issues

  ## Overview
  This migration addresses critical security and data integrity issues found during production audit.

  ## Security Fixes

  ### 1. `sequence_ab_tests` Table
  - Add `user_id` column for proper RLS enforcement
  - Add `campaign_id` column for relationship tracking
  - Drop overly permissive RLS policies that used `USING (true)`
  - Create proper user-scoped RLS policies

  ## Additional Indexes
  - Add missing performance indexes for common queries

  ## Important Notes
  - This migration fixes a security vulnerability where any authenticated user could access any A/B test
  - All existing A/B tests will need user_id populated from their related sequences
*/

-- Add user_id and campaign_id columns to sequence_ab_tests if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sequence_ab_tests' AND column_name = 'user_id') THEN
    ALTER TABLE sequence_ab_tests ADD COLUMN user_id uuid REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sequence_ab_tests' AND column_name = 'campaign_id') THEN
    ALTER TABLE sequence_ab_tests ADD COLUMN campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create index for the new columns
CREATE INDEX IF NOT EXISTS idx_sequence_ab_tests_user_id ON sequence_ab_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_sequence_ab_tests_campaign_id ON sequence_ab_tests(campaign_id);

-- Drop the overly permissive RLS policies
DROP POLICY IF EXISTS "Users can view own AB tests" ON sequence_ab_tests;
DROP POLICY IF EXISTS "Users can insert AB tests" ON sequence_ab_tests;
DROP POLICY IF EXISTS "Users can update AB tests" ON sequence_ab_tests;
DROP POLICY IF EXISTS "Users can delete AB tests" ON sequence_ab_tests;

-- Create proper RLS policies for sequence_ab_tests
CREATE POLICY "Users can view own AB tests"
  ON sequence_ab_tests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own AB tests"
  ON sequence_ab_tests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own AB tests"
  ON sequence_ab_tests FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own AB tests"
  ON sequence_ab_tests FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Add additional indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_reply_classifications_user_id ON reply_classifications(user_id);
CREATE INDEX IF NOT EXISTS idx_reply_classifications_campaign_id ON reply_classifications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_user_id ON webhook_deliveries(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_delivered_at ON webhook_deliveries(delivered_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_funnel_date ON analytics_funnel(date DESC);
CREATE INDEX IF NOT EXISTS idx_leads_pipeline_stage_changed_at ON leads(pipeline_stage_changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_emails_ab_test_id ON emails(ab_test_id);

-- Add index for duplicate email lookups
CREATE INDEX IF NOT EXISTS idx_duplicate_email_registry_user_email ON duplicate_email_registry(user_id, email);

-- Add constraint to ensure reply classification is reviewed before changing
ALTER TABLE reply_classifications
  DROP CONSTRAINT IF EXISTS check_reviewed_timestamp;

ALTER TABLE reply_classifications
  ADD CONSTRAINT check_reviewed_timestamp
  CHECK (
    (is_reviewed = false AND reviewed_at IS NULL) OR
    (is_reviewed = true)
  );
