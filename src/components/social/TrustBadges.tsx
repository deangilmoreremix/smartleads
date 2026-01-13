import { Shield, Lock, Award, CheckCircle } from 'lucide-react';

interface Badge {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const badges: Badge[] = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Enterprise Security',
    description: 'Bank-level encryption',
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: 'GDPR Compliant',
    description: 'Privacy protected',
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: 'Industry Leader',
    description: 'Trusted by 10,000+',
  },
  {
    icon: <CheckCircle className="w-6 h-6" />,
    title: '99.9% Uptime',
    description: 'Always available',
  },
];

export function TrustBadges() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {badges.map((badge, index) => (
        <div
          key={index}
          className="group bg-white rounded-lg p-4 text-center hover:shadow-lg transition-all duration-300 border border-gray-100 cursor-pointer"
        >
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            {badge.icon}
          </div>
          <h4 className="font-semibold text-sm text-gray-900 mb-1">{badge.title}</h4>
          <p className="text-xs text-gray-600">{badge.description}</p>
        </div>
      ))}
    </div>
  );
}
