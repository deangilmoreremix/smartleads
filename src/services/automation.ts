import { supabase } from '../lib/supabase';

const EDGE_FUNCTION_BASE = import.meta.env.VITE_SUPABASE_URL + '/functions/v1';

export interface ScrapeLeadsParams {
  campaignId: string;
  niche: string;
  location: string;
  maxResults?: number;
  apifySettings?: any;
}

export interface GenerateEmailsParams {
  campaignId: string;
  leadIds?: string[];
  template?: string;
}

export interface SendEmailsParams {
  campaignId: string;
  emailIds?: string[];
  sendImmediately?: boolean;
}

export async function scrapeGoogleMapsLeads(params: ScrapeLeadsParams) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetch(`${EDGE_FUNCTION_BASE}/scrape-google-maps`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to scrape leads');
  }

  return response.json();
}

export async function generateAIEmails(params: GenerateEmailsParams) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetch(`${EDGE_FUNCTION_BASE}/generate-ai-emails`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate emails');
  }

  return response.json();
}

export async function sendEmails(params: SendEmailsParams) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetch(`${EDGE_FUNCTION_BASE}/send-emails`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send emails');
  }

  return response.json();
}

export async function getCampaignJobs(campaignId: string) {
  const { data, error } = await supabase
    .from('campaign_jobs')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getJobStatus(jobId: string) {
  const { data, error } = await supabase
    .from('campaign_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) throw error;
  return data;
}

export async function startAutomatedCampaign(campaignId: string, niche: string, location: string) {
  console.log('Starting automated campaign:', campaignId);

  const scrapeResult = await scrapeGoogleMapsLeads({
    campaignId,
    niche,
    location,
    maxResults: 50,
  });

  console.log('Scraping completed:', scrapeResult);

  const generateResult = await generateAIEmails({
    campaignId,
  });

  console.log('Email generation completed:', generateResult);

  await supabase
    .from('campaigns')
    .update({
      automation_enabled: true,
      status: 'active',
      launched_at: new Date().toISOString(),
    })
    .eq('id', campaignId);

  return {
    scrapeResult,
    generateResult,
  };
}
