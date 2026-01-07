import { useState } from 'react';
import { Wand2, Mail, Target, RefreshCw, Copy, Check, Sparkles, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateAIContent } from '../lib/ai-utils';

interface AIWritingAssistantProps {
  tone: string;
  goal: string;
  industry?: string;
  targetAudience?: string;
  pitch?: string;
  onInsert?: (content: string) => void;
}

interface GeneratedContent {
  type: 'subject' | 'opening' | 'cta';
  content: string[];
}

export default function AIWritingAssistant({
  tone,
  goal,
  industry,
  targetAudience,
  pitch,
  onInsert
}: AIWritingAssistantProps) {
  const [activeTab, setActiveTab] = useState<'subject' | 'opening' | 'cta'>('subject');
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const content = await generateAIContent({
        type: activeTab,
        context: {
          industry,
          tone,
          targetAudience,
          emailGoal: goal,
          pitch,
        },
      });

      setGenerated({
        type: activeTab,
        content,
      });
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate content. Please try again.');
      toast.error(err.message || 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleInsert = (content: string) => {
    onInsert?.(content);
    toast.success('Inserted into prompt');
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'subject':
        return 'Subject Lines';
      case 'opening':
        return 'Opening Lines';
      case 'cta':
        return 'Call-to-Actions';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white border border-amber-200 rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-4">
        <div className="flex items-center gap-2 text-white mb-2">
          <Wand2 className="w-5 h-5" />
          <h3 className="font-semibold">AI Writing Assistant</h3>
        </div>
        <p className="text-sm text-amber-50">
          Generate high-converting email components powered by OpenAI
        </p>
      </div>

      <div className="border-b border-amber-200">
        <div className="flex">
          {(['subject', 'opening', 'cta'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setGenerated(null);
                setError(null);
              }}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-orange-600 border-b-2 border-orange-500 bg-amber-50'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-amber-50'
              }`}
            >
              {getTabLabel(tab)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-stone-600">
              Tone: <span className="font-medium text-stone-800 capitalize">{tone}</span>
              {' • '}
              Goal: <span className="font-medium text-stone-800">{goal.replace(/_/g, ' ')}</span>
            </p>
            {industry && (
              <p className="text-xs text-stone-500 mt-1">
                Industry: {industry}
              </p>
            )}
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
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
                Generate
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">Generation Failed</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {!generated && !isGenerating && !error && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
              {activeTab === 'subject' && <Mail className="w-8 h-8 text-stone-400" />}
              {activeTab === 'opening' && <Wand2 className="w-8 h-8 text-stone-400" />}
              {activeTab === 'cta' && <Target className="w-8 h-8 text-stone-400" />}
            </div>
            <p className="text-sm text-stone-600">
              Click "Generate" to create AI-powered {getTabLabel(activeTab).toLowerCase()}
            </p>
          </div>
        )}

        {isGenerating && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-amber-100 rounded-lg"></div>
              </div>
            ))}
          </div>
        )}

        {generated && !isGenerating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-stone-700">
                {generated.content.length} options generated
              </p>
              <button
                onClick={handleGenerate}
                className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </button>
            </div>

            {generated.content.map((item, index) => (
              <div
                key={index}
                className="group p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-stone-800">{item}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(item, index)}
                      className="p-1.5 text-stone-600 hover:text-stone-800 hover:bg-white rounded transition-colors"
                      title="Copy"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    {onInsert && (
                      <button
                        onClick={() => handleInsert(item)}
                        className="p-1.5 text-orange-500 hover:text-orange-600 hover:bg-white rounded transition-colors"
                        title="Insert into prompt"
                      >
                        <Target className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-amber-50 border-t border-amber-200 p-3">
        <p className="text-xs text-stone-600 text-center">
          These are AI-generated suggestions powered by OpenAI. Review and customize them to match your voice.
        </p>
      </div>
    </div>
  );
}
