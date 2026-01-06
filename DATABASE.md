# Database Schema Documentation

## Overview

This application uses Supabase PostgreSQL for all data persistence with full Row Level Security (RLS) enabled on all tables. The database schema supports a complete lead generation and outreach automation platform with real-time scraping, AI email generation, and campaign management.

## Security

All tables have RLS enabled with policies that ensure users can only access their own data. Every table includes proper foreign key constraints, indexes for performance, and automatic timestamp management.

## Tables

### 1. profiles

Extends Supabase auth.users with additional user profile information.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | References auth.users.id |
| email | text | User email address |
| full_name | text | User full name |
| company_name | text | Optional company name |
| created_at | timestamptz | Account creation timestamp |
| updated_at | timestamptz | Last update timestamp |

**Relationships:**
- One-to-one with auth.users
- One-to-one with subscriptions
- One-to-many with campaigns, leads, emails

**Triggers:**
- Automatically created on user signup
- Auto-updates updated_at on modifications

---

### 2. subscriptions

Manages user subscription plans and credit system.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique subscription ID |
| user_id | uuid (FK) | References profiles.id |
| plan_type | text | Plan: free, starter, professional, enterprise |
| status | text | Status: active, cancelled, expired |
| credits_remaining | integer | Available credits |
| credits_total | integer | Total credits in current cycle |
| billing_cycle_start | timestamptz | Billing cycle start date |
| billing_cycle_end | timestamptz | Billing cycle end date |
| created_at | timestamptz | Subscription creation |
| updated_at | timestamptz | Last update |

**Default Values:**
- Free plan: 100 credits
- Billing cycle: 30 days

**Business Logic:**
- Scraping leads costs credits
- Credits reset at billing cycle end
- Automatically created with free plan on signup

---

### 3. campaigns

Stores outreach campaigns with automation settings.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique campaign ID |
| user_id | uuid (FK) | References profiles.id |
| name | text | Campaign name |
| niche | text | Target niche/industry |
| location | text | Geographic location |
| ai_prompt | text | Original AI prompt (optional) |
| status | text | Status: draft, active, paused, completed |
| email_template | text | Custom email template (optional) |
| total_leads | integer | Total leads scraped |
| emails_sent | integer | Number of emails sent |
| emails_opened | integer | Number of emails opened |
| emails_replied | integer | Number of replies received |
| automation_enabled | boolean | Is automation active |
| scraping_status | text | Scraping: not_started, in_progress, completed, failed |
| ai_personalization | boolean | Use AI for email personalization |
| sending_schedule | jsonb | Email sending schedule configuration |
| created_at | timestamptz | Campaign creation |
| updated_at | timestamptz | Last update |
| launched_at | timestamptz | Campaign launch date |

**Indexes:**
- user_id
- status

**Key Features:**
- Tracks complete campaign lifecycle
- Supports both AI-generated and manual campaigns
- Real-time metrics tracking

---

### 4. leads

Business leads scraped from Google Maps via Apify.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique lead ID |
| campaign_id | uuid (FK) | References campaigns.id |
| user_id | uuid (FK) | References profiles.id |
| business_name | text | Business/company name |
| email | text | Contact email |
| phone | text | Phone number (optional) |
| address | text | Physical address (optional) |
| website | text | Website URL (optional) |
| rating | numeric(2,1) | Google Maps rating (optional) |
| review_count | integer | Number of reviews |
| email_type | text | Type: personal, generic, unknown |
| decision_maker_name | text | Contact person name (optional) |
| status | text | Status: new, contacted, replied, converted, bounced |
| google_maps_url | text | Google Maps listing URL |
| notes | text | User notes |
| scraped_data | jsonb | Raw scraped data from Google Maps |
| personalization_score | integer | AI personalization score (0-100) |
| last_contacted_at | timestamptz | Last contact timestamp |
| created_at | timestamptz | Lead creation |
| updated_at | timestamptz | Last update |

**Indexes:**
- campaign_id
- user_id
- status

**Scraped Data Structure:**
```json
{
  "categoryName": "Restaurant",
  "location": {"lat": 40.7128, "lng": -74.0060},
  "openingHours": [...],
  "imageUrls": ["..."],
  "reviewsDistribution": {...}
}
```

**Email Types:**
- **personal**: Gmail, Yahoo, Outlook, etc.
- **generic**: Business domain emails (contact@, info@)
- **unknown**: Unable to determine

---

### 5. emails

