import { useState, useEffect, useCallback } from 'react';
import { X, Send, Wand2, Mail, MessageSquare, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createOrGetConversation, sendMessage } from '../services/messaging-service';
import toast from 'react-hot-toast';

interface QuickMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: {
    id: string;
    business_name: string;
    email: string;
    decision_maker_name?: string | null;
  };
  onMessageSent?: () => void;
}

const QUICK_TEMPLATES = [
  {
    name: 'Introduction',
    subject: 'Quick question about {{business_name}}',
    body: `Hi {{first_name}},

I came across {{business_name}} and was impressed by what you've built.

I'd love to connect and share some ideas that might be valuable for your business.

Would you have 15 minutes for a quick call this week?

Best regards`,
  },
  {
    name: 'Follow-up',
    subject: 'Following up on my previous message',
    body: `Hi {{first_name}},

I wanted to follow up on my previous email. I understand you're busy, but I believe this could be valuable for {{business_name}}.

Happy to adjust to your schedule - would a quick call work for you?

Best regards`,
  },
  {
    name: 'Value Proposition',
    subject: 'Idea to help {{business_name}} grow',
    body: `Hi {{first_name}},

I've been researching {{business_name}} and noticed a few opportunities that could help you grow.

I've helped similar businesses achieve great results. Would you be open to hearing how?

Best regards`,
  },
];

export default function QuickMessageModal({
  isOpen,
  onClose,
  lead,
  onMessageSent,
}: QuickMessageModalProps) {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  const firstName = lead.decision_maker_name?.split(' ')[0] || 'there';

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const emailValid = isValidEmail(lead.email);

  useEffect(() => {
    if (isOpen) {
      setSubject('');
      setBody('');
      setSelectedTemplate(null);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (!sending) {
      onClose();
    }
  }, [sending, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const applyTemplate = (index: number) => {
    const template = QUICK_TEMPLATES[index];
    setSubject(
      template.subject
        .replace(/\{\{business_name\}\}/g, lead.business_name)
        .replace(/\{\{first_name\}\}/g, firstName)
    );
    setBody(
      template.body
        .replace(/\{\{business_name\}\}/g, lead.business_name)
        .replace(/\{\{first_name\}\}/g, firstName)
    );
    setSelectedTemplate(index);
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim() || !user || !emailValid) {
      if (!emailValid) {
        toast.error('Invalid email address');
      }
      return;
    }

    setSending(true);
    try {
      const conversation = await createOrGetConversation(user.id, {
        name: lead.decision_maker_name || lead.business_name,
        email: lead.email,
        company: lead.business_name,
      });

      await sendMessage(user.id, conversation.id, conversation.contact_id, {
        type: 'email',
        subject,
        body,
      });

      toast.success('Message queued for sending!');
      onMessageSent?.();
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Quick Message</h2>
              <p className="text-sm text-gray-500">Send to {lead.business_name}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={sending}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Templates
            </label>
            <div className="flex flex-wrap gap-2">
              {QUICK_TEMPLATES.map((template, index) => (
                <button
                  key={index}
                  onClick={() => applyTemplate(index)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedTemplate === index
                      ? 'bg-amber-100 text-amber-700 border border-amber-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              To
            </label>
            <div className={`px-4 py-3 rounded-xl border ${
              emailValid
                ? 'bg-gray-50 text-gray-700 border-gray-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  {lead.decision_maker_name && (
                    <span className="font-medium">{lead.decision_maker_name} - </span>
                  )}
                  {lead.email}
                </div>
                {!emailValid && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Invalid email</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message..."
              rows={8}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition resize-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Wand2 className="w-4 h-4" />
              <span>Use templates for quick personalized messages</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                disabled={sending}
                className="px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!subject.trim() || !body.trim() || sending || !emailValid}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Send className="w-4 h-4" />
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
