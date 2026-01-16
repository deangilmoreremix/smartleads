import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Archive,
  MoreVertical,
  Send,
  Paperclip,
  Mic,
  ChevronLeft,
  Mail,
  Linkedin,
  RefreshCw,
  Check,
  MessageSquare,
  Clock,
  User,
  Building,
  ExternalLink,
  Inbox as InboxIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchConversations,
  fetchConversation,
  fetchMessages,
  markConversationRead,
  sendMessage,
  subscribeToConversations,
  subscribeToMessages,
  type InboxConversation,
  type InboxMessage,
} from '../services/messaging-service';
import PlatformIcon, { type Platform, getPlatformLabel } from '../components/messaging/PlatformIcon';
import ConversationStatusBadge, { type ConversationStatus } from '../components/messaging/ConversationStatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

type FilterPlatform = 'all' | Platform;
type FilterStatus = 'all' | 'unread' | 'active' | 'archived';

export default function UnifiedInboxPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId?: string }>();

  const [conversations, setConversations] = useState<InboxConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<InboxConversation | null>(null);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<FilterPlatform>('all');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showMobileConversation, setShowMobileConversation] = useState(false);

  const loadConversations = useCallback(async () => {
    if (!user) return;

    try {
      const data = await fetchConversations(user.id, {
        platform: platformFilter !== 'all' ? platformFilter : undefined,
        isArchived: statusFilter === 'archived',
      });
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [user, platformFilter, statusFilter]);

  const loadMessages = useCallback(async (convId: string) => {
    setMessagesLoading(true);
    try {
      const [conv, msgs] = await Promise.all([
        fetchConversation(convId),
        fetchMessages(convId),
      ]);
      if (conv) {
        setSelectedConversation(conv);
        setMessages(msgs);
        if (conv.unread_count > 0) {
          await markConversationRead(convId);
          setConversations(prev =>
            prev.map(c => c.id === convId ? { ...c, unread_count: 0 } : c)
          );
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
      setShowMobileConversation(true);
    }
  }, [conversationId, loadMessages]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToConversations(user.id, (updatedConv) => {
      setConversations(prev => {
        const exists = prev.find(c => c.id === updatedConv.id);
        if (exists) {
          return prev.map(c => c.id === updatedConv.id ? updatedConv : c);
        }
        return [updatedConv, ...prev];
      });
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!selectedConversation) return;

    const unsubscribe = subscribeToMessages(selectedConversation.id, (newMsg) => {
      setMessages(prev => [...prev, newMsg]);
    });

    return () => unsubscribe();
  }, [selectedConversation]);

  const handleSelectConversation = (conv: InboxConversation) => {
    navigate(`/dashboard/inbox/${conv.id}`);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    setSending(true);
    try {
      await sendMessage(user.id, selectedConversation.id, selectedConversation.contact_id, {
        type: selectedConversation.platform === 'email' ? 'email' : 'text',
        body: newMessage,
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleBackToList = () => {
    setShowMobileConversation(false);
    navigate('/dashboard/inbox');
  };

  const filteredConversations = conversations.filter(conv => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesContact = conv.contact?.name?.toLowerCase().includes(query) ||
        conv.contact?.email?.toLowerCase().includes(query) ||
        conv.contact?.company?.toLowerCase().includes(query);
      const matchesMessage = conv.last_message?.toLowerCase().includes(query);
      if (!matchesContact && !matchesMessage) return false;
    }

    if (statusFilter === 'unread' && conv.unread_count === 0) return false;

    return true;
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getConversationStatus = (conv: InboxConversation): ConversationStatus => {
    if (conv.is_archived) return 'archived';
    if (conv.status === 'replied') return 'replied';
    if (conv.unread_count > 0) return 'new';
    return 'active';
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner message="Loading inbox..." />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-gray-50">
      <div
        className={`w-full md:w-96 lg:w-[420px] bg-white border-r border-gray-200 flex flex-col ${
          showMobileConversation ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Inbox</h1>
            <button
              onClick={loadConversations}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-amber-400 focus:bg-white transition"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {(['all', 'email', 'linkedin', 'twitter'] as FilterPlatform[]).map((platform) => (
              <button
                key={platform}
                onClick={() => setPlatformFilter(platform)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  platformFilter === platform
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {platform === 'all' ? (
                  <InboxIcon className="w-4 h-4" />
                ) : (
                  <PlatformIcon platform={platform} size="sm" showBackground={false} />
                )}
                {platform === 'all' ? 'All' : getPlatformLabel(platform as Platform)}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mt-2">
            {(['all', 'unread', 'archived'] as FilterStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                  statusFilter === status
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <InboxIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-gray-900 font-medium mb-1">No conversations</h3>
              <p className="text-gray-500 text-sm">
                {searchQuery
                  ? 'No conversations match your search'
                  : 'Your inbox is empty'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition ${
                    selectedConversation?.id === conv.id ? 'bg-amber-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      {conv.contact?.avatar_url ? (
                        <img
                          src={conv.contact.avatar_url}
                          alt={conv.contact.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold">
                          {conv.contact?.name?.charAt(0) || '?'}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1">
                        <PlatformIcon platform={conv.platform as Platform} size="sm" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-medium truncate ${
                          conv.unread_count > 0 ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {conv.contact?.name || 'Unknown'}
                        </h3>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatTime(conv.last_message_at)}
                        </span>
                      </div>
                      {conv.contact?.company && (
                        <p className="text-xs text-gray-500 truncate mb-1">
                          {conv.contact.company}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${
                          conv.unread_count > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
                        }`}>
                          {conv.last_message || 'No messages yet'}
                        </p>
                        {conv.unread_count > 0 && (
                          <span className="ml-2 w-5 h-5 bg-amber-500 text-white text-xs font-medium rounded-full flex items-center justify-center flex-shrink-0">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className={`flex-1 flex flex-col bg-white ${
          !showMobileConversation ? 'hidden md:flex' : 'flex'
        }`}
      >
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToList}
                  className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  {selectedConversation.contact?.avatar_url ? (
                    <img
                      src={selectedConversation.contact.avatar_url}
                      alt={selectedConversation.contact.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold">
                      {selectedConversation.contact?.name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {selectedConversation.contact?.name || 'Unknown'}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <PlatformIcon
                      platform={selectedConversation.platform as Platform}
                      size="sm"
                      showBackground={false}
                    />
                    <span>{getPlatformLabel(selectedConversation.platform as Platform)}</span>
                    {selectedConversation.contact?.company && (
                      <>
                        <span>-</span>
                        <span>{selectedConversation.contact.company}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ConversationStatusBadge status={getConversationStatus(selectedConversation)} />
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition">
                  <Archive className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {selectedConversation.contact && (
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-4 text-sm">
                  {selectedConversation.contact.email && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{selectedConversation.contact.email}</span>
                    </div>
                  )}
                  {selectedConversation.contact.role && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{selectedConversation.contact.role}</span>
                    </div>
                  )}
                  {selectedConversation.contact.linkedin_url && (
                    <a
                      href={selectedConversation.contact.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sky-600 hover:text-sky-700"
                    >
                      <Linkedin className="w-4 h-4" />
                      <span>LinkedIn</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner message="Loading messages..." />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-gray-500">No messages yet</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        msg.direction === 'outbound'
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {msg.subject && (
                        <p className={`text-sm font-medium mb-1 ${
                          msg.direction === 'outbound' ? 'text-white/90' : 'text-gray-600'
                        }`}>
                          Re: {msg.subject}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap">{msg.body}</p>
                      <div className={`flex items-center justify-end gap-2 mt-2 text-xs ${
                        msg.direction === 'outbound' ? 'text-white/70' : 'text-gray-400'
                      }`}>
                        <span>{formatTime(msg.sent_at)}</span>
                        {msg.direction === 'outbound' && msg.read_at && (
                          <Check className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex items-end gap-2">
                <div className="flex-1 bg-gray-100 rounded-2xl p-3">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={1}
                    className="w-full bg-transparent border-0 focus:ring-0 resize-none text-gray-900 placeholder-gray-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition">
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition">
                        <Mic className="w-5 h-5" />
                      </button>
                    </div>
                    <span className="text-xs text-gray-400">
                      Press Enter to send
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="p-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-50 transition"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h2>
            <p className="text-gray-500 max-w-md">
              Choose a conversation from the list to view messages and continue the discussion
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
