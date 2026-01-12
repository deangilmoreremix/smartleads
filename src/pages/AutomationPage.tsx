import { Link } from 'react-router-dom';
import { Bot, Clock, Zap, ArrowRight, CheckCircle, Target, Mail, Users, TrendingUp, Calendar, Shield } from 'lucide-react';
import GoogleMapsBackground from '../components/GoogleMapsBackground';

export default function AutomationPage() {
  return (
    <div className="min-h-screen bg-[#F5F1E8] relative">
      <GoogleMapsBackground />

      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#FFD666] rounded-lg flex items-center justify-center">
                <span className="text-gray-900 font-bold text-sm">SL</span>
              </div>
              <span className="text-gray-900 font-bold text-xl">Smart Leads</span>
            </Link>

            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-700 hover:text-gray-900 transition">
                Home
              </Link>
              <Link
                to="/dashboard/campaigns/new"
                className="bg-[#FFD666] text-gray-900 px-6 py-2 rounded-lg font-semibold hover:bg-[#FFC233] hover:shadow-lg transition transform hover:scale-105"
              >
                Try It Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 mb-6">
              <Bot className="w-5 h-5 text-[#FFD666]" />
              <span className="text-gray-700 font-semibold">Complete Automation</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              <span className="text-[#FFD666]" style={{ WebkitTextStroke: '2px #1A1A1A', paintOrder: 'stroke fill' }}>Fully Automated</span>
              <br />Outreach Campaigns
            </h1>

            <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
              From scraping leads to sending personalized emails, your Outreach Agent works 24/7 on autopilot.
              You just set your niche and a city, it handles research, writing, and sending for you.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/dashboard/campaigns/new"
                className="bg-[#FFD666] text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-[#FFC233] hover:shadow-2xl transition transform hover:scale-105 flex items-center space-x-2"
              >
                <span>Enable Autopilot</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/#demo"
                className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition border border-gray-200"
              >
                Watch Demo
              </Link>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden mb-20">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-6 border-b border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-2">The Complete Automation Pipeline</h3>
              <p className="text-gray-300">Your AI agent handles everything end-to-end</p>
            </div>
            <div className="p-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#FFD666]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-900 font-bold text-xl">1</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Target className="w-5 h-5 text-[#FFD666]" />
                      <h4 className="text-xl font-bold text-gray-900">Lead Discovery</h4>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">AUTOMATED</span>
                    </div>
                    <p className="text-gray-700">Continuously scrapes Google Maps for businesses matching your criteria. Updates your lead database daily with fresh prospects.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#FFD666]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-900 font-bold text-xl">2</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Shield className="w-5 h-5 text-[#FFD666]" />
                      <h4 className="text-xl font-bold text-gray-900">Email Verification</h4>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">AUTOMATED</span>
                    </div>
                    <p className="text-gray-700">Validates every email address, removes duplicates, and filters for personal emails. Protects your sender reputation automatically.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#FFD666]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-900 font-bold text-xl">3</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Zap className="w-5 h-5 text-[#FFD666]" />
                      <h4 className="text-xl font-bold text-gray-900">AI Email Generation</h4>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">AUTOMATED</span>
                    </div>
                    <p className="text-gray-700">GPT-5 analyzes each business and crafts personalized emails. Every message is unique and references actual business details.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#FFD666]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-900 font-bold text-xl">4</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Calendar className="w-5 h-5 text-[#FFD666]" />
                      <h4 className="text-xl font-bold text-xl">Smart Scheduling</h4>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">AUTOMATED</span>
                    </div>
                    <p className="text-gray-700">Optimizes send times based on timezone, industry patterns, and recipient behavior. Maximizes open rates automatically.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#FFD666]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-900 font-bold text-xl">5</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Mail className="w-5 h-5 text-[#FFD666]" />
                      <h4 className="text-xl font-bold text-gray-900">Email Delivery</h4>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">AUTOMATED</span>
                    </div>
                    <p className="text-gray-700">Sends emails through multiple authenticated Gmail accounts. Respects daily limits and manages warm-up automatically.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#FFD666]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-900 font-bold text-xl">6</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <TrendingUp className="w-5 h-5 text-[#FFD666]" />
                      <h4 className="text-xl font-bold text-gray-900">Performance Tracking</h4>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">AUTOMATED</span>
                    </div>
                    <p className="text-gray-700">Monitors opens, clicks, and replies in real-time. Automatically adjusts strategy based on what's working best.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Set It and <span className="text-[#FFD666]" style={{ WebkitTextStroke: '1px #1A1A1A', paintOrder: 'stroke fill' }}>Forget It</span>
            </h2>
            <p className="text-gray-700 text-lg max-w-3xl mx-auto">
              Configure your campaign once, then let your AI agent run continuously
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Manual Process</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <span className="text-red-600 font-bold mt-1">✗</span>
                  <span className="text-gray-700">Manually search Google Maps for leads</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-red-600 font-bold mt-1">✗</span>
                  <span className="text-gray-700">Copy contact info to spreadsheet</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-red-600 font-bold mt-1">✗</span>
                  <span className="text-gray-700">Validate emails one by one</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-red-600 font-bold mt-1">✗</span>
                  <span className="text-gray-700">Write personalized emails for each lead</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-red-600 font-bold mt-1">✗</span>
                  <span className="text-gray-700">Schedule and send emails manually</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-red-600 font-bold mt-1">✗</span>
                  <span className="text-gray-700">Track responses in separate tools</span>
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t border-gray-300">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-1">40+ hours</div>
                  <div className="text-gray-600">Per campaign</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#FFD666]/10 to-[#FFD666]/5 border-2 border-[#FFD666] rounded-2xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-[#FFD666] rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-gray-900" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Smart Leads Automation</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">AI agent scrapes Google Maps 24/7</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Auto-enriches with verified contact data</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Email validation built-in and automatic</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">GPT-5 generates unique personalized emails</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Smart scheduling and automatic sending</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Real-time analytics in one dashboard</span>
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t border-[#FFD666]">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#FFD666] mb-1" style={{ WebkitTextStroke: '0.5px #1A1A1A' }}>5 minutes</div>
                  <div className="text-gray-700 font-semibold">One-time setup</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#F0EBE0]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Works While <span className="text-[#FFD666]" style={{ WebkitTextStroke: '1px #1A1A1A', paintOrder: 'stroke fill' }}>You Sleep</span>
            </h2>
            <p className="text-gray-700 text-lg">
              24/7 operation means your pipeline is always growing
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-[#FFD666] hover:shadow-lg transition">
              <div className="w-16 h-16 bg-[#FFD666]/20 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Always Running</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your agent works around the clock, finding new leads and sending emails even when you're offline.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Daily Lead Scraping</span>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Overnight Email Sending</span>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Weekend Processing</span>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-[#FFD666] hover:shadow-lg transition">
              <div className="w-16 h-16 bg-[#FFD666]/20 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Multiple Inboxes</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Connect multiple Gmail accounts to scale your outreach while staying within daily sending limits.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Load Balancing</span>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Warm-up Management</span>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Health Monitoring</span>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-[#FFD666] hover:shadow-lg transition">
              <div className="w-16 h-16 bg-[#FFD666]/20 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Optimization</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                AI continuously learns from your campaign results and adjusts tactics for better performance.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">A/B Testing</span>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Send Time Optimization</span>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Content Refinement</span>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Real <span className="text-[#FFD666]" style={{ WebkitTextStroke: '1px #1A1A1A', paintOrder: 'stroke fill' }}>Results</span>
            </h2>
            <p className="text-gray-700 text-lg">
              Automation that actually delivers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">10hrs</div>
              <div className="text-gray-600 mb-4">Saved per week</div>
              <p className="text-sm text-gray-700">Focus on closing deals, not busy work</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">500+</div>
              <div className="text-gray-600 mb-4">Leads per day</div>
              <p className="text-sm text-gray-700">Continuous pipeline of qualified prospects</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">68%</div>
              <div className="text-gray-600 mb-4">Open rate</div>
              <p className="text-sm text-gray-700">High engagement with AI personalization</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">12%</div>
              <div className="text-gray-600 mb-4">Reply rate</div>
              <p className="text-sm text-gray-700">More conversations, more opportunities</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Stop Doing Manual Outreach
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Let AI handle your entire outreach process. Set it up once, generate leads forever.
          </p>
          <Link
            to="/dashboard/campaigns/new"
            className="inline-flex items-center space-x-2 bg-[#FFD666] text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-[#FFC233] hover:shadow-2xl transition transform hover:scale-105"
          >
            <span>Activate Autopilot Now</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
