import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  FlaskConical,
  TrendingUp,
  Trophy,
  BarChart3,
  Plus,
  Trash2,
  Play,
  Pause,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { calculateABTestStats, type ABTest } from '../services/ab-testing';

interface Props {
  sequenceId: string;
  campaignId: string;
  stepNumber?: number;
}

export default function ABTestManager({ sequenceId, campaignId, stepNumber = 1 }: Props) {
  const { user } = useAuth();
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    variantASubject: '',
    variantBSubject: '',
    variantABody: '',
    variantBBody: '',
    minSampleSize: 50,
  });

  useEffect(() => {
    loadTests();
  }, [sequenceId]);

  async function loadTests() {
    try {
      const { data, error } = await supabase
        .from('sequence_ab_tests')
        .select('*')
        .eq('sequence_id', sequenceId)
        .order('step_number', { ascending: true });

      if (error) throw error;
      setTests(data || []);
    } catch (error) {
      console.error('Error loading A/B tests:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createTest() {
    if (!formData.variantASubject || !formData.variantBSubject) {
      toast.error('Both subject lines are required');
      return;
    }

    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    try {
      const { error } = await supabase.from('sequence_ab_tests').insert({
        user_id: user.id,
        campaign_id: campaignId,
        sequence_id: sequenceId,
        step_number: stepNumber,
        variant_a_subject: formData.variantASubject,
        variant_b_subject: formData.variantBSubject,
        variant_a_body: formData.variantABody || null,
        variant_b_body: formData.variantBBody || null,
        min_sample_size: formData.minSampleSize,
        is_active: true,
      });

      if (error) throw error;

      toast.success('A/B test created');
      setShowCreateForm(false);
      setFormData({
        variantASubject: '',
        variantBSubject: '',
        variantABody: '',
        variantBBody: '',
        minSampleSize: 50,
      });
      loadTests();
    } catch (error) {
      console.error('Error creating A/B test:', error);
      toast.error('Failed to create A/B test');
    }
  }

  async function toggleTest(testId: string, isActive: boolean) {
    try {
      const { error } = await supabase
        .from('sequence_ab_tests')
        .update({ is_active: !isActive })
        .eq('id', testId);

      if (error) throw error;
      toast.success(isActive ? 'Test paused' : 'Test activated');
      loadTests();
    } catch (error) {
      toast.error('Failed to update test');
    }
  }

  async function deleteTest(testId: string) {
    if (!confirm('Are you sure you want to delete this A/B test?')) return;

    try {
      const { error } = await supabase
        .from('sequence_ab_tests')
        .delete()
        .eq('id', testId);

      if (error) throw error;
      toast.success('Test deleted');
      loadTests();
    } catch (error) {
      toast.error('Failed to delete test');
    }
  }

  if (loading) {
    return <div className="animate-pulse h-32 bg-gray-100 rounded-xl" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-amber-600" />
          <h3 className="font-semibold text-gray-900">A/B Testing</h3>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition"
        >
          <Plus className="w-4 h-4" />
          New Test
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variant A Subject
              </label>
              <input
                type="text"
                value={formData.variantASubject}
                onChange={(e) => setFormData({ ...formData, variantASubject: e.target.value })}
                placeholder="Subject line A"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variant B Subject
              </label>
              <input
                type="text"
                value={formData.variantBSubject}
                onChange={(e) => setFormData({ ...formData, variantBSubject: e.target.value })}
                placeholder="Subject line B"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Sample Size (per variant)
            </label>
            <input
              type="number"
              min="10"
              max="500"
              value={formData.minSampleSize}
              onChange={(e) => setFormData({ ...formData, minSampleSize: parseInt(e.target.value) })}
              className="w-32 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={createTest}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition"
            >
              Create Test
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {tests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FlaskConical className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No A/B tests created yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Create a test to compare different subject lines
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tests.map((test) => {
            const stats = calculateABTestStats(test);

            return (
              <div
                key={test.id}
                className="bg-white border border-gray-200 rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        test.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {test.is_active ? 'Active' : 'Paused'}
                    </span>
                    {test.winner && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                        <Trophy className="w-3 h-3" />
                        Winner: Variant {test.winner}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleTest(test.id, test.is_active)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                      {test.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => deleteTest(test.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <VariantCard
                    variant="A"
                    subject={test.variant_a_subject || ''}
                    stats={stats.variantA}
                    isWinner={test.winner === 'A'}
                  />
                  <VariantCard
                    variant="B"
                    subject={test.variant_b_subject || ''}
                    stats={stats.variantB}
                    isWinner={test.winner === 'B'}
                  />
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Sample size: {stats.variantA.sends + stats.variantB.sends} / {test.min_sample_size * 2}
                    </span>
                    <span className="text-gray-500">
                      Confidence: {Math.round(stats.confidence * 100)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          ((stats.variantA.sends + stats.variantB.sends) / (test.min_sample_size * 2)) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function VariantCard({
  variant,
  subject,
  stats,
  isWinner,
}: {
  variant: 'A' | 'B';
  subject: string;
  stats: { sends: number; opens: number; replies: number; openRate: number; replyRate: number };
  isWinner: boolean;
}) {
  return (
    <div
      className={`p-3 rounded-lg border ${
        isWinner ? 'border-amber-300 bg-amber-50' : 'border-gray-100 bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            variant === 'A'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {variant}
        </span>
        {isWinner && <Trophy className="w-4 h-4 text-amber-500" />}
      </div>
      <p className="text-sm text-gray-700 font-medium truncate mb-3" title={subject}>
        {subject}
      </p>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <div className="text-gray-400">Sends</div>
          <div className="font-semibold text-gray-900">{stats.sends}</div>
        </div>
        <div>
          <div className="text-gray-400">Opens</div>
          <div className="font-semibold text-gray-900">{stats.openRate.toFixed(1)}%</div>
        </div>
        <div>
          <div className="text-gray-400">Replies</div>
          <div className="font-semibold text-gray-900">{stats.replyRate.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
}
