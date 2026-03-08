CREATE TABLE public.agent_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  task_date date,
  task_time text NOT NULL DEFAULT '9:00 AM',
  priority text NOT NULL DEFAULT 'medium',
  is_completed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks"
  ON public.agent_tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks"
  ON public.agent_tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON public.agent_tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON public.agent_tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_agent_tasks_updated_at
  BEFORE UPDATE ON public.agent_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();