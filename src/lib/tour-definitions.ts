import type { TourStepData } from '../components/TourStep';

export const dashboardTourSteps: TourStepData[] = [
  {
    target: '[data-tour="start-campaign"]',
    title: 'Start a New Campaign',
    content: 'This is where you begin. Click here to create an AI-powered outreach campaign targeting businesses on Google Maps.',
    position: 'bottom',
    illustration: 'campaign-create',
    highlightWords: ['AI-powered', 'Google Maps'],
    proTip: 'Start with a specific niche like "restaurants in Brooklyn" for better results than broad searches.',
    shortcut: 'Press N'
  },
  {
    target: '[data-tour="autopilot"]',
    title: 'Autopilot Mode',
    content: 'Want hands-free lead generation? Autopilot runs 24/7 to scrape leads, generate AI emails, and send them automatically.',
    position: 'bottom',
    illustration: 'autopilot',
    highlightWords: ['hands-free', '24/7', 'automatically'],
    proTip: 'Enable autopilot after testing your campaign manually. This ensures your emails perform well before scaling.',
    samplePreview: 'campaign-result'
  },
  {
    target: '[data-tour="campaigns"]',
    title: 'View Your Campaigns',
    content: 'Track all your campaigns here. See stats like leads found, emails sent, opens, and replies in real-time.',
    position: 'bottom',
    illustration: 'analytics',
    highlightWords: ['real-time', 'opens', 'replies'],
    proTip: 'Check your campaigns daily during the first week. Reply rates above 5% indicate a winning message.',
    samplePreview: 'analytics-mini'
  },
  {
    target: '[data-tour="accounts"]',
    title: 'Connect Email Accounts',
    content: 'Connect your Gmail or email accounts to send personalized outreach. More accounts = higher sending capacity.',
    position: 'bottom',
    illustration: 'account-connect',
    highlightWords: ['Gmail', 'sending capacity'],
    proTip: 'Use 2-3 email accounts and rotate between them. This protects your sender reputation and improves deliverability.'
  },
  {
    target: '[data-tour="templates"]',
    title: 'Email Templates',
    content: 'Create and save email templates for different niches. Our AI can personalize them for each lead automatically.',
    position: 'bottom',
    illustration: 'template-edit',
    highlightWords: ['AI', 'personalize', 'automatically'],
    proTip: 'Keep subject lines under 50 characters and emails under 150 words. Short, punchy messages get more replies.',
    samplePreview: 'email-preview'
  }
];

export const campaignTourSteps: TourStepData[] = [
  {
    target: '[data-tour="ai-prompt"]',
    title: 'AI Campaign Builder',
    content: 'Describe your campaign in plain English. For example: "Email restaurant owners in NYC about my delivery service." Our AI understands and sets up everything.',
    position: 'bottom',
    illustration: 'campaign-create',
    highlightWords: ['plain English', 'AI understands'],
    proTip: 'Be specific about your target audience and value proposition. The more details you provide, the better the AI personalizes.'
  },
  {
    target: '[data-tour="example-prompts"]',
    title: 'Example Prompts',
    content: 'Not sure what to write? Click any of these examples to auto-fill your campaign setup. They cover common niches and use cases.',
    position: 'bottom',
    highlightWords: ['auto-fill', 'common niches'],
    proTip: 'Use examples as a starting point, then customize with your specific offer and location for better targeting.'
  },
  {
    target: '[data-tour="campaign-details"]',
    title: 'Campaign Details',
    content: 'Fine-tune your targeting here. Set your niche, location, and customize how many leads to find.',
    position: 'top',
    illustration: 'filter-search',
    highlightWords: ['niche', 'location', 'targeting'],
    proTip: 'Target 50-100 leads per campaign initially. This lets you test and iterate before scaling up.'
  },
  {
    target: '[data-tour="scraping-settings"]',
    title: 'Advanced Scraping Options',
    content: 'Control exactly what data to collect: reviews, social profiles, contact details, and more. More data = better personalization.',
    position: 'top',
    illustration: 'leads-scrape',
    highlightWords: ['reviews', 'social profiles', 'personalization'],
    proTip: 'Enable "Include Reviews" to let AI reference specific customer feedback in your emails. This dramatically increases reply rates.',
    samplePreview: 'lead-card'
  },
  {
    target: '[data-tour="email-template"]',
    title: 'Email Template',
    content: 'Write your email template or let AI generate one. Use variables like {{business_name}} for automatic personalization.',
    position: 'top',
    illustration: 'template-edit',
    highlightWords: ['AI generate', '{{business_name}}', 'automatic'],
    proTip: 'Always include a clear call-to-action. Ask a simple yes/no question to make replying easy.',
    samplePreview: 'email-preview'
  }
];

