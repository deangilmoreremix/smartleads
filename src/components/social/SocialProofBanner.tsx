import { useState, useEffect } from 'react';
import { Star, Users, TrendingUp } from 'lucide-react';

interface Stat {
  icon: React.ReactNode;
  value: number;
  label: string;
  suffix?: string;
}

export function SocialProofBanner() {
  const [stats, setStats] = useState<Stat[]>([
    { icon: <Users className="w-5 h-5" />, value: 10234, label: 'Active Users', suffix: '+' },
    { icon: <Star className="w-5 h-5" />, value: 4.9, label: 'Rating', suffix: '/5' },
    { icon: <TrendingUp className="w-5 h-5" />, value: 98, label: 'Success Rate', suffix: '%' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) =>
        prev.map((stat) => ({
          ...stat,
          value: stat.label === 'Active Users'
            ? stat.value + Math.floor(Math.random() * 5)
            : stat.value,
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-8 flex-wrap">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="opacity-80">{stat.icon}</div>
              <div>
                <div className="font-bold text-lg">
                  {stat.value.toLocaleString()}{stat.suffix}
                </div>
                <div className="text-xs opacity-90">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
