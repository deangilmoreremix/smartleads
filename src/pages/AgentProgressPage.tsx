import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Mail, Users, Sparkles } from 'lucide-react';
import AgentProgressLogs from '../components/AgentProgressLogs';
import AgentStatusCard from '../components/AgentStatusCard';
import { AgentBrainVisualization, DataFlowAnimation, AgentThinkingIndicator } from '../components/agent';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

interface AgentJob {
  id: string;
  job_type: string;
  status: 'initializing' | 'running' | 'completed' | 'failed';
  progress_percentage: number;
  total_steps: number;
  completed_steps: number;
  result_data: {
    leadsFound?: number;
    emailsGenerated?: number;
    emailsSent?: number;
    campaign_name?: string;
  };
  error_message?: string;
}

interface ProgressLog {
  id: string;
  timestamp: string;
  log_level: 'info' | 'success' | 'warning' | 'error' | 'loading';
  icon: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export default function AgentProgressPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [job, setJob] = useState<AgentJob | null>(null);
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  const campaignId = searchParams.get('campaign_id');

  useEffect(() => {
    if (!jobId) {
      toast.error('Invalid job ID');
      navigate('/campaigns');
      return;
    }

    loadJobData();
    subscribeToUpdates();
  }, [jobId]);

  useEffect(() => {
    if (job?.status === 'completed' && !showSuccessBanner) {
      setShowSuccessBanner(true);
      toast.success('AI Agent completed successfully!');
    }
  }, [job?.status]);

