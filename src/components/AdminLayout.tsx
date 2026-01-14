import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Flag,
  History,
  Activity,
  ChevronLeft,
  Shield,
} from 'lucide-react';

const adminNavigation = [
  { name: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/dashboard/admin/users', icon: Users },
  { name: 'Subscriptions', href: '/dashboard/admin/subscriptions', icon: CreditCard },
  { name: 'Feature Flags', href: '/dashboard/admin/features', icon: Flag },
  { name: 'Audit Logs', href: '/dashboard/admin/audit', icon: History },
  { name: 'System Health', href: '/dashboard/admin/health', icon: Activity },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="flex">
        <aside className="w-64 bg-slate-800 border-r border-slate-700 min-h-screen sticky top-0">
          <div className="p-4 border-b border-slate-700">
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 text-slate-400 hover:text-white transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Back to Dashboard</span>
            </Link>
          </div>

          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold">Admin Panel</h2>
                <p className="text-xs text-slate-400">System Management</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {adminNavigation.map((item) => {
              const isActive =
                item.href === '/dashboard/admin'
                  ? location.pathname === '/dashboard/admin'
                  : location.pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-800">
            <div className="text-xs text-slate-500 text-center">
              Admin access enabled
            </div>
          </div>
        </aside>

        <main className="flex-1 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
