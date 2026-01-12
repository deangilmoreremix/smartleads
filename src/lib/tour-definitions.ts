import type { TourStepData } from '../components/TourStep';

export const dashboardTourSteps: TourStepData[] = [
  {
    target: '[data-tour="start-campaign"]',
    title: 'Start a New Campaign',
    content: 'This is where you begin. Click here to create an AI-powered outreach campaign targeting businesses on Google Maps.',
    position: 'bottom'
  },
  {
    target: '[data-tour="autopilot"]',
    title: 'Autopilot Mode',
    content: 'Want hands-free lead generation? Autopilot runs 24/7 to scrape leads, generate AI emails, and send them automatically.',
    position: 'bottom'
  },
  {
    target: '[data-tour="campaigns"]',
    title: 'View Your Campaigns',
    content: 'Track all your campaigns here. See stats like leads found, emails sent, opens, and replies in real-time.',
    position: 'bottom'
  },
  {
    target: '[data-tour="accounts"]',
    title: 'Connect Email Accounts',
    content: 'Connect your Gmail or email accounts to send personalized outreach. More accounts = higher sending capacity.',
    position: 'bottom'
  },
  {
    target: '[data-tour="templates"]',
    title: 'Email Templates',
    content: 'Create and save email templates for different niches. Our AI can personalize them for each lead automatically.',
    position: 'bottom'
  }
];

export const campaignTourSteps: TourStepData[] = [
  {
    target: '[data-tour="ai-prompt"]',
    title: 'AI Campaign Builder',
    content: 'Describe your campaign in plain English. For example: "Email restaurant owners in NYC about my delivery service." Our AI understands and sets up everything.',
    position: 'bottom'
  },
  {
    target: '[data-tour="example-prompts"]',
    title: 'Example Prompts',
    content: 'Not sure what to write? Click any of these examples to auto-fill your campaign setup. They cover common niches and use cases.',
    position: 'bottom'
  },
  {
    target: '[data-tour="campaign-details"]',
    title: 'Campaign Details',
    content: 'Fine-tune your targeting here. Set your niche, location, and customize how many leads to find.',
    position: 'top'
  },
  {
    target: '[data-tour="scraping-settings"]',
    title: 'Advanced Scraping Options',
    content: 'Control exactly what data to collect: reviews, social profiles, contact details, and more. More data = better personalization.',
    position: 'top'
  },
  {
    target: '[data-tour="email-template"]',
    title: 'Email Template',
    content: 'Write your email template or let AI generate one. Use variables like {{business_name}} for automatic personalization.',
    position: 'top'
  }
];

export const leadsTourSteps: TourStepData[] = [
  {
    target: '[data-tour="leads-filter"]',
    title: 'Filter Your Leads',
    content: 'Search by name, email, or status. Filter by campaign to see leads from specific outreach efforts.',
    position: 'bottom'
  },
  {
    target: '[data-tour="lead-row"]',
    title: 'Lead Information',
    content: 'Each row shows a lead with their business name, email, and current status. Click to see full details.',
    position: 'bottom'
  },
  {
    target: '[data-tour="lead-status"]',
    title: 'Lead Status',
    content: 'Track where each lead is in your pipeline: New, Contacted, Opened, Replied, or Converted.',
    position: 'left'
  },
  {
    target: '[data-tour="lead-actions"]',
    title: 'Quick Actions',
    content: 'Send emails, view lead details, or remove leads directly from this menu.',
    position: 'left'
  }
];

export const templatesTourSteps: TourStepData[] = [
  {
    target: '[data-tour="create-template"]',
    title: 'Create New Template',
    content: 'Click here to create a new email template. Choose between AI-generated or manual templates.',
    position: 'bottom'
  },
  {
    target: '[data-tour="template-card"]',
    title: 'Your Templates',
    content: 'Each card shows a template with its name and preview. Click to edit or use in a campaign.',
    position: 'bottom'
  },
  {
    target: '[data-tour="template-actions"]',
    title: 'Template Actions',
    content: 'Edit, duplicate, or delete templates. Duplicating is great for A/B testing variations.',
    position: 'left'
  }
];

export const accountsTourSteps: TourStepData[] = [
  {
    target: '[data-tour="connect-account"]',
    title: 'Connect Email Account',
    content: 'Link your Gmail or email provider to start sending. We use OAuth for secure access - we never store your password.',
    position: 'bottom'
  },
  {
    target: '[data-tour="account-card"]',
    title: 'Connected Accounts',
    content: 'View all your connected email accounts here. Each shows its daily limit and health status.',
    position: 'bottom'
  },
  {
    target: '[data-tour="daily-limit"]',
    title: 'Daily Sending Limit',
    content: 'Protect your email reputation with sending limits. Start low (20-30/day) and increase gradually.',
    position: 'left'
  }
];

export const autopilotTourSteps: TourStepData[] = [
  {
    target: '[data-tour="autopilot-toggle"]',
    title: 'Enable Autopilot',
    content: 'Turn on autopilot to run your outreach automatically. The system will scrape, generate, and send on schedule.',
    position: 'bottom'
  },
  {
    target: '[data-tour="autopilot-schedule"]',
    title: 'Schedule Settings',
    content: 'Set when autopilot should run. Choose days of the week and time windows that work best for your targets.',
    position: 'bottom'
  },
  {
    target: '[data-tour="autopilot-limits"]',
    title: 'Daily Limits',
    content: 'Control how many leads to scrape and emails to send per day. This protects your account reputation.',
    position: 'bottom'
  },
  {
    target: '[data-tour="autopilot-status"]',
    title: 'Status Monitor',
    content: 'See real-time status of your autopilot: what\'s running, what\'s queued, and any errors that need attention.',
    position: 'top'
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
