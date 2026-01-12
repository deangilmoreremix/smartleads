import { Link } from 'react-router-dom';
import { Target, CheckCircle, MapPin, Filter, Mail, TrendingUp, ArrowRight, Zap } from 'lucide-react';
import GoogleMapsBackground from '../components/GoogleMapsBackground';

export default function LeadFinderPage() {
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
              <Target className="w-5 h-5 text-[#FFD666]" />
              <span className="text-gray-700 font-semibold">Lead Discovery</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Find <span className="text-[#FFD666]" style={{ WebkitTextStroke: '2px #1A1A1A', paintOrder: 'stroke fill' }}>Decision-Makers</span>
              <br />Instantly
            </h1>

            <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
              We scrape local businesses in your niche and target cities, then filter to only personal emails.
              These convert far better than generic ones, giving you higher open and reply rates.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/dashboard/campaigns/new"
                className="bg-[#FFD666] text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-[#FFC233] hover:shadow-2xl transition transform hover:scale-105 flex items-center space-x-2"
              >
                <span>Start Finding Leads</span>
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

          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-2xl mb-20">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-[#FFD666]/20 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-gray-900" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Google Maps Scraping</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Our AI agent scours Google Maps to find businesses matching your exact criteria.
                  Choose any niche, any location, and watch as we build your ideal prospect list.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Target any industry or business type</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Search by city, region, or postal code</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Get complete business information</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-500">SEARCH QUERY</span>
                      <Zap className="w-4 h-4 text-[#FFD666]" />
                    </div>
                    <p className="text-gray-900 font-medium">restaurants in New York City</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-sm text-gray-500 mb-2">RESULTS</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900">Businesses Found</span>
                        <span className="font-bold text-gray-900">1,247</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900">With Email</span>
                        <span className="font-bold text-green-600">892</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900">Personal Emails</span>
                        <span className="font-bold text-[#FFD666]">347</span>
                      </div>
                    </div>
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
              Why <span className="text-[#FFD666]" style={{ WebkitTextStroke: '1px #1A1A1A', paintOrder: 'stroke fill' }}>Personal Emails</span> Matter
            </h2>
            <p className="text-gray-700 text-lg max-w-3xl mx-auto">
              Not all email addresses are created equal. Personal emails dramatically outperform generic ones.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Personal Emails</h3>
              <div className="space-y-3 mb-6">
                <p className="text-gray-700 font-mono text-sm">john@gmail.com</p>
                <p className="text-gray-700 font-mono text-sm">sarah.smith@company.com</p>
                <p className="text-gray-700 font-mono text-sm">mike.founder@startup.io</p>
              </div>
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Open Rate</span>
                  <span className="font-bold text-green-600">68%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Reply Rate</span>
                  <span className="font-bold text-green-600">12%</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 opacity-60">
              <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <Mail className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Generic Emails</h3>
              <div className="space-y-3 mb-6">
                <p className="text-gray-700 font-mono text-sm">info@company.com</p>
                <p className="text-gray-700 font-mono text-sm">contact@business.com</p>
                <p className="text-gray-700 font-mono text-sm">hello@startup.io</p>
              </div>
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Open Rate</span>
                  <span className="font-bold text-red-600">18%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Reply Rate</span>
                  <span className="font-bold text-red-600">2%</span>
                </div>
              </div>
            </div>

            <div className="bg-[#FFD666]/10 border-2 border-[#FFD666] rounded-2xl p-8">
              <div className="w-16 h-16 bg-[#FFD666] rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">The Difference</h3>
              <div className="space-y-4 mb-6">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-3xl font-bold text-gray-900 mb-1">3.8x</div>
                  <div className="text-gray-700">Higher open rate</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-3xl font-bold text-gray-900 mb-1">6x</div>
                  <div className="text-gray-700">Better reply rate</div>
                </div>
              </div>
              <p className="text-gray-700 text-sm">
                Personal emails reach decision-makers directly, bypassing assistants and generic inboxes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#F0EBE0]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Smart <span className="text-[#FFD666]" style={{ WebkitTextStroke: '1px #1A1A1A', paintOrder: 'stroke fill' }}>Filtering</span>
            </h2>
            <p className="text-gray-700 text-lg">
              We automatically identify and prioritize the best contacts
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#FFD666] hover:shadow-lg transition">
              <Filter className="w-8 h-8 text-[#FFD666] mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email Validation</h3>
              <p className="text-gray-700 text-sm">
                Verify deliverability before sending to reduce bounce rates and protect sender reputation.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#FFD666] hover:shadow-lg transition">
              <Target className="w-8 h-8 text-[#FFD666] mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Role Detection</h3>
              <p className="text-gray-700 text-sm">
                Identify founders, owners, and decision-makers versus employees and assistants.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#FFD666] hover:shadow-lg transition">
              <TrendingUp className="w-8 h-8 text-[#FFD666] mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Quality Scoring</h3>
              <p className="text-gray-700 text-sm">
                Rank leads by business ratings, review count, and engagement potential.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#FFD666] hover:shadow-lg transition">
              <CheckCircle className="w-8 h-8 text-[#FFD666] mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Deduplication</h3>
              <p className="text-gray-700 text-sm">
                Automatically remove duplicates across campaigns to avoid contacting the same lead twice.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Find Your Next Customers?
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Start building your targeted lead list in minutes. No credit card required.
          </p>
          <Link
            to="/dashboard/campaigns/new"
            className="inline-flex items-center space-x-2 bg-[#FFD666] text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-[#FFC233] hover:shadow-2xl transition transform hover:scale-105"
          >
            <span>Start Free Campaign</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
