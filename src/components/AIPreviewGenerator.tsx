import { useState } from 'react';
import { Eye, RefreshCw, Sparkles, Mail, ThumbsUp, ThumbsDown, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface AIPreviewGeneratorProps {
  prompt: string;
  tone: string;
  goal: string;
  industry?: string;
}

interface PreviewEmail {
  id: number;
  subject: string;
  body: string;
  score: number;
  leadExample: {
    business_name: string;
    decision_maker_name: string;
    location: string;
    rating: number;
    review_count: number;
  };
}

export default function AIPreviewGenerator({ prompt, tone, goal, industry }: AIPreviewGeneratorProps) {
  const [previews, setPreviews] = useState<PreviewEmail[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<number>(0);
  const [ratings, setRatings] = useState<{ [key: number]: 'up' | 'down' | null }>({});

  const mockLeads = [
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

  const generatePreviews = () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first');
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      const generated: PreviewEmail[] = mockLeads.map((lead, index) => ({
        id: index,
        subject: generateSubject(lead, index),
        body: generateBody(lead, index),
        score: Math.floor(Math.random() * 15) + 85,
        leadExample: lead
      }));

      setPreviews(generated);
      setSelectedPreview(0);
      setIsGenerating(false);
      toast.success(`Generated ${generated.length} preview emails`);
    }, 2000);
  };

  const generateSubject = (lead: typeof mockLeads[0], variant: number) => {
    const subjects = [
      `Quick question about ${lead.business_name}`,
      `${lead.decision_maker_name}, loved your ${lead.rating}-star rating!`,
      `Idea for ${lead.business_name} in ${lead.location}`,
      `${lead.business_name} - specific growth opportunity`,
      `${lead.decision_maker_name}, can we chat briefly?`
    ];
    return subjects[variant] || subjects[0];
  };

  const generateBody = (lead: typeof mockLeads[0], variant: number) => {
    const intros = [
      `Hi ${lead.decision_maker_name},\n\nI came across ${lead.business_name} and was really impressed by your ${lead.rating}-star rating with ${lead.review_count} reviews. Clearly you're doing something right!`,
      `${lead.decision_maker_name},\n\nHope this email finds you well. I noticed ${lead.business_name} in ${lead.location} and wanted to reach out with a quick idea.`,
      `Hey ${lead.decision_maker_name},\n\nI've been researching successful businesses in ${lead.location}, and ${lead.business_name} definitely caught my attention with those ${lead.review_count} reviews.`
    ];

    const bodies = [
      `\n\nI help ${industry || 'businesses'} like yours increase their online presence and drive more customers through targeted digital marketing. We've helped similar businesses in ${lead.location} increase their customer base by 40% in just 90 days.\n\n`,
      `\n\nI specialize in helping ${industry || 'local businesses'} maximize their online visibility. Based on your excellent reviews, I think there's real potential to amplify your reach and bring in even more customers.\n\n`,
      `\n\nI work with ${industry || 'businesses'} to scale their operations through smart digital strategies. Given ${lead.business_name}'s strong reputation, I believe we could help you reach the next level.\n\n`
    ];

    const ctas = [
      `Would you be open to a quick 15-minute call this week to discuss how we could help ${lead.business_name} grow?\n\nBest regards`,
      `Are you interested in learning more? I'd love to show you some specific strategies that could work for ${lead.business_name}.\n\nLooking forward to hearing from you`,
      `Let me know if you'd like to chat - I have some ideas specific to ${lead.location} that might interest you.\n\nThanks`
    ];

    return intros[variant % intros.length] + bodies[variant % bodies.length] + ctas[variant % ctas.length];
  };

  const handleRating = (previewId: number, rating: 'up' | 'down') => {
    setRatings(prev => ({
      ...prev,
      [previewId]: prev[previewId] === rating ? null : rating
    }));

    toast.success(rating === 'up' ? 'Marked as helpful' : 'Feedback recorded');
  };

  const regeneratePreview = (index: number) => {
    setIsGenerating(true);
    setTimeout(() => {
      const newPreviews = [...previews];
      const lead = mockLeads[index % mockLeads.length];
      newPreviews[index] = {
        ...newPreviews[index],
        subject: generateSubject(lead, Math.floor(Math.random() * 5)),
        body: generateBody(lead, Math.floor(Math.random() * 3)),
        score: Math.floor(Math.random() * 15) + 85
      };
      setPreviews(newPreviews);
      setIsGenerating(false);
      toast.success('Preview regenerated');
    }, 1000);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">AI Email Preview</h3>
              <p className="text-sm text-gray-600">
                Generate sample emails to see how AI will personalize your message for different leads
              </p>
            </div>
          </div>
          <button
            onClick={generatePreviews}
            disabled={isGenerating || !prompt.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <Eye className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h4 className="font-medium text-gray-900 mb-2">No Previews Yet</h4>
          <p className="text-sm text-gray-600 mb-4">
            Click "Generate Previews" to see how your AI prompt will create personalized emails
          </p>
          <p className="text-xs text-gray-500">
            We'll generate 3-5 sample emails using different lead profiles
          </p>
        </div>
      )}

      {isGenerating && previews.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm text-gray-600">Generating preview emails...</p>
            <div className="w-full max-w-md bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>
      )}

      {previews.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Select a Preview ({previews.length} generated)
            </h4>
            {previews.map((preview, index) => (
              <button
                key={preview.id}
                onClick={() => setSelectedPreview(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedPreview === index
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">
                    Preview {index + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-semibold text-gray-700">
                      {preview.score}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {preview.leadExample.business_name}
                </p>
                <p className="text-xs text-gray-600">
                  {preview.leadExample.location}
                </p>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {previews[selectedPreview].leadExample.business_name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {previews[selectedPreview].leadExample.decision_maker_name} • {previews[selectedPreview].leadExample.location}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">
                        {previews[selectedPreview].leadExample.rating}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ({previews[selectedPreview].leadExample.review_count} reviews)
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => regeneratePreview(selectedPreview)}
                  disabled={isGenerating}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
                  title="Regenerate this preview"
                >
                  <RefreshCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-900">
                    AI Quality Score: {previews[selectedPreview].score}/100
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${previews[selectedPreview].score}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Subject Line
                </label>
                <p className="mt-1 text-base font-medium text-gray-900">
                  {previews[selectedPreview].subject}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Email Body
                </label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {previews[selectedPreview].body}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Was this preview helpful?
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleRating(previews[selectedPreview].id, 'up')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      ratings[previews[selectedPreview].id] === 'up'
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-green-600 text-gray-600'
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
                        : 'border-gray-300 hover:border-red-600 text-gray-600'
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Tip:</strong> Review these previews to ensure the AI is generating emails that match your expectations.
            You can regenerate individual previews or adjust your prompt and generate new ones.
          </p>
        </div>
      )}
    </div>
  );
}
