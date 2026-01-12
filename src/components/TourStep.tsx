import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

export interface TourStepData {
  target: string;
  title: string;
  content: string;
  image?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
}

interface TourStepProps {
  step: TourStepData;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  isLast: boolean;
}

export default function TourStep({
  step,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  isLast
}: TourStepProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [actualPosition, setActualPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom');
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const findTarget = () => {
      const target = document.querySelector(step.target);
      if (target) {
        const rect = target.getBoundingClientRect();
        setTargetRect(rect);
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        calculatePosition(rect);
      }
    };

    findTarget();
    window.addEventListener('resize', findTarget);
    window.addEventListener('scroll', findTarget);

    return () => {
      window.removeEventListener('resize', findTarget);
      window.removeEventListener('scroll', findTarget);
    };
  }, [step.target]);

  const calculatePosition = (rect: DOMRect) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = 340;
    const tooltipHeight = 200;
    const padding = 16;

    let position = step.position || 'auto';
    if (position === 'auto') {
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const spaceRight = viewportWidth - rect.right;
      const spaceLeft = rect.left;

      if (spaceBelow >= tooltipHeight + padding) {
        position = 'bottom';
      } else if (spaceAbove >= tooltipHeight + padding) {
        position = 'top';
      } else if (spaceRight >= tooltipWidth + padding) {
        position = 'right';
      } else if (spaceLeft >= tooltipWidth + padding) {
        position = 'left';
      } else {
        position = 'bottom';
      }
    }

    setActualPosition(position);

    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = rect.left + rect.width / 2 - tooltipWidth / 2;
        y = rect.top - tooltipHeight - padding;
        break;
      case 'bottom':
        x = rect.left + rect.width / 2 - tooltipWidth / 2;
        y = rect.bottom + padding;
        break;
      case 'left':
        x = rect.left - tooltipWidth - padding;
        y = rect.top + rect.height / 2 - tooltipHeight / 2;
        break;
      case 'right':
        x = rect.right + padding;
        y = rect.top + rect.height / 2 - tooltipHeight / 2;
        break;
    }

    x = Math.max(12, Math.min(x, viewportWidth - tooltipWidth - 12));
    y = Math.max(12, Math.min(y, viewportHeight - tooltipHeight - 12));

    setTooltipPosition({ x, y });
  };

  const getArrowStyle = () => {
    const baseClasses = 'absolute w-3 h-3 bg-white transform rotate-45 border-gray-200';
    switch (actualPosition) {
      case 'top':
        return `${baseClasses} -bottom-1.5 left-1/2 -translate-x-1/2 border-r border-b`;
      case 'bottom':
        return `${baseClasses} -top-1.5 left-1/2 -translate-x-1/2 border-l border-t`;
      case 'left':
        return `${baseClasses} -right-1.5 top-1/2 -translate-y-1/2 border-t border-r`;
      case 'right':
        return `${baseClasses} -left-1.5 top-1/2 -translate-y-1/2 border-b border-l`;
    }
  };

  if (!targetRect) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[9990]" onClick={onSkip}>
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <mask id="tour-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={targetRect.left - 8}
                y={targetRect.top - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="8"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.6)"
            mask="url(#tour-mask)"
          />
        </svg>
      </div>

      <div
        className="fixed z-[9991] pointer-events-none"
        style={{
          left: targetRect.left - 4,
          top: targetRect.top - 4,
          width: targetRect.width + 8,
          height: targetRect.height + 8
        }}
      >
        <div className="w-full h-full rounded-lg ring-4 ring-yellow-400 ring-opacity-75 animate-pulse" />
      </div>

      <div
        ref={tooltipRef}
        className="fixed z-[9992] w-[340px]"
        style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className={getArrowStyle()} />

          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                {currentStep}
              </div>
              <span className="text-sm text-gray-500">of {totalSteps}</span>
            </div>
            <button
              onClick={onSkip}
              className="p-1 hover:bg-gray-200 rounded-full transition"
              aria-label="Skip tour"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="p-4">
            {step.image && (
              <div className="mb-3 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-32 object-cover"
                />
              </div>
            )}

            <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{step.content}</p>
          </div>

          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100">
            <button
              onClick={onPrev}
              disabled={currentStep === 1}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                currentStep === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={onSkip}
              className="text-sm text-gray-500 hover:text-gray-700 transition"
            >
              Skip tour
            </button>

            <button
              onClick={onNext}
              className="flex items-center gap-1 px-4 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition"
            >
              {isLast ? 'Finish' : 'Next'}
              {!isLast && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
