-- Migration: Complete Supabase Cron Setup
-- Sets up all 4 cron jobs for OddsTracker

-- Enable required extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Unschedule all existing jobs (clean slate)
-- Using DO block to ignore errors if jobs don't exist
DO $$
BEGIN
  PERFORM cron.unschedule('capture-closing-odds');
EXCEPTION WHEN OTHERS THEN
  NULL; -- Ignore error if job doesn't exist
END $$;

DO $$
BEGIN
  PERFORM cron.unschedule('scan-opening-odds');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$
BEGIN
  PERFORM cron.unschedule('check-opening-odds'); -- Old name
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$
BEGIN
  PERFORM cron.unschedule('sync-events');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$
BEGIN
  PERFORM cron.unschedule('sync-scores-closing');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ============================================================================
-- JOB 1: Capture Closing Odds (Every 5 minutes)
-- ============================================================================
-- Purpose: Capture multi-snapshot closing odds for events near kickoff
-- Window: M-15 to M+15 (15 minutes before/after kickoff)
-- Cost: ~1 credit per event per snapshot
SELECT cron.schedule(
  'capture-closing-odds',
  '*/5 * * * *',  -- Every 5 minutes
  $$
  SELECT
    net.http_post(
      url:='https://danymcflyy-oddstracker.vercel.app/api/cron/capture-closing',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer 072f4d684008a5db5f0ec04c26d9c7a7e90ad3fd0598c4b085bbd5e4e3123a85"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- ============================================================================
-- JOB 2: Scan Opening Odds (Every 5 minutes)
-- ============================================================================
-- Purpose: Capture opening odds for pending markets
-- Cost: ~6 credits per event with pending markets
SELECT cron.schedule(
  'scan-opening-odds',
  '*/5 * * * *',  -- Every 5 minutes
  $$
  SELECT
    net.http_post(
      url:='https://danymcflyy-oddstracker.vercel.app/api/cron/scan-opening',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer 072f4d684008a5db5f0ec04c26d9c7a7e90ad3fd0598c4b085bbd5e4e3123a85"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- ============================================================================
-- JOB 3: Sync Events (Every hour)
-- ============================================================================
-- Purpose: Discover new upcoming events for tracked sports
-- Cost: 0 credits (FREE endpoint)
SELECT cron.schedule(
  'sync-events',
  '17 * * * *',  -- Every hour at :17 (avoid :00 high load)
  $$
  SELECT
    net.http_post(
      url:='https://danymcflyy-oddstracker.vercel.app/api/cron/sync-events',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer 072f4d684008a5db5f0ec04c26d9c7a7e90ad3fd0598c4b085bbd5e4e3123a85"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- ============================================================================
-- JOB 4: Sync Scores & Closing Odds (Daily)
-- ============================================================================
-- Purpose: Update scores and capture closing odds for completed events
-- Cost: ~2 credits for scores + ~6 credits per completed event
SELECT cron.schedule(
  'sync-scores-closing',
  '27 2 * * *',  -- Daily at 2:27 AM UTC
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
-- VERIFICATION
-- ============================================================================
-- List all scheduled jobs
SELECT
  jobid,
  jobname,
  schedule,
  active,
  nodename
FROM cron.job
ORDER BY jobname;

-- Expected output:
--  jobname               | schedule     | active
-- -----------------------+--------------+--------
--  capture-closing-odds  | */5 * * * *  | t
--  scan-opening-odds     | */5 * * * *  | t
--  sync-events           | 17 * * * *   | t
--  sync-scores-closing   | 27 2 * * *   | t

COMMENT ON EXTENSION pg_cron IS 'Job scheduler for PostgreSQL - Used for OddsTracker automated data collection';
