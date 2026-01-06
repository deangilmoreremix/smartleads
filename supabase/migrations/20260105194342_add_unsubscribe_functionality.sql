/*
  # Add Unsubscribe Functionality (CAN-SPAM Compliance)

  1. Overview
    Implements complete unsubscribe system for email compliance with CAN-SPAM Act.
    Allows recipients to opt-out of future emails and prevents sending to unsubscribed addresses.

  2. New Tables
    - `unsubscribes` - Tracks unsubscribed email addresses with audit trail

  3. Table Details
    `unsubscribes`:
    - `id` (uuid, primary key) - Unique unsubscribe record ID
    - `email` (text, not null) - Email address that unsubscribed
    - `user_id` (uuid, references auth.users) - Campaign owner (for reporting)
    - `campaign_id` (uuid, references campaigns) - Specific campaign unsubscribed from
    - `unsubscribed_at` (timestamptz) - When they unsubscribed
    - `reason` (text) - Optional unsubscribe reason
    - `ip_address` (text) - IP for audit trail
    - `created_at` (timestamptz) - Record creation timestamp

  4. Security
    - RLS enabled on unsubscribes table
    - Public insert allowed (anyone can unsubscribe via link)
    - Users can only view their own unsubscribes
    - Email addresses indexed for fast lookups

  5. Important Notes
    - Uses IF NOT EXISTS for safe re-runs
    - Email stored in lowercase for consistent matching
    - IP address captured for compliance documentation
    - Campaign-specific and global unsubscribes supported
*/

-- Create unsubscribes table
CREATE TABLE IF NOT EXISTS unsubscribes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  unsubscribed_at timestamptz DEFAULT now(),
  reason text,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_unsubscribes_email ON unsubscribes(email);
CREATE INDEX IF NOT EXISTS idx_unsubscribes_user_id ON unsubscribes(user_id);
CREATE INDEX IF NOT EXISTS idx_unsubscribes_campaign_id ON unsubscribes(campaign_id);
CREATE INDEX IF NOT EXISTS idx_unsubscribes_created_at ON unsubscribes(created_at DESC);

-- Enable RLS
ALTER TABLE unsubscribes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to unsubscribe (public form accessible via link)
CREATE POLICY "Anyone can unsubscribe"
  ON unsubscribes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Users can view their own unsubscribes (for reporting)
CREATE POLICY "Users can view own unsubscribes"
  ON unsubscribes FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Service role can access all (for edge functions)
CREATE POLICY "Service role full access"
  ON unsubscribes FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
