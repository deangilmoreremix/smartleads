import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock } from 'lucide-react';
import { validateEmail, sanitizeInput } from '../lib/utils';
import { ERROR_MESSAGES } from '../lib/constants';
import SEOHead from '../components/SEOHead';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sanitizedEmail = sanitizeInput(email);

    if (!validateEmail(sanitizedEmail)) {
      toast.error(ERROR_MESSAGES.INVALID_EMAIL);
      return;
    }

    if (!password || password.length < 6) {
      toast.error(ERROR_MESSAGES.WEAK_PASSWORD);
      return;
    }

    setLoading(true);

    try {
      await signIn(sanitizedEmail, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.message || ERROR_MESSAGES.AUTH_FAILED;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead title="Sign In - Smart Leads" description="Sign in to your Smart Leads account to manage your outreach campaigns" />
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SL</span>
              </div>
              <span className="text-stone-800 font-bold text-2xl">Smart Leads</span>
            </Link>
            <h1 className="text-3xl font-bold text-stone-800 mb-2">Welcome back</h1>
            <p className="text-stone-500">Sign in to your account to continue</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-amber-200 rounded-2xl p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full bg-amber-50/50 text-stone-800 placeholder-stone-400 border border-amber-200 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full bg-amber-50/50 text-stone-800 placeholder-stone-400 border border-amber-200 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-amber-300 text-orange-500 focus:ring-orange-400 focus:ring-offset-0 bg-amber-50"
                    disabled={loading}
                  />
                  <span className="ml-2 text-sm text-stone-500">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-orange-500 hover:text-orange-600 transition">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-medium py-3 rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-stone-500 text-sm">
                Don't have an account?{' '}
                <Link to="/signup" className="text-orange-500 hover:text-orange-600 font-medium transition">
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
