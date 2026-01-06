import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ApiKeyStatus {
  name: string;
  configured: boolean;
  valid: boolean;
  message: string;
  error?: string;
}

async function verifyApifyKey(apiKey: string): Promise<{ valid: boolean; message: string; error?: string }> {
  try {
    const response = await fetch(`https://api.apify.com/v2/acts?token=${apiKey}&limit=1`);
    if (response.ok) {
      return { valid: true, message: 'API key is valid and working' };
    } else if (response.status === 401) {
      return { valid: false, message: 'API key is invalid or expired', error: 'Unauthorized' };
    } else {
      return { valid: false, message: 'Unable to verify API key', error: `HTTP ${response.status}` };
    }
  } catch (error: any) {
    return { valid: false, message: 'Connection failed', error: error.message };
  }
}

async function verifyOpenAIKey(apiKey: string): Promise<{ valid: boolean; message: string; error?: string }> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    if (response.ok) {
      return { valid: true, message: 'API key is valid and working' };
    } else if (response.status === 401) {
      return { valid: false, message: 'API key is invalid or expired', error: 'Unauthorized' };
    } else {
      return { valid: false, message: 'Unable to verify API key', error: `HTTP ${response.status}` };
    }
  } catch (error: any) {
    return { valid: false, message: 'Connection failed', error: error.message };
  }
}

async function verifyUnipileKey(apiKey: string): Promise<{ valid: boolean; message: string; error?: string }> {
  try {
    const response = await fetch('https://api.unipile.com:13443/api/v1/accounts', {
      headers: {
        'X-API-KEY': apiKey,
      },
    });
    if (response.ok) {
      return { valid: true, message: 'API key is valid and working' };
    } else if (response.status === 401 || response.status === 403) {
      return { valid: false, message: 'API key is invalid or expired', error: 'Unauthorized' };
    } else {
      return { valid: false, message: 'Unable to verify API key', error: `HTTP ${response.status}` };
    }
  } catch (error: any) {
    return { valid: false, message: 'Connection failed', error: error.message };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
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

    const results: ApiKeyStatus[] = [];

    // Check Apify
    const apifyKey = Deno.env.get('APIFY_API_TOKEN');
    if (!apifyKey || apifyKey === '') {
      results.push({
        name: 'Apify',
        configured: false,
        valid: false,
        message: 'Not configured - add APIFY_API_TOKEN to Supabase secrets',
      });
    } else {
      const apifyResult = await verifyApifyKey(apifyKey);
      results.push({
        name: 'Apify',
        configured: true,
        valid: apifyResult.valid,
        message: apifyResult.message,
        error: apifyResult.error,
      });
    }

    // Check OpenAI
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey || openaiKey === '') {
      results.push({
        name: 'OpenAI',
        configured: false,
        valid: false,
        message: 'Not configured - add OPENAI_API_KEY to Supabase secrets',
      });
    } else {
      const openaiResult = await verifyOpenAIKey(openaiKey);
      results.push({
        name: 'OpenAI',
        configured: true,
        valid: openaiResult.valid,
        message: openaiResult.message,
        error: openaiResult.error,
      });
    }

    // Check Unipile
    const unipileKey = Deno.env.get('UNIPILE_API_KEY');
    if (!unipileKey || unipileKey === '') {
      results.push({
        name: 'Unipile',
        configured: false,
        valid: false,
        message: 'Not configured - add UNIPILE_API_KEY to Supabase secrets',
      });
    } else {
      const unipileResult = await verifyUnipileKey(unipileKey);
      results.push({
        name: 'Unipile',
        configured: true,
        valid: unipileResult.valid,
        message: unipileResult.message,
        error: unipileResult.error,
      });
    }

    // Check Unipile DSN (optional)
    const unipileDsn = Deno.env.get('UNIPILE_DSN');
    results.push({
      name: 'Unipile DSN',
      configured: !!unipileDsn && unipileDsn !== '',
      valid: !!unipileDsn && unipileDsn !== '',
      message: unipileDsn ? 'Configured for webhook validation' : 'Optional - not required for basic functionality',
    });

    const allConfigured = results.filter(r => r.name !== 'Unipile DSN').every(r => r.configured);
    const allValid = results.filter(r => r.name !== 'Unipile DSN').every(r => r.valid);

    return new Response(
      JSON.stringify({
        success: true,
        allConfigured,
        allValid,
        results,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error verifying API keys:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
