/*
  # Add File Storage Support

  ## Overview
  This migration adds comprehensive file storage capabilities to the application,
  including profile pictures, company logos, lead images, and storage quota tracking.

  ## Changes

  1. Profile Enhancements
     - Add `avatar_url` field to profiles for user profile pictures
     - Add `company_logo` field to profiles for business branding
     - Add `storage_used_bytes` to track user's total storage consumption

  2. File Uploads Tracking
     - Create `file_uploads` table to track all uploaded files
     - Fields include: file_path, bucket_name, file_size, mime_type, uploaded_at
     - Enables audit trail and storage quota management

  3. Lead Images Enhancement
     - Add `is_local_storage` flag to distinguish local vs external URLs
     - Add `file_size` and `mime_type` fields for tracking
     - Add `thumbnail_url` for optimized image previews

  4. Storage Quota Management
     - Add storage limits to subscription plans
     - Track usage per user for quota enforcement

  ## Security
     - Enable RLS on all new tables
     - Add policies for authenticated users to manage their own files
     - Restrict file operations to file owners only
*/

-- Add avatar and company logo fields to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'company_logo'
  ) THEN
    ALTER TABLE profiles ADD COLUMN company_logo text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'storage_used_bytes'
  ) THEN
    ALTER TABLE profiles ADD COLUMN storage_used_bytes bigint DEFAULT 0;
  END IF;
END $$;

-- Create file_uploads tracking table
CREATE TABLE IF NOT EXISTS file_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_path text NOT NULL,
  bucket_name text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  original_filename text,
  uploaded_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT file_size_positive CHECK (file_size > 0)
);

ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own file uploads"
  ON file_uploads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own file uploads"
  ON file_uploads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own file uploads"
  ON file_uploads FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own file uploads"
  ON file_uploads FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_bucket ON file_uploads(bucket_name);
CREATE INDEX IF NOT EXISTS idx_file_uploads_deleted ON file_uploads(deleted_at) WHERE deleted_at IS NULL;

-- Enhance lead_images table with storage metadata
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lead_images' AND column_name = 'is_local_storage'
  ) THEN
    ALTER TABLE lead_images ADD COLUMN is_local_storage boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lead_images' AND column_name = 'file_size'
  ) THEN
    ALTER TABLE lead_images ADD COLUMN file_size bigint;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lead_images' AND column_name = 'mime_type'
  ) THEN
    ALTER TABLE lead_images ADD COLUMN mime_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lead_images' AND column_name = 'thumbnail_url'
  ) THEN
    ALTER TABLE lead_images ADD COLUMN thumbnail_url text;
  END IF;
END $$;

-- Add storage limits to subscriptions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'storage_limit_bytes'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN storage_limit_bytes bigint DEFAULT 1073741824;
  END IF;
END $$;

-- Update storage limits based on plan type
UPDATE subscriptions SET storage_limit_bytes = 1073741824 WHERE plan_type = 'free';
UPDATE subscriptions SET storage_limit_bytes = 10737418240 WHERE plan_type = 'starter';
UPDATE subscriptions SET storage_limit_bytes = 53687091200 WHERE plan_type = 'professional';
UPDATE subscriptions SET storage_limit_bytes = 9223372036854775807 WHERE plan_type = 'enterprise';

-- Function to update user's total storage usage
CREATE OR REPLACE FUNCTION update_user_storage_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles
    SET storage_used_bytes = COALESCE(storage_used_bytes, 0) + NEW.file_size
    WHERE user_id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles
    SET storage_used_bytes = GREATEST(COALESCE(storage_used_bytes, 0) - OLD.file_size, 0)
    WHERE user_id = OLD.user_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    UPDATE profiles
    SET storage_used_bytes = GREATEST(COALESCE(storage_used_bytes, 0) - OLD.file_size, 0)
    WHERE user_id = OLD.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic storage usage tracking
DROP TRIGGER IF EXISTS trigger_update_storage_usage ON file_uploads;
CREATE TRIGGER trigger_update_storage_usage
  AFTER INSERT OR UPDATE OR DELETE ON file_uploads
  FOR EACH ROW
  EXECUTE FUNCTION update_user_storage_usage();

-- Function to check storage quota before upload
CREATE OR REPLACE FUNCTION check_storage_quota(
  p_user_id uuid,
  p_file_size bigint
)
RETURNS boolean AS $$
DECLARE
  v_current_usage bigint;
  v_storage_limit bigint;
BEGIN
  SELECT 
    COALESCE(p.storage_used_bytes, 0),
    COALESCE(s.storage_limit_bytes, 1073741824)
  INTO v_current_usage, v_storage_limit
  FROM profiles p
  JOIN subscriptions s ON s.user_id = p.user_id
  WHERE p.user_id = p_user_id;

  RETURN (v_current_usage + p_file_size) <= v_storage_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION check_storage_quota TO authenticated;