import { supabase } from '../lib/supabase';

const DISPOSABLE_EMAIL_DOMAINS = [
  // Common disposable email services
  'tempmail.com',
  'guerrillamail.com',
  'mailinator.com',
  '10minutemail.com',
  'throwaway.email',
  'temp-mail.org',
  'yopmail.com',
  'maildrop.cc',
  'trashmail.com',
  'getnada.com',
  'fakeinbox.com',
  'dispostable.com',
  'mailcatch.com',
  'mintemail.com',
  'emailondeck.com',
  'guerrillamailblock.com',
  'sharklasers.com',
  'grr.la',
  'pokemail.net',
  'spam4.me',
  'mailnesia.com',
  'tempinbox.com',
  'burnermail.io',
  'moakt.com',
  'mohmal.com',
  'crazymailing.com',
  'dropmail.me',
  'getairmail.com',
  'mailtemporaire.fr',
  'mytemp.email',
  'tempr.email',
  'tmpmail.net',
  'spamgourmet.com',
  'mailforspam.com',
  'throwawaymail.com',
  'armyspy.com',
  'cuvox.de',
  'dayrep.com',
  'einrot.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'teleworm.us',
  'superrito.com',
  'wegwerfmail.de',
  'jetable.org',
];

interface EmailVerificationResult {
  isValid: boolean;
  status: 'valid' | 'invalid' | 'risky' | 'pending';
  details: {
    formatValid: boolean;
    domainValid: boolean;
    mxRecordsExist: boolean;
    isDisposable: boolean;
    isGeneric: boolean;
    checks: string[];
  };
}

export async function verifyEmail(email: string): Promise<EmailVerificationResult> {
  const checks: string[] = [];
  let isValid = true;
  let status: 'valid' | 'invalid' | 'risky' | 'pending' = 'valid';

  const formatValid = validateEmailFormat(email);
  if (!formatValid) {
    checks.push('Invalid email format');
    isValid = false;
    status = 'invalid';
  } else {
    checks.push('Email format is valid');
  }

  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) {
    checks.push('No domain found');
    return {
      isValid: false,
      status: 'invalid',
      details: {
        formatValid: false,
        domainValid: false,
        mxRecordsExist: false,
        isDisposable: false,
        isGeneric: false,
        checks,
      },
    };
  }

  const isDisposable = DISPOSABLE_EMAIL_DOMAINS.includes(domain);
  if (isDisposable) {
    checks.push('Disposable email domain detected');
    status = 'risky';
  } else {
    checks.push('Not a disposable email domain');
  }

  const isGeneric = isGenericEmail(email);
  if (isGeneric) {
    checks.push('Generic email detected (info@, contact@, etc.)');
    status = status === 'valid' ? 'risky' : status;
  } else {
    checks.push('Not a generic email');
  }

  const mxRecordsExist = await checkMXRecords(domain);
  if (!mxRecordsExist) {
    checks.push('No MX records found - domain cannot receive emails');
    isValid = false;
    status = 'invalid';
  } else {
    checks.push('MX records exist - domain can receive emails');
  }

  return {
    isValid: isValid && status !== 'invalid',
    status,
    details: {
      formatValid,
      domainValid: !!domain,
      mxRecordsExist,
      isDisposable,
      isGeneric,
      checks,
    },
  };
}

function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isGenericEmail(email: string): boolean {
  const genericPrefixes = [
    'info',
    'contact',
    'admin',
    'support',
    'hello',
    'sales',
    'help',
    'noreply',
    'no-reply',
  ];
  const prefix = email.split('@')[0]?.toLowerCase();
  return genericPrefixes.some((generic) => prefix === generic);
}

async function checkMXRecords(domain: string): Promise<boolean> {
  try {
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`, {
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      console.error(`MX record check failed for ${domain}: HTTP ${response.status}`);
      return false;
    }

    const data = await response.json();
    return data.Answer && data.Answer.length > 0;
  } catch (error) {
    // Log the error but return false (invalid) for safety
    console.error(`Error checking MX records for ${domain}:`, error);
    return false;
  }
}

export async function verifyLeadEmail(leadId: string): Promise<EmailVerificationResult> {
  const { data: lead, error } = await supabase
    .from('leads')
    .select('email')
    .eq('id', leadId)
    .maybeSingle();

  if (error || !lead) {
    throw new Error('Lead not found');
  }

  const result = await verifyEmail(lead.email);

  await supabase
    .from('leads')
    .update({
      email_verified: result.isValid,
      verification_status: result.status,
      verification_date: new Date().toISOString(),
      verification_details: result.details,
    })
    .eq('id', leadId);

  return result;
}

export async function verifyAllCampaignLeads(
  campaignId: string,
  options: { batchSize?: number; delayMs?: number } = {}
): Promise<{
  total: number;
  verified: number;
  invalid: number;
  risky: number;
}> {
  const { batchSize = 10, delayMs = 1000 } = options;

  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, email')
    .eq('campaign_id', campaignId)
    .eq('verification_status', 'pending');

  if (error || !leads) {
    throw new Error('Failed to fetch leads');
  }

  let verified = 0;
  let invalid = 0;
  let risky = 0;

  // Process in batches to implement rate limiting
  for (let i = 0; i < leads.length; i += batchSize) {
    const batch = leads.slice(i, i + batchSize);

    // Process batch in parallel
    const results = await Promise.all(
      batch.map((lead) => verifyLeadEmail(lead.id).catch((err) => {
        console.error(`Failed to verify lead ${lead.id}:`, err);
        return null;
      }))
    );

    // Count results
    for (const result of results) {
      if (!result) continue;

      if (result.status === 'valid') {
        verified++;
      } else if (result.status === 'invalid') {
        invalid++;
      } else if (result.status === 'risky') {
        risky++;
      }
    }

    // Rate limit: wait between batches (except for the last batch)
    if (i + batchSize < leads.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return {
    total: leads.length,
    verified,
    invalid,
    risky,
  };
}
