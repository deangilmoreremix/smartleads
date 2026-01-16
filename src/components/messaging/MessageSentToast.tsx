import { CheckCircle } from 'lucide-react';
import { PlatformIcon, Platform } from './PlatformIcon';

interface MessageSentToastProps {
  platform: Platform;
  recipientName: string;
  messageType?: 'message' | 'inmail' | 'email' | 'voice_note';
}

export default function MessageSentToast({
  platform,
  recipientName,
  messageType = 'message'
}: MessageSentToastProps) {
  const getMessageLabel = () => {
    switch (messageType) {
      case 'inmail': return 'InMail';
      case 'email': return 'Email';
      case 'voice_note': return 'Voice note';
      default: return 'Message';
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <PlatformIcon platform={platform} size="sm" />
        <CheckCircle className="absolute -bottom-1 -right-1 w-4 h-4 text-green-500 bg-white rounded-full" />
      </div>
      <div>
        <p className="font-medium text-white">{getMessageLabel()} sent</p>
        <p className="text-sm text-gray-300">to {recipientName}</p>
      </div>
    </div>
  );
}
