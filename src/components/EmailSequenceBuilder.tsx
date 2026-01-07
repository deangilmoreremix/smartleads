import { useState } from 'react';
import { Plus, Trash2, Save, Play } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface SequenceStep {
  step_number: number;
  delay_days: number;
  subject: string;
  body: string;
}

interface EmailSequenceBuilderProps {
  campaignId: string;
  onSequenceCreated?: () => void;
}

export default function EmailSequenceBuilder({
  campaignId,
  onSequenceCreated,
}: EmailSequenceBuilderProps) {
  const [steps, setSteps] = useState<SequenceStep[]>([
    {
      step_number: 1,
      delay_days: 0,
      subject: '',
      body: '',
    },
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const addStep = () => {
    const newStep: SequenceStep = {
      step_number: steps.length + 1,
      delay_days: 3,
      subject: '',
      body: '',
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (stepNumber: number) => {
    if (steps.length === 1) {
      toast.error('You must have at least one step');
      return;
    }
    const updatedSteps = steps
      .filter((s) => s.step_number !== stepNumber)
      .map((s, idx) => ({ ...s, step_number: idx + 1 }));
    setSteps(updatedSteps);
  };

  const updateStep = (stepNumber: number, field: keyof SequenceStep, value: any) => {
    setSteps(
      steps.map((s) =>
        s.step_number === stepNumber ? { ...s, [field]: value } : s
      )
    );
  };

  const saveSequence = async () => {
    const emptySteps = steps.filter((s) => !s.subject.trim() || !s.body.trim());
    if (emptySteps.length > 0) {
      toast.error('All steps must have a subject and body');
      return;
    }

    setIsSaving(true);
    try {
      const { error: deleteError } = await supabase
        .from('email_sequence_steps')
        .delete()
        .eq('campaign_id', campaignId);

      if (deleteError) throw deleteError;

      const stepsToInsert = steps.map((step) => ({
        campaign_id: campaignId,
        step_number: step.step_number,
        delay_days: step.delay_days,
        subject: step.subject,
        body: step.body,
        is_active: true,
      }));

      const { error: insertError } = await supabase
        .from('email_sequence_steps')
        .insert(stepsToInsert);

      if (insertError) throw insertError;

      toast.success('Email sequence saved successfully');
      onSequenceCreated?.();
    } catch (error) {
      console.error('Error saving sequence:', error);
      toast.error('Failed to save sequence');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-amber-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-stone-800">Email Sequence</h3>
          <p className="text-sm text-stone-600 mt-1">
            Create a multi-step follow-up sequence for this campaign
          </p>
        </div>
        <button
          onClick={saveSequence}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-50 transition-all"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Sequence'}
        </button>
      </div>

      <div className="space-y-6">
        {steps.map((step, index) => (
          <div
            key={step.step_number}
            className="border border-amber-200 rounded-lg p-4 bg-amber-50/50"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white flex items-center justify-center font-semibold">
                  {step.step_number}
                </div>
                <div>
                  <h4 className="font-medium text-stone-800">
                    Step {step.step_number}
                    {step.step_number === 1 ? ' (Initial Email)' : ' (Follow-up)'}
                  </h4>
                  <p className="text-sm text-stone-600">
                    {step.step_number === 1
                      ? 'Sent immediately'
                      : `Sent ${step.delay_days} days after step ${step.step_number - 1}`}
                  </p>
                </div>
              </div>
              {steps.length > 1 && (
                <button
                  onClick={() => removeStep(step.step_number)}
                  className="text-red-600 hover:text-red-700 p-2"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            {step.step_number > 1 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Delay (days after previous step)
                </label>
                <input
                  type="number"
                  min="1"
                  value={step.delay_days}
                  onChange={(e) =>
                    updateStep(step.step_number, 'delay_days', parseInt(e.target.value))
                  }
                  className="w-32 px-3 py-2 border border-amber-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white"
                />
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={step.subject}
                  onChange={(e) =>
                    updateStep(step.step_number, 'subject', e.target.value)
                  }
                  placeholder="e.g., Quick question about {{business_name}}"
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Email Body
                </label>
                <textarea
                  value={step.body}
                  onChange={(e) => updateStep(step.step_number, 'body', e.target.value)}
                  placeholder="Use {{business_name}}, {{first_name}}, {{website}}, etc."
                  rows={6}
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addStep}
        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-amber-300 text-stone-700 rounded-lg hover:border-orange-500 hover:text-orange-600 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Add Follow-up Step
      </button>

      <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <h4 className="text-sm font-medium text-stone-800 mb-2">
          Available Personalization Variables
        </h4>
        <div className="text-sm text-stone-700 space-y-1">
          <p>
            <code className="bg-amber-100 px-1 rounded text-orange-700">{'{{business_name}}'}</code> - Business
            name
          </p>
          <p>
            <code className="bg-amber-100 px-1 rounded text-orange-700">{'{{first_name}}'}</code> - Decision
            maker's first name
          </p>
          <p>
            <code className="bg-amber-100 px-1 rounded text-orange-700">{'{{email}}'}</code> - Lead's email
          </p>
          <p>
            <code className="bg-amber-100 px-1 rounded text-orange-700">{'{{website}}'}</code> - Business
            website
          </p>
          <p>
            <code className="bg-amber-100 px-1 rounded text-orange-700">{'{{phone}}'}</code> - Phone number
          </p>
        </div>
      </div>
    </div>
  );
}