  const loadJobData = async () => {
    try {
      const { data: jobData, error: jobError } = await supabase
        .from('agent_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError) throw jobError;
      setJob(jobData);

      const { data: logsData, error: logsError } = await supabase
        .from('agent_progress_logs')
        .select('*')
        .eq('job_id', jobId)
        .order('timestamp', { ascending: true });

      if (logsError) throw logsError;
      setLogs(logsData || []);
    } catch (error) {
      console.error('Error loading job data:', error);
      toast.error('Failed to load agent progress');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    const jobSubscription = supabase
      .channel(`agent_job_${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'agent_jobs',
          filter: `id=eq.${jobId}`,
        },
        (payload) => {
          setJob(payload.new as AgentJob);
        }
      )
      .subscribe();

    const logsSubscription = supabase
      .channel(`agent_logs_${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_progress_logs',
          filter: `job_id=eq.${jobId}`,
        },
        (payload) => {
          setLogs(prev => [...prev, payload.new as ProgressLog]);
        }
      )
      .subscribe();

    return () => {
      jobSubscription.unsubscribe();
      logsSubscription.unsubscribe();
    };
  };

  const getSteps = () => {
    if (!job) return [];

    const stepMap: Record<string, string[]> = {
      lead_scraping: [
        'Agent Created',
        'Finding Leads',
        'Getting Contact Information',
        'Ready to Send'
      ],
      email_generation: [
        'Analyzing Campaign',
        'Generating Personalized Emails',
        'Quality Check',
        'Ready to Send'
      ],
      email_sending: [
        'Preparing Emails',
        'Sending Emails',
        'Tracking Delivery',
        'Complete'
      ],
      contact_enrichment: [
        'Loading Contacts',
        'Enriching Data',
        'Validating Information',
        'Complete'
      ]
    };

    const stepLabels = stepMap[job.job_type] || ['Initializing', 'Processing', 'Completing'];

    return stepLabels.map((label, index) => {
      const stepProgress = ((index + 1) / stepLabels.length) * 100;
      return {
        label,
        status:
          job.progress_percentage >= 100 ? 'completed' :
          job.progress_percentage >= stepProgress ? 'completed' :
          job.progress_percentage >= stepProgress - (100 / stepLabels.length) ? 'in_progress' :
          job.status === 'failed' && job.progress_percentage >= stepProgress - (100 / stepLabels.length) ? 'failed' :
          'pending'
      };
    });
  };

  const getCurrentFlowStep = (): 'scraping' | 'enriching' | 'generating' | 'sending' | 'complete' => {
    if (!job) return 'scraping';
    if (job.status === 'completed') return 'complete';
    if (job.progress_percentage >= 75) return 'sending';
    if (job.progress_percentage >= 50) return 'generating';
    if (job.progress_percentage >= 25) return 'enriching';
    return 'scraping';
  };

  const handleBackToCampaign = () => {
    if (campaignId) {
      navigate(`/campaigns/${campaignId}`);
    } else {
      navigate('/campaigns');
    }
  };

  const handleViewLeads = () => {
    if (campaignId) {
      navigate(`/campaigns/${campaignId}`);
    } else {
      navigate('/leads');
    }
  };

  const handleStartSending = () => {
    if (campaignId) {
      navigate(`/campaigns/${campaignId}?action=send`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black">
        <div className="text-center">
          <AgentBrainVisualization isActive={true} intensity="high" />
          <p className="mt-6 text-gray-400 animate-pulse">Initializing AI Agent...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 bg-amber-50/30 min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-800 mb-4">Job Not Found</h1>
          <button
            onClick={() => navigate('/campaigns')}
            className="text-orange-500 hover:text-orange-600"
          >
            Return to Campaigns
          </button>
        </div>
      </div>
    );
  }

  const isComplete = job.status === 'completed';
  const isRunning = job.status === 'running' || job.status === 'initializing';

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50/30 to-orange-50/20 pb-12">
      <div className="bg-white/80 backdrop-blur-sm border-b border-amber-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToCampaign}
              className="flex items-center space-x-2 text-stone-600 hover:text-stone-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Campaign</span>
            </button>

            <div className="text-center flex-1">
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h1 className="text-xl font-bold text-stone-800">AI Agent Progress</h1>
              </div>
              <p className="text-sm text-stone-500">
                {job.result_data?.campaign_name || 'Processing Campaign'}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {isRunning && (
                <AgentThinkingIndicator isThinking={true} variant="minimal" />
              )}
              {isComplete && (
                <span className="px-4 py-2 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 rounded-lg font-medium text-sm flex items-center space-x-2 border border-emerald-200">
                  <Sparkles className="w-4 h-4" />
                  <span>Ready to Send</span>
                  {job.result_data?.leadsFound && (
                    <span className="bg-emerald-200 px-2 py-0.5 rounded-full text-xs font-bold">
                      {job.result_data.leadsFound} leads
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {isRunning && (
        <div className="bg-gradient-to-r from-gray-900 via-gray-950 to-gray-900 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <DataFlowAnimation isActive={true} currentStep={getCurrentFlowStep()} />
          </div>
        </div>
      )}

      {showSuccessBanner && isComplete && (
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-b border-amber-200">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.1),transparent_50%)]"></div>
          <div className="max-w-7xl mx-auto px-4 py-8 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-4 rounded-2xl shadow-lg shadow-orange-500/30">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-stone-800 flex items-center space-x-2">
                    <span>Ready to Send Emails!</span>
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  </h2>
                  <p className="text-stone-600 mt-2 max-w-xl">
                    Your SmartLeads AI agent has successfully found {job.result_data?.leadsFound || 0} leads and collected their contact information. You're now ready to start your email campaign.
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                {job.job_type === 'lead_scraping' && (
                  <>
                    <button
                      onClick={handleViewLeads}
                      className="px-6 py-3 bg-stone-800 text-white rounded-xl font-medium hover:bg-stone-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                      <Users className="w-5 h-5" />
                      <span>View All Leads</span>
                    </button>
                    <button
                      onClick={handleStartSending}
                      className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-medium hover:from-amber-500 hover:to-orange-600 transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:-translate-y-0.5"
                    >
                      <Mail className="w-5 h-5" />
                      <span>Start Sending Your Emails</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {isRunning && (
          <div className="mb-6">
            <AgentThinkingIndicator isThinking={true} variant="detailed" />
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            {isRunning && (
              <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-sm font-semibold text-gray-400 mb-4 text-center">Neural Processing</h3>
                <AgentBrainVisualization
                  isActive={isRunning}
                  intensity={job.progress_percentage > 50 ? 'high' : 'medium'}
                />
              </div>
            )}
            <AgentStatusCard
              jobType={job.job_type}
              status={job.status}
              steps={getSteps()}
              resultData={job.result_data}
            />
          </div>

          <div className="lg:col-span-2">
            <AgentProgressLogs
              logs={logs}
              progress={job.progress_percentage}
              isComplete={isComplete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
