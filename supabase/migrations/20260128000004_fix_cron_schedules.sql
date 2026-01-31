-- Migration: Fix and cleanup pg_cron schedules
-- Run this manually in Supabase SQL Editor to remove duplicates and invalid jobs,
-- and set up the correct schedule with your actual project URL and secrets.

-- 1. Remove invalid jobs (those with placeholder text)
SELECT cron.unschedule(jobid) FROM cron.job WHERE command LIKE '%YOUR_PROJECT_URL%';

-- 2. Remove old duplicate jobs to avoid double execution
SELECT cron.unschedule('capture-closing-odds');
SELECT cron.unschedule('scan-opening-odds');
SELECT cron.unschedule('sync-scores-closing');
SELECT cron.unschedule('sync-events'); -- Unschedule old sync if exists
SELECT cron.unschedule('historical-fallback'); -- Remove deprecated historical fallback

-- 3. Re-create CLEAN jobs with correct schedules and credentials
-- NOTE: I have pre-filled your URL and Secret based on your previous valid jobs.

-- Sync Events (Every hour)
SELECT cron.schedule(
  'sync-events',
  '0 * * * *',
  $$
    SELECT
      net.http_post(
          url:='https://danymcflyy-oddstracker.vercel.app/api/cron/sync-events',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer 072f4d684008a5db5f0ec04c26d9c7a7e90ad3fd0598c4b085bbd5e4e3123a85"}'::jsonb,
          body:='{}'::jsonb
      ) as request_id;
  $$
);

-- Scan Opening (Every 2 mins)
SELECT cron.schedule(
  'scan-opening',
  '*/2 * * * *',
  $$
    SELECT
      net.http_post(
          url:='https://danymcflyy-oddstracker.vercel.app/api/cron/scan-opening',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer 072f4d684008a5db5f0ec04c26d9c7a7e90ad3fd0598c4b085bbd5e4e3123a85"}'::jsonb,
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
          url:='https://danymcflyy-oddstracker.vercel.app/api/cron/capture-closing',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer 072f4d684008a5db5f0ec04c26d9c7a7e90ad3fd0598c4b085bbd5e4e3123a85"}'::jsonb,
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
          url:='https://danymcflyy-oddstracker.vercel.app/api/cron/sync-scores',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer 072f4d684008a5db5f0ec04c26d9c7a7e90ad3fd0598c4b085bbd5e4e3123a85"}'::jsonb,
          body:='{}'::jsonb
      ) as request_id;
  $$
);

-- 4. Verify final list of jobs
SELECT * FROM cron.job;
