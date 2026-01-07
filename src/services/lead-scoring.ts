import { supabase } from '../lib/supabase';

export interface QualityFactors {
  rating_points: number;
  review_points: number;
  website_points: number;
  email_points: number;
  social_points: number;
  employee_points: number;
}

export interface LeadScoreResult {
  score: number;
  factors: QualityFactors;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export function calculateLeadQualityScore(
  rating: number | null,
  reviewCount: number | null,
  hasWebsite: boolean,
  hasRealEmail: boolean,
  hasSocialProfiles: boolean,
  employeeCount: number | null
): LeadScoreResult {
  let score = 0;
  const factors: QualityFactors = {
    rating_points: 0,
    review_points: 0,
    website_points: 0,
    email_points: 0,
    social_points: 0,
    employee_points: 0,
  };

  if (rating !== null && rating > 0) {
    factors.rating_points = Math.min(Math.floor(rating * 5), 25);
    score += factors.rating_points;
  }

  if (reviewCount !== null && reviewCount > 0) {
    factors.review_points = Math.min(Math.floor(Math.log(reviewCount + 1) * 5), 20);
    score += factors.review_points;
  }

  if (hasWebsite) {
    factors.website_points = 15;
    score += 15;
  }

  if (hasRealEmail) {
    factors.email_points = 20;
    score += 20;
  }

  if (hasSocialProfiles) {
    factors.social_points = 10;
    score += 10;
  }

  if (employeeCount !== null && employeeCount > 0) {
    factors.employee_points = Math.min(Math.floor(Math.log(employeeCount + 1) * 2), 10);
    score += factors.employee_points;
  }

  score = Math.min(score, 100);

  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (score >= 80) grade = 'A';
  else if (score >= 60) grade = 'B';
  else if (score >= 40) grade = 'C';
  else if (score >= 20) grade = 'D';
  else grade = 'F';

  return { score, factors, grade };
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-100';
  if (score >= 60) return 'text-blue-600 bg-blue-100';
  if (score >= 40) return 'text-yellow-600 bg-yellow-100';
  if (score >= 20) return 'text-orange-600 bg-orange-100';
  return 'text-red-600 bg-red-100';
}

export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A': return 'text-green-600 bg-green-100 border-green-200';
    case 'B': return 'text-blue-600 bg-blue-100 border-blue-200';
    case 'C': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    case 'D': return 'text-orange-600 bg-orange-100 border-orange-200';
    default: return 'text-red-600 bg-red-100 border-red-200';
  }
}

export async function recalculateLeadScores(campaignId: string): Promise<number> {
  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, rating, review_count, website, real_email, social_profiles, employee_count')
    .eq('campaign_id', campaignId);

  if (error) throw error;
  if (!leads) return 0;

  let updated = 0;
  for (const lead of leads) {
    const result = calculateLeadQualityScore(
      lead.rating,
      lead.review_count,
      !!lead.website,
      !!lead.real_email,
      lead.social_profiles && Object.keys(lead.social_profiles).length > 0,
      lead.employee_count
    );

    const { error: updateError } = await supabase
      .from('leads')
      .update({
        quality_score: result.score,
        quality_factors: result.factors,
      })
      .eq('id', lead.id);

    if (!updateError) updated++;
  }

  return updated;
}

export async function getLeadsByQualityTier(
  campaignId: string,
  tier: 'high' | 'medium' | 'low'
): Promise<any[]> {
  let minScore = 0;
  let maxScore = 100;

  switch (tier) {
    case 'high':
      minScore = 70;
      maxScore = 100;
      break;
    case 'medium':
      minScore = 40;
      maxScore = 69;
      break;
    case 'low':
      minScore = 0;
      maxScore = 39;
      break;
  }

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('campaign_id', campaignId)
    .gte('quality_score', minScore)
    .lte('quality_score', maxScore)
    .order('quality_score', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getQualityDistribution(campaignId: string): Promise<{
  high: number;
  medium: number;
  low: number;
  average: number;
}> {
  const { data, error } = await supabase
    .from('leads')
    .select('quality_score')
    .eq('campaign_id', campaignId);

  if (error) throw error;
  if (!data || data.length === 0) {
    return { high: 0, medium: 0, low: 0, average: 0 };
  }

  let high = 0;
  let medium = 0;
  let low = 0;
  let total = 0;

  for (const lead of data) {
    const score = lead.quality_score || 0;
    total += score;
    if (score >= 70) high++;
    else if (score >= 40) medium++;
    else low++;
  }

  return {
    high,
    medium,
    low,
    average: Math.round(total / data.length),
  };
}
