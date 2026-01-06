# Critical Production Fixes - Implementation Guide

This document outlines the **critical fixes** needed to make the system 100% production-ready.

---

## 1. Set Environment Variables (5 minutes)

### Supabase Dashboard Steps:

1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/functions
2. Click "Edge Function Secrets"
3. Add these secrets:

```bash
APIFY_API_TOKEN=apify_api_XXXXXXXXXXXXXXXXXXXXXXXXXXXXX
UNIPILE_API_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
OPENAI_API_KEY=sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
UNIPILE_DSN=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX  # Optional for webhook signature validation
```

### Where to Get These Keys:

**APIFY_API_TOKEN:**
- Visit: https://console.apify.com/account/integrations
- Copy your API token

**UNIPILE_API_KEY:**
- Visit: https://unipile.com/dashboard
- Navigate to "API Keys"
- Copy your API key

**OPENAI_API_KEY:**
- Visit: https://platform.openai.com/api-keys
- Create new secret key
- Copy immediately (shown only once)

**UNIPILE_DSN** (Optional):
- Visit: https://unipile.com/dashboard/webhooks
- Copy your DSN for signature validation

---

## 2. Daily Email Counter Reset (10 minutes)

### Option A: Database Cron Job (Recommended)

Create a new migration:

```sql
/*
  # Add Daily Email Counter Reset

  1. New Features
    - Scheduled cron job to reset email counters at midnight UTC
    - Ensures proper account rotation every 24 hours

  2. Security
    - No security impact (internal database operation)
*/

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily reset at midnight UTC
SELECT cron.schedule(
  'reset-daily-email-counters',
  '0 0 * * *',
  $$ UPDATE gmail_accounts SET emails_sent_today = 0 WHERE is_active = true $$
);

-- Optional: Add last_reset_at timestamp for debugging
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gmail_accounts' AND column_name = 'last_reset_at'
  ) THEN
    ALTER TABLE gmail_accounts ADD COLUMN last_reset_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Update the cron job to set last_reset_at
SELECT cron.unschedule('reset-daily-email-counters');
SELECT cron.schedule(
  'reset-daily-email-counters',
  '0 0 * * *',
  $$
    UPDATE gmail_accounts
    SET emails_sent_today = 0, last_reset_at = now()
    WHERE is_active = true
  $$
);
```

**Deploy this migration:**
```bash
# Using Supabase CLI
supabase migration new add_daily_email_reset
# Copy the SQL above into the new migration file
supabase db push
```

### Option B: Edge Function with Scheduled Trigger

If pg_cron is not available, create a scheduled edge function:

**File:** `supabase/functions/reset-daily-counters/index.ts`

```typescript
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data, error } = await supabaseClient
      .from('gmail_accounts')
      .update({
        emails_sent_today: 0,
        last_reset_at: new Date().toISOString()
      })
      .eq('is_active', true)
      .select();

    if (error) throw error;

    console.log(`Reset ${data?.length || 0} Gmail account counters`);

    return new Response(
      JSON.stringify({
        success: true,
        accounts_reset: data?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error resetting counters:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

**Then schedule it using GitHub Actions, Vercel Cron, or similar:**

```yaml
# .github/workflows/daily-reset.yml
name: Reset Email Counters
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC
jobs:
  reset:
    runs-on: ubuntu-latest
    steps:
      - name: Call Reset Function
        run: |
          curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/reset-daily-counters \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}"
```

---

## 3. Unsubscribe Functionality (1-2 hours) - CAN-SPAM Compliance

### Step 1: Database Migration

```sql
/*
  # Add Unsubscribe Functionality

  1. New Tables
    - `unsubscribes` - Tracks unsubscribed email addresses

  2. Security
    - RLS enabled
    - Public insert for unsubscribe form
*/

-- Create unsubscribes table
CREATE TABLE IF NOT EXISTS unsubscribes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  unsubscribed_at timestamptz DEFAULT now(),
  reason text,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_unsubscribes_email ON unsubscribes(email);
CREATE INDEX IF NOT EXISTS idx_unsubscribes_user_id ON unsubscribes(user_id);

-- Enable RLS
ALTER TABLE unsubscribes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to unsubscribe (public form)
CREATE POLICY "Anyone can unsubscribe"
  ON unsubscribes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Users can view their own unsubscribes
CREATE POLICY "Users can view own unsubscribes"
  ON unsubscribes FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
