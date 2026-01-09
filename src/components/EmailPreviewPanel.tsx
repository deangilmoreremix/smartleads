import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import {
  Mail,
  Eye,
  Edit3,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Target,
  Building,
  User,
  Globe,
  TrendingUp,
  RefreshCw,
  Send,
} from 'lucide-react';

interface EmailPreview {
  id: string;
  lead_id: string;
  campaign_id: string;
  subject: string;
  body: string;
  tokens_used: Record<string, string>;
  services_mentioned: string[];
  pain_points_addressed: string[];
  conversation_starter: string | null;
  tech_stack_mentioned: string[];
  decision_maker_info: { name: string; role: string } | null;
  quality_score: number | null;
  spam_score: number | null;
  personalization_score: number | null;
  status: 'pending' | 'approved' | 'edited' | 'rejected' | 'sent';
  edited_subject: string | null;
  edited_body: string | null;
  lead?: {
    email: string;
    business_name: string;
    website: string | null;
    rating: number | null;
    intent_score: number | null;
  };
}

interface EmailPreviewPanelProps {
  campaignId: string;
  onApprove?: (previewId: string) => void;
  onReject?: (previewId: string, reason: string) => void;
}

export default function EmailPreviewPanel({ campaignId, onApprove, onReject }: EmailPreviewPanelProps) {
  const [previews, setPreviews] = useState<EmailPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [showTokens, setShowTokens] = useState(false);

  useEffect(() => {
    loadPreviews();
  }, [campaignId]);

  async function loadPreviews() {
    try {
      const { data, error } = await supabase
        .from('email_previews')
        .select(`
          *,
          leads!inner(email, business_name, website, rating, intent_score)
        `)
        .eq('campaign_id', campaignId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedPreviews = (data || []).map((p: Record<string, unknown>) => ({
        ...p,
        lead: p.leads as EmailPreview['lead'],
      })) as EmailPreview[];

      setPreviews(formattedPreviews);
      if (formattedPreviews.length > 0) {
        setEditedSubject(formattedPreviews[0].subject);
        setEditedBody(formattedPreviews[0].body);
      }
    } catch (error) {
      console.error('Error loading previews:', error);
      toast.error('Failed to load email previews');
    } finally {
      setLoading(false);
    }
  }

  async function approvePreview() {
    const preview = previews[currentIndex];
    if (!preview) return;

    try {
      const updateData: Record<string, unknown> = {
        status: editMode ? 'edited' : 'approved',
        reviewed_at: new Date().toISOString(),
      };

      if (editMode) {
        updateData.edited_subject = editedSubject;
        updateData.edited_body = editedBody;
      }

      const { error } = await supabase
        .from('email_previews')
        .update(updateData)
        .eq('id', preview.id);

      if (error) throw error;

      toast.success('Email approved');
      onApprove?.(preview.id);

      setPreviews(previews.filter((_, i) => i !== currentIndex));
      setCurrentIndex(Math.min(currentIndex, previews.length - 2));
      setEditMode(false);
    } catch (error) {
      console.error('Error approving preview:', error);
      toast.error('Failed to approve email');
    }
  }

  async function rejectPreview(reason: string) {
    const preview = previews[currentIndex];
    if (!preview) return;

    try {
      const { error } = await supabase
        .from('email_previews')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', preview.id);

      if (error) throw error;

      toast.success('Email rejected');
      onReject?.(preview.id, reason);

      setPreviews(previews.filter((_, i) => i !== currentIndex));
      setCurrentIndex(Math.min(currentIndex, previews.length - 2));
    } catch (error) {
      console.error('Error rejecting preview:', error);
      toast.error('Failed to reject email');
    }
  }

  async function approveAll() {
    try {
      const pendingIds = previews.map(p => p.id);
      const { error } = await supabase
        .from('email_previews')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
        })
        .in('id', pendingIds);

      if (error) throw error;

      toast.success(`Approved ${pendingIds.length} emails`);
      setPreviews([]);
    } catch (error) {
      console.error('Error approving all:', error);
      toast.error('Failed to approve all emails');
    }
  }

  function navigatePreview(direction: 'prev' | 'next') {
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < previews.length) {
      setCurrentIndex(newIndex);
      setEditedSubject(previews[newIndex].subject);
      setEditedBody(previews[newIndex].body);
      setEditMode(false);
    }
  }

  function replaceTokensWithValues(content: string, tokens: Record<string, string>): string {
    let result = content;
    Object.entries(tokens).forEach(([key, value]) => {
      if (value) {
        result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), `<span class="bg-amber-100 px-1 rounded">${value}</span>`);
      }
    });
    return result;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    );
  }

  if (previews.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-gray-900 font-medium mb-2">No emails to review</h3>
        <p className="text-gray-500 text-sm">Generated emails will appear here for review before sending</p>
      </div>
    );
  }

  const currentPreview = previews[currentIndex];
  const displaySubject = editMode ? editedSubject : currentPreview.subject;
  const displayBody = editMode ? editedBody : currentPreview.body;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-gray-900">Email Preview</h3>
          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
            {previews.length} pending
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTokens(!showTokens)}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${
              showTokens ? 'bg-amber-100 text-amber-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-1" />
            Tokens
          </button>
          <button
            onClick={approveAll}
            className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
          >
            Approve All
          </button>
        </div>
      </div>

      <div className="flex">
        <div className="flex-1 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigatePreview('prev')}
                disabled={currentIndex === 0}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-500">
                {currentIndex + 1} of {previews.length}
              </span>
              <button
                onClick={() => navigatePreview('next')}
                disabled={currentIndex === previews.length - 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition ${
                editMode ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              {editMode ? 'Editing' : 'Edit'}
            </button>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="mb-3">
              <span className="text-xs text-gray-500 block mb-1">To:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{currentPreview.lead?.business_name}</span>
                <span className="text-gray-500">&lt;{currentPreview.lead?.email}&gt;</span>
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">Subject:</span>
              {editMode ? (
                <input
                  type="text"
                  value={editedSubject}
                  onChange={(e) => setEditedSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              ) : (
                <div
                  className="font-medium text-gray-900"
                  dangerouslySetInnerHTML={{
                    __html: showTokens
                      ? replaceTokensWithValues(displaySubject, currentPreview.tokens_used)
                      : displaySubject,
                  }}
                />
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 min-h-[300px]">
            {editMode ? (
              <textarea
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              />
            ) : (
              <div
                className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: showTokens
                    ? replaceTokensWithValues(displayBody, currentPreview.tokens_used)
                    : displayBody.replace(/\n/g, '<br>'),
                }}
              />
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentPreview.quality_score && (
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    currentPreview.quality_score >= 70
                      ? 'bg-green-100 text-green-700'
                      : currentPreview.quality_score >= 50
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  Quality: {currentPreview.quality_score}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const reason = prompt('Rejection reason (optional):');
                  if (reason !== null) {
                    rejectPreview(reason);
                  }
                }}
                className="flex items-center gap-1 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={approvePreview}
                className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                <Check className="w-4 h-4" />
                {editMode ? 'Save & Approve' : 'Approve'}
              </button>
            </div>
          </div>
        </div>

        <div className="w-72 border-l border-gray-100 bg-gray-50 p-4">
          <h4 className="font-medium text-gray-900 mb-4">Lead Intelligence</h4>

          <div className="space-y-4">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Building className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-700">Business</span>
              </div>
              <p className="text-sm font-medium text-gray-900">{currentPreview.lead?.business_name}</p>
              {currentPreview.lead?.website && (
                <a
                  href={currentPreview.lead.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-600 hover:underline flex items-center gap-1 mt-1"
                >
                  <Globe className="w-3 h-3" />
                  {currentPreview.lead.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>

            {currentPreview.decision_maker_info && (
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-700">Decision Maker</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{currentPreview.decision_maker_info.name}</p>
                <p className="text-xs text-gray-500">{currentPreview.decision_maker_info.role}</p>
              </div>
            )}

            {currentPreview.lead?.intent_score !== null && currentPreview.lead?.intent_score > 0 && (
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-700">Intent Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        currentPreview.lead.intent_score >= 70
                          ? 'bg-green-500'
                          : currentPreview.lead.intent_score >= 40
                          ? 'bg-amber-500'
                          : 'bg-gray-400'
                      }`}
                      style={{ width: `${currentPreview.lead.intent_score}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{currentPreview.lead.intent_score}</span>
                </div>
              </div>
            )}

            {currentPreview.services_mentioned.length > 0 && (
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-700">Services Mentioned</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {currentPreview.services_mentioned.map((service, i) => (
                    <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {currentPreview.pain_points_addressed.length > 0 && (
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-700">Pain Points</span>
                </div>
                <ul className="text-xs text-gray-600 space-y-1">
                  {currentPreview.pain_points_addressed.slice(0, 3).map((point, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-amber-500 mt-0.5">-</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {currentPreview.conversation_starter && (
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-medium text-amber-700">Conversation Starter</span>
                </div>
                <p className="text-xs text-amber-800">{currentPreview.conversation_starter}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
