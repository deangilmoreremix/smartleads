import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface ApiKeyStatus {
  name: string;
  configured: boolean;
  valid: boolean;
  message: string;
  error?: string;
}

interface VerificationResult {
  success: boolean;
  allConfigured: boolean;
  allValid: boolean;
  results: ApiKeyStatus[];
  timestamp: string;
}

export default function ApiKeysStatus() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verifyApiKeys = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-api-keys`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify API keys');
      }

      const data = await response.json();
      setResult(data);

      if (data.allValid) {
        toast.success('All API keys are configured and working');
      } else if (data.allConfigured) {
        toast.error('Some API keys are invalid');
      } else {
        toast.error('Some API keys are not configured');
      }
    } catch (err: any) {
      console.error('Error verifying API keys:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: ApiKeyStatus) => {
    if (!status.configured) {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
    if (status.valid) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusColor = (status: ApiKeyStatus) => {
    if (!status.configured) return 'bg-yellow-50 border-yellow-200';
    if (status.valid) return 'bg-green-50 border-green-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">API Keys Status</h2>
          <p className="text-sm text-gray-600 mt-1">
            Verify that all API keys are configured and working correctly
          </p>
        </div>
        <button
          onClick={verifyApiKeys}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Verify API Keys
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Verification Failed</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-900">Overall Status</p>
              <p className="text-xs text-gray-600 mt-1">
                Last checked: {new Date(result.timestamp).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {result.allValid ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-green-700">All Systems Ready</span>
                </>
              ) : result.allConfigured ? (
                <>
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium text-red-700">Some Keys Invalid</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-700">Configuration Needed</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {result.results.map((status) => (
              <div
                key={status.name}
                className={`p-4 rounded-lg border ${getStatusColor(status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(status)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{status.name}</p>
                      <p className="text-sm text-gray-700 mt-1">{status.message}</p>
                      {status.error && (
                        <p className="text-xs text-red-600 mt-1">Error: {status.error}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      status.configured
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {status.configured ? 'Configured' : 'Not Configured'}
                    </span>
                    {status.configured && (
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        status.valid
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {status.valid ? 'Valid' : 'Invalid'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">How to Configure API Keys</h3>
            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
              <li>Go to your Supabase Dashboard</li>
              <li>Navigate to Project Settings → Edge Functions</li>
              <li>Click on "Manage secrets"</li>
              <li>Add the following secrets:
                <ul className="ml-6 mt-1 space-y-1 list-disc list-inside text-xs">
                  <li><code className="bg-blue-100 px-1 py-0.5 rounded">APIFY_API_TOKEN</code> - From Apify dashboard</li>
                  <li><code className="bg-blue-100 px-1 py-0.5 rounded">OPENAI_API_KEY</code> - From OpenAI dashboard</li>
                  <li><code className="bg-blue-100 px-1 py-0.5 rounded">UNIPILE_API_KEY</code> - From Unipile dashboard</li>
                  <li><code className="bg-blue-100 px-1 py-0.5 rounded">UNIPILE_DSN</code> - Optional, for webhook validation</li>
                </ul>
              </li>
              <li>Click "Save" and verify again</li>
            </ol>
          </div>
        </div>
      )}

      {!result && !loading && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Click "Verify API Keys" to check your configuration</p>
        </div>
      )}
    </div>
  );
}
