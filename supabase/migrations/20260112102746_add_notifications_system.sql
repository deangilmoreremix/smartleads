/*
  # Add Notifications System

  ## Overview
  Creates a comprehensive notification system for alerting users about important events
  like email replies, campaign completions, and delivery issues.

  ## New Tables

  ### `notifications`
  Stores all user notifications
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users) - The notification recipient
  - `type` (text) - Notification category: reply, open, bounce, campaign_complete, leads_scraped, credits_low
  - `title` (text) - Short notification title
  - `message` (text) - Detailed notification message
  - `campaign_id` (uuid, optional) - Related campaign
  - `lead_id` (uuid, optional) - Related lead
  - `email_id` (uuid, optional) - Related email
  - `metadata` (jsonb) - Additional context data
  - `is_read` (boolean) - Read status
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled with policies for user access
  - Users can only view/update their own notifications
  - System can create notifications for any user

  ## Triggers
  - Auto-create notifications on email reply events
  - Auto-create notifications on email bounce events
  - Auto-create notifications on campaign completion

  ## Important Notes
  - Checks user notification_preferences before creating notifications
  - Uses IF NOT EXISTS for safe re-runs
  - Optimized indexes for unread notification queries
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('reply', 'open', 'bounce', 'campaign_complete', 'leads_scraped', 'credits_low', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  email_id uuid REFERENCES emails(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to check if user wants a specific notification type
CREATE OR REPLACE FUNCTION check_notification_preference(
  p_user_id uuid,
  p_notification_type text
) RETURNS boolean AS $$
DECLARE
  prefs jsonb;
BEGIN
  SELECT notification_preferences INTO prefs
  FROM user_settings
  WHERE user_id = p_user_id;

  IF prefs IS NULL THEN
    RETURN true;
  END IF;

  IF p_notification_type = 'reply' THEN
    RETURN COALESCE((prefs->>'reply_alerts')::boolean, true);
  ELSIF p_notification_type IN ('campaign_complete', 'leads_scraped') THEN
    RETURN COALESCE((prefs->>'campaign_updates')::boolean, true);
  ELSE
    RETURN COALESCE((prefs->>'email_notifications')::boolean, true);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification from email tracking event
CREATE OR REPLACE FUNCTION create_notification_from_tracking_event()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
  v_campaign_id uuid;
  v_lead_id uuid;
  v_campaign_name text;
  v_lead_name text;
  v_notification_type text;
  v_title text;
  v_message text;
BEGIN
  -- Get email details
  SELECT e.user_id, e.campaign_id, e.lead_id, c.name, l.business_name
  INTO v_user_id, v_campaign_id, v_lead_id, v_campaign_name, v_lead_name
  FROM emails e
  LEFT JOIN campaigns c ON c.id = e.campaign_id
  LEFT JOIN leads l ON l.id = e.lead_id
  WHERE e.id = NEW.email_id;

  IF v_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Determine notification type and content
  IF NEW.event_type = 'replied' THEN
    v_notification_type := 'reply';
    v_title := 'New Reply Received';
    v_message := COALESCE(v_lead_name, 'A lead') || ' replied to your email in campaign "' || COALESCE(v_campaign_name, 'Unknown') || '"';
  ELSIF NEW.event_type = 'bounced' OR NEW.event_type = 'failed' THEN
    v_notification_type := 'bounce';
    v_title := 'Email Delivery Failed';
    v_message := 'Email to ' || COALESCE(v_lead_name, 'a lead') || ' bounced in campaign "' || COALESCE(v_campaign_name, 'Unknown') || '"';
  ELSE
    RETURN NEW;
  END IF;

  -- Check user preferences
  IF NOT check_notification_preference(v_user_id, v_notification_type) THEN
    RETURN NEW;
  END IF;

  -- Create notification
  INSERT INTO notifications (user_id, type, title, message, campaign_id, lead_id, email_id, metadata)
  VALUES (
    v_user_id,
    v_notification_type,
    v_title,
    v_message,
    v_campaign_id,
    v_lead_id,
    NEW.email_id,
    jsonb_build_object('event_type', NEW.event_type, 'event_timestamp', NEW.event_timestamp)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for email tracking events
DROP TRIGGER IF EXISTS notification_from_tracking_event ON email_tracking_events;
CREATE TRIGGER notification_from_tracking_event
  AFTER INSERT ON email_tracking_events
  FOR EACH ROW
  WHEN (NEW.event_type IN ('replied', 'bounced', 'failed'))
  EXECUTE FUNCTION create_notification_from_tracking_event();

-- Function to create notification on campaign completion
CREATE OR REPLACE FUNCTION create_notification_on_campaign_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    IF check_notification_preference(NEW.user_id, 'campaign_complete') THEN
      INSERT INTO notifications (user_id, type, title, message, campaign_id, metadata)
      VALUES (
        NEW.user_id,
        'campaign_complete',
        'Campaign Completed',
        'Your campaign "' || NEW.name || '" has finished. ' || NEW.emails_sent || ' emails sent, ' || NEW.emails_replied || ' replies received.',
        NEW.id,
        jsonb_build_object(
          'total_leads', NEW.total_leads,
          'emails_sent', NEW.emails_sent,
          'emails_opened', NEW.emails_opened,
          'emails_replied', NEW.emails_replied
        )
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for campaign completion
DROP TRIGGER IF EXISTS notification_on_campaign_complete ON campaigns;
CREATE TRIGGER notification_on_campaign_complete
  AFTER UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION create_notification_on_campaign_complete();

-- Function to create notification after lead scraping completes
CREATE OR REPLACE FUNCTION create_notification_on_scraping_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.scraping_status = 'completed' AND (OLD.scraping_status IS NULL OR OLD.scraping_status != 'completed') THEN
    IF check_notification_preference(NEW.user_id, 'leads_scraped') THEN
      INSERT INTO notifications (user_id, type, title, message, campaign_id, metadata)
      VALUES (
        NEW.user_id,
        'leads_scraped',
        'Lead Scraping Complete',
        NEW.total_leads || ' leads found for campaign "' || NEW.name || '". Ready to generate emails!',
        NEW.id,
        jsonb_build_object('total_leads', NEW.total_leads)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for scraping completion
DROP TRIGGER IF EXISTS notification_on_scraping_complete ON campaigns;
CREATE TRIGGER notification_on_scraping_complete
  AFTER UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION create_notification_on_scraping_complete();

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
