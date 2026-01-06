# AI Agent Progress Tracking System

An interactive, real-time progress tracking system that shows users exactly what your AI agents are doing as they work through tasks like lead scraping, email generation, and campaign automation.

## Features

### Real-Time Progress Visualization
- **Terminal-Style Logs**: Beautiful dark-themed log viewer showing step-by-step progress
- **Status Cards**: Visual completion tracking with checkmarks and progress indicators
- **Live Updates**: Real-time WebSocket updates via Supabase subscriptions
- **Progress Bar**: Animated gradient progress bar with shimmer effects
- **Success Banner**: Celebration banner when agent completes with actionable buttons

### Interactive UI Components
- **Timestamped Logs**: Every action is logged with precise timestamps
- **Color-Coded Status**: Success (green), errors (red), warnings (yellow), loading (blue)
- **Emoji Icons**: Visual indicators for different types of actions
- **Smooth Animations**: Fade-in effects for new logs, shimmer on progress bar
- **Auto-Scroll**: Logs automatically scroll as new entries appear

## Architecture

### Database Tables

#### `agent_jobs`
Tracks the overall status and progress of AI agent tasks.

```sql
CREATE TABLE agent_jobs (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  campaign_id uuid REFERENCES campaigns(id),
  job_type text CHECK (job_type IN ('lead_scraping', 'email_generation', 'email_sending', 'contact_enrichment')),
  status text CHECK (status IN ('initializing', 'running', 'completed', 'failed', 'cancelled')),
  progress_percentage integer (0-100),
  total_steps integer,
  completed_steps integer,
  result_data jsonb,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz
);
```

#### `agent_progress_logs`
Stores individual log entries for real-time display.

```sql
CREATE TABLE agent_progress_logs (
  id uuid PRIMARY KEY,
  job_id uuid REFERENCES agent_jobs(id),
  timestamp timestamptz,
  log_level text CHECK (log_level IN ('info', 'success', 'warning', 'error', 'loading')),
  icon text,
  message text,
  metadata jsonb,
  created_at timestamptz
);
```

### Components

#### `AgentProgressPage` (`/agent/progress/:jobId`)
Main page that orchestrates the entire experience:
- Loads job data and logs
- Sets up real-time subscriptions
- Displays success banner when complete
- Provides navigation back to campaign

#### `AgentProgressLogs`
Terminal-style log viewer component:
- Displays logs with timestamps and icons
- Color-coded by log level
- Auto-scrolling with smooth animations
- Animated progress bar at bottom

#### `AgentStatusCard`
Shows completion status and step checklist:
- Visual step-by-step progress
- Animated loading states
- Results summary (leads found, emails sent, etc.)
- Warning notices about processing time

### Edge Function Integration

Use the `ProgressLogger` utility in your Edge Functions:

```typescript
import { ProgressLogger, createAgentJob } from '../_shared/progress-logger.ts';

// Create a job
const jobId = await createAgentJob(
  supabase,
  userId,
  campaignId,
  'lead_scraping'
);

// Initialize logger
const logger = new ProgressLogger({ jobId, supabase });

// Log progress
await logger.info('Starting lead scraping...', '🔍');
await logger.loading('Connecting to Google Maps...', '🌍');
await logger.success('Found 29 leads!', '✅');
await logger.error('Failed to connect', '❌');

// Update progress
await logger.updateProgress(5, 10); // 50% complete

// Mark as complete
await logger.updateStatus('completed', {
  leadsFound: 29,
  campaign_name: 'My Campaign'
});
```

## Usage

### 1. Start an Agent Job

From your frontend:

```typescript
import { startLeadScrapingAgent } from '../lib/agent-service';

const jobId = await startLeadScrapingAgent(
  campaignId,
  'My Campaign',
  'Dentists',
  'Miami, FL'
);

// Navigate to progress page
navigate(`/agent/progress/${jobId}?campaign_id=${campaignId}`);
```

### 2. Monitor Progress

The progress page automatically:
- Loads the job and all logs
- Subscribes to real-time updates
- Updates UI as agent works
- Shows completion banner when done

### 3. Handle Completion

When the agent completes:
- Green success banner appears at top
- Shows total results (leads found, emails sent, etc.)
- Provides "View Leads" and "Start Sending" buttons
- User can continue their workflow

## Testing

### Test Agent Function

A test Edge Function is included to simulate agent progress:

```typescript
// Call from frontend
const { data } = await supabase.functions.invoke('test-agent-progress', {
  body: {
    campaignId: 'some-campaign-id',
    campaignName: 'Test Campaign'
  }
});

// Navigate to progress page
navigate(`/agent/progress/${data.jobId}`);
```

