import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ArrowRight, Inbox } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchInboxStats,
  fetchRecentConversations,
  type InboxStats,
  type InboxConversation,
} from '../services/messaging-service';
import PlatformIcon, { type Platform } from './messaging/PlatformIcon';

export default function InboxWidget() {
  const { user } = useAuth();
  const [stats, setStats] = useState<InboxStats | null>(null);
  const [recentConversations, setRecentConversations] = useState<InboxConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const [statsData, conversationsData] = await Promise.all([
          fetchInboxStats(user.id),
          fetchRecentConversations(user.id, 4),
        ]);
        setStats(statsData);
        setRecentConversations(conversationsData);
      } catch (error) {
        console.error('Error loading inbox data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-100 rounded-xl"></div>
          <div className="h-16 bg-gray-100 rounded-xl"></div>
          <div className="h-16 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Inbox className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Inbox</h2>
              <p className="text-sm text-gray-500">Recent conversations</p>
            </div>
          </div>
          {stats && stats.unreadCount > 0 && (
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
              {stats.unreadCount} unread
            </span>
          )}
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-900">{stats.totalConversations}</p>
              <p className="text-xs text-gray-500">Conversations</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-green-600">{stats.repliesThisWeek}</p>
              <p className="text-xs text-gray-500">Replies (7d)</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-amber-600">{stats.unreadCount}</p>
              <p className="text-xs text-gray-500">Unread</p>
            </div>
          </div>
        )}
      </div>

      <div className="divide-y divide-gray-100">
        {recentConversations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm mb-3">No conversations yet</p>
            <p className="text-xs text-gray-400">
              Conversations will appear here when leads reply to your outreach
            </p>
          </div>
        ) : (
          recentConversations.map((conv) => (
            <Link
              key={conv.id}
              to={`/dashboard/inbox/${conv.id}`}
              className="flex items-center gap-3 p-4 hover:bg-gray-50 transition"
            >
              <div className="relative flex-shrink-0">
                {conv.contact?.avatar_url ? (
                  <img
                    src={conv.contact.avatar_url}
                    alt={conv.contact.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold text-sm">
                    {conv.contact?.name?.charAt(0) || '?'}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1">
                  <PlatformIcon platform={conv.platform as Platform} size="sm" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className={`text-sm font-medium truncate ${
                    conv.unread_count > 0 ? 'text-gray-900' : 'text-gray-700'
                  }`}>
                    {conv.contact?.name || 'Unknown'}
                  </h3>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                    {formatTime(conv.last_message_at)}
                  </span>
                </div>
                <p className={`text-sm truncate ${
                  conv.unread_count > 0 ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {conv.last_message || 'No messages yet'}
                </p>
              </div>

              {conv.unread_count > 0 && (
                <span className="w-5 h-5 bg-amber-500 text-white text-xs font-medium rounded-full flex items-center justify-center flex-shrink-0">
                  {conv.unread_count}
                </span>
              )}
            </Link>
          ))
        )}
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <Link
          to="/dashboard/inbox"
          className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-amber-600 hover:text-amber-700 transition"
        >
          <span>View all conversations</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
