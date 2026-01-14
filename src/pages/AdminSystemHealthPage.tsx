import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Activity,
  Server,
  Database,
  Mail,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Zap,
  HardDrive,
  Cpu,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SystemHealth {
  database: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    latency: number;
    connections: number;
  };
  emailQueue: {
    pending: number;
    processing: number;
    failed: number;
    sentToday: number;
  };
  jobs: {
    active: number;
    pending: number;
    failed: number;
    completed: number;
  };
  storage: {
    totalFiles: number;
    totalSize: number;
  };
  api: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    lastCheck: string;
  };
}

interface QueueItem {
  id: string;
  status: string;
  created_at: string;
  campaign_name?: string;
  error_message?: string;
}

export default function AdminSystemHealthPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [failedJobs, setFailedJobs] = useState<QueueItem[]>([]);
  const [showFailedJobs, setShowFailedJobs] = useState(false);

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadHealth = async () => {
    try {
      if (!health) setLoading(true);
      else setRefreshing(true);

      const startTime = Date.now();
      const { error: dbError } = await supabase.from('profiles').select('id').limit(1);
      const dbLatency = Date.now() - startTime;

      const [
        { count: pendingEmails },
        { count: failedEmails },
        { count: sentToday },
        { count: activeJobs },
        { count: pendingJobs },
        { count: failedJobsCount },
        { count: completedJobs },
        { count: totalFiles },
        { data: failedJobsList },
      ] = await Promise.all([
        supabase.from('emails').select('*', { count: 'exact', head: true }).eq('status', 'queued'),
        supabase.from('emails').select('*', { count: 'exact', head: true }).eq('status', 'failed'),
        supabase
          .from('emails')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'sent')
          .gte('sent_at', new Date().toISOString().split('T')[0]),
        supabase
          .from('campaign_jobs')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'processing'),
        supabase
          .from('campaign_jobs')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase
          .from('campaign_jobs')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'failed'),
        supabase
          .from('campaign_jobs')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed'),
        supabase.from('file_uploads').select('*', { count: 'exact', head: true }),
        supabase
          .from('campaign_jobs')
          .select('id, status, created_at, error_message, campaign_id')
          .eq('status', 'failed')
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      const failedWithCampaigns = await Promise.all(
        (failedJobsList || []).map(async (job) => {
          const { data: campaign } = await supabase
            .from('campaigns')
            .select('name')
            .eq('id', job.campaign_id)
            .maybeSingle();
          return { ...job, campaign_name: campaign?.name };
        })
      );

      setFailedJobs(failedWithCampaigns);

      setHealth({
        database: {
          status: dbError ? 'unhealthy' : dbLatency > 500 ? 'degraded' : 'healthy',
          latency: dbLatency,
          connections: 0,
        },
        emailQueue: {
          pending: pendingEmails || 0,
          processing: 0,
          failed: failedEmails || 0,
          sentToday: sentToday || 0,
        },
        jobs: {
          active: activeJobs || 0,
          pending: pendingJobs || 0,
          failed: failedJobsCount || 0,
          completed: completedJobs || 0,
        },
        storage: {
          totalFiles: totalFiles || 0,
          totalSize: 0,
        },
        api: {
          status: 'healthy',
          lastCheck: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error loading health:', error);
      toast.error('Failed to load system health');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const retryFailedJobs = async () => {
    try {
      const { error } = await supabase
        .from('campaign_jobs')
        .update({ status: 'pending', error_message: null })
        .eq('status', 'failed');

      if (error) throw error;

      toast.success('Failed jobs requeued');
      loadHealth();
    } catch (error) {
      console.error('Error retrying jobs:', error);
      toast.error('Failed to retry jobs');
    }
  };

  const clearFailedEmails = async () => {
    try {
      const { error } = await supabase
        .from('emails')
        .update({ status: 'queued', error_message: null })
        .eq('status', 'failed');

      if (error) throw error;

      toast.success('Failed emails requeued');
      loadHealth();
    } catch (error) {
      console.error('Error clearing failed emails:', error);
      toast.error('Failed to clear failed emails');
    }
  };

  const getStatusColor = (status: 'healthy' | 'degraded' | 'unhealthy') => {
    switch (status) {
      case 'healthy':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'degraded':
        return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
      case 'unhealthy':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
    }
  };

  const getStatusIcon = (status: 'healthy' | 'degraded' | 'unhealthy') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5" />;
      case 'unhealthy':
        return <XCircle className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading system health...</p>
        </div>
      </div>
    );
  }

  if (!health) return null;

  const overallStatus =
    health.database.status === 'unhealthy' || health.api.status === 'unhealthy'
      ? 'unhealthy'
      : health.database.status === 'degraded' || health.api.status === 'degraded'
        ? 'degraded'
        : 'healthy';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">System Health</h1>
          <p className="text-slate-400">Monitor system status and performance</p>
        </div>
        <button
          onClick={loadHealth}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div
        className={`p-6 rounded-xl border ${getStatusColor(overallStatus)} flex items-center justify-between`}
      >
        <div className="flex items-center space-x-4">
          {getStatusIcon(overallStatus)}
          <div>
            <h2 className="text-xl font-bold capitalize">{overallStatus}</h2>
            <p className="text-sm opacity-80">
              Last checked: {new Date(health.api.lastCheck).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <Activity className="w-12 h-12 opacity-50" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title="Database"
          status={health.database.status}
          icon={Database}
          metrics={[{ label: 'Latency', value: `${health.database.latency}ms` }]}
        />
        <StatusCard
          title="API Services"
          status={health.api.status}
          icon={Server}
          metrics={[{ label: 'Status', value: 'Operational' }]}
        />
        <StatusCard
          title="Email Queue"
          status={health.emailQueue.pending > 500 ? 'degraded' : 'healthy'}
          icon={Mail}
          metrics={[
            { label: 'Pending', value: health.emailQueue.pending.toString() },
            { label: 'Sent Today', value: health.emailQueue.sentToday.toString() },
          ]}
        />
        <StatusCard
          title="Job Queue"
          status={health.jobs.failed > 10 ? 'degraded' : 'healthy'}
          icon={Cpu}
          metrics={[
            { label: 'Active', value: health.jobs.active.toString() },
            { label: 'Pending', value: health.jobs.pending.toString() },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Mail className="w-5 h-5 mr-2 text-blue-400" />
              Email Queue Status
            </h3>
            {health.emailQueue.failed > 0 && (
              <button
                onClick={clearFailedEmails}
                className="text-sm px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg transition"
              >
                Retry Failed
              </button>
            )}
          </div>
          <div className="space-y-4">
            <QueueBar
              label="Pending"
              value={health.emailQueue.pending}
              max={1000}
              color="bg-blue-500"
            />
            <QueueBar
              label="Failed"
              value={health.emailQueue.failed}
              max={100}
              color="bg-red-500"
            />
            <div className="pt-4 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Sent Today</span>
                <span className="text-2xl font-bold text-green-400">
                  {health.emailQueue.sentToday}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Zap className="w-5 h-5 mr-2 text-amber-400" />
              Job Queue Status
            </h3>
            {health.jobs.failed > 0 && (
              <button
                onClick={retryFailedJobs}
                className="text-sm px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg transition"
              >
                Retry Failed
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <MetricCard label="Active" value={health.jobs.active} color="text-green-400" />
            <MetricCard label="Pending" value={health.jobs.pending} color="text-blue-400" />
            <MetricCard label="Failed" value={health.jobs.failed} color="text-red-400" />
            <MetricCard label="Completed" value={health.jobs.completed} color="text-slate-400" />
          </div>
        </div>
      </div>

      {failedJobs.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <button
            onClick={() => setShowFailedJobs(!showFailedJobs)}
            className="w-full flex items-center justify-between text-left"
          >
            <h3 className="text-lg font-semibold text-white flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
              Failed Jobs ({failedJobs.length})
            </h3>
            <span className="text-slate-400 text-sm">{showFailedJobs ? 'Hide' : 'Show'}</span>
          </button>

          {showFailedJobs && (
            <div className="mt-4 space-y-3">
              {failedJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-4 bg-slate-900 rounded-lg border border-red-500/20"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white font-medium">{job.campaign_name || 'Unknown Campaign'}</p>
                      <p className="text-sm text-red-400 mt-1">{job.error_message || 'Unknown error'}</p>
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(job.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <HardDrive className="w-5 h-5 mr-2 text-cyan-400" />
          Storage Usage
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-white">{health.storage.totalFiles}</p>
            <p className="text-slate-400">Total Files</p>
          </div>
          <BarChart3 className="w-16 h-16 text-cyan-400 opacity-50" />
        </div>
      </div>
    </div>
  );
}

function StatusCard({
  title,
  status,
  icon: Icon,
  metrics,
}: {
  title: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  icon: React.ElementType;
  metrics: { label: string; value: string }[];
}) {
  const statusColors = {
    healthy: 'border-green-500/30 bg-green-500/5',
    degraded: 'border-amber-500/30 bg-amber-500/5',
    unhealthy: 'border-red-500/30 bg-red-500/5',
  };

  const indicatorColors = {
    healthy: 'bg-green-500',
    degraded: 'bg-amber-500',
    unhealthy: 'bg-red-500',
  };

  return (
    <div className={`p-5 rounded-xl border ${statusColors[status]}`}>
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-5 h-5 text-slate-400" />
        <div className={`w-3 h-3 rounded-full ${indicatorColors[status]} animate-pulse`} />
      </div>
      <h4 className="text-white font-semibold">{title}</h4>
      <div className="mt-2 space-y-1">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex items-center justify-between text-sm">
            <span className="text-slate-400">{metric.label}</span>
            <span className="text-white">{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QueueBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="text-sm text-white font-medium">{value}</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-slate-900 rounded-lg p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}