export const leadsTourSteps: TourStepData[] = [
  {
    target: '[data-tour="leads-filter"]',
    title: 'Filter Your Leads',
    content: 'Search by name, email, or status. Filter by campaign to see leads from specific outreach efforts.',
    position: 'bottom',
    illustration: 'filter-search',
    highlightWords: ['Search', 'Filter', 'campaign'],
    proTip: 'Use the "Replied" filter to quickly find hot leads who need follow-up within 24 hours.'
  },
  {
    target: '[data-tour="lead-row"]',
    title: 'Lead Information',
    content: 'Each row shows a lead with their business name, email, and current status. Click to see full details.',
    position: 'bottom',
    illustration: 'leads-scrape',
    highlightWords: ['business name', 'email', 'status'],
    samplePreview: 'lead-card'
  },
  {
    target: '[data-tour="lead-status"]',
    title: 'Lead Status',
    content: 'Track where each lead is in your pipeline: New, Contacted, Opened, Replied, or Converted.',
    position: 'left',
    illustration: 'analytics',
    highlightWords: ['New', 'Contacted', 'Opened', 'Replied', 'Converted'],
    proTip: 'Focus on leads who opened but did not reply. A well-timed follow-up can double your response rate.'
  },
  {
    target: '[data-tour="lead-actions"]',
    title: 'Quick Actions',
    content: 'Send emails, view lead details, or remove leads directly from this menu.',
    position: 'left',
    highlightWords: ['Send emails', 'view', 'remove'],
    proTip: 'Before removing a lead, check if they might be relevant for a different campaign or offer.'
  }
];

export const templatesTourSteps: TourStepData[] = [
  {
    target: '[data-tour="create-template"]',
    title: 'Create New Template',
    content: 'Click here to create a new email template. Choose between AI-generated or manual templates.',
    position: 'bottom',
    illustration: 'template-edit',
    highlightWords: ['AI-generated', 'manual'],
    proTip: 'Create separate templates for different niches. A template for restaurants should differ from one for gyms.'
  },
  {
    target: '[data-tour="template-card"]',
    title: 'Your Templates',
    content: 'Each card shows a template with its name and preview. Click to edit or use in a campaign.',
    position: 'bottom',
    samplePreview: 'email-preview',
    highlightWords: ['preview', 'edit', 'campaign']
  },
  {
    target: '[data-tour="template-actions"]',
    title: 'Template Actions',
    content: 'Edit, duplicate, or delete templates. Duplicating is great for A/B testing variations.',
    position: 'left',
    highlightWords: ['duplicate', 'A/B testing'],
    proTip: 'Always A/B test subject lines first. A winning subject line can improve open rates by 50% or more.'
  }
];

export const accountsTourSteps: TourStepData[] = [
  {
    target: '[data-tour="connect-account"]',
    title: 'Connect Email Account',
    content: 'Link your Gmail or email provider to start sending. We use OAuth for secure access - we never store your password.',
    position: 'bottom',
    illustration: 'account-connect',
    highlightWords: ['Gmail', 'OAuth', 'secure'],
    proTip: 'Use a dedicated email address for outreach, not your personal inbox. This keeps your main email safe.'
  },
  {
    target: '[data-tour="account-card"]',
    title: 'Connected Accounts',
    content: 'View all your connected email accounts here. Each shows its daily limit and health status.',
    position: 'bottom',
    illustration: 'email-send',
    highlightWords: ['daily limit', 'health status'],
    proTip: 'Green health status means great deliverability. Yellow means slow down. Red requires immediate attention.'
  },
  {
    target: '[data-tour="daily-limit"]',
    title: 'Daily Sending Limit',
    content: 'Protect your email reputation with sending limits. Start low (20-30/day) and increase gradually.',
    position: 'left',
    highlightWords: ['20-30/day', 'gradually'],
    proTip: 'Increase your daily limit by 10% each week. Sudden spikes in volume trigger spam filters.'
  }
];

export const autopilotTourSteps: TourStepData[] = [
  {
    target: '[data-tour="autopilot-toggle"]',
    title: 'Enable Autopilot',
    content: 'Turn on autopilot to run your outreach automatically. The system will scrape, generate, and send on schedule.',
    position: 'bottom',
    illustration: 'autopilot',
    highlightWords: ['automatically', 'schedule'],
    proTip: 'Test your campaign manually for at least 20 leads before enabling autopilot. Make sure your emails perform first.'
  },
  {
    target: '[data-tour="autopilot-schedule"]',
    title: 'Schedule Settings',
    content: 'Set when autopilot should run. Choose days of the week and time windows that work best for your targets.',
    position: 'bottom',
    illustration: 'schedule',
    highlightWords: ['days', 'time windows', 'targets'],
    proTip: 'Send B2B emails Tuesday-Thursday, 9-11 AM in your target timezone. Avoid Mondays and Fridays.'
  },
  {
    target: '[data-tour="autopilot-limits"]',
    title: 'Daily Limits',
    content: 'Control how many leads to scrape and emails to send per day. This protects your account reputation.',
    position: 'bottom',
    highlightWords: ['leads to scrape', 'emails to send', 'reputation'],
    proTip: 'Balance lead quality vs. quantity. Scraping 30 highly-targeted leads beats 100 random ones.',
    samplePreview: 'analytics-mini'
  },
  {
    target: '[data-tour="autopilot-status"]',
    title: 'Status Monitor',
    content: 'See real-time status of your autopilot: what is running, what is queued, and any errors that need attention.',
    position: 'top',
    illustration: 'analytics',
    highlightWords: ['real-time', 'running', 'queued', 'errors'],
    proTip: 'Check the status monitor daily. Address errors within 24 hours to maintain consistent outreach.',
    samplePreview: 'campaign-result'
  }
];

export const tourDefinitions = {
  dashboard: dashboardTourSteps,
  campaign: campaignTourSteps,
  leads: leadsTourSteps,
  templates: templatesTourSteps,
  accounts: accountsTourSteps,
  autopilot: autopilotTourSteps
};
