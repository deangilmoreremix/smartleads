import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

const RTRVR_API_URL = 'https://api.rtrvr.ai/v1/extract';
const REQUEST_TIMEOUT_MS = 300000;

interface RtrvrRequest {
  prompt: string;
  schema: Record<string, unknown>;
  config: Record<string, unknown>;
}

interface RtrvrResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  warnings?: string[];
  diagnostics?: {
    pagesVisited: number;
    totalResultsFound: number;
    totalPlacesReturned: number;
    durationMs: number;
    errors: string[];
    warnings: string[];
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

function createResponse(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body)
  };
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') {
    return createResponse(200, {});
  }

  if (event.httpMethod !== 'POST') {
    return createResponse(405, { error: 'Method not allowed. Use POST.' });
  }

  const apiKey = process.env.RTRVR_API_KEY;
  if (!apiKey) {
    console.error('RTRVR_API_KEY not configured');
    return createResponse(500, {
      error: 'Server configuration error: RTRVR API key not set. Please add RTRVR_API_KEY to Netlify environment variables.'
    });
  }

  let requestBody: RtrvrRequest;
  try {
    if (!event.body) {
      return createResponse(400, { error: 'Request body is required' });
    }
    requestBody = JSON.parse(event.body);
  } catch {
    return createResponse(400, { error: 'Invalid JSON in request body' });
  }

  const { prompt, schema, config } = requestBody;

  if (!prompt || typeof prompt !== 'string') {
    return createResponse(400, { error: 'Missing or invalid "prompt" field' });
  }

  if (!schema || typeof schema !== 'object') {
    return createResponse(400, { error: 'Missing or invalid "schema" field' });
  }

  console.log('RTRVR request initiated', {
    promptLength: prompt.length,
    hasSchema: !!schema,
    configSummary: config ? {
      maxPlaces: (config as Record<string, unknown>).search &&
        ((config as Record<string, unknown>).search as Record<string, unknown>).maxPlaces,
      geoMode: (config as Record<string, unknown>).geo &&
        ((config as Record<string, unknown>).geo as Record<string, unknown>).geoMode
    } : null
  });

  const startTime = Date.now();

  try {
    const rtrvrPayload = {
      input: prompt,
      schema: schema,
      options: {
        strict_json: true,
        timeout_ms: REQUEST_TIMEOUT_MS - 10000
      }
    };

    const response = await fetchWithTimeout(
      RTRVR_API_URL,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(rtrvrPayload)
      },
      REQUEST_TIMEOUT_MS
    );

    const durationMs = Date.now() - startTime;

    if (!response.ok) {
      let errorMessage = `RTRVR API error: ${response.status} ${response.statusText}`;
      let errorDetails: unknown = null;

      try {
        const errorBody = await response.text();
        try {
          errorDetails = JSON.parse(errorBody);
          if (typeof errorDetails === 'object' && errorDetails !== null && 'error' in errorDetails) {
            errorMessage = `RTRVR API error: ${(errorDetails as Record<string, unknown>).error}`;
          }
        } catch {
          if (errorBody) {
            errorMessage = `RTRVR API error: ${errorBody}`;
          }
        }
      } catch {
        // Ignore errors reading error body
      }

      console.error('RTRVR API error', {
        status: response.status,
        statusText: response.statusText,
        durationMs,
        errorDetails
      });

      return createResponse(response.status >= 500 ? 502 : response.status, {
        success: false,
        error: errorMessage,
        durationMs
      });
    }

    const responseText = await response.text();
    let rtrvrData: unknown;

    try {
      rtrvrData = JSON.parse(responseText);
    } catch {
      console.error('Failed to parse RTRVR response as JSON', {
        responsePreview: responseText.substring(0, 500)
      });
      return createResponse(502, {
        success: false,
        error: 'RTRVR returned invalid JSON response',
        durationMs
      });
    }

    console.log('RTRVR request completed', {
      durationMs,
      placesCount: Array.isArray((rtrvrData as Record<string, unknown>).places)
        ? ((rtrvrData as Record<string, unknown>).places as unknown[]).length
        : 0
    });

    const result: RtrvrResponse = {
      success: true,
      data: rtrvrData,
      diagnostics: {
        pagesVisited: 0,
        totalResultsFound: 0,
        totalPlacesReturned: Array.isArray((rtrvrData as Record<string, unknown>).places)
          ? ((rtrvrData as Record<string, unknown>).places as unknown[]).length
          : 0,
        durationMs,
        errors: [],
        warnings: []
      }
    };

    if (typeof rtrvrData === 'object' && rtrvrData !== null && 'diagnostics' in rtrvrData) {
      result.diagnostics = {
        ...result.diagnostics,
        ...(rtrvrData as Record<string, unknown>).diagnostics as Record<string, unknown>
      } as RtrvrResponse['diagnostics'];
    }

    return createResponse(200, result);

  } catch (error) {
    const durationMs = Date.now() - startTime;

    if (error instanceof Error && error.name === 'AbortError') {
      console.error('RTRVR request timed out', { durationMs, timeoutMs: REQUEST_TIMEOUT_MS });
      return createResponse(504, {
        success: false,
        error: `Request timed out after ${Math.round(REQUEST_TIMEOUT_MS / 1000)} seconds`,
        durationMs
      });
    }

    console.error('RTRVR request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      durationMs
    });

    return createResponse(500, {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      durationMs
    });
  }
};

export { handler };
