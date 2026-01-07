import { supabase } from '../lib/supabase';

export interface SequenceStep {
  id: string;
  campaign_id: string;
  step_number: number;
  delay_days: number;
  subject: string;
  body: string;
  is_active: boolean;
}

export interface SequenceProgress {
  id: string;
  lead_id: string;
  current_step: number;
  next_send_date: string | null;
  is_paused: boolean;
  pause_reason: string | null;
  completed_at: string | null;
}

export async function createSequenceForCampaign(
  campaignId: string,
  steps: Array<{
    step_number: number;
    delay_days: number;
    subject: string;
    body: string;
  }>
): Promise<{ success: boolean; message: string; errors?: string[] }> {
  // Validate steps
  const validation = validateSequenceSteps(steps);
  if (!validation.isValid) {
    return {
      success: false,
      message: 'Invalid sequence configuration',
      errors: validation.errors,
    };
  }

  const { error: deleteError } = await supabase
    .from('email_sequence_steps')
    .delete()
    .eq('campaign_id', campaignId);

  if (deleteError) {
    return { success: false, message: 'Failed to clear existing sequence' };
  }

  const stepsToInsert = steps.map((step) => ({
    campaign_id: campaignId,
    step_number: step.step_number,
    delay_days: step.delay_days,
    subject: step.subject.trim(),
    body: step.body.trim(),
    is_active: true,
  }));

  const { error: insertError } = await supabase
    .from('email_sequence_steps')
    .insert(stepsToInsert);

  if (insertError) {
    return { success: false, message: 'Failed to create sequence steps' };
  }

  return { success: true, message: 'Sequence created successfully' };
}

