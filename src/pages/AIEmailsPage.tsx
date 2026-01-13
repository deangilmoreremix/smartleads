import { Link } from 'react-router-dom';
import { Sparkles, Mail, Brain, Star, ArrowRight, Zap, TrendingUp, CheckCircle, Shield, ChevronDown } from 'lucide-react';
import GoogleMapsBackground from '../components/GoogleMapsBackground';
import LiveTypingAnimation from '../components/interactive/LiveTypingAnimation';
import PerformanceGauge from '../components/interactive/PerformanceGauge';
import AnimatedCounter from '../components/interactive/AnimatedCounter';
import LiveEmailPersonalizationEditor from '../components/interactive/LiveEmailPersonalizationEditor';
import BeforeAfterEmailSimulator from '../components/interactive/BeforeAfterEmailSimulator';
import { ScrollReveal } from '../components/animations/ScrollReveal';
import { TiltCard } from '../components/animations/TiltCard';
import { MagneticButton } from '../components/animations/MagneticButton';
import { ScrollProgress } from '../components/ui/ScrollProgress';
import { AnimatedBackground } from '../components/ui/AnimatedBackground';

export default function AIEmailsPage() {
  const emailExamples = [
    {
      label: 'Restaurant Owner',
      content: `Hi Sarah,\n\nI noticed Bella's Bistro has amazing reviews praising your "farm-to-table commitment." As someone working with restaurants on sustainable sourcing, that caught my attention.\n\nI help restaurants like yours reduce food costs by 15-20% while maintaining quality. Given your focus on fresh ingredients, this could be valuable.\n\nWould you be open to a quick 10-minute call next week?\n\nBest,\nJohn`
    },
    {
      label: 'Fitness Studio',
      content: `Hey Mike,\n\nUrban Fitness has incredible Google reviews - especially the one mentioning your "personalized training approach."\n\nI work with gyms to automate their member onboarding. Most save 5-10 hours per week on admin work.\n\nInterested in learning more?\n\nCheers,\nJohn`
    },
    {
      label: 'Coffee Shop',
      content: `Hi Maria,\n\nYour customers rave about The Coffee House's "cozy atmosphere" and "perfect lattes." Love seeing local businesses thrive!\n\nI help cafes optimize their supplier contracts - clients typically save $500-1000/month.\n\nFree to chat this week?\n\nBest,\nJohn`
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F1E8] relative overflow-hidden">
      <ScrollProgress />
      <GoogleMapsBackground variant="communication-network" />

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
              <Sparkles className="w-5 h-5 text-[#FFD666]" />
              <span className="text-gray-700 font-semibold">AI-Powered Personalization</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              <span className="text-[#FFD666]" style={{ WebkitTextStroke: '2px #1A1A1A', paintOrder: 'stroke fill' }}>Personalized</span> Cold Emails
              <br />at Scale
            </h1>

            <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
              We use Google Maps reviews with GPT-5 to craft unique, hyper-relevant emails for each prospect.
              This improves deliverability, avoids spam filters, and gets you more replies than generic templates.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <MagneticButton
                onClick={() => window.location.href = '/dashboard/campaigns/new'}
                className="bg-[#FFD666] text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-[#FFC233] hover:shadow-2xl transition flex items-center space-x-2"
              >
                <span>Generate AI Emails</span>
                <ArrowRight className="w-5 h-5" />
              </MagneticButton>
              <Link
                to="/#demo"
                className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition border border-gray-200"
              >
                See Examples
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={200} className="mb-20">
            <LiveTypingAnimation texts={emailExamples} />
          </ScrollReveal>

          <ScrollReveal direction="up" delay={300}>
            <LiveEmailPersonalizationEditor />
          </ScrollReveal>
        </div>
      </section>

      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="up" className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How <span className="text-[#FFD666]" style={{ WebkitTextStroke: '1px #1A1A1A', paintOrder: 'stroke fill' }}>GPT-5</span> Creates Magic
            </h2>
            <p className="text-gray-700 text-lg max-w-3xl mx-auto">
              Our AI analyzes every detail about a business to craft the perfect outreach message
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <ScrollReveal direction="up" delay={100}>
              <TiltCard className="h-full">
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 h-full hover:border-[#FFD666] hover:shadow-lg transition">
              <div className="w-16 h-16 bg-[#FFD666]/20 rounded-xl flex items-center justify-center mb-6">
                <Star className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Review Analysis</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                GPT-5 reads through Google Maps reviews to understand what customers love about the business,
                identifying key strengths and unique selling points.
              </p>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 italic">"Best coffee in town! The owner always remembers my order."</p>
                <div className="mt-2 text-xs text-[#FFD666] font-semibold">→ Personal touch, quality focus</div>
                </div>
              </div>
            </TiltCard>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={200}>
            <TiltCard className="h-full">
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 h-full hover:border-[#FFD666] hover:shadow-lg transition">
                <div className="w-16 h-16 bg-[#FFD666]/20 rounded-xl flex items-center justify-center mb-6">
                  <Brain className="w-8 h-8 text-gray-900" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Context Building</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The AI combines review insights with business information to understand the company's values,
                  challenges, and opportunities.
                </p>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Industry</span>
                      <span className="text-gray-900 font-semibold">Coffee Shop</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Focus</span>
                      <span className="text-gray-900 font-semibold">Quality & Service</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Rating</span>
                      <span className="text-gray-900 font-semibold">4.8 ⭐</span>
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
                  <Mail className="w-8 h-8 text-gray-900" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Email Crafting</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  GPT-5 writes a natural, conversational email that references specific details and presents
                  your offering as a genuine solution.
                </p>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Specific reference</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Relevant value prop</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Natural tone</span>
                    </div>
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
              Results That <span className="text-[#FFD666]" style={{ WebkitTextStroke: '1px #1A1A1A', paintOrder: 'stroke fill' }}>Speak</span> for Themselves
            </h2>
            <p className="text-gray-700 text-lg">
              AI personalization dramatically improves every metric that matters
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={200} className="grid md:grid-cols-4 gap-6 mb-12">
            <PerformanceGauge label="Open Rate" value={68} max={100} unit="%" color="green" />
            <PerformanceGauge label="Reply Rate" value={12} max={20} unit="%" color="blue" />
            <PerformanceGauge label="Deliverability" value={99} max={100} unit="%" color="yellow" />
            <PerformanceGauge label="Engagement" value={85} max={100} unit="%" color="purple" />
          </ScrollReveal>

          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Personalization Matters</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Bypasses Spam Filters</h4>
                    <p className="text-gray-700 text-sm">Unique content for each email means spam algorithms can't pattern-match and block your messages.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Builds Trust</h4>
                    <p className="text-gray-700 text-sm">Recipients know you've done your research, making them more likely to respond positively.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Increases Relevance</h4>
                    <p className="text-gray-700 text-sm">Every email addresses specific needs and contexts unique to that prospect.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Protects Reputation</h4>
                    <p className="text-gray-700 text-sm">Low spam rates keep your sender domain healthy for long-term deliverability.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Saves Time</h4>
                    <p className="text-gray-700 text-sm">AI generates hundreds of personalized emails in minutes, not hours or days.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Scales Effortlessly</h4>
                    <p className="text-gray-700 text-sm">Send thousands of unique emails with the same effort as sending one generic template.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="up">
            <BeforeAfterEmailSimulator />
          </ScrollReveal>
        </div>
      </section>

      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal direction="up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Start Sending Personalized Emails Today
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Let GPT-5 craft unique, high-converting emails for every prospect in your pipeline.
            </p>
            <MagneticButton
              onClick={() => window.location.href = '/dashboard/campaigns/new'}
              className="inline-flex items-center space-x-2 bg-[#FFD666] text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-[#FFC233] hover:shadow-2xl transition animate-glow"
            >
              <span>Create Your First Campaign</span>
              <ArrowRight className="w-5 h-5" />
            </MagneticButton>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
