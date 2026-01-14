import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Check, Crown, Zap, Rocket, Lock, Linkedin, Mail, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { subscriptionService, type SubscriptionPlan, type UserSubscription } from '../services/subscription-service';
import toast from 'react-hot-toast';

export default function PlansPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [plansData, subscriptionData] = await Promise.all([
        subscriptionService.getAllPlans(),
        user ? subscriptionService.getUserSubscription(user.id) : null,
      ]);

      setPlans(plansData);
      setCurrentSubscription(subscriptionData);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return <Zap className="w-8 h-8" />;
      case 'pro':
        return <Rocket className="w-8 h-8" />;
      case 'enterprise':
        return <Crown className="w-8 h-8" />;
      default:
        return <Zap className="w-8 h-8" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return 'from-gray-500 to-gray-600';
      case 'pro':
        return 'from-blue-500 to-blue-600';
      case 'enterprise':
        return 'from-gradient-to-r from-orange-500 to-pink-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getFeatureIcon = (featureKey: string) => {
    if (featureKey.includes('linkedin')) return <Linkedin className="w-4 h-4" />;
    if (featureKey.includes('gmail')) return <Mail className="w-4 h-4" />;
    if (featureKey.includes('outlook')) return <Send className="w-4 h-4" />;
    return <Check className="w-4 h-4" />;
  };

  const formatFeatureList = (features: Record<string, boolean>) => {
    const featureMap: Record<string, string> = {
      gmail: 'Gmail Integration',
      linkedin: 'LinkedIn Messaging (Pro Feature)',
      outlook: 'Outlook Integration (Enterprise)',
      ai_emails: 'AI Email Generation',
      basic_analytics: 'Basic Analytics Dashboard',
      email_sequences: 'Email Sequences & Follow-ups',
      ab_testing: 'A/B Testing',
      advanced_analytics: 'Advanced Analytics & Reporting',
      priority_support: 'Priority Customer Support',
      api_access: 'API Access',
      white_label: 'White Label Options',
      dedicated_support: 'Dedicated Account Manager',
    };

    return Object.entries(features)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => ({
        key,
        label: featureMap[key] || subscriptionService.getFeatureLabel(key),
      }));
  };

  const handleUpgrade = (planName: string) => {
    if (planName.toLowerCase() === 'free') {
      toast.error('You are already on the free plan');
      return;
    }

    toast('To upgrade your plan, please contact our sales team or set up Stripe integration', {
      icon: '💳',
      duration: 5000,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Scale your outreach with the right plan for your business
          </p>

          {currentSubscription && (
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white shadow-sm border border-gray-200 mb-6">
              <span className="text-sm text-gray-600 mr-2">Current Plan:</span>
              <span className={`font-semibold px-3 py-1 rounded-full ${subscriptionService.getPlanBadgeColor(currentSubscription.plan_name)}`}>
                {currentSubscription.plan_display_name}
              </span>
            </div>
          )}

          <div className="flex items-center justify-center space-x-4 mb-8">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Save 15%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = currentSubscription?.plan_id === plan.id;
            const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
            const displayPrice = billingCycle === 'monthly'
              ? subscriptionService.formatPrice(price)
              : subscriptionService.formatPrice(price / 12);

            const features = formatFeatureList(plan.features);

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg p-8 border-2 transition hover:shadow-xl ${
                  plan.name === 'pro'
                    ? 'border-blue-500 transform scale-105'
                    : 'border-gray-200'
                }`}
              >
                {plan.name === 'pro' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getPlanColor(plan.name)} flex items-center justify-center text-white mb-6`}>
                  {getPlanIcon(plan.name)}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.display_name}
                </h3>
                <p className="text-gray-600 mb-6 min-h-[48px]">
                  {plan.description}
                </p>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-gray-900">
                      {displayPrice.split('.')[0]}
                    </span>
                    {price > 0 && (
                      <span className="text-2xl text-gray-500 ml-1">
                        .{displayPrice.split('.')[1] || '00'}
                      </span>
                    )}
                    {price > 0 && (
                      <span className="text-gray-600 ml-2">/month</span>
                    )}
                  </div>
                  {billingCycle === 'yearly' && price > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Billed annually at {subscriptionService.formatPrice(price)}
                    </p>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      {plan.max_campaigns === -1 ? 'Unlimited' : plan.max_campaigns} campaigns
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      {plan.max_leads_per_campaign === -1 ? 'Unlimited' : plan.max_leads_per_campaign} leads per campaign
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      {plan.max_email_accounts === -1 ? 'Unlimited' : plan.max_email_accounts} email accounts
                    </span>
                  </li>
                  {features.map((feature) => (
                    <li key={feature.key} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5 text-green-500">
                        {getFeatureIcon(feature.key)}
                      </div>
                      <span className="text-gray-700">{feature.label}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={isCurrentPlan}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition ${
                    isCurrentPlan
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : plan.name === 'pro'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {isCurrentPlan ? 'Current Plan' : plan.name === 'free' ? 'Get Started' : 'Upgrade Now'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Compare Features</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 text-gray-700 font-semibold">Feature</th>
                  <th className="text-center py-4 px-4 text-gray-700 font-semibold">Free</th>
                  <th className="text-center py-4 px-4 text-gray-700 font-semibold">Pro</th>
                  <th className="text-center py-4 px-4 text-gray-700 font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-600">Gmail Integration</td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-600 flex items-center space-x-2">
                    <Linkedin className="w-4 h-4 text-blue-600" />
                    <span>LinkedIn Messaging</span>
                  </td>
                  <td className="text-center py-4 px-4"><Lock className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-600">Outlook Integration</td>
                  <td className="text-center py-4 px-4"><Lock className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Lock className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-600">A/B Testing</td>
                  <td className="text-center py-4 px-4"><Lock className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-600">API Access</td>
                  <td className="text-center py-4 px-4"><Lock className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Lock className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Need help choosing a plan?</p>
          <Link
            to="/settings"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Contact our sales team →
          </Link>
        </div>
      </div>
    </div>
  );
}