Individual emails sent to leads with AI generation tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique email ID |
| campaign_id | uuid (FK) | References campaigns.id |
| lead_id | uuid (FK) | References leads.id |
| user_id | uuid (FK) | References profiles.id |
| subject | text | Email subject line |
| body | text | Email body content |
| personalization_data | jsonb | Personalization variables |
| status | text | Status: queued, sent, opened, clicked, replied, bounced, failed |
| sent_at | timestamptz | Send timestamp |
| opened_at | timestamptz | First open timestamp |
| replied_at | timestamptz | Reply timestamp |
| error_message | text | Error details if failed |
| ai_generated | boolean | Was email AI-generated |
| generation_prompt | text | AI generation prompt |
| personalization_tokens | jsonb | AI personalization tokens |
| created_at | timestamptz | Email creation |

**Indexes:**
- campaign_id
- lead_id
- status

**Status Flow:**
1. queued → sent → opened → clicked/replied
2. queued → failed/bounced

---

### 6. campaign_jobs

Background job queue for campaign automation tasks.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique job ID |
| campaign_id | uuid (FK) | References campaigns.id |
| user_id | uuid (FK) | References profiles.id |
| job_type | text | Type: scrape_leads, generate_emails, send_emails, schedule_campaign |
| status | text | Status: pending, processing, completed, failed |
| progress | integer | Progress percentage (0-100) |
| total_items | integer | Total items to process |
| processed_items | integer | Items processed so far |
| result_data | jsonb | Job results and metadata |
| error_message | text | Error details if failed |
| started_at | timestamptz | Job start time |
| completed_at | timestamptz | Job completion time |
| created_at | timestamptz | Job creation |

**Indexes:**
- campaign_id
- user_id
- status

**Job Types:**
1. **scrape_leads**: Scrape businesses from Google Maps
2. **generate_emails**: Generate AI-personalized emails
3. **send_emails**: Send queued emails
4. **schedule_campaign**: Schedule campaign execution

---

### 7. email_templates

Reusable email templates with variable support.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique template ID |
| user_id | uuid (FK) | References profiles.id |
| name | text | Template name |
| subject | text | Email subject with variables |
| body | text | Email body with variables |
| variables | jsonb | Available template variables |
| created_at | timestamptz | Template creation |
| updated_at | timestamptz | Last update |

**Template Variables:**
- `{firstName}` - Lead first name
- `{businessName}` - Business name
- `{location}` - Business location
- Custom variables as needed

---

### 8. gmail_accounts

Connected Gmail accounts for email sending.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique account ID |
| user_id | uuid (FK) | References profiles.id |
| email | text | Gmail address |
| access_token | text | OAuth access token |
| refresh_token | text | OAuth refresh token |
| daily_limit | integer | Daily send limit |
| emails_sent_today | integer | Emails sent today |
| last_reset_at | timestamptz | Last daily reset |
| is_active | boolean | Account active status |
| created_at | timestamptz | Account connection |
| updated_at | timestamptz | Last update |

**Indexes:**
- user_id
- is_active

**Daily Limits:**
- Default: 50 emails/day per account
- Resets at midnight UTC
- Automatic rotation between accounts

---

### 9. user_settings

User preferences and integration settings.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique settings ID |
| user_id | uuid (FK) | References profiles.id (unique) |
| gmail_accounts | jsonb | Legacy Gmail account array |
| daily_email_limit | integer | User daily email limit |
| email_sending_schedule | jsonb | Sending schedule preferences |
| ai_model_preference | text | Preferred AI model |
| notification_preferences | jsonb | Notification settings |
| created_at | timestamptz | Settings creation |
| updated_at | timestamptz | Last update |

**Sending Schedule Format:**
```json
{
  "enabled": true,
  "start_hour": 9,
  "end_hour": 17,
  "days": [1, 2, 3, 4, 5],
  "timezone": "America/New_York"
}
```

---

### 10. analytics_events

Detailed event tracking for analytics.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique event ID |
| user_id | uuid (FK) | References profiles.id |
| campaign_id | uuid (FK) | References campaigns.id (optional) |
| lead_id | uuid (FK) | References leads.id (optional) |
| email_id | uuid (FK) | References emails.id (optional) |
| event_type | text | Event type |
| event_data | jsonb | Event metadata |
| created_at | timestamptz | Event timestamp |

**Indexes:**
- user_id
- campaign_id

**Event Types:**
- `email_sent`
- `email_opened`
- `email_clicked`
- `email_replied`
- `lead_scraped`
- `campaign_created`
- `campaign_launched`

## Database Functions

### handle_new_user()

Automatically creates profile, subscription, and settings when a user signs up.

**Trigger:** `on_auth_user_created`

**Actions:**
1. Creates profile record
2. Creates free subscription with 100 credits
3. Creates default user settings

