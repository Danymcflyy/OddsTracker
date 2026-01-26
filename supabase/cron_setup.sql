-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the Closing Odds Capture Job (Every minute)
-- NOTE: Replace 'https://your-project.vercel.app' with your actual production URL
-- NOTE: Replace 'YOUR_SUPABASE_CRON_SECRET' with the value from .env.local (SUPABASE_CRON_SECRET)

SELECT cron.schedule(
  'capture-closing-odds', -- Job name
  '* * * * *',            -- Schedule: Every minute
  $$
  SELECT
    net.http_post(
      url:='https://your-project.vercel.app/api/cron/capture-closing',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SUPABASE_CRON_SECRET"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Optional: Job to check for opening odds (Every hour)
SELECT cron.schedule(
  'check-opening-odds',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
      url:='https://your-project.vercel.app/api/cron/check-opening', -- You need to create this route first
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SUPABASE_CRON_SECRET"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- To check status of jobs:
-- SELECT * FROM cron.job;

-- To view logs of executions:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- To unschedule a job:
-- SELECT cron.unschedule('capture-closing-odds');