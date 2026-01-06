# Lead Generation & Email Outreach Platform

A production-ready SaaS application for automated lead generation, contact enrichment, and email outreach campaigns. Built with React, TypeScript, Supabase, and Apify's Google Maps Scraper API.

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Complete Feature Guide](#complete-feature-guide)
- [Configuration](#configuration)
- [Database Schema](#database-schema)
- [API Integration](#api-integration)
- [Advanced Features](#advanced-features)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [Cost Management](#cost-management)
- [Development](#development)

## 🎯 Overview

This platform enables businesses and agencies to:
- **Find leads** from Google Maps using advanced search criteria
- **Enrich data** with real emails, social profiles, and employee contacts
- **Generate personalized emails** using AI
- **Automate outreach campaigns** with scheduling and tracking
- **Analyze performance** with detailed analytics and reporting

Perfect for agencies, solopreneurs, and sales teams targeting local businesses.

## ✨ Key Features

### 🔍 Lead Generation
- **Google Maps Scraping** - Extract business data from any location/niche
- **Advanced Filtering** - Rating (2-4.5 stars), website presence, open/closed status
- **Location Precision** - Target by country, state, county, city, or postal code
- **Category Filtering** - 4,000+ business categories supported
- **Bulk Scraping** - Up to 500 results per campaign

### 📧 Contact Enrichment (Premium)
- **Real Email Extraction** - Scrapes actual emails from business websites ($2/1,000)
- **Social Media Profiles** - Facebook, Instagram, YouTube, TikTok, Twitter with metrics
- **Employee Lead Generation** - Extract decision-makers with titles, emails, LinkedIn
- **Department Targeting** - Filter by C-Suite, Sales, Marketing, IT, HR, Finance
- **Phone Validation** - Verify and format phone numbers

### 💬 Review & Image Data
- **Customer Reviews** - Extract reviews with ratings, text, dates, and owner responses
- **Review Analytics** - Rating distribution, sentiment analysis
- **Business Images** - Photos with categories and author attribution
- **Q&A Data** - Questions and answers from Google Maps
- **Opening Hours** - Full weekly schedules and popular times

### 📨 Email Campaigns
- **AI Email Generation** - Personalized emails using business context
- **Custom Templates** - Create reusable templates with variables
- **Variable Support** - {firstName}, {businessName}, {location}, {industry}
- **Bulk Sending** - Send to hundreds of leads simultaneously
- **Email Tracking** - Opens, clicks, and replies (coming soon)

### 🤖 Automation
- **Automated Workflows** - Scrape → Enrich → Generate → Send pipeline
- **Job Queue System** - Background processing for large campaigns
- **Progress Tracking** - Real-time status updates and progress bars
- **Scheduled Sending** - Set specific times/days for email delivery
- **Daily Limits** - Prevent spam with customizable send limits

### 📊 Analytics & Reporting
- **Campaign Performance** - Track leads, emails sent, open rates
- **Lead Statistics** - Email types (personal vs. business), verification status
- **Job History** - View all automation jobs with results and errors
- **Export Data** - Download leads and contacts as CSV (coming soon)

### 👤 User Management
- **Email/Password Authentication** - Secure Supabase Auth
- **User Profiles** - Store business info and preferences
- **Password Reset** - Email-based password recovery
- **Session Management** - Automatic token refresh

### 🎨 User Interface
- **Modern Design** - Beautiful dark theme with gradient accents
- **Responsive Layout** - Works on mobile, tablet, and desktop
- **Real-time Updates** - Live progress indicators and notifications
- **Error Handling** - Helpful error messages and recovery options
- **Loading States** - Skeleton loaders and spinners

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library with hooks
- **TypeScript** - Type-safe development
- **React Router v7** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **React Hot Toast** - Notifications

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database with RLS
  - Authentication & user management
  - Edge Functions (Deno runtime)
  - Realtime subscriptions
- **Apify API** - Google Maps scraping
- **Deno** - Edge function runtime

### Build Tools
- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS compatibility

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available)
- Apify account (free tier: $5/month credit)

### 1. Clone and Install

```bash
git clone <repository-url>
cd <project-directory>
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase project settings.

### 3. Database Setup

The database schema is already created via migrations in `supabase/migrations/`:

- `20251223161930_create_initial_schema.sql` - Core tables
- `20251223163819_add_automation_features.sql` - Automation & jobs
- `20251224024319_add_apify_advanced_features.sql` - Enrichment tables

These migrations run automatically when you set up your Supabase project.

### 4. Configure Apify API

1. Sign up at [apify.com](https://apify.com)
2. Get your API token from Settings → Integrations
3. Add to Supabase Edge Function secrets:
   - Go to Supabase Dashboard → Edge Functions → Secrets
   - Add secret: `APIFY_API_TOKEN=your_token_here`

**See [APIFY_SETUP.md](APIFY_SETUP.md) for detailed setup instructions.**

### 5. Deploy Edge Functions

The project includes 3 edge functions:

```bash
# Deploy all functions
npx supabase functions deploy scrape-google-maps
npx supabase functions deploy generate-ai-emails
npx supabase functions deploy send-emails
```

Or use the Supabase CLI if installed locally.

### 6. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### 7. Build for Production

```bash
npm run build
npm run preview  # Test production build locally
```

## 📖 Complete Feature Guide

### User Authentication

#### Sign Up
1. Navigate to `/signup`
2. Enter email and password (min 6 characters)
3. Account created instantly (no email confirmation required)
4. Automatically redirected to dashboard

#### Login
1. Navigate to `/login`
2. Enter credentials
3. Redirected to dashboard on success

#### Password Reset
1. Click "Forgot Password?" on login page
2. Enter your email address
3. Check email for reset link
4. Set new password

#### Logout
- Click user icon in top-right corner
- Select "Logout" from dropdown

### Creating Campaigns

#### Method 1: AI-Powered Campaign Generator

1. Go to **Dashboard → New Campaign**
2. In the AI prompt field, describe your goal:
   ```
   Example: "Email restaurant owners in Los Angeles about delivery optimization software"
   ```
3. Click the magic wand icon or press Enter
4. AI extracts:
   - **Niche** (e.g., "Restaurants")
   - **Location** (e.g., "Los Angeles, CA")
   - **Campaign Name** (auto-generated)
5. Review and adjust details
6. Configure advanced settings (optional)
7. Click "Create Campaign"

**Supported AI Prompts:**
- "Cold outreach to gym owners in [city] for [product]"
- "Contact [business type] in [location] about [service]"
- "Reach [niche] CEOs in [city] for [solution]"

#### Method 2: Manual Campaign Creation

1. Click "Create Manually" on the campaign page
2. Fill in required fields:
   - **Campaign Name** - Descriptive name for tracking
   - **Target Niche** - Business type (e.g., "Dental Clinics", "Auto Repair Shops")
   - **Location** - City, state, or address (e.g., "New York, NY", "London, UK")
3. Optional: Add email template with variables
4. Configure advanced settings
5. Click "Create Campaign"

### Advanced Scraping Settings

Click **"Advanced Scraping Options"** to reveal all configuration options:

#### Basic Settings

**Max Results Per Search** (1-500)
- Default: 50
- Higher numbers = more leads but longer processing time
- Free tier limit: ~25,000 leads/month

**Minimum Rating** (2-4.5 stars)
- Filter businesses by Google rating
- Options: Any, 2+, 2.5+, 3+, 3.5+, 4+, 4.5+
- Higher ratings = better quality leads

**Website Filter**
- **All Places** - Include everyone
- **With Website** - Only businesses with websites (better for B2B)
- **Without Website** - Only businesses without websites (opportunity niche)

**Search Matching**
- **All Results** - Google's best match algorithm
- **Name Includes** - Business name must contain search term
- **Exact Match** - Business name must exactly match search term

**Skip Closed Places**
- Exclude permanently closed businesses
- Recommended: Enabled

**Scrape Detail Page**
- Required for: Opening hours, popular times, reviews, images, Q&A
- Slower but provides rich data
- Recommended: Enable if using reviews/images

#### Contact Enrichment (Premium)

**Extract Real Emails** ($2 per 1,000 places with websites)
- Scrapes actual email addresses from business websites
- Much higher quality than generated emails
- Stored in `leads.real_email` column
- Automatically enables social media URL extraction

**Social Media Profile Enrichment** (Variable pricing)
Enable individual platforms:
- **Facebook** - Profile name, followers, verification, description
- **Instagram** - Username, followers, posts count, bio
- **YouTube** - Channel name, subscribers, video count
- **TikTok** - Handle, followers, videos, verification
- **Twitter** - Handle, followers, tweets, bio

Each enabled platform will:
1. Find the business's profile URL
2. Scrape detailed profile data
3. Store in `lead_social_profiles` table

**Cost:** Charged per profile found (typically $0.01-0.05 per profile)

**Employee Leads Per Place** (Variable pricing)
- Extract decision-maker contact information
- Set number: 0 (disabled) to 50 per business
- Each lead includes:
  - Full name
  - Job title
  - Email address (when available)
  - Phone number (when available)
  - LinkedIn profile URL
  - Department
  - Seniority level

**Cost:** Charged per lead found (typically $0.10-0.50 per lead)

**Warning:** 10 leads × 1,000 places = 10,000 total leads and charges!

#### Additional Data Collection

**Max Reviews** (0-999)
- Number of customer reviews to scrape per business
- Recommended: 10-50 for manageable data
- Includes: Rating, text, date, reviewer name, owner response
- Sort options: Newest, Most Relevant, Highest Rating, Lowest Rating

**Max Images** (0-999)
- Number of business photos to scrape
- Includes: Image URL, thumbnail, author, category
- Useful for: Visual verification, social proof

**Max Questions** (0-999)
- Number of Q&A entries from Google Maps
- Useful for: Understanding customer concerns, pain points

**Note:** Reviews, images, and Q&A require "Scrape Detail Page" enabled

#### Location Refinement

Override the main location field with precise targeting:

- **Country Code** (e.g., US, GB, CA, AU)
- **State/Province** (e.g., California, Texas, Ontario)
- **County** (e.g., Los Angeles County)
- **City** (e.g., San Francisco)
- **Postal Code** (e.g., 90210)

**Use Case:** Target "Restaurants" in postal code "10001" for Manhattan-only results

### Scraping Leads

#### Start Scraping

1. Open your campaign detail page
2. Click **"Scrape Leads"** button
3. Edge function calls Apify API with your settings
4. Progress indicator shows real-time status
5. When complete, you'll see statistics:
   ```
   Found 50 leads, 35 employee contacts, 150 social profiles, 1,000 reviews, 500 images
   ```

#### What Happens During Scraping

1. **Job Created** - Entry in `campaign_jobs` table with status "processing"
2. **Apify Called** - Edge function sends request to Apify API
3. **Actor Runs** - Apify's crawler searches Google Maps (5-10 minutes typical)
4. **Data Processed** - Results parsed and stored in database
5. **Job Completed** - Status updated to "completed" with statistics

#### Viewing Results

**Leads Table** - Shows first 10 leads with:
- Business name
- Email address (type indicator: personal/business/unknown)
- Phone number
- Address
- Website
- Rating and review count
- Google Maps URL

Click **"View All Leads"** to see complete list on Leads page.

#### Advanced: Viewing Enriched Data

Enriched data is stored in related tables. To view:

**Employee Contacts:**
```sql
SELECT * FROM lead_contacts WHERE campaign_id = 'your-campaign-id';
```

**Social Profiles:**
```sql
SELECT * FROM lead_social_profiles WHERE campaign_id = 'your-campaign-id';
```

**Reviews:**
```sql
SELECT * FROM lead_reviews WHERE lead_id = 'your-lead-id' ORDER BY publish_date DESC;
```

**Images:**
```sql
SELECT * FROM lead_images WHERE lead_id = 'your-lead-id';
```

### Email Generation

#### AI-Generated Emails

1. After scraping leads, click **"Generate Emails"**
2. AI analyzes each lead:
   - Business name and industry
   - Location and context
   - Reviews and reputation
   - Website presence
3. Creates personalized email for each lead
4. Emails stored in `emails` table with status "draft"

**AI Personalization Features:**
- References business name naturally
- Mentions location/area
- Addresses business type specifically
- Includes relevant pain points
- Professional tone and formatting

#### Custom Email Templates

1. When creating a campaign, scroll to "Email Template"
2. Write your template with variables:
   ```
   Hi {firstName},

   I noticed {businessName} in {location} and wanted to reach out.

   I help {businessName} owners like you increase revenue by 30% through [solution].

   Are you available for a quick 15-minute call this week?

   Best regards,
   [Your Name]
   ```

3. Supported variables:
   - `{firstName}` - Extracted from business name
   - `{businessName}` - Full business name
   - `{location}` - City/area
   - `{industry}` - Business category

4. Leave empty to use AI generation

### Sending Emails

#### Manual Send

1. Go to campaign detail page
2. Click **"Send Emails"**
3. Confirm number of emails to send
4. Emails queued for delivery
5. Status updates in real-time

#### Scheduled Send (Coming Soon)

Configure in campaign settings:
- **Start Hour** - When to begin sending (e.g., 9 AM)
- **End Hour** - When to stop sending (e.g., 5 PM)
- **Days of Week** - Which days to send (M-F recommended)
- **Timezone** - Your local timezone
- **Daily Limit** - Max emails per day (default: 50)

### Automated Campaigns

#### Full Automation Workflow

1. Create campaign with all settings configured
2. Click **"Start Automation"**
3. System automatically:
   - Scrapes leads from Google Maps
   - Enriches data (if enabled)
   - Generates personalized emails
   - Sends emails (respecting limits)
   - Tracks results

#### Job Queue System

All automation tasks run as background jobs tracked in `campaign_jobs` table:

**Job Types:**
- `scrape_leads` - Google Maps scraping
- `generate_emails` - AI email creation
- `send_emails` - Email delivery
- `schedule_campaign` - Scheduled sending

**Job Statuses:**
- `pending` - Waiting to start
- `processing` - Currently running
- `completed` - Finished successfully
- `failed` - Error occurred (see error_message)

**View Job History:**
```sql
SELECT * FROM campaign_jobs
WHERE campaign_id = 'your-campaign-id'
ORDER BY created_at DESC;
```

### Analytics Dashboard

#### Campaign Metrics

Navigate to **Dashboard → Analytics** to see:

**Overview Cards:**
- Total Campaigns
- Total Leads Scraped
- Emails Sent
- Open Rate (coming soon)

**Campaign Performance:**
- Leads per campaign
- Email send success rate
- Best performing niches
- Location breakdown

#### Lead Quality Metrics

**Email Type Distribution:**
- Personal (Gmail, Yahoo, etc.) - Lower quality for B2B
- Business (company domain) - Higher quality
- Unknown - Needs verification

**Rating Distribution:**
- 4.5+ stars - Premium leads
- 4-4.4 stars - Good quality
- 3-3.9 stars - Average
- <3 stars - Lower quality

### Leads Management

#### Leads Page

View all leads across campaigns:

**Filters:**
- Campaign
- Email type
- Rating range
- Has website (yes/no)
- Has phone (yes/no)

**Bulk Actions:**
- Export selected leads (coming soon)
- Generate emails for selected
- Mark as contacted
- Delete leads

**Individual Lead Actions:**
- View full details
- Edit information
- View employee contacts
- View social profiles
- View reviews
- Delete lead

#### Lead Detail View

Click any lead to see:

**Basic Info:**
- Business name, phone, email, address, website
- Google Maps URL and rating
- Email type indicator

**Enriched Data Tabs:**
1. **Contacts** - Employee leads with job titles and contact info
2. **Social Media** - Profile links and metrics
3. **Reviews** - Customer feedback and ratings
4. **Images** - Business photos
5. **Additional** - Opening hours, Q&A, popular times

### Settings & Configuration

#### User Profile Settings

Navigate to **Dashboard → Settings**:

**Profile Information:**
- Name
- Email (cannot be changed)
- Company name
- Phone number

**Email Configuration:**
- SMTP settings (coming soon)
- Gmail OAuth connection (coming soon)
- Daily send limits
- Email signature

**API Keys:**
- View Apify usage
- Add OpenAI key for AI features (coming soon)

#### Campaign Settings

Edit campaign settings:
- Campaign name
- Status (draft, active, paused, completed)
- Niche and location
- Email template
- Automation settings
- Apify advanced settings

### Data Export

#### Export Leads (Coming Soon)

1. Go to Leads page
2. Select leads to export
3. Choose format: CSV, Excel, JSON
4. Download file

**Exported Fields:**
- All basic lead info
- Enriched data (contacts, social profiles)
- Custom fields
- Tags and notes

## ⚙️ Configuration

### Environment Variables

**Required:**
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

**Edge Function Secrets (Supabase Dashboard):**
```
APIFY_API_TOKEN=apify_api_xxx
OPENAI_API_KEY=sk-xxx (optional, for AI features)
```

### Supabase Configuration

**Authentication Settings:**
- Email confirmations: Disabled (instant signup)
- Password requirements: Minimum 6 characters
- Session timeout: 1 hour (auto-refresh enabled)

**Database:**
- Row Level Security: Enabled on all tables
- Realtime: Enabled for campaign_jobs table
- Connection pooling: Enabled

**Edge Functions:**
- Timeout: 600 seconds (10 minutes)
- Memory: 512 MB
- Regions: Deployed globally

### Apify Configuration

**Actor:** `compass/crawler-google-places`

**Rate Limits:**
- Free tier: $5/month (~25,000 basic results)
- Concurrent runs: 1 on free tier
- Max timeout: 10 minutes per run

**Cost Optimization:**
- Use filters to reduce results
- Disable enrichment for testing
- Start with small result limits (10-20)

## 🗄️ Database Schema

### Core Tables

#### `profiles`
User profile information
- `id` - UUID (references auth.users)
- `email` - User email
- `name` - Full name
- `company` - Company name
- `created_at` - Timestamp

#### `campaigns`
Marketing campaigns
- `id` - UUID primary key
- `user_id` - References profiles
- `name` - Campaign name
- `niche` - Target business type
- `location` - Geographic area
- `status` - draft/active/paused/completed
- `total_leads` - Count of scraped leads
- `emails_sent` - Count of sent emails
- `ai_prompt` - Original AI prompt
- `email_template` - Custom email template
- `automation_enabled` - Boolean
- `scraping_status` - not_started/in_progress/completed/failed
- `ai_personalization` - Boolean
- `sending_schedule` - JSONB schedule config
- `apify_settings` - JSONB advanced settings
- `launched_at` - Timestamp
- `created_at` - Timestamp
- `updated_at` - Timestamp

#### `leads`
Scraped business leads
- `id` - UUID primary key
- `campaign_id` - References campaigns
- `user_id` - References profiles
- `business_name` - Business name
- `email` - Email address (generated or scraped)
- `real_email` - Actual email from website
- `phone` - Phone number
- `address` - Physical address
- `website` - Website URL
- `rating` - Google rating (0-5)
- `review_count` - Number of reviews
- `email_type` - personal/generic/unknown
- `google_maps_url` - Google Maps link
- `status` - new/contacted/responded/converted
- `industry` - Industry classification
- `employee_count` - Number of employees
- `social_profiles` - JSONB quick lookup
- `opening_hours` - JSONB schedule
- `image_categories` - JSONB
- `reviews_distribution` - JSONB
- `popular_times` - JSONB
- `questions_answers` - JSONB array
- `web_results` - JSONB array
- `directory_places` - JSONB array
- `scraped_data` - JSONB raw data
- `personalization_score` - 0-100
- `last_contacted_at` - Timestamp
- `created_at` - Timestamp

#### `emails`
Generated and sent emails
- `id` - UUID primary key
- `campaign_id` - References campaigns
- `lead_id` - References leads
- `user_id` - References profiles
- `subject` - Email subject line
- `body` - Email content
- `status` - draft/scheduled/sent/failed
- `ai_generated` - Boolean
- `generation_prompt` - AI prompt used
- `personalization_tokens` - JSONB variables
- `sent_at` - Timestamp
- `opened_at` - Timestamp
- `clicked_at` - Timestamp
- `replied_at` - Timestamp
- `created_at` - Timestamp

### Automation Tables

#### `campaign_jobs`
Background job queue
- `id` - UUID primary key
- `campaign_id` - References campaigns
- `user_id` - References profiles
- `job_type` - scrape_leads/generate_emails/send_emails/schedule_campaign
- `status` - pending/processing/completed/failed
- `progress` - 0-100 percentage
- `total_items` - Expected count
- `processed_items` - Completed count
- `result_data` - JSONB results
- `error_message` - Text error details
- `started_at` - Timestamp
- `completed_at` - Timestamp
- `created_at` - Timestamp

#### `email_templates`
Reusable email templates
- `id` - UUID primary key
- `user_id` - References profiles
- `name` - Template name
- `subject` - Subject line
- `body` - Email content
- `variables` - JSONB variable definitions
- `created_at` - Timestamp
- `updated_at` - Timestamp

#### `gmail_accounts`
Connected Gmail accounts (future)
- `id` - UUID primary key
- `user_id` - References profiles
- `email` - Gmail address
- `access_token` - OAuth token (encrypted)
- `refresh_token` - OAuth refresh (encrypted)
- `daily_limit` - Max emails per day
- `emails_sent_today` - Current count
- `last_reset_at` - Daily reset timestamp
- `is_active` - Boolean
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Enrichment Tables

#### `lead_contacts`
Employee/decision-maker contacts
- `id` - UUID primary key
- `lead_id` - References leads
- `user_id` - References profiles
- `campaign_id` - References campaigns
- `full_name` - Employee name
- `job_title` - Position/title
- `email` - Email address
- `phone` - Phone number
- `linkedin_url` - LinkedIn profile
- `department` - Department name
- `seniority` - Seniority level
- `created_at` - Timestamp

#### `lead_social_profiles`
Social media profile data
- `id` - UUID primary key
- `lead_id` - References leads
- `user_id` - References profiles
- `platform` - facebook/instagram/youtube/tiktok/twitter
- `profile_url` - Profile link
- `profile_name` - Display name/username
- `followers` - Follower count
- `following` - Following count
- `posts_count` - Post/video count
- `is_verified` - Verified badge
- `description` - Bio/description
- `profile_picture` - Avatar URL
- `enriched_data` - JSONB full profile data
- `created_at` - Timestamp

#### `lead_reviews`
Customer reviews
- `id` - UUID primary key
- `lead_id` - References leads
- `user_id` - References profiles
- `reviewer_name` - Reviewer name
- `reviewer_photo` - Avatar URL
- `rating` - 1-5 stars
- `text` - Review content
- `publish_date` - Review date
- `response_text` - Owner response
- `response_date` - Response date
- `likes` - Like count
- `review_url` - Direct link
- `created_at` - Timestamp

#### `lead_images`
Business photos
- `id` - UUID primary key
- `lead_id` - References leads
- `user_id` - References profiles
- `image_url` - Full resolution
- `thumbnail_url` - Thumbnail
- `author_name` - Photographer
- `category` - Image category
- `created_at` - Timestamp

### Security (Row Level Security)

All tables have RLS policies restricting access to:
- Users can only see their own data
- `user_id = auth.uid()` on all tables
- SELECT, INSERT, UPDATE, DELETE policies enforced

**Example Policy:**
```sql
CREATE POLICY "Users can view own leads"
  ON leads FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
```

## 🔌 API Integration

### Apify Integration

**Edge Function:** `supabase/functions/scrape-google-maps/index.ts`

**Request Format:**
```typescript
POST /functions/v1/scrape-google-maps
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "campaignId": "uuid",
  "niche": "Restaurants",
  "location": "New York, NY",
  "apifySettings": {
    "maxCrawledPlacesPerSearch": 50,
    "placeMinimumStars": "four",
    "scrapeContacts": true,
    "maximumLeadsEnrichmentRecords": 5,
    // ... other settings
  }
}
```

**Response Format:**
```json
{
  "success": true,
  "jobId": "uuid",
  "leadsFound": 50,
  "contactsFound": 35,
  "socialProfilesFound": 150,
  "reviewsScraped": 1000,
  "imagesScraped": 500
}
```

**Error Handling:**
- 401: Not authenticated
- 500: Scraping failed (see error.message)
- Apify errors returned with full details

### Email Generation API

**Edge Function:** `supabase/functions/generate-ai-emails/index.ts`

**Request Format:**
```typescript
POST /functions/v1/generate-ai-emails
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "campaignId": "uuid",
  "leadIds": ["uuid1", "uuid2"], // optional
  "template": "custom template" // optional
}
```

**Response Format:**
```json
{
  "success": true,
  "emailsGenerated": 50
}
```

### Email Sending API

**Edge Function:** `supabase/functions/send-emails/index.ts`

**Request Format:**
```typescript
POST /functions/v1/send-emails
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "campaignId": "uuid",
  "emailIds": ["uuid1", "uuid2"], // optional
  "sendImmediately": false // respect schedule
}
```

**Response Format:**
```json
{
  "success": true,
  "emailsSent": 50,
  "failed": 0
}
```

## 🚀 Advanced Features

### Custom Geolocation

Target specific geographic polygons:

```json
{
  "customGeolocation": {
    "type": "Polygon",
    "coordinates": [[
      [-118.5, 34.0],
      [-118.3, 34.0],
      [-118.3, 34.2],
      [-118.5, 34.2],
      [-118.5, 34.0]
    ]]
  }
}
```

### Bulk Place ID Scraping

Scrape specific businesses:

```json
{
  "placeIds": [
    "ChIJN1t_tDeuEmsRUsoyG83frY4",
    "ChIJd8BlQ2BZwokRAFUEcm_qrcA"
  ]
}
```

### Start URL Scraping

Scrape from Google Maps URLs:

```json
{
  "startUrls": [
    { "url": "https://www.google.com/maps/search/restaurants/@34.05,-118.25,12z" }
  ]
}
```

### Category Filtering

Filter by specific categories (4,000+ available):

```json
{
  "categoryFilterWords": [
    "restaurant",
    "cafe",
    "bar"
  ]
}
```

View all categories: https://apify.com/compass/crawler-google-places#categories

### Review Filtering

Filter reviews by keywords:

```json
{
  "maxReviews": 50,
  "reviewsFilterString": "delivery service",
  "reviewsStartDate": "2024-01-01",
  "reviewsSort": "newest"
}
```

### Department Filtering

Target specific departments when extracting employee leads:

```json
{
  "maximumLeadsEnrichmentRecords": 10,
  "leadsEnrichmentDepartments": [
    "C-Suite",
    "Sales",
    "Marketing",
    "Business Development"
  ]
}
```

**Available Departments:**
- C-Suite (CEO, CFO, CTO, etc.)
- Sales
- Marketing
- Business Development
- IT
- HR
- Finance
- Operations
- Customer Success

### Realtime Updates (Coming Soon)

Subscribe to campaign job updates:

```typescript
const subscription = supabase
  .channel('campaign-jobs')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'campaign_jobs',
    filter: `campaign_id=eq.${campaignId}`
  }, (payload) => {
    console.log('Job updated:', payload.new)
  })
  .subscribe()
