/*
  # Add Inbox Messaging Tables
  
  1. New Tables
    - `inbox_contacts` - Stores contact information for conversations
      - `id` (uuid, primary key)
      - `name` (text) - Contact's name
      - `email` (text, unique) - Contact's email address
      - `company` (text) - Contact's company name
      - `role` (text) - Contact's role/title
      - `avatar_url` (text) - URL to contact's avatar
      - `linkedin_url` (text) - LinkedIn profile URL
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `inbox_conversations` - Stores conversation threads
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `contact_id` (uuid, foreign key to inbox_contacts)
      - `platform` (text) - Communication platform (email, linkedin, etc.)
      - `status` (text) - Conversation status
      - `last_message` (text) - Preview of last message
      - `last_message_at` (timestamptz) - When last message was sent
      - `unread_count` (integer) - Number of unread messages
      - `is_archived` (boolean) - Whether conversation is archived
      - `created_at` (timestamptz)
    
    - `inbox_messages` - Stores individual messages
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, foreign key to inbox_conversations)
      - `sender_id` (uuid) - Who sent the message
      - `direction` (text) - 'inbound' or 'outbound'
      - `message_type` (text) - Type of message (text, email, inmail, voice_note)
      - `subject` (text) - Message subject (for emails)
      - `body` (text) - Message content
      - `voice_note_url` (text) - URL to voice note if applicable
      - `voice_note_duration` (integer) - Duration of voice note in seconds
      - `credits_used` (integer) - Credits used for this message
      - `sent_at` (timestamptz) - When message was sent
      - `read_at` (timestamptz) - When message was read
  
  2. Security
    - RLS enabled on all tables
    - Users can only access their own conversations and messages
    - Contacts are shared but conversations are user-specific
  
  3. Indexes
    - Performance indexes on frequently queried columns
*/

-- Create inbox_contacts table
CREATE TABLE IF NOT EXISTS inbox_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  company text,
  role text,
  avatar_url text,
  linkedin_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create inbox_conversations table
CREATE TABLE IF NOT EXISTS inbox_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES inbox_contacts(id) ON DELETE CASCADE,
  platform text NOT NULL DEFAULT 'email' CHECK (platform IN ('email', 'linkedin', 'twitter', 'instagram', 'other')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'closed', 'archived')),
  last_message text,
  last_message_at timestamptz DEFAULT now(),
  unread_count integer NOT NULL DEFAULT 0,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, contact_id, platform)
);

-- Create inbox_messages table
CREATE TABLE IF NOT EXISTS inbox_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES inbox_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'email', 'inmail', 'voice_note')),
  subject text,
  body text NOT NULL,
  voice_note_url text,
  voice_note_duration integer,
  credits_used integer NOT NULL DEFAULT 0,
  sent_at timestamptz DEFAULT now(),
  read_at timestamptz
);

-- Enable RLS
ALTER TABLE inbox_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbox_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbox_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inbox_contacts
-- Contacts can be viewed by any authenticated user (they may be shared across users)
CREATE POLICY "Authenticated users can view contacts"
  ON inbox_contacts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inbox_conversations ic
      WHERE ic.contact_id = inbox_contacts.id
      AND ic.user_id = auth.uid()
    )
  );

-- Users can insert contacts
CREATE POLICY "Authenticated users can create contacts"
  ON inbox_contacts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can update contacts they have conversations with
CREATE POLICY "Users can update contacts they have conversations with"
  ON inbox_contacts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inbox_conversations ic
      WHERE ic.contact_id = inbox_contacts.id
      AND ic.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM inbox_conversations ic
      WHERE ic.contact_id = inbox_contacts.id
      AND ic.user_id = auth.uid()
    )
  );

-- RLS Policies for inbox_conversations
CREATE POLICY "Users can view their own conversations"
  ON inbox_conversations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own conversations"
  ON inbox_conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own conversations"
  ON inbox_conversations
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own conversations"
  ON inbox_conversations
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for inbox_messages
CREATE POLICY "Users can view messages in their conversations"
  ON inbox_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inbox_conversations ic
      WHERE ic.id = inbox_messages.conversation_id
      AND ic.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON inbox_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM inbox_conversations ic
      WHERE ic.id = inbox_messages.conversation_id
      AND ic.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages in their conversations"
  ON inbox_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inbox_conversations ic
      WHERE ic.id = inbox_messages.conversation_id
      AND ic.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM inbox_conversations ic
      WHERE ic.id = inbox_messages.conversation_id
      AND ic.user_id = auth.uid()
    )
  );

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_inbox_conversations_user_id ON inbox_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_inbox_conversations_contact_id ON inbox_conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_inbox_conversations_last_message_at ON inbox_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_inbox_conversations_user_archived ON inbox_conversations(user_id, is_archived);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_conversation_id ON inbox_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_sent_at ON inbox_messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_direction ON inbox_messages(direction);
CREATE INDEX IF NOT EXISTS idx_inbox_contacts_email ON inbox_contacts(email);

-- Function to update conversation on new message
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE inbox_conversations
  SET 
    last_message = LEFT(NEW.body, 200),
    last_message_at = NEW.sent_at,
    unread_count = CASE 
      WHEN NEW.direction = 'inbound' THEN unread_count + 1 
      ELSE unread_count 
    END
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-update conversation
DROP TRIGGER IF EXISTS trigger_update_conversation_on_message ON inbox_messages;
CREATE TRIGGER trigger_update_conversation_on_message
  AFTER INSERT ON inbox_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- Function to update updated_at on contacts
CREATE OR REPLACE FUNCTION update_inbox_contacts_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger for contacts updated_at
DROP TRIGGER IF EXISTS trigger_update_inbox_contacts_updated_at ON inbox_contacts;
CREATE TRIGGER trigger_update_inbox_contacts_updated_at
  BEFORE UPDATE ON inbox_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_inbox_contacts_updated_at();
