import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';

interface EmailVerificationBadgeProps {
  status: 'valid' | 'invalid' | 'risky' | 'pending';
  size?: 'sm' | 'md' | 'lg';
}

export default function EmailVerificationBadge({
  status,
  size = 'md',
}: EmailVerificationBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const config = {
    valid: {
      icon: CheckCircle,
      label: 'Verified',
      colors: 'bg-green-100 text-green-800 border-green-200',
    },
    invalid: {
      icon: XCircle,
      label: 'Invalid',
      colors: 'bg-red-100 text-red-800 border-red-200',
    },
    risky: {
      icon: AlertTriangle,
      label: 'Risky',
      colors: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    pending: {
      icon: Clock,
      label: 'Pending',
      colors: 'bg-slate-100 text-slate-800 border-slate-200',
    },
  };

  const { icon: Icon, label, colors } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${colors} ${sizeClasses[size]}`}
    >
      <Icon className={iconSizes[size]} />
      {label}
    </span>
  );
}
