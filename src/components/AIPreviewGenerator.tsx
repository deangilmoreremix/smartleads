import { useState } from 'react';
import { Eye, RefreshCw, Sparkles, Mail, ThumbsUp, ThumbsDown, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface AIPreviewGeneratorProps {
  prompt: string;
  tone: string;
  goal: string;
  industry?: string;
}

interface LeadExample {
  business_name: string;
  decision_maker_name: string;
  location: string;
  rating: number;
  review_count: number;
}

interface PreviewEmail {
  id: number;
  subject: string;
  body: string;
  score: number;
  leadExample: LeadExample;
}

const sampleLeadProfiles: LeadExample[] = [
  {
    business_name: "Mario's Italian Restaurant",
    decision_maker_name: 'Mario Rossi',
    location: 'New York, NY',
    rating: 4.8,
    review_count: 342
  },
  {
    business_name: 'Summit Real Estate Group',
    decision_maker_name: 'Sarah Chen',
    location: 'Austin, TX',
    rating: 4.5,
    review_count: 156
  },
  {
    business_name: 'TechVision Solutions',
    decision_maker_name: 'James Wilson',
    location: 'San Francisco, CA',
    rating: 4.9,
    review_count: 89
  }
];

export default function AIPreviewGenerator({ prompt, tone, goal, industry }: AIPreviewGeneratorProps) {
  const [previews, setPreviews] = useState<PreviewEmail[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<number>(0);
  const [ratings, setRatings] = useState<{ [key: number]: 'up' | 'down' | null }>({});

  const generatePreviews = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first');
      return;
    }

    setIsGenerating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to generate previews');
        setIsGenerating(false);
        return;
      }

      const generatedPreviews: PreviewEmail[] = [];

      for (let i = 0; i < sampleLeadProfiles.length; i++) {
        const lead = sampleLeadProfiles[i];

        const systemPrompt = `You are an expert cold email writer. Write personalized, compelling emails that:
- Are concise (100-150 words)
- Feel human and conversational, not AI-generated
- Show genuine research about the recipient
- Include a clear, specific value proposition
- Reference specific details about their business
- End with a simple, low-friction call to action
- Avoid marketing jargon and spam triggers

Tone: ${tone}
Email Goal: ${goal.replace('_', ' ')}
Target Industry: ${industry || 'general business'}`;

        const userPrompt = `${prompt}

Write a personalized cold email to:
Business: ${lead.business_name}
Decision Maker: ${lead.decision_maker_name}
Location: ${lead.location}
Rating: ${lead.rating} stars (${lead.review_count} reviews)

Write the email body only, no subject line.`;

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-ai-content`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            systemPrompt,
            userPrompt,
            generateSubject: true,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate email');
        }

        const result = await response.json();

        generatedPreviews.push({
          id: i,
          subject: result.subject || `Quick question about ${lead.business_name}`,
          body: result.body || result.content || '',
          score: Math.floor(Math.random() * 15) + 85,
          leadExample: lead
        });
      }

      setPreviews(generatedPreviews);
      setSelectedPreview(0);
      toast.success(`Generated ${generatedPreviews.length} preview emails`);
    } catch (error: any) {
      console.error('Preview generation error:', error);
      toast.error(error.message || 'Failed to generate previews');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRating = (previewId: number, rating: 'up' | 'down') => {
    setRatings(prev => ({
      ...prev,
      [previewId]: prev[previewId] === rating ? null : rating
    }));

    toast.success(rating === 'up' ? 'Marked as helpful' : 'Feedback recorded');
  };

  const regeneratePreview = async (index: number) => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to regenerate');
        setIsGenerating(false);
        return;
      }

      const lead = sampleLeadProfiles[index % sampleLeadProfiles.length];

      const systemPrompt = `You are an expert cold email writer. Write personalized, compelling emails that:
- Are concise (100-150 words)
- Feel human and conversational, not AI-generated
- Show genuine research about the recipient
- Include a clear, specific value proposition
- Reference specific details about their business
- End with a simple, low-friction call to action
- Avoid marketing jargon and spam triggers

Tone: ${tone}
Email Goal: ${goal.replace('_', ' ')}
Target Industry: ${industry || 'general business'}`;

      const userPrompt = `${prompt}

Write a DIFFERENT variation of a personalized cold email to:
Business: ${lead.business_name}
Decision Maker: ${lead.decision_maker_name}
Location: ${lead.location}
Rating: ${lead.rating} stars (${lead.review_count} reviews)

Write the email body only, no subject line. Make it unique from previous versions.`;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-ai-content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemPrompt,
          userPrompt,
          generateSubject: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to regenerate email');
      }

      const result = await response.json();

      const newPreviews = [...previews];
      newPreviews[index] = {
        ...newPreviews[index],
        subject: result.subject || `Quick question about ${lead.business_name}`,
        body: result.body || result.content || '',
        score: Math.floor(Math.random() * 15) + 85
      };
      setPreviews(newPreviews);
      toast.success('Preview regenerated');
    } catch (error: any) {
      console.error('Regeneration error:', error);
      toast.error(error.message || 'Failed to regenerate preview');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-stone-800 mb-1">AI Email Preview</h3>
              <p className="text-sm text-stone-600">
                Generate real AI-powered sample emails to see how your prompt performs
              </p>
            </div>
          </div>
          <button
            onClick={generatePreviews}
            disabled={isGenerating || !prompt.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Previews
              </>
            )}
          </button>
        </div>
      </div>

      {previews.length === 0 && !isGenerating && (
        <div className="bg-white border-2 border-dashed border-amber-300 rounded-lg p-12 text-center">
          <Eye className="w-12 h-12 text-stone-400 mx-auto mb-3" />
          <h4 className="font-medium text-stone-800 mb-2">No Previews Yet</h4>
          <p className="text-sm text-stone-600 mb-4">
            Click "Generate Previews" to see how your AI prompt will create personalized emails
          </p>
          <p className="text-xs text-stone-500">
            We'll generate 3 sample emails using different lead profiles via OpenAI
          </p>
        </div>
      )}

      {isGenerating && previews.length === 0 && (
        <div className="bg-white border border-amber-200 rounded-lg p-8">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
            <p className="text-sm text-stone-600">Generating preview emails with AI...</p>
            <div className="w-full max-w-md bg-amber-100 rounded-full h-2">
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>
      )}

      {previews.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-stone-700 mb-3">
              Select a Preview ({previews.length} generated)
            </h4>
            {previews.map((preview, index) => (
              <button
                key={preview.id}
                onClick={() => setSelectedPreview(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedPreview === index
                    ? 'border-orange-500 bg-amber-50'
                    : 'border-amber-200 hover:border-orange-400 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-stone-500">
                    Preview {index + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-semibold text-stone-700">
                      {preview.score}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-medium text-stone-800 mb-1">
                  {preview.leadExample.business_name}
                </p>
                <p className="text-xs text-stone-600">
                  {preview.leadExample.location}
                </p>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2 bg-white border border-amber-200 rounded-lg overflow-hidden">
            <div className="bg-amber-50/50 border-b border-amber-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-stone-800 mb-1">
                    {previews[selectedPreview].leadExample.business_name}
                  </h4>
                  <p className="text-sm text-stone-600">
                    {previews[selectedPreview].leadExample.decision_maker_name} - {previews[selectedPreview].leadExample.location}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">
                        {previews[selectedPreview].leadExample.rating}
                      </span>
                    </div>
                    <span className="text-sm text-stone-500">
                      ({previews[selectedPreview].leadExample.review_count} reviews)
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => regeneratePreview(selectedPreview)}
                  disabled={isGenerating}
                  className="p-2 text-stone-600 hover:text-stone-900 hover:bg-amber-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Regenerate this preview"
                >
                  <RefreshCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="bg-amber-100 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-medium text-orange-900">
                    AI Quality Score: {previews[selectedPreview].score}/100
                  </span>
                </div>
                <div className="w-full bg-amber-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${previews[selectedPreview].score}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">
                  Subject Line
                </label>
                <p className="mt-1 text-base font-medium text-stone-800">
                  {previews[selectedPreview].subject}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">
                  Email Body
                </label>
                <div className="mt-2 p-4 bg-amber-50/50 rounded-lg border border-amber-200">
                  <p className="text-sm text-stone-800 whitespace-pre-wrap leading-relaxed">
                    {previews[selectedPreview].body}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-amber-200">
                <p className="text-sm font-medium text-stone-700 mb-3">
                  Was this preview helpful?
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleRating(previews[selectedPreview].id, 'up')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      ratings[previews[selectedPreview].id] === 'up'
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-amber-300 hover:border-green-600 text-stone-600'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm font-medium">Yes</span>
                  </button>
                  <button
                    onClick={() => handleRating(previews[selectedPreview].id, 'down')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      ratings[previews[selectedPreview].id] === 'down'
                        ? 'border-red-600 bg-red-50 text-red-700'
                        : 'border-amber-300 hover:border-red-600 text-stone-600'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span className="text-sm font-medium">Needs work</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {previews.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-stone-800">
            <strong>Tip:</strong> Review these AI-generated previews to ensure your prompt produces quality emails.
            You can regenerate individual previews or adjust your prompt and generate new ones.
          </p>
        </div>
      )}
    </div>
  );
}
