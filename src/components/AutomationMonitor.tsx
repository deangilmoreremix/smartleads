import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Activity,
  Mail,
  Users,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Play,
  Pause,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

interface AutomationEvent {
  id: string;
  timestamp: Date;
  type: 'email_sent' | 'email_failed' | 'lead_scraped' | 'email_generated' | 'sequence_advanced' | 'job_started' | 'job_completed' | 'job_failed';
  message: string;
  metadata?: Record<string, unknown>;
  campaignName?: string;
}

interface ActiveJob {
  id: string;
  campaign_id: string;
  job_type: string;
  status: string;
  progress_percentage: number;
  result_data?: Record<string, unknown>;
  campaign_name?: string;
}

interface AutomationMonitorProps {
  campaignId?: string;
  compact?: boolean;
}

export default function AutomationMonitor({ campaignId, compact = false }: AutomationMonitorProps) {
  const { user } = useAuth();
  const [events, setEvents] = useState<AutomationEvent[]>([]);
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);
  const [stats, setStats] = useState({
    emailsSentToday: 0,
    emailsQueuedToday: 0,
    leadsProcessedToday: 0,
    activeAutopilots: 0,
  });
  const [isLive, setIsLive] = useState(true);
  const eventsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    loadInitialData();

    const jobsChannel = supabase
      .channel('automation-jobs')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_jobs',
          filter: campaignId ? `campaign_id=eq.${campaignId}` : undefined,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const job = payload.new as ActiveJob;

            if (job.status === 'running' || job.status === 'initializing') {
              setActiveJobs((prev) => {
                const exists = prev.find((j) => j.id === job.id);
                if (exists) {
                  return prev.map((j) => (j.id === job.id ? job : j));
                }
                return [...prev, job];
              });
            } else {
              setActiveJobs((prev) => prev.filter((j) => j.id !== job.id));
            }

            if (payload.eventType === 'UPDATE' && job.status === 'completed') {
              addEvent({
                type: 'job_completed',
                message: `${job.job_type.replace('_', ' ')} completed`,
                metadata: job.result_data,
              });
            }
          }
        }
      )
      .subscribe();

    const logsChannel = supabase
      .channel('automation-logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_progress_logs',
        },
        (payload) => {
          const log = payload.new as { message: string; log_level: string; metadata?: Record<string, unknown> };

          let type: AutomationEvent['type'] = 'job_started';
          if (log.message.toLowerCase().includes('sent')) type = 'email_sent';
          else if (log.message.toLowerCase().includes('failed')) type = 'email_failed';
          else if (log.message.toLowerCase().includes('generated')) type = 'email_generated';
          else if (log.message.toLowerCase().includes('scraped')) type = 'lead_scraped';
          else if (log.message.toLowerCase().includes('completed')) type = 'job_completed';

          addEvent({
            type,
            message: log.message,
            metadata: log.metadata,
          });
        }
      )
      .subscribe();

    const emailsChannel = supabase
      .channel('email-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'emails',
          filter: campaignId ? `campaign_id=eq.${campaignId}` : undefined,
        },
        (payload) => {
          const email = payload.new as { status: string; lead_id: string };
          const oldEmail = payload.old as { status: string };

          if (email.status === 'sent' && oldEmail.status !== 'sent') {
            setStats((prev) => ({ ...prev, emailsSentToday: prev.emailsSentToday + 1 }));
            addEvent({
              type: 'email_sent',
              message: 'Email sent successfully',
            });
          } else if (email.status === 'failed' && oldEmail.status !== 'failed') {
            addEvent({
              type: 'email_failed',
              message: 'Email delivery failed',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(jobsChannel);
      supabase.removeChannel(logsChannel);
      supabase.removeChannel(emailsChannel);
    };
  }, [user, campaignId]);

  useEffect(() => {
    if (eventsContainerRef.current && isLive) {
      eventsContainerRef.current.scrollTop = 0;
    }
  }, [events, isLive]);

  async function loadInitialData() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [jobsResult, emailsResult, autopilotResult] = await Promise.all([
      supabase
        .from('agent_jobs')
        .select('*, campaigns(name)')
        .in('status', ['running', 'initializing'])
        .order('created_at', { ascending: false }),
      supabase
        .from('emails')
        .select('status')
        .gte('created_at', today.toISOString()),
      supabase
        .from('campaign_autopilot_settings')
        .select('is_enabled')
        .eq('is_enabled', true),
    ]);

    if (jobsResult.data) {
      setActiveJobs(
        jobsResult.data.map((j: { id: string; campaign_id: string; job_type: string; status: string; progress_percentage: number; result_data?: Record<string, unknown>; campaigns?: { name: string } }) => ({
          ...j,
          campaign_name: j.campaigns?.name,
        }))
      );
    }

    if (emailsResult.data) {
      const sent = emailsResult.data.filter((e: { status: string }) => e.status === 'sent').length;
      const queued = emailsResult.data.filter((e: { status: string }) => e.status === 'queued').length;
      setStats((prev) => ({
        ...prev,
        emailsSentToday: sent,
        emailsQueuedToday: queued,
      }));
    }

    if (autopilotResult.data) {
      setStats((prev) => ({
        ...prev,
        activeAutopilots: autopilotResult.data.length,
      }));
    }
  }

  function addEvent(event: Omit<AutomationEvent, 'id' | 'timestamp'>) {
    if (!isLive) return;

    const newEvent: AutomationEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    setEvents((prev) => [newEvent, ...prev.slice(0, 99)]);
  }

  function getEventIcon(type: AutomationEvent['type']) {
    switch (type) {
      case 'email_sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'email_failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'lead_scraped':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'email_generated':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'sequence_advanced':
        return <TrendingUp className="w-4 h-4 text-purple-500" />;
      case 'job_started':
        return <Play className="w-4 h-4 text-gray-500" />;
      case 'job_completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'job_failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  }

  function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  if (compact) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium text-gray-900">Live Activity</span>
          </div>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`p-1.5 rounded-lg transition ${isLive ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
          >
            {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-gray-900">{stats.emailsSentToday}</div>
            <div className="text-xs text-gray-500">Sent Today</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-gray-900">{stats.emailsQueuedToday}</div>
            <div className="text-xs text-gray-500">Queued</div>
          </div>
        </div>

        {activeJobs.length > 0 && (
          <div className="space-y-2">
            {activeJobs.slice(0, 2).map((job) => (
              <div key={job.id} className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
                <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-900 truncate">
                    {job.job_type.replace('_', ' ')}
                  </div>
                  <div className="w-full h-1 bg-amber-200 rounded-full mt-1">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${job.progress_percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <h3 className="font-semibold text-gray-900">Real-Time Automation Monitor</h3>
          {isLive && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Live</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadInitialData}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition ${
              isLive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isLive ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100 bg-gray-50">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.emailsSentToday}</div>
          <div className="text-xs text-gray-500">Emails Sent Today</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.emailsQueuedToday}</div>
          <div className="text-xs text-gray-500">Emails Queued</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{activeJobs.length}</div>
          <div className="text-xs text-gray-500">Active Jobs</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.activeAutopilots}</div>
          <div className="text-xs text-gray-500">Active Autopilots</div>
        </div>
      </div>

      {activeJobs.length > 0 && (
        <div className="p-4 border-b border-gray-100 bg-amber-50">
          <h4 className="text-sm font-medium text-amber-800 mb-3">Active Jobs</h4>
          <div className="space-y-3">
            {activeJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg p-3 border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                    <span className="font-medium text-gray-900">
                      {job.job_type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{job.progress_percentage}%</span>
                </div>
                {job.campaign_name && (
                  <p className="text-xs text-gray-500 mb-2">{job.campaign_name}</p>
                )}
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${job.progress_percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        ref={eventsContainerRef}
        className="max-h-80 overflow-y-auto"
      >
        {events.length === 0 ? (
          <div className="p-8 text-center">
            <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Waiting for automation events...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {events.map((event) => (
              <div key={event.id} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50">
                <div className="mt-0.5">{getEventIcon(event.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{event.message}</p>
                  {event.campaignName && (
                    <p className="text-xs text-gray-500">{event.campaignName}</p>
                  )}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {formatTime(event.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
