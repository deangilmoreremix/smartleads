import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  CreditCard,
  Search,
  Edit,
  Plus,
  Minus,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SubscriptionWithUser {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  credits_remaining: number;
  credits_total: number;
  billing_cycle_start: string;
  billing_cycle_end: string;
  created_at: string;
  user?: {
    email: string;
    full_name: string | null;
    company_name: string | null;
  };
}

export default function AdminSubscriptionsPage() {
  const { user: currentUser } = useAuth();
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithUser[]>([]);
  const [filteredSubs, setFilteredSubs] = useState<SubscriptionWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedSub, setSelectedSub] = useState<SubscriptionWithUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [creditAdjustment, setCreditAdjustment] = useState({ amount: 0, reason: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  useEffect(() => {
    filterSubscriptions();
  }, [subscriptions, searchQuery, filterPlan, filterStatus]);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const { data: subs, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const subsWithUsers = await Promise.all(
        (subs || []).map(async (sub) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, full_name, company_name')
            .eq('id', sub.user_id)
            .maybeSingle();
          return { ...sub, user: profile || undefined };
        })
      );

      setSubscriptions(subsWithUsers);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const filterSubscriptions = () => {
    let filtered = [...subscriptions];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.user?.email.toLowerCase().includes(query) ||
          s.user?.full_name?.toLowerCase().includes(query) ||
          s.user?.company_name?.toLowerCase().includes(query)
      );
    }

    if (filterPlan !== 'all') {
      filtered = filtered.filter((s) => s.plan_type === filterPlan);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((s) => s.status === filterStatus);
    }

    setFilteredSubs(filtered);
  };

  const handleUpdatePlan = async (subId: string, newPlan: string) => {
    setSaving(true);
    try {
      const planCredits: Record<string, number> = {
        free: 50,
        starter: 500,
        professional: 2000,
        enterprise: 10000,
      };

      const { error } = await supabase
        .from('subscriptions')
        .update({
          plan_type: newPlan,
          credits_total: planCredits[newPlan],
          credits_remaining: planCredits[newPlan],
        })
        .eq('id', subId);

      if (error) throw error;

      await supabase.from('audit_logs').insert({
        user_id: currentUser!.id,
        target_user_id: selectedSub?.user_id,
        action: 'update_subscription_plan',
        resource: 'subscriptions',
        new_value: { plan_type: newPlan },
      });

      toast.success('Plan updated successfully');
      loadSubscriptions();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('Failed to update plan');
    } finally {
      setSaving(false);
    }
  };

  const handleAdjustCredits = async () => {
    if (!selectedSub || creditAdjustment.amount === 0) return;

    setSaving(true);
    try {
      const newCredits = Math.max(
        0,
        selectedSub.credits_remaining + creditAdjustment.amount
      );

      const { error } = await supabase
        .from('subscriptions')
        .update({ credits_remaining: newCredits })
        .eq('id', selectedSub.id);

      if (error) throw error;

      await supabase.from('audit_logs').insert({
        user_id: currentUser!.id,
        target_user_id: selectedSub.user_id,
        action: 'adjust_credits',
        resource: 'subscriptions',
        old_value: { credits: selectedSub.credits_remaining },
        new_value: {
          credits: newCredits,
          adjustment: creditAdjustment.amount,
          reason: creditAdjustment.reason,
        },
      });

      toast.success(
        `Credits ${creditAdjustment.amount > 0 ? 'added' : 'removed'} successfully`
      );
      loadSubscriptions();
      setShowCreditsModal(false);
      setCreditAdjustment({ amount: 0, reason: '' });
    } catch (error) {
      console.error('Error adjusting credits:', error);
      toast.error('Failed to adjust credits');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (sub: SubscriptionWithUser) => {
    const newStatus = sub.status === 'active' ? 'cancelled' : 'active';
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: newStatus })
        .eq('id', sub.id);

      if (error) throw error;

      await supabase.from('audit_logs').insert({
        user_id: currentUser!.id,
        target_user_id: sub.user_id,
        action: newStatus === 'active' ? 'reactivate_subscription' : 'cancel_subscription',
        resource: 'subscriptions',
        old_value: { status: sub.status },
        new_value: { status: newStatus },
      });

      toast.success(`Subscription ${newStatus === 'active' ? 'reactivated' : 'cancelled'}`);
      loadSubscriptions();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status');
    }
  };

  const getStats = () => {
    const prices = { free: 0, starter: 49, professional: 149, enterprise: 499 };
    const activeSubs = subscriptions.filter((s) => s.status === 'active');
    const mrr = activeSubs.reduce(
      (acc, s) => acc + (prices[s.plan_type as keyof typeof prices] || 0),
      0
    );
    const planCounts = subscriptions.reduce(
      (acc, s) => {
        acc[s.plan_type] = (acc[s.plan_type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return { mrr, activeSubs: activeSubs.length, planCounts };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Subscription Management</h1>
          <p className="text-slate-400">Manage user subscriptions and billing</p>
        </div>
        <button
          onClick={loadSubscriptions}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Monthly Revenue</p>
              <p className="text-2xl font-bold text-white">${stats.mrr.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Active Subscriptions</p>
              <p className="text-2xl font-bold text-white">{stats.activeSubs}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Paid Plans</p>
              <p className="text-2xl font-bold text-white">
                {(stats.planCounts.starter || 0) +
                  (stats.planCounts.professional || 0) +
                  (stats.planCounts.enterprise || 0)}
              </p>
            </div>
            <CreditCard className="w-8 h-8 text-cyan-400" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Conversion Rate</p>
              <p className="text-2xl font-bold text-white">
                {subscriptions.length > 0
                  ? (
                      ((subscriptions.length - (stats.planCounts.free || 0)) /
                        subscriptions.length) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-amber-400" />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email, name, or company..."
            className="w-full bg-slate-800 text-white placeholder-slate-500 border border-slate-600 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={filterPlan}
          onChange={(e) => setFilterPlan(e.target.value)}
          className="bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Plans</option>
          <option value="free">Free</option>
          <option value="starter">Starter</option>
          <option value="professional">Professional</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">User</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Plan</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Credits</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                  Billing Cycle
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredSubs.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-700/30 transition">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">
                        {sub.user?.full_name || sub.user?.email?.split('@')[0] || 'Unknown'}
                      </p>
                      <p className="text-sm text-slate-400">{sub.user?.email}</p>
                      {sub.user?.company_name && (
                        <p className="text-xs text-slate-500">{sub.user.company_name}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                        sub.plan_type === 'enterprise'
                          ? 'bg-amber-500/20 text-amber-400'
                          : sub.plan_type === 'professional'
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : sub.plan_type === 'starter'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-slate-600/50 text-slate-300'
                      }`}
                    >
                      {sub.plan_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {sub.status === 'active' ? (
                      <span className="flex items-center text-green-400">
                        <CheckCircle className="w-4 h-4 mr-1" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center text-red-400">
                        <XCircle className="w-4 h-4 mr-1" /> {sub.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className="text-white font-medium">{sub.credits_remaining}</span>
                      <span className="text-slate-400"> / {sub.credits_total}</span>
                    </div>
                    <div className="w-24 h-1.5 bg-slate-700 rounded-full mt-1">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${Math.min(100, (sub.credits_remaining / sub.credits_total) * 100)}%`,
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {new Date(sub.billing_cycle_end).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedSub(sub);
                          setShowCreditsModal(true);
                        }}
                        className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition"
                        title="Adjust Credits"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSub(sub);
                          setShowEditModal(true);
                        }}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition"
                        title="Edit Plan"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(sub)}
                        className={`p-2 rounded-lg transition ${
                          sub.status === 'active'
                            ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                            : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                        }`}
                        title={sub.status === 'active' ? 'Cancel' : 'Reactivate'}
                      >
                        {sub.status === 'active' ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showEditModal && selectedSub && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Change Subscription Plan</h3>
            <p className="text-slate-400 text-sm mb-4">{selectedSub.user?.email}</p>
            <div className="space-y-3">
              {['free', 'starter', 'professional', 'enterprise'].map((plan) => (
                <button
                  key={plan}
                  onClick={() => handleUpdatePlan(selectedSub.id, plan)}
                  disabled={saving || selectedSub.plan_type === plan}
                  className={`w-full p-4 rounded-lg border text-left transition ${
                    selectedSub.plan_type === plan
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium capitalize">{plan}</span>
                    {selectedSub.plan_type === plan && (
                      <span className="text-xs text-blue-400">Current</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowEditModal(false)}
              className="w-full mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showCreditsModal && selectedSub && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Adjust Credits</h3>
            <p className="text-slate-400 text-sm mb-2">{selectedSub.user?.email}</p>
            <p className="text-white mb-4">
              Current: <span className="font-bold">{selectedSub.credits_remaining}</span> credits
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Adjustment Amount
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      setCreditAdjustment((prev) => ({ ...prev, amount: prev.amount - 100 }))
                    }
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <input
                    type="number"
                    value={creditAdjustment.amount}
                    onChange={(e) =>
                      setCreditAdjustment((prev) => ({
                        ...prev,
                        amount: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="flex-1 bg-slate-900 text-white text-center border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() =>
                      setCreditAdjustment((prev) => ({ ...prev, amount: prev.amount + 100 }))
                    }
                    className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-slate-400 mt-2">
                  New total:{' '}
                  <span className="text-white font-medium">
                    {Math.max(0, selectedSub.credits_remaining + creditAdjustment.amount)}
                  </span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Reason (optional)
                </label>
                <input
                  type="text"
                  value={creditAdjustment.reason}
                  onChange={(e) =>
                    setCreditAdjustment((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  placeholder="e.g., Bonus credits, refund, etc."
                  className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreditsModal(false);
                  setCreditAdjustment({ amount: 0, reason: '' });
                }}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustCredits}
                disabled={saving || creditAdjustment.amount === 0}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Apply</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
