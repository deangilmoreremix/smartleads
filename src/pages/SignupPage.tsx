import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User } from 'lucide-react';
import { validateEmail, sanitizeInput } from '../lib/utils';
import { ERROR_MESSAGES, MIN_PASSWORD_LENGTH } from '../lib/constants';
import SEOHead from '../components/SEOHead';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sanitizedEmail = sanitizeInput(email);
    const sanitizedName = sanitizeInput(fullName);

    if (!sanitizedName || sanitizedName.length < 2) {
      toast.error('Please enter your full name');
      return;
    }

    if (!validateEmail(sanitizedEmail)) {
      toast.error(ERROR_MESSAGES.INVALID_EMAIL);
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      toast.error(ERROR_MESSAGES.WEAK_PASSWORD);
      return;
    }

    setLoading(true);

    try {
      await signUp(sanitizedEmail, password, sanitizedName);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Signup error:', err);
      let errorMessage = ERROR_MESSAGES.GENERIC;

      if (err.message?.includes('already registered')) {
        errorMessage = ERROR_MESSAGES.EMAIL_EXISTS;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead title="Sign Up - Smart Leads" description="Create a free Smart Leads account and start automating your outreach today" />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SL</span>
              </div>
              <span className="text-white font-bold text-2xl">Smart Leads</span>
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-slate-400">Start automating your outreach today</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">
                  Full name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={loading}
                    minLength={2}
                    maxLength={100}
                    className="w-full bg-slate-900/50 text-white placeholder-slate-500 border border-slate-600 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="John Doe"
                    autoComplete="name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full bg-slate-900/50 text-white placeholder-slate-500 border border-slate-600 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={MIN_PASSWORD_LENGTH}
                    className="w-full bg-slate-900/50 text-white placeholder-slate-500 border border-slate-600 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-400">Must be at least {MIN_PASSWORD_LENGTH} characters</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium py-3 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition">
                  Sign in
                </Link>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-xs text-slate-500 text-center">
                By signing up, you agree to our{' '}
                <Link to="/terms" className="text-slate-400 hover:text-white transition">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-slate-400 hover:text-white transition">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
