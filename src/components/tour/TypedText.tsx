import { useEffect, useState } from 'react';

interface TypedTextProps {
  text: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
  className?: string;
  highlightWords?: string[];
}

export default function TypedText({
  text,
  speed = 20,
  delay = 0,
  onComplete,
  className = '',
  highlightWords = []
}: TypedTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    let interval: ReturnType<typeof setInterval> | null = null;

    const startTimeout = setTimeout(() => {
      let currentIndex = 0;
      interval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          if (interval) clearInterval(interval);
          setIsComplete(true);
          onComplete?.();
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(startTimeout);
      if (interval) clearInterval(interval);
    };
  }, [text, speed, delay, onComplete]);

  const renderText = () => {
    if (highlightWords.length === 0) {
      return displayedText;
    }

    const pattern = new RegExp(`(${highlightWords.join('|')})`, 'gi');
    const parts = displayedText.split(pattern);

    return parts.map((part, index) => {
      const isHighlighted = highlightWords.some(
        (word) => word.toLowerCase() === part.toLowerCase()
      );
      return isHighlighted ? (
        <span key={index} className="text-orange-500 font-medium">
          {part}
        </span>
      ) : (
        <span key={index}>{part}</span>
      );
    });
  };

  return (
    <span className={className}>
      {renderText()}
      {!isComplete && (
        <span className="inline-block w-0.5 h-4 bg-orange-500 ml-0.5 animate-pulse" />
      )}
    </span>
  );
}