```

### Step 2: Edge Function

**File:** `supabase/functions/unsubscribe/index.ts`

```typescript
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const url = new URL(req.url);
    const email = url.searchParams.get('email');
    const campaignId = url.searchParams.get('campaign_id');

    if (!email) {
      throw new Error('Email address required');
    }

    const ipAddress = req.headers.get('x-forwarded-for') ||
                     req.headers.get('x-real-ip') ||
                     'unknown';

    const { error } = await supabaseClient
      .from('unsubscribes')
      .insert({
        email: email.toLowerCase(),
        campaign_id: campaignId || null,
        ip_address: ipAddress,
        reason: url.searchParams.get('reason') || null,
      });

    if (error && !error.message.includes('duplicate')) {
      throw error;
    }

    // Return HTML page
    return new Response(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Unsubscribed Successfully</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 600px;
            margin: 100px auto;
            padding: 40px;
            text-align: center;
            background: #f9fafb;
          }
          .card {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          h1 { color: #10b981; margin-bottom: 16px; }
          p { color: #6b7280; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>✓ Unsubscribed Successfully</h1>
          <p>You've been removed from our mailing list.</p>
          <p>Email: <strong>${email}</strong></p>
          <p style="margin-top: 32px; font-size: 14px;">
            You will no longer receive emails from us.
          </p>
        </div>
      </body>
      </html>
      `,
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html',
        },
      }
    );
  } catch (error: any) {
    return new Response(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Error</title>
      </head>
      <body>
        <h1>Error</h1>
        <p>${error.message}</p>
      </body>
      </html>
      `,
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
      }
    );
  }
});
```

### Step 3: Update Email Template

**Modify:** `supabase/functions/send-emails/index.ts`

Add unsubscribe link to all emails:

```typescript
// Around line 226, update the htmlBody generation:
const unsubscribeUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/unsubscribe?email=${encodeURIComponent(to)}&campaign_id=${email.campaign_id}`;

const htmlBody = body.includes('<html') ? body : `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    p { margin-bottom: 16px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
    .unsubscribe { color: #9ca3af; text-decoration: none; }
    .unsubscribe:hover { text-decoration: underline; }
  </style>
</head>
<body>
  ${body.split('\n').map(line => `<p>${line}</p>`).join('\n')}
  <div class="footer">
    <p>
      <a href="${unsubscribeUrl}" class="unsubscribe">Unsubscribe from these emails</a>
    </p>
  </div>
</body>
</html>
`.trim();
```

### Step 4: Check Before Sending

**Modify:** `supabase/functions/send-emails/index.ts`

Before sending each email, check unsubscribe list:

```typescript
// Around line 94, add this check:
const { data: isUnsubscribed } = await supabaseClient
  .from('unsubscribes')
  .select('id')
  .eq('email', email.leads.email.toLowerCase())
  .maybeSingle();

if (isUnsubscribed) {
  console.log(`Skipping ${email.leads.email} - unsubscribed`);

  await supabaseClient
    .from('emails')
    .update({
      status: 'skipped',
      error_message: 'Recipient unsubscribed'
    })
    .eq('id', email.id);

  continue;
}
```

---

## 4. Configure Unipile Webhook (5 minutes)

1. Login to Unipile dashboard: https://unipile.com/dashboard
2. Navigate to "Webhooks"
3. Add webhook URL:
   ```
   https://YOUR_PROJECT.supabase.co/functions/v1/unipile-webhook
   ```
4. Subscribe to these events:
   - email.delivered
   - email.opened
   - email.clicked
   - email.replied
   - email.bounced
   - email.spam
   - email.failed
5. Save webhook configuration

---

## 5. Test Complete Workflow (30 minutes)

### Test Checklist:

- [ ] **Create Campaign**
  - Go to "New Campaign"
  - Enter niche & location
  - Configure Apify settings
  - Click "Create Campaign"

- [ ] **Connect Gmail Account**
  - Go to "Accounts"
  - Click "Connect Gmail Account"
  - Complete OAuth flow
  - Verify account appears as "Active"

- [ ] **Scrape Leads**
  - Open campaign detail page
  - Click "Scrape Leads"
  - Wait 10-15 minutes
  - Verify leads appear in table
  - Check for contacts, social profiles, reviews

- [ ] **Generate Emails**
  - Click "Generate Emails"
  - Wait 2-5 minutes
  - Preview generated emails
  - Verify personalization quality

- [ ] **Send Emails**
  - Click "Send Emails"
  - Monitor progress
  - Verify emails sent successfully
  - Check Gmail sent folder

- [ ] **Verify Tracking**
  - Open one of the sent emails
  - Verify "opened" event appears in dashboard
  - Click a link in email
  - Verify "clicked" event appears

- [ ] **Test Unsubscribe**
  - Click unsubscribe link in email
  - Verify unsubscribe page loads
  - Try sending to that email again
  - Verify it's skipped

- [ ] **Test Daily Reset**
  - Wait 24 hours OR manually trigger reset
  - Verify `emails_sent_today` resets to 0
  - Verify `last_reset_at` updates

---

## Summary

After completing these 5 steps:

1. ✅ Environment variables configured
2. ✅ Daily counter reset automated
3. ✅ Unsubscribe functionality added
4. ✅ Webhook configured
5. ✅ End-to-end testing completed

**Your system will be 100% production-ready!**

---

## Optional Enhancements

### A. Bundle Size Optimization

Update `vite.config.ts`:

```typescript
export default defineConfig({
  // ... existing config
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'react-hot-toast'],
          'supabase': ['@supabase/supabase-js'],
        }
      }
    }
  }
});
```

### B. Error Monitoring

Add Sentry or similar:

```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.MODE,
});
```

### C. Rate Limiting

Add rate limiting to edge functions:

```typescript
// Rate limit helper
const rateLimits = new Map();

function checkRateLimit(userId: string, limit: number = 10): boolean {
  const now = Date.now();
  const userLimits = rateLimits.get(userId) || [];
  const recentRequests = userLimits.filter(time => now - time < 60000);

  if (recentRequests.length >= limit) {
    return false;
  }

  recentRequests.push(now);
  rateLimits.set(userId, recentRequests);
  return true;
}
```

---

## Support

If you encounter issues during implementation:

1. Check Supabase logs: Dashboard → Edge Functions → Logs
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Ensure Unipile webhook URL is configured
5. Test Apify API token with a simple API call

**System is ready for production once these fixes are applied!**
