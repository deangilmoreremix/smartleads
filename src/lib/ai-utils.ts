import { supabase } from './supabase';

export function extractVariables(text: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = text.matchAll(regex);
  return [...new Set(Array.from(matches, m => m[1].trim()))];
}

export interface AIGenerationOptions {
  type: 'subject' | 'body' | 'opening' | 'cta' | 'complete';
  context: {
    industry?: string;
    tone?: string;
    targetAudience?: string;
    emailGoal?: string;
    pitch?: string;
    customInstructions?: string;
  };
}

export async function generateAIContent(options: AIGenerationOptions): Promise<string[]> {
  const { type, context } = options;

  const systemPrompt = `You are an expert cold email writer. Generate ${type === 'complete' ? 'complete email templates' : `${type} lines`} for cold outreach.`;

  let userPrompt = `Generate ${type === 'complete' ? '5 complete email templates' : `10 ${type} variations`} for:`;

  if (context.industry) userPrompt += `\nIndustry: ${context.industry}`;
  if (context.tone) userPrompt += `\nTone: ${context.tone}`;
  if (context.targetAudience) userPrompt += `\nTarget Audience: ${context.targetAudience}`;
  if (context.emailGoal) userPrompt += `\nEmail Goal: ${context.emailGoal}`;
  if (context.pitch) userPrompt += `\nValue Proposition: ${context.pitch}`;
  if (context.customInstructions) userPrompt += `\nAdditional Instructions: ${context.customInstructions}`;

  if (type === 'subject') {
    userPrompt += '\n\nGenerate 10 compelling subject lines. Make them specific, personalized, and attention-grabbing. Return ONLY the subject lines, one per line.';
  } else if (type === 'opening') {
    userPrompt += '\n\nGenerate 10 opening lines for cold emails. Make them personalized and engaging. Return ONLY the opening lines, one per line.';
  } else if (type === 'cta') {
    userPrompt += '\n\nGenerate 10 call-to-action lines. Make them low-friction and clear. Return ONLY the CTA lines, one per line.';
  } else if (type === 'body') {
    userPrompt += '\n\nGenerate 10 email body paragraphs (2-3 sentences each). Focus on value and personalization. Return ONLY the body paragraphs, separated by double newlines.';
  } else {
    userPrompt += '\n\nGenerate 5 complete email templates. Each template should have a subject line, opening, body, and CTA. Separate templates with "---".';
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-ai-content`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ systemPrompt, userPrompt }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate content');
    }

    const result = await response.json();
    return result.content;
  } catch (error: any) {
    console.error('AI generation error:', error);
    throw error;
  }
}

export interface QualityMetrics {
  overall_score: number;
  personalization_score: number;
  clarity_score: number;
  cta_score: number;
  length_score: number;
  suggestions: string[];
  strengths: string[];
}

export async function analyzeEmailQuality(
  prompt: string,
  context: { tone?: string; emailGoal?: string; industry?: string }
): Promise<QualityMetrics> {
  const variables = extractVariables(prompt);
  const wordCount = prompt.split(/\s+/).length;

  const personalizationScore = Math.min(100, (variables.length * 15) + (wordCount > 50 ? 20 : 0));

  const hasCallToAction = /\b(call|schedule|reply|book|meeting|discuss|chat|connect|reach out)\b/i.test(prompt);
  const ctaScore = hasCallToAction ? 90 : 40;

  const optimalLength = wordCount >= 50 && wordCount <= 150;
  const lengthScore = optimalLength ? 100 : Math.max(0, 100 - Math.abs(100 - wordCount));

  const clarityScore = prompt.length > 100 && !prompt.includes('{{') ? 85 : 70;

  const overallScore = Math.round(
    (personalizationScore * 0.3) +
    (clarityScore * 0.25) +
    (ctaScore * 0.25) +
    (lengthScore * 0.2)
  );

  const suggestions: string[] = [];
  const strengths: string[] = [];

  if (variables.length === 0) {
    suggestions.push('Add personalization tokens like {{business_name}} or {{decision_maker_name}}');
  } else if (variables.length >= 3) {
    strengths.push(`Good personalization with ${variables.length} custom fields`);
  }

  if (!hasCallToAction) {
    suggestions.push('Include a clear call-to-action');
  } else {
    strengths.push('Clear call-to-action present');
  }

  if (wordCount < 50) {
    suggestions.push('Email seems too short. Aim for 50-150 words');
  } else if (wordCount > 150) {
    suggestions.push('Email might be too long. Keep it under 150 words');
  } else {
    strengths.push('Good email length');
  }

  if (prompt.toLowerCase().includes('free') || prompt.toLowerCase().includes('guarantee')) {
    suggestions.push('Avoid spam trigger words like "free" or "guarantee"');
  }

  return {
    overall_score: overallScore,
    personalization_score: personalizationScore,
    clarity_score: clarityScore,
    cta_score: ctaScore,
    length_score: lengthScore,
    suggestions,
    strengths,
  };
}

export interface PreviewLead {
  id: string;
  business_name: string;
  decision_maker_name: string;
  industry?: string;
  location?: string;
  rating?: number;
  review_count?: number;
}

export async function generateEmailPreview(
  prompt: string,
  lead: PreviewLead,
  context: { tone?: string; emailGoal?: string; pitch?: string }
): Promise<{ subject: string; body: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    let processedPrompt = prompt;
    const tokens: Record<string, string> = {
      business_name: lead.business_name,
      decision_maker_name: lead.decision_maker_name,
      industry: lead.industry || 'business',
      location: lead.location || 'your area',
      rating: lead.rating?.toString() || '5',
      review_count: lead.review_count?.toString() || '100',
    };

    Object.keys(tokens).forEach(key => {
      const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      processedPrompt = processedPrompt.replace(placeholder, tokens[key]);
    });

    if (context.pitch) {
      processedPrompt = processedPrompt.replace(/\{\{pitch\}\}/g, context.pitch);
    }

    const systemPrompt = `You are an expert cold email writer. Generate a personalized email based on the following prompt.
Tone: ${context.tone || 'professional'}
Goal: ${context.emailGoal || 'cold outreach'}
Keep it concise (100-150 words), conversational, and include a clear CTA.`;

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-ai-content`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemPrompt,
        userPrompt: processedPrompt,
        generateSubject: true,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate preview');
    }

    const result = await response.json();
    return {
      subject: result.subject || `Question about ${lead.business_name}`,
      body: result.body || result.content,
    };
  } catch (error: any) {
    console.error('Preview generation error:', error);
    throw error;
  }
}
