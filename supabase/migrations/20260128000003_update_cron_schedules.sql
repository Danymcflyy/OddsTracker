-- Migration: Update pg_cron schedules for faster detection
-- Run this manually in Supabase SQL Editor

-- 1. Enable pg_cron extension if not enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Delete old jobs to avoid duplicates (optional but cleaner)
-- SELECT cron.unschedule('sync-events');
-- SELECT cron.unschedule('historical-fallback');

-- 3. Schedule 'sync-events' to run EVERY HOUR (0 * * * *)
-- REPLACE 'YOUR_PROJECT_URL' with your actual Vercel app URL (e.g., https://oddstracker.vercel.app)
-- REPLACE 'YOUR_CRON_SECRET' with the CRON_SECRET from your .env.local or Vercel Env Vars
SELECT cron.schedule(
  'sync-events',
  '0 * * * *', 
  $$
    SELECT
      net.http_post(
          url:='https://YOUR_PROJECT_URL/api/cron/sync-events',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb,
          body:='{}'::jsonb
      ) as request_id;
  $$
);

-- 4. Ensure other jobs are scheduled correctly (if needed)
-- Scan Opening (Every 2 mins)
SELECT cron.schedule(
  'scan-opening',
  '*/2 * * * *',
  $$
    SELECT
      net.http_post(
          url:='https://YOUR_PROJECT_URL/api/cron/scan-opening',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb,
          body:='{}'::jsonb
      ) as request_id;
  $$
);

-- Capture Closing (Every 5 mins)
SELECT cron.schedule(
  'capture-closing',
  '*/5 * * * *',
  $$
    SELECT
      net.http_post(
          url:='https://YOUR_PROJECT_URL/api/cron/capture-closing',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb,
          body:='{}'::jsonb
      ) as request_id;
  $$
);

-- Sync Scores (Every hour)
SELECT cron.schedule(
  'sync-scores',
  '0 * * * *',
  $$
    SELECT
      net.http_post(
          url:='https://YOUR_PROJECT_URL/api/cron/sync-scores',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb,
          body:='{}'::jsonb
      ) as request_id;
  $$
);

-- 5. List all active jobs to verify
SELECT * FROM cron.job;
