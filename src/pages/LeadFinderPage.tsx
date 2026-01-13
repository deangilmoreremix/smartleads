import { Link } from 'react-router-dom';
import { Target, CheckCircle, MapPin, Filter, Mail, TrendingUp, ArrowRight, Zap, ChevronDown } from 'lucide-react';
import GoogleMapsBackground from '../components/GoogleMapsBackground';
import InteractiveMapDemo from '../components/interactive/InteractiveMapDemo';
import EmailValidator from '../components/interactive/EmailValidator';
import ROICalculator from '../components/interactive/ROICalculator';
import AnimatedCounter from '../components/interactive/AnimatedCounter';
import BusinessCardFlip from '../components/interactive/BusinessCardFlip';
import InteractiveDataQualityMeter from '../components/interactive/InteractiveDataQualityMeter';
import InteractiveCostCalculator from '../components/interactive/InteractiveCostCalculator';
import { ScrollReveal } from '../components/animations/ScrollReveal';
import { TiltCard } from '../components/animations/TiltCard';
import { MagneticButton } from '../components/animations/MagneticButton';
import { ScrollProgress } from '../components/ui/ScrollProgress';
import { AnimatedBackground } from '../components/ui/AnimatedBackground';
import { AnimatedProgressRing } from '../components/visualizations/AnimatedProgressRing';

