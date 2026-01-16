import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface AgentThinkingIndicatorProps {
  isThinking: boolean;
  message?: string;
  variant?: 'default' | 'minimal' | 'detailed';
}

const thinkingPhrases = [
  'Analyzing data patterns...',
  'Processing lead information...',
  'Generating personalized content...',
  'Optimizing outreach strategy...',
  'Validating contact details...',
  'Enriching lead profiles...',
  'Calculating best approach...',
  'Preparing email sequences...',
  'Scoring lead quality...',
  'Finding decision makers...'
];

export default function AgentThinkingIndicator({
  isThinking,
  message,
  variant = 'default'
}: AgentThinkingIndicatorProps) {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [dots, setDots] = useState('');
  const [waveOffset, setWaveOffset] = useState(0);

  useEffect(() => {
    if (!isThinking) return;

    const phraseInterval = setInterval(() => {
      setCurrentPhrase(prev => (prev + 1) % thinkingPhrases.length);
    }, 3000);

    return () => clearInterval(phraseInterval);
  }, [isThinking]);

  useEffect(() => {
    if (!isThinking) {
      setDots('');
      return;
    }

    const dotsInterval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);

    return () => clearInterval(dotsInterval);
  }, [isThinking]);

  useEffect(() => {
    if (!isThinking) return;

    const waveInterval = setInterval(() => {
      setWaveOffset(prev => (prev + 1) % 100);
    }, 50);

    return () => clearInterval(waveInterval);
  }, [isThinking]);

  if (!isThinking) return null;

  if (variant === 'minimal') {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-amber-400"
              style={{
                animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`
              }}
            />
          ))}
        </div>
        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); opacity: 0.5; }
            50% { transform: translateY(-6px); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className="bg-gradient-to-r from-gray-900 to-gray-950 rounded-xl p-4 border border-gray-800">
        <div className="flex items-start space-x-4">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-20"></div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-amber-400 font-semibold text-sm">AI Processing</span>
              <div className="flex space-x-0.5">
                {[0, 1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="w-1 bg-amber-400 rounded-full"
                    style={{
                      height: `${8 + Math.sin((waveOffset + i * 20) * 0.1) * 8}px`,
                      transition: 'height 0.1s ease'
                    }}
                  />
                ))}
              </div>
            </div>

            <p className="text-gray-300 text-sm">
              {message || thinkingPhrases[currentPhrase]}
            </p>

            <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <span>Neural Network Active</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
                <span>Data Stream Connected</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 rounded-full"
            style={{
              width: '100%',
              backgroundSize: '200% 100%',
              backgroundPosition: `${waveOffset}% 0`,
              transition: 'background-position 0.1s linear'
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full border border-amber-500/20">
      <div className="relative">
        <Sparkles className="w-4 h-4 text-amber-400" />
        <div className="absolute inset-0 text-amber-400 animate-ping opacity-50">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <span className="text-sm text-amber-200">
          {message || thinkingPhrases[currentPhrase]}
        </span>
        <span className="text-amber-400 w-6">{dots}</span>
      </div>

      <div className="flex space-x-0.5 ml-2">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="w-0.5 bg-amber-400 rounded-full"
            style={{
              height: `${6 + Math.sin((waveOffset + i * 25) * 0.15) * 6}px`,
              transition: 'height 0.1s ease'
            }}
          />
        ))}
      </div>
    </div>
  );
}
