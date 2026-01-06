import { Link, useNavigate } from 'react-router-dom';
import { Plus, BarChart3, Gift, Mail, Bot } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const [testingAgent, setTestingAgent] = useState(false);

  const handleTestAgent = async () => {
    setTestingAgent(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-agent-progress', {
        body: {
          campaignName: 'Demo Campaign - Dentists in Miami'
        }
      });

      if (error) throw error;

      toast.success('AI Agent started! Redirecting to progress tracker...');
      setTimeout(() => {
        navigate(`/agent/progress/${data.jobId}`);
      }, 500);
    } catch (error) {
      console.error('Error starting test agent:', error);
      toast.error('Failed to start AI agent');
      setTestingAgent(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome to your NotiQ dashboard</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition">
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

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition">
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

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Accounts</h2>
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
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

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Templates</h2>
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
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

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-sm border-2 border-purple-200 hover:shadow-lg transition lg:col-span-2">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">AI Agent Demo</h2>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">NEW</span>
                </div>
                <p className="text-purple-600 font-medium">Experience the real-time progress tracking system</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <Bot className="w-7 h-7 text-white" />
              </div>
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Watch as our AI agent works through a simulated lead scraping task. You'll see real-time logs,
              progress updates, and the beautiful completion screen - just like when you run actual campaigns!
            </p>
            <div className="bg-white/80 rounded-lg p-4 mb-6 border border-purple-100">
              <h3 className="font-semibold text-gray-900 mb-2">What You'll See:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center space-x-2">
                  <span className="text-purple-500">✓</span>
                  <span>Live terminal-style progress logs with timestamps</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-purple-500">✓</span>
                  <span>Animated progress bar and status updates</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-purple-500">✓</span>
                  <span>Step-by-step completion tracking</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-purple-500">✓</span>
                  <span>Success banner with actionable next steps</span>
                </li>
              </ul>
            </div>
            <button
              onClick={handleTestAgent}
              disabled={testingAgent}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              {testingAgent ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Launching AI Agent...</span>
                </>
              ) : (
                <>
                  <Bot className="w-5 h-5" />
                  <span>Launch Demo AI Agent</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
