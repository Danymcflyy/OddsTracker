-- Migration: Increase scan-opening frequency from 5 min to 2 min
-- Date: 2026-01-26
-- Purpose: Process 30 events every 2 minutes instead of 10 every 5 minutes
-- Capacity: 900 events/hour (vs 120 previously) = 7.5x boost

-- Unschedule existing job (with error handling)
DO $
BEGIN
  PERFORM cron.unschedule('scan-opening-odds');
EXCEPTION WHEN OTHERS THEN
  NULL; -- Ignore error if job doesn't exist
END $;

-- Reschedule with 2-minute frequency
SELECT cron.schedule(
  'scan-opening-odds',
  '*/2 * * * *', -- Every 2 minutes (increased from */5)
  $$
  SELECT net.http_post(
    url:='https://danymcflyy-oddstracker.vercel.app/api/cron/scan-opening',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer 072f4d684008a5db5f0ec04c26d9c7a7e90ad3fd0598c4b085bbd5e4e3123a85"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
