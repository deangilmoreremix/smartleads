import { Link } from 'react-router-dom';
import { Check, Zap, TrendingUp, Crown, Building2, ArrowRight } from 'lucide-react';
import { useState } from 'react';

const plans = [
  {
    name: 'Free',
    price: 0,
    icon: Zap,
    color: 'stone',
    credits: 50,
    description: 'Perfect for getting started',
    features: [
      '50 leads per month',
      '1 active campaign',
      'Basic email templates',
      'Email support',
      'Gmail integration'
    ]
  },
  {
    name: 'Starter',
    price: 29,
    icon: TrendingUp,
    color: 'amber',
    credits: 500,
    description: 'For growing businesses',
    features: [
      '500 leads per month',
      '5 active campaigns',
      'Custom email templates',
      'Priority email support',
      'Gmail integration',
      'Campaign analytics',
      'AI-powered personalization'
    ]
  },
  {
    name: 'Professional',
    price: 99,
    icon: Crown,
    color: 'orange',
    credits: 2000,
    popular: true,
    description: 'For scaling teams',
    features: [
      '2,000 leads per month',
      'Unlimited campaigns',
      'Advanced templates',
      '24/7 priority support',
      'Multiple Gmail accounts',
      'Advanced analytics',
      'AI-powered personalization',
      'Custom automation workflows',
      'A/B testing'
    ]
  },
  {
    name: 'Enterprise',
    price: 299,
    icon: Building2,
    color: 'stone',
    credits: 10000,
    description: 'For large organizations',
    features: [
      '10,000+ leads per month',
      'Unlimited campaigns',
      'White-label templates',
      'Dedicated account manager',
      'Unlimited Gmail accounts',
      'Custom analytics dashboard',
      'AI-powered personalization',
      'Advanced automation',
      'A/B testing',
      'API access',
      'Custom integrations'
    ]
  }
];

const faqs = [
  {
    question: 'Can I change plans anytime?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. When you upgrade, you get immediate access to new features. When you downgrade, changes take effect at the start of your next billing cycle.'
  },
  {
    question: 'What happens to unused credits?',
    answer: 'Unused credits roll over to the next month as long as you maintain an active subscription. If you cancel, any remaining credits will be forfeited at the end of your billing period.'
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 14-day money-back guarantee on all paid plans, no questions asked. If you\'re not satisfied with Smart Leads, contact our support team for a full refund.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. Enterprise customers can also pay via invoice with NET-30 terms.'
  },
  {
    question: 'Is there a setup fee?',
    answer: 'No, there are no setup fees or hidden costs. You only pay the monthly subscription fee for your chosen plan.'
  },
  {
    question: 'Can I get a custom plan?',
    answer: 'Yes! For businesses with specific needs or high volume requirements, contact us for a custom enterprise plan tailored to your organization.'
  }
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const getPrice = (basePrice: number) => {
    if (billingCycle === 'annual') {
      return Math.round(basePrice * 0.8);
    }
    return basePrice;
  };

  const getColorClasses = (color: string, popular?: boolean) => {
    if (popular) {
      return {
        bg: 'bg-gradient-to-br from-orange-50 to-amber-50',
        iconBg: 'bg-orange-100',
        text: 'text-orange-600',
        button: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-orange-500/25',
        border: 'border-orange-300',
        ring: 'ring-2 ring-orange-500'
      };
    }

    const colors: Record<string, { bg: string; iconBg: string; text: string; button: string; border: string; ring: string }> = {
      stone: {
        bg: 'bg-white',
        iconBg: 'bg-stone-100',
        text: 'text-stone-600',
        button: 'bg-stone-800 hover:bg-stone-900',
        border: 'border-stone-200',
        ring: ''
      },
      amber: {
        bg: 'bg-white',
        iconBg: 'bg-amber-100',
        text: 'text-amber-600',
        button: 'bg-amber-500 hover:bg-amber-600',
        border: 'border-amber-200',
        ring: ''
      },
      orange: {
        bg: 'bg-white',
        iconBg: 'bg-orange-100',
        text: 'text-orange-600',
        button: 'bg-orange-500 hover:bg-orange-600',
        border: 'border-orange-200',
        ring: ''
      }
    };
    return colors[color] || colors.stone;
  };

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
              <span className="text-amber-600 font-medium">Pricing</span>
              <Link to="/affiliate" className="text-gray-700 hover:text-gray-900 transition">Affiliate</Link>
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
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Choose the plan that fits your business. All plans include our core AI-powered outreach features.
            </p>

            <div className="inline-flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-lg font-medium transition ${
                  billingCycle === 'monthly'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-lg font-medium transition flex items-center space-x-2 ${
                  billingCycle === 'annual'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>Annual</span>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const colors = getColorClasses(plan.color, plan.popular);
              const price = getPrice(plan.price);

              return (
                <div
                  key={plan.name}
                  className={`${colors.bg} rounded-2xl p-6 border-2 ${colors.border} ${colors.ring} transition hover:shadow-xl relative`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">{plan.description}</p>

                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">${price}</span>
                    <span className="text-gray-600">/{billingCycle === 'annual' ? 'mo' : 'month'}</span>
                    {billingCycle === 'annual' && plan.price > 0 && (
                      <div className="text-sm text-green-600 font-medium mt-1">
                        Billed ${price * 12}/year
                      </div>
                    )}
                  </div>

                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">Monthly Credits</div>
                    <div className="font-semibold text-gray-900">{plan.credits.toLocaleString()} leads</div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/signup"
                    className={`w-full ${colors.button} text-white px-6 py-3 rounded-xl font-semibold transition flex items-center justify-center space-x-2`}
                  >
                    <span>{plan.price === 0 ? 'Get Started Free' : 'Start Free Trial'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl p-8 md:p-12 text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Need a custom solution?</h2>
            <p className="text-stone-300 text-lg mb-8 max-w-2xl mx-auto">
              For large teams with specific requirements, we offer custom enterprise plans with dedicated support, custom integrations, and flexible pricing.
            </p>
            <a
              href="mailto:enterprise@smartleads.io"
              className="inline-flex items-center space-x-2 bg-[#FFD666] text-gray-900 px-8 py-3 rounded-xl font-semibold hover:bg-[#FFC233] transition"
            >
              <span>Contact Sales</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition"
                  >
                    <span className="font-semibold text-gray-900">{faq.question}</span>
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform ${
                        expandedFaq === index ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 pb-4 text-gray-600">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
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
              <a href="mailto:support@smartleads.io" className="hover:text-white transition">Support</a>
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
