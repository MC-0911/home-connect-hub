-- Create agent_documents table
CREATE TABLE public.agent_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size bigint DEFAULT 0,
  file_type text DEFAULT 'other',
  document_type text NOT NULL DEFAULT 'other',
  property_name text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents"
  ON public.agent_documents FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
  ON public.agent_documents FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
  ON public.agent_documents FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON public.agent_documents FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Create storage bucket for agent documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'agent-documents',
  'agent-documents',
  true,
  20971520,
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/webp']
);

-- Storage RLS policies
CREATE POLICY "Users can upload their own documents"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'agent-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'agent-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own documents"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'agent-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view agent documents publicly"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'agent-documents');