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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800 mb-2">Analytics</h1>
        <p className="text-stone-500">Track your campaign performance and metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-amber-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-amber-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-stone-800 mb-1">{stats.totalCampaigns}</div>
          <div className="text-stone-500 text-sm">Total Campaigns</div>
        </div>

        <div className="bg-white border border-amber-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-stone-800 mb-1">{stats.totalLeads}</div>
          <div className="text-stone-500 text-sm">Total Leads</div>
        </div>

        <div className="bg-white border border-amber-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-amber-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-stone-800 mb-1">{stats.emailsSent}</div>
          <div className="text-stone-500 text-sm">Emails Sent</div>
        </div>

        <div className="bg-white border border-amber-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-stone-800 mb-1">{stats.emailsOpened}</div>
          <div className="text-stone-500 text-sm">Emails Opened</div>
        </div>

        <div className="bg-white border border-amber-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-stone-800 mb-1">{stats.emailsReplied}</div>
          <div className="text-stone-500 text-sm">Replies Received</div>
        </div>

        <div className="bg-gradient-to-br from-amber-100 to-orange-100 border border-orange-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-stone-800 mb-1">{stats.averageOpenRate.toFixed(1)}%</div>
          <div className="text-stone-600 text-sm">Average Open Rate</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-amber-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-stone-800 mb-6">Performance Overview</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-stone-600 text-sm">Open Rate</span>
                <span className="text-stone-800 font-medium">{stats.averageOpenRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-amber-100 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(stats.averageOpenRate, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-stone-600 text-sm">Reply Rate</span>
                <span className="text-stone-800 font-medium">{stats.averageReplyRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-green-100 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(stats.averageReplyRate, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-stone-600 text-sm">Conversion Rate</span>
                <span className="text-stone-800 font-medium">0.0%</span>
              </div>
              <div className="w-full bg-amber-100 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-600 h-2 rounded-full transition-all"
                  style={{ width: '0%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-amber-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-stone-800 mb-6">Engagement Metrics</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-100">
              <div>
                <div className="text-stone-500 text-sm mb-1">Total Interactions</div>
                <div className="text-2xl font-bold text-stone-800">{stats.emailsOpened + stats.emailsReplied}</div>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100">
              <div>
                <div className="text-stone-500 text-sm mb-1">Engagement Score</div>
                <div className="text-2xl font-bold text-stone-800">
                  {stats.emailsSent > 0 ? ((stats.emailsOpened + stats.emailsReplied * 2) / stats.emailsSent * 50).toFixed(0) : 0}
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
