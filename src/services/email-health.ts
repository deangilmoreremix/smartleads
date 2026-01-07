import { supabase } from '../lib/supabase';

export interface EmailHealthScore {
  gmail_account_id: string;
  user_id: string;
  health_score: number;
  deliverability_rate: number;
  bounce_rate: number;
  spam_rate: number;
  open_rate: number;
  reply_rate: number;
  total_sent: number;
  total_bounced: number;
  total_spam_reports: number;
  last_calculated_at: string;
}

export interface GmailAccountHealth {
  id: string;
  email: string;
  healthScore: EmailHealthScore | null;
  warmupEnabled: boolean;
  warmupDay: number;
  dailyLimit: number;
  emailsSentToday: number;
  reputationScore: number;
}

export async function getEmailHealthScores(userId: string): Promise<GmailAccountHealth[]> {
  const { data: accounts, error } = await supabase
    .from('gmail_accounts')
    .select(`
      id,
      email,
      warmup_enabled,
      warmup_start_date,
      warmup_daily_increment,
      daily_limit,
      emails_sent_today,
      reputation_score,
      email_health_scores (*)
    `)
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error) throw error;

  return (accounts || []).map((account: any) => {
    const warmupDay = account.warmup_start_date
      ? Math.floor((Date.now() - new Date(account.warmup_start_date).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      id: account.id,
      email: account.email,
      healthScore: account.email_health_scores?.[0] || null,
      warmupEnabled: account.warmup_enabled,
      warmupDay,
      dailyLimit: account.daily_limit,
      emailsSentToday: account.emails_sent_today,
      reputationScore: account.reputation_score || 100,
    };
  });
}

export async function calculateHealthScore(gmailAccountId: string): Promise<number> {
  const { data: account } = await supabase
    .from('gmail_accounts')
    .select('user_id')
    .eq('id', gmailAccountId)
    .single();

  if (!account) throw new Error('Account not found');

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: emails } = await supabase
    .from('emails')
    .select('status')
    .eq('user_id', account.user_id)
    .gte('created_at', thirtyDaysAgo)
    .in('status', ['sent', 'opened', 'replied', 'bounced']);

  const allEmails = emails || [];
  const totalSent = allEmails.length;
  const bounced = allEmails.filter((e: any) => e.status === 'bounced').length;
  const opened = allEmails.filter((e: any) => e.status === 'opened').length;
  const replied = allEmails.filter((e: any) => e.status === 'replied').length;

  const bounceRate = totalSent > 0 ? (bounced / totalSent) * 100 : 0;
  const openRate = totalSent > 0 ? (opened / totalSent) * 100 : 0;
  const replyRate = totalSent > 0 ? (replied / totalSent) * 100 : 0;
  const deliverabilityRate = totalSent > 0 ? ((totalSent - bounced) / totalSent) * 100 : 100;

  let healthScore = 100;
  healthScore -= bounceRate * 2;
  healthScore += Math.min(openRate * 0.5, 15);
  healthScore += Math.min(replyRate * 1, 10);

  healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

  await supabase
    .from('email_health_scores')
    .upsert({
      gmail_account_id: gmailAccountId,
      user_id: account.user_id,
      health_score: healthScore,
      deliverability_rate: deliverabilityRate,
      bounce_rate: bounceRate,
      open_rate: openRate,
      reply_rate: replyRate,
      total_sent: totalSent,
      total_bounced: bounced,
      last_calculated_at: new Date().toISOString(),
    });

  return healthScore;
}

export async function recordBounce(gmailAccountId: string): Promise<void> {
  const { data: account } = await supabase
    .from('gmail_accounts')
    .select('bounce_count, reputation_score')
    .eq('id', gmailAccountId)
    .single();

  if (account) {
    const newBounceCount = (account.bounce_count || 0) + 1;
    const newReputationScore = Math.max(0, (account.reputation_score || 100) - 2);

    await supabase
      .from('gmail_accounts')
      .update({
        bounce_count: newBounceCount,
        reputation_score: newReputationScore,
      })
      .eq('id', gmailAccountId);
  }
}

export async function recordSpamReport(gmailAccountId: string): Promise<void> {
  const { data: account } = await supabase
    .from('gmail_accounts')
    .select('spam_reports, reputation_score')
    .eq('id', gmailAccountId)
    .single();

  if (account) {
    const newSpamReports = (account.spam_reports || 0) + 1;
    const newReputationScore = Math.max(0, (account.reputation_score || 100) - 5);

    await supabase
      .from('gmail_accounts')
      .update({
        spam_reports: newSpamReports,
        reputation_score: newReputationScore,
      })
      .eq('id', gmailAccountId);
  }
}

export async function enableWarmup(gmailAccountId: string, dailyIncrement: number = 2): Promise<void> {
  await supabase
    .from('gmail_accounts')
    .update({
      warmup_enabled: true,
      warmup_start_date: new Date().toISOString().split('T')[0],
      warmup_daily_increment: dailyIncrement,
      daily_limit: 5,
    })
    .eq('id', gmailAccountId);
}

export async function disableWarmup(gmailAccountId: string, finalLimit: number = 50): Promise<void> {
  await supabase
    .from('gmail_accounts')
    .update({
      warmup_enabled: false,
      warmup_start_date: null,
      daily_limit: finalLimit,
    })
    .eq('id', gmailAccountId);
}

export async function updateWarmupLimits(userId: string): Promise<void> {
  const { data: accounts } = await supabase
    .from('gmail_accounts')
    .select('id, warmup_start_date, warmup_daily_increment, daily_limit')
    .eq('user_id', userId)
    .eq('warmup_enabled', true);

  if (!accounts) return;

  const today = new Date();

  for (const account of accounts) {
    if (!account.warmup_start_date) continue;

    const startDate = new Date(account.warmup_start_date);
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const newLimit = Math.min(5 + daysSinceStart * (account.warmup_daily_increment || 2), 100);

    if (newLimit !== account.daily_limit) {
      await supabase
        .from('gmail_accounts')
        .update({ daily_limit: newLimit })
        .eq('id', account.id);
    }

    if (newLimit >= 100) {
      await disableWarmup(account.id, 100);
    }
  }
}

export function getHealthScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-100';
  if (score >= 60) return 'text-yellow-600 bg-yellow-100';
  if (score >= 40) return 'text-orange-600 bg-orange-100';
  return 'text-red-600 bg-red-100';
}

export function getHealthScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}
