import { supabase } from '../lib/supabase';

export interface ReplyInfo {
  emailId: string;
  leadId: string;
  campaignId: string;
  replyText: string;
  repliedAt: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export async function handleReplyDetected(replyInfo: ReplyInfo): Promise<void> {
  const { leadId, campaignId, repliedAt } = replyInfo;

  await supabase
    .from('leads')
    .update({
      has_replied: true,
      replied_at: repliedAt,
      status: 'replied',
    })
    .eq('id', leadId);

  await pauseLeadSequence(leadId, 'Lead replied to email');

  await supabase
    .from('emails')
    .update({
      status: 'replied',
      replied_at: repliedAt,
    })
    .eq('id', replyInfo.emailId);

  await supabase.from('analytics_events').insert({
    user_id: (await supabase.auth.getUser()).data.user?.id,
    campaign_id: campaignId,
    lead_id: leadId,
    email_id: replyInfo.emailId,
    event_type: 'email_replied',
    event_data: {
      replied_at: repliedAt,
      sentiment: replyInfo.sentiment || 'neutral',
    },
  });

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('emails_replied')
    .eq('id', campaignId)
    .maybeSingle();

  if (campaign) {
    await supabase
      .from('campaigns')
      .update({
        emails_replied: (campaign.emails_replied || 0) + 1,
      })
      .eq('id', campaignId);
  }
}

export async function pauseLeadSequence(
  leadId: string,
  reason: string
): Promise<{ success: boolean; message: string }> {
  const { data: progress, error } = await supabase
    .from('lead_sequence_progress')
    .select('*')
    .eq('lead_id', leadId)
    .maybeSingle();

  if (error) {
    return { success: false, message: 'Failed to find sequence progress' };
  }

  if (!progress) {
    return { success: false, message: 'No active sequence for this lead' };
  }

  if (progress.is_paused) {
    return { success: true, message: 'Sequence already paused' };
  }

  const { error: updateError } = await supabase
    .from('lead_sequence_progress')
    .update({
      is_paused: true,
      pause_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq('lead_id', leadId);

  if (updateError) {
    return { success: false, message: 'Failed to pause sequence' };
  }

  return { success: true, message: 'Sequence paused successfully' };
}

export async function resumeLeadSequence(leadId: string): Promise<{
  success: boolean;
  message: string;
}> {
  const { data: progress, error } = await supabase
    .from('lead_sequence_progress')
    .select('*')
    .eq('lead_id', leadId)
    .maybeSingle();

  if (error || !progress) {
    return { success: false, message: 'Sequence not found' };
  }

  if (!progress.is_paused) {
    return { success: true, message: 'Sequence is not paused' };
  }

  const nextSendDate = new Date();
  nextSendDate.setDate(nextSendDate.getDate() + 1);

  const { error: updateError } = await supabase
    .from('lead_sequence_progress')
    .update({
      is_paused: false,
      pause_reason: null,
      next_send_date: nextSendDate.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('lead_id', leadId);

  if (updateError) {
    return { success: false, message: 'Failed to resume sequence' };
  }

  return { success: true, message: 'Sequence resumed successfully' };
}

export async function bulkPauseSequences(
  leadIds: string[],
  reason: string
): Promise<{
  successCount: number;
  failCount: number;
}> {
  let successCount = 0;
  let failCount = 0;

  for (const leadId of leadIds) {
    const result = await pauseLeadSequence(leadId, reason);
    if (result.success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  return { successCount, failCount };
}

export async function detectReplyFromUnipileWebhook(webhookData: any): Promise<ReplyInfo | null> {
  const { type, object } = webhookData;

  if (type !== 'MESSAGING.MESSAGE.CREATED') {
    return null;
  }

  const message = object;

  if (!message.is_from_me) {
    const { data: sentEmail } = await supabase
      .from('emails')
      .select(
        `
        id,
        lead_id,
        campaign_id,
        leads (
          id,
          email
        )
      `
      )
      .eq('unipile_message_id', message.in_reply_to || message.thread_id)
      .maybeSingle();

    if (sentEmail) {
      return {
        emailId: sentEmail.id,
        leadId: sentEmail.lead_id,
        campaignId: sentEmail.campaign_id,
        replyText: message.body?.text || message.body?.html || '',
        repliedAt: message.created_at || new Date().toISOString(),
        sentiment: analyzeSentiment(message.body?.text || message.body?.html || ''),
      };
    }
  }

  return null;
}

function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const lowerText = text.toLowerCase();

  const positiveKeywords = [
    'interested',
    'yes',
    'sounds good',
    'tell me more',
    'schedule',
    'meeting',
    'call',
    'thanks',
    'thank you',
    'appreciate',
    'great',
    'perfect',
  ];

  const negativeKeywords = [
    'not interested',
    'no thanks',
    'unsubscribe',
    'stop',
    'remove',
    'spam',
    'never',
    'don\'t contact',
    'do not contact',
  ];

  const positiveMatches = positiveKeywords.filter((keyword) => lowerText.includes(keyword)).length;
  const negativeMatches = negativeKeywords.filter((keyword) => lowerText.includes(keyword)).length;

  if (negativeMatches > positiveMatches) {
    return 'negative';
  } else if (positiveMatches > negativeMatches) {
    return 'positive';
  }

  return 'neutral';
}

export async function getPausedSequences(userId: string): Promise<Array<{
  leadId: string;
  businessName: string;
  campaignName: string;
  pauseReason: string;
  pausedAt: string;
}>> {
  const { data, error } = await supabase
    .from('lead_sequence_progress')
    .select(
      `
      lead_id,
      pause_reason,
      updated_at,
      leads (
        id,
        business_name,
        campaigns (
          id,
          name
        )
      )
    `
    )
    .eq('is_paused', true)
    .order('updated_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((item: any) => ({
    leadId: item.lead_id,
    businessName: item.leads?.business_name || 'Unknown',
    campaignName: item.leads?.campaigns?.name || 'Unknown',
    pauseReason: item.pause_reason || 'No reason provided',
    pausedAt: item.updated_at,
  }));
}
