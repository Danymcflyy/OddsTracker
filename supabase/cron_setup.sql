-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the Closing Odds Capture Job (Every 5 minutes)
-- NOTE: Replace 'https://danymcflyy-oddstracker.vercel.app' with your actual production URL
-- NOTE: Replace 'YOUR_SUPABASE_CRON_SECRET' with the value: 072f4d684008a5db5f0ec04c26d9c7a7e90ad3fd0598c4b085bbd5e4e3123a85

-- First, unschedule the job if it already exists
SELECT cron.unschedule('capture-closing-odds');

SELECT cron.schedule(
  'capture-closing-odds', -- Job name
  '*/5 * * * *',          -- Schedule: Every 5 minutes
  $$
  SELECT
    net.http_post(
      url:='https://danymcflyy-oddstracker.vercel.app/api/cron/capture-closing',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer 072f4d684008a5db5f0ec04c26d9c7a7e90ad3fd0598c4b085bbd5e4e3123a85"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Job 2: Scan Opening Odds (Every 5 minutes)
-- Captures opening odds for pending markets (~6 credits per event)
SELECT cron.schedule(
  'scan-opening-odds',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT
    net.http_post(
      url:='https://danymcflyy-oddstracker.vercel.app/api/cron/scan-opening',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer 072f4d684008a5db5f0ec04c26d9c7a7e90ad3fd0598c4b085bbd5e4e3123a85"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Job 3: Sync Events (Every hour)
-- Discovers new upcoming events (FREE - no credits)
SELECT cron.schedule(
  'sync-events',
  '17 * * * *', -- Every hour at :17 (avoid :00)
  $$
  SELECT
    net.http_post(
      url:='https://danymcflyy-oddstracker.vercel.app/api/cron/sync-events',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer 072f4d684008a5db5f0ec04c26d9c7a7e90ad3fd0598c4b085bbd5e4e3123a85"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Job 4: Sync Scores & Closing Odds (Daily)
-- Updates scores and captures closing odds for completed events
SELECT cron.schedule(
  'sync-scores-closing',
  '27 2 * * *', -- Daily at 2:27 AM UTC
  $$
  SELECT
    net.http_post(
      url:='https://danymcflyy-oddstracker.vercel.app/api/cron/sync-scores',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer 072f4d684008a5db5f0ec04c26d9c7a7e90ad3fd0598c4b085bbd5e4e3123a85"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- ============================================================================
-- MONITORING & MANAGEMENT
-- ============================================================================

-- To check status of all jobs:
-- SELECT jobname, schedule, active, command FROM cron.job ORDER BY jobname;

-- To view logs of executions:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- To unschedule a job:
-- SELECT cron.unschedule('capture-closing-odds');