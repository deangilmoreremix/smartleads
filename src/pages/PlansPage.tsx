import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Check, Zap, TrendingUp, Crown, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Database } from '../types/database';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

const plans = [
  {
    name: 'Free',
    price: 0,
    icon: Zap,
    color: 'gray',
    credits: 50,
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
    color: 'blue',
    credits: 500,
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
    color: 'purple',
    credits: 2000,
    popular: true,
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
    color: 'orange',
    credits: 10000,
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

export default function PlansPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error('Error loading subscription:', error);
      toast.error('Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (planName: string) => {
    toast.error('Payment integration coming soon!');
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; button: string; border: string }> = {
      gray: {
        bg: 'bg-gray-50',
        text: 'text-gray-600',
        button: 'bg-gray-900 hover:bg-gray-800',
        border: 'border-gray-200'
      },
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        button: 'bg-blue-500 hover:bg-blue-600',
        border: 'border-blue-200'
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        button: 'bg-purple-500 hover:bg-purple-600',
        border: 'border-purple-200'
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        button: 'bg-orange-500 hover:bg-orange-600',
        border: 'border-orange-200'
      }
    };
    return colors[color] || colors.gray;
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Scale your outreach with the right plan for your business
          </p>
          {subscription && (
            <div className="mt-6 inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-medium">
              <Check className="w-5 h-5" />
              <span>Current Plan: {subscription.plan_type}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const colors = getColorClasses(plan.color);
            const isCurrentPlan = subscription?.plan_type.toLowerCase() === plan.name.toLowerCase();

            return (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl p-6 shadow-sm border-2 transition hover:shadow-lg ${
                  plan.popular
                    ? 'border-purple-500 relative'
                    : isCurrentPlan
                    ? 'border-green-500'
                    : 'border-gray-100'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>

                <div className="mb-6">
                  <div className="text-sm text-gray-600 mb-2">Monthly Credits</div>
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

                <button
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={isCurrentPlan}
                  className={`w-full ${colors.button} text-white px-6 py-3 rounded-xl font-semibold transition ${
                    isCurrentPlan ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isCurrentPlan ? 'Current Plan' : 'Upgrade'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-600 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What happens to unused credits?</h3>
              <p className="text-gray-600 text-sm">
                Unused credits roll over to the next month if you stay on the same plan.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600 text-sm">
                We offer a 14-day money-back guarantee on all paid plans, no questions asked.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Need more than Enterprise?</h3>
              <p className="text-gray-600 text-sm">
                Contact us for custom enterprise solutions with tailored features and pricing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
