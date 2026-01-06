/*
  # Enhance Lead Images Table

  ## Overview
  Adds missing columns to the lead_images table for full storage support
  including captions, primary image designation, and better metadata tracking.

  ## Changes

  1. Add Missing Columns
     - caption (text) - Optional description for the image
     - is_primary (boolean) - Flag to designate the primary image for a lead

  2. Update Existing Data
     - Set first image per lead as primary if none exist

  ## Important Notes
  - Only one image per lead should be marked as primary
  - Caption field is optional for user-provided descriptions
*/

-- Add missing columns to lead_images table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lead_images' AND column_name = 'caption'
  ) THEN
    ALTER TABLE lead_images ADD COLUMN caption text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lead_images' AND column_name = 'is_primary'
  ) THEN
    ALTER TABLE lead_images ADD COLUMN is_primary boolean DEFAULT false;
  END IF;
END $$;

-- Set the oldest image for each lead as primary if no primary exists
UPDATE lead_images li1
SET is_primary = true
WHERE id IN (
  SELECT DISTINCT ON (lead_id) id
  FROM lead_images
  WHERE lead_id NOT IN (
    SELECT lead_id 
    FROM lead_images 
    WHERE is_primary = true
  )
  ORDER BY lead_id, created_at ASC
);
