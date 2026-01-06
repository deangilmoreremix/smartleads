/*
  # Add Storage Bucket RLS Policies

  ## Overview
  This migration adds comprehensive Row Level Security policies for all storage buckets
  to ensure proper isolation and security for user files.

  ## Security Policies

  1. Avatars Bucket (Public)
     - Users can upload to their own folder
     - Anyone can view avatar images (public access)
     - Users can update/delete only their own avatars

  2. Company Logos Bucket (Public)
     - Users can upload to their own folder
     - Anyone can view logos (public access)
     - Users can update/delete only their own logos

  3. Lead Images Bucket (Private)
     - Users can upload to their own folder
     - Users can only view their own lead images
     - Users can update/delete only their own images

  4. Email Attachments Bucket (Private)
     - Users can upload to their own folder
     - Users can only access their own attachments
     - Users can update/delete only their own files

  5. Exports Bucket (Private)
     - Users can upload to their own folder
     - Users can only access their own exports
     - Users can delete only their own export files

  ## Important Notes
  - All policies enforce user_id folder isolation
  - Public buckets (avatars, logos) allow read access to all
  - Private buckets restrict all access to file owners only
*/

-- Avatars bucket policies (Public bucket)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

CREATE POLICY "Users can upload own avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Company logos bucket policies (Public bucket)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

CREATE POLICY "Users can upload own company logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'company-logos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Anyone can view company logos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'company-logos');

CREATE POLICY "Users can update own company logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'company-logos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own company logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'company-logos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Lead images bucket policies (Private bucket)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lead-images',
  'lead-images',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

CREATE POLICY "Users can upload own lead images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'lead-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own lead images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'lead-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own lead images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'lead-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own lead images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'lead-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Email attachments bucket policies (Private bucket)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'email-attachments',
  'email-attachments',
  false,
  26214400,
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 26214400,
  allowed_mime_types = ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ];

CREATE POLICY "Users can upload own email attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'email-attachments' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own email attachments"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'email-attachments' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own email attachments"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'email-attachments' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own email attachments"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'email-attachments' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Exports bucket policies (Private bucket)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exports',
  'exports',
  false,
  104857600,
  ARRAY[
    'text/csv',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY[
    'text/csv',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

CREATE POLICY "Users can upload own exports"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'exports' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own exports"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'exports' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own exports"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'exports' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own exports"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'exports' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );