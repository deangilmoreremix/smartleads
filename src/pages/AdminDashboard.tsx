import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Users,
  CreditCard,
  TrendingUp,
  Mail,
  Target,
  UserPlus,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalLeads: number;
  totalEmailsSent: number;
  emailsThisMonth: number;
  subscriptionsByPlan: Record<string, number>;
  recentSignups: Array<{
    id: string;
    email: string;
    full_name: string | null;
    created_at: string;
    plan_type: string;
  }>;
  systemHealth: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    pendingEmails: number;
    activeJobs: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    try {
      setLoading(true);

      const now = new Date();
      const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      const [
        { count: totalUsers },
        { count: newUsers },
        { data: subscriptions },
        { count: totalCampaigns },
        { count: activeCampaigns },
        { count: totalLeads },
        { count: totalEmails },
        { count: recentEmails },
        { data: recentProfiles },
        { count: pendingEmails },
        { count: activeJobs },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startDate.toISOString()),
        supabase.from('subscriptions').select('plan_type, status'),
        supabase.from('campaigns').select('*', { count: 'exact', head: true }),
        supabase
          .from('campaigns')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active'),
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('emails').select('*', { count: 'exact', head: true }),
        supabase
          .from('emails')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('profiles')
          .select('id, email, full_name, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('emails')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'queued'),
        supabase
          .from('campaign_jobs')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'processing'),
      ]);

      const subscriptionsByPlan: Record<string, number> = {
        free: 0,
        starter: 0,
        professional: 0,
        enterprise: 0,
      };

      let activeSubscriptions = 0;
      subscriptions?.forEach((sub) => {
        if (sub.plan_type) {
          subscriptionsByPlan[sub.plan_type] = (subscriptionsByPlan[sub.plan_type] || 0) + 1;
        }
        if (sub.status === 'active') activeSubscriptions++;
      });

      const recentSignupsWithPlans = await Promise.all(
        (recentProfiles || []).map(async (profile) => {
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('plan_type')
            .eq('user_id', profile.id)
            .maybeSingle();
          return {
            ...profile,
            plan_type: sub?.plan_type || 'free',
          };
        })
      );

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeSubscriptions,
        newUsersThisMonth: newUsers || 0,
        totalCampaigns: totalCampaigns || 0,
        activeCampaigns: activeCampaigns || 0,
        totalLeads: totalLeads || 0,
        totalEmailsSent: totalEmails || 0,
        emailsThisMonth: recentEmails || 0,
        subscriptionsByPlan,
        recentSignups: recentSignupsWithPlans,
        systemHealth: {
          status: (pendingEmails || 0) > 1000 ? 'degraded' : 'healthy',
          pendingEmails: pendingEmails || 0,
          activeJobs: activeJobs || 0,
        },
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const calculateMRR = () => {
    if (!stats) return 0;
    const prices = { free: 0, starter: 49, professional: 149, enterprise: 499 };
    return Object.entries(stats.subscriptionsByPlan).reduce(
      (acc, [plan, count]) => acc + (prices[plan as keyof typeof prices] || 0) * count,
      0
    );
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400">Platform overview and key metrics</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
          className="bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={formatNumber(stats.totalUsers)}
          change={stats.newUsersThisMonth}
          changeLabel="new this period"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${formatNumber(calculateMRR())}`}
          subtitle="MRR"
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Active Campaigns"
          value={formatNumber(stats.activeCampaigns)}
          subtitle={`of ${formatNumber(stats.totalCampaigns)} total`}
          icon={Target}
          color="cyan"
        />
        <StatCard
          title="Emails Sent"
          value={formatNumber(stats.emailsThisMonth)}
          subtitle="this period"
          icon={Mail}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Subscription Distribution</h2>
          <div className="space-y-4">
            {Object.entries(stats.subscriptionsByPlan).map(([plan, count]) => {
              const percentage = stats.totalUsers > 0 ? (count / stats.totalUsers) * 100 : 0;
              const colors: Record<string, string> = {
                free: 'bg-slate-500',
                starter: 'bg-blue-500',
                professional: 'bg-cyan-500',
                enterprise: 'bg-amber-500',
              };
              return (
                <div key={plan}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-300 capitalize">{plan}</span>
                    <span className="text-sm text-white font-medium">
                      {count} users ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors[plan]} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{formatNumber(stats.totalLeads)}</p>
                <p className="text-sm text-slate-400">Total Leads</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {formatNumber(stats.totalEmailsSent)}
                </p>
                <p className="text-sm text-slate-400">Total Emails</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
                <p className="text-sm text-slate-400">Active Subscriptions</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-400" />
              System Health
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Status</span>
                <span
                  className={`flex items-center space-x-1 ${
                    stats.systemHealth.status === 'healthy'
                      ? 'text-green-400'
                      : stats.systemHealth.status === 'degraded'
                        ? 'text-amber-400'
                        : 'text-red-400'
                  }`}
                >
                  {stats.systemHealth.status === 'healthy' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  <span className="capitalize">{stats.systemHealth.status}</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Email Queue</span>
                <span className="text-white font-medium">
                  {stats.systemHealth.pendingEmails} pending
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Active Jobs</span>
                <span className="text-white font-medium">
                  {stats.systemHealth.activeJobs} running
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <UserPlus className="w-5 h-5 mr-2 text-green-400" />
              Recent Signups
            </h2>
            <div className="space-y-3">
              {stats.recentSignups.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0"
                >
                  <div>
                    <p className="text-white text-sm font-medium">
                      {user.full_name || user.email.split('@')[0]}
                    </p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded capitalize">
                      {user.plan_type}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  changeLabel,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  subtitle?: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'cyan' | 'amber';
}) {
  const colors = {
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30 text-green-400',
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
  };

  return (
    <div
      className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-5 transition hover:scale-[1.02]`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {change !== undefined && (
            <p className="text-sm mt-2 flex items-center text-green-400">
              <ArrowUpRight className="w-4 h-4 mr-1" />+{change} {changeLabel}
            </p>
          )}
          {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg bg-slate-800/50`}>
          <Icon className={`w-6 h-6 ${colors[color].split(' ').pop()}`} />
        </div>
      </div>
    </div>
  );
}
