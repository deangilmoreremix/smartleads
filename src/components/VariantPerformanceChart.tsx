import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp, Mail, Eye, Reply, Award } from 'lucide-react';
import type { Database } from '../types/database';

type TemplateVariant = Database['public']['Tables']['template_variants']['Row'];

interface VariantPerformanceProps {
  templateId: string;
}

export default function VariantPerformanceChart({ templateId }: VariantPerformanceProps) {
  const [variants, setVariants] = useState<TemplateVariant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVariants();
  }, [templateId]);

  const loadVariants = async () => {
    try {
      const { data, error } = await supabase
        .from('template_variants')
        .select('*')
        .eq('template_id', templateId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setVariants(data || []);
    } catch (error) {
      console.error('Error loading variants:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRate = (numerator: number, denominator: number): number => {
    return denominator > 0 ? (numerator / denominator) * 100 : 0;
  };

  const getBestVariant = () => {
    if (variants.length === 0) return null;

    return variants.reduce((best, current) => {
      const currentReplyRate = calculateRate(current.reply_count, current.sent_count);
      const bestReplyRate = calculateRate(best.reply_count, best.sent_count);
      return currentReplyRate > bestReplyRate ? current : best;
    });
  };

  const bestVariant = getBestVariant();

  if (loading) {
    return (
      <div className="animate-pulse bg-white rounded-xl p-6 border border-gray-100">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (variants.length === 0) {
    return (
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-start space-x-3">
          <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">A/B Testing Available</h3>
            <p className="text-sm text-blue-700">
              Create variants of this template to test different approaches and improve your response rates.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>A/B Test Results</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Compare performance across {variants.length} variant{variants.length !== 1 ? 's' : ''}
          </p>
        </div>
        {bestVariant && bestVariant.sent_count > 10 && (
          <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg">
            <Award className="w-4 h-4" />
            <span className="text-sm font-medium">Best: Variant {bestVariant.variant_name}</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {variants.map((variant) => {
          const openRate = calculateRate(variant.open_count, variant.sent_count);
          const replyRate = calculateRate(variant.reply_count, variant.sent_count);
          const isBest = bestVariant?.id === variant.id && variant.sent_count > 10;

          return (
            <div
              key={variant.id}
              className={`border rounded-lg p-4 transition-all ${
                isBest
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-900">
                      Variant {variant.variant_name}
                    </h4>
                    {isBest && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                        Best Performer
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                    {variant.subject}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Sent</div>
                    <div className="font-semibold text-gray-900">{variant.sent_count}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Open Rate</div>
                    <div className="font-semibold text-gray-900">
                      {openRate.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Reply className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Reply Rate</div>
                    <div className="font-semibold text-gray-900">
                      {replyRate.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {variant.sent_count > 0 && (
                <div className="mt-3">
                  <div className="flex space-x-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 transition-all"
                      style={{ width: `${openRate}%` }}
                      title={`${openRate.toFixed(1)}% opened`}
                    />
                    <div
                      className="bg-green-500 transition-all"
                      style={{ width: `${replyRate}%` }}
                      title={`${replyRate.toFixed(1)}% replied`}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>Performance</span>
                    {variant.sent_count < 10 && (
                      <span className="text-orange-600">Need more data for accuracy</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {variants.every((v) => v.sent_count === 0) && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            Start sending emails to see variant performance data
          </p>
        </div>
      )}
    </div>
  );
}
