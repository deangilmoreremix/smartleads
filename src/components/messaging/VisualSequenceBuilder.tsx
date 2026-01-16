import { useState, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Save,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Mail,
  Clock,
  Eye,
  Sparkles,
  Copy,
  Wand2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export interface SequenceStep {
  id: string;
  step_number: number;
  delay_days: number;
  delay_hours: number;
  subject: string;
  body: string;
  is_expanded: boolean;
}

interface VisualSequenceBuilderProps {
  campaignId: string;
  initialSteps?: SequenceStep[];
  onSequenceCreated?: () => void;
  onSequenceChange?: (steps: SequenceStep[]) => void;
  compact?: boolean;
}

const PERSONALIZATION_VARIABLES = [
  { key: '{{business_name}}', label: 'Business Name' },
  { key: '{{first_name}}', label: 'First Name' },
  { key: '{{email}}', label: 'Email' },
  { key: '{{website}}', label: 'Website' },
  { key: '{{phone}}', label: 'Phone' },
  { key: '{{city}}', label: 'City' },
  { key: '{{industry}}', label: 'Industry' },
];

function generateId(): string {
  return `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default function VisualSequenceBuilder({
  campaignId,
  initialSteps,
  onSequenceCreated,
  onSequenceChange,
  compact = false,
}: VisualSequenceBuilderProps) {
  const [steps, setSteps] = useState<SequenceStep[]>(
    initialSteps || [
      {
        id: generateId(),
        step_number: 1,
        delay_days: 0,
        delay_hours: 0,
        subject: '',
        body: '',
        is_expanded: true,
      },
    ]
  );
  const [isSaving, setIsSaving] = useState(false);
  const [draggedStep, setDraggedStep] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeVariableField, setActiveVariableField] = useState<{ stepId: string; field: 'subject' | 'body' } | null>(null);

  const updateSteps = useCallback((newSteps: SequenceStep[]) => {
    setSteps(newSteps);
    onSequenceChange?.(newSteps);
  }, [onSequenceChange]);

  const addStep = () => {
    const lastStep = steps[steps.length - 1];
    const newStep: SequenceStep = {
      id: generateId(),
      step_number: steps.length + 1,
      delay_days: 3,
      delay_hours: 0,
      subject: '',
      body: '',
      is_expanded: true,
    };
    const updatedSteps = steps.map(s => ({ ...s, is_expanded: false }));
    updateSteps([...updatedSteps, newStep]);
  };

  const removeStep = (stepId: string) => {
    if (steps.length === 1) {
      toast.error('You must have at least one step');
      return;
    }
    const updatedSteps = steps
      .filter((s) => s.id !== stepId)
      .map((s, idx) => ({ ...s, step_number: idx + 1 }));
    updateSteps(updatedSteps);
  };

  const duplicateStep = (stepId: string) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;

    const originalStep = steps[stepIndex];
    const newStep: SequenceStep = {
      ...originalStep,
      id: generateId(),
      step_number: stepIndex + 2,
      is_expanded: true,
    };

    const updatedSteps = [
      ...steps.slice(0, stepIndex + 1),
      newStep,
      ...steps.slice(stepIndex + 1).map(s => ({ ...s, step_number: s.step_number + 1 })),
    ];
    updateSteps(updatedSteps.map(s => s.id === newStep.id ? s : { ...s, is_expanded: false }));
    toast.success('Step duplicated');
  };

  const updateStep = (stepId: string, field: keyof SequenceStep, value: any) => {
    updateSteps(
      steps.map((s) =>
        s.id === stepId ? { ...s, [field]: value } : s
      )
    );
  };

  const toggleExpand = (stepId: string) => {
    updateSteps(
      steps.map((s) =>
        s.id === stepId ? { ...s, is_expanded: !s.is_expanded } : s
      )
    );
  };

  const insertVariable = (variable: string) => {
    if (!activeVariableField) return;

    const step = steps.find(s => s.id === activeVariableField.stepId);
    if (!step) return;

    const currentValue = step[activeVariableField.field];
    updateStep(activeVariableField.stepId, activeVariableField.field, currentValue + variable);
    setActiveVariableField(null);
  };

  const handleDragStart = (stepId: string) => {
    setDraggedStep(stepId);
  };

  const handleDragOver = (e: React.DragEvent, targetStepId: string) => {
    e.preventDefault();
    if (!draggedStep || draggedStep === targetStepId) return;

    const draggedIndex = steps.findIndex(s => s.id === draggedStep);
    const targetIndex = steps.findIndex(s => s.id === targetStepId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newSteps = [...steps];
    const [removed] = newSteps.splice(draggedIndex, 1);
    newSteps.splice(targetIndex, 0, removed);

    updateSteps(newSteps.map((s, idx) => ({ ...s, step_number: idx + 1 })));
  };

  const handleDragEnd = () => {
    setDraggedStep(null);
  };

  const generateAIContent = async (stepId: string) => {
    const step = steps.find(s => s.id === stepId);
    if (!step) return;

    toast.loading('Generating AI content...', { id: 'ai-generate' });

    const isFollowUp = step.step_number > 1;
    const sampleSubject = isFollowUp
      ? 'Following up on my previous email'
      : 'Quick question about {{business_name}}';
    const sampleBody = isFollowUp
      ? `Hi {{first_name}},\n\nI wanted to follow up on my previous message. I understand you're busy, but I believe this could be valuable for {{business_name}}.\n\nWould you have 15 minutes this week for a quick call?\n\nBest regards`
      : `Hi {{first_name}},\n\nI came across {{business_name}} and was impressed by what you're doing.\n\nI'm reaching out because I think we could help you [specific value proposition].\n\nWould you be open to a brief conversation?\n\nBest regards`;

    setTimeout(() => {
      updateStep(stepId, 'subject', step.subject || sampleSubject);
      updateStep(stepId, 'body', step.body || sampleBody);
      toast.success('AI content generated!', { id: 'ai-generate' });
    }, 1000);
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

  const getTotalDuration = () => {
    return steps.reduce((acc, step) => acc + step.delay_days, 0);
  };

  if (previewMode) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Sequence Preview</h3>
            <p className="text-sm text-gray-500">
              {steps.length} steps over {getTotalDuration()} days
            </p>
          </div>
          <button
            onClick={() => setPreviewMode(false)}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition"
          >
            Back to Edit
          </button>
        </div>

        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-400 to-orange-500"></div>

          <div className="space-y-6">
            {steps.map((step, index) => {
              const cumulativeDays = steps.slice(0, index).reduce((acc, s) => acc + s.delay_days, 0);
              return (
                <div key={step.id} className="relative pl-14">
                  <div className="absolute left-4 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-4 border-white shadow-md flex items-center justify-center">
                    <span className="text-[10px] text-white font-bold">{step.step_number}</span>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Clock className="w-4 h-4" />
                      {index === 0 ? 'Sent immediately' : `Day ${cumulativeDays}`}
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">{step.subject}</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-3">{step.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${compact ? 'p-4' : 'p-6'}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Email Sequence</h3>
          <p className="text-sm text-gray-500 mt-1">
            {steps.length} {steps.length === 1 ? 'step' : 'steps'} - {getTotalDuration()} days total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewMode(true)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={saveSequence}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-50 transition-all"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="relative mb-6">
        <div className="flex items-center justify-between px-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                  step.is_expanded
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.step_number}
              </div>
              <span className="text-xs text-gray-500 mt-1">
                {index === 0 ? 'Day 0' : `+${step.delay_days}d`}
              </span>
            </div>
          ))}
        </div>
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-gray-200 -z-10"></div>
      </div>

      <div className="space-y-4">
        {steps.map((step) => (
          <div
            key={step.id}
            draggable
            onDragStart={() => handleDragStart(step.id)}
            onDragOver={(e) => handleDragOver(e, step.id)}
            onDragEnd={handleDragEnd}
            className={`border rounded-xl transition-all ${
              draggedStep === step.id
                ? 'border-amber-400 bg-amber-50 opacity-50'
                : step.is_expanded
                ? 'border-amber-200 bg-amber-50/30'
                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
            }`}
          >
            <div
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => toggleExpand(step.id)}
            >
              <div className="flex items-center gap-3">
                <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                  <GripVertical className="w-5 h-5" />
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-semibold text-sm">
                  {step.step_number}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {step.step_number === 1 ? 'Initial Email' : `Follow-up ${step.step_number - 1}`}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {step.step_number === 1
                      ? 'Sent immediately'
                      : `${step.delay_days} day${step.delay_days !== 1 ? 's' : ''} after previous`}
                    {step.subject && ` - ${step.subject.substring(0, 30)}${step.subject.length > 30 ? '...' : ''}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {steps.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeStep(step.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateStep(step.id);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {step.is_expanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>

            {step.is_expanded && (
              <div className="px-4 pb-4 space-y-4">
                {step.step_number > 1 && (
                  <div className="flex items-center gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delay (days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={step.delay_days}
                        onChange={(e) =>
                          updateStep(step.id, 'delay_days', Math.max(1, parseInt(e.target.value) || 1))
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="w-24 px-3 py-2 border border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white"
                      />
                    </div>
                    <div className="flex-1 pt-6">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>
                          Will be sent {step.delay_days} day{step.delay_days !== 1 ? 's' : ''} after step {step.step_number - 1}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Subject Line
                    </label>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        generateAIContent(step.id);
                      }}
                      className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700"
                    >
                      <Wand2 className="w-3 h-3" />
                      Generate with AI
                    </button>
                  </div>
                  <input
                    type="text"
                    value={step.subject}
                    onChange={(e) => updateStep(step.id, 'subject', e.target.value)}
                    onFocus={() => setActiveVariableField({ stepId: step.id, field: 'subject' })}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="e.g., Quick question about {{business_name}}"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Body
                  </label>
                  <textarea
                    value={step.body}
                    onChange={(e) => updateStep(step.id, 'body', e.target.value)}
                    onFocus={() => setActiveVariableField({ stepId: step.id, field: 'body' })}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Write your email content here..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white resize-none"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-gray-500 mr-2">Insert variable:</span>
                  {PERSONALIZATION_VARIABLES.map((v) => (
                    <button
                      key={v.key}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveVariableField({ stepId: step.id, field: 'body' });
                        setTimeout(() => insertVariable(v.key), 0);
                      }}
                      className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition"
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addStep}
        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-amber-400 hover:text-amber-600 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Add Follow-up Step
      </button>

      <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Pro Tips</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>- Drag steps to reorder your sequence</li>
              <li>- Use personalization variables for higher response rates</li>
              <li>- Keep follow-ups short and add new value each time</li>
              <li>- 3-5 day delays typically work best between emails</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
