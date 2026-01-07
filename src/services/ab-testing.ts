import { supabase } from '../lib/supabase';

export interface ABTest {
  id: string;
  sequence_id: string;
  step_number: number;
  variant_a_subject: string | null;
  variant_b_subject: string | null;
  variant_a_body: string | null;
  variant_b_body: string | null;
  variant_a_sends: number;
  variant_b_sends: number;
  variant_a_opens: number;
  variant_b_opens: number;
  variant_a_replies: number;
  variant_b_replies: number;
  winner: 'A' | 'B' | null;
  winner_selected_at: string | null;
  min_sample_size: number;
  confidence_threshold: number;
  is_active: boolean;
}

export interface ABTestStats {
  variantA: {
    sends: number;
    opens: number;
    replies: number;
    openRate: number;
    replyRate: number;
  };
  variantB: {
    sends: number;
    opens: number;
    replies: number;
    openRate: number;
    replyRate: number;
  };
  hasWinner: boolean;
  winner: 'A' | 'B' | null;
  confidence: number;
  sampleSizeReached: boolean;
}

export async function createABTest(
  sequenceId: string,
  stepNumber: number,
  variantASubject: string,
  variantBSubject: string,
  variantABody?: string,
  variantBBody?: string,
  minSampleSize: number = 50
): Promise<ABTest> {
  const { data, error } = await supabase
    .from('sequence_ab_tests')
    .insert({
      sequence_id: sequenceId,
      step_number: stepNumber,
      variant_a_subject: variantASubject,
      variant_b_subject: variantBSubject,
      variant_a_body: variantABody || null,
      variant_b_body: variantBBody || null,
      min_sample_size: minSampleSize,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getABTest(testId: string): Promise<ABTest | null> {
  const { data, error } = await supabase
    .from('sequence_ab_tests')
    .select('*')
    .eq('id', testId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getABTestsForSequence(sequenceId: string): Promise<ABTest[]> {
  const { data, error } = await supabase
    .from('sequence_ab_tests')
    .select('*')
    .eq('sequence_id', sequenceId)
    .order('step_number', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function assignVariant(testId: string): Promise<'A' | 'B'> {
  const test = await getABTest(testId);
  if (!test) throw new Error('A/B test not found');

  if (test.winner) {
    return test.winner;
  }

  const variant = test.variant_a_sends <= test.variant_b_sends ? 'A' : 'B';
  return variant;
}

export async function recordSend(testId: string, variant: 'A' | 'B'): Promise<void> {
  const field = variant === 'A' ? 'variant_a_sends' : 'variant_b_sends';

  const { error } = await supabase.rpc('increment_ab_test_counter', {
    test_id: testId,
    field_name: field,
  });

  if (error) {
    const { data: test } = await supabase
      .from('sequence_ab_tests')
      .select(field)
      .eq('id', testId)
      .single();

    if (test) {
      await supabase
        .from('sequence_ab_tests')
        .update({ [field]: (test[field] || 0) + 1 })
        .eq('id', testId);
    }
  }
}

export async function recordOpen(testId: string, variant: 'A' | 'B'): Promise<void> {
  const field = variant === 'A' ? 'variant_a_opens' : 'variant_b_opens';

  const { data: test } = await supabase
    .from('sequence_ab_tests')
    .select(field)
    .eq('id', testId)
    .single();

  if (test) {
    await supabase
      .from('sequence_ab_tests')
      .update({ [field]: (test[field] || 0) + 1 })
      .eq('id', testId);
  }

  await checkForWinner(testId);
}

export async function recordReply(testId: string, variant: 'A' | 'B'): Promise<void> {
  const field = variant === 'A' ? 'variant_a_replies' : 'variant_b_replies';

  const { data: test } = await supabase
    .from('sequence_ab_tests')
    .select(field)
    .eq('id', testId)
    .single();

  if (test) {
    await supabase
      .from('sequence_ab_tests')
      .update({ [field]: (test[field] || 0) + 1 })
      .eq('id', testId);
  }

  await checkForWinner(testId);
}

export function calculateABTestStats(test: ABTest): ABTestStats {
  const variantA = {
    sends: test.variant_a_sends,
    opens: test.variant_a_opens,
    replies: test.variant_a_replies,
    openRate: test.variant_a_sends > 0 ? (test.variant_a_opens / test.variant_a_sends) * 100 : 0,
    replyRate: test.variant_a_sends > 0 ? (test.variant_a_replies / test.variant_a_sends) * 100 : 0,
  };

  const variantB = {
    sends: test.variant_b_sends,
    opens: test.variant_b_opens,
    replies: test.variant_b_replies,
    openRate: test.variant_b_sends > 0 ? (test.variant_b_opens / test.variant_b_sends) * 100 : 0,
    replyRate: test.variant_b_sends > 0 ? (test.variant_b_replies / test.variant_b_sends) * 100 : 0,
  };

  const totalSends = test.variant_a_sends + test.variant_b_sends;
  const sampleSizeReached = totalSends >= test.min_sample_size * 2;

  const confidence = calculateStatisticalSignificance(
    test.variant_a_replies,
    test.variant_a_sends,
    test.variant_b_replies,
    test.variant_b_sends
  );

  const hasWinner = sampleSizeReached && confidence >= test.confidence_threshold;
  let winner: 'A' | 'B' | null = null;

  if (hasWinner) {
    winner = variantA.replyRate > variantB.replyRate ? 'A' : 'B';
  }

  return {
    variantA,
    variantB,
    hasWinner,
    winner,
    confidence,
    sampleSizeReached,
  };
}

function calculateStatisticalSignificance(
  successA: number,
  totalA: number,
  successB: number,
  totalB: number
): number {
  if (totalA === 0 || totalB === 0) return 0;

  const pA = successA / totalA;
  const pB = successB / totalB;
  const pPooled = (successA + successB) / (totalA + totalB);

  const se = Math.sqrt(pPooled * (1 - pPooled) * (1 / totalA + 1 / totalB));
  if (se === 0) return 0;

  const z = Math.abs(pA - pB) / se;
  const confidence = 1 - 2 * (1 - normalCDF(z));

  return Math.max(0, Math.min(1, confidence));
}

function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

async function checkForWinner(testId: string): Promise<void> {
  const test = await getABTest(testId);
  if (!test || test.winner) return;

  const stats = calculateABTestStats(test);

  if (stats.hasWinner && stats.winner) {
    await supabase
      .from('sequence_ab_tests')
      .update({
        winner: stats.winner,
        winner_selected_at: new Date().toISOString(),
      })
      .eq('id', testId);
  }
}

export async function updateABTest(
  testId: string,
  updates: Partial<ABTest>
): Promise<void> {
  const { error } = await supabase
    .from('sequence_ab_tests')
    .update(updates)
    .eq('id', testId);

  if (error) throw error;
}

export async function deleteABTest(testId: string): Promise<void> {
  const { error } = await supabase
    .from('sequence_ab_tests')
    .delete()
    .eq('id', testId);

  if (error) throw error;
}
