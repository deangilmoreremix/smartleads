import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowRight, ArrowLeft, MapPin, Mail, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { useOnboarding } from '../contexts/OnboardingContext';

const welcomeSteps = [
  {
    icon: Sparkles,
    title: 'Welcome to SmartLeads',
    description: 'Your AI-powered lead generation and outreach platform. Get qualified leads from Google Maps and convert them with personalized emails.',
    highlight: 'Let us show you around!'
  },
  {
    icon: MapPin,
    title: 'Find Local Businesses',
    description: 'Our AI agent scrapes Google Maps to find businesses in any niche and location. Get emails, phone numbers, reviews, and more.',
    highlight: 'Target restaurants in NYC, gyms in LA, or any business anywhere.'
  },
  {
    icon: Mail,
    title: 'AI-Powered Emails',
    description: 'Generate personalized cold emails using AI that references each business\'s unique details. No more generic templates.',
    highlight: 'Higher reply rates through personalization.'
  },
  {
    icon: TrendingUp,
    title: 'Track Everything',
    description: 'Monitor opens, clicks, and replies in real-time. See which campaigns perform best and optimize your outreach.',
    highlight: 'Data-driven decisions for better results.'
  },
  {
    icon: Zap,
    title: 'Run on Autopilot',
    description: 'Set it and forget it. Our automation runs 24/7 to scrape leads, generate emails, and send them on schedule.',
    highlight: 'Scale without the manual work.'
  }
];

export default function WelcomeModal() {
  const { showWelcome, setShowWelcome, markTourCompleted, startTour } = useOnboarding();
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!showWelcome) return null;

  const handleNext = () => {
    if (currentSlide < welcomeSteps.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleSkip = async () => {
    await markTourCompleted('welcome');
    setShowWelcome(false);
  };

  const handleTakeTour = async () => {
    await markTourCompleted('welcome');
    setShowWelcome(false);
    setTimeout(() => startTour('dashboard'), 300);
  };

  const step = welcomeSteps[currentSlide];
  const Icon = step.icon;
  const isLast = currentSlide === welcomeSteps.length - 1;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="relative h-48 bg-gradient-to-br from-yellow-400 via-orange-500 to-orange-600 flex items-center justify-center">
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Icon className="w-12 h-12 text-white" />
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-center gap-1.5 mb-6">
            {welcomeSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'w-8 bg-gradient-to-r from-yellow-400 to-orange-500'
                    : 'w-2 bg-gray-200 hover:bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
            {step.title}
          </h2>

          <p className="text-gray-600 text-center mb-4 leading-relaxed">
            {step.description}
          </p>

          <p className="text-sm text-orange-600 font-medium text-center bg-orange-50 rounded-lg py-2 px-4">
            {step.highlight}
          </p>
        </div>

        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition ${
              currentSlide === 0
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
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg transition"
            >
              Take the Tour
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-5 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg transition"
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
