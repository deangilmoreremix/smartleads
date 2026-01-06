/*
  # Initial NotiQ Database Schema

  ## Overview
  Creates the complete database schema for the NotiQ AI outreach platform, including tables for campaigns, leads, emails, analytics, user settings, and subscriptions.

  ## New Tables
  
  ### 1. `profiles`
  User profile information extending auth.users
  - `id` (uuid, primary key, references auth.users)
  - `email` (text)
  - `full_name` (text)
  - `company_name` (text, optional)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `subscriptions`
  User subscription and plan management
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `plan_type` (text: 'free', 'starter', 'professional', 'enterprise')
  - `status` (text: 'active', 'cancelled', 'expired')
  - `credits_remaining` (integer)
  - `credits_total` (integer)
  - `billing_cycle_start` (timestamptz)
  - `billing_cycle_end` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `campaigns`
  Outreach campaigns created by users
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `name` (text)
  - `niche` (text, e.g., 'restaurants', 'gyms')
  - `location` (text, e.g., 'New York, NY')
  - `ai_prompt` (text, optional - original prompt if using AI)
  - `status` (text: 'draft', 'active', 'paused', 'completed')
  - `email_template` (text)
  - `total_leads` (integer)
  - `emails_sent` (integer)
  - `emails_opened` (integer)
  - `emails_replied` (integer)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `launched_at` (timestamptz, optional)

  ### 4. `leads`
  Business leads scraped from Google Maps
  - `id` (uuid, primary key)
  - `campaign_id` (uuid, references campaigns)
  - `user_id` (uuid, references profiles)
  - `business_name` (text)
  - `email` (text)
  - `phone` (text, optional)
  - `address` (text, optional)
  - `website` (text, optional)
  - `rating` (numeric, optional)
  - `review_count` (integer, optional)
  - `email_type` (text: 'personal', 'generic', 'unknown')
  - `decision_maker_name` (text, optional)
  - `status` (text: 'new', 'contacted', 'replied', 'converted', 'bounced')
  - `google_maps_url` (text, optional)
  - `notes` (text, optional)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. `emails`
  Individual emails sent to leads
  - `id` (uuid, primary key)
  - `campaign_id` (uuid, references campaigns)
  - `lead_id` (uuid, references leads)
  - `user_id` (uuid, references profiles)
  - `subject` (text)
  - `body` (text)
  - `personalization_data` (jsonb, stores AI-generated personalization)
  - `status` (text: 'queued', 'sent', 'opened', 'clicked', 'replied', 'bounced', 'failed')
  - `sent_at` (timestamptz, optional)
  - `opened_at` (timestamptz, optional)
  - `replied_at` (timestamptz, optional)
  - `error_message` (text, optional)
  - `created_at` (timestamptz)

  ### 6. `user_settings`
  User preferences and integration settings
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles, unique)
  - `gmail_accounts` (jsonb, array of connected Gmail accounts)
  - `daily_email_limit` (integer)
  - `email_sending_schedule` (jsonb, defines when to send emails)
  - `ai_model_preference` (text: 'gpt-4', 'claude', etc.)
  - `notification_preferences` (jsonb)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 7. `analytics_events`
  Track detailed analytics events
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `campaign_id` (uuid, references campaigns, optional)
  - `lead_id` (uuid, references leads, optional)
  - `email_id` (uuid, references emails, optional)
  - `event_type` (text: 'email_sent', 'email_opened', 'email_clicked', 'email_replied', etc.)
  - `event_data` (jsonb, additional event metadata)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage their own data
  - Restrict data access to owner only
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  company_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan_type text DEFAULT 'free' NOT NULL CHECK (plan_type IN ('free', 'starter', 'professional', 'enterprise')),
  status text DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')),
  credits_remaining integer DEFAULT 100 NOT NULL,
  credits_total integer DEFAULT 100 NOT NULL,
  billing_cycle_start timestamptz DEFAULT now(),
  billing_cycle_end timestamptz DEFAULT (now() + interval '1 month'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  niche text NOT NULL,
  location text NOT NULL,
  ai_prompt text,
  status text DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  email_template text,
  total_leads integer DEFAULT 0,
  emails_sent integer DEFAULT 0,
  emails_opened integer DEFAULT 0,
  emails_replied integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  launched_at timestamptz
);

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  business_name text NOT NULL,
  email text NOT NULL,
  phone text,
  address text,
  website text,
  rating numeric(2,1),
  review_count integer DEFAULT 0,
  email_type text DEFAULT 'unknown' CHECK (email_type IN ('personal', 'generic', 'unknown')),
  decision_maker_name text,
  status text DEFAULT 'new' NOT NULL CHECK (status IN ('new', 'contacted', 'replied', 'converted', 'bounced')),
  google_maps_url text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create emails table
CREATE TABLE IF NOT EXISTS emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  personalization_data jsonb DEFAULT '{}',
  status text DEFAULT 'queued' NOT NULL CHECK (status IN ('queued', 'sent', 'opened', 'clicked', 'replied', 'bounced', 'failed')),
  sent_at timestamptz,
  opened_at timestamptz,
  replied_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  gmail_accounts jsonb DEFAULT '[]',
  daily_email_limit integer DEFAULT 50,
  email_sending_schedule jsonb DEFAULT '{"enabled": true, "start_hour": 9, "end_hour": 17, "timezone": "UTC"}',
  ai_model_preference text DEFAULT 'gpt-4',
  notification_preferences jsonb DEFAULT '{"email": true, "in_app": true}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  email_id uuid REFERENCES emails(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_leads_campaign_id ON leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_emails_campaign_id ON emails(campaign_id);
CREATE INDEX IF NOT EXISTS idx_emails_lead_id ON emails(lead_id);
CREATE INDEX IF NOT EXISTS idx_emails_status ON emails(status);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_campaign_id ON analytics_events(campaign_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for campaigns
CREATE POLICY "Users can view own campaigns"
  ON campaigns FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own campaigns"
  ON campaigns FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own campaigns"
  ON campaigns FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own campaigns"
  ON campaigns FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for leads
CREATE POLICY "Users can view own leads"
  ON leads FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own leads"
  ON leads FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own leads"
  ON leads FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own leads"
  ON leads FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for emails
CREATE POLICY "Users can view own emails"
  ON emails FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own emails"
  ON emails FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own emails"
  ON emails FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own emails"
  ON emails FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for user_settings
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for analytics_events
CREATE POLICY "Users can view own analytics"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own analytics"
  ON analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.subscriptions (user_id, plan_type, status, credits_remaining, credits_total)
  VALUES (new.id, 'free', 'active', 100, 100);
  
  INSERT INTO public.user_settings (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS subscriptions_updated_at ON subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS campaigns_updated_at ON campaigns;
CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS leads_updated_at ON leads;
CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS user_settings_updated_at ON user_settings;
CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