function validateSequenceSteps(
  steps: Array<{
    step_number: number;
    delay_days: number;
    subject: string;
    body: string;
  }>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if steps array is empty
  if (!steps || steps.length === 0) {
    errors.push('Sequence must have at least one step');
    return { isValid: false, errors };
  }

  // Check maximum number of steps
  if (steps.length > 10) {
    errors.push('Sequence cannot have more than 10 steps');
  }

  // Validate each step
  const stepNumbers = new Set<number>();

  steps.forEach((step, index) => {
    // Check step number
    if (!Number.isInteger(step.step_number) || step.step_number < 1) {
      errors.push(`Step ${index + 1}: Step number must be a positive integer`);
    }

    // Check for duplicate step numbers
    if (stepNumbers.has(step.step_number)) {
      errors.push(`Step ${index + 1}: Duplicate step number ${step.step_number}`);
    }
    stepNumbers.add(step.step_number);

    // Check delay_days
    if (!Number.isInteger(step.delay_days) || step.delay_days < 0) {
      errors.push(`Step ${index + 1}: Delay days must be a non-negative integer`);
    }

    if (step.delay_days > 365) {
      errors.push(`Step ${index + 1}: Delay days cannot exceed 365 days`);
    }

    // Check subject
    if (!step.subject || step.subject.trim().length === 0) {
      errors.push(`Step ${index + 1}: Subject cannot be empty`);
    }

    if (step.subject && step.subject.length > 200) {
      errors.push(`Step ${index + 1}: Subject cannot exceed 200 characters`);
    }

    // Check body
    if (!step.body || step.body.trim().length === 0) {
      errors.push(`Step ${index + 1}: Body cannot be empty`);
    }

    if (step.body && step.body.length > 10000) {
      errors.push(`Step ${index + 1}: Body cannot exceed 10,000 characters`);
    }
  });

  // Check that step numbers are sequential starting from 1
  const sortedNumbers = Array.from(stepNumbers).sort((a, b) => a - b);
  for (let i = 0; i < sortedNumbers.length; i++) {
    if (sortedNumbers[i] !== i + 1) {
      errors.push(`Step numbers must be sequential starting from 1`);
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export async function initializeLeadSequence(
  leadId: string,
  campaignId: string
): Promise<{ success: boolean; message: string }> {
  const { data: existingProgress } = await supabase
    .from('lead_sequence_progress')
    .select('id')
    .eq('lead_id', leadId)
    .maybeSingle();

  if (existingProgress) {
    return { success: true, message: 'Sequence already initialized' };
  }

  const { data: steps } = await supabase
    .from('email_sequence_steps')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('is_active', true)
    .order('step_number', { ascending: true })
    .limit(1);

  if (!steps || steps.length === 0) {
    return { success: false, message: 'No active sequence steps found' };
  }

  const firstStep = steps[0];
  const nextSendDate = new Date();
  nextSendDate.setDate(nextSendDate.getDate() + firstStep.delay_days);

  const { error } = await supabase.from('lead_sequence_progress').insert({
    lead_id: leadId,
    current_step: 1,
    next_send_date: nextSendDate.toISOString(),
    is_paused: false,
  });

  if (error) {
    return { success: false, message: 'Failed to initialize sequence' };
  }

  return { success: true, message: 'Sequence initialized successfully' };
}

export async function getLeadsReadyForNextEmail(): Promise<
  Array<{
    leadId: string;
    campaignId: string;
    currentStep: number;
    stepDetails: SequenceStep;
    leadDetails: any;
  }>
> {
  const { data: readyLeads, error } = await supabase
    .from('lead_sequence_progress')
    .select(
      `
      id,
      lead_id,
      current_step,
      next_send_date,
      leads (
        id,
        campaign_id,
        email,
        business_name,
        has_replied,
        user_id
      )
    `
    )
    .eq('is_paused', false)
    .is('completed_at', null)
    .lte('next_send_date', new Date().toISOString());

  if (error || !readyLeads) {
    console.error('Error fetching leads ready for email:', error);
    return [];
  }

  const result = [];

  for (const progress of readyLeads) {
    const lead = progress.leads;
    if (!lead || lead.has_replied) continue;

    const { data: step } = await supabase
      .from('email_sequence_steps')
      .select('*')
      .eq('campaign_id', lead.campaign_id)
      .eq('step_number', progress.current_step)
      .eq('is_active', true)
      .maybeSingle();

    if (step) {
      result.push({
        leadId: progress.lead_id,
        campaignId: lead.campaign_id,
        currentStep: progress.current_step,
        stepDetails: step,
        leadDetails: lead,
      });
    }
  }

  return result;
}

export async function advanceLeadToNextStep(
  leadId: string,
  campaignId: string
): Promise<{ success: boolean; message: string; completed?: boolean }> {
  const { data: progress } = await supabase
    .from('lead_sequence_progress')
    .select('current_step')
    .eq('lead_id', leadId)
    .maybeSingle();

  if (!progress) {
    return { success: false, message: 'Sequence progress not found' };
  }

  const nextStepNumber = progress.current_step + 1;

  const { data: nextStep } = await supabase
    .from('email_sequence_steps')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('step_number', nextStepNumber)
    .eq('is_active', true)
    .maybeSingle();

  if (!nextStep) {
    await supabase
      .from('lead_sequence_progress')
      .update({
        completed_at: new Date().toISOString(),
      })
      .eq('lead_id', leadId);

    return { success: true, message: 'Sequence completed', completed: true };
  }

  const nextSendDate = new Date();
  nextSendDate.setDate(nextSendDate.getDate() + nextStep.delay_days);

  const { error } = await supabase
    .from('lead_sequence_progress')
    .update({
      current_step: nextStepNumber,
      next_send_date: nextSendDate.toISOString(),
    })
    .eq('lead_id', leadId);

  if (error) {
    return { success: false, message: 'Failed to advance to next step' };
  }

  return { success: true, message: 'Advanced to next step successfully', completed: false };
}

export async function sendSequenceEmail(
  leadId: string,
  stepDetails: SequenceStep,
  leadDetails: any
): Promise<{ success: boolean; message: string }> {
  const personalizedSubject = personalizeContent(stepDetails.subject, leadDetails);
  const personalizedBody = personalizeContent(stepDetails.body, leadDetails);

  const { data: email, error } = await supabase
    .from('emails')
    .insert({
      campaign_id: stepDetails.campaign_id,
      lead_id: leadId,
      user_id: leadDetails.user_id,
      subject: personalizedSubject,
      body: personalizedBody,
      status: 'queued',
      personalization_data: {
        business_name: leadDetails.business_name,
        email: leadDetails.email,
      },
    })
    .select()
    .maybeSingle();

  if (error || !email) {
    return { success: false, message: 'Failed to create email' };
  }

  await supabase
    .from('leads')
    .update({
      last_email_sent_at: new Date().toISOString(),
      emails_sent_count: (leadDetails.emails_sent_count || 0) + 1,
    })
    .eq('id', leadId);

  return { success: true, message: 'Email queued successfully' };
}

function sanitizeValue(value: string): string {
  if (!value) return '';

  // Remove potentially dangerous characters and scripts
  return value
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

function personalizeContent(content: string, leadDetails: any): string {
  let personalized = content;

  // Sanitize all values before replacement
  const businessName = sanitizeValue(leadDetails.business_name || '');
  const email = sanitizeValue(leadDetails.email || '');
  const firstName = sanitizeValue(leadDetails.decision_maker_name?.split(' ')[0] || '');
  const website = sanitizeValue(leadDetails.website || '');
  const phone = sanitizeValue(leadDetails.phone || '');

  personalized = personalized.replace(/\{\{business_name\}\}/g, businessName);
  personalized = personalized.replace(/\{\{email\}\}/g, email);
  personalized = personalized.replace(/\{\{first_name\}\}/g, firstName);
  personalized = personalized.replace(/\{\{website\}\}/g, website);
  personalized = personalized.replace(/\{\{phone\}\}/g, phone);

  return personalized;
}

export async function processSequenceBatch(
  batchSize: number = 50
): Promise<{
  processed: number;
  successful: number;
  failed: number;
  completed: number;
}> {
  const leadsToProcess = await getLeadsReadyForNextEmail();
  const batch = leadsToProcess.slice(0, batchSize);

  let successful = 0;
  let failed = 0;
  let completed = 0;

  for (const lead of batch) {
    const emailResult = await sendSequenceEmail(
      lead.leadId,
      lead.stepDetails,
      lead.leadDetails
    );

    if (emailResult.success) {
      const advanceResult = await advanceLeadToNextStep(lead.leadId, lead.campaignId);

      if (advanceResult.success) {
        successful++;
        if (advanceResult.completed) {
          completed++;
        }
      } else {
        failed++;
      }
    } else {
      failed++;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return {
    processed: batch.length,
    successful,
    failed,
    completed,
  };
}

export async function getSequenceStats(campaignId: string): Promise<{
  totalLeads: number;
  inProgress: number;
  paused: number;
  completed: number;
  step1: number;
  step2: number;
  step3Plus: number;
}> {
  const { data: leads } = await supabase
    .from('leads')
    .select('id')
    .eq('campaign_id', campaignId);

  const totalLeads = leads?.length || 0;

  const { data: allProgress } = await supabase
    .from('lead_sequence_progress')
    .select('current_step, is_paused, completed_at')
    .in(
      'lead_id',
      leads?.map((l) => l.id) || []
    );

  const inProgress =
    allProgress?.filter((p) => !p.is_paused && !p.completed_at).length || 0;
  const paused = allProgress?.filter((p) => p.is_paused).length || 0;
  const completed = allProgress?.filter((p) => p.completed_at).length || 0;
  const step1 = allProgress?.filter((p) => p.current_step === 1 && !p.completed_at).length || 0;
  const step2 = allProgress?.filter((p) => p.current_step === 2 && !p.completed_at).length || 0;
  const step3Plus =
    allProgress?.filter((p) => p.current_step >= 3 && !p.completed_at).length || 0;

  return {
    totalLeads,
    inProgress,
    paused,
    completed,
    step1,
    step2,
    step3Plus,
  };
}
