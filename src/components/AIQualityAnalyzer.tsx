import { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, CheckCircle, Info, Zap } from 'lucide-react';

interface AIQualityAnalyzerProps {
  prompt: string;
  tone: string;
  goal: string;
}

interface QualityMetric {
  name: string;
  score: number;
  status: 'good' | 'warning' | 'poor';
  message: string;
  suggestions?: string[];
}

export default function AIQualityAnalyzer({ prompt, tone, goal }: AIQualityAnalyzerProps) {
  const [metrics, setMetrics] = useState<QualityMetric[]>([]);
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    analyzePrompt();
  }, [prompt, tone, goal]);

  const analyzePrompt = () => {
    if (!prompt.trim()) {
      setMetrics([]);
      setOverallScore(0);
      return;
    }

    const newMetrics: QualityMetric[] = [];

    const personalizations = (prompt.match(/\{\{[^}]+\}\}/g) || []).length;
    let personalizationScore = 0;
    let personalizationStatus: 'good' | 'warning' | 'poor' = 'poor';
    let personalizationMessage = '';

    if (personalizations === 0) {
      personalizationScore = 20;
      personalizationStatus = 'poor';
      personalizationMessage = 'No personalization variables found';
    } else if (personalizations <= 2) {
      personalizationScore = 60;
      personalizationStatus = 'warning';
      personalizationMessage = 'Basic personalization detected';
    } else if (personalizations <= 4) {
      personalizationScore = 85;
      personalizationStatus = 'good';
      personalizationMessage = 'Good personalization level';
    } else {
      personalizationScore = 95;
      personalizationStatus = 'good';
      personalizationMessage = 'Excellent personalization';
    }

    newMetrics.push({
      name: 'Personalization',
      score: personalizationScore,
      status: personalizationStatus,
      message: personalizationMessage,
      suggestions: personalizations === 0 ? [
        'Add {{business_name}} to reference the prospect',
        'Include {{decision_maker_name}} for personal touch',
        'Use {{location}} to show local relevance'
      ] : personalizations <= 2 ? [
        'Consider adding more variables for deeper personalization',
        'Try including {{rating}} or {{review_count}} for social proof'
      ] : []
    });

    const wordCount = prompt.split(/\s+/).length;
    let clarityScore = 0;
    let clarityStatus: 'good' | 'warning' | 'poor' = 'poor';
    let clarityMessage = '';

    if (wordCount < 20) {
      clarityScore = 40;
      clarityStatus = 'poor';
      clarityMessage = 'Prompt is too brief';
    } else if (wordCount < 50) {
      clarityScore = 70;
      clarityStatus = 'warning';
      clarityMessage = 'Prompt could be more detailed';
    } else if (wordCount < 150) {
      clarityScore = 90;
      clarityStatus = 'good';
      clarityMessage = 'Well-detailed prompt';
    } else {
      clarityScore = 75;
      clarityStatus = 'warning';
      clarityMessage = 'Prompt might be too long';
    }

    newMetrics.push({
      name: 'Clarity',
      score: clarityScore,
      status: clarityStatus,
      message: clarityMessage,
      suggestions: wordCount < 50 ? [
        'Add more context about your offer',
        'Specify the desired email structure',
        'Include key points you want to emphasize'
      ] : wordCount > 150 ? [
        'Consider condensing your instructions',
        'Focus on the most important points'
      ] : []
    });

    const hasCallToAction = /call.to.action|cta|schedule|book|contact|reply|respond|visit|click/i.test(prompt);
    const ctaScore = hasCallToAction ? 90 : 30;
    const ctaStatus: 'good' | 'warning' | 'poor' = hasCallToAction ? 'good' : 'poor';

    newMetrics.push({
      name: 'Call-to-Action',
      score: ctaScore,
      status: ctaStatus,
      message: hasCallToAction ? 'CTA guidance provided' : 'No CTA mentioned',
      suggestions: !hasCallToAction ? [
        'Specify what action you want recipients to take',
        'Example: "Include a CTA to schedule a 15-minute call"',
        'Example: "Ask them to reply with their availability"'
      ] : []
    });

    const hasToneGuidance = new RegExp(tone, 'i').test(prompt);
    const toneScore = hasToneGuidance ? 80 : 60;
    const toneStatus: 'good' | 'warning' | 'poor' = hasToneGuidance ? 'good' : 'warning';

    newMetrics.push({
      name: 'Tone Consistency',
      score: toneScore,
      status: toneStatus,
      message: hasToneGuidance ? 'Tone reinforced in prompt' : 'Tone only set in selector',
      suggestions: !hasToneGuidance ? [
        `Consider mentioning "${tone}" tone in your instructions`,
        'This reinforces the desired communication style'
      ] : []
    });

    const spamWords = ['free', 'guaranteed', 'limited time', 'act now', 'click here', 'buy now'];
    const foundSpamWords = spamWords.filter(word => new RegExp(word, 'i').test(prompt));
    const spamScore = foundSpamWords.length === 0 ? 95 : Math.max(40, 95 - (foundSpamWords.length * 15));
    const spamStatus: 'good' | 'warning' | 'poor' = foundSpamWords.length === 0 ? 'good' : foundSpamWords.length <= 2 ? 'warning' : 'poor';

    newMetrics.push({
      name: 'Spam Risk',
      score: spamScore,
      status: spamStatus,
      message: foundSpamWords.length === 0 ? 'Low spam risk' : `${foundSpamWords.length} spam trigger word(s) found`,
      suggestions: foundSpamWords.length > 0 ? [
        'Avoid words like: ' + foundSpamWords.join(', '),
        'Use value-focused language instead',
        'Focus on benefits rather than urgency'
      ] : []
    });

    const hasValueProp = /benefit|help|improve|increase|save|solution|results/i.test(prompt);
    const valueScore = hasValueProp ? 85 : 50;
    const valueStatus: 'good' | 'warning' | 'poor' = hasValueProp ? 'good' : 'warning';

    newMetrics.push({
      name: 'Value Proposition',
      score: valueScore,
      status: valueStatus,
      message: hasValueProp ? 'Value-focused language detected' : 'Limited value emphasis',
      suggestions: !hasValueProp ? [
        'Highlight the benefits you provide',
        'Mention specific results or outcomes',
        'Focus on solving their problems'
      ] : []
    });

    setMetrics(newMetrics);
    const avgScore = Math.round(newMetrics.reduce((sum, m) => sum + m.score, 0) / newMetrics.length);
    setOverallScore(avgScore);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'poor':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  if (!prompt.trim()) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <Zap className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          Start writing your prompt to see AI quality analysis
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`${getScoreBgColor(overallScore)} border-2 ${overallScore >= 80 ? 'border-green-300' : overallScore >= 60 ? 'border-yellow-300' : 'border-red-300'} rounded-lg p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg">
              <TrendingUp className={`w-6 h-6 ${getScoreColor(overallScore)}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Prompt Quality Score</h3>
              <p className="text-sm text-gray-600">Overall AI optimization rating</p>
            </div>
          </div>
          <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
            {overallScore}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {metrics.map((metric) => (
          <div key={metric.name} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(metric.status)}
                <span className="font-medium text-gray-900">{metric.name}</span>
              </div>
              <span className={`text-sm font-semibold ${getScoreColor(metric.score)}`}>
                {metric.score}/100
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-2">{metric.message}</p>

            {metric.suggestions && metric.suggestions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-700 mb-1">Suggestions:</p>
                <ul className="space-y-1">
                  {metric.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  metric.score >= 80 ? 'bg-green-600' : metric.score >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                }`}
                style={{ width: `${metric.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {overallScore < 70 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">
                Improve Your Prompt Quality
              </p>
              <p className="text-xs text-blue-700">
                Higher quality prompts result in better AI-generated emails with higher engagement rates.
                Follow the suggestions above to optimize your prompt.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
