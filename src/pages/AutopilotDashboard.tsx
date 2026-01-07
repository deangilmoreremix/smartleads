import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  Zap,
  Play,
  Pause,
  RefreshCw,
  Users,
  Mail,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronRight,
  Activity,
  Calendar,
  BarChart3,
  Shield,
  MessageSquare,
  Folder,
  Webhook,
  Settings,
  Filter,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import FunnelVisualization from '../components/FunnelVisualization';
import EmailHealthDisplay from '../components/EmailHealthDisplay';
import ReplyClassificationPanel from '../components/ReplyClassificationPanel';
import CampaignGroupsManager from '../components/CampaignGroupsManager';
import WebhookManager from '../components/WebhookManager';

interface AutopilotCampaign {
  id: string;
  campaign_id: string;
  is_enabled: boolean;
  daily_email_limit: number;
  send_interval_minutes: number;
  campaigns: {
    id: string;
    name: string;
    niche: string;
    location: string;
    status: string;
    total_leads: number;
    emails_sent: number;
    last_autopilot_run: string | null;
    total_autopilot_emails_sent: number;
  };
}

interface AutopilotRun {
  id: string;
  campaign_id: string;
  run_type: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  leads_scraped: number;
  emails_generated: number;
  emails_sent: number;
  error_message: string | null;
  created_at: string;
  campaigns?: {
    name: string;
  };
}

type TabId = 'overview' | 'funnel' | 'health' | 'replies' | 'groups' | 'webhooks';

