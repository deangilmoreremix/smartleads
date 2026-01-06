import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TestAgentRequest {
  campaignId?: string;
  campaignName?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error("Unauthorized");

    const { campaignId, campaignName = "Test Campaign" }: TestAgentRequest = await req.json();

    const jobId = crypto.randomUUID();
    await supabase.from('agent_jobs').insert({
      id: jobId,
      user_id: user.id,
      campaign_id: campaignId || null,
      job_type: 'lead_scraping',
      status: 'initializing'
    });

    simulateAgentWork(supabase, jobId, campaignName).catch(console.error);

    return new Response(
      JSON.stringify({ jobId, message: "Agent job started" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to start test agent" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function simulateAgentWork(supabase: any, jobId: string, campaignName: string) {
  const log = async (message: string, level = 'info', icon = '💡') => {
    await supabase.from('agent_progress_logs').insert({
      job_id: jobId, log_level: level, icon, message
    });
  };

  const updateProgress = async (step: number, total: number) => {
    await supabase.from('agent_jobs').update({
      completed_steps: step, total_steps: total
    }).eq('id', jobId);
  };

  try {
    await supabase.from('agent_jobs').update({ status: 'running' }).eq('id', jobId);
    await log('Initializing AI agent...', 'info', '⚡');
    await new Promise(r => setTimeout(r, 1000));

    await log('Loading agent modules...', 'loading', '🔧');
    await updateProgress(1, 10);
    await new Promise(r => setTimeout(r, 1500));

    await log('Configuring search parameters...', 'loading', '🔍');
    await updateProgress(2, 10);
    await new Promise(r => setTimeout(r, 1000));

    await log('Agent successfully created and is now starting', 'success', '✅');
    await updateProgress(3, 10);
    await new Promise(r => setTimeout(r, 800));

    await log('Analyzing your search query...', 'info', '🔎');
    await updateProgress(4, 10);
    await new Promise(r => setTimeout(r, 1200));

    await log('Query processed successfully', 'success', '✅');
    await updateProgress(5, 10);
    await new Promise(r => setTimeout(r, 600));

    await log('Connecting to Google Maps...', 'loading', '🌍');
    await updateProgress(6, 10);
    await new Promise(r => setTimeout(r, 1500));

    await log('Agent is now searching through Google Maps leads...', 'info', '🔍');
    await updateProgress(7, 10);
    await new Promise(r => setTimeout(r, 2000));

    await log('Scanning business listings...', 'loading', '📋');
    await updateProgress(8, 10);
    await new Promise(r => setTimeout(r, 1500));

    await log('Found potential leads!', 'success', '🎯');
    await updateProgress(9, 10);
    await new Promise(r => setTimeout(r, 800));

    await log('Adding leads to campaign... (This process will take a few minutes)', 'loading', '📥');
    await new Promise(r => setTimeout(r, 2000));

    await log('Leads added successfully!', 'success', '✅');
    await updateProgress(10, 10);
    await new Promise(r => setTimeout(r, 500));

    await log('Agent is now finding contact information...', 'info', '📧');
    await new Promise(r => setTimeout(r, 2000));

    await log('Extracting email addresses...', 'loading', '📨');
    await new Promise(r => setTimeout(r, 2500));

    await log('Contact information collected!', 'success', '✅');
    await new Promise(r => setTimeout(r, 500));

    const leadsFound = Math.floor(Math.random() * 30) + 20;
    await log(`Agent completed! Found ${leadsFound} leads ready for outreach.`, 'success', '🎉');

    await supabase.from('agent_jobs').update({
      status: 'completed',
      result_data: { leadsFound, campaign_name: campaignName },
      completed_at: new Date().toISOString()
    }).eq('id', jobId);
  } catch (error) {
    await log(`Agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error', '❌');
    await supabase.from('agent_jobs').update({
      status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error'
    }).eq('id', jobId);
  }
}
