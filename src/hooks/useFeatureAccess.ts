import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface FeatureFlag {
  id: string;
  flag_name: string;
  description: string;
  enabled: boolean;
  rollout_percentage: number;
  required_plan: string | null;
}

export function useFeatureAccess(featureName?: string) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [allFeatures, setAllFeatures] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    if (user) {
      if (featureName) {
        checkFeatureAccess(featureName);
      } else {
        loadAllFeatures();
      }
    } else {
      setLoading(false);
      setHasAccess(false);
      setAllFeatures(new Map());
    }
  }, [user, featureName]);

  const checkFeatureAccess = async (name: string) => {
    try {
      const { data, error } = await supabase.rpc('has_feature_access', {
        p_user_id: user!.id,
        p_feature_name: name,
      });

      if (error) {
        console.error('Error checking feature access:', error);
        setHasAccess(false);
      } else {
        setHasAccess(data === true);
      }
    } catch (error) {
      console.error('Error checking feature access:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  const loadAllFeatures = async () => {
    try {
      const { data: features } = await supabase
        .from('feature_flags_v2')
        .select('*')
        .eq('enabled', true);

      if (features) {
        const accessMap = new Map<string, boolean>();

        for (const feature of features) {
          const { data } = await supabase.rpc('has_feature_access', {
            p_user_id: user!.id,
            p_feature_name: feature.flag_name,
          });
          accessMap.set(feature.flag_name, data === true);
        }

        setAllFeatures(accessMap);
      }
    } catch (error) {
      console.error('Error loading features:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFeature = (name: string): boolean => {
    return allFeatures.get(name) ?? false;
  };

  return {
    loading,
    hasAccess: featureName ? hasAccess : false,
    checkFeature,
    features: allFeatures,
    refetch: featureName ? () => checkFeatureAccess(featureName) : loadAllFeatures,
  };
}
