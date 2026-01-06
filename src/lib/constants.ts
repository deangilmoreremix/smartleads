export const ITEMS_PER_PAGE = 20;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const CAMPAIGN_STATUSES = ['draft', 'active', 'paused', 'completed'] as const;

export const LEAD_STATUSES = ['new', 'contacted', 'replied', 'converted', 'bounced'] as const;

export const EMAIL_TYPES = ['personal', 'generic', 'unknown'] as const;

export const PLAN_TYPES = ['free', 'starter', 'professional', 'enterprise'] as const;

export const MAX_CAMPAIGN_NAME_LENGTH = 100;

export const MAX_EMAIL_TEMPLATE_LENGTH = 5000;

export const MIN_PASSWORD_LENGTH = 6;

export const DEBOUNCE_DELAY = 300;

export const TOAST_DURATION = 3000;

export const POPULAR_NICHES = [
  'Restaurants',
  'Gyms & Fitness Centers',
  'Dental Clinics',
  'Real Estate Agencies',
  'Auto Repair Shops',
  'Hair Salons',
  'Coffee Shops',
  'Hotels',
  'Retail Stores',
  'Medical Practices',
  'Law Firms',
  'Accounting Firms',
  'Marketing Agencies',
  'Construction Companies',
  'Plumbing Services'
];

export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  AUTH_FAILED: 'Authentication failed. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_FAILED: 'Please check your input and try again.',
  EMAIL_EXISTS: 'An account with this email already exists.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  WEAK_PASSWORD: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
  CREDITS_EXHAUSTED: 'You have run out of credits. Please upgrade your plan.',
  RATE_LIMIT: 'Too many requests. Please slow down.'
};
