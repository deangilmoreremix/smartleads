/*
  # Add Email Attachments Table

  ## Overview
  This migration creates a table to track email attachments uploaded by users
  for use in their email campaigns.

  ## Changes

  1. New Table: email_attachments
     - id (uuid, primary key)
     - user_id (uuid, foreign key to auth.users)
     - campaign_id (uuid, foreign key to campaigns, optional)
     - variant_id (uuid, foreign key to template_variants, optional)
     - file_path (text) - Storage path to the file
     - file_name (text) - Original filename
     - file_size (bigint) - File size in bytes
     - mime_type (text) - MIME type of the file
     - uploaded_at (timestamptz) - Upload timestamp

  2. Security
     - Enable RLS on email_attachments table
     - Users can only access their own attachments
     - Proper indexing for performance

  ## Important Notes
  - Attachments can be associated with campaigns or specific variants
  - All attachments are stored in the 'email-attachments' storage bucket
  - Users can only manage their own attachments
*/

-- Create email_attachments table
CREATE TABLE IF NOT EXISTS email_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES template_variants(id) ON DELETE SET NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  uploaded_at timestamptz DEFAULT now(),
  CONSTRAINT file_size_positive CHECK (file_size > 0)
);

ALTER TABLE email_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own email attachments"
  ON email_attachments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email attachments"
  ON email_attachments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own email attachments"
  ON email_attachments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own email attachments"
  ON email_attachments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_attachments_user_id ON email_attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_email_attachments_campaign_id ON email_attachments(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_attachments_variant_id ON email_attachments(variant_id);
CREATE INDEX IF NOT EXISTS idx_email_attachments_uploaded_at ON email_attachments(uploaded_at DESC);
