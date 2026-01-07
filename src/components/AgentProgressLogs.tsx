import { useEffect, useState } from 'react';

interface ProgressLog {
  id: string;
  timestamp: string;
  log_level: 'info' | 'success' | 'warning' | 'error' | 'loading';
  icon: string;
  message: string;
  metadata?: Record<string, unknown>;
}

interface AgentProgressLogsProps {
  logs: ProgressLog[];
  progress: number;
  isComplete: boolean;
}

export default function AgentProgressLogs({ logs, progress, isComplete }: AgentProgressLogsProps) {
  const [displayedLogs, setDisplayedLogs] = useState<ProgressLog[]>([]);

  useEffect(() => {
    if (logs.length > displayedLogs.length) {
      const newLogs = logs.slice(displayedLogs.length);
      newLogs.forEach((log, index) => {
        setTimeout(() => {
          setDisplayedLogs(prev => [...prev, log]);
        }, index * 150);
      });
    }
  }, [logs, displayedLogs.length]);

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'loading':
        return 'text-orange-400';
      default:
        return 'text-gray-300';
    }
  };

  const getLogLevelSymbol = (level: string) => {
    switch (level) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      case 'loading':
        return '⏳';
      default:
        return '💡';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 shadow-2xl">
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <h3 className="text-white font-semibold text-sm">Agent Progress Logs</h3>
        </div>
        {isComplete && (
          <span className="text-green-400 text-xs font-medium">COMPLETED</span>
        )}
      </div>

      <div className="p-6 h-[500px] overflow-y-auto font-mono text-sm bg-gray-900 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
        {displayedLogs.map((log) => (
          <div
            key={log.id}
            className="flex items-start space-x-3 mb-2 animate-fade-in-up"
          >
            <span className="text-gray-500 text-xs mt-0.5 min-w-[70px]">
              [{formatTime(log.timestamp)}]
            </span>
            <span className={`${getLogLevelColor(log.log_level)} mt-0.5`}>
              {getLogLevelSymbol(log.log_level)}
            </span>
            <span className="text-gray-500 mt-0.5">{log.icon}</span>
            <span className={`flex-1 ${getLogLevelColor(log.log_level)}`}>
              {log.message}
            </span>
          </div>
        ))}

        {!isComplete && displayedLogs.length > 0 && (
          <div className="flex items-start space-x-3 mb-2 animate-pulse">
            <span className="text-gray-500 text-xs mt-0.5 min-w-[70px]">
              [{formatTime(new Date().toISOString())}]
            </span>
            <span className="text-orange-400 mt-0.5">⏳</span>
            <span className="text-gray-500 mt-0.5">⚙️</span>
            <span className="flex-1 text-orange-400">Processing...</span>
          </div>
        )}
      </div>

      <div className="bg-gray-800 px-6 py-4 border-t border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm font-medium">Progress</span>
          <span className="text-white font-bold text-sm">{progress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 transition-all duration-500 ease-out rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
