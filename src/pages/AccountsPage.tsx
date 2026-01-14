import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Mail, CheckCircle, XCircle, Clock, Trash2, Lock, Linkedin, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Database } from '../types/database';
import { subscriptionService, type UserSubscription } from '../services/subscription-service';

type GmailAccount = Database['public']['Tables']['gmail_accounts']['Row'];

interface Provider {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  feature: string;
  description: string;
}

const PROVIDERS: Provider[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    icon: <Mail className="w-6 h-6" />,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    feature: 'gmail',
    description: 'Send emails from your Gmail account',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: <Linkedin className="w-6 h-6" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    feature: 'linkedin',
    description: 'Send direct messages on LinkedIn',
  },
  {
    id: 'outlook',
    name: 'Outlook',
    icon: <Send className="w-6 h-6" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    feature: 'outlook',
    description: 'Send emails from your Outlook account',
  },
];

export default function AccountsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<GmailAccount[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProviderSelect, setShowProviderSelect] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      await Promise.all([loadAccounts(), loadSubscription()]);
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('gmail_accounts')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast.error('Failed to load accounts');
    }
  };

  const loadSubscription = async () => {
    try {
      const sub = await subscriptionService.getUserSubscription(user!.id);
      setSubscription(sub);
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const handleConnectProvider = async (providerId: string) => {
    try {
      const provider = PROVIDERS.find(p => p.id === providerId);
      if (!provider) return;

      const hasAccess = subscription?.features?.[provider.feature] === true;

      if (!hasAccess && providerId !== 'gmail') {
        toast.error(`${provider.name} requires a Pro or Enterprise plan`);
        return;
      }

      const redirectUrl = `${window.location.origin}/auth/callback/unipile`;

      const { data, error } = await supabase.functions.invoke('connect-unipile', {
        body: {
          provider: providerId.toUpperCase(),
          redirectUrl,
        },
      });

      if (error) throw error;

      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        toast.error('Failed to generate authorization URL');
      }
    } catch (error) {
      console.error('Error connecting account:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initiate account connection';
      toast.error(errorMessage);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to remove this account?')) return;

    try {
      const { error } = await supabase
        .from('gmail_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;

      toast.success('Account removed successfully');
      loadAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to remove account');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading accounts...</p>
        </div>
      </div>
    );
  }

  const getProviderIcon = (providerType?: string | null) => {
    const provider = PROVIDERS.find(p => p.id === providerType);
    return provider?.icon || <Mail className="w-6 h-6" />;
  };

  const getProviderColor = (providerType?: string | null) => {
    const provider = PROVIDERS.find(p => p.id === providerType);
    return provider?.bgColor || 'bg-gray-100';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Accounts</h1>
            <p className="text-gray-600">Manage your connected accounts for sending emails and messages</p>
            {subscription && (
              <div className="mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${subscriptionService.getPlanBadgeColor(subscription.plan_name)}`}>
                  {subscription.plan_display_name} Plan
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowProviderSelect(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Connect Account</span>
          </button>
        </div>

        {accounts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No accounts connected</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Connect your Gmail, LinkedIn, or Outlook account to start sending automated outreach
            </p>
            <button
              onClick={() => setShowProviderSelect(true)}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Connect Account</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`w-12 h-12 ${getProviderColor(account.provider_type)} rounded-full flex items-center justify-center flex-shrink-0`}>
                      {getProviderIcon(account.provider_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{account.email}</h3>
                        {account.is_active ? (
                          <span className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                            <XCircle className="w-3 h-3" />
                            <span>Inactive</span>
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500 mb-1">Daily Limit</div>
                          <div className="font-semibold text-gray-900">{account.daily_limit} emails/day</div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Sent Today</div>
                          <div className="font-semibold text-gray-900">{account.emails_sent_today} emails</div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>Connected {new Date(account.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAccount(account.id)}
                    className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Remove account"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-100">
          <h3 className="font-semibold text-blue-900 mb-2">About Connected Accounts</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Connect multiple accounts to increase your outreach capacity</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Each account has daily sending limits to maintain good reputation</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Messages are automatically rotated across your connected accounts</span>
            </li>
          </ul>
        </div>

        {showProviderSelect && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowProviderSelect(false)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect an Account</h2>
              <p className="text-gray-600 mb-6">Choose which platform you'd like to connect for your outreach</p>

              <div className="space-y-4">
                {PROVIDERS.map((provider) => {
                  const hasAccess = subscription?.features?.[provider.feature] === true;
                  const isLocked = !hasAccess && provider.id !== 'gmail';

                  return (
                    <button
                      key={provider.id}
                      onClick={() => {
                        if (isLocked) {
                          return;
                        }
                        setShowProviderSelect(false);
                        handleConnectProvider(provider.id);
                      }}
                      className={`w-full text-left p-6 rounded-xl border-2 transition ${
                        isLocked
                          ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-blue-500 hover:shadow-md cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 ${provider.bgColor} rounded-full flex items-center justify-center ${provider.color}`}>
                            {provider.icon}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
                              {isLocked && (
                                <Lock className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{provider.description}</p>
                            {isLocked && (
                              <Link
                                to="/plans"
                                className="inline-flex items-center mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Upgrade to Pro
                                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </Link>
                            )}
                          </div>
                        </div>
                        {hasAccess && (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowProviderSelect(false)}
                  className="w-full px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
