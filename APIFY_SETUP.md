# Apify API Setup Guide

This application uses the **complete** Apify Google Places Crawler API to scrape comprehensive business data from Google Maps, including contact enrichment, social media profiles, employee leads, reviews, and images. Follow these steps to get your application production-ready.

## 1. Create an Apify Account

1. Visit [https://apify.com](https://apify.com)
2. Sign up for a free account
3. Verify your email address

## 2. Get Your API Token

1. Log in to your Apify account
2. Navigate to [Settings > Integrations](https://console.apify.com/account/integrations)
3. Copy your **Personal API Token**

## 3. Configure the API Token

### For Local Development

Add your Apify API token to the `.env` file:

```bash
APIFY_API_TOKEN=your_actual_apify_api_token_here
```

### For Supabase Edge Functions (Production)

The `APIFY_API_TOKEN` environment variable needs to be configured in your Supabase project:

1. Go to your Supabase project dashboard
2. Navigate to **Settings** > **Edge Functions**
3. Add a new secret:
   - **Name:** `APIFY_API_TOKEN`
   - **Value:** Your Apify API token

## 4. Understanding Apify Pricing

Apify offers a free tier with the following limits:
- $5 of free usage per month
- Unlimited platform access
- 3 active actors
- 7-day data retention

The Google Places Crawler typically costs:
- ~$0.20 per 1,000 results scraped
- This means you can scrape approximately 25,000 leads per month on the free tier

For production usage, consider upgrading to a paid plan based on your needs.

## 5. How It Works

When you create a campaign and start scraping with advanced options:

### Basic Scraping (Included)
1. The edge function calls the Apify API with your settings
2. Apify runs the Google Places Crawler actor
3. The crawler searches Google Maps based on your niche, location, and filters
4. Basic business data is returned:
   - Business name, phone, address, website
   - Rating and review count
   - Category and location coordinates
   - Google Maps URL
   - Opening hours and popular times (if detail page scraped)

### Advanced Features (Optional Add-ons)

#### Contact Enrichment ($2/1,000 places)
- **Real Email Extraction**: Scrapes actual emails from business websites
- **Social Media URLs**: Extracts Facebook, Instagram, YouTube, TikTok, Twitter links
- Stored in `leads.real_email` and `leads.social_profiles`

#### Social Media Profile Enrichment (Variable Pricing)
- **Detailed Profile Data**: Follower counts, verification status, descriptions
- **Profile Metrics**: Posts, following, engagement data
- Stored in `lead_social_profiles` table with full profile details

#### Employee Lead Enrichment (Variable Pricing)
- **Contact Information**: Full names, job titles, email addresses
- **Professional Data**: LinkedIn profiles, departments, seniority levels
- **Targeted Departments**: Filter by C-Suite, Sales, Marketing, IT, etc.
- Stored in `lead_contacts` table

#### Reviews & Images
- **Customer Reviews**: Rating, text, reviewer info, owner responses
- **Business Images**: Photos with categories and author attribution
- **Q&A Data**: Questions and answers from Google Maps
- Stored in `lead_reviews` and `lead_images` tables

### Advanced Filtering
- Minimum star ratings (2-4.5 stars)
- Website presence filtering
- Skip closed businesses
- Search term matching (exact, includes, all)
- Category filtering (4,000+ categories)
- Precise location targeting (country, state, county, city, postal code)

## 6. Using Advanced Scraper Settings

### In the UI
When creating or editing a campaign, click **"Advanced Scraping Options"** to configure:

**Basic Settings:**
- Max results per search (1-500)
- Minimum rating filter (2-4.5 stars)
- Website filter (all, with website, without website)
- Search matching type (all, name includes, exact match)
- Skip closed places
- Scrape detailed place info

**Contact Enrichment:**
- Extract real emails from websites
- Social media profile enrichment (Facebook, Instagram, YouTube, TikTok, Twitter)
- Employee leads per place (with department filtering)

**Additional Data:**
- Reviews (with sort options and filters)
- Images (with author attribution)
- Questions & Answers

**Location Refinement:**
- Country code, state, county, city, postal code
- Override main location for precise targeting

### Programmatically
Advanced settings are stored in the `campaigns.apify_settings` JSONB column and automatically passed to the edge function during scraping.

## 7. Troubleshooting

### Error: "APIFY_API_TOKEN is not configured"
- Ensure you've added the token to your environment variables
- For production, verify the secret is set in Supabase dashboard
- Redeploy the edge function after adding the secret

### Error: "Actor run did not succeed"
- Check your Apify account quota
- Verify the actor ID is correct: `compass/crawler-google-places`
- Review logs in the Apify console

### No results returned
- Try broader search terms
- Verify the location format (e.g., "New York, NY" or "London, UK")
- Check if businesses exist in that location for your niche

## 8. Database Schema for Enriched Data

The application automatically stores enriched data in these tables:

### `leads` Table (Enhanced)
- `real_email`: Actual email extracted from website
- `social_profiles`: Quick lookup JSONB of social media URLs
- `employee_count`: Number of employees (from enrichment)
- `industry`: Business industry classification
- `opening_hours`, `popular_times`, `reviews_distribution`: Detailed place data
- `questions_answers`, `web_results`, `directory_places`: Additional scraped data

### `lead_contacts` Table
Employee/lead contact information:
- Full name, job title, email, phone
- LinkedIn URL, department, seniority level
- Linked to parent lead via `lead_id`

### `lead_social_profiles` Table
Enriched social media profile data:
- Platform (facebook, instagram, youtube, tiktok, twitter)
- Profile URL, name, followers, following, posts
- Verification status, description, profile picture
- Full enriched data in JSONB column

### `lead_reviews` Table
Customer reviews:
- Reviewer name, photo, rating, text
- Publish date, likes, review URL
- Owner responses with dates

### `lead_images` Table
Business images:
- Image URL, thumbnail, author name, category
- Linked to parent lead

## 9. Best Practices

1. **Start Small**: Test with 10-20 results before running large scrapes
2. **Monitor Usage**: Keep track of your Apify consumption in the dashboard
3. **Test Advanced Features**: Enable one add-on at a time to understand costs
4. **Quality Over Quantity**: Focus on targeted niches and locations
5. **Use Filters Wisely**: Rating and website filters reduce credit usage but may exclude valid leads
6. **Department Targeting**: When using employee enrichment, specify departments to reduce costs
7. **Review Limits**: Set reasonable review/image limits (10-50) to avoid slow scrapes
8. **Data Validation**: Always review scraped leads before sending campaigns
9. **GDPR Compliance**: Employee data contains personal information - ensure legitimate use
10. **Rate Limiting**: The scraper includes automatic retry logic and handles Apify's rate limits

## 10. Support

For Apify-related issues:
- Visit [Apify Documentation](https://docs.apify.com)
- Review [Google Places Crawler Documentation](https://apify.com/compass/crawler-google-places)
- Contact Apify Support through their console

For application issues:
- Review error logs in Supabase Functions dashboard
- Check campaign job status in the application
- Monitor the `campaign_jobs` table for detailed execution logs

## 11. API Reference

The full Apify Google Maps Scraper API supports all parameters from the official Apify actor:
- View complete API documentation: https://apify.com/compass/crawler-google-places
- All 4,000+ category filters available
- Custom geolocation polygon support
- Bulk scraping via Place IDs or URLs
- Advanced review filtering and date ranges

All parameters are configurable through the UI's "Advanced Scraping Options" or programmatically via the `apify_settings` column.
