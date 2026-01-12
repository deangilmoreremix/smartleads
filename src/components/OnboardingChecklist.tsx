import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, Circle, X, Rocket, Mail, Target, Users, Zap } from 'lucide-react';
import { useOnboarding } from '../contexts/OnboardingContext';
import { Link } from 'react-router-dom';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
  href?: string;
  action?: () => void;
}

export default function OnboardingChecklist() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const { state, startTour } = useOnboarding();

  if (isDismissed) return null;

  const completedToursCount = [
    state.dashboard_tour_completed,
    state.campaign_tour_completed,
    state.first_campaign_created,
    state.first_email_sent
  ].filter(Boolean).length;

  if (completedToursCount >= 4) return null;

  const items: ChecklistItem[] = [
    {
      id: 'dashboard-tour',
      title: 'Complete Dashboard Tour',
      description: 'Learn the basics of SmartLeads',
      icon: Rocket,
      completed: state.dashboard_tour_completed,
      action: () => startTour('dashboard')
    },
    {
      id: 'connect-account',
      title: 'Connect Email Account',
      description: 'Link your Gmail or email provider',
      icon: Mail,
      completed: state.accounts_tour_completed,
      href: '/dashboard/accounts'
    },
    {
      id: 'create-campaign',
      title: 'Create Your First Campaign',
      description: 'Start generating leads with AI',
      icon: Target,
      completed: state.first_campaign_created,
      href: '/dashboard/campaigns/new'
    },
    {
      id: 'send-email',
      title: 'Send Your First Email',
      description: 'Reach out to your prospects',
      icon: Users,
      completed: state.first_email_sent
    }
  ];

  const completedCount = items.filter((i) => i.completed).length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  return (
    <div className="fixed bottom-4 right-4 z-40 w-80">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-gray-100 hover:from-yellow-100 hover:to-orange-100 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-semibold text-gray-900">Getting Started</h3>
              <p className="text-xs text-gray-500">{completedCount}/{items.length} completed</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="p-3 space-y-2">
            {items.map((item) => {
              const Icon = item.icon;
              const content = (
                <div
                  className={`flex items-start gap-3 p-3 rounded-lg transition ${
                    item.completed
                      ? 'bg-green-50'
                      : 'bg-gray-50 hover:bg-gray-100 cursor-pointer'
                  }`}
                  onClick={!item.completed && item.action ? item.action : undefined}
                >
                  <div className={`mt-0.5 flex-shrink-0 ${item.completed ? 'text-green-500' : 'text-gray-300'}`}>
                    {item.completed ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${item.completed ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${item.completed ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                        {item.title}
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${item.completed ? 'text-green-600' : 'text-gray-500'}`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              );

              if (item.href && !item.completed) {
                return (
                  <Link key={item.id} to={item.href} className="block">
                    {content}
                  </Link>
                );
              }

              return <div key={item.id}>{content}</div>;
            })}

            <button
              onClick={() => setIsDismissed(true)}
              className="w-full mt-2 flex items-center justify-center gap-1 py-2 text-xs text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-3 h-3" />
              Dismiss checklist
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
