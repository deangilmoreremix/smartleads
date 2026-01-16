import { Mail, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export type EmailStatus = 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'failed';

interface EmailStatusCardProps {
  status: EmailStatus;
  subject: string;
  recipient: string;
  sentAt?: string;
  openedAt?: string;
  clickedAt?: string;
}

const statusConfig: Record<EmailStatus, { icon: typeof Mail; color: string; bgColor: string; label: string }> = {
  queued: { icon: Clock, color: 'text-gray-500', bgColor: 'bg-gray-100', label: 'Queued' },
  sent: { icon: Mail, color: 'text-blue-500', bgColor: 'bg-blue-100', label: 'Sent' },
  delivered: { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-100', label: 'Delivered' },
  opened: { icon: CheckCircle, color: 'text-emerald-500', bgColor: 'bg-emerald-100', label: 'Opened' },
  clicked: { icon: CheckCircle, color: 'text-cyan-500', bgColor: 'bg-cyan-100', label: 'Clicked' },
  replied: { icon: CheckCircle, color: 'text-teal-500', bgColor: 'bg-teal-100', label: 'Replied' },
  bounced: { icon: AlertCircle, color: 'text-orange-500', bgColor: 'bg-orange-100', label: 'Bounced' },
  failed: { icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-100', label: 'Failed' },
};

export default function EmailStatusCard({
  status,
  subject,
  recipient,
  sentAt,
  openedAt,
}: EmailStatusCardProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${config.bgColor}`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-gray-900 truncate">{subject}</h4>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bgColor} ${config.color}`}>
              {config.label}
            </span>
          </div>
          <p className="text-sm text-gray-500 truncate">To: {recipient}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
            {sentAt && <span>Sent: {new Date(sentAt).toLocaleDateString()}</span>}
            {openedAt && <span>Opened: {new Date(openedAt).toLocaleDateString()}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
