import { useEffect, useState, useRef, Suspense, lazy, Component, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowRight, ArrowLeft, Lightbulb, MousePointer2, Keyboard, Check } from 'lucide-react';

const AnimatedIllustration = lazy(() => import('./tour/AnimatedIllustration'));
const TypedText = lazy(() => import('./tour/TypedText'));
const SampleDataPreview = lazy(() => import('./tour/SampleDataPreview'));
const Confetti = lazy(() => import('./tour/Confetti'));

class TourErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

export interface TourStepData {
  target: string;
  title: string;
  content: string;
  image?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  illustration?: 'campaign-create' | 'autopilot' | 'email-send' | 'leads-scrape' | 'analytics' | 'template-edit' | 'account-connect' | 'filter-search' | 'schedule' | 'default';
  proTip?: string;
  samplePreview?: 'lead-card' | 'email-preview' | 'analytics-mini' | 'campaign-result';
  highlightWords?: string[];
  shortcut?: string;
}

interface TourStepProps {
  step: TourStepData;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  isLast: boolean;
  stepTitles?: string[];
  onStepClick?: (step: number) => void;
}

function ProgressTimeline({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center justify-center gap-1">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNumber = i + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        return (
          <div key={i} className="flex items-center">
            <div
              className={`
                relative flex items-center justify-center rounded-full transition-all duration-300
                ${isCurrent
                  ? 'w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg scale-110'
                  : isCompleted
                    ? 'w-6 h-6 bg-green-500 text-white'
                    : 'w-6 h-6 bg-gray-200 text-gray-400'
                }
              `}
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
            </div>
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
  const [showContent, setShowContent] = useState(false);
  const [showProTip, setShowProTip] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0, visible: false });

  useEffect(() => {
    setShowContent(false);
    setShowProTip(false);
    const timer = setTimeout(() => {
      setShowContent(true);
      setTimeout(() => setShowProTip(true), 800);
    }, 100);
    return () => clearTimeout(timer);
  }, [step.target]);

  useEffect(() => {
    const findTarget = () => {
      const target = document.querySelector(step.target);
      if (target) {
        const rect = target.getBoundingClientRect();
        setTargetRect(rect);
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        calculatePosition(rect);
        setCursorPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          visible: true
        });
      }
    };

    const timer = setTimeout(findTarget, 50);
    window.addEventListener('resize', findTarget);
    window.addEventListener('scroll', findTarget);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', findTarget);
      window.removeEventListener('scroll', findTarget);
    };
  }, [step.target]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        if (currentStep > 1) onPrev();
      } else if (e.key === 'Escape') {
        onSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPrev, onSkip, currentStep, isLast]);

  const handleNext = () => {
    if (isLast) {
      setShowConfetti(true);
      setTimeout(() => {
        onNext();
      }, 1500);
    } else {
      onNext();
    }
  };

  const calculatePosition = (rect: DOMRect) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = 380;
    const tooltipHeight = step.samplePreview || step.illustration ? 420 : 300;
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
      <TourErrorBoundary>
        <Suspense fallback={null}>
          <Confetti active={showConfetti} duration={2000} particleCount={80} />
        </Suspense>
      </TourErrorBoundary>

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
            fill="rgba(0, 0, 0, 0.65)"
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
        <div className="absolute inset-0 rounded-lg animate-ping ring-2 ring-yellow-400 ring-opacity-50" style={{ animationDuration: '1.5s' }} />
      </div>

      {cursorPosition.visible && (
        <div
          className="fixed z-[9991] pointer-events-none animate-bounce"
          style={{
            left: cursorPosition.x + 20,
            top: cursorPosition.y - 10,
            animationDuration: '1s'
          }}
        >
          <MousePointer2 className="w-6 h-6 text-yellow-500 drop-shadow-lg" fill="#fbbf24" />
        </div>
      )}

      <div
        ref={tooltipRef}
        className="fixed z-[9992] w-[380px] transition-all duration-300"
        style={{
          left: tooltipPosition.x,
          top: tooltipPosition.y,
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0)' : 'translateY(10px)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className={getArrowStyle()} />

          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-gray-100">
            <ProgressTimeline currentStep={currentStep} totalSteps={totalSteps} />
            <button
              onClick={onSkip}
              className="p-1.5 hover:bg-white/50 rounded-full transition ml-2"
              aria-label="Skip tour"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="p-4">
            {step.illustration && (
              <TourErrorBoundary fallback={<div className="h-28 mb-3 bg-gray-100 rounded-lg" />}>
                <Suspense fallback={<div className="h-28 mb-3 bg-gray-100 rounded-lg animate-pulse" />}>
                  <AnimatedIllustration type={step.illustration} className="h-28 mb-3" />
                </Suspense>
              </TourErrorBoundary>
            )}

            {step.image && !step.illustration && (
              <div className="mb-3 rounded-lg overflow-hidden bg-gray-100">
                <img src={step.image} alt={step.title} className="w-full h-28 object-cover" />
              </div>
            )}

            <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>

            <div className="text-gray-600 text-sm leading-relaxed min-h-[48px]">
              <TourErrorBoundary fallback={<p>{step.content}</p>}>
                <Suspense fallback={<p>{step.content}</p>}>
                  <TypedText
                    text={step.content}
                    speed={15}
                    highlightWords={step.highlightWords}
                  />
                </Suspense>
              </TourErrorBoundary>
            </div>

            {step.samplePreview && showProTip && (
              <div className="mt-3 animate-fadeIn">
                <TourErrorBoundary fallback={null}>
                  <Suspense fallback={<div className="h-24 bg-gray-100 rounded-lg animate-pulse" />}>
                    <SampleDataPreview type={step.samplePreview} />
                  </Suspense>
                </TourErrorBoundary>
              </div>
            )}

            {step.proTip && showProTip && (
              <div className="mt-3 flex items-start gap-2 p-2.5 bg-amber-50 rounded-lg border border-amber-200 animate-fadeIn">
                <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">{step.proTip}</p>
              </div>
            )}
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

            <div className="flex items-center gap-2">
              {step.shortcut && (
                <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
                  <Keyboard className="w-3 h-3" />
                  <span>{step.shortcut}</span>
                </div>
              )}
              <button
                onClick={onSkip}
                className="text-xs text-gray-500 hover:text-gray-700 transition"
              >
                Skip
              </button>
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:scale-105 transition-all"
            >
              {isLast ? 'Complete' : 'Next'}
              {!isLast && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
