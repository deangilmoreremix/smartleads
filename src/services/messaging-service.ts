import { supabase } from '../lib/supabase';
import type { Platform } from '../components/messaging';

export interface InboxContact {
  id: string;
  name: string;
  email?: string;
  company?: string;
  role?: string;
  avatar_url?: string | null;
  linkedin_url?: string | null;
}

export interface InboxConversation {
  id: string;
  user_id: string;
  contact_id: string;
  platform: Platform;
  status: string;
  last_message: string | null;
  last_message_at: string;
  unread_count: number;
  is_archived: boolean;
  created_at: string;
  contact?: InboxContact;
}

export interface InboxMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  direction: 'inbound' | 'outbound';
  message_type: 'text' | 'email' | 'inmail' | 'voice_note';
  subject?: string | null;
  body: string;
  voice_note_url?: string | null;
  voice_note_duration?: number | null;
  credits_used: number;
  sent_at: string;
  read_at?: string | null;
}

interface FetchConversationsOptions {
  platform?: Platform;
  status?: string;
  isArchived?: boolean;
  limit?: number;
  offset?: number;
}

export async function fetchConversations(
  userId: string,
  options: FetchConversationsOptions = {}
): Promise<InboxConversation[]> {
  const { platform, status, isArchived = false, limit = 50, offset = 0 } = options;

  let query = supabase
    .from('inbox_conversations')
    .select(`
      *,
      contact:inbox_contacts(*)
    `)
    .eq('user_id', userId)
    .eq('is_archived', isArchived)
    .order('last_message_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (platform) {
    query = query.eq('platform', platform);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function fetchConversation(conversationId: string): Promise<InboxConversation | null> {
  const { data, error } = await supabase
    .from('inbox_conversations')
    .select(`
      *,
      contact:inbox_contacts(*)
    `)
    .eq('id', conversationId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function fetchMessages(
  conversationId: string,
  limit = 100,
  offset = 0
): Promise<InboxMessage[]> {
  const { data, error } = await supabase
    .from('inbox_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('sent_at', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
}

export async function markConversationRead(conversationId: string): Promise<void> {
  const { error } = await supabase
    .from('inbox_conversations')
    .update({ unread_count: 0 })
    .eq('id', conversationId);

  if (error) throw error;

  await supabase
    .from('inbox_messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .is('read_at', null);
}

interface SendMessageOptions {
  type: 'text' | 'email' | 'inmail' | 'voice_note';
  subject?: string;
  body: string;
  voiceNoteUrl?: string;
  voiceNoteDuration?: number;
}

export async function sendMessage(
  userId: string,
  conversationId: string,
  contactId: string,
  options: SendMessageOptions
): Promise<InboxMessage> {
  const creditsUsed = options.type === 'inmail' ? 1 : 0;

  const { data, error } = await supabase
    .from('inbox_messages')
    .insert({
      conversation_id: conversationId,
      sender_id: userId,
      direction: 'outbound',
      message_type: options.type,
      subject: options.subject,
      body: options.body,
      voice_note_url: options.voiceNoteUrl,
      voice_note_duration: options.voiceNoteDuration,
      credits_used: creditsUsed,
      sent_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  await supabase
    .from('inbox_conversations')
    .update({
      last_message: options.body.substring(0, 200),
      last_message_at: new Date().toISOString(),
    })
    .eq('id', conversationId);

  return data;
}

export function subscribeToConversations(
  userId: string,
  callback: (conversation: InboxConversation) => void
) {
  const channel = supabase
    .channel(`conversations:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'inbox_conversations',
        filter: `user_id=eq.${userId}`,
      },
      async (payload) => {
        if (payload.new) {
          const { data } = await supabase
            .from('inbox_conversations')
            .select(`*, contact:inbox_contacts(*)`)
            .eq('id', (payload.new as InboxConversation).id)
            .maybeSingle();

          if (data) callback(data);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToMessages(
  conversationId: string,
  callback: (message: InboxMessage) => void
) {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'inbox_messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        if (payload.new) {
          callback(payload.new as InboxMessage);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
