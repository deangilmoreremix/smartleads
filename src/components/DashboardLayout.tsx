import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Target,
  Mail,
  Users,
  CreditCard,
  LogOut,
  Menu,
  X,
  Zap,
  Brain,
  UserSearch
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Campaigns', href: '/dashboard/campaigns', icon: Target },
    { name: 'Leads', href: '/dashboard/leads', icon: UserSearch },
    { name: 'Intent Signals', href: '/dashboard/signals', icon: Brain },
    { name: 'Templates', href: '/dashboard/templates', icon: Mail },
    { name: 'Accounts', href: '/dashboard/accounts', icon: Users },
    { name: 'Plans', href: '/dashboard/plans', icon: CreditCard },
  ];

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    try {
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (data) {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const getDaysRemaining = () => {
    if (!subscription?.billing_cycle_end) return 0;
    const endDate = new Date(subscription.billing_cycle_end);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
            <span className="text-gray-900 font-bold text-sm">S</span>
          </div>
          <span className="text-gray-900 font-bold text-xl">SmartLeads</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-600 hover:text-gray-900"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex pt-14 lg:pt-0">
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:pt-0 pt-14
        `}>
          <div className="h-full flex flex-col">
            <div className="hidden lg:flex items-center space-x-2 px-6 py-5 border-b border-gray-200">
              <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                <span className="text-gray-900 font-bold text-sm">S</span>
              </div>
              <span className="text-gray-900 font-bold text-xl">SmartLeads</span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg transition
                      ${isActive
                        ? 'bg-yellow-50 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="px-4 pb-4 space-y-3 border-t border-gray-200 pt-4">
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-yellow-700 font-medium">
                    Free Trial ({getDaysRemaining()} days left)
                  </span>
                </div>
                <div className="flex items-center space-x-2 mb-1">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Credits</span>
                  <span className="text-lg font-bold text-blue-600 ml-auto">
                    {subscription?.credits_remaining || 0}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {subscription?.credits_remaining || 0} credits available for leads
                </p>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
