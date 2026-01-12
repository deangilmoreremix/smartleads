import { Link } from 'react-router-dom';
import { DollarSign, Users, TrendingUp, Gift, ArrowRight, Check, Zap } from 'lucide-react';

const benefits = [
  {
    icon: DollarSign,
    title: '30% Recurring Commission',
    description: 'Earn 30% of every payment your referrals make, for as long as they remain a customer.'
  },
  {
    icon: Users,
    title: '90-Day Cookie Duration',
    description: 'Your referrals are tracked for 90 days, so you get credit even if they sign up later.'
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Dashboard',
    description: 'Track your clicks, conversions, and earnings in real-time with our affiliate dashboard.'
  },
  {
    icon: Gift,
    title: 'Exclusive Resources',
    description: 'Get access to banners, email templates, and marketing materials to help you succeed.'
  }
];

const tiers = [
  {
    name: 'Starter',
    commission: '30%',
    requirements: '0-10 referrals',
    perks: ['Basic affiliate dashboard', 'Standard payout (NET-30)', 'Email support']
  },
  {
    name: 'Pro',
    commission: '35%',
    requirements: '11-50 referrals',
    perks: ['Priority dashboard access', 'Faster payout (NET-15)', 'Priority support', 'Custom landing pages']
  },
  {
    name: 'Elite',
    commission: '40%',
    requirements: '51+ referrals',
    perks: ['VIP dashboard', 'Weekly payouts', 'Dedicated account manager', 'Co-marketing opportunities', 'Early feature access']
  }
];

const faqs = [
  {
    question: 'How do I get started as an affiliate?',
    answer: 'Simply create a Smart Leads account and navigate to the Affiliate section in your dashboard. You\'ll receive a unique referral link that you can start sharing immediately.'
  },
  {
    question: 'When do I get paid?',
    answer: 'Commissions are paid monthly via PayPal or bank transfer. Starter affiliates are paid NET-30, Pro affiliates NET-15, and Elite affiliates receive weekly payouts.'
  },
  {
    question: 'Is there a minimum payout threshold?',
    answer: 'Yes, the minimum payout threshold is $50. Once your balance reaches this amount, your payment will be processed in the next payout cycle.'
  },
  {
    question: 'Can I promote Smart Leads on social media?',
    answer: 'Absolutely! You can promote on any platform including social media, blogs, YouTube, podcasts, and email newsletters. Just follow our brand guidelines.'
  },
  {
    question: 'What happens if a customer cancels?',
    answer: 'You earn commissions for as long as the customer remains active. If they cancel, future commissions stop, but you keep everything you\'ve already earned.'
  }
];

export default function AffiliatePage() {
  return (
    <div className="min-h-screen bg-[#F5F1E8]">
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
              <Link to="/#features" className="text-gray-700 hover:text-gray-900 transition">Features</Link>
              <Link to="/#demo" className="text-gray-700 hover:text-gray-900 transition">Demo</Link>
              <Link to="/#faq" className="text-gray-700 hover:text-gray-900 transition">FAQ</Link>
              <Link to="/pricing" className="text-gray-700 hover:text-gray-900 transition">Pricing</Link>
              <span className="text-amber-600 font-medium">Affiliate</span>
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-gray-900 transition">
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-[#FFD666] text-gray-900 px-6 py-2 rounded-lg font-semibold hover:bg-[#FFC233] hover:shadow-lg transition transform hover:scale-105"
              >
                Start for Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>Earn up to 40% recurring commission</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Join the Smart Leads
              <br />
              <span className="text-[#FFD666]" style={{ WebkitTextStroke: '2px #1A1A1A', paintOrder: 'stroke fill' }}>
                Affiliate Program
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Partner with us and earn recurring commissions for every customer you refer.
              Help businesses grow while building your passive income.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center space-x-2 bg-[#FFD666] text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-[#FFC233] hover:shadow-lg transition transform hover:scale-105"
            >
              <span>Become an Affiliate</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-amber-200 transition"
                >
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </div>
              );
            })}
          </div>

          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Commission Tiers
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                The more customers you refer, the higher your commission rate.
                Top affiliates earn up to 40% on every payment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tiers.map((tier, index) => (
                <div
                  key={index}
                  className={`bg-white border-2 rounded-2xl p-6 transition hover:shadow-lg ${
                    index === 2 ? 'border-amber-400 ring-2 ring-amber-200' : 'border-gray-200'
                  }`}
                >
                  {index === 2 && (
                    <div className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-semibold mb-4">
                      Best Value
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{tier.name}</h3>
                  <div className="text-sm text-gray-500 mb-4">{tier.requirements}</div>
                  <div className="text-4xl font-bold text-amber-600 mb-6">{tier.commission}</div>
                  <ul className="space-y-3">
                    {tier.perks.map((perk, perkIndex) => (
                      <li key={perkIndex} className="flex items-start space-x-2 text-sm">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-gray-600 text-lg">Get started in three simple steps</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-amber-600">1</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Sign Up</h3>
                <p className="text-gray-600 text-sm">
                  Create your free Smart Leads account and access the affiliate dashboard
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-amber-600">2</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Share</h3>
                <p className="text-gray-600 text-sm">
                  Promote Smart Leads using your unique referral link across any channel
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-amber-600">3</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Earn</h3>
                <p className="text-gray-600 text-sm">
                  Get paid monthly for every customer who signs up through your link
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                >
                  <details className="group">
                    <summary className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition list-none">
                      <span className="font-semibold text-gray-900">{faq.question}</span>
                      <svg
                        className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-4 text-gray-600">
                      {faq.answer}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to start earning?</h2>
            <p className="text-stone-300 text-lg mb-8 max-w-2xl mx-auto">
              Join hundreds of affiliates already earning recurring commissions with Smart Leads.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center space-x-2 bg-[#FFD666] text-gray-900 px-8 py-3 rounded-xl font-semibold hover:bg-[#FFC233] transition"
            >
              <span>Join the Affiliate Program</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-stone-900 border-t border-stone-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-[#FFD666] rounded-lg flex items-center justify-center">
                <span className="text-gray-900 font-bold text-sm">SL</span>
              </div>
              <span className="text-white font-bold text-xl">Smart Leads</span>
            </div>
            <div className="flex items-center space-x-6 text-stone-400 text-sm">
              <Link to="/privacy" className="hover:text-white transition">Privacy</Link>
              <Link to="/terms" className="hover:text-white transition">Terms</Link>
              <a href="mailto:affiliates@smartleads.io" className="hover:text-white transition">Affiliate Support</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-stone-800 text-center text-stone-500 text-sm">
            © {new Date().getFullYear()} Smart Leads. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
