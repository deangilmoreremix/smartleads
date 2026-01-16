import { Circle, MessageSquare, CheckCircle, Archive, Clock, AlertCircle } from 'lucide-react';

export type ConversationStatus = 'new' | 'active' | 'replied' | 'waiting' | 'closed' | 'archived';

interface ConversationStatusBadgeProps {
  status: ConversationStatus;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

const statusConfig: Record<ConversationStatus, { icon: typeof Circle; color: string; bgColor: string; label: string }> = {
  new: { icon: Circle, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'New' },
  active: { icon: MessageSquare, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Active' },
  replied: { icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-100', label: 'Replied' },
  waiting: { icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-100', label: 'Awaiting Reply' },
  closed: { icon: AlertCircle, color: 'text-gray-500', bgColor: 'bg-gray-100', label: 'Closed' },
  archived: { icon: Archive, color: 'text-gray-400', bgColor: 'bg-gray-50', label: 'Archived' },
};

export default function ConversationStatusBadge({
  status,
  size = 'sm',
  showLabel = true
}: ConversationStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.active;
  const Icon = config.icon;

  const sizeClasses = size === 'sm'
    ? 'text-xs px-2 py-0.5'
    : 'text-sm px-2.5 py-1';

  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <span className={`inline-flex items-center gap-1 ${sizeClasses} ${config.bgColor} ${config.color} rounded-full font-medium`}>
      <Icon className={iconSize} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
