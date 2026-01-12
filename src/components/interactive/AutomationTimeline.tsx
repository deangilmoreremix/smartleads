import { useState, useEffect } from 'react';
import { Clock, Target, Mail, Zap, CheckCircle } from 'lucide-react';

interface TimelineEvent {
  time: string;
  icon: typeof Target;
  title: string;
  description: string;
  color: string;
}

export default function AutomationTimeline() {
  const [activeHour, setActiveHour] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const events: TimelineEvent[] = [
    { time: '12 AM', icon: Target, title: 'Lead Discovery', description: 'Scraping Google Maps for new prospects', color: 'blue' },
    { time: '3 AM', icon: Zap, title: 'Email Generation', description: 'GPT-5 writing personalized emails', color: 'purple' },
    { time: '6 AM', icon: Mail, title: 'Morning Send Wave', description: 'Optimal send times for East Coast', color: 'green' },
    { time: '9 AM', icon: CheckCircle, title: 'Performance Check', description: 'Analyzing open and reply rates', color: 'yellow' },
    { time: '12 PM', icon: Mail, title: 'Midday Send Wave', description: 'Peak engagement time emails', color: 'green' },
    { time: '3 PM', icon: Target, title: 'Lead Enrichment', description: 'Validating and scoring new leads', color: 'blue' },
    { time: '6 PM', icon: Mail, title: 'Evening Send Wave', description: 'West Coast optimal timing', color: 'green' },
    { time: '9 PM', icon: Zap, title: 'AI Optimization', description: 'Adjusting strategy based on results', color: 'purple' }
  ];

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveHour((prev) => (prev + 1) % 24);
    }, 2000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const getEventForHour = (hour: number) => {
    const index = Math.floor(hour / 3);
    return events[index % events.length];
  };

  const currentEvent = getEventForHour(activeHour);

  const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    blue: { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-700', glow: 'shadow-blue-500/50' },
    purple: { bg: 'bg-purple-100', border: 'border-purple-500', text: 'text-purple-700', glow: 'shadow-purple-500/50' },
    green: { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-700', glow: 'shadow-green-500/50' },
    yellow: { bg: 'bg-[#FFD666]/20', border: 'border-[#FFD666]', text: 'text-gray-900', glow: 'shadow-[#FFD666]/50' }
  };

  const colors = colorMap[currentEvent.color];
  const Icon = currentEvent.icon;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-[#FFD666] rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-gray-900" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">24/7 Automation</h3>
            <p className="text-sm text-gray-600">Your AI agent never sleeps</p>
          </div>
        </div>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-700 transition"
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Current Time</span>
          <span className="text-2xl font-bold text-[#FFD666]">
            {activeHour.toString().padStart(2, '0')}:00
          </span>
        </div>
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#FFD666] to-[#FFC233] transition-all duration-1000"
            style={{ width: `${(activeHour / 24) * 100}%` }}
          />
          {events.map((_, index) => (
            <div
              key={index}
              className="absolute top-0 w-1 h-full bg-white/50"
              style={{ left: `${(index / 8) * 100}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">00:00</span>
          <span className="text-xs text-gray-500">12:00</span>
          <span className="text-xs text-gray-500">24:00</span>
        </div>
      </div>

      <div className={`${colors.bg} border-2 ${colors.border} rounded-xl p-6 ${colors.glow} shadow-lg transition-all duration-500`}>
        <div className="flex items-start space-x-4">
          <div className={`w-14 h-14 ${colors.bg} border-2 ${colors.border} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-7 h-7 ${colors.text}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="text-xl font-bold text-gray-900">{currentEvent.title}</h4>
              <span className="text-sm text-gray-500">{currentEvent.time}</span>
            </div>
            <p className="text-gray-700">{currentEvent.description}</p>
            <div className="mt-3 flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className={`w-2 h-2 ${colors.bg} border ${colors.border} rounded-full animate-pulse`}></div>
                <div className={`w-2 h-2 ${colors.bg} border ${colors.border} rounded-full animate-pulse`} style={{ animationDelay: '0.2s' }}></div>
                <div className={`w-2 h-2 ${colors.bg} border ${colors.border} rounded-full animate-pulse`} style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span className="text-sm text-gray-600">Working...</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-2">
        {events.map((event, index) => {
          const isActive = Math.floor(activeHour / 3) % events.length === index;
          const eventColors = colorMap[event.color];
          return (
            <div
              key={index}
              className={`p-2 rounded-lg border transition-all ${
                isActive
                  ? `${eventColors.bg} ${eventColors.border} border-2`
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="text-xs font-semibold text-gray-700 mb-1">{event.time}</div>
              <div className="text-xs text-gray-600 truncate">{event.title}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
