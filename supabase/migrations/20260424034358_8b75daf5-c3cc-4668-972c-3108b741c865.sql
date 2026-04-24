-- Extend agent_verifications table with new fields
ALTER TABLE public.agent_verifications
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS agency_name text,
  ADD COLUMN IF NOT EXISTS years_experience text,
  ADD COLUMN IF NOT EXISTS license_expiry date,
  ADD COLUMN IF NOT EXISTS board_membership_url text,
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz;

-- Ensure unique verification per user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'agent_verifications_user_id_unique'
  ) THEN
    ALTER TABLE public.agent_verifications
      ADD CONSTRAINT agent_verifications_user_id_unique UNIQUE (user_id);
  END IF;
END $$;

-- Allow users to update and delete their own pending verification
DROP POLICY IF EXISTS "Users can update their own verification" ON public.agent_verifications;
CREATE POLICY "Users can update their own verification"
  ON public.agent_verifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own verification" ON public.agent_verifications;
CREATE POLICY "Users can delete their own verification"
  ON public.agent_verifications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND status IN ('pending', 'rejected'));

DROP POLICY IF EXISTS "Admins can delete verifications" ON public.agent_verifications;
CREATE POLICY "Admins can delete verifications"
  ON public.agent_verifications
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Updated_at trigger
DROP TRIGGER IF EXISTS update_agent_verifications_updated_at ON public.agent_verifications;
CREATE TRIGGER update_agent_verifications_updated_at
  BEFORE UPDATE ON public.agent_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create private storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('agent-verifications', 'agent-verifications', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: users manage files under {user_id}/...
DROP POLICY IF EXISTS "Users can view own verification files" ON storage.objects;
CREATE POLICY "Users can view own verification files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'agent-verifications'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can upload own verification files" ON storage.objects;
CREATE POLICY "Users can upload own verification files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'agent-verifications'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update own verification files" ON storage.objects;
CREATE POLICY "Users can update own verification files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'agent-verifications'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete own verification files" ON storage.objects;
CREATE POLICY "Users can delete own verification files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'agent-verifications'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Admins can view all verification files" ON storage.objects;
CREATE POLICY "Admins can view all verification files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'agent-verifications'
    AND has_role(auth.uid(), 'admin'::app_role)
  );