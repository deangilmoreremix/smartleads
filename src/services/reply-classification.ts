import { supabase } from '../lib/supabase';

export type ReplyClassification =
  | 'interested'
  | 'not_interested'
  | 'unsubscribe'
  | 'out_of_office'
  | 'question'
  | 'meeting_request'
  | 'other';

export interface ClassifiedReply {
  id: string;
  user_id: string;
  email_id: string | null;
  lead_id: string;
  campaign_id: string | null;
  classification: ReplyClassification;
  confidence_score: number;
  reply_text: string | null;
  reply_subject: string | null;
  ai_analysis: Record<string, any>;
  is_reviewed: boolean;
  reviewed_at: string | null;
  created_at: string;
}

export interface ClassificationResult {
  classification: ReplyClassification;
  confidence: number;
  keywords: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
}

const CLASSIFICATION_PATTERNS: Record<ReplyClassification, { keywords: string[]; weight: number }> = {
  interested: {
    keywords: [
      'interested', 'tell me more', 'sounds good', 'yes', 'let\'s talk', 'schedule a call',
      'send more info', 'curious', 'would like to learn', 'please contact', 'looking forward',
      'available', 'free to chat', 'set up a meeting', 'demo', 'pricing', 'cost',
    ],
    weight: 1.0,
  },
  meeting_request: {
    keywords: [
      'schedule', 'meeting', 'call', 'zoom', 'google meet', 'calendar', 'appointment',
      'book a time', 'let\'s meet', 'free tomorrow', 'available this week', 'hop on a call',
    ],
    weight: 1.0,
  },
  not_interested: {
    keywords: [
      'not interested', 'no thanks', 'no thank you', 'don\'t contact', 'stop emailing',
      'not looking', 'already have', 'not for us', 'pass', 'decline', 'not right now',
      'not a fit', 'not relevant', 'remove me', 'do not contact',
    ],
    weight: 1.0,
  },
  unsubscribe: {
    keywords: [
      'unsubscribe', 'remove from list', 'stop sending', 'opt out', 'take me off',
      'don\'t email me', 'spam', 'block', 'remove my email', 'delete my contact',
    ],
    weight: 1.2,
  },
  out_of_office: {
    keywords: [
      'out of office', 'ooo', 'on vacation', 'away', 'limited access', 'returning',
      'automatic reply', 'auto-reply', 'will be back', 'currently out', 'on leave',
      'not in the office', 'holiday', 'traveling',
    ],
    weight: 1.0,
  },
  question: {
    keywords: [
      '?', 'what is', 'how does', 'can you explain', 'could you', 'wondering',
      'question about', 'more information', 'clarify', 'what do you mean',
    ],
    weight: 0.8,
  },
  other: {
    keywords: [],
    weight: 0.5,
  },
};

export function classifyReply(subject: string, body: string): ClassificationResult {
  const text = `${subject} ${body}`.toLowerCase();
  const scores: Record<ReplyClassification, number> = {
    interested: 0,
    meeting_request: 0,
    not_interested: 0,
    unsubscribe: 0,
    out_of_office: 0,
    question: 0,
    other: 0,
  };

  const foundKeywords: string[] = [];

  for (const [classification, { keywords, weight }] of Object.entries(CLASSIFICATION_PATTERNS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        scores[classification as ReplyClassification] += weight;
        foundKeywords.push(keyword);
      }
    }
  }

  let maxScore = 0;
  let bestClassification: ReplyClassification = 'other';

  for (const [classification, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestClassification = classification as ReplyClassification;
    }
  }

  const totalKeywords = foundKeywords.length;
  const confidence = totalKeywords > 0 ? Math.min(maxScore / (totalKeywords * 0.5), 1) : 0.3;

  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (['interested', 'meeting_request'].includes(bestClassification)) {
    sentiment = 'positive';
  } else if (['not_interested', 'unsubscribe'].includes(bestClassification)) {
    sentiment = 'negative';
  }

  return {
    classification: bestClassification,
    confidence: Math.round(confidence * 100) / 100,
    keywords: foundKeywords,
    sentiment,
  };
}

