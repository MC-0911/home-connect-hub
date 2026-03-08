
ALTER TABLE public.agent_appointments ADD COLUMN IF NOT EXISTS reminder_sent boolean NOT NULL DEFAULT false;
