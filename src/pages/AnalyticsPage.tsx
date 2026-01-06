import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, Mail, Users, BarChart3, Eye, MessageSquare } from 'lucide-react';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalLeads: 0,
    emailsSent: 0,
    emailsOpened: 0,
    emailsReplied: 0,
    averageOpenRate: 0,
    averageReplyRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    try {
      const [campaignsResult, leadsResult] = await Promise.all([
        supabase
          .from('campaigns')
          .select('*')
          .eq('user_id', user!.id),
        supabase
          .from('leads')
          .select('id')
          .eq('user_id', user!.id)
      ]);

      if (campaignsResult.data) {
        const campaigns = campaignsResult.data;
        const totals = campaigns.reduce((acc, campaign) => ({
          emailsSent: acc.emailsSent + campaign.emails_sent,
          emailsOpened: acc.emailsOpened + campaign.emails_opened,
          emailsReplied: acc.emailsReplied + campaign.emails_replied
        }), { emailsSent: 0, emailsOpened: 0, emailsReplied: 0 });

        const avgOpenRate = totals.emailsSent > 0
          ? (totals.emailsOpened / totals.emailsSent) * 100
          : 0;
        const avgReplyRate = totals.emailsSent > 0
          ? (totals.emailsReplied / totals.emailsSent) * 100
          : 0;

        setStats({
          totalCampaigns: campaigns.length,
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

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-slate-400">Track your campaign performance and metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.totalCampaigns}</div>
          <div className="text-slate-400 text-sm">Total Campaigns</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-cyan-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.totalLeads}</div>
          <div className="text-slate-400 text-sm">Total Leads</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-purple-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.emailsSent}</div>
          <div className="text-slate-400 text-sm">Emails Sent</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.emailsOpened}</div>
          <div className="text-slate-400 text-sm">Emails Opened</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-orange-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.emailsReplied}</div>
          <div className="text-slate-400 text-sm">Replies Received</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.averageOpenRate.toFixed(1)}%</div>
          <div className="text-slate-400 text-sm">Average Open Rate</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Performance Overview</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm">Open Rate</span>
                <span className="text-white font-medium">{stats.averageOpenRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(stats.averageOpenRate, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm">Reply Rate</span>
                <span className="text-white font-medium">{stats.averageReplyRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(stats.averageReplyRate, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm">Conversion Rate</span>
                <span className="text-white font-medium">0.0%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                  style={{ width: '0%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Engagement Metrics</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
              <div>
                <div className="text-slate-400 text-sm mb-1">Total Interactions</div>
                <div className="text-2xl font-bold text-white">{stats.emailsOpened + stats.emailsReplied}</div>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
              <div>
                <div className="text-slate-400 text-sm mb-1">Engagement Score</div>
                <div className="text-2xl font-bold text-white">
                  {stats.emailsSent > 0 ? ((stats.emailsOpened + stats.emailsReplied * 2) / stats.emailsSent * 50).toFixed(0) : 0}
                </div>
              </div>
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
