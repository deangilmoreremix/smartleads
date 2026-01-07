import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Mail, Edit2, Trash2, Copy, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Database } from '../types/database';

type EmailTemplate = Database['public']['Tables']['email_templates']['Row'];

export default function TemplatesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTemplates();
    }
  }, [user]);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      toast.success('Template deleted successfully');
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleDuplicateTemplate = async (template: EmailTemplate) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .insert({
          user_id: user!.id,
          name: `${template.name} (Copy)`,
          subject: template.subject,
          body: template.body
        });

      if (error) throw error;

      toast.success('Template duplicated successfully');
      loadTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast.error('Failed to duplicate template');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-amber-50/30 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-stone-800 mb-2">Email Templates</h1>
            <p className="text-stone-600">Create and manage email templates for your campaigns</p>
          </div>
          <button
            onClick={() => navigate('/dashboard/templates/new')}
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>New Template</span>
          </button>
        </div>

        {templates.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-amber-200">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-2">No templates yet</h3>
            <p className="text-stone-600 mb-6 max-w-md mx-auto">
              Create your first email template to use in your outreach campaigns
            </p>
            <button
              onClick={() => navigate('/dashboard/templates/new')}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Create Template</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-amber-200 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-stone-800">{template.name}</h3>
                        {template.template_type === 'ai' && (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-medium rounded-full">
                            AI
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-stone-500">
                        {template.template_type === 'ai'
                          ? 'AI-generated personalized emails'
                          : `Subject: ${template.subject}`
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="bg-amber-50 rounded-lg p-4 text-sm text-stone-700 line-clamp-4">
                    {template.template_type === 'ai'
                      ? template.ai_prompt || 'AI prompt not available'
                      : template.body
                    }
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-4 border-t border-amber-100">
                  <button
                    onClick={() => handleDuplicateTemplate(template)}
                    className="flex items-center space-x-1 text-stone-600 hover:text-orange-600 px-3 py-2 rounded-lg hover:bg-amber-50 transition text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Duplicate</span>
                  </button>
                  <button
                    className="flex items-center space-x-1 text-stone-600 hover:text-green-600 px-3 py-2 rounded-lg hover:bg-green-50 transition text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="flex items-center space-x-1 text-stone-600 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition text-sm ml-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-amber-50 rounded-xl p-6 border border-amber-200">
          <div className="flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-stone-800 mb-2">Template Variables</h3>
              <p className="text-sm text-stone-700 mb-3">
                Use these variables in your templates for personalization:
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <code className="bg-white px-3 py-1 rounded text-orange-700 font-mono border border-amber-200">
                  {'{business_name}'}
                </code>
                <code className="bg-white px-3 py-1 rounded text-orange-700 font-mono border border-amber-200">
                  {'{owner_name}'}
                </code>
                <code className="bg-white px-3 py-1 rounded text-orange-700 font-mono border border-amber-200">
                  {'{location}'}
                </code>
                <code className="bg-white px-3 py-1 rounded text-orange-700 font-mono border border-amber-200">
                  {'{phone}'}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
