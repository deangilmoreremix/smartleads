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

async function verifyRtrvrKey(apiKey: string): Promise<{ valid: boolean; message: string; error?: string }> {
  try {
    const response = await fetch('https://api.rtrvr.ai/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://example.com',
        onlyTextContent: true,
      }),
    });
    if (response.ok) {
      return { valid: true, message: 'API key is valid - rtrvr.ai connected' };
    } else if (response.status === 401) {
      return { valid: false, message: 'API key is invalid or expired', error: 'Unauthorized' };
    } else if (response.status === 429) {
      return { valid: true, message: 'API key is valid (rate limited)' };
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
      return { valid: true, message: 'API key is valid - GPT-5.2 ready' };
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

    const rtrvrKey = Deno.env.get('RTRVR_API_KEY');
    if (!rtrvrKey || rtrvrKey === '') {
      results.push({
        name: 'rtrvr.ai',
        configured: false,
        valid: false,
        message: 'Not configured - add RTRVR_API_KEY to Supabase secrets',
      });
    } else {
      const rtrvrResult = await verifyRtrvrKey(rtrvrKey);
      results.push({
        name: 'rtrvr.ai',
        configured: true,
        valid: rtrvrResult.valid,
        message: rtrvrResult.message,
        error: rtrvrResult.error,
      });
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey || openaiKey === '') {
      results.push({
        name: 'OpenAI (GPT-5.2)',
        configured: false,
        valid: false,
        message: 'Not configured - add OPENAI_API_KEY to Supabase secrets',
      });
    } else {
      const openaiResult = await verifyOpenAIKey(openaiKey);
      results.push({
        name: 'OpenAI (GPT-5.2)',
        configured: true,
        valid: openaiResult.valid,
        message: openaiResult.message,
        error: openaiResult.error,
      });
    }

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