### handle_updated_at()

Automatically updates the `updated_at` timestamp on row modifications.

**Applied to:**
- profiles
- subscriptions
- campaigns
- leads
- user_settings
- email_templates
- gmail_accounts

### reset_daily_email_counts()

Resets daily email counters for all Gmail accounts.

**Usage:**
```sql
SELECT reset_daily_email_counts();
```

Should be called via cron job daily at midnight UTC.

## Common Queries

### Get Campaign Statistics

```sql
SELECT
  c.*,
  COUNT(DISTINCT l.id) as total_leads,
  COUNT(DISTINCT e.id) as total_emails,
  COUNT(DISTINCT CASE WHEN e.status = 'sent' THEN e.id END) as sent_count,
  COUNT(DISTINCT CASE WHEN e.status = 'opened' THEN e.id END) as opened_count,
  COUNT(DISTINCT CASE WHEN e.status = 'replied' THEN e.id END) as replied_count
FROM campaigns c
LEFT JOIN leads l ON l.campaign_id = c.id
LEFT JOIN emails e ON e.campaign_id = c.id
WHERE c.user_id = '[user_id]'
GROUP BY c.id;
```

### Get Leads Ready to Contact

```sql
SELECT * FROM leads
WHERE campaign_id = '[campaign_id]'
  AND status = 'new'
  AND (last_contacted_at IS NULL OR last_contacted_at < NOW() - INTERVAL '7 days')
ORDER BY personalization_score DESC
LIMIT 50;
```

### Get Active Jobs

```sql
SELECT
  j.*,
  c.name as campaign_name
FROM campaign_jobs j
JOIN campaigns c ON c.id = j.campaign_id
WHERE j.user_id = '[user_id]'
  AND j.status IN ('pending', 'processing')
ORDER BY j.created_at DESC;
```

## Data Retention

- **Leads:** Retained indefinitely
- **Emails:** Retained indefinitely
- **Analytics Events:** 90 days (recommended)
- **Campaign Jobs:** 30 days (recommended)

## Backup and Recovery

All data is automatically backed up by Supabase:
- Continuous backups with point-in-time recovery
- Daily snapshots retained for 7 days
- Recovery available via Supabase dashboard

## Performance Optimization

### Indexes Created

All critical foreign keys and query patterns have indexes:
- User lookups: user_id indexed on all tables
- Campaign queries: campaign_id indexed on leads, emails, jobs
- Status filtering: status indexed on campaigns, leads, emails, jobs
- Analytics: campaign_id indexed on analytics_events

### Query Optimization Tips

1. Always filter by user_id first (uses RLS + index)
2. Use date range queries for analytics
3. Paginate large result sets
4. Use `maybeSingle()` for zero-or-one queries
5. Batch insert operations when possible

## Migration Management

All migrations are stored in `/supabase/migrations/` and applied automatically.

**Current Migrations:**
1. `20251223161930_create_initial_schema.sql` - Initial schema
2. `20251223163819_add_automation_features.sql` - Automation features

**Creating New Migrations:**

```bash
# This would be done via Supabase CLI if available
# For this project, migrations are managed manually
```

## Environment Variables

Required for database access:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Service role key is automatically available in Supabase Edge Functions.

## Troubleshooting

### RLS Policy Issues

If users can't access their data:
1. Verify auth token is valid
2. Check RLS policies are enabled
3. Ensure user_id matches auth.uid()

### Performance Issues

If queries are slow:
1. Check if indexes exist
2. Verify query uses indexed columns
3. Add EXPLAIN ANALYZE to identify bottlenecks
4. Consider materialized views for complex analytics

### Data Integrity

To verify foreign key constraints:

```sql
SELECT
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE contype = 'f' AND connamespace = 'public'::regnamespace;
```

## Best Practices

1. **Always use RLS**: Never bypass RLS in application code
2. **Validate input**: Check data before insertion
3. **Use transactions**: For multi-table operations
4. **Monitor credits**: Check subscription before expensive operations
5. **Clean up jobs**: Archive completed jobs periodically
6. **Sanitize emails**: Validate email addresses before sending
7. **Rate limiting**: Respect Gmail daily limits
8. **Error handling**: Log errors to analytics_events

## API Integration

The database integrates with:
- **Apify**: Google Maps scraping (via Edge Functions)
- **OpenAI/Claude**: AI email generation (future)
- **Gmail API**: Email sending (future)
- **Supabase Auth**: User authentication

## Support

For database-related issues:
1. Check Supabase dashboard logs
2. Verify RLS policies
3. Review migration history
4. Contact support with query EXPLAIN output
