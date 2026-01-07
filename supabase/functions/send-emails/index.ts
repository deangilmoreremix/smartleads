import { createClient } from 'npm:@supabase/supabase-js@2';
import { logProgress } from '../_shared/progress-logger.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface SendEmailsRequest {
  campaignId: string;
  emailIds?: string[];
  sendImmediately?: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  let supabaseClient: any;
  let jobId: string | undefined;

  try {
    supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { campaignId, emailIds, sendImmediately = false }: SendEmailsRequest = await req.json();

    const { data: gmailAccounts } = await supabaseClient
      .from('gmail_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (!gmailAccounts || gmailAccounts.length === 0) {
      throw new Error('No active Gmail accounts found. Please connect a Gmail account first.');
    }

    const now = new Date();
    const accountsToReset = gmailAccounts.filter(account => {
      if (!account.last_reset_at) return true;
      const lastReset = new Date(account.last_reset_at);
      const daysSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceReset >= 1;
    });

    if (accountsToReset.length > 0) {
      console.log(`Resetting daily counters for ${accountsToReset.length} accounts`);
      const resetIds = accountsToReset.map(acc => acc.id);
      await supabaseClient
        .from('gmail_accounts')
        .update({
          emails_sent_today: 0,
          last_reset_at: now.toISOString(),
        })
        .in('id', resetIds);

      gmailAccounts.forEach(account => {
        if (resetIds.includes(account.id)) {
          account.emails_sent_today = 0;
          account.last_reset_at = now.toISOString();
        }
      });
    }

    const unipileAccounts = gmailAccounts.filter(acc => acc.unipile_account_id);
    if (unipileAccounts.length === 0) {
      throw new Error('No Unipile-connected accounts found. Please connect your Gmail via Unipile.');
    }

    let emailsQuery = supabaseClient
      .from('emails')
      .select('*, leads(*)')
      .eq('campaign_id', campaignId)
      .eq('user_id', user.id)
      .eq('status', 'queued');

    if (emailIds && emailIds.length > 0) {
      emailsQuery = emailsQuery.in('id', emailIds);
    }

    const { data: emails, error: emailsError } = await emailsQuery.limit(100);
    if (emailsError) throw emailsError;

    if (!emails || emails.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No emails to send' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: campaign } = await supabaseClient
      .from('campaigns')
      .select('name')
      .eq('id', campaignId)
      .single();

    jobId = crypto.randomUUID();
    await supabaseClient.from('agent_jobs').insert({
      id: jobId,
      campaign_id: campaignId,
      user_id: user.id,
      job_type: 'email_sending',
      status: 'initializing',
      progress_percentage: 0,
      total_steps: 4,
      completed_steps: 0,
      result_data: {
        campaign_name: campaign?.name || 'Campaign'
      }
    });

    await logProgress(supabaseClient, jobId, {
      level: 'info',
      icon: '🤖',
      message: 'Agent initialized successfully'
    });

    await supabaseClient.from('agent_jobs').update({
      status: 'running',
      progress_percentage: 25,
      completed_steps: 1
    }).eq('id', jobId);

    await logProgress(supabaseClient, jobId, {
      level: 'info',
      icon: '📧',
      message: `Preparing to send ${emails.length} emails`
    });

    await supabaseClient.from('agent_jobs').update({
      progress_percentage: 50,
      completed_steps: 2
    }).eq('id', jobId);

    await logProgress(supabaseClient, jobId, {
      level: 'loading',
      icon: '📤',
      message: `Sending emails via ${unipileAccounts.length} Gmail account(s)...`
    });

    const sentEmails = [];
    let currentAccountIndex = 0;
    const unipileApiKey = Deno.env.get('UNIPILE_API_KEY');

    if (!unipileApiKey) {
      throw new Error('UNIPILE_API_KEY not configured');
    }

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      const gmailAccount = unipileAccounts[currentAccountIndex % unipileAccounts.length];

      if (gmailAccount.emails_sent_today >= gmailAccount.daily_limit) {
        currentAccountIndex++;
        if (currentAccountIndex >= unipileAccounts.length) {
          console.log('All Gmail accounts reached daily limit');
          break;
        }
        continue;
      }

      const { data: isUnsubscribed } = await supabaseClient
        .from('unsubscribes')
        .select('id')
        .eq('email', email.leads.email.toLowerCase().trim())
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

        await supabaseClient
          .from('campaign_jobs')
          .update({
            progress: Math.floor(((i + 1) / emails.length) * 100),
            processed_items: i + 1,
          })
          .eq('id', jobId);

        continue;
      }

      try {
        const result = await sendEmailViaUnipile(
          unipileApiKey,
          gmailAccount,
          email.leads.email,
          email.subject,
          email.body,
          campaignId,
          email.id
        );

        if (result.success) {
          await supabaseClient
            .from('emails')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
              unipile_message_id: result.message_id,
            })
            .eq('id', email.id);

          await supabaseClient
            .from('leads')
            .update({
              status: 'contacted',
              last_contacted_at: new Date().toISOString(),
            })
            .eq('id', email.lead_id);

          await supabaseClient
            .from('gmail_accounts')
            .update({
              emails_sent_today: gmailAccount.emails_sent_today + 1,
            })
            .eq('id', gmailAccount.id);

          await supabaseClient
            .from('analytics_events')
            .insert({
              user_id: user.id,
              campaign_id: campaignId,
              lead_id: email.lead_id,
              email_id: email.id,
              event_type: 'email_sent',
              event_data: { gmail_account: gmailAccount.email, unipile_message_id: result.message_id },
            });

          sentEmails.push(email);

          if ((sentEmails.length) % 5 === 0) {
            await logProgress(supabaseClient, jobId, {
              level: 'info',
              icon: '✅',
              message: `Sent ${sentEmails.length} of ${emails.length} emails`
            });
          }
        }
      } catch (error: any) {
        console.error(`Failed to send email ${email.id}:`, error);
        await supabaseClient
          .from('emails')
          .update({
            status: 'failed',
            error_message: error.message,
          })
          .eq('id', email.id);

        await logProgress(supabaseClient, jobId, {
          level: 'warning',
          icon: '⚠️',
          message: `Failed to send email to ${email.leads.business_name || 'lead'}`
        });
      }

      if (!sendImmediately && i < emails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    await logProgress(supabaseClient, jobId, {
      level: 'success',
      icon: '📬',
      message: `Successfully sent ${sentEmails.length} emails`
    });

    await supabaseClient
      .from('campaigns')
      .update({
        emails_sent: sentEmails.length,
      })
      .eq('id', campaignId);

    await supabaseClient.from('agent_jobs').update({
      progress_percentage: 75,
      completed_steps: 3
    }).eq('id', jobId);

    await logProgress(supabaseClient, jobId, {
      level: 'loading',
      icon: '📊',
      message: 'Tracking email delivery...'
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    await supabaseClient
      .from('agent_jobs')
      .update({
        status: 'completed',
        progress_percentage: 100,
        completed_steps: 4,
        result_data: {
          campaign_name: campaign?.name || 'Campaign',
          leadsFound: 0,
          emailsGenerated: 0,
          emailsSent: sentEmails.length
        },
      })
      .eq('id', jobId);

    await logProgress(supabaseClient, jobId, {
      level: 'success',
      icon: '🎉',
      message: `Agent completed! ${sentEmails.length} emails delivered successfully`
    });

    return new Response(
      JSON.stringify({
        success: true,
        jobId,
        emailsSent: sentEmails.length,
        totalQueued: emails.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Email sending error:', error);

    if (supabaseClient && jobId) {
      await supabaseClient
        .from('agent_jobs')
        .update({
          status: 'failed',
          error_message: error.message || 'Failed to send emails'
        })
        .eq('id', jobId);

      await logProgress(supabaseClient, jobId, {
        level: 'error',
        icon: '❌',
        message: `Error: ${error.message || 'Failed to send emails'}`
      });
    }

    return new Response(
      JSON.stringify({ error: error.message || 'Failed to send emails' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function sendEmailViaUnipile(
  apiKey: string,
  gmailAccount: any,
  to: string,
  subject: string,
  body: string,
  campaignId: string,
  emailId: string
): Promise<{ success: boolean; message_id?: string }> {
  console.log(`Sending email via Unipile from ${gmailAccount.email} to ${to}`);

  if (!gmailAccount.unipile_account_id) {
    throw new Error(`Account ${gmailAccount.email} is not connected to Unipile`);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const unsubscribeUrl = `${supabaseUrl}/functions/v1/unsubscribe?email=${encodeURIComponent(to)}&campaign_id=${campaignId}`;

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

  try {
    const response = await fetch('https://api.unipile.com/api/v1/emails', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_id: gmailAccount.unipile_account_id,
        to: [{ email: to }],
        subject: subject,
        body: htmlBody,
        body_type: 'html',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Unipile API error:', errorText);

      if (response.status === 401) {
        throw new Error('Unipile authentication failed. Please reconnect your account.');
      }
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        throw new Error(`Rate limit exceeded. Retry after ${retryAfter || '60'} seconds.`);
      }
      if (response.status === 400) {
        throw new Error(`Invalid email data: ${errorText}`);
      }

      throw new Error(`Unipile API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    console.log('Email sent successfully via Unipile:', result);

    return {
      success: true,
      message_id: result.id || result.message_id,
    };
  } catch (error: any) {
    console.error('Error sending email via Unipile:', error);
    throw error;
  }
}
