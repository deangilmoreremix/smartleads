import { Check } from 'lucide-react';

interface ProgressTimelineProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
  stepTitles?: string[];
}

export default function ProgressTimeline({
  currentStep,
  totalSteps,
  onStepClick,
  stepTitles = []
}: ProgressTimelineProps) {
  return (
    <div className="flex items-center justify-center gap-1">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNumber = i + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const isClickable = onStepClick && (isCompleted || isCurrent);

        return (
          <div key={i} className="flex items-center">
            <button
              onClick={() => isClickable && onStepClick?.(stepNumber)}
              disabled={!isClickable}
              className={`
                relative flex items-center justify-center rounded-full transition-all duration-300
                ${isCurrent
                  ? 'w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg scale-110'
                  : isCompleted
                    ? 'w-6 h-6 bg-green-500 text-white cursor-pointer hover:scale-110'
                    : 'w-6 h-6 bg-gray-200 text-gray-400'
                }
              `}
              title={stepTitles[i] || `Step ${stepNumber}`}
            >
              {isCompleted ? (
                <Check className="w-3 h-3" />
              ) : (
                <span className={`text-xs font-bold ${isCurrent ? 'text-white' : ''}`}>
                  {stepNumber}
                </span>
              )}
              {isCurrent && (
                <span className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-30" />
              )}
            </button>

            {i < totalSteps - 1 && (
              <div className="relative w-4 h-0.5 mx-0.5">
                <div className="absolute inset-0 bg-gray-200 rounded-full" />
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: isCompleted ? '100%' : isCurrent ? '50%' : '0%' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
