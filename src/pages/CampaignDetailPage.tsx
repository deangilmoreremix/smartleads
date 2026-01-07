import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft,
  Trash2,
  Users,
  Mail,
  Eye,
  MessageSquare,
  TrendingUp,
  Zap,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import type { Database } from '../types/database';
import { startAutomatedCampaign, scrapeGoogleMapsLeads, generateAIEmails, sendEmails } from '../services/automation';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import EmailSequenceBuilder from '../components/EmailSequenceBuilder';

type Campaign = Database['public']['Tables']['campaigns']['Row'];
type Lead = Database['public']['Tables']['leads']['Row'];

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [automationStatus, setAutomationStatus] = useState<string>('');
  const [isAutomating, setIsAutomating] = useState(false);

  useEffect(() => {
    if (user && id) {
      loadCampaignDetails();
    }
  }, [user, id]);

  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`campaign-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'campaigns',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setCampaign(payload.new as Campaign);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'email_tracking_events',
        },
        () => {
          loadCampaignDetails();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const loadCampaignDetails = async () => {
    try {
      const [campaignResult, leadsResult] = await Promise.all([
        supabase.from('campaigns').select('*').eq('id', id!).eq('user_id', user!.id).maybeSingle(),
        supabase.from('leads').select('*').eq('campaign_id', id!).eq('user_id', user!.id).limit(10)
      ]);

      if (campaignResult.data) setCampaign(campaignResult.data);
      if (leadsResult.data) setLeads(leadsResult.data);
    } catch (error) {
      console.error('Error loading campaign details:', error);
      toast.error('Failed to load campaign details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase.from('campaigns').delete().eq('id', id!);
      if (error) throw error;
      toast.success('Campaign deleted successfully');
      navigate('/dashboard/campaigns');
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    }
  };

  const handleScrapLeads = async () => {
    if (!campaign) return;

    setIsAutomating(true);
    setAutomationStatus('Starting AI agent...');

    try {
      const result = await scrapeGoogleMapsLeads({
        campaignId: campaign.id,
        niche: campaign.niche,
        location: campaign.location,
        apifySettings: campaign.apify_settings || undefined,
      });

      if (result.jobId) {
        toast.success('AI Agent started! Redirecting to progress tracker...');
        setTimeout(() => {
          navigate(`/agent/progress/${result.jobId}?campaign_id=${campaign.id}`);
        }, 500);
      }
    } catch (error: any) {
      console.error('Scraping error:', error);
      toast.error(error.message || 'Failed to start lead scraping');
      setIsAutomating(false);
      setAutomationStatus('');
    }
  };

  const handleGenerateEmails = async () => {
    if (!campaign) return;

    setIsAutomating(true);
    setAutomationStatus('Starting AI agent...');

    try {
      const result = await generateAIEmails({
        campaignId: campaign.id,
      });

      if (result.jobId) {
        toast.success('AI Agent started! Redirecting to progress tracker...');
        setTimeout(() => {
          navigate(`/agent/progress/${result.jobId}?campaign_id=${campaign.id}`);
        }, 500);
      }
    } catch (error: any) {
      console.error('Email generation error:', error);
      toast.error(error.message || 'Failed to start email generation');
      setIsAutomating(false);
      setAutomationStatus('');
    }
  };

  const handleSendEmails = async () => {
    if (!campaign) return;

    setIsAutomating(true);
    setAutomationStatus('Starting AI agent...');

    try {
      const result = await sendEmails({
        campaignId: campaign.id,
        sendImmediately: false,
      });

      if (result.jobId) {
        toast.success('AI Agent started! Redirecting to progress tracker...');
        setTimeout(() => {
          navigate(`/agent/progress/${result.jobId}?campaign_id=${campaign.id}`);
        }, 500);
      }
    } catch (error: any) {
      console.error('Email sending error:', error);
      toast.error(error.message || 'Failed to start sending emails');
      setIsAutomating(false);
      setAutomationStatus('');
    }
  };

  const handleStartAutomation = async () => {
    if (!campaign) return;

    setIsAutomating(true);
    setAutomationStatus('Starting automated campaign...');

    try {
      await startAutomatedCampaign(campaign.id, campaign.niche, campaign.location);
      toast.success('Automated campaign started successfully!');
      await loadCampaignDetails();
    } catch (error: any) {
      console.error('Automation error:', error);
      toast.error(error.message || 'Failed to start automation');
    } finally {
      setIsAutomating(false);
      setAutomationStatus('');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Loading campaign..." />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Campaign not found</h2>
          <Link to="/dashboard/campaigns" className="text-blue-400 hover:text-blue-300">
            Back to campaigns
          </Link>
        </div>
      </div>
    );
  }

  const openRate = campaign.emails_sent > 0
    ? ((campaign.emails_opened / campaign.emails_sent) * 100).toFixed(1)
    : '0';
  const replyRate = campaign.emails_sent > 0
    ? ((campaign.emails_replied / campaign.emails_sent) * 100).toFixed(1)
    : '0';

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <Link
          to="/dashboard/campaigns"
          className="inline-flex items-center space-x-2 text-slate-400 hover:text-white mb-4 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to campaigns</span>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{campaign.name}</h1>
              <span className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${campaign.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  campaign.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                  campaign.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-slate-500/20 text-slate-400'}
              `}>
                {campaign.status}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-slate-400">
              <span>{campaign.niche}</span>
              <span>•</span>
              <span>{campaign.location}</span>
              <span>•</span>
              <span>Created {new Date(campaign.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {campaign.status === 'draft' && (
              <button
                onClick={handleStartAutomation}
                disabled={isAutomating}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition disabled:opacity-50"
              >
                <Zap className="w-5 h-5" />
                <span>Start Automation</span>
              </button>
            )}
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="inline-flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {isAutomating && (
        <div className="mb-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <h3 className="text-white font-medium mb-1">Automation in Progress</h3>
              <p className="text-slate-400 text-sm">{automationStatus}</p>
            </div>
          </div>
        </div>
      )}

      {campaign.ai_prompt && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-8">
          <div className="flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-blue-400 font-medium mb-2">AI Prompt Used</h3>
              <p className="text-slate-300">{campaign.ai_prompt}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{campaign.total_leads}</div>
              <div className="text-slate-400 text-sm">Total Leads</div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{campaign.emails_sent}</div>
              <div className="text-slate-400 text-sm">Emails Sent</div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{openRate}%</div>
              <div className="text-slate-400 text-sm">Open Rate</div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{replyRate}%</div>
              <div className="text-slate-400 text-sm">Reply Rate</div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Campaign Leads</h2>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => loadCampaignDetails()}
                  className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <Link
                  to="/dashboard/leads"
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition"
                >
                  View all
                </Link>
              </div>
            </div>

            {leads.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-white font-medium mb-2">No leads yet</h3>
                <p className="text-slate-400 text-sm mb-6">Start scraping Google Maps to find leads</p>
                <button
                  onClick={handleScrapLeads}
                  disabled={isAutomating}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition disabled:opacity-50"
                >
                  <Zap className="w-5 h-5" />
                  <span>Scrape Leads</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {leads.map((lead) => (
                  <div key={lead.id} className="bg-slate-700/50 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium mb-1">{lead.business_name}</h3>
                      <p className="text-slate-400 text-sm">{lead.email}</p>
                    </div>
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-medium
                      ${lead.status === 'converted' ? 'bg-green-500/20 text-green-400' :
                        lead.status === 'replied' ? 'bg-blue-500/20 text-blue-400' :
                        lead.status === 'contacted' ? 'bg-cyan-500/20 text-cyan-400' :
                        'bg-slate-500/20 text-slate-400'}
                    `}>
                      {lead.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Automation Tools</h2>
            <div className="space-y-3">
              <button
                onClick={handleScrapLeads}
                disabled={isAutomating}
                className="w-full flex items-center space-x-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg p-4 transition disabled:opacity-50 text-left"
              >
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Scrape Leads</h3>
                  <p className="text-slate-400 text-sm">Find local businesses</p>
                </div>
              </button>

              <button
                onClick={handleGenerateEmails}
                disabled={isAutomating || campaign.total_leads === 0}
                className="w-full flex items-center space-x-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg p-4 transition disabled:opacity-50 text-left"
              >
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Generate Emails</h3>
                  <p className="text-slate-400 text-sm">AI personalization</p>
                </div>
              </button>

              <button
                onClick={handleSendEmails}
                disabled={isAutomating || campaign.total_leads === 0}
                className="w-full flex items-center space-x-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg p-4 transition disabled:opacity-50 text-left"
              >
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Send Emails</h3>
                  <p className="text-slate-400 text-sm">Launch outreach</p>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Campaign Info</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Scraping Status:</span>
                <span className="text-white capitalize">{campaign.scraping_status?.replace('_', ' ') || 'Not started'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">AI Personalization:</span>
                <span className="text-white">{campaign.ai_personalization ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Automation:</span>
                <span className="text-white">{campaign.automation_enabled ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <EmailSequenceBuilder
          campaignId={campaign.id}
          onSequenceCreated={loadCampaignDetails}
        />
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Campaign"
        message="Are you sure you want to delete this campaign? This action cannot be undone and will delete all associated leads and emails."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
}