export default function AutopilotDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [campaigns, setCampaigns] = useState<AutopilotCampaign[]>([]);
  const [recentRuns, setRecentRuns] = useState<AutopilotRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState<string | null>(null);
  const [stats, setStats] = useState({
    activeCampaigns: 0,
    totalEmailsSent: 0,
    totalLeadsScraped: 0,
    runsToday: 0,
    openRate: 0,
    replyRate: 0,
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  async function loadData() {
    try {
      const [campaignsResult, runsResult, analyticsResult] = await Promise.all([
        supabase
          .from('campaign_autopilot_settings')
          .select(`
            *,
            campaigns!inner (
              id,
              name,
              niche,
              location,
              status,
              total_leads,
              emails_sent,
              last_autopilot_run,
              total_autopilot_emails_sent
            )
          `)
          .eq('campaigns.user_id', user!.id)
          .order('is_enabled', { ascending: false }),
        supabase
          .from('autopilot_runs')
          .select(`
            *,
            campaigns (name)
          `)
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('analytics_events')
          .select('event_type')
          .eq('user_id', user!.id)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      ]);

      if (campaignsResult.data) {
        setCampaigns(campaignsResult.data);

        const activeCampaigns = campaignsResult.data.filter((c) => c.is_enabled).length;
        const totalEmailsSent = campaignsResult.data.reduce(
          (sum, c) => sum + (c.campaigns.total_autopilot_emails_sent || 0),
          0
        );

        setStats((prev) => ({
          ...prev,
          activeCampaigns,
          totalEmailsSent,
        }));
      }

      if (runsResult.data) {
        setRecentRuns(runsResult.data);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const runsToday = runsResult.data.filter(
          (r) => new Date(r.created_at) >= today
        ).length;
        const totalLeadsScraped = runsResult.data.reduce(
          (sum, r) => sum + (r.leads_scraped || 0),
          0
        );

        setStats((prev) => ({
          ...prev,
          runsToday,
          totalLeadsScraped,
        }));
      }

      if (analyticsResult.data) {
        const events = analyticsResult.data;
        const sent = events.filter((e) => e.event_type === 'email_sent').length;
        const opened = events.filter((e) => e.event_type === 'email_opened').length;
        const replied = events.filter((e) => e.event_type === 'email_replied').length;

        setStats((prev) => ({
          ...prev,
          openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
          replyRate: sent > 0 ? Math.round((replied / sent) * 100) : 0,
        }));
      }
    } catch (error) {
      console.error('Error loading autopilot data:', error);
      toast.error('Failed to load autopilot data');
    } finally {
      setLoading(false);
    }
  }

  async function triggerAutopilot(campaignId: string) {
    setTriggering(campaignId);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/campaign-autopilot`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            campaignId,
            userId: user!.id,
            runType: 'full_cycle',
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success(
          `Autopilot cycle completed: ${result.leadsScraped || 0} leads scraped, ${result.emailsGenerated || 0} emails generated, ${result.emailsSent || 0} sent`
        );
        loadData();
      } else {
        throw new Error(result.error || 'Autopilot failed');
      }
    } catch (error) {
      console.error('Error triggering autopilot:', error);
      toast.error('Failed to trigger autopilot');
    } finally {
      setTriggering(null);
    }
  }

  async function toggleCampaignAutopilot(campaignId: string, currentState: boolean) {
    try {
      const { error } = await supabase
        .from('campaign_autopilot_settings')
        .update({ is_enabled: !currentState })
        .eq('campaign_id', campaignId);

      if (error) throw error;

      toast.success(currentState ? 'Autopilot paused' : 'Autopilot enabled');
      loadData();
    } catch (error) {
      console.error('Error toggling autopilot:', error);
      toast.error('Failed to toggle autopilot');
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  }

  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  const tabs = [
    { id: 'overview' as TabId, label: 'Overview', icon: Activity },
    { id: 'funnel' as TabId, label: 'Funnel', icon: BarChart3 },
    { id: 'health' as TabId, label: 'Email Health', icon: Shield },
    { id: 'replies' as TabId, label: 'Replies', icon: MessageSquare },
    { id: 'groups' as TabId, label: 'Groups', icon: Folder },
    { id: 'webhooks' as TabId, label: 'Webhooks', icon: Webhook },
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner message="Loading autopilot dashboard..." />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Autopilot Dashboard</h1>
              </div>
              <p className="text-gray-600">Monitor and control your automated outreach campaigns</p>
            </div>
            <Link
              to="/dashboard/settings"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-white hover:shadow-sm rounded-xl transition"
            >
              <Settings className="w-5 h-5" />
              Settings
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard
            icon={<Activity className="w-5 h-5 text-green-600" />}
            value={stats.activeCampaigns}
            label="Active Autopilots"
            color="bg-green-100"
          />
          <StatCard
            icon={<Mail className="w-5 h-5 text-amber-600" />}
            value={stats.totalEmailsSent}
            label="Emails Sent"
            color="bg-amber-100"
          />
          <StatCard
            icon={<Users className="w-5 h-5 text-blue-600" />}
            value={stats.totalLeadsScraped}
            label="Leads Scraped"
            color="bg-blue-100"
          />
          <StatCard
            icon={<Calendar className="w-5 h-5 text-teal-600" />}
            value={stats.runsToday}
            label="Runs Today"
            color="bg-teal-100"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
            value={`${stats.openRate}%`}
            label="Open Rate"
            color="bg-emerald-100"
          />
          <StatCard
            icon={<MessageSquare className="w-5 h-5 text-sky-600" />}
            value={`${stats.replyRate}%`}
            label="Reply Rate"
            color="bg-sky-100"
          />
        </div>

        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Autopilot Campaigns</h2>
                  <button
                    onClick={loadData}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>

                {campaigns.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-gray-900 font-medium mb-2">No autopilot campaigns</h3>
                    <p className="text-gray-600 text-sm mb-6">
                      Enable autopilot on any campaign to get started
                    </p>
                    <Link
                      to="/dashboard/campaigns"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition"
                    >
                      View Campaigns
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {campaigns.map((item) => (
                      <div key={item.id} className="p-4 hover:bg-gray-50 transition">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <Link
                                to={`/dashboard/campaigns/${item.campaigns.id}`}
                                className="text-gray-900 font-medium hover:text-amber-600 transition"
                              >
                                {item.campaigns.name}
                              </Link>
                              {item.is_enabled ? (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                  Active
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                                  Paused
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{item.campaigns.niche}</span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {item.campaigns.total_leads} leads
                              </span>
                              <span className="flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5" />
                                {item.daily_email_limit}/day
                              </span>
                              {item.campaigns.last_autopilot_run && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {formatTimeAgo(item.campaigns.last_autopilot_run)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => triggerAutopilot(item.campaigns.id)}
                              disabled={triggering === item.campaigns.id}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition disabled:opacity-50"
                              title="Run now"
                            >
                              {triggering === item.campaigns.id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Play className="w-5 h-5" />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                toggleCampaignAutopilot(item.campaigns.id, item.is_enabled)
                              }
                              className={`p-2 rounded-lg transition ${
                                item.is_enabled
                                  ? 'text-orange-600 hover:bg-orange-50'
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                              title={item.is_enabled ? 'Pause' : 'Enable'}
                            >
                              {item.is_enabled ? (
                                <Pause className="w-5 h-5" />
                              ) : (
                                <Zap className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                </div>

                {recentRuns.length === 0 ? (
                  <div className="p-8 text-center">
                    <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No recent autopilot runs</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                    {recentRuns.map((run) => (
                      <div key={run.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">{getStatusIcon(run.status)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-900 text-sm font-medium truncate">
                              {run.campaigns?.name || 'Campaign'}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {run.run_type.replace('_', ' ')} - {formatTimeAgo(run.started_at)}
                            </p>
                            {run.status === 'completed' && (
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                {run.leads_scraped > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {run.leads_scraped}
                                  </span>
                                )}
                                {run.emails_generated > 0 && (
                                  <span className="flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    {run.emails_generated}
                                  </span>
                                )}
                                {run.emails_sent > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {run.emails_sent}
                                  </span>
                                )}
                              </div>
                            )}
                            {run.status === 'failed' && run.error_message && (
                              <p className="text-red-500 text-xs mt-1 truncate" title={run.error_message}>
                                {run.error_message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-5 h-5 text-amber-600" />
                  <h3 className="text-gray-900 font-medium">API Endpoint</h3>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  Use this endpoint to integrate with external systems or trigger autopilot cycles.
                </p>
                <div className="p-3 bg-white/50 rounded-xl">
                  <code className="text-amber-700 text-xs break-all">
                    POST {import.meta.env.VITE_SUPABASE_URL}/functions/v1/webhook-endpoint?user_id=YOUR_ID
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'funnel' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FunnelVisualization title="Overall Conversion Funnel" />
            <div className="space-y-6">
              {campaigns.slice(0, 3).map((item) => (
                <FunnelVisualization
                  key={item.campaign_id}
                  campaignId={item.campaign_id}
                  title={item.campaigns.name}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <EmailHealthDisplay />
          </div>
        )}

        {activeTab === 'replies' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <ReplyClassificationPanel />
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <CampaignGroupsManager />
          </div>
        )}

        {activeTab === 'webhooks' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <WebhookManager />
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-gray-500 text-sm">{label}</div>
    </div>
  );
}
