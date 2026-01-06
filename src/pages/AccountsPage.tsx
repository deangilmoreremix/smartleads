import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Mail, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Database } from '../types/database';

type GmailAccount = Database['public']['Tables']['gmail_accounts']['Row'];

export default function AccountsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<GmailAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAccounts();
    }
  }, [user]);

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
    } finally {
      setLoading(false);
    }
  };

  const handleConnectAccount = async () => {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback/unipile`;

      const { data, error } = await supabase.functions.invoke('connect-unipile', {
        body: {
          provider: 'GMAIL',
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
      toast.error('Failed to initiate account connection');
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Accounts</h1>
            <p className="text-gray-600">Manage your connected Gmail accounts for sending emails</p>
          </div>
          <button
            onClick={handleConnectAccount}
            className="flex items-center space-x-2 bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-600 transition shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Connect Account</span>
          </button>
        </div>

        {accounts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No accounts connected</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Connect your Gmail account to start sending automated emails to your leads
            </p>
            <button
              onClick={handleConnectAccount}
              className="inline-flex items-center space-x-2 bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-600 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Connect Gmail Account</span>
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
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-purple-600" />
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
          <h3 className="font-semibold text-blue-900 mb-2">About Gmail Accounts</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Connect multiple Gmail accounts to increase your sending capacity</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Each account has a daily sending limit to prevent spam flags</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Emails are automatically rotated across your connected accounts</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
