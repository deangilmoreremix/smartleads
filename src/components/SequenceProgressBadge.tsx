import { Play, Pause, CheckCircle, Mail } from 'lucide-react';

interface SequenceProgressBadgeProps {
  currentStep?: number;
  isPaused?: boolean;
  isCompleted?: boolean;
  nextSendDate?: string;
}

export default function SequenceProgressBadge({
  currentStep,
  isPaused,
  isCompleted,
  nextSendDate,
}: SequenceProgressBadgeProps) {
  if (isCompleted) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
        <CheckCircle className="w-4 h-4" />
        Completed
      </span>
    );
  }

  if (isPaused) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
        <Pause className="w-4 h-4" />
        Paused
      </span>
    );
  }

  if (currentStep) {
    const daysUntilNext = nextSendDate
      ? Math.ceil(
          (new Date(nextSendDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      : null;

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-200">
        <Mail className="w-4 h-4" />
        Step {currentStep}
        {daysUntilNext !== null && daysUntilNext > 0 && (
          <span className="text-xs">({daysUntilNext}d)</span>
        )}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-full bg-slate-100 text-slate-800 border border-slate-200">
      <Play className="w-4 h-4" />
      Not Started
    </span>
  );
}
