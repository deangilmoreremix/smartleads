import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Mail, Users } from 'lucide-react';
import AgentProgressLogs from '../components/AgentProgressLogs';
import AgentStatusCard from '../components/AgentStatusCard';
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
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <button
            onClick={() => navigate('/campaigns')}
            className="text-blue-600 hover:text-blue-700"
          >
            Return to Campaigns
          </button>
        </div>
      </div>
    );
  }

  const isComplete = job.status === 'completed';

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToCampaign}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Campaign</span>
            </button>

            <div className="text-center flex-1">
              <h1 className="text-xl font-bold text-gray-900">AI Agent Progress</h1>
              <p className="text-sm text-gray-600">
                {job.result_data?.campaign_name || 'Processing Campaign'}
              </p>
            </div>

            {isComplete && (
              <div className="flex items-center space-x-2">
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium text-sm flex items-center space-x-2">
                  <span>Ready to Send</span>
                  {job.result_data?.leadsFound && (
                    <span className="bg-green-200 px-2 py-0.5 rounded-full text-xs font-bold">
                      {job.result_data.leadsFound} leads
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {showSuccessBanner && isComplete && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-green-500 p-3 rounded-full">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-green-900">Ready to Send Emails!</h2>
                  <p className="text-green-700 mt-1">
                    Your NotiQ AI agent has successfully found {job.result_data?.leadsFound || 0} leads and collected their contact information. You're now ready to start your email campaign.
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                {job.job_type === 'lead_scraping' && (
                  <>
                    <button
                      onClick={handleViewLeads}
                      className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center space-x-2"
                    >
                      <Users className="w-5 h-5" />
                      <span>View All Leads</span>
                    </button>
                    <button
                      onClick={handleStartSending}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-colors flex items-center space-x-2 shadow-lg"
                    >
                      <Mail className="w-5 h-5" />
                      <span>Start Sending Your Emails</span>
                    </button>
                  </>
                )}
              </div>
            </div>
            <p className="text-sm text-green-600 mt-4">
              You can review your leads and customize your email template before sending.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
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
