/*
  # Add Subscription and Multi-Provider Support

  ## Overview
  This migration adds a comprehensive subscription system to monetize premium features like LinkedIn, Outlook, and other Unipile providers beyond Gmail.

  ## New Tables
  
  1. **subscription_plans**
    - `id` (uuid, primary key)
    - `name` (text) - Plan name (e.g., "Free", "Pro", "Enterprise")
    - `display_name` (text) - Display name for UI
    - `description` (text) - Plan description
    - `price_monthly` (integer) - Price in cents
    - `price_yearly` (integer) - Annual price in cents
    - `max_campaigns` (integer) - Max campaigns allowed
    - `max_leads_per_campaign` (integer) - Max leads per campaign
    - `max_email_accounts` (integer) - Max Gmail accounts
    - `features` (jsonb) - Feature flags
    - `is_active` (boolean) - Whether plan is available
    - `sort_order` (integer) - Display order
    - `created_at`, `updated_at` (timestamptz)

  2. **user_subscriptions**
    - `id` (uuid, primary key)
    - `user_id` (uuid, foreign key to auth.users)
    - `plan_id` (uuid, foreign key to subscription_plans)
    - `status` (text) - active, canceled, past_due, etc.
    - `current_period_start` (timestamptz)
    - `current_period_end` (timestamptz)
    - `cancel_at_period_end` (boolean)
    - `stripe_customer_id` (text)
    - `stripe_subscription_id` (text)
    - `created_at`, `updated_at` (timestamptz)

  3. **provider_connections** (extends gmail_accounts)
    - Tracks connections to different providers (Gmail, LinkedIn, Outlook, etc.)
    - Links to subscription features

  ## Schema Changes
  
  1. Add `provider_type` to gmail_accounts table
  2. Add provider-specific columns

  ## Security
  
  - RLS enabled on all tables
  - Users can only view/manage their own subscriptions
  - Admins can view all subscriptions

  ## Important Notes
  
  - Free plan includes Gmail only
  - Pro plan adds LinkedIn ($49/month)
  - Enterprise adds all providers ($199/month)
*/

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text NOT NULL,
  price_monthly integer NOT NULL DEFAULT 0,
  price_yearly integer NOT NULL DEFAULT 0,
  stripe_price_id_monthly text,
  stripe_price_id_yearly text,
  max_campaigns integer NOT NULL DEFAULT 5,
  max_leads_per_campaign integer NOT NULL DEFAULT 100,
  max_email_accounts integer NOT NULL DEFAULT 1,
  features jsonb NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'active',
  billing_cycle text NOT NULL DEFAULT 'monthly',
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL DEFAULT now() + interval '1 month',
  cancel_at_period_end boolean DEFAULT false,
  canceled_at timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  trial_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid')),
  CONSTRAINT valid_billing_cycle CHECK (billing_cycle IN ('monthly', 'yearly'))
);

-- Add unique constraint: one active subscription per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_active_user 
  ON user_subscriptions(user_id) 
  WHERE status IN ('active', 'trialing');

-- Add provider_type to gmail_accounts for multi-provider support
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gmail_accounts' AND column_name = 'provider_type'
  ) THEN
    ALTER TABLE gmail_accounts ADD COLUMN provider_type text DEFAULT 'gmail';
  END IF;
END $$;

-- Add constraint for valid providers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'gmail_accounts' AND constraint_name = 'valid_provider_type'
  ) THEN
    ALTER TABLE gmail_accounts ADD CONSTRAINT valid_provider_type 
      CHECK (provider_type IN ('gmail', 'linkedin', 'outlook', 'twitter'));
  END IF;
END $$;

