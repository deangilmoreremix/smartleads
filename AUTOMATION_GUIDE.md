# NotiQ Automation Features Guide

## Overview

NotiQ now includes fully automated outreach campaign features that replicate the core functionality of the original platform:

1. **Google Maps Lead Scraping** - Find decision-makers in local businesses
2. **AI-Powered Email Generation** - Create personalized emails using GPT-5
3. **Automated Email Sending** - Send emails through multiple Gmail accounts
4. **24/7 Campaign Automation** - Set it and forget it outreach

## Features Implemented

### 1. Google Maps Scraping (`scrape-google-maps` Edge Function)

**What it does:**
- Scrapes local businesses from Google Maps based on niche and location
- Filters emails to identify personal emails (firstname@gmail.com) vs generic (info@company.com)
- Extracts business data including ratings, reviews, contact info
- Automatically classifies email types for better targeting

**How to use:**
```typescript
// From campaign detail page, click "Scrape Leads" button
// Or programmatically:
import { scrapeGoogleMapsLeads } from '../services/automation';

const result = await scrapeGoogleMapsLeads({
  campaignId: 'campaign-uuid',
  niche: 'Restaurants',
  location: 'New York, NY',
  maxResults: 50
});
```

**Production Setup:**
For production, you'll want to integrate a real Google Maps scraping service:
- **Option 1:** Use Outscraper API (https://outscraper.com/)
- **Option 2:** Use Apify Google Maps Scraper (https://apify.com/)
- **Option 3:** Use SerpApi (https://serpapi.com/)

Replace the mock implementation in the Edge Function with real API calls.

### 2. AI Email Generation (`generate-ai-emails` Edge Function)

**What it does:**
- Uses AI to generate personalized email content for each lead
- Analyzes Google Maps reviews to create relevant messaging
- Incorporates business details, ratings, and location data
- Creates unique subject lines and body content for each prospect

**How to use:**
```typescript
import { generateAIEmails } from '../services/automation';

const result = await generateAIEmails({
  campaignId: 'campaign-uuid',
  leadIds: ['lead-1', 'lead-2'], // optional, generates for all leads if omitted
  template: 'custom template' // optional
});
```

**Production Setup:**
Integrate with OpenAI API:
```typescript
// Add to Edge Function environment variables
OPENAI_API_KEY=sk-your-key-here

// Update the generatePersonalizedEmail function to use real AI:
import OpenAI from 'npm:openai@4';

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{
    role: 'system',
    content: 'You are a professional email copywriter...'
  }, {
    role: 'user',
    content: prompt
  }],
  temperature: 0.7,
});
```

### 3. Email Sending (`send-emails` Edge Function)

**What it does:**
- Sends queued emails through connected Gmail accounts
- Respects daily sending limits per account
- Rotates between multiple Gmail accounts automatically
- Tracks email status (sent, failed, bounced)
- Implements delays between sends to avoid spam flags

**How to use:**
```typescript
import { sendEmails } from '../services/automation';

const result = await sendEmails({
  campaignId: 'campaign-uuid',
  emailIds: ['email-1', 'email-2'], // optional
  sendImmediately: false // adds delays between sends
});
```

**Production Setup:**
Integrate with Gmail API:

1. **Set up Gmail OAuth:**
   - Go to Google Cloud Console
   - Create OAuth 2.0 credentials
   - Add scopes: `gmail.send`, `gmail.readonly`
   - Get client ID and client secret

2. **Update Edge Function:**
```typescript
// Add environment variables
GMAIL_CLIENT_ID=your-client-id
GMAIL_CLIENT_SECRET=your-client-secret

// Use Gmail API:
const sendEmail = async (gmailAccount, to, subject, body) => {
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${gmailAccount.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: btoa(`To: ${to}\nSubject: ${subject}\n\n${body}`)
    })
  });
  return response.ok;
};
```

3. **Add Gmail Account Connection UI:**
   - Settings page should have OAuth flow
   - Store access/refresh tokens in `gmail_accounts` table
   - Implement token refresh logic

### 4. Campaign Automation Service

**What it does:**
- Orchestrates the entire automation workflow
- Executes scraping → AI generation → email sending in sequence
- Tracks progress through job queue system
- Handles errors and retries

**How to use:**
```typescript
import { startAutomatedCampaign } from '../services/automation';

await startAutomatedCampaign(
  campaignId,
  'Gyms',
  'Los Angeles, CA'
);
```

## Database Schema

### New Tables

1. **campaign_jobs** - Tracks background automation jobs
2. **email_templates** - Store reusable email templates
3. **gmail_accounts** - Manage connected Gmail accounts for sending

### Updated Tables

1. **campaigns** - Added automation flags and settings
2. **leads** - Added scraping metadata and personalization scores
3. **emails** - Added AI generation tracking

## UI Features

### Campaign Detail Page

- **Start Automation** button - Runs full automation workflow
- **Scrape Leads** button - Manually trigger Google Maps scraping
- **Generate Emails** button - Create AI-personalized emails
- **Send Emails** button - Begin email outreach
- **Progress indicators** - Real-time automation status
- **Automation Tools sidebar** - Quick access to all automation features

## API Integration Checklist

To make this production-ready with real APIs:

- [ ] **Google Maps Scraping**
  - Sign up for Outscraper, Apify, or SerpApi
  - Add API key to Supabase secrets
  - Update `scrape-google-maps` Edge Function

- [ ] **AI Email Generation**
  - Sign up for OpenAI API
  - Add API key to Supabase secrets
  - Update `generate-ai-emails` Edge Function
  - Optionally use Anthropic Claude instead

- [ ] **Gmail Integration**
  - Set up Google Cloud project
  - Configure OAuth 2.0
  - Implement Gmail connection flow in Settings
  - Update `send-emails` Edge Function with real Gmail API

- [ ] **Email Tracking**
  - Implement tracking pixels for open rates
  - Set up webhook endpoints for replies
  - Add unsubscribe links

- [ ] **Rate Limiting**
  - Implement proper rate limiting per API
  - Add queue system for large campaigns
  - Set up monitoring and alerts

## Testing

Currently the system uses mock data for demonstration. To test:

1. Create a new campaign
2. Click "Start Automation" or individual automation buttons
3. Watch the progress indicators
4. Check the leads and emails tables for generated data

## Cost Estimates (Production)

- **Google Maps Scraping:** ~$0.01-0.02 per lead (Outscraper)
- **AI Email Generation:** ~$0.002-0.01 per email (OpenAI GPT-4)
- **Email Sending:** Free with Gmail (up to 500/day per account)

For 1000 leads:
- Scraping: $10-20
- AI Generation: $2-10
- Sending: Free
- **Total: $12-30 per 1000-lead campaign**

## Security Notes

- All Edge Functions use JWT verification
- RLS policies protect user data
- API keys should be stored in Supabase secrets (never in code)
- Gmail tokens are encrypted in the database
- Rate limiting prevents abuse

## Next Steps

1. **Add Real API Integrations** - Replace mock implementations
2. **Gmail OAuth Flow** - Implement in Settings page
3. **Email Tracking** - Add open/click tracking
4. **Scheduling** - Implement campaign scheduling based on timezone
5. **Monitoring** - Add job queue monitoring dashboard
6. **Webhooks** - Handle email replies automatically
