import { Link } from 'react-router-dom';
import { Bot, Clock, Zap, ArrowRight, CheckCircle, Target, Mail, Users, TrendingUp, Calendar, Shield, ChevronDown } from 'lucide-react';
import GoogleMapsBackground from '../components/GoogleMapsBackground';
import AutomationTimeline from '../components/interactive/AutomationTimeline';
import AnimatedCounter from '../components/interactive/AnimatedCounter';
import AnimatedPipelineFlow from '../components/interactive/AnimatedPipelineFlow';
import { ScrollReveal } from '../components/animations/ScrollReveal';
import { TiltCard } from '../components/animations/TiltCard';
import { MagneticButton } from '../components/animations/MagneticButton';
import { ScrollProgress } from '../components/ui/ScrollProgress';
import { AnimatedBackground } from '../components/ui/AnimatedBackground';

export default function AutomationPage() {
  return (
    <div className="min-h-screen bg-[#F5F1E8] relative overflow-hidden">
      <ScrollProgress />
      <GoogleMapsBackground variant="email-pipeline" />

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
              <MagneticButton
                onClick={() => window.location.href = '/dashboard/campaigns/new'}
                className="bg-[#FFD666] text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-[#FFC233] hover:shadow-2xl transition flex items-center space-x-2"
              >
                <span>Enable Autopilot</span>
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
            <AutomationTimeline />
          </ScrollReveal>
        </div>
      </section>

      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="up" className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Set It and <span className="text-[#FFD666]" style={{ WebkitTextStroke: '1px #1A1A1A', paintOrder: 'stroke fill' }}>Forget It</span>
            </h2>
            <p className="text-gray-700 text-lg max-w-3xl mx-auto">
              Configure your campaign once, then let your AI agent run continuously
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <ScrollReveal direction="left" delay={100}>
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
                  <div className="text-3xl font-bold text-red-600 mb-1"><AnimatedCounter end={40} suffix="+" /> hours</div>
                  <div className="text-gray-600">Per campaign</div>
                </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={200}>
              <TiltCard>
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
                      <div className="text-3xl font-bold text-[#FFD666] mb-1" style={{ WebkitTextStroke: '0.5px #1A1A1A' }}><AnimatedCounter end={5} /> minutes</div>
                      <div className="text-gray-700 font-semibold">One-time setup</div>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#F0EBE0]">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="up" className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Works While <span className="text-[#FFD666]" style={{ WebkitTextStroke: '1px #1A1A1A', paintOrder: 'stroke fill' }}>You Sleep</span>
            </h2>
            <p className="text-gray-700 text-lg">
              24/7 operation means your pipeline is always growing
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            <ScrollReveal direction="up" delay={100}>
              <TiltCard className="h-full">
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 h-full hover:border-[#FFD666] hover:shadow-lg transition">
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
            </TiltCard>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={200}>
            <TiltCard className="h-full">
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 h-full hover:border-[#FFD666] hover:shadow-lg transition">
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
            </TiltCard>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={300}>
            <TiltCard className="h-full">
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 h-full hover:border-[#FFD666] hover:shadow-lg transition">
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
            </TiltCard>
          </ScrollReveal>
        </div>
        </div>
      </section>

      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="up">
            <AnimatedPipelineFlow />
          </ScrollReveal>
        </div>
      </section>

      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="up" className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Real <span className="text-[#FFD666]" style={{ WebkitTextStroke: '1px #1A1A1A', paintOrder: 'stroke fill' }}>Results</span>
            </h2>
            <p className="text-gray-700 text-lg">
              Automation that actually delivers
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={200} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2"><AnimatedCounter end={10} />hrs</div>
              <div className="text-gray-600 mb-4">Saved per week</div>
              <p className="text-sm text-gray-700">Focus on closing deals, not busy work</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2"><AnimatedCounter end={500} />+</div>
              <div className="text-gray-600 mb-4">Leads per day</div>
              <p className="text-sm text-gray-700">Continuous pipeline of qualified prospects</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2"><AnimatedCounter end={68} />%</div>
              <div className="text-gray-600 mb-4">Open rate</div>
              <p className="text-sm text-gray-700">High engagement with AI personalization</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2"><AnimatedCounter end={12} />%</div>
              <div className="text-gray-600 mb-4">Reply rate</div>
              <p className="text-sm text-gray-700">More conversations, more opportunities</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal direction="up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Stop Doing Manual Outreach
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Let AI handle your entire outreach process. Set it up once, generate leads forever.
            </p>
            <MagneticButton
              onClick={() => window.location.href = '/dashboard/campaigns/new'}
              className="inline-flex items-center space-x-2 bg-[#FFD666] text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-[#FFC233] hover:shadow-2xl transition animate-glow"
            >
              <span>Activate Autopilot Now</span>
              <ArrowRight className="w-5 h-5" />
            </MagneticButton>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
