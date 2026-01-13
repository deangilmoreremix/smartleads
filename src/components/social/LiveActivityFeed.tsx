import { useState, useEffect } from 'react';
import { UserPlus, Mail, TrendingUp, Target } from 'lucide-react';

interface Activity {
  id: string;
  type: 'signup' | 'campaign' | 'conversion' | 'milestone';
  user?: string;
  action: string;
  time: string;
  icon: React.ReactNode;
}

const activityTemplates = [
  { type: 'signup', action: 'started a free trial', icon: <UserPlus className="w-4 h-4" /> },
  { type: 'campaign', action: 'launched a new campaign', icon: <Mail className="w-4 h-4" /> },
  { type: 'conversion', action: 'converted 50 leads', icon: <TrendingUp className="w-4 h-4" /> },
  { type: 'milestone', action: 'reached 1000 contacts', icon: <Target className="w-4 h-4" /> },
];

const names = ['Sarah', 'Mike', 'Jessica', 'David', 'Emma', 'Ryan', 'Olivia', 'James'];
const locations = ['New York', 'London', 'Tokyo', 'Paris', 'Berlin', 'Sydney', 'Toronto'];

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const generateActivity = () => {
      const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
      const name = names[Math.floor(Math.random() * names.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];

      return {
        id: Date.now().toString(),
        type: template.type as Activity['type'],
        user: `${name} from ${location}`,
        action: template.action,
        time: 'Just now',
        icon: template.icon,
      };
    };

    const initialActivities = Array.from({ length: 3 }, generateActivity);
    setActivities(initialActivities);

    const interval = setInterval(() => {
      const newActivity = generateActivity();
      setActivities((prev) => [newActivity, ...prev.slice(0, 4)]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-8 left-8 z-40 w-80 max-w-full">
      <div className="space-y-2">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className="bg-white rounded-lg shadow-lg p-4 border border-gray-100 animate-in slide-in-from-left-4 fade-in"
            style={{
              animationDelay: `${index * 100}ms`,
              opacity: 1 - index * 0.2,
            }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">{activity.user}</span>
                  {' '}
                  {activity.action}
                </p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
