-- Migration: Change cron frequency from every minute to every 5 minutes
-- This updates the existing capture-closing-odds job

-- Unschedule the existing job (running every minute)
SELECT cron.unschedule('capture-closing-odds');

-- Reschedule with 5-minute frequency
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

-- Verify the job is scheduled correctly
SELECT
  jobid,
  jobname,
  schedule,
  active,
  command
FROM cron.job
WHERE jobname = 'capture-closing-odds';
