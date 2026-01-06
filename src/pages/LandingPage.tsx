import { Link } from 'react-router-dom';
import { Zap, Target, Bot, ChevronDown, Mail, Linkedin } from 'lucide-react';
import { useState } from 'react';

export default function LandingPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-700 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SL</span>
              </div>
              <span className="text-white font-bold text-xl">Smart Leads</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-300 hover:text-white transition">Features</a>
              <a href="#demo" className="text-slate-300 hover:text-white transition">Demo</a>
              <a href="#faq" className="text-slate-300 hover:text-white transition">FAQ</a>
              <Link to="/pricing" className="text-slate-300 hover:text-white transition">Pricing</Link>
              <Link to="/affiliate" className="text-slate-300 hover:text-white transition">Affiliate</Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-slate-300 hover:text-white transition">
                Dashboard
              </Link>
              <Link
                to="/dashboard/campaigns/new"
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/50 transition transform hover:scale-105"
              >
                Start for Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              The Google Maps
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                AI Outreach Agent
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto">
              Smart Leads is the simplest way for businesses to find, target, and reach local prospects on Google Maps. Now with just a prompt.
            </p>

            <div className="relative max-w-2xl mx-auto">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex items-center space-x-2 bg-slate-700/50 px-3 py-1 rounded-lg">
                    <span className="text-slate-400 text-sm">Public</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-3 py-1 rounded-lg border border-blue-500/30">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-400 text-sm font-medium">GPT-5</span>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder={prompts[0]}
                    className="w-full bg-slate-900/50 text-white placeholder-slate-500 border border-slate-600 rounded-lg px-4 py-4 pr-12 focus:outline-none focus:border-blue-500 transition"
                  />
                  <Link
                    to="/dashboard/campaigns/new"
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {prompts.slice(1).map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => setPromptInput(prompt)}
                      className="text-sm text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-blue-500/50 transition"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why choose <span className="text-cyan-400">Smart Leads</span>
            </h2>
            <p className="text-slate-300 text-lg">
              The most powerful Google Maps AI outreach Agent in the market
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-blue-500/50 transition group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Target className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Find decision-makers instantly</h3>
              <p className="text-slate-300 leading-relaxed">
                We scrape local businesses in your niche and target cities, then filter to only personal emails (firstname@gmail.com or name@company.com). These convert far better than generic ones, giving you higher open and reply rates.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-blue-500/50 transition group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Zap className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Personalized cold emails at scale</h3>
              <p className="text-slate-300 leading-relaxed">
                We use Google Maps reviews with GPT-5 to craft unique, hyper-relevant emails for each prospect. This improves deliverability, avoids spam filters, and gets you more replies than generic templates.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-blue-500/50 transition group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Bot className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Fully automated outreach campaigns</h3>
              <p className="text-slate-300 leading-relaxed">
                From scraping leads to sending personalized unique emails, your Outreach Agent works 24/7 on autopilot. You just set your niche and a city, it handles research, writing, and sending for you with multiple gmail inboxes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            See Smart Leads in Action
          </h2>
          <p className="text-slate-300 text-lg mb-12">
            Watch how our AI agent transforms Google Maps into clients
          </p>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-12 aspect-video flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <p className="text-slate-400">Demo Video Coming Soon</p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Frequently Asked <span className="text-cyan-400">Questions</span>
            </h2>
            <p className="text-slate-300 text-lg">
              Everything you need to know about Smart Leads and how it works
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-700/30 transition"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-cyan-400 font-bold text-lg">{index + 1}</span>
                    <span className="text-white font-semibold">{faq.question}</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform ${expandedFaq === index ? 'rotate-180' : ''}`}
                  />
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-5 text-slate-300 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SL</span>
                </div>
                <span className="text-white font-bold text-xl">Smart Leads</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Transform Google Maps into your most powerful sales tool. Automate local business email outreach with AI-powered personalization just from a prompt.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-slate-400 hover:text-white transition">Features</a></li>
                <li><a href="#demo" className="text-slate-400 hover:text-white transition">Demo</a></li>
                <li><a href="#faq" className="text-slate-400 hover:text-white transition">FAQ</a></li>
                <li><Link to="/pricing" className="text-slate-400 hover:text-white transition">Pricing</Link></li>
                <li><Link to="/affiliate" className="text-slate-400 hover:text-white transition">Affiliate</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="mailto:contact@smartleads.io" className="text-slate-400 hover:text-white transition">Contact</a></li>
                <li><Link to="/privacy" className="text-slate-400 hover:text-white transition">Privacy</Link></li>
                <li><Link to="/terms" className="text-slate-400 hover:text-white transition">Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm mb-4 md:mb-0">
              © 2025 Smart Leads. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <a href="https://www.linkedin.com/company/smartleads" className="text-slate-400 hover:text-white transition">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="mailto:contact@smartleads.io" className="text-slate-400 hover:text-white transition">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