```

## 🐛 Troubleshooting

### Common Issues

#### "APIFY_API_TOKEN is not configured"

**Solution:**
1. Get token from Apify dashboard
2. Add to Supabase Edge Function secrets
3. Redeploy edge function

#### "No leads found"

**Causes:**
- Search too specific
- Location format incorrect
- Filters too restrictive

**Solutions:**
- Broaden search term (e.g., "restaurants" instead of "italian restaurants")
- Use standard location format (e.g., "New York, NY")
- Reduce minimum rating requirement
- Disable "Skip Closed Places"

#### "Scraping timed out"

**Causes:**
- Too many results requested (>500)
- Too many enrichment features enabled
- High review/image limits

**Solutions:**
- Reduce maxCrawledPlacesPerSearch
- Disable some enrichment features
- Lower review/image limits (10-50)
- Run multiple smaller scrapes

#### "Email generation failed"

**Causes:**
- No leads in campaign
- OpenAI API key missing (if using GPT)
- Template syntax error

**Solutions:**
- Scrape leads first
- Add OpenAI key to secrets
- Validate template syntax

#### Database RLS Errors

**Error:** "new row violates row-level security policy"

**Solution:**
- Ensure user is authenticated
- Check user_id matches auth.uid()
- Verify RLS policies are correct

### Debug Mode

Enable detailed logging:

```typescript
// In edge function
console.log('Debug info:', JSON.stringify(data, null, 2))
```

View logs in Supabase Dashboard → Edge Functions → Logs

### Performance Issues

**Slow page loads:**
- Reduce leads per page (use pagination)
- Index frequently queried columns
- Optimize complex queries

**Slow scraping:**
- Reduce maxCrawledPlacesPerSearch
- Disable unnecessary enrichment
- Use more specific search terms

## 🔒 Security

### Authentication
- Supabase Auth with JWT tokens
- Automatic token refresh
- Secure session management
- Password hashing (bcrypt)

### Authorization
- Row Level Security on all tables
- User data isolation
- Service role key protected
- API rate limiting

### Data Protection
- Encrypted database connections
- HTTPS only
- OAuth tokens encrypted
- No sensitive data in logs

### GDPR Compliance
- User data deletion on request
- Personal data minimization
- Explicit consent for enrichment
- Data export capability

### Best Practices
- Never commit .env files
- Rotate API keys regularly
- Use environment-specific keys
- Monitor suspicious activity
- Limit employee data collection

## 💰 Cost Management

### Apify Pricing

**Free Tier:** $5/month credit
- ~25,000 basic results
- Limited concurrent runs

**Paid Tiers:**
- Starter: $49/month ($50 credit)
- Business: $499/month ($500 credit)
- Enterprise: Custom pricing

### Cost Breakdown

**Basic Scraping:** $0.20 per 1,000 results
- Business name, phone, address, website, rating

**Contact Enrichment:** $2 per 1,000 places
- Real emails from websites
- Social media URLs

**Social Profile Enrichment:** ~$0.01-0.05 per profile
- Detailed metrics and data

**Employee Leads:** ~$0.10-0.50 per lead
- Full contact information

### Cost Optimization Tips

1. **Use filters** - Reduce unnecessary results
2. **Test small** - Start with 10-20 results
3. **Enable selectively** - Only use needed enrichment
4. **Monitor usage** - Check Apify dashboard daily
5. **Set limits** - Use maxCrawledPlacesPerSearch wisely
6. **Batch scraping** - Run fewer large jobs vs. many small ones

### Example Costs

**Scenario 1: Basic Lead Gen**
- 1,000 restaurants in NYC
- No enrichment
- Cost: $0.20

**Scenario 2: Contact Enrichment**
- 1,000 restaurants with websites
- Real email extraction
- Cost: $2.20

**Scenario 3: Full Enrichment**
- 100 restaurants
- Real emails + 5 social profiles + 5 employees per place
- Cost: ~$0.02 + $2.50 (profiles) + $25-250 (employees) = $27.52-252.52

**Always test with small batches first!**

## 👩‍💻 Development

### Project Structure

```
project/
├── src/
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React contexts (Auth)
│   ├── lib/            # Utilities and configs
│   ├── pages/          # Route pages
│   ├── services/       # API services
│   ├── types/          # TypeScript types
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── supabase/
│   ├── functions/      # Edge functions
│   └── migrations/     # Database migrations
├── public/            # Static assets
└── dist/             # Production build
```

### Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
```

