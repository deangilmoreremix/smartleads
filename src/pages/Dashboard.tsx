import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BarChart3, Gift, Mail, Zap, TrendingUp, Users, Send, AlertCircle, RefreshCw } from 'lucide-react';
import { useOnboarding } from '../contexts/OnboardingContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getErrorMessage } from '../lib/utils';
import InboxWidget from '../components/InboxWidget';

interface DashboardStats {
  totalCampaigns: number;
  activeLeads: number;
  emailsSent: number;
  responseRate: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { state, activeTour, startTour } = useOnboarding();
  const [stats, setStats] = useState<DashboardStats>({
    totalCampaigns: 0,
    activeLeads: 0,
    emailsSent: 0,
    responseRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hasSeenTourThisSession = sessionStorage.getItem('dashboard_tour_shown');

    if (state.welcome_completed && !activeTour && !hasSeenTourThisSession) {
      const timer = setTimeout(() => {
        startTour('dashboard');
        sessionStorage.setItem('dashboard_tour_shown', 'true');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.welcome_completed, activeTour, startTour]);

  const loadStats = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const results = await Promise.allSettled([
        supabase
          .from('campaigns')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('email_sends')
          .select('id, status', { count: 'exact' })
          .eq('user_id', user.id),
      ]);

      const campaignsResult = results[0].status === 'fulfilled' ? results[0].value : null;
      const leadsResult = results[1].status === 'fulfilled' ? results[1].value : null;
      const emailsResult = results[2].status === 'fulfilled' ? results[2].value : null;

      const hasAnyError = results.some(
        r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.error)
      );

      if (hasAnyError) {
        const firstError = results.find(
          r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.error)
        );
        const errorMsg = firstError?.status === 'rejected'
          ? getErrorMessage(firstError.reason)
          : firstError?.status === 'fulfilled'
          ? firstError.value.error?.message
          : 'Failed to load some data';
        setError(errorMsg || 'Failed to load dashboard stats');
      }

      const sentEmails = emailsResult?.count || 0;
      const repliedEmails = emailsResult?.data?.filter(e => e.status === 'replied').length || 0;

      setStats({
        totalCampaigns: campaignsResult?.count || 0,
        activeLeads: leadsResult?.count || 0,
        emailsSent: sentEmails,
        responseRate: sentEmails > 0 ? Math.round((repliedEmails / sentEmails) * 100) : 0,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [user]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome to your SmartLeads dashboard</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
            <button
              onClick={loadStats}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-sm text-gray-500">Campaigns</span>
            </div>
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">{stats.totalCampaigns}</p>
            )}
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Active Leads</span>
            </div>
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">{stats.activeLeads}</p>
            )}
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Send className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Emails Sent</span>
            </div>
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">{stats.emailsSent}</p>
            )}
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-teal-600" />
              </div>
              <span className="text-sm text-gray-500">Response Rate</span>
            </div>
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">{stats.responseRate}%</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                data-tour="start-campaign"
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Start Campaign</h2>
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  Launch your Google Maps Agent and get replies automatically with AI.
                </p>
                <Link
                  to="/dashboard/campaigns/new"
                  className="block w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center px-4 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition text-sm"
                >
                  Start New Campaign
                </Link>
              </div>

              <div
                data-tour="autopilot"
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Autopilot</h2>
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  Run outreach 24/7. Auto-scrape leads, generate AI emails, and send.
                </p>
                <Link
                  to="/dashboard/autopilot"
                  className="block w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center px-4 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition text-sm"
                >
                  Autopilot Dashboard
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                data-tour="campaigns"
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Campaigns</h2>
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-gray-600 mb-5 text-sm">
                  View and manage your campaigns with analytics.
                </p>
                <Link
                  to="/dashboard/campaigns"
                  className="block w-full bg-gray-900 text-white text-center px-4 py-2.5 rounded-xl font-semibold hover:bg-gray-800 transition text-sm"
                >
                  View Campaigns
                </Link>
              </div>

              <div
                data-tour="accounts"
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Accounts</h2>
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-gray-600 mb-5 text-sm">
                  Manage Google accounts and email providers.
                </p>
                <Link
                  to="/dashboard/accounts"
                  className="block w-full bg-gray-900 text-white text-center px-4 py-2.5 rounded-xl font-semibold hover:bg-gray-800 transition text-sm"
                >
                  Manage Accounts
                </Link>
              </div>

              <div
                data-tour="templates"
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Templates</h2>
                  <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-gray-600 mb-5 text-sm">
                  Create and manage AI email templates.
                </p>
                <Link
                  to="/dashboard/templates"
                  className="block w-full bg-gray-900 text-white text-center px-4 py-2.5 rounded-xl font-semibold hover:bg-gray-800 transition text-sm"
                >
                  Manage Templates
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <InboxWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
