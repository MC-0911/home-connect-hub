
SELECT cron.schedule(
  'appointment-reminders-every-15min',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url:='https://sgrjjnjfllcbmchaxyyu.supabase.co/functions/v1/appointment-reminders',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNncmpqbmpmbGxjYm1jaGF4eXl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NjQ4NTksImV4cCI6MjA4MDM0MDg1OX0.0JZ8C88p85oDBJQ-Dn3QKHlkbBXdFC6MZx-C1AKD99E"}'::jsonb,
    body:='{"time": "now"}'::jsonb
  ) AS request_id;
  $$
);
