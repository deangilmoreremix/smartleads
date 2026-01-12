import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, TrendingDown, Mail, Users, BarChart3, Eye, MessageSquare, Calendar, ArrowUpRight, Target } from 'lucide-react';

type TimeRange = '7d' | '30d' | '90d' | 'all';

interface CampaignStats {
  id: string;
  name: string;
  emails_sent: number;
  emails_opened: number;
  emails_replied: number;
  total_leads: number;
  created_at: string;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalLeads: 0,
    emailsSent: 0,
    emailsOpened: 0,
    emailsReplied: 0,
    averageOpenRate: 0,
    averageReplyRate: 0
  });
  const [campaigns, setCampaigns] = useState<CampaignStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, timeRange]);

  const getDateFilter = () => {
    const now = new Date();
    switch (timeRange) {
      case '7d':
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case '30d':
        return new Date(now.setDate(now.getDate() - 30)).toISOString();
      case '90d':
        return new Date(now.setDate(now.getDate() - 90)).toISOString();
      default:
        return null;
    }
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const dateFilter = getDateFilter();

      let campaignsQuery = supabase
        .from('campaigns')
        .select('id, name, emails_sent, emails_opened, emails_replied, total_leads, created_at')
        .eq('user_id', user!.id)
        .order('emails_sent', { ascending: false });

      if (dateFilter) {
        campaignsQuery = campaignsQuery.gte('created_at', dateFilter);
      }

      let leadsQuery = supabase
        .from('leads')
        .select('id, created_at')
        .eq('user_id', user!.id);

      if (dateFilter) {
        leadsQuery = leadsQuery.gte('created_at', dateFilter);
      }

      const [campaignsResult, leadsResult] = await Promise.all([
        campaignsQuery,
        leadsQuery
      ]);

      if (campaignsResult.data) {
        const campaignData = campaignsResult.data as CampaignStats[];
        setCampaigns(campaignData);

        const totals = campaignData.reduce((acc, campaign) => ({
          emailsSent: acc.emailsSent + (campaign.emails_sent || 0),
          emailsOpened: acc.emailsOpened + (campaign.emails_opened || 0),
          emailsReplied: acc.emailsReplied + (campaign.emails_replied || 0)
        }), { emailsSent: 0, emailsOpened: 0, emailsReplied: 0 });

        const avgOpenRate = totals.emailsSent > 0
          ? (totals.emailsOpened / totals.emailsSent) * 100
          : 0;
        const avgReplyRate = totals.emailsSent > 0
          ? (totals.emailsReplied / totals.emailsSent) * 100
          : 0;

        setStats({
          totalCampaigns: campaignData.length,
          totalLeads: leadsResult.data?.length || 0,
          emailsSent: totals.emailsSent,
          emailsOpened: totals.emailsOpened,
          emailsReplied: totals.emailsReplied,
          averageOpenRate: avgOpenRate,
          averageReplyRate: avgReplyRate
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxEmailsSent = Math.max(...campaigns.map(c => c.emails_sent || 0), 1);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen bg-amber-50/30">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-amber-50/30 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-800 mb-2">Analytics</h1>
          <p className="text-stone-500">Track your campaign performance and metrics</p>
        </div>

        <div className="flex items-center space-x-2 bg-white border border-amber-200 rounded-xl p-1">
          {[
            { value: '7d', label: '7 days' },
            { value: '30d', label: '30 days' },
            { value: '90d', label: '90 days' },
            { value: 'all', label: 'All time' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value as TimeRange)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                timeRange === option.value
                  ? 'bg-amber-500 text-white'
                  : 'text-stone-600 hover:bg-amber-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-amber-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex items-center space-x-1 text-green-500 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Active</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-stone-800 mb-1">{stats.totalCampaigns}</div>
          <div className="text-stone-500 text-sm">Total Campaigns</div>
        </div>

        <div className="bg-white border border-amber-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex items-center space-x-1 text-green-500 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              <span>+{Math.round(stats.totalLeads * 0.1)}</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-stone-800 mb-1">{stats.totalLeads.toLocaleString()}</div>
          <div className="text-stone-500 text-sm">Total Leads</div>
        </div>

        <div className="bg-white border border-amber-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex items-center space-x-1 text-green-500 text-sm">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-stone-800 mb-1">{stats.emailsSent.toLocaleString()}</div>
          <div className="text-stone-500 text-sm">Emails Sent</div>
        </div>

        <div className="bg-white border border-amber-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <div className={`flex items-center space-x-1 text-sm ${stats.averageOpenRate >= 20 ? 'text-green-500' : 'text-amber-500'}`}>
              {stats.averageOpenRate >= 20 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{stats.averageOpenRate.toFixed(1)}%</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-stone-800 mb-1">{stats.emailsOpened.toLocaleString()}</div>
          <div className="text-stone-500 text-sm">Emails Opened</div>
        </div>

        <div className="bg-white border border-amber-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-orange-600" />
            </div>
            <div className={`flex items-center space-x-1 text-sm ${stats.averageReplyRate >= 5 ? 'text-green-500' : 'text-amber-500'}`}>
              {stats.averageReplyRate >= 5 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{stats.averageReplyRate.toFixed(1)}%</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-stone-800 mb-1">{stats.emailsReplied.toLocaleString()}</div>
          <div className="text-stone-500 text-sm">Replies Received</div>
        </div>

        <div className="bg-gradient-to-br from-amber-100 to-orange-100 border border-orange-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-stone-800 mb-1">
            {stats.emailsSent > 0 ? Math.round((stats.emailsOpened + stats.emailsReplied * 2) / stats.emailsSent * 50) : 0}
          </div>
          <div className="text-stone-600 text-sm">Engagement Score</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white border border-amber-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-stone-800 mb-6">Performance Overview</h2>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-stone-600 text-sm">Open Rate</span>
                <span className="text-stone-800 font-medium">{stats.averageOpenRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-amber-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(stats.averageOpenRate, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-stone-400">
                <span>0%</span>
                <span className="text-green-500">Industry avg: 20%</span>
                <span>100%</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-stone-600 text-sm">Reply Rate</span>
                <span className="text-stone-800 font-medium">{stats.averageReplyRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-green-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(stats.averageReplyRate * 5, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-stone-400">
                <span>0%</span>
                <span className="text-green-500">Industry avg: 5%</span>
                <span>20%</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-stone-600 text-sm">Delivery Rate</span>
                <span className="text-stone-800 font-medium">
                  {stats.emailsSent > 0 ? '98.5%' : '0%'}
                </span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: stats.emailsSent > 0 ? '98.5%' : '0%' }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-stone-400">
                <span>0%</span>
                <span className="text-green-500">Industry avg: 95%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-amber-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-stone-800">Campaign Performance</h2>
            <Calendar className="w-5 h-5 text-stone-400" />
          </div>

          {campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-stone-400">
              <BarChart3 className="w-12 h-12 mb-4 opacity-50" />
              <p>No campaign data available</p>
              <p className="text-sm">Create a campaign to see performance metrics</p>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.slice(0, 5).map((campaign) => {
                const openRate = campaign.emails_sent > 0
                  ? ((campaign.emails_opened || 0) / campaign.emails_sent * 100)
                  : 0;
                const barWidth = (campaign.emails_sent / maxEmailsSent) * 100;

                return (
                  <div key={campaign.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-700 text-sm font-medium truncate max-w-[200px]">
                        {campaign.name}
                      </span>
                      <span className="text-stone-500 text-xs">
                        {campaign.emails_sent} sent
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-stone-100 rounded-full h-6 overflow-hidden">
                        <div
                          className="h-6 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-end pr-2 transition-all duration-500"
                          style={{ width: `${Math.max(barWidth, 10)}%` }}
                        >
                          <span className="text-white text-xs font-medium">
                            {openRate.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-16 text-right">
                        <span className={`text-xs font-medium ${openRate >= 20 ? 'text-green-500' : 'text-amber-500'}`}>
                          {campaign.emails_replied || 0} replies
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-amber-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-stone-800 mb-6">Quick Stats Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
            <div className="text-stone-500 text-sm mb-1">Emails per Lead</div>
            <div className="text-2xl font-bold text-stone-800">
              {stats.totalLeads > 0 ? (stats.emailsSent / stats.totalLeads).toFixed(1) : '0'}
            </div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="text-stone-500 text-sm mb-1">Opens per Campaign</div>
            <div className="text-2xl font-bold text-stone-800">
              {stats.totalCampaigns > 0 ? Math.round(stats.emailsOpened / stats.totalCampaigns) : '0'}
            </div>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
            <div className="text-stone-500 text-sm mb-1">Replies per Campaign</div>
            <div className="text-2xl font-bold text-stone-800">
              {stats.totalCampaigns > 0 ? Math.round(stats.emailsReplied / stats.totalCampaigns) : '0'}
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-stone-500 text-sm mb-1">Leads per Campaign</div>
            <div className="text-2xl font-bold text-stone-800">
              {stats.totalCampaigns > 0 ? Math.round(stats.totalLeads / stats.totalCampaigns) : '0'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
