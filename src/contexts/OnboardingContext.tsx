import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export type TourType =
  | 'welcome'
  | 'dashboard'
  | 'campaign'
  | 'leads'
  | 'templates'
  | 'accounts'
  | 'autopilot';

interface OnboardingState {
  welcome_completed: boolean;
  dashboard_tour_completed: boolean;
  campaign_tour_completed: boolean;
  leads_tour_completed: boolean;
  templates_tour_completed: boolean;
  accounts_tour_completed: boolean;
  autopilot_tour_completed: boolean;
  first_campaign_created: boolean;
  first_email_sent: boolean;
  first_reply_received: boolean;
}

interface OnboardingContextType {
  state: OnboardingState;
  loading: boolean;
  activeTour: TourType | null;
  currentStep: number;
  startTour: (tour: TourType) => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  markTourCompleted: (tour: TourType) => Promise<void>;
  markMilestone: (milestone: 'first_campaign_created' | 'first_email_sent' | 'first_reply_received') => Promise<void>;
  resetTour: (tour: TourType) => Promise<void>;
  showWelcome: boolean;
  setShowWelcome: (show: boolean) => void;
  getCompletedToursCount: () => number;
  getTotalTours: () => number;
}

const defaultState: OnboardingState = {
  welcome_completed: false,
  dashboard_tour_completed: false,
  campaign_tour_completed: false,
  leads_tour_completed: false,
  templates_tour_completed: false,
  accounts_tour_completed: false,
  autopilot_tour_completed: false,
  first_campaign_created: false,
  first_email_sent: false,
  first_reply_received: false
};

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<OnboardingState>(defaultState);
  const [loading, setLoading] = useState(true);
  const [activeTour, setActiveTour] = useState<TourType | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (user) {
      loadOnboardingState();
    } else {
      setState(defaultState);
      setLoading(false);
    }
  }, [user]);

  const loadOnboardingState = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setState({
          welcome_completed: data.welcome_completed,
          dashboard_tour_completed: data.dashboard_tour_completed,
          campaign_tour_completed: data.campaign_tour_completed,
          leads_tour_completed: data.leads_tour_completed,
          templates_tour_completed: data.templates_tour_completed,
          accounts_tour_completed: data.accounts_tour_completed,
          autopilot_tour_completed: data.autopilot_tour_completed,
          first_campaign_created: data.first_campaign_created,
          first_email_sent: data.first_email_sent,
          first_reply_received: data.first_reply_received
        });
        if (!data.welcome_completed) {
          setShowWelcome(true);
        }
      } else {
        const { error: insertError } = await supabase
          .from('user_onboarding')
          .insert({ user_id: user.id });

        if (insertError) throw insertError;
        setState(defaultState);
        setShowWelcome(true);
      }
    } catch (error) {
      console.error('Error loading onboarding state:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTour = (tour: TourType) => {
    setActiveTour(tour);
    setCurrentStep(0);
  };

  const endTour = () => {
    setActiveTour(null);
    setCurrentStep(0);
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const markTourCompleted = async (tour: TourType) => {
    if (!user) return;

    const fieldMap: Record<TourType, keyof OnboardingState> = {
      welcome: 'welcome_completed',
      dashboard: 'dashboard_tour_completed',
      campaign: 'campaign_tour_completed',
      leads: 'leads_tour_completed',
      templates: 'templates_tour_completed',
      accounts: 'accounts_tour_completed',
      autopilot: 'autopilot_tour_completed'
    };

    const field = fieldMap[tour];

    try {
      const { error } = await supabase
        .from('user_onboarding')
        .update({ [field]: true })
        .eq('user_id', user.id);

      if (error) throw error;

      setState((prev) => ({ ...prev, [field]: true }));
    } catch (error) {
      console.error('Error marking tour completed:', error);
    }

    endTour();
  };

  const markMilestone = async (milestone: 'first_campaign_created' | 'first_email_sent' | 'first_reply_received') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_onboarding')
        .update({ [milestone]: true })
        .eq('user_id', user.id);

      if (error) throw error;

      setState((prev) => ({ ...prev, [milestone]: true }));
    } catch (error) {
      console.error('Error marking milestone:', error);
    }
  };

  const resetTour = async (tour: TourType) => {
    if (!user) return;

    const fieldMap: Record<TourType, keyof OnboardingState> = {
      welcome: 'welcome_completed',
      dashboard: 'dashboard_tour_completed',
      campaign: 'campaign_tour_completed',
      leads: 'leads_tour_completed',
      templates: 'templates_tour_completed',
      accounts: 'accounts_tour_completed',
      autopilot: 'autopilot_tour_completed'
    };

    const field = fieldMap[tour];

    try {
      const { error } = await supabase
        .from('user_onboarding')
        .update({ [field]: false })
        .eq('user_id', user.id);

      if (error) throw error;

      setState((prev) => ({ ...prev, [field]: false }));
    } catch (error) {
      console.error('Error resetting tour:', error);
    }
  };

  const getCompletedToursCount = () => {
    let count = 0;
    if (state.dashboard_tour_completed) count++;
    if (state.campaign_tour_completed) count++;
    if (state.leads_tour_completed) count++;
    if (state.templates_tour_completed) count++;
    if (state.accounts_tour_completed) count++;
    if (state.autopilot_tour_completed) count++;
    return count;
  };

  const getTotalTours = () => 6;

  return (
    <OnboardingContext.Provider
      value={{
        state,
        loading,
        activeTour,
        currentStep,
        startTour,
        endTour,
        nextStep,
        prevStep,
        markTourCompleted,
        markMilestone,
        resetTour,
        showWelcome,
        setShowWelcome,
        getCompletedToursCount,
        getTotalTours
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
