import { CheckCircle, Loader2, XCircle, Bot } from 'lucide-react';

interface AgentStep {
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

interface AgentStatusCardProps {
  jobType: string;
  status: 'initializing' | 'running' | 'completed' | 'failed';
  steps: AgentStep[];
  resultData?: {
    leadsFound?: number;
    emailsGenerated?: number;
    emailsSent?: number;
  };
}

export default function AgentStatusCard({
  jobType,
  status,
  steps,
  resultData = {}
}: AgentStatusCardProps) {
  const isComplete = status === 'completed';
  const isFailed = status === 'failed';
  const isRunning = status === 'running' || status === 'initializing';

  const getJobTypeLabel = () => {
    switch (jobType) {
      case 'lead_scraping':
        return 'Lead Scraping';
      case 'email_generation':
        return 'Email Generation';
      case 'email_sending':
        return 'Email Sending';
      case 'contact_enrichment':
        return 'Contact Enrichment';
      default:
        return 'AI Agent';
    }
  };

  const getStatusIcon = () => {
    if (isComplete) {
      return <Bot className="w-16 h-16 text-white" />;
    }
    if (isFailed) {
      return <XCircle className="w-16 h-16 text-white" />;
    }
    return <Loader2 className="w-16 h-16 text-white animate-spin" />;
  };

  const getStatusBgColor = () => {
    if (isComplete) return 'bg-gradient-to-br from-purple-500 to-purple-600';
    if (isFailed) return 'bg-gradient-to-br from-red-500 to-red-600';
    return 'bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
      <div className={`w-24 h-24 ${getStatusBgColor()} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
        {getStatusIcon()}
      </div>

      <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
        {isComplete && 'NotiQ AI Agent Completed!'}
        {isFailed && 'Agent Failed'}
        {isRunning && 'AI Agent Working...'}
      </h2>

      <p className="text-center text-gray-600 mb-6">
        {isComplete && `Your AI agent has successfully completed the ${getJobTypeLabel().toLowerCase()} and is ready for next steps.`}
        {isFailed && 'The agent encountered an error. Please check the logs and try again.'}
        {isRunning && `Your AI agent is ${getJobTypeLabel().toLowerCase()}. This may take a few minutes.`}
      </p>

      {isRunning && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                This process can take several minutes.
              </p>
              <p className="text-sm text-blue-700 mt-1">
                You will receive a notification once complete.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
              step.status === 'completed'
                ? 'bg-green-50 border border-green-200'
                : step.status === 'in_progress'
                ? 'bg-blue-50 border border-blue-200'
                : step.status === 'failed'
                ? 'bg-red-50 border border-red-200'
                : 'bg-gray-50 border border-gray-200'
            }`}
          >
            {step.status === 'completed' && (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            )}
            {step.status === 'in_progress' && (
              <Loader2 className="w-5 h-5 text-blue-600 flex-shrink-0 animate-spin" />
            )}
            {step.status === 'failed' && (
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            {step.status === 'pending' && (
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
            )}
            <span className={`text-sm font-medium ${
              step.status === 'completed' ? 'text-green-900' :
              step.status === 'in_progress' ? 'text-blue-900' :
              step.status === 'failed' ? 'text-red-900' :
              'text-gray-500'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {isComplete && Object.keys(resultData).length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Results:</h3>
          <div className="grid grid-cols-2 gap-3">
            {resultData.leadsFound !== undefined && (
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {resultData.leadsFound}
                </div>
                <div className="text-xs text-purple-700 mt-1">Leads Found</div>
              </div>
            )}
            {resultData.emailsGenerated !== undefined && (
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {resultData.emailsGenerated}
                </div>
                <div className="text-xs text-blue-700 mt-1">Emails Generated</div>
              </div>
            )}
            {resultData.emailsSent !== undefined && (
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {resultData.emailsSent}
                </div>
                <div className="text-xs text-green-700 mt-1">Emails Sent</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