-- Add LinkedIn-specific fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gmail_accounts' AND column_name = 'linkedin_profile_url'
  ) THEN
    ALTER TABLE gmail_accounts ADD COLUMN linkedin_profile_url text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gmail_accounts' AND column_name = 'connection_quota_daily'
  ) THEN
    ALTER TABLE gmail_accounts ADD COLUMN connection_quota_daily integer DEFAULT 50;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gmail_accounts' AND column_name = 'messages_sent_today'
  ) THEN
    ALTER TABLE gmail_accounts ADD COLUMN messages_sent_today integer DEFAULT 0;
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read, admin write)
CREATE POLICY "Anyone can view active plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage plans"
  ON subscription_plans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON user_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON user_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer ON user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_gmail_accounts_provider_type ON gmail_accounts(provider_type);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

-- Seed default subscription plans
INSERT INTO subscription_plans (name, display_name, description, price_monthly, price_yearly, max_campaigns, max_leads_per_campaign, max_email_accounts, features, sort_order)
VALUES 
  (
    'free',
    'Free',
    'Perfect for getting started with cold email outreach',
    0,
    0,
    3,
    50,
    1,
    '{"gmail": true, "ai_emails": true, "basic_analytics": true, "email_sequences": false, "linkedin": false, "outlook": false, "ab_testing": false, "advanced_analytics": false, "priority_support": false}',
    1
  ),
  (
    'pro',
    'Pro',
    'For professionals scaling their outreach',
    4900,
    49900,
    25,
    500,
    5,
    '{"gmail": true, "linkedin": true, "ai_emails": true, "basic_analytics": true, "email_sequences": true, "ab_testing": true, "advanced_analytics": true, "outlook": false, "priority_support": true, "api_access": false}',
    2
  ),
  (
    'enterprise',
    'Enterprise',
    'For teams and agencies with unlimited scale',
    19900,
    199900,
    -1,
    -1,
    -1,
    '{"gmail": true, "linkedin": true, "outlook": true, "twitter": true, "ai_emails": true, "basic_analytics": true, "email_sequences": true, "ab_testing": true, "advanced_analytics": true, "priority_support": true, "api_access": true, "white_label": true, "dedicated_support": true}',
    3
  )
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  max_campaigns = EXCLUDED.max_campaigns,
  max_leads_per_campaign = EXCLUDED.max_leads_per_campaign,
  max_email_accounts = EXCLUDED.max_email_accounts,
  features = EXCLUDED.features,
  sort_order = EXCLUDED.sort_order;

-- Function to get user's current subscription with plan details
CREATE OR REPLACE FUNCTION get_user_subscription(p_user_id uuid)
RETURNS TABLE (
  subscription_id uuid,
  plan_id uuid,
  plan_name text,
  plan_display_name text,
  features jsonb,
  status text,
  current_period_end timestamptz,
  cancel_at_period_end boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.id,
    sp.id,
    sp.name,
    sp.display_name,
    sp.features,
    us.status,
    us.current_period_end,
    us.cancel_at_period_end
  FROM user_subscriptions us
  JOIN subscription_plans sp ON sp.id = us.plan_id
  WHERE us.user_id = p_user_id
  AND us.status IN ('active', 'trialing')
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has feature access
CREATE OR REPLACE FUNCTION user_has_feature(p_user_id uuid, p_feature text)
RETURNS boolean AS $$
DECLARE
  v_has_feature boolean;
BEGIN
  SELECT COALESCE((sp.features->>p_feature)::boolean, false) INTO v_has_feature
  FROM user_subscriptions us
  JOIN subscription_plans sp ON sp.id = us.plan_id
  WHERE us.user_id = p_user_id
  AND us.status IN ('active', 'trialing')
  LIMIT 1;
  
  RETURN COALESCE(v_has_feature, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create free subscriptions for existing users
INSERT INTO user_subscriptions (user_id, plan_id, status)
SELECT 
  au.id,
  sp.id,
  'active'
FROM auth.users au
CROSS JOIN subscription_plans sp
WHERE sp.name = 'free'
AND NOT EXISTS (
  SELECT 1 FROM user_subscriptions us
  WHERE us.user_id = au.id
)
ON CONFLICT DO NOTHING;
