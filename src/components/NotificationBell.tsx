import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Users,
  X,
  Check,
  Trash2,
} from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import type { Database } from '../types/database';

type NotificationType = Database['public']['Tables']['notifications']['Row']['type'];

const notificationIcons: Record<NotificationType, typeof Bell> = {
  reply: MessageSquare,
  open: CheckCircle,
  bounce: AlertTriangle,
  campaign_complete: CheckCircle,
  leads_scraped: Users,
  credits_low: AlertTriangle,
  system: Bell,
};

const notificationColors: Record<NotificationType, string> = {
  reply: 'bg-green-100 text-green-600',
  open: 'bg-blue-100 text-blue-600',
  bounce: 'bg-red-100 text-red-600',
  campaign_complete: 'bg-emerald-100 text-emerald-600',
  leads_scraped: 'bg-cyan-100 text-cyan-600',
  credits_low: 'bg-amber-100 text-amber-600',
  system: 'bg-gray-100 text-gray-600',
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification: typeof notifications[0]) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    if (notification.campaign_id) {
      navigate(`/dashboard/campaigns/${notification.campaign_id}`);
    } else if (notification.type === 'reply' && notification.lead_id) {
      navigate('/dashboard/leads');
    }

    setIsOpen(false);
  };

  const recentNotifications = notifications.slice(0, 20);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No notifications yet</p>
                <p className="text-gray-400 text-xs mt-1">
                  You'll be notified when leads reply
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recentNotifications.map((notification) => {
                  const Icon = notificationIcons[notification.type];
                  const colorClass = notificationColors[notification.type];

                  return (
                    <li
                      key={notification.id}
                      className={`relative group ${
                        !notification.is_read ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <button
                        onClick={() => handleNotificationClick(notification)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition flex items-start gap-3"
                      >
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`text-sm ${
                                !notification.is_read
                                  ? 'font-semibold text-gray-900'
                                  : 'font-medium text-gray-700'
                              }`}
                            >
                              {notification.title}
                            </p>
                            {!notification.is_read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {notifications.length > 20 && (
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => {
                  setIsOpen(false);
                }}
                className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