export async function saveReplyClassification(
  userId: string,
  leadId: string,
  emailId: string | null,
  campaignId: string | null,
  replySubject: string,
  replyText: string
): Promise<ClassifiedReply> {
  const result = classifyReply(replySubject, replyText);

  const { data, error } = await supabase
    .from('reply_classifications')
    .insert({
      user_id: userId,
      lead_id: leadId,
      email_id: emailId,
      campaign_id: campaignId,
      classification: result.classification,
      confidence_score: result.confidence,
      reply_subject: replySubject,
      reply_text: replyText,
      ai_analysis: {
        keywords: result.keywords,
        sentiment: result.sentiment,
      },
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getReplyClassifications(
  userId: string,
  campaignId?: string,
  classification?: ReplyClassification
): Promise<ClassifiedReply[]> {
  let query = supabase
    .from('reply_classifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (campaignId) {
    query = query.eq('campaign_id', campaignId);
  }

  if (classification) {
    query = query.eq('classification', classification);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function updateClassification(
  replyId: string,
  classification: ReplyClassification
): Promise<void> {
  const { error } = await supabase
    .from('reply_classifications')
    .update({
      classification,
      is_reviewed: true,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', replyId);

  if (error) throw error;
}

export async function handleReplyReceived(
  userId: string,
  leadId: string,
  emailId: string | null,
  campaignId: string | null,
  replySubject: string,
  replyText: string,
  autoPauseOnReply: boolean = true
): Promise<ClassifiedReply> {
  const classified = await saveReplyClassification(
    userId,
    leadId,
    emailId,
    campaignId,
    replySubject,
    replyText
  );

  await supabase
    .from('leads')
    .update({
      has_replied: true,
      replied_at: new Date().toISOString(),
      pipeline_stage: 'replied',
      pipeline_stage_changed_at: new Date().toISOString(),
    })
    .eq('id', leadId);

  if (emailId) {
    await supabase
      .from('emails')
      .update({
        status: 'replied',
        replied_at: new Date().toISOString(),
      })
      .eq('id', emailId);
  }

  if (classified.classification === 'unsubscribe') {
    const { data: lead } = await supabase
      .from('leads')
      .select('email')
      .eq('id', leadId)
      .single();

    if (lead?.email) {
      await supabase.from('unsubscribes').upsert({
        email: lead.email.toLowerCase().trim(),
        campaign_id: campaignId,
        reason: 'reply_requested',
      });
    }
  }

  if (autoPauseOnReply) {
    await supabase
      .from('email_sequences')
      .update({ status: 'paused' })
      .eq('lead_id', leadId);
  }

  return classified;
}

export async function getClassificationStats(
  userId: string,
  campaignId?: string
): Promise<Record<ReplyClassification, number>> {
  let query = supabase
    .from('reply_classifications')
    .select('classification')
    .eq('user_id', userId);

  if (campaignId) {
    query = query.eq('campaign_id', campaignId);
  }

  const { data, error } = await query;

  if (error) throw error;

  const stats: Record<ReplyClassification, number> = {
    interested: 0,
    meeting_request: 0,
    not_interested: 0,
    unsubscribe: 0,
    out_of_office: 0,
    question: 0,
    other: 0,
  };

  for (const row of data || []) {
    stats[row.classification as ReplyClassification]++;
  }

  return stats;
}

export function getClassificationColor(classification: ReplyClassification): string {
  const colors: Record<ReplyClassification, string> = {
    interested: 'text-green-600 bg-green-100',
    meeting_request: 'text-blue-600 bg-blue-100',
    not_interested: 'text-red-600 bg-red-100',
    unsubscribe: 'text-gray-600 bg-gray-100',
    out_of_office: 'text-yellow-600 bg-yellow-100',
    question: 'text-cyan-600 bg-cyan-100',
    other: 'text-stone-600 bg-stone-100',
  };
  return colors[classification];
}

export function getClassificationLabel(classification: ReplyClassification): string {
  const labels: Record<ReplyClassification, string> = {
    interested: 'Interested',
    meeting_request: 'Meeting Request',
    not_interested: 'Not Interested',
    unsubscribe: 'Unsubscribe',
    out_of_office: 'Out of Office',
    question: 'Question',
    other: 'Other',
  };
  return labels[classification];
}
