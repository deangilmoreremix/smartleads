import { useState, useEffect, Suspense, lazy } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowRight, ArrowLeft, MapPin, Mail, Sparkles, TrendingUp, Zap, Target, Clock } from 'lucide-react';
import { useOnboarding } from '../contexts/OnboardingContext';

const Confetti = lazy(() => import('./tour/Confetti'));

const welcomeSteps = [
  {
    icon: Sparkles,
    title: 'Welcome to SmartLeads',
    description: 'Your AI-powered lead generation and outreach platform. Get qualified leads from Google Maps and convert them with personalized emails.',
    highlight: 'Let us show you around!',
    features: [
      { icon: Target, text: 'Find targeted leads' },
      { icon: Mail, text: 'AI-powered emails' },
      { icon: TrendingUp, text: 'Track results' }
    ]
  },
  {
    icon: MapPin,
    title: 'Find Local Businesses',
    description: 'Our AI agent scrapes Google Maps to find businesses in any niche and location. Get emails, phone numbers, reviews, and more.',
    highlight: 'Target restaurants in NYC, gyms in LA, or any business anywhere.',
    animation: 'scrape'
  },
  {
    icon: Mail,
    title: 'AI-Powered Emails',
    description: 'Generate personalized cold emails using AI that references each business\'s unique details. No more generic templates.',
    highlight: 'Higher reply rates through personalization.',
    animation: 'email'
  },
  {
    icon: TrendingUp,
    title: 'Track Everything',
    description: 'Monitor opens, clicks, and replies in real-time. See which campaigns perform best and optimize your outreach.',
    highlight: 'Data-driven decisions for better results.',
    stats: [
      { label: 'Avg. Open Rate', value: '68%' },
      { label: 'Avg. Reply Rate', value: '12%' },
      { label: 'Time Saved', value: '10hrs/week' }
    ]
  },
  {
    icon: Zap,
    title: 'Run on Autopilot',
    description: 'Set it and forget it. Our automation runs 24/7 to scrape leads, generate emails, and send them on schedule.',
    highlight: 'Scale without the manual work.',
    animation: 'autopilot'
  }
];

export default function WelcomeModal() {
  const { showWelcome, setShowWelcome, markTourCompleted, startTour } = useOnboarding();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (showWelcome) {
      setCurrentSlide(0);
    }
  }, [showWelcome]);

  if (!showWelcome) return null;

  const handleNext = () => {
    if (currentSlide < welcomeSteps.length - 1 && !isAnimating) {
      setIsAnimating(true);
      setSlideDirection('right');
      setTimeout(() => {
        setCurrentSlide((prev) => prev + 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0 && !isAnimating) {
      setIsAnimating(true);
      setSlideDirection('left');
      setTimeout(() => {
        setCurrentSlide((prev) => prev - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handleSkip = async () => {
    await markTourCompleted('welcome');
    setShowWelcome(false);
  };

  const handleTakeTour = async () => {
    setShowConfetti(true);
    await markTourCompleted('welcome');
    setTimeout(() => {
      setShowWelcome(false);
      setTimeout(() => startTour('dashboard'), 300);
    }, 1000);
  };

  const step = welcomeSteps[currentSlide];
  const Icon = step.icon;
  const isLast = currentSlide === welcomeSteps.length - 1;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <Suspense fallback={null}>
        <Confetti active={showConfetti} duration={2000} particleCount={60} />
      </Suspense>

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="relative h-52 bg-gradient-to-br from-yellow-400 via-orange-500 to-orange-600 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="absolute inset-0">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/30 rounded-full animate-ping"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 2) * 40}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '2s'
                }}
              />
            ))}
          </div>

          <div
            className={`w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm transition-all duration-300 ${
              isAnimating ? 'scale-75 opacity-50' : 'scale-100 opacity-100'
            }`}
          >
            <Icon className="w-12 h-12 text-white" />
          </div>

          {step.animation === 'scrape' && (
            <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 bg-white/30 rounded-lg animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          )}

          {step.animation === 'email' && (
            <div className="absolute bottom-4 right-8">
              <div className="w-16 h-12 bg-white/30 rounded-lg animate-bounce" style={{ animationDuration: '2s' }}>
                <div className="w-full h-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white/70" />
                </div>
              </div>
            </div>
          )}

          {step.animation === 'autopilot' && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-white/70 animate-spin" style={{ animationDuration: '3s' }} />
                <span className="text-white/70 text-sm font-medium">24/7 Active</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex justify-center gap-1.5 mb-6">
            {welcomeSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isAnimating) {
                    setSlideDirection(index > currentSlide ? 'right' : 'left');
                    setCurrentSlide(index);
                  }
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'w-8 bg-gradient-to-r from-yellow-400 to-orange-500'
                    : index < currentSlide
                      ? 'w-2 bg-orange-300'
                      : 'w-2 bg-gray-200 hover:bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <div
            className={`transition-all duration-300 ${
              isAnimating
                ? slideDirection === 'right'
                  ? 'opacity-0 -translate-x-4'
                  : 'opacity-0 translate-x-4'
                : 'opacity-100 translate-x-0'
            }`}
          >
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
              {step.title}
            </h2>

            <p className="text-gray-600 text-center mb-4 leading-relaxed">
              {step.description}
            </p>

            {step.features && (
              <div className="flex justify-center gap-4 mb-4">
                {step.features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-1 animate-fadeIn"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="text-xs text-gray-600">{feature.text}</span>
                  </div>
                ))}
              </div>
            )}

            {step.stats && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {step.stats.map((stat, i) => (
                  <div
                    key={i}
                    className="text-center p-2 bg-gray-50 rounded-lg animate-fadeIn"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="text-lg font-bold text-orange-600">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-sm text-orange-600 font-medium text-center bg-orange-50 rounded-lg py-2 px-4">
              {step.highlight}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={handlePrev}
            disabled={currentSlide === 0 || isAnimating}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition ${
              currentSlide === 0 || isAnimating
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700 transition"
          >
            Skip for now
          </button>

          {isLast ? (
            <button
              onClick={handleTakeTour}
              disabled={isAnimating}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50"
            >
              Take the Tour
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={isAnimating}
              className="flex items-center gap-1 px-5 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
