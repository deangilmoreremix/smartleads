import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';

export default function LiveEmailPersonalizationEditor() {
  const [businessName, setBusinessName] = useState('');
  const [reviewSnippet, setReviewSnippet] = useState('');
  const [yourOffer, setYourOffer] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [highlightedWords, setHighlightedWords] = useState<number[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const genericTemplate = `Hi there,

I wanted to reach out about our marketing services. We help businesses like yours grow through digital marketing.

We've worked with many companies and can help you achieve your goals. Our services include social media management, email campaigns, and more.

Would you be interested in learning more about how we can help your business?

Best regards,
Sales Team`;

  useEffect(() => {
    const timer = setTimeout(() => {
      generateEmail();
    }, 300);
    return () => clearTimeout(timer);
  }, [businessName, reviewSnippet, yourOffer]);

  const generateEmail = () => {
    if (!businessName && !reviewSnippet && !yourOffer) {
      setGeneratedEmail('');
      return;
    }

    const name = businessName || '[Business Name]';
    const review = reviewSnippet || '[Recent Review]';
    const offer = yourOffer || '[Your Offer]';

    const email = `Hi ${name} team,

I came across your business and noticed ${review}. That really stood out to me!

I specialize in helping businesses like ${name} with ${offer}. Based on what your customers are saying, I believe we could help you build on that success.

Would you be open to a quick 15-minute call this week to explore how we might work together?

Looking forward to hearing from you!

Best regards,
Your Name`;

    setGeneratedEmail(email);

    const words: number[] = [];
    if (businessName) words.push(0, 1);
    if (reviewSnippet) words.push(2, 3);
    if (yourOffer) words.push(4, 5);
    setHighlightedWords(words);
  };

  const renderEmailWithHighlights = (text: string) => {
    if (!text) return null;

    const parts = text.split('\n');
    return parts.map((part, lineIndex) => (
      <div key={lineIndex} className="mb-2">
        {part.split(' ').map((word, wordIndex) => {
          const shouldHighlight =
            (businessName && part.toLowerCase().includes(businessName.toLowerCase())) ||
            (reviewSnippet && part.toLowerCase().includes(reviewSnippet.toLowerCase().substring(0, 10))) ||
            (yourOffer && part.toLowerCase().includes(yourOffer.toLowerCase()));

          const isPersonalized = shouldHighlight && (
            word.toLowerCase().includes(businessName.toLowerCase().substring(0, 3)) ||
            word.toLowerCase().includes(yourOffer.toLowerCase().substring(0, 3))
          );

          return (
            <span
              key={wordIndex}
              className={`${
                isPersonalized
                  ? 'bg-[#FFD666] px-1 rounded animate-pulse-slow'
                  : ''
              } transition-all duration-300`}
            >
              {word}{' '}
            </span>
          );
        })}
      </div>
    ));
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-[#FFD666] to-[#FFC233] p-6">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-gray-900" />
          <h3 className="text-2xl font-bold text-gray-900">
            Live Email Personalization Editor
          </h3>
        </div>
        <p className="text-gray-700 mt-2">
          Type in the fields below and watch AI personalize your email in real-time
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 p-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 text-lg flex items-center space-x-2">
            <span>Input Fields</span>
            {(businessName || reviewSnippet || yourOffer) && (
              <TrendingUp className="w-5 h-5 text-green-600 animate-bounce" />
            )}
          </h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g., Joe's Pizza"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD666] focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Snippet
            </label>
            <textarea
              value={reviewSnippet}
              onChange={(e) => setReviewSnippet(e.target.value)}
              placeholder="e.g., you have great customer service"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD666] focus:border-transparent transition resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Offer
            </label>
            <input
              type="text"
              value={yourOffer}
              onChange={(e) => setYourOffer(e.target.value)}
              placeholder="e.g., social media marketing"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD666] focus:border-transparent transition"
            />
          </div>

          <button
            onClick={() => setShowComparison(!showComparison)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 rounded-lg transition"
          >
            {showComparison ? 'Hide' : 'Show'} Generic Template Comparison
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 text-lg">
              AI-Generated Email
            </h4>
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">Auto-updating</span>
            </div>
          </div>

          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 min-h-[400px] font-mono text-sm leading-relaxed">
            {generatedEmail ? (
              renderEmailWithHighlights(generatedEmail)
            ) : (
              <p className="text-gray-400 italic">
                Start typing in the fields to see your personalized email appear here...
              </p>
            )}
          </div>

          {generatedEmail && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-medium">Personalization Score:</span>
                <span className="text-green-600 font-bold text-lg">
                  {Math.min(95, 40 + (businessName ? 20 : 0) + (reviewSnippet ? 25 : 0) + (yourOffer ? 10 : 0))}%
                </span>
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-full transition-all duration-500"
                  style={{
                    width: `${Math.min(95, 40 + (businessName ? 20 : 0) + (reviewSnippet ? 25 : 0) + (yourOffer ? 10 : 0))}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {showComparison && (
        <div className="border-t border-gray-200 p-6 bg-red-50">
          <h4 className="font-semibold text-gray-900 text-lg mb-4">
            Generic Template (What NOT to Send)
          </h4>
          <div className="bg-white border-2 border-red-200 rounded-lg p-6 font-mono text-sm leading-relaxed whitespace-pre-line opacity-60">
            {genericTemplate}
          </div>
          <div className="mt-4 bg-red-100 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 font-medium">Personalization Score:</span>
              <span className="text-red-600 font-bold text-lg">12%</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Generic templates get 3-5x lower response rates
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
