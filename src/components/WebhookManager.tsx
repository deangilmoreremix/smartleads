import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Webhook,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Send,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  testWebhook,
  getWebhookDeliveries,
  WEBHOOK_EVENT_DESCRIPTIONS,
  type WebhookConfig,
  type WebhookDelivery,
  type WebhookEventType,
} from '../services/webhook-service';

export default function WebhookManager() {
  const { user } = useAuth();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<Record<string, WebhookDelivery[]>>({});
  const [testing, setTesting] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: [] as string[],
    secret: '',
  });

  useEffect(() => {
    if (user) {
      loadWebhooks();
    }
  }, [user]);

  async function loadWebhooks() {
    try {
      const data = await getWebhooks(user!.id);
      setWebhooks(data);
    } catch (error) {
      console.error('Error loading webhooks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadDeliveries(webhookId: string) {
    try {
      const data = await getWebhookDeliveries(webhookId, 20);
      setDeliveries((prev) => ({ ...prev, [webhookId]: data }));
    } catch (error) {
      console.error('Error loading deliveries:', error);
    }
  }

  async function handleSubmit() {
    if (!formData.name || !formData.url) {
      toast.error('Name and URL are required');
      return;
    }

    if (formData.events.length === 0) {
      toast.error('Select at least one event');
      return;
    }

    try {
      if (editingId) {
        await updateWebhook(editingId, {
          name: formData.name,
          url: formData.url,
          events: formData.events,
          secret: formData.secret || null,
        });
        toast.success('Webhook updated');
      } else {
        await createWebhook(
          user!.id,
          formData.name,
          formData.url,
          formData.events,
          formData.secret
        );
        toast.success('Webhook created');
      }

      resetForm();
      loadWebhooks();
    } catch (error) {
      toast.error('Failed to save webhook');
    }
  }

  async function handleDelete(webhookId: string) {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    try {
      await deleteWebhook(webhookId);
      toast.success('Webhook deleted');
      loadWebhooks();
    } catch (error) {
      toast.error('Failed to delete webhook');
    }
  }

  async function handleTest(webhookId: string) {
    setTesting(webhookId);
    try {
      const result = await testWebhook(webhookId);
      if (result.success) {
        toast.success(`Test successful (${result.statusCode})`);
      } else {
        toast.error(result.error || 'Test failed');
      }
      loadDeliveries(webhookId);
    } catch (error) {
      toast.error('Test failed');
    } finally {
      setTesting(null);
    }
  }

  function resetForm() {
    setFormData({ name: '', url: '', events: [], secret: '' });
    setShowForm(false);
    setEditingId(null);
  }

  function startEdit(webhook: WebhookConfig) {
    setFormData({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      secret: webhook.secret || '',
    });
    setEditingId(webhook.id);
    setShowForm(true);
  }

  function toggleEvent(event: string) {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }));
  }

  function toggleExpanded(webhookId: string) {
    if (expandedId === webhookId) {
      setExpandedId(null);
    } else {
      setExpandedId(webhookId);
      if (!deliveries[webhookId]) {
        loadDeliveries(webhookId);
      }
    }
  }

  if (loading) {
    return <div className="animate-pulse h-32 bg-gray-100 rounded-xl" />;
  }

  const eventTypes = Object.keys(WEBHOOK_EVENT_DESCRIPTIONS) as WebhookEventType[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Webhook className="w-5 h-5 text-amber-600" />
          <h3 className="font-semibold text-gray-900">Webhooks</h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition"
        >
          <Plus className="w-4 h-4" />
          Add Webhook
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="My Webhook"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com/webhook"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Events</label>
            <div className="grid grid-cols-2 gap-2">
              {eventTypes.map((event) => (
                <label
                  key={event}
                  className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={formData.events.includes(event)}
                    onChange={() => toggleEvent(event)}
                    className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700">{event}</div>
                    <div className="text-xs text-gray-400">
                      {WEBHOOK_EVENT_DESCRIPTIONS[event]}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Secret (optional)
            </label>
            <input
              type="text"
              value={formData.secret}
              onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
              placeholder="Optional signing secret"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition"
            >
              {editingId ? 'Update' : 'Create'} Webhook
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {webhooks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Webhook className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No webhooks configured</p>
          <p className="text-xs text-gray-400 mt-1">
            Add webhooks to receive real-time notifications
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {webhooks.map((webhook) => (
            <div
              key={webhook.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{webhook.name}</h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          webhook.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {webhook.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <ExternalLink className="w-3 h-3" />
                      <span className="truncate max-w-xs">{webhook.url}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {webhook.events.map((event) => (
                        <span
                          key={event}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {event}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTest(webhook.id)}
                      disabled={testing === webhook.id}
                      className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => startEdit(webhook)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(webhook.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleExpanded(webhook.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                      {expandedId === webhook.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {expandedId === webhook.id && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Recent Deliveries</h5>
                  {deliveries[webhook.id]?.length === 0 ? (
                    <p className="text-sm text-gray-500">No deliveries yet</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {deliveries[webhook.id]?.map((delivery) => (
                        <div
                          key={delivery.id}
                          className="flex items-center gap-3 text-sm bg-white p-2 rounded-lg"
                        >
                          {delivery.status_code && delivery.status_code < 300 ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="font-medium">{delivery.event_type}</span>
                          <span className="text-gray-400">
                            {delivery.status_code || 'Error'}
                          </span>
                          <span className="text-gray-400 text-xs ml-auto">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {new Date(delivery.delivered_at).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
