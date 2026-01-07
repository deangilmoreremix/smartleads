import { supabase } from '../lib/supabase';

export interface SendingWindow {
  startHour: number;
  endHour: number;
  timezone: string;
  businessDaysOnly: boolean;
}

export interface OptimalSendTime {
  hour: number;
  minute: number;
  dayOfWeek: number;
  score: number;
}

const TIMEZONE_MAP: Record<string, string[]> = {
  'America/New_York': ['NY', 'New York', 'NYC', 'NJ', 'New Jersey', 'PA', 'Pennsylvania', 'CT', 'Connecticut', 'MA', 'Massachusetts', 'FL', 'Florida', 'GA', 'Georgia'],
  'America/Chicago': ['IL', 'Illinois', 'Chicago', 'TX', 'Texas', 'Houston', 'Dallas', 'MN', 'Minnesota', 'WI', 'Wisconsin', 'MO', 'Missouri'],
  'America/Denver': ['CO', 'Colorado', 'Denver', 'AZ', 'Arizona', 'Phoenix', 'UT', 'Utah', 'NM', 'New Mexico'],
  'America/Los_Angeles': ['CA', 'California', 'Los Angeles', 'San Francisco', 'WA', 'Washington', 'Seattle', 'OR', 'Oregon', 'NV', 'Nevada'],
  'America/Anchorage': ['AK', 'Alaska'],
  'Pacific/Honolulu': ['HI', 'Hawaii'],
  'Europe/London': ['UK', 'United Kingdom', 'England', 'London', 'GB', 'Britain'],
  'Europe/Paris': ['France', 'Paris', 'Germany', 'Berlin', 'Italy', 'Rome', 'Spain', 'Madrid'],
  'Asia/Tokyo': ['Japan', 'Tokyo'],
  'Asia/Shanghai': ['China', 'Shanghai', 'Beijing'],
  'Australia/Sydney': ['Australia', 'Sydney', 'Melbourne'],
};

export function detectTimezone(address: string | null): string {
  if (!address) return 'America/New_York';

  const normalizedAddress = address.toLowerCase();

  for (const [timezone, keywords] of Object.entries(TIMEZONE_MAP)) {
    for (const keyword of keywords) {
      if (normalizedAddress.includes(keyword.toLowerCase())) {
        return timezone;
      }
    }
  }

  return 'America/New_York';
}

export function isWithinSendingWindow(
  window: SendingWindow,
  targetTimezone: string = 'America/New_York'
): boolean {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: targetTimezone,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
    weekday: 'short',
  });

  const parts = formatter.formatToParts(now);
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
  const weekday = parts.find(p => p.type === 'weekday')?.value || '';

  if (window.businessDaysOnly) {
    const weekendDays = ['Sat', 'Sun'];
    if (weekendDays.includes(weekday)) {
      return false;
    }
  }

  return hour >= window.startHour && hour < window.endHour;
}

export function getNextSendTime(
  window: SendingWindow,
  targetTimezone: string = 'America/New_York'
): Date {
  const now = new Date();

  const targetTime = new Date(now.toLocaleString('en-US', { timeZone: targetTimezone }));
  const currentHour = targetTime.getHours();
  const currentDay = targetTime.getDay();

  let nextSendTime = new Date(targetTime);

  if (currentHour >= window.endHour) {
    nextSendTime.setDate(nextSendTime.getDate() + 1);
    nextSendTime.setHours(window.startHour, 0, 0, 0);
  } else if (currentHour < window.startHour) {
    nextSendTime.setHours(window.startHour, 0, 0, 0);
  }

  if (window.businessDaysOnly) {
    const dayOfWeek = nextSendTime.getDay();
    if (dayOfWeek === 0) {
      nextSendTime.setDate(nextSendTime.getDate() + 1);
    } else if (dayOfWeek === 6) {
      nextSendTime.setDate(nextSendTime.getDate() + 2);
    }
  }

  return nextSendTime;
}

export async function updateLeadTimezones(campaignId: string): Promise<number> {
  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, address')
    .eq('campaign_id', campaignId)
    .is('timezone', null);

  if (error) throw error;
  if (!leads) return 0;

  let updated = 0;

  for (const lead of leads) {
    const timezone = detectTimezone(lead.address);
    const { error: updateError } = await supabase
      .from('leads')
      .update({ timezone })
      .eq('id', lead.id);

    if (!updateError) updated++;
  }

  return updated;
}

export function calculateOptimalSendTime(
  openData: { hour: number; opens: number }[]
): OptimalSendTime {
  if (openData.length === 0) {
    return { hour: 10, minute: 0, dayOfWeek: 2, score: 50 };
  }

  let bestHour = 10;
  let maxOpens = 0;

  for (const data of openData) {
    if (data.opens > maxOpens) {
      maxOpens = data.opens;
      bestHour = data.hour;
    }
  }

  const totalOpens = openData.reduce((sum, d) => sum + d.opens, 0);
  const score = totalOpens > 0 ? Math.round((maxOpens / totalOpens) * 100) : 50;

  return {
    hour: bestHour,
    minute: Math.floor(Math.random() * 30),
    dayOfWeek: 2,
    score,
  };
}

export async function getSendingScheduleSettings(userId: string): Promise<SendingWindow> {
  const { data: settings } = await supabase
    .from('user_settings')
    .select('send_window_start, send_window_end, default_timezone, business_days_only')
    .eq('user_id', userId)
    .maybeSingle();

  if (settings) {
    return {
      startHour: parseInt(settings.send_window_start?.split(':')[0] || '9'),
      endHour: parseInt(settings.send_window_end?.split(':')[0] || '17'),
      timezone: settings.default_timezone || 'America/New_York',
      businessDaysOnly: settings.business_days_only ?? true,
    };
  }

  return {
    startHour: 9,
    endHour: 17,
    timezone: 'America/New_York',
    businessDaysOnly: true,
  };
}

export async function updateSendingScheduleSettings(
  userId: string,
  window: Partial<SendingWindow>
): Promise<void> {
  const updates: any = {};

  if (window.startHour !== undefined) {
    updates.send_window_start = `${window.startHour.toString().padStart(2, '0')}:00:00`;
  }
  if (window.endHour !== undefined) {
    updates.send_window_end = `${window.endHour.toString().padStart(2, '0')}:00:00`;
  }
  if (window.timezone !== undefined) {
    updates.default_timezone = window.timezone;
  }
  if (window.businessDaysOnly !== undefined) {
    updates.business_days_only = window.businessDaysOnly;
  }

  await supabase
    .from('user_settings')
    .update(updates)
    .eq('user_id', userId);
}

export function formatTimeForTimezone(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function getTimezoneOffset(timezone: string): number {
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  const tzTime = new Date(utcTime).toLocaleString('en-US', { timeZone: timezone });
  const tzDate = new Date(tzTime);
  return (tzDate.getTime() - utcTime) / (1000 * 60 * 60);
}
