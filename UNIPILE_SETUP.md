# Unipile Integration Setup Guide

This guide will walk you through setting up Unipile for real Gmail email sending and tracking.

## Overview

Your application now integrates with Unipile to:
- Send real emails through connected Gmail accounts
- Track email delivery, opens, clicks, and replies in real-time
- Handle OAuth authentication securely
- Receive webhook notifications for all email events

## Prerequisites

1. A Unipile account - Sign up at [https://unipile.com](https://unipile.com)
2. Your application deployed and accessible via HTTPS
3. Supabase project with Edge Functions enabled

## Step 1: Get Your Unipile API Key

1. Log in to your Unipile dashboard at [https://dashboard.unipile.com](https://dashboard.unipile.com)
2. Navigate to **Settings** → **API Keys**
3. Click **Create API Key**
4. Copy your API key (it starts with `up_`)
5. Store it securely - you'll need it in Step 2

## Step 2: Configure Supabase Edge Functions

You need to add your Unipile API key as a secret in Supabase:

### Option A: Using Supabase CLI (Recommended)

```bash
# Navigate to your project directory
cd /path/to/your/project

# Set the UNIPILE_API_KEY secret
supabase secrets set UNIPILE_API_KEY=up_your_actual_api_key_here

# Optional: Set DSN for webhook signature validation
supabase secrets set UNIPILE_DSN=your_unipile_dsn_here
```

### Option B: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** → **Settings**
3. Under **Secrets**, add:
   - Key: `UNIPILE_API_KEY`
   - Value: Your Unipile API key (starts with `up_`)
4. Click **Save**

## Step 3: Configure Webhook URL in Unipile

Unipile needs to know where to send email event notifications (opens, clicks, replies).

1. Go to your Unipile dashboard
2. Navigate to **Settings** → **Webhooks**
3. Click **Add Webhook**
4. Configure the webhook:
   - **Webhook URL**: `https://YOUR_SUPABASE_PROJECT.supabase.co/functions/v1/unipile-webhook`
   - **Events to subscribe**: Select all email events:
     - `email.delivered`
     - `email.opened`
     - `email.clicked`
     - `email.bounced`
     - `email.replied`
     - `email.failed`
     - `email.spam`
5. Click **Save**

**Important**: Replace `YOUR_SUPABASE_PROJECT` with your actual Supabase project reference ID.

You can find your Supabase URL in:
- Supabase Dashboard → Settings → API → Project URL

## Step 4: Test the Connection

1. Log in to your application
2. Navigate to **Accounts** page
3. Click **Connect Gmail Account**
4. You'll be redirected to Unipile's OAuth flow
5. Grant permissions to your Gmail account
6. You'll be redirected back to your application
7. Your account should now show as "Connected" with a green checkmark

## Step 5: Verify Email Sending

1. Create a new campaign
2. Add some leads with valid email addresses
3. Generate emails using AI
4. Click **Send Emails**
5. Monitor the campaign dashboard for real-time updates

## Webhook Event Flow

Here's what happens when you send an email:

```
1. User clicks "Send Emails"
   ↓
2. send-emails Edge Function calls Unipile API
   ↓
3. Unipile sends email via your Gmail account
   ↓
4. Recipient receives email
   ↓
5. Recipient opens/clicks/replies
   ↓
6. Unipile detects the event
   ↓
7. Unipile sends webhook to your unipile-webhook Edge Function
   ↓
8. Webhook creates email_tracking_events record
   ↓
9. Database trigger updates email status
   ↓
10. Real-time subscription updates your UI
```

## Troubleshooting

### "UNIPILE_API_KEY not configured"

**Solution**: Ensure you've set the secret in Supabase (Step 2)

```bash
# Verify secrets are set
supabase secrets list
```

### "No Unipile-connected accounts found"

**Solution**: You need to connect at least one Gmail account through the Accounts page.

### "Unipile authentication failed"

**Possible causes**:
1. Invalid API key - verify it starts with `up_`
2. API key has been revoked - generate a new one
3. Account connection expired - reconnect the Gmail account

### Webhooks not receiving events

**Checklist**:
1. ✅ Webhook URL is correctly configured in Unipile dashboard
2. ✅ Webhook URL is accessible (test with `curl`)
3. ✅ Events are selected in webhook configuration
4. ✅ Edge Function `unipile-webhook` is deployed

**Test webhook manually**:
```bash
curl -X POST https://YOUR_SUPABASE_PROJECT.supabase.co/functions/v1/unipile-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "email.delivered",
    "account_id": "test",
    "message_id": "test-message",
    "timestamp": "2024-01-01T00:00:00Z"
  }'
```

## Security Notes

1. **API Key Storage**: Never commit your Unipile API key to git. Always use environment variables or Supabase secrets.

2. **Webhook Validation**: The system supports webhook signature validation using `UNIPILE_DSN`. While optional, it's recommended for production.

3. **OAuth Security**: The OAuth flow uses secure authorization codes that expire after use.

4. **RLS Protection**: All database tables use Row Level Security, ensuring users can only access their own data.

## Rate Limits

Unipile enforces rate limits:
- **API Calls**: 100 requests per minute
- **Email Sending**: Depends on your plan
- **Webhook Delivery**: Best-effort with retry

The system handles rate limits gracefully:
- Respects Gmail daily sending limits (configurable per account)
- Rotates between multiple connected accounts
- Shows clear error messages when limits are reached

## Cost Considerations

Unipile pricing is based on:
1. **Connected Accounts**: Number of email accounts connected
2. **Emails Sent**: Volume of emails sent per month
3. **API Usage**: Number of API calls

Check [Unipile Pricing](https://unipile.com/pricing) for current rates.

## Support

- **Unipile Documentation**: [https://docs.unipile.com](https://docs.unipile.com)
- **Unipile Support**: support@unipile.com
- **Application Issues**: Check Supabase Edge Function logs

## Next Steps

Once Unipile is configured:

1. ✅ Connect multiple Gmail accounts for higher sending capacity
2. ✅ Set up A/B testing variants to optimize email performance
3. ✅ Configure AI preferences for GPT-5.2 personalization
4. ✅ Monitor real-time analytics on the campaign dashboard
5. ✅ Review variant performance to identify winning emails

Your cold email outreach system is now fully operational!
