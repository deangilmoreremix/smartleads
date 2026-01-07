import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  GripVertical,
  Star,
  Mail,
  Phone,
  Globe,
  MoreVertical,
  ChevronRight,
  Users,
  Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import LeadQualityBadge from './LeadQualityBadge';
import LoadingSpinner from './LoadingSpinner';

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  position: number;
}

interface Lead {
  id: string;
  business_name: string;
  email: string;
  pipeline_stage: string;
  quality_score: number;
  rating: number | null;
  review_count: number;
  website: string | null;
  phone: string | null;
}

interface Props {
  campaignId: string;
  onLeadClick?: (leadId: string) => void;
}

export default function LeadPipelineKanban({ campaignId, onLeadClick }: Props) {
  const { user } = useAuth();
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [leadsByStage, setLeadsByStage] = useState<Record<string, Lead[]>>({});
  const [loading, setLoading] = useState(true);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, campaignId]);

  async function loadData() {
    try {
      const [stagesResult, leadsResult] = await Promise.all([
        supabase
          .from('lead_pipeline_stages')
          .select('*')
          .eq('user_id', user!.id)
          .order('position', { ascending: true }),
        supabase
          .from('leads')
          .select('id, business_name, email, pipeline_stage, quality_score, rating, review_count, website, phone')
          .eq('campaign_id', campaignId)
          .order('quality_score', { ascending: false }),
      ]);

      if (stagesResult.data) {
        setStages(stagesResult.data);
      }

      if (leadsResult.data) {
        const grouped: Record<string, Lead[]> = {};
        for (const lead of leadsResult.data) {
          const stage = lead.pipeline_stage || 'new';
          if (!grouped[stage]) grouped[stage] = [];
          grouped[stage].push(lead);
        }
        setLeadsByStage(grouped);
      }
    } catch (error) {
      console.error('Error loading pipeline data:', error);
      toast.error('Failed to load pipeline');
    } finally {
      setLoading(false);
    }
  }

  async function handleDrop(stageName: string) {
    if (!draggedLead || draggedLead.pipeline_stage === stageName) {
      setDraggedLead(null);
      setDragOverStage(null);
      return;
    }

    const oldStage = draggedLead.pipeline_stage || 'new';

    setLeadsByStage((prev) => {
      const newState = { ...prev };
      newState[oldStage] = (newState[oldStage] || []).filter((l) => l.id !== draggedLead.id);
      newState[stageName] = [...(newState[stageName] || []), { ...draggedLead, pipeline_stage: stageName }];
      return newState;
    });

    try {
      const { error } = await supabase
        .from('leads')
        .update({
          pipeline_stage: stageName,
          pipeline_stage_changed_at: new Date().toISOString(),
        })
        .eq('id', draggedLead.id);

      if (error) throw error;
      toast.success(`Moved to ${stageName}`);
    } catch (error) {
      console.error('Error moving lead:', error);
      toast.error('Failed to move lead');
      loadData();
    }

    setDraggedLead(null);
    setDragOverStage(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner message="Loading pipeline..." />
      </div>
    );
  }

  const defaultStages = [
    { name: 'new', color: '#6B7280' },
    { name: 'qualified', color: '#3B82F6' },
    { name: 'contacted', color: '#F59E0B' },
    { name: 'replied', color: '#10B981' },
    { name: 'meeting_scheduled', color: '#8B5CF6' },
    { name: 'converted', color: '#059669' },
  ];

  const displayStages = stages.length > 0
    ? stages
    : defaultStages.map((s, i) => ({ id: s.name, name: s.name, color: s.color, position: i }));

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {displayStages.map((stage) => {
          const stageLeads = leadsByStage[stage.name.toLowerCase()] || [];
          const isOver = dragOverStage === stage.name;

          return (
            <div
              key={stage.id}
              className={`w-72 flex-shrink-0 bg-gray-50 rounded-xl border-2 transition-all ${
                isOver ? 'border-amber-400 bg-amber-50' : 'border-transparent'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverStage(stage.name);
              }}
              onDragLeave={() => setDragOverStage(null)}
              onDrop={() => handleDrop(stage.name)}
            >
              <div className="p-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <h3 className="font-semibold text-gray-900 capitalize">
                      {stage.name.replace('_', ' ')}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
                    {stageLeads.length}
                  </span>
                </div>
              </div>

              <div className="p-2 space-y-2 max-h-[600px] overflow-y-auto">
                {stageLeads.length === 0 ? (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    No leads in this stage
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={() => setDraggedLead(lead)}
                      onDragEnd={() => {
                        setDraggedLead(null);
                        setDragOverStage(null);
                      }}
                      onClick={() => onLeadClick?.(lead.id)}
                      className={`bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
                        draggedLead?.id === lead.id ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-300" />
                          <h4 className="font-medium text-gray-900 text-sm truncate max-w-[180px]">
                            {lead.business_name}
                          </h4>
                        </div>
                        <LeadQualityBadge score={lead.quality_score || 0} size="sm" />
                      </div>

                      <div className="space-y-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{lead.email}</span>
                        </div>

                        {lead.rating && (
                          <div className="flex items-center gap-1.5">
                            <Star className="w-3 h-3 text-amber-500" />
                            <span>{lead.rating} ({lead.review_count} reviews)</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-2">
                          {lead.website && (
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                              Website
                            </span>
                          )}
                          {lead.phone && (
                            <span className="px-1.5 py-0.5 bg-green-50 text-green-600 rounded text-xs">
                              Phone
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