### Adding New Features

1. **Database Changes**
   - Create new migration in `supabase/migrations/`
   - Add RLS policies
   - Update type definitions in `src/types/database.ts`

2. **UI Components**
   - Create in `src/components/`
   - Use Tailwind for styling
   - Add TypeScript interfaces

3. **API Endpoints**
   - Create edge function in `supabase/functions/`
   - Add CORS headers
   - Implement error handling
   - Deploy function

4. **Routes**
   - Add page in `src/pages/`
   - Update `src/App.tsx` with route
   - Add to navigation if needed

### Testing

**Manual Testing Checklist:**
- [ ] User signup and login
- [ ] Campaign creation (AI and manual)
- [ ] Lead scraping (basic)
- [ ] Lead scraping (with enrichment)
- [ ] Email generation
- [ ] Email sending
- [ ] Analytics display
- [ ] Settings changes
- [ ] Error handling
- [ ] Mobile responsiveness

**Automated Testing (Coming Soon):**
- Unit tests with Vitest
- Integration tests with Playwright
- E2E tests for critical flows

### Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Style

- Use TypeScript for all new code
- Follow React hooks best practices
- Use Tailwind utility classes
- Add JSDoc comments for complex functions
- Keep components under 300 lines
- Extract reusable logic to custom hooks

## 📚 Additional Resources

### Documentation
- [Apify Google Maps Scraper](https://apify.com/compass/crawler-google-places)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Guides
- [APIFY_SETUP.md](APIFY_SETUP.md) - Complete Apify setup guide
- [APIFY_FULL_INTEGRATION.md](APIFY_FULL_INTEGRATION.md) - Technical integration details
- [DATABASE.md](DATABASE.md) - Database schema reference
- [AUTOMATION_GUIDE.md](AUTOMATION_GUIDE.md) - Automation workflows

### Support
- Create GitHub issue for bugs
- Check existing issues before creating new ones
- Provide reproduction steps and environment details

## 📄 License

This project is proprietary software. All rights reserved.

## 🎉 Acknowledgments

- Built with [Supabase](https://supabase.com)
- Powered by [Apify](https://apify.com)
- Icons by [Lucide](https://lucide.dev)
- UI inspired by modern SaaS designs

---

**Version:** 1.0.0
**Last Updated:** December 2024
**Status:** Production Ready ✅
