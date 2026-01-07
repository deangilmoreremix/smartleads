import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Clock,
  HelpCircle,
  Calendar,
  XCircle,
  CheckCircle,
  RefreshCw,
  Filter,
} from 'lucide-react';
import {
  getReplyClassifications,
  getClassificationStats,
  updateClassification,
  getClassificationColor,
  getClassificationLabel,
  type ClassifiedReply,
  type ReplyClassification,
} from '../services/reply-classification';
import toast from 'react-hot-toast';

interface Props {
  campaignId?: string;
}

export default function ReplyClassificationPanel({ campaignId }: Props) {
  const { user } = useAuth();
  const [replies, setReplies] = useState<ClassifiedReply[]>([]);
  const [stats, setStats] = useState<Record<ReplyClassification, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReplyClassification | 'all'>('all');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, campaignId, filter]);

  async function loadData() {
    setLoading(true);
    try {
      const [repliesData, statsData] = await Promise.all([
        getReplyClassifications(
          user!.id,
          campaignId,
          filter === 'all' ? undefined : filter
        ),
        getClassificationStats(user!.id, campaignId),
      ]);
      setReplies(repliesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading replies:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateClassification(replyId: string, classification: ReplyClassification) {
    try {
      await updateClassification(replyId, classification);
      toast.success('Classification updated');
      loadData();
    } catch (error) {
      toast.error('Failed to update');
    }
  }

  const getIcon = (classification: ReplyClassification) => {
    switch (classification) {
      case 'interested':
        return <ThumbsUp className="w-4 h-4" />;
      case 'meeting_request':
        return <Calendar className="w-4 h-4" />;
      case 'not_interested':
        return <ThumbsDown className="w-4 h-4" />;
      case 'unsubscribe':
        return <XCircle className="w-4 h-4" />;
      case 'out_of_office':
        return <Clock className="w-4 h-4" />;
      case 'question':
        return <HelpCircle className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;
  }

  const totalReplies = stats
    ? Object.values(stats).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-amber-600" />
          <h3 className="font-semibold text-gray-900">Reply Classifications</h3>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
            {totalReplies} total
          </span>
        </div>
        <button
          onClick={loadData}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-2">
          <StatCard
            label="Interested"
            count={stats.interested + stats.meeting_request}
            icon={<ThumbsUp className="w-4 h-4" />}
            color="text-green-600 bg-green-100"
          />
          <StatCard
            label="Not Interested"
            count={stats.not_interested + stats.unsubscribe}
            icon={<ThumbsDown className="w-4 h-4" />}
            color="text-red-600 bg-red-100"
          />
          <StatCard
            label="Out of Office"
            count={stats.out_of_office}
            icon={<Clock className="w-4 h-4" />}
            color="text-yellow-600 bg-yellow-100"
          />
          <StatCard
            label="Questions"
            count={stats.question + stats.other}
            icon={<HelpCircle className="w-4 h-4" />}
            color="text-blue-600 bg-blue-100"
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-400" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        >
          <option value="all">All Replies</option>
          <option value="interested">Interested</option>
          <option value="meeting_request">Meeting Requests</option>
          <option value="not_interested">Not Interested</option>
          <option value="unsubscribe">Unsubscribe</option>
          <option value="out_of_office">Out of Office</option>
          <option value="question">Questions</option>
          <option value="other">Other</option>
        </select>
      </div>

      {replies.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No replies to show</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {replies.map((reply) => (
            <div
              key={reply.id}
              className="bg-white border border-gray-200 rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-lg ${getClassificationColor(reply.classification)}`}>
                    {getIcon(reply.classification)}
                  </span>
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {getClassificationLabel(reply.classification)}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      {Math.round(reply.confidence_score * 100)}% confidence
                    </span>
                  </div>
                </div>
                {reply.is_reviewed && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                    <CheckCircle className="w-3 h-3" />
                    Reviewed
                  </span>
                )}
              </div>

              {reply.reply_subject && (
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Re: {reply.reply_subject}
                </div>
              )}

              {reply.reply_text && (
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-3 line-clamp-3">
                  {reply.reply_text}
                </p>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {new Date(reply.created_at).toLocaleDateString()} at{' '}
                  {new Date(reply.created_at).toLocaleTimeString()}
                </span>
                {!reply.is_reviewed && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400 mr-2">Correct?</span>
                    {(['interested', 'meeting_request', 'not_interested', 'question', 'other'] as ReplyClassification[]).map(
                      (c) => (
                        <button
                          key={c}
                          onClick={() => handleUpdateClassification(reply.id, c)}
                          className={`p-1 rounded hover:bg-gray-100 transition ${
                            reply.classification === c ? 'bg-amber-100' : ''
                          }`}
                          title={getClassificationLabel(c)}
                        >
                          {getIcon(c)}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  count,
  icon,
  color,
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3">
      <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center mb-2`}>
        {icon}
      </div>
      <div className="text-xl font-bold text-gray-900">{count}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
