import { useState, useRef, useEffect } from 'react';
import { HelpCircle, Play, RotateCcw, CheckCircle, Book, MessageCircle } from 'lucide-react';
import { useOnboarding, TourType } from '../contexts/OnboardingContext';
import { useLocation } from 'react-router-dom';

interface TourOption {
  id: TourType;
  name: string;
  description: string;
  path?: string;
}

const tourOptions: TourOption[] = [
  {
    id: 'dashboard',
    name: 'Dashboard Tour',
    description: 'Learn about the main features and navigation',
    path: '/dashboard'
  },
  {
    id: 'campaign',
    name: 'Campaign Creation',
    description: 'How to create AI-powered outreach campaigns',
    path: '/dashboard/campaigns/new'
  },
  {
    id: 'leads',
    name: 'Managing Leads',
    description: 'Filter, sort, and manage your lead pipeline',
    path: '/dashboard/leads'
  },
  {
    id: 'templates',
    name: 'Email Templates',
    description: 'Create and customize email templates',
    path: '/dashboard/templates'
  },
  {
    id: 'accounts',
    name: 'Email Accounts',
    description: 'Connect and manage your email accounts',
    path: '/dashboard/accounts'
  },
  {
    id: 'autopilot',
    name: 'Autopilot Mode',
    description: 'Set up automated lead generation and outreach',
    path: '/dashboard/autopilot'
  }
];

export default function HelpMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { state, startTour, resetTour, getCompletedToursCount, getTotalTours } = useOnboarding();
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTourStatus = (tourId: TourType): boolean => {
    const statusMap: Record<TourType, boolean> = {
      welcome: state.welcome_completed,
      dashboard: state.dashboard_tour_completed,
      campaign: state.campaign_tour_completed,
      leads: state.leads_tour_completed,
      templates: state.templates_tour_completed,
      accounts: state.accounts_tour_completed,
      autopilot: state.autopilot_tour_completed
    };
    return statusMap[tourId];
  };

  const handleStartTour = async (tour: TourOption) => {
    if (tour.path && location.pathname !== tour.path) {
      window.location.href = tour.path;
      return;
    }

    await resetTour(tour.id);
    setIsOpen(false);
    setTimeout(() => startTour(tour.id), 100);
  };

  const completedCount = getCompletedToursCount();
  const totalTours = getTotalTours();
  const progressPercent = Math.round((completedCount / totalTours) * 100);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition relative"
        aria-label="Help menu"
      >
        <HelpCircle className="w-5 h-5 text-gray-600" />
        {completedCount < totalTours && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
          <div className="px-4 py-3 bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Help Center</h3>
              <span className="text-xs text-gray-500">{completedCount}/{totalTours} tours completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-1.5 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="py-2">
            <div className="px-3 py-2">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Guided Tours
              </h4>
            </div>

            {tourOptions.map((tour) => {
              const isCompleted = getTourStatus(tour.id);
              const isCurrentPage = tour.path === location.pathname;

              return (
                <button
                  key={tour.id}
                  onClick={() => handleStartTour(tour)}
                  className="w-full px-3 py-2 flex items-start gap-3 hover:bg-gray-50 transition text-left"
                >
                  <div className={`mt-0.5 flex-shrink-0 ${isCompleted ? 'text-green-500' : 'text-gray-400'}`}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{tour.name}</span>
                      {isCurrentPage && !isCompleted && (
                        <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 text-xs rounded">
                          Available
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{tour.description}</p>
                  </div>
                  {isCompleted && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartTour(tour);
                      }}
                      className="p-1 hover:bg-gray-200 rounded transition"
                      title="Replay tour"
                    >
                      <RotateCcw className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </button>
              );
            })}
          </div>

          <div className="border-t border-gray-100 px-3 py-2">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Resources
            </h4>
            <a
              href="#"
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition"
            >
              <Book className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-700">Documentation</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition"
            >
              <MessageCircle className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-700">Contact Support</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