This will simulate a full lead scraping workflow with realistic delays and log messages.

### Manual Testing Steps

1. Log in to your application
2. Go to Campaigns → New Campaign
3. Fill out campaign details
4. Click "Start Lead Scraping with AI Agent"
5. Watch the real-time progress tracker
6. See completion banner when done

## Customization

### Adding New Job Types

1. Update the `job_type` enum in migration:
```sql
job_type CHECK (job_type IN ('lead_scraping', 'email_generation', 'email_sending', 'contact_enrichment', 'YOUR_NEW_TYPE'))
```

2. Add steps to `AgentProgressPage.tsx`:
```typescript
const stepMap: Record<string, string[]> = {
  your_new_type: [
    'Step 1',
    'Step 2',
    'Step 3',
    'Complete'
  ]
};
```

3. Create Edge Function with progress logging

### Customizing Log Icons

Edit icon mappings in your Edge Functions:

```typescript
await logger.info('Custom message', '🎨');  // Custom icon
await logger.success('Done!', '🚀');         // Rocket icon
await logger.loading('Working...', '⚙️');     // Gear icon
```

### Styling

All components use Tailwind CSS. Key customization points:

- **Colors**: Modify gradient classes (`from-blue-500 to-purple-600`)
- **Animations**: Edit `index.css` keyframes
- **Terminal Theme**: Update `AgentProgressLogs` background colors
- **Progress Bar**: Customize gradient in progress bar div

## Real-Time Updates

### Subscription Setup

The system uses Supabase Realtime subscriptions:

```typescript
// Subscribe to job updates
const jobSubscription = supabase
  .channel(`agent_job_${jobId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'agent_jobs',
    filter: `id=eq.${jobId}`
  }, (payload) => {
    setJob(payload.new);
  })
  .subscribe();

// Subscribe to new logs
const logsSubscription = supabase
  .channel(`agent_logs_${jobId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'agent_progress_logs',
    filter: `job_id=eq.${jobId}`
  }, (payload) => {
    setLogs(prev => [...prev, payload.new]);
  })
  .subscribe();
```

### Performance

- **Logs are streamed** in real-time with 150ms stagger for smooth animation
- **Progress updates** trigger automatic percentage recalculation
- **Database triggers** handle progress percentage math automatically
- **RLS policies** ensure users only see their own jobs

## Security

### Row Level Security (RLS)

All tables have RLS enabled:

```sql
-- Users can only view their own jobs
CREATE POLICY "Users can view own agent jobs"
  ON agent_jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can only see logs for their jobs
CREATE POLICY "Users can view logs for their jobs"
  ON agent_progress_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agent_jobs
      WHERE agent_jobs.id = agent_progress_logs.job_id
      AND agent_jobs.user_id = auth.uid()
    )
  );

-- Service role (Edge Functions) can insert logs
CREATE POLICY "Service role can insert logs"
  ON agent_progress_logs FOR INSERT
  TO service_role
  WITH CHECK (true);
```

## Troubleshooting

### Logs Not Appearing

1. Check that Edge Function is using service role key
2. Verify RLS policies are correct
3. Check browser console for subscription errors
4. Ensure `agent_progress_logs` table exists

### Progress Not Updating

1. Verify `updateProgress()` is being called
2. Check database trigger is installed: `update_job_progress()`
3. Look for errors in Edge Function logs
4. Confirm real-time subscriptions are active

### Navigation Issues

1. Ensure route is registered in `App.tsx`: `/agent/progress/:jobId`
2. Check that `jobId` is valid UUID
3. Verify user is authenticated (ProtectedRoute)

## Best Practices

1. **Log Frequently**: Users love seeing detailed progress
2. **Use Descriptive Messages**: "Connecting to API" is better than "Step 3"
3. **Include Timing Info**: Add "(This may take a few minutes)" for slow steps
4. **Show Results**: Always include results in completion status
5. **Handle Errors Gracefully**: Log clear error messages with suggestions
6. **Test With Delays**: Simulate realistic timing in development

## Future Enhancements

Potential improvements:
- Pause/cancel functionality
- Download logs as text file
- Email notifications on completion
- Multiple agent jobs running in parallel
- Historical job viewer
- Performance analytics dashboard

## Support

For issues or questions:
- Check Edge Function logs in Supabase dashboard
- Review browser console for errors
- Verify database migrations are applied
- Test with `test-agent-progress` function first
