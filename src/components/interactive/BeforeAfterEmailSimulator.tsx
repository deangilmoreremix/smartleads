import { useState, useEffect } from 'react';
import { Mail, CheckCircle, X, RotateCcw } from 'lucide-react';

interface Email {
  id: number;
  status: 'sending' | 'delivered' | 'opened' | 'replied' | 'ignored';
  x: number;
  y: number;
}

export default function BeforeAfterEmailSimulator() {
  const [genericEmails, setGenericEmails] = useState<Email[]>([]);
  const [aiEmails, setAiEmails] = useState<Email[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [genericStats, setGenericStats] = useState({ opened: 0, replied: 0 });
  const [aiStats, setAiStats] = useState({ opened: 0, replied: 0 });

  const startSimulation = () => {
    setIsRunning(true);
    setGenericEmails([]);
    setAiEmails([]);
    setGenericStats({ opened: 0, replied: 0 });
    setAiStats({ opened: 0, replied: 0 });

    const emailCount = 20;

    for (let i = 0; i < emailCount; i++) {
      setTimeout(() => {
        const newEmail: Email = {
          id: i,
          status: 'sending',
          x: 50,
          y: 20
        };

        setGenericEmails(prev => [...prev, newEmail]);
        setAiEmails(prev => [...prev, { ...newEmail }]);

        setTimeout(() => {
          setGenericEmails(prev =>
            prev.map(email =>
              email.id === i ? { ...email, status: 'delivered', y: 50 } : email
            )
          );
          setAiEmails(prev =>
            prev.map(email =>
              email.id === i ? { ...email, status: 'delivered', y: 50 } : email
            )
          );

          setTimeout(() => {
            const genericOpenRate = 0.18;
            const aiOpenRate = 0.68;
            const genericReplyRate = 0.05;
            const aiReplyRate = 0.32;

            const genericOpened = Math.random() < genericOpenRate;
            const aiOpened = Math.random() < aiOpenRate;

            if (genericOpened) {
              setGenericEmails(prev =>
                prev.map(email =>
                  email.id === i ? { ...email, status: 'opened', y: 80 } : email
                )
              );
              setGenericStats(prev => ({ ...prev, opened: prev.opened + 1 }));

              const genericReplied = Math.random() < (genericReplyRate / genericOpenRate);
              if (genericReplied) {
                setTimeout(() => {
                  setGenericEmails(prev =>
                    prev.map(email =>
                      email.id === i ? { ...email, status: 'replied', y: 95 } : email
                    )
                  );
                  setGenericStats(prev => ({ ...prev, replied: prev.replied + 1 }));
                }, 500);
              }
            } else {
              setGenericEmails(prev =>
                prev.map(email =>
                  email.id === i ? { ...email, status: 'ignored', y: 80, x: 30 } : email
                )
              );
            }

            if (aiOpened) {
              setAiEmails(prev =>
                prev.map(email =>
                  email.id === i ? { ...email, status: 'opened', y: 80 } : email
                )
              );
              setAiStats(prev => ({ ...prev, opened: prev.opened + 1 }));

              const aiReplied = Math.random() < (aiReplyRate / aiOpenRate);
              if (aiReplied) {
                setTimeout(() => {
                  setAiEmails(prev =>
                    prev.map(email =>
                      email.id === i ? { ...email, status: 'replied', y: 95 } : email
                    )
                  );
                  setAiStats(prev => ({ ...prev, replied: prev.replied + 1 }));
                }, 500);
              }
            } else {
              setAiEmails(prev =>
                prev.map(email =>
                  email.id === i ? { ...email, status: 'ignored', y: 80, x: 30 } : email
                )
              );
            }
          }, 800);
        }, 600);
      }, i * 200);
    }

    setTimeout(() => {
      setIsRunning(false);
    }, emailCount * 200 + 2000);
  };

  const getEmailIcon = (email: Email) => {
    switch (email.status) {
      case 'sending':
        return <Mail className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <Mail className="w-4 h-4 text-blue-500" />;
      case 'opened':
        return <Mail className="w-4 h-4 text-green-500" />;
      case 'replied':
        return <CheckCircle className="w-4 h-4 text-yellow-500" />;
      case 'ignored':
        return <X className="w-4 h-4 text-red-400" />;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  const renderInbox = (emails: Email[], title: string, stats: typeof genericStats) => (
    <div className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-xl p-6 relative min-h-[500px]">
      <div className="mb-6">
        <h4 className="font-bold text-gray-900 text-lg mb-2">{title}</h4>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Opened: {stats.opened}/20</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600">Replied: {stats.replied}/20</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="bg-white border border-gray-300 rounded-lg p-3 flex items-center space-x-2">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500">Sending Zone</span>
        </div>
        <div className="bg-white border border-blue-300 rounded-lg p-3 flex items-center space-x-2">
          <Mail className="w-4 h-4 text-blue-500" />
          <span className="text-xs text-gray-500">Inbox</span>
        </div>
        <div className="bg-white border border-gray-300 rounded-lg p-3 min-h-[200px] relative">
          <div className="text-xs text-gray-500 mb-2">Activity</div>
          <div className="grid grid-cols-5 gap-2">
            {emails.map((email) => (
              <div
                key={email.id}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500
                  ${email.status === 'opened' ? 'bg-green-100 border-2 border-green-500' : ''}
                  ${email.status === 'replied' ? 'bg-yellow-100 border-2 border-yellow-500 animate-bounce' : ''}
                  ${email.status === 'ignored' ? 'bg-red-50 border border-red-300 opacity-40' : ''}
                  ${email.status === 'delivered' ? 'bg-blue-50 border border-blue-300' : ''}
                  ${email.status === 'sending' ? 'bg-gray-100 border border-gray-300 animate-pulse' : ''}
                `}
              >
                {getEmailIcon(email)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`
        absolute bottom-6 left-6 right-6 p-4 rounded-lg border-2
        ${title.includes('Generic') ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}
      `}>
        <div className="text-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">Open Rate:</span>
            <span className={`font-bold text-lg ${title.includes('Generic') ? 'text-red-600' : 'text-green-600'}`}>
              {((stats.opened / (emails.length || 1)) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">Reply Rate:</span>
            <span className={`font-bold text-lg ${title.includes('Generic') ? 'text-red-600' : 'text-green-600'}`}>
              {((stats.replied / (emails.length || 1)) * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Mail className="w-6 h-6 text-white" />
              <h3 className="text-2xl font-bold text-white">
                Email Response Rate Simulator
              </h3>
            </div>
            <p className="text-blue-50 mt-2">
              Watch how AI-personalized emails perform vs generic templates
            </p>
          </div>
          <button
            onClick={startSimulation}
            disabled={isRunning}
            className={`
              flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition
              ${isRunning
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-white text-blue-600 hover:bg-blue-50 hover:shadow-lg'
              }
            `}
          >
            <RotateCcw className={`w-5 h-5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running...' : 'Run Simulation'}</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {renderInbox(genericEmails, 'Generic Template', genericStats)}
          {renderInbox(aiEmails, 'AI-Personalized', aiStats)}
        </div>

        {!isRunning && genericEmails.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-[#FFD666] to-[#FFC233] rounded-xl p-6">
            <h4 className="font-bold text-gray-900 text-lg mb-2">Results</h4>
            <div className="grid md:grid-cols-3 gap-4 text-gray-900">
              <div>
                <div className="text-sm font-medium mb-1">Open Rate Improvement</div>
                <div className="text-3xl font-bold">
                  {(((aiStats.opened - genericStats.opened) / (genericStats.opened || 1)) * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Reply Rate Improvement</div>
                <div className="text-3xl font-bold">
                  {(((aiStats.replied - genericStats.replied) / (genericStats.replied || 1)) * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Extra Responses</div>
                <div className="text-3xl font-bold">
                  +{aiStats.replied - genericStats.replied}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
