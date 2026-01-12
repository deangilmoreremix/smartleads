import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { User, Bell, Zap, Mail, Save, CreditCard, Check } from 'lucide-react';
import type { Database } from '../types/database';
import ImageUploader from '../components/ImageUploader';
import StorageQuotaDisplay from '../components/StorageQuotaDisplay';
import ApiKeysStatus from '../components/ApiKeysStatus';
import { uploadFile, STORAGE_BUCKETS } from '../lib/storage';
import toast from 'react-hot-toast';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type UserSettings = Database['public']['Tables']['user_settings']['Row'];

interface NotificationPreferences {
  email_notifications: boolean;
  campaign_updates: boolean;
  reply_alerts: boolean;
}

const defaultNotificationPrefs: NotificationPreferences = {
  email_notifications: true,
  campaign_updates: true,
  reply_alerts: true,
};

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [dailyEmailLimit, setDailyEmailLimit] = useState(50);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(defaultNotificationPrefs);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const [profileResult, subscriptionResult, settingsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user!.id).maybeSingle(),
        supabase.from('subscriptions').select('*').eq('user_id', user!.id).maybeSingle(),
        supabase.from('user_settings').select('*').eq('user_id', user!.id).maybeSingle()
      ]);

      if (profileResult.data) setProfile(profileResult.data);
      if (subscriptionResult.data) setSubscription(subscriptionResult.data);
      if (settingsResult.data) {
        setSettings(settingsResult.data);
        setDailyEmailLimit(settingsResult.data.daily_email_limit || 50);
        const prefs = settingsResult.data.notification_preferences as NotificationPreferences | null;
        if (prefs) {
          setNotificationPrefs({
            email_notifications: prefs.email_notifications ?? true,
            campaign_updates: prefs.campaign_updates ?? true,
            reply_alerts: prefs.reply_alerts ?? true,
          });
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          company_name: profile.company_name
        })
        .eq('id', user!.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File): Promise<string> => {
    try {
      const result = await uploadFile({
        bucket: STORAGE_BUCKETS.AVATARS,
        file,
        path: `${user!.id}/avatar-${Date.now()}.jpg`,
      });

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: result.url })
        .eq('id', user!.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, avatar_url: result.url } : null);
      toast.success('Profile picture updated successfully');
      return result.url;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload profile picture');
      throw error;
    }
  };

  const handleAvatarRemove = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user!.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, avatar_url: null } : null);
      toast.success('Profile picture removed');
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error('Failed to remove profile picture');
    }
  };

  const handleCompanyLogoUpload = async (file: File): Promise<string> => {
    try {
      const result = await uploadFile({
        bucket: STORAGE_BUCKETS.COMPANY_LOGOS,
        file,
        path: `${user!.id}/logo-${Date.now()}.jpg`,
      });

      const { error } = await supabase
        .from('profiles')
        .update({ company_logo: result.url })
        .eq('id', user!.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, company_logo: result.url } : null);
      toast.success('Company logo updated successfully');
      return result.url;
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload company logo');
      throw error;
    }
  };

  const handleCompanyLogoRemove = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ company_logo: null })
        .eq('id', user!.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, company_logo: null } : null);
      toast.success('Company logo removed');
    } catch (error) {
      console.error('Error removing logo:', error);
      toast.error('Failed to remove company logo');
    }
  };

  const handleSaveEmailSettings = async () => {
    setSavingEmail(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({ daily_email_limit: dailyEmailLimit })
        .eq('user_id', user!.id);

      if (error) throw error;
      toast.success('Email settings saved');
    } catch (error) {
      console.error('Error saving email settings:', error);
      toast.error('Failed to save email settings');
    } finally {
      setSavingEmail(false);
    }
  };

  const handleNotificationChange = async (key: keyof NotificationPreferences) => {
    const newPrefs = { ...notificationPrefs, [key]: !notificationPrefs[key] };
    setNotificationPrefs(newPrefs);
    setSavingNotifications(true);

    try {
      const { error } = await supabase
        .from('user_settings')
        .update({ notification_preferences: newPrefs })
        .eq('user_id', user!.id);

      if (error) throw error;
      toast.success('Notification preferences saved');
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      setNotificationPrefs(notificationPrefs);
      toast.error('Failed to save notification preferences');
    } finally {
      setSavingNotifications(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        <ApiKeysStatus />

        <StorageQuotaDisplay />

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Profile Information</h2>
              <p className="text-slate-400 text-sm">Update your personal details</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Profile Picture</label>
                <ImageUploader
                  currentImage={profile?.avatar_url}
                  onImageSelect={() => {}}
                  onImageUpload={handleAvatarUpload}
                  onImageRemove={handleAvatarRemove}
                  shape="circle"
                  maxSize={5 * 1024 * 1024}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Company Logo</label>
                <ImageUploader
                  currentImage={profile?.company_logo}
                  onImageSelect={() => {}}
                  onImageUpload={handleCompanyLogoUpload}
                  onImageRemove={handleCompanyLogoRemove}
                  shape="square"
                  maxSize={5 * 1024 * 1024}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <input
                type="text"
                value={profile?.full_name || ''}
                onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                className="w-full bg-slate-900/50 text-white placeholder-slate-500 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full bg-slate-700/50 text-slate-400 border border-slate-600 rounded-lg px-4 py-3 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-slate-500">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Company Name (Optional)</label>
              <input
                type="text"
                value={profile?.company_name || ''}
                onChange={(e) => setProfile(prev => prev ? { ...prev, company_name: e.target.value } : null)}
                className="w-full bg-slate-900/50 text-white placeholder-slate-500 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition"
                placeholder="Acme Inc."
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/50 transition disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </form>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Subscription & Billing</h2>
              <p className="text-slate-400 text-sm">Manage your plan and credits</p>
            </div>
          </div>

          {subscription && (
            <div className="space-y-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Current Plan</div>
                    <div className="text-2xl font-bold text-white capitalize">{subscription.plan_type}</div>
                  </div>
                  <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg font-medium">
                    {subscription.status}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Credits Remaining</div>
                    <div className="text-lg font-bold text-white">{subscription.credits_remaining} / {subscription.credits_total}</div>
                  </div>
                  <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/50 transition">
                    <CreditCard className="w-5 h-5 inline mr-2" />
                    Upgrade Plan
                  </button>
                </div>
              </div>

              <div className="text-sm text-slate-400">
                Billing cycle: {new Date(subscription.billing_cycle_start).toLocaleDateString()} - {new Date(subscription.billing_cycle_end).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Email Settings</h2>
              <p className="text-slate-400 text-sm">Configure email sending preferences</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Daily Email Limit</label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={dailyEmailLimit}
                  onChange={(e) => setDailyEmailLimit(parseInt(e.target.value) || 50)}
                  className="flex-1 bg-slate-900/50 text-white border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition"
                />
                <button
                  onClick={handleSaveEmailSettings}
                  disabled={savingEmail}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition disabled:opacity-50"
                >
                  {savingEmail ? 'Saving...' : 'Save'}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500">Maximum emails to send per day (1-500)</p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Connect Gmail Account</h3>
              <p className="text-slate-400 text-sm mb-4">Connect your Gmail account to start sending emails</p>
              <Link
                to="/dashboard/accounts"
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                Manage Email Accounts
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Notifications</h2>
                <p className="text-slate-400 text-sm">Choose what notifications you receive</p>
              </div>
            </div>
            {savingNotifications && (
              <div className="flex items-center space-x-2 text-blue-400 text-sm">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleNotificationChange('email_notifications')}
              className="w-full flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition text-left"
            >
              <div>
                <div className="text-white font-medium mb-1">Email Notifications</div>
                <div className="text-slate-400 text-sm">Receive email updates about your campaigns</div>
              </div>
              <div className={`w-12 h-7 rounded-full transition-colors ${notificationPrefs.email_notifications ? 'bg-blue-500' : 'bg-slate-600'} relative`}>
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${notificationPrefs.email_notifications ? 'translate-x-6' : 'translate-x-1'}`}>
                  {notificationPrefs.email_notifications && <Check className="w-3 h-3 text-blue-500 absolute top-1 left-1" />}
                </div>
              </div>
            </button>

            <button
              onClick={() => handleNotificationChange('campaign_updates')}
              className="w-full flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition text-left"
            >
              <div>
                <div className="text-white font-medium mb-1">Campaign Updates</div>
                <div className="text-slate-400 text-sm">Get notified when campaigns complete</div>
              </div>
              <div className={`w-12 h-7 rounded-full transition-colors ${notificationPrefs.campaign_updates ? 'bg-blue-500' : 'bg-slate-600'} relative`}>
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${notificationPrefs.campaign_updates ? 'translate-x-6' : 'translate-x-1'}`}>
                  {notificationPrefs.campaign_updates && <Check className="w-3 h-3 text-blue-500 absolute top-1 left-1" />}
                </div>
              </div>
            </button>

            <button
              onClick={() => handleNotificationChange('reply_alerts')}
              className="w-full flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition text-left"
            >
              <div>
                <div className="text-white font-medium mb-1">Reply Alerts</div>
                <div className="text-slate-400 text-sm">Be notified when prospects reply</div>
              </div>
              <div className={`w-12 h-7 rounded-full transition-colors ${notificationPrefs.reply_alerts ? 'bg-blue-500' : 'bg-slate-600'} relative`}>
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${notificationPrefs.reply_alerts ? 'translate-x-6' : 'translate-x-1'}`}>
                  {notificationPrefs.reply_alerts && <Check className="w-3 h-3 text-blue-500 absolute top-1 left-1" />}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
