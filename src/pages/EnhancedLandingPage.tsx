import { Link } from 'react-router-dom';
import { Zap, Target, Bot, ChevronDown, Mail, TrendingUp, Users, Award } from 'lucide-react';
import { useState } from 'react';
import GoogleMapsBackground from '../components/GoogleMapsBackground';
import { ScrollReveal } from '../components/animations/ScrollReveal';
import { ParallaxContainer } from '../components/animations/ParallaxContainer';
import { TiltCard } from '../components/animations/TiltCard';
import { MagneticButton } from '../components/animations/MagneticButton';
import { ScrollProgress } from '../components/ui/ScrollProgress';
import { AnimatedBackground } from '../components/ui/AnimatedBackground';
import { GlassmorphicCard } from '../components/ui/GlassmorphicCard';
import { LiveStatCard } from '../components/visualizations/LiveStatCard';
import { AnimatedProgressRing } from '../components/visualizations/AnimatedProgressRing';
import { SocialProofBanner } from '../components/social/SocialProofBanner';
import { TrustBadges } from '../components/social/TrustBadges';
import { LiveActivityFeed } from '../components/social/LiveActivityFeed';

export default function EnhancedLandingPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [promptInput, setPromptInput] = useState('');

  const faqs = [
    {
      question: 'What is Smart Leads?',
      answer: 'Smart Leads is an AI-driven outreach agent that leverages Google Maps to help businesses identify and contact local prospects. With a simple text prompt, it automates the entire process from lead discovery to personalized outreach.'
    },
    {
      question: 'What can I do with Smart Leads?',
      answer: 'Find decision-makers instantly by scraping listings in your preferred city or niche and extracting personal email addresses. Generate automated cold outreach using GPT-5 and Google Maps reviews. Run end-to-end campaign automation from lead scraping to message composition and email dispatch, 24/7 on autopilot.'
    },
    {
      question: 'How does personalization work?',
      answer: 'Smart Leads draws insights from Google Maps reviews and applies GPT-5 to craft unique, personalized cold emails tailored to each prospect—boosting deliverability and response rates over generic templates.'
    },
    {
      question: "What's the required setup?",
      answer: 'Sign in to Smart Leads via Start for Free or Sign In. Define your target niche (e.g., restaurants, gyms, real estate). Specify your city, district or region. Smart Leads takes over: scraping relevant businesses, extracting contact info, generating personalized messages, and sending emails—all with minimal manual intervention.'
    },
    {
      question: 'What makes Smart Leads different from other outreach tools?',
      answer: 'It uniquely taps into Google Maps to find local decision-makers, rather than relying solely on generic databases. Emails are AI-crafted and dynamically personalized using real review content, powered by GPT-5. The workflow is fully automated, requiring only your initial input to kick off scalable outreach.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes. Smart Leads offers a Start for Free option—suggesting there\'s at least a free tier or trial version to try the service before committing.'
    },
    {
      question: 'Who is Smart Leads intended for?',
      answer: 'It\'s ideal for businesses or individuals who seek local prospects based on geographic and category targeting, want to scale outreach without manual work, and need highly personalized emails that stand out from generic campaigns to get more replies and meetings.'
    }
  ];

  const prompts = [
    'Email restaurant founders NYC',
    'Cold outreach gym owners London',
    'Contact dental CEOs LA',
    'Reach real estate founders Dubai',
    'Connect auto repair founders Toronto'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-hidden">
      <ScrollProgress />
      <AnimatedBackground variant="blobs" />
      <LiveActivityFeed />

      <nav className="fixed top-0 w-full bg-white/70 backdrop-blur-xl border-b border-gray-200/50 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 animate-float">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">SL</span>
              </div>
              <span className="text-gray-900 font-bold text-xl">Smart Leads</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <div className="relative group">
                <button className="text-gray-700 hover:text-gray-900 transition flex items-center space-x-1">
                  <span>Features</span>
                  <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-64 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform group-hover:translate-y-0 -translate-y-2">
                  <div className="py-2">
                    <Link to="/features/lead-finder" className="block px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition rounded-lg mx-2">
                      <div className="font-semibold flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Lead Finder
                      </div>
                      <div className="text-xs text-gray-600">Find decision-makers instantly</div>
                    </Link>
                    <Link to="/features/ai-emails" className="block px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition rounded-lg mx-2">
                      <div className="font-semibold flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        AI Emails
                      </div>
                      <div className="text-xs text-gray-600">Personalized at scale</div>
                    </Link>
                    <Link to="/features/automation" className="block px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition rounded-lg mx-2">
                      <div className="font-semibold flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        Automation
                      </div>
                      <div className="text-xs text-gray-600">24/7 autopilot campaigns</div>
                    </Link>
                  </div>
                </div>
              </div>
              <a href="#demo" className="text-gray-700 hover:text-gray-900 transition">Demo</a>
              <a href="#faq" className="text-gray-700 hover:text-gray-900 transition">FAQ</a>
              <Link to="/pricing" className="text-gray-700 hover:text-gray-900 transition">Pricing</Link>
              <Link to="/affiliate" className="text-gray-700 hover:text-gray-900 transition">Affiliate</Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-700 hover:text-gray-900 transition">
                Dashboard
              </Link>
              <MagneticButton
                onClick={() => window.location.href = '/dashboard/campaigns/new'}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 animate-glow"
              >
                Start for Free
              </MagneticButton>
            </div>
          </div>
        </div>
      </nav>

      <SocialProofBanner />

      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="up" className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-4 animate-in fade-in slide-in-from-bottom-4">
              The Google Maps
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-shift">
                AI Outreach Agent
              </span>
            </h1>
            <ParallaxContainer speed={0.2}>
              <div className="flex justify-center mb-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-2xl animate-float">
                  <Mail className="w-16 h-16 text-blue-600" />
                </div>
              </div>
            </ParallaxContainer>
            <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto">
              Smart Leads is the simplest way for businesses to find, target, and reach local prospects on Google Maps. Now with just a prompt.
            </p>

            <GlassmorphicCard className="max-w-2xl mx-auto p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center space-x-2 bg-white/50 px-3 py-1 rounded-lg backdrop-blur-sm">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-600 text-sm font-medium">Live</span>
                </div>
                <div className="flex items-center space-x-2 bg-gray-900 px-3 py-1 rounded-lg">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-white text-sm font-medium">GPT-5</span>
                </div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Describe your outreach campaign and I'll build it"
                  className="w-full bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-500 border-2 border-gray-200 rounded-xl px-4 py-4 pr-14 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                />
                <Link
                  to="/dashboard/campaigns/new"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-110"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {prompts.slice(1).map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setPromptInput(prompt)}
                    className="text-sm text-gray-700 hover:text-gray-900 bg-white/50 hover:bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:border-blue-400 transition-all duration-300 hover:scale-105"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </GlassmorphicCard>
          </ScrollReveal>
        </div>
      </section>

      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="up" className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              Real Results, Real Time
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <ScrollReveal direction="up" delay={100}>
              <LiveStatCard
                title="Active Campaigns"
                value={1247}
                icon={<TrendingUp className="w-5 h-5" />}
                trend="up"
                trendValue="+12% this week"
              />
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <LiveStatCard
                title="Emails Sent Today"
                value={45238}
                icon={<Mail className="w-5 h-5" />}
                trend="up"
                trendValue="+8% vs yesterday"
              />
            </ScrollReveal>
            <ScrollReveal direction="up" delay={300}>
              <LiveStatCard
                title="Happy Customers"
                value={10234}
                suffix="+"
                icon={<Users className="w-5 h-5" />}
                trend="up"
                trendValue="+50 today"
              />
            </ScrollReveal>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ScrollReveal direction="up" delay={100}>
              <AnimatedProgressRing
                percentage={95}
                label="Email Deliverability"
                color="#3b82f6"
              />
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <AnimatedProgressRing
                percentage={87}
                label="Open Rate"
                color="#8b5cf6"
              />
            </ScrollReveal>
            <ScrollReveal direction="up" delay={300}>
              <AnimatedProgressRing
                percentage={42}
                label="Response Rate"
                color="#ec4899"
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section id="features" className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="up" className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why choose <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Smart Leads</span>
            </h2>
            <p className="text-gray-700 text-lg">
              The most powerful Google Maps AI outreach Agent in the market
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            <ScrollReveal direction="left" delay={100}>
              <TiltCard className="h-full">
                <Link to="/features/lead-finder" className="block h-full bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-blue-500 hover:shadow-2xl transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Find decision-makers instantly</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We scrape local businesses in your niche and target cities, then filter to only personal emails. These convert far better than generic ones, giving you higher open and reply rates.
                  </p>
                  <div className="text-blue-600 font-semibold flex items-center space-x-2 group-hover:translate-x-2 transition-transform">
                    <span>Learn more</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </TiltCard>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={200}>
              <TiltCard className="h-full">
                <Link to="/features/ai-emails" className="block h-full bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-purple-500 hover:shadow-2xl transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Personalized cold emails at scale</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We use Google Maps reviews with GPT-5 to craft unique, hyper-relevant emails for each prospect. This improves deliverability and gets you more replies.
                  </p>
                  <div className="text-purple-600 font-semibold flex items-center space-x-2 group-hover:translate-x-2 transition-transform">
                    <span>Learn more</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </TiltCard>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={300}>
              <TiltCard className="h-full">
                <Link to="/features/automation" className="block h-full bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-pink-500 hover:shadow-2xl transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Fully automated outreach campaigns</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    From scraping leads to sending personalized emails, your Outreach Agent works 24/7 on autopilot. Just set your niche and city.
                  </p>
                  <div className="text-pink-600 font-semibold flex items-center space-x-2 group-hover:translate-x-2 transition-transform">
                    <span>Learn more</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </TiltCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="up" className="mb-12">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">Trusted by Industry Leaders</h2>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={200}>
            <TrustBadges />
          </ScrollReveal>
        </div>
      </section>

      <section id="faq" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal direction="up" className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </ScrollReveal>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <ScrollReveal key={index} direction="up" delay={index * 50}>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                        expandedFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      expandedFaq === index ? 'max-h-96' : 'max-h-0'
                    }`}
                  >
                    <p className="px-6 pb-4 text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal direction="up">
            <GlassmorphicCard className="p-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to transform your outreach?</h2>
              <p className="text-xl text-gray-700 mb-8">
                Join thousands of businesses already using Smart Leads
              </p>
              <MagneticButton
                onClick={() => window.location.href = '/dashboard/campaigns/new'}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl transition-all duration-300 animate-glow"
              >
                Start Your Free Trial
              </MagneticButton>
            </GlassmorphicCard>
          </ScrollReveal>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">© 2024 Smart Leads. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
