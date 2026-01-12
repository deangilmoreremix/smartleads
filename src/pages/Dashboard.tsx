import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BarChart3, Gift, Mail, Zap } from 'lucide-react';
import { useOnboarding } from '../contexts/OnboardingContext';

export default function Dashboard() {
  const { state, activeTour, startTour } = useOnboarding();

  useEffect(() => {
    const hasSeenTourThisSession = sessionStorage.getItem('dashboard_tour_shown');

    if (state.welcome_completed && !activeTour && !hasSeenTourThisSession) {
      const timer = setTimeout(() => {
        startTour('dashboard');
        sessionStorage.setItem('dashboard_tour_shown', 'true');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.welcome_completed, activeTour, startTour]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome to your SmartLeads dashboard</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            data-tour="start-campaign"
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Start Campaign</h2>
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Launch your Google Maps Agent and get replies automatically with AI-powered lead generation.
            </p>
            <Link
              to="/dashboard/campaigns/new"
              className="block w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center px-6 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition"
            >
              Start New Campaign
            </Link>
          </div>

          <div
            data-tour="autopilot"
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Autopilot</h2>
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Run your outreach on autopilot 24/7. Automatically scrape leads, generate AI emails, and send them.
            </p>
            <Link
              to="/dashboard/autopilot"
              className="block w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center px-6 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition"
            >
              Autopilot Dashboard
            </Link>
          </div>

          <div
            data-tour="campaigns"
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Campaigns</h2>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-600 mb-8 leading-relaxed">
              View and manage your existing campaigns with detailed analytics and performance insights.
            </p>
            <Link
              to="/dashboard/campaigns"
              className="block w-full bg-gray-900 text-white text-center px-6 py-4 rounded-xl font-semibold hover:bg-gray-800 transition"
            >
              View Campaigns
            </Link>
          </div>

          <div
            data-tour="accounts"
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Accounts</h2>
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Manage your connected Google accounts and email providers for seamless automation.
            </p>
            <Link
              to="/dashboard/accounts"
              className="block w-full bg-gray-900 text-white text-center px-6 py-4 rounded-xl font-semibold hover:bg-gray-800 transition"
            >
              Manage Accounts
            </Link>
          </div>

          <div
            data-tour="templates"
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Templates</h2>
              <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Create and manage email templates for your outreach campaigns with AI-powered personalization.
            </p>
            <Link
              to="/dashboard/templates"
              className="block w-full bg-gray-900 text-white text-center px-6 py-4 rounded-xl font-semibold hover:bg-gray-800 transition"
            >
              Manage Templates
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
