
CREATE TABLE public.agent_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  license_number text NOT NULL,
  state text NOT NULL,
  license_photo_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.agent_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own verification"
ON public.agent_verifications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own verification"
ON public.agent_verifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all verifications"
ON public.agent_verifications FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update verifications"
ON public.agent_verifications FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_agent_verifications_updated_at
BEFORE UPDATE ON public.agent_verifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