export default function LeadFinderPage() {
  return (
    <div className="min-h-screen bg-[#F5F1E8] relative overflow-hidden">
      <ScrollProgress />
      <AnimatedBackground variant="blobs" />

      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#FFD666] rounded-lg flex items-center justify-center">
                <span className="text-gray-900 font-bold text-sm">SL</span>
              </div>
              <span className="text-gray-900 font-bold text-xl">Smart Leads</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <div className="relative group">
                <button className="text-gray-700 hover:text-gray-900 transition flex items-center space-x-1">
                  <span>Features</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <Link to="/features/lead-finder" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition">
                      <div className="font-semibold">Lead Finder</div>
                      <div className="text-xs text-gray-600">Find decision-makers instantly</div>
                    </Link>
                    <Link to="/features/ai-emails" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition">
                      <div className="font-semibold">AI Emails</div>
                      <div className="text-xs text-gray-600">Personalized at scale</div>
                    </Link>
                    <Link to="/features/automation" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition">
                      <div className="font-semibold">Automation</div>
                      <div className="text-xs text-gray-600">24/7 autopilot campaigns</div>
                    </Link>
                  </div>
                </div>
              </div>
              <Link to="/#demo" className="text-gray-700 hover:text-gray-900 transition">Demo</Link>
              <Link to="/#faq" className="text-gray-700 hover:text-gray-900 transition">FAQ</Link>
              <Link to="/pricing" className="text-gray-700 hover:text-gray-900 transition">Pricing</Link>
              <Link to="/affiliate" className="text-gray-700 hover:text-gray-900 transition">Affiliate</Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-700 hover:text-gray-900 transition">
                Dashboard
              </Link>
              <Link
                to="/dashboard/campaigns/new"
                className="bg-[#FFD666] text-gray-900 px-6 py-2 rounded-lg font-semibold hover:bg-[#FFC233] hover:shadow-lg transition transform hover:scale-105"
              >
                Start for Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="up" className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 mb-6 animate-float">
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
              <MagneticButton
                onClick={() => window.location.href = '/dashboard/campaigns/new'}
                className="bg-[#FFD666] text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-[#FFC233] hover:shadow-2xl transition flex items-center space-x-2"
              >
                <span>Start Finding Leads</span>
                <ArrowRight className="w-5 h-5" />
              </MagneticButton>
              <Link
                to="/#demo"
                className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition border border-gray-200"
              >
                Watch Demo
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={200} className="mb-20">
            <InteractiveMapDemo />
          </ScrollReveal>
        </div>
      </section>

      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="up" className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why <span className="text-[#FFD666]" style={{ WebkitTextStroke: '1px #1A1A1A', paintOrder: 'stroke fill' }}>Personal Emails</span> Matter
            </h2>
            <p className="text-gray-700 text-lg max-w-3xl mx-auto">
              Not all email addresses are created equal. Personal emails dramatically outperform generic ones.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <ScrollReveal direction="left" delay={100}>
              <TiltCard className="h-full">
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 h-full hover:border-green-500 transition-colors">
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
                  <span className="font-bold text-green-600"><AnimatedCounter end={68} suffix="%" /></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Reply Rate</span>
                  <span className="font-bold text-green-600"><AnimatedCounter end={12} suffix="%" /></span>
                </div>
                </div>
              </div>
            </TiltCard>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={200}>
            <TiltCard className="h-full">
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 h-full opacity-60 hover:border-red-500 transition-colors">
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
                  <span className="font-bold text-red-600"><AnimatedCounter end={18} suffix="%" /></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Reply Rate</span>
                  <span className="font-bold text-red-600"><AnimatedCounter end={2} suffix="%" /></span>
                </div>
                </div>
              </div>
            </TiltCard>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={300}>
            <TiltCard className="h-full">
              <div className="bg-[#FFD666]/10 border-2 border-[#FFD666] rounded-2xl p-8 h-full hover:border-[#FFC233] transition-colors">
              <div className="w-16 h-16 bg-[#FFD666] rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">The Difference</h3>
              <div className="space-y-4 mb-6">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-3xl font-bold text-gray-900 mb-1"><AnimatedCounter end={3.8} decimals={1} suffix="x" /></div>
                  <div className="text-gray-700">Higher open rate</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-3xl font-bold text-gray-900 mb-1"><AnimatedCounter end={6} suffix="x" /></div>
                  <div className="text-gray-700">Better reply rate</div>
                </div>
              </div>
              <p className="text-gray-700 text-sm">
                Personal emails reach decision-makers directly, bypassing assistants and generic inboxes.
                </p>
              </div>
            </TiltCard>
          </ScrollReveal>
        </div>

        <ScrollReveal direction="up" delay={400} className="max-w-7xl mx-auto mt-16">
          <div className="grid md:grid-cols-3 gap-8">
            <AnimatedProgressRing
              percentage={68}
              label="Personal Email Open Rate"
              color="#FFD666"
            />
            <AnimatedProgressRing
              percentage={18}
              label="Generic Email Open Rate"
              color="#ef4444"
            />
            <AnimatedProgressRing
              percentage={278}
              label="Improvement"
              color="#10b981"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={600} className="mt-16">
          <BusinessCardFlip />
        </ScrollReveal>
        </div>
      </section>

      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#F0EBE0]">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="up" className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Smart <span className="text-[#FFD666]" style={{ WebkitTextStroke: '1px #1A1A1A', paintOrder: 'stroke fill' }}>Filtering</span>
            </h2>
            <p className="text-gray-700 text-lg">
              We automatically identify and prioritize the best contacts
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={200} className="mb-16">
            <EmailValidator />
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <ScrollReveal direction="up" delay={100}>
              <TiltCard>
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#FFD666] hover:shadow-lg transition">
                  <Filter className="w-8 h-8 text-[#FFD666] mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Email Validation</h3>
                  <p className="text-gray-700 text-sm">
                    Verify deliverability before sending to reduce bounce rates and protect sender reputation.
                  </p>
                </div>
              </TiltCard>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={200}>
              <TiltCard>
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#FFD666] hover:shadow-lg transition">
                  <Target className="w-8 h-8 text-[#FFD666] mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Role Detection</h3>
                  <p className="text-gray-700 text-sm">
                    Identify founders, owners, and decision-makers versus employees and assistants.
                  </p>
                </div>
              </TiltCard>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={300}>
              <TiltCard>
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#FFD666] hover:shadow-lg transition">
                  <TrendingUp className="w-8 h-8 text-[#FFD666] mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Quality Scoring</h3>
                  <p className="text-gray-700 text-sm">
                    Rank leads by business ratings, review count, and engagement potential.
                  </p>
                </div>
              </TiltCard>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={400}>
              <TiltCard>
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#FFD666] hover:shadow-lg transition">
                  <CheckCircle className="w-8 h-8 text-[#FFD666] mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Deduplication</h3>
                  <p className="text-gray-700 text-sm">
                    Automatically remove duplicates across campaigns to avoid contacting the same lead twice.
                  </p>
                </div>
              </TiltCard>
            </ScrollReveal>
          </div>

        <ScrollReveal direction="up" delay={500} className="mb-16">
          <InteractiveDataQualityMeter />
        </ScrollReveal>

        <ScrollReveal direction="up" delay={600} className="mb-16">
          <InteractiveCostCalculator />
        </ScrollReveal>

        <ScrollReveal direction="up" delay={700}>
          <ROICalculator />
        </ScrollReveal>
        </div>
      </section>

      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal direction="up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Find Your Next Customers?
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Start building your targeted lead list in minutes. No credit card required.
            </p>
            <MagneticButton
              onClick={() => window.location.href = '/dashboard/campaigns/new'}
              className="inline-flex items-center space-x-2 bg-[#FFD666] text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-[#FFC233] hover:shadow-2xl transition animate-glow"
            >
              <span>Start Free Campaign</span>
              <ArrowRight className="w-5 h-5" />
            </MagneticButton>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
