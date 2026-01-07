import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Shield,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Flame,
  Mail,
  RefreshCw,
} from 'lucide-react';
import {
  getEmailHealthScores,
  calculateHealthScore,
  enableWarmup,
  disableWarmup,
  getHealthScoreColor,
  getHealthScoreLabel,
  type GmailAccountHealth,
} from '../services/email-health';
import toast from 'react-hot-toast';

export default function EmailHealthDisplay() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<GmailAccountHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadAccounts();
    }
  }, [user]);

  async function loadAccounts() {
    try {
      const data = await getEmailHealthScores(user!.id);
      setAccounts(data);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRecalculate(accountId: string) {
    setCalculating(accountId);
    try {
      await calculateHealthScore(accountId);
      await loadAccounts();
      toast.success('Health score updated');
    } catch (error) {
      toast.error('Failed to calculate score');
    } finally {
      setCalculating(null);
    }
  }

  async function toggleWarmup(accountId: string, currentlyEnabled: boolean) {
    try {
      if (currentlyEnabled) {
        await disableWarmup(accountId, 50);
        toast.success('Warmup disabled');
      } else {
        await enableWarmup(accountId, 2);
        toast.success('Warmup enabled');
      }
      loadAccounts();
    } catch (error) {
      toast.error('Failed to update warmup');
    }
  }

  if (loading) {
    return <div className="animate-pulse h-32 bg-gray-100 rounded-xl" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-amber-600" />
        <h3 className="font-semibold text-gray-900">Email Account Health</h3>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No email accounts connected</p>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => {
            const score = account.healthScore?.health_score || 100;
            const colorClass = getHealthScoreColor(score);
            const label = getHealthScoreLabel(score);

            return (
              <div
                key={account.id}
                className="bg-white border border-gray-200 rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{account.email}</h4>
                      {account.warmupEnabled && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                          <Flame className="w-3 h-3" />
                          Warmup Day {account.warmupDay}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {account.emailsSentToday} / {account.dailyLimit} emails today
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colorClass}`}>
                      {score} - {label}
                    </span>
                    <button
                      onClick={() => handleRecalculate(account.id)}
                      disabled={calculating === account.id}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${calculating === account.id ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        score >= 80 ? 'bg-green-500' :
                        score >= 60 ? 'bg-yellow-500' :
                        score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>

                {account.healthScore && (
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    <MetricCard
                      label="Deliverability"
                      value={`${account.healthScore.deliverability_rate.toFixed(1)}%`}
                      trend={account.healthScore.deliverability_rate >= 95 ? 'up' : 'down'}
                    />
                    <MetricCard
                      label="Bounce Rate"
                      value={`${account.healthScore.bounce_rate.toFixed(1)}%`}
                      trend={account.healthScore.bounce_rate <= 2 ? 'up' : 'down'}
                      invertTrend
                    />
                    <MetricCard
                      label="Open Rate"
                      value={`${account.healthScore.open_rate.toFixed(1)}%`}
                      trend={account.healthScore.open_rate >= 20 ? 'up' : 'down'}
                    />
                    <MetricCard
                      label="Reply Rate"
                      value={`${account.healthScore.reply_rate.toFixed(1)}%`}
                      trend={account.healthScore.reply_rate >= 5 ? 'up' : 'down'}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    {score >= 80 ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : score >= 60 ? (
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm text-gray-600">
                      {score >= 80
                        ? 'Account is healthy'
                        : score >= 60
                        ? 'Consider reducing sending volume'
                        : 'Account needs attention'}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleWarmup(account.id, account.warmupEnabled)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      account.warmupEnabled
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Flame className="w-4 h-4 inline mr-1" />
                    {account.warmupEnabled ? 'Disable' : 'Enable'} Warmup
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  trend,
  invertTrend = false,
}: {
  label: string;
  value: string;
  trend: 'up' | 'down';
  invertTrend?: boolean;
}) {
  const isGood = invertTrend ? trend === 'down' : trend === 'up';

  return (
    <div className="bg-gray-50 rounded-lg p-2">
      <div className="text-xs text-gray-500 mb-0.5">{label}</div>
      <div className="flex items-center gap-1">
        <span className="font-semibold text-gray-900">{value}</span>
        {isGood ? (
          <TrendingUp className="w-3 h-3 text-green-500" />
        ) : (
          <TrendingDown className="w-3 h-3 text-red-500" />
        )}
      </div>
    </div>
  );
}
