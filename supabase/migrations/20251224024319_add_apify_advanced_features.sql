/*
  # Add Apify Advanced Features Support

  ## Overview
  Extends the schema to support all Apify API features including contact enrichment,
  social media profiles, employee leads, reviews, and advanced filtering options.

  ## New Tables

  ### 1. `lead_contacts`
  Employee/lead contact information from enrichment
  - `id` (uuid, primary key)
  - `lead_id` (uuid, references leads)
  - `user_id` (uuid, references profiles)
  - `campaign_id` (uuid, references campaigns)
  - `full_name` (text)
  - `job_title` (text)
  - `email` (text)
  - `phone` (text)
  - `linkedin_url` (text)
  - `department` (text)
  - `seniority` (text)
  - `created_at` (timestamptz)

  ### 2. `lead_social_profiles`
  Social media profile details from enrichment
  - `id` (uuid, primary key)
  - `lead_id` (uuid, references leads)
  - `user_id` (uuid, references profiles)
  - `platform` (text: facebook, instagram, youtube, tiktok, twitter)
  - `profile_url` (text)
  - `profile_name` (text)
  - `followers` (integer)
  - `following` (integer)
  - `posts_count` (integer)
  - `is_verified` (boolean)
  - `description` (text)
  - `profile_picture` (text)
  - `enriched_data` (jsonb)
  - `created_at` (timestamptz)

  ### 3. `lead_reviews`
  Customer reviews scraped from places
  - `id` (uuid, primary key)
  - `lead_id` (uuid, references leads)
  - `user_id` (uuid, references profiles)
  - `reviewer_name` (text)
  - `reviewer_photo` (text)
  - `rating` (integer, 1-5)
  - `text` (text)
  - `publish_date` (timestamptz)
  - `response_text` (text)
  - `response_date` (timestamptz)
  - `likes` (integer)
  - `review_url` (text)
  - `created_at` (timestamptz)

  ### 4. `lead_images`
  Business images from places
  - `id` (uuid, primary key)
  - `lead_id` (uuid, references leads)
  - `user_id` (uuid, references profiles)
  - `image_url` (text)
  - `thumbnail_url` (text)
  - `author_name` (text)
  - `category` (text)
  - `created_at` (timestamptz)

  ## Modified Tables

  ### `campaigns`
  Add Apify advanced settings
  - `apify_settings` (jsonb, stores all Apify API parameters)

  ### `leads`
  Add enrichment fields
  - `real_email` (text, from website scraping)
  - `social_profiles` (jsonb, quick lookup)
  - `employee_count` (integer, from enrichment)
  - `industry` (text, from enrichment)
  - `opening_hours` (jsonb)
  - `image_categories` (jsonb)
  - `reviews_distribution` (jsonb)
  - `popular_times` (jsonb)
  - `questions_answers` (jsonb)
  - `web_results` (jsonb)
  - `directory_places` (jsonb, for places inside malls)

  ## Security
  - Enable RLS on all new tables
  - Policies restrict access to user's own data
  - Personal data fields protected by GDPR-aware policies
*/

-- Add columns to campaigns table for Apify settings
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS apify_settings jsonb DEFAULT '{
  "maxCrawledPlacesPerSearch": 50,
  "language": "en",
  "searchMatching": "all",
  "placeMinimumStars": "",
  "website": "allPlaces",
  "skipClosedPlaces": false,
  "scrapePlaceDetailPage": false,
  "scrapeContacts": false,
  "scrapeSocialMediaProfiles": {
    "facebooks": false,
    "instagrams": false,
    "youtubes": false,
    "tiktoks": false,
    "twitters": false
  },
  "maximumLeadsEnrichmentRecords": 0,
  "leadsEnrichmentDepartments": [],
  "maxReviews": 0,
  "reviewsSort": "newest",
  "reviewsFilterString": "",
  "maxImages": 0,
  "maxQuestions": 0,
  "categoryFilterWords": []
}';

-- Add enrichment columns to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS real_email text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS social_profiles jsonb DEFAULT '{}';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS employee_count integer;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS industry text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS opening_hours jsonb DEFAULT '[]';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS image_categories jsonb DEFAULT '{}';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS reviews_distribution jsonb DEFAULT '{}';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS popular_times jsonb DEFAULT '{}';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS questions_answers jsonb DEFAULT '[]';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS web_results jsonb DEFAULT '[]';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS directory_places jsonb DEFAULT '[]';

-- Create lead_contacts table
CREATE TABLE IF NOT EXISTS lead_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  full_name text,
  job_title text,
  email text,
  phone text,
  linkedin_url text,
  department text,
  seniority text,
  created_at timestamptz DEFAULT now()
);

-- Create lead_social_profiles table
CREATE TABLE IF NOT EXISTS lead_social_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL CHECK (platform IN ('facebook', 'instagram', 'youtube', 'tiktok', 'twitter')),
  profile_url text NOT NULL,
  profile_name text,
  followers integer DEFAULT 0,
  following integer DEFAULT 0,
  posts_count integer DEFAULT 0,
  is_verified boolean DEFAULT false,
  description text,
  profile_picture text,
  enriched_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(lead_id, platform)
);

-- Create lead_reviews table
CREATE TABLE IF NOT EXISTS lead_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reviewer_name text,
  reviewer_photo text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  text text,
  publish_date timestamptz,
  response_text text,
  response_date timestamptz,
  likes integer DEFAULT 0,
  review_url text,
  created_at timestamptz DEFAULT now()
);

-- Create lead_images table
CREATE TABLE IF NOT EXISTS lead_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  thumbnail_url text,
  author_name text,
  category text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lead_contacts_lead_id ON lead_contacts(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_contacts_user_id ON lead_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_contacts_email ON lead_contacts(email);
CREATE INDEX IF NOT EXISTS idx_lead_social_profiles_lead_id ON lead_social_profiles(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_social_profiles_platform ON lead_social_profiles(platform);
CREATE INDEX IF NOT EXISTS idx_lead_reviews_lead_id ON lead_reviews(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_reviews_rating ON lead_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_lead_images_lead_id ON lead_images(lead_id);

-- Enable RLS
ALTER TABLE lead_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_social_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lead_contacts
CREATE POLICY "Users can view own lead contacts"
  ON lead_contacts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own lead contacts"
  ON lead_contacts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own lead contacts"
  ON lead_contacts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own lead contacts"
  ON lead_contacts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for lead_social_profiles
CREATE POLICY "Users can view own social profiles"
  ON lead_social_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own social profiles"
  ON lead_social_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own social profiles"
  ON lead_social_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own social profiles"
  ON lead_social_profiles FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for lead_reviews
CREATE POLICY "Users can view own lead reviews"
  ON lead_reviews FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own lead reviews"
  ON lead_reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own lead reviews"
  ON lead_reviews FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own lead reviews"
  ON lead_reviews FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for lead_images
CREATE POLICY "Users can view own lead images"
  ON lead_images FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own lead images"
  ON lead_images FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own lead images"
  ON lead_images FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own lead images"
  ON lead_images FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
