import { supabase } from '../lib/supabase';

export interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
  max_campaigns: number;
  max_leads_per_campaign: number;
  max_email_accounts: number;
  features: Record<string, boolean>;
  is_active: boolean;
  sort_order: number;
}

export interface UserSubscription {
  subscription_id: string;
  plan_id: string;
  plan_name: string;
  plan_display_name: string;
  features: Record<string, boolean>;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export const subscriptionService = {
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await supabase
      .rpc('get_user_subscription', { p_user_id: userId })
      .maybeSingle();

    if (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }

    return data;
  },

  async hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('user_has_feature', {
        p_user_id: userId,
        p_feature: feature
      });

    if (error) {
      console.error('Error checking feature access:', error);
      return false;
    }

    return data === true;
  },

  async getAllPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      console.error('Error fetching plans:', error);
      return [];
    }

    return data || [];
  },

  async createSubscription(
    userId: string,
    planId: string,
    stripeCustomerId?: string,
    stripeSubscriptionId?: string
  ) {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        plan_id: planId,
        status: 'active',
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }

    return data;
  },

  async updateSubscription(
    subscriptionId: string,
    updates: Partial<{
      plan_id: string;
      status: string;
      cancel_at_period_end: boolean;
      current_period_end: string;
    }>
  ) {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update(updates)
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }

    return data;
  },

  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true) {
    const updates = cancelAtPeriodEnd
      ? { cancel_at_period_end: true }
      : {
          status: 'canceled',
          canceled_at: new Date().toISOString()
        };

    return this.updateSubscription(subscriptionId, updates);
  },

  formatPrice(cents: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  },

  getFeatureLabel(feature: string): string {
    const labels: Record<string, string> = {
      gmail: 'Gmail Integration',
      linkedin: 'LinkedIn Messaging',
      outlook: 'Outlook Integration',
      twitter: 'Twitter DMs',
      ai_emails: 'AI Email Generation',
      basic_analytics: 'Basic Analytics',
      email_sequences: 'Email Sequences',
      ab_testing: 'A/B Testing',
      advanced_analytics: 'Advanced Analytics',
      priority_support: 'Priority Support',
      api_access: 'API Access',
      white_label: 'White Label',
      dedicated_support: 'Dedicated Support',
    };

    return labels[feature] || feature;
  },

  getPlanBadgeColor(planName: string): string {
    switch (planName.toLowerCase()) {
      case 'free':
        return 'bg-gray-100 text-gray-800';
      case 'pro':
        return 'bg-blue-100 text-blue-800';
      case 'enterprise':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },
};
