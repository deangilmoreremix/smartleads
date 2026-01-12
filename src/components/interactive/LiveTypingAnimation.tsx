import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface LiveTypingAnimationProps {
  texts: Array<{ label: string; content: string }>;
}

export default function LiveTypingAnimation({ texts }: LiveTypingAnimationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentText = texts[currentIndex].content;

    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, 3000);
      return () => clearTimeout(pauseTimer);
    }

    if (!isDeleting && displayedText === currentText) {
      setIsPaused(true);
      return;
    }

    if (isDeleting && displayedText === '') {
      setIsDeleting(false);
      setCurrentIndex((prev) => (prev + 1) % texts.length);
      return;
    }

    const timeout = setTimeout(() => {
      if (isDeleting) {
        setDisplayedText(currentText.substring(0, displayedText.length - 1));
      } else {
        setDisplayedText(currentText.substring(0, displayedText.length + 1));
      }
    }, isDeleting ? 30 : 50);

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, isPaused, currentIndex, texts]);

  return (
    <div className="bg-gradient-to-br from-[#FFD666]/10 to-[#FFD666]/5 border-2 border-[#FFD666] rounded-2xl p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-[#FFD666] rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-gray-900" />
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-600">AI Writing in Real-Time</div>
          <div className="text-lg font-bold text-gray-900">{texts[currentIndex].label}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200 min-h-[200px] relative">
        <div className="font-mono text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {displayedText}
          <span className="inline-block w-0.5 h-5 bg-[#FFD666] animate-pulse ml-0.5"></span>
        </div>

        {!isPaused && (
          <div className="absolute bottom-4 right-4 flex items-center space-x-2 text-xs text-gray-500">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-[#FFD666] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-[#FFD666] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-[#FFD666] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span>GPT-5 is {isDeleting ? 'clearing' : 'writing'}...</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center space-x-2">
        {texts.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? 'w-8 bg-[#FFD666]' : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
