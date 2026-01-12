import { Building2, Mail, Star, MapPin, Phone, ExternalLink } from 'lucide-react';

type PreviewType = 'lead-card' | 'email-preview' | 'analytics-mini' | 'campaign-result';

interface SampleDataPreviewProps {
  type: PreviewType;
  className?: string;
}

export default function SampleDataPreview({ type, className = '' }: SampleDataPreviewProps) {
  const previews: Record<PreviewType, JSX.Element> = {
    'lead-card': <LeadCardPreview />,
    'email-preview': <EmailPreviewSample />,
    'analytics-mini': <AnalyticsMiniPreview />,
    'campaign-result': <CampaignResultPreview />
  };

  return (
    <div className={`rounded-lg overflow-hidden ${className}`}>
      {previews[type]}
    </div>
  );
}

function LeadCardPreview() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm truncate">Bella Italia Restaurant</h4>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
            <MapPin className="w-3 h-3" />
            <span>New York, NY</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">(127 reviews)</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-3 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Mail className="w-3 h-3" />
          <span>info@bella...</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Phone className="w-3 h-3" />
          <span>(212) 555...</span>
        </div>
      </div>
    </div>
  );
}

function EmailPreviewSample() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs text-gray-600">Preview</span>
        </div>
      </div>
      <div className="p-3 text-sm">
        <p className="text-gray-600 leading-relaxed">
          Hi <span className="bg-yellow-100 text-yellow-800 px-1 rounded font-medium">Marco</span>,
        </p>
        <p className="text-gray-600 mt-2 leading-relaxed">
          I noticed <span className="bg-yellow-100 text-yellow-800 px-1 rounded font-medium">Bella Italia</span> has
          excellent reviews on Google Maps. Your customers love the
          <span className="bg-yellow-100 text-yellow-800 px-1 rounded font-medium">authentic pasta</span>!
        </p>
        <p className="text-gray-400 mt-2 text-xs italic">...personalized with AI</p>
      </div>
    </div>
  );
}

function AnalyticsMiniPreview() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">247</div>
          <div className="text-xs text-gray-500">Leads Found</div>
          <div className="w-full h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
            <div className="h-full w-3/4 bg-yellow-400 rounded-full" />
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">68%</div>
          <div className="text-xs text-gray-500">Open Rate</div>
          <div className="w-full h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
            <div className="h-full w-2/3 bg-green-500 rounded-full" />
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-600">12%</div>
          <div className="text-xs text-gray-500">Reply Rate</div>
          <div className="w-full h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
            <div className="h-full w-1/3 bg-orange-500 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CampaignResultPreview() {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-green-800">Campaign Active</span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">Leads scraped</span>
          <span className="font-medium text-gray-900">50/100</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">Emails generated</span>
          <span className="font-medium text-gray-900">48</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">In queue</span>
          <span className="font-medium text-gray-900">48</span>
        </div>
      </div>
      <a href="#" className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 mt-2">
        <span>View details</span>
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}
