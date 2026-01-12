import { useState } from 'react';
import { Mail, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function EmailValidator() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<{
    valid: boolean;
    type: 'personal' | 'generic' | 'invalid';
    message: string;
  } | null>(null);

  const validateEmail = (value: string) => {
    if (!value) {
      setResult(null);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(value)) {
      setResult({
        valid: false,
        type: 'invalid',
        message: 'Invalid email format'
      });
      return;
    }

    const genericPatterns = ['info@', 'contact@', 'hello@', 'support@', 'admin@', 'sales@'];
    const isGeneric = genericPatterns.some(pattern => value.toLowerCase().startsWith(pattern));

    const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const domain = value.split('@')[1];
    const isPersonalDomain = personalDomains.includes(domain?.toLowerCase());

    if (isGeneric) {
      setResult({
        valid: true,
        type: 'generic',
        message: 'Generic email - Lower engagement expected'
      });
    } else if (isPersonalDomain || value.includes('.')) {
      setResult({
        valid: true,
        type: 'personal',
        message: 'Personal email - Great for outreach!'
      });
    } else {
      setResult({
        valid: true,
        type: 'personal',
        message: 'Business email - Good for outreach'
      });
    }
  };

  const handleChange = (value: string) => {
    setEmail(value);
    validateEmail(value);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <Mail className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Email Validator</h3>
      </div>

      <p className="text-gray-700 mb-4">
        Try entering different email addresses to see how we classify them
      </p>

      <div className="relative mb-6">
        <input
          type="email"
          value={email}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Enter email address..."
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#FFD666] focus:outline-none text-lg transition"
        />
        {result && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {result.type === 'personal' && <CheckCircle className="w-6 h-6 text-green-600" />}
            {result.type === 'generic' && <AlertCircle className="w-6 h-6 text-orange-500" />}
            {result.type === 'invalid' && <XCircle className="w-6 h-6 text-red-600" />}
          </div>
        )}
      </div>

      {result && (
        <div className={`p-4 rounded-lg border-2 transition-all ${
          result.type === 'personal' ? 'bg-green-50 border-green-200' :
          result.type === 'generic' ? 'bg-orange-50 border-orange-200' :
          'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            {result.type === 'personal' && <CheckCircle className="w-5 h-5 text-green-600" />}
            {result.type === 'generic' && <AlertCircle className="w-5 h-5 text-orange-500" />}
            {result.type === 'invalid' && <XCircle className="w-5 h-5 text-red-600" />}
            <span className={`font-semibold ${
              result.type === 'personal' ? 'text-green-800' :
              result.type === 'generic' ? 'text-orange-800' :
              'text-red-800'
            }`}>
              {result.message}
            </span>
          </div>
          {result.type === 'personal' && (
            <p className="text-sm text-green-700">
              Personal emails have 3.8x higher open rates and 6x better reply rates than generic addresses.
            </p>
          )}
          {result.type === 'generic' && (
            <p className="text-sm text-orange-700">
              Generic emails often go to shared inboxes with lower engagement rates.
            </p>
          )}
        </div>
      )}

      <div className="mt-6 space-y-2 text-sm text-gray-600">
        <p className="font-semibold text-gray-900">Try these examples:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleChange('john@gmail.com')}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            john@gmail.com
          </button>
          <button
            onClick={() => handleChange('info@business.com')}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            info@business.com
          </button>
          <button
            onClick={() => handleChange('sarah.smith@company.com')}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            sarah.smith@company.com
          </button>
        </div>
      </div>
    </div>
  );
}
