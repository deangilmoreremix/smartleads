import { Mail, Linkedin, MessageCircle, AtSign, Globe } from 'lucide-react';

export type Platform = 'email' | 'linkedin' | 'twitter' | 'instagram' | 'other';

interface PlatformIconProps {
  platform: Platform;
  size?: 'sm' | 'md' | 'lg';
  showBackground?: boolean;
}

const platformConfig: Record<Platform, { icon: typeof Mail; color: string; bgColor: string; label: string }> = {
  email: { icon: Mail, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Email' },
  linkedin: { icon: Linkedin, color: 'text-sky-700', bgColor: 'bg-sky-100', label: 'LinkedIn' },
  twitter: { icon: AtSign, color: 'text-gray-800', bgColor: 'bg-gray-100', label: 'Twitter/X' },
  instagram: { icon: MessageCircle, color: 'text-pink-600', bgColor: 'bg-pink-100', label: 'Instagram' },
  other: { icon: Globe, color: 'text-gray-600', bgColor: 'bg-gray-100', label: 'Other' },
};

const sizeConfig = {
  sm: { container: 'w-6 h-6', icon: 'w-3 h-3' },
  md: { container: 'w-8 h-8', icon: 'w-4 h-4' },
  lg: { container: 'w-10 h-10', icon: 'w-5 h-5' },
};

export default function PlatformIcon({ platform, size = 'md', showBackground = true }: PlatformIconProps) {
  const config = platformConfig[platform] || platformConfig.other;
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  if (!showBackground) {
    return <Icon className={`${sizes.icon} ${config.color}`} />;
  }

  return (
    <div className={`${sizes.container} ${config.bgColor} rounded-lg flex items-center justify-center`}>
      <Icon className={`${sizes.icon} ${config.color}`} />
    </div>
  );
}

export function getPlatformLabel(platform: Platform): string {
  return platformConfig[platform]?.label || 'Other';
}
