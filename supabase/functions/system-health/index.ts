import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, {
    status: string;
    latency_ms?: number;
    message?: string;
    last_check?: string;
  }>;
  timestamp: string;
  version: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const checks: HealthCheckResult['checks'] = {};
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    const dbStart = Date.now();
    const { error: dbError } = await supabase.from('health_checks').select('id').limit(1);
    checks['database'] = {
      status: dbError ? 'unhealthy' : 'healthy',
      latency_ms: Date.now() - dbStart,
      message: dbError?.message
    };
    if (dbError) overallStatus = 'unhealthy';

    const { data: healthData } = await supabase
      .from('health_checks')
      .select('check_name, status, last_check_at, response_time_ms, error_message, consecutive_failures');

    if (healthData) {
      for (const check of healthData) {
        checks[check.check_name] = {
          status: check.status,
          latency_ms: check.response_time_ms,
          message: check.error_message,
          last_check: check.last_check_at
        };
        if (check.status === 'unhealthy' && overallStatus !== 'unhealthy') {
          overallStatus = 'unhealthy';
        } else if (check.status === 'degraded' && overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
      }
    }

    const { data: circuitData } = await supabase
      .from('circuit_breaker_state')
      .select('service_name, state, failure_count, last_failure_at');

    if (circuitData) {
      for (const circuit of circuitData) {
        checks[`circuit_${circuit.service_name}`] = {
          status: circuit.state === 'closed' ? 'healthy' : circuit.state === 'half_open' ? 'degraded' : 'unhealthy',
          message: circuit.state !== 'closed' ? `Circuit ${circuit.state}, failures: ${circuit.failure_count}` : undefined
        };
        if (circuit.state === 'open') {
          overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus;
        }
      }
    }

    const { data: featureFlags } = await supabase
      .from('feature_flags')
      .select('flag_name, is_enabled')
      .in('flag_name', ['maintenance_mode', 'autopilot_enabled', 'email_sending_enabled']);

    if (featureFlags) {
      const maintenanceMode = featureFlags.find(f => f.flag_name === 'maintenance_mode');
      if (maintenanceMode?.is_enabled) {
        checks['maintenance_mode'] = { status: 'degraded', message: 'System is in maintenance mode' };
        if (overallStatus === 'healthy') overallStatus = 'degraded';
      }
    }

    const { count: pendingEmails } = await supabase
      .from('emails')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: processingJobs } = await supabase
      .from('campaign_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'processing');

    checks['workload'] = {
      status: (pendingEmails || 0) > 1000 ? 'degraded' : 'healthy',
      message: `${pendingEmails || 0} pending emails, ${processingJobs || 0} active jobs`
    };

    const result: HealthCheckResult = {
      status: overallStatus,
      checks,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    const httpStatus = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

    return new Response(
      JSON.stringify(result),
      {
        status: httpStatus,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Health check error:', error);
    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        checks: {
          error: {
            status: 'unhealthy',
            message: error instanceof Error ? error.message : 'Unknown error'
          }
        },
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }),
      {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});