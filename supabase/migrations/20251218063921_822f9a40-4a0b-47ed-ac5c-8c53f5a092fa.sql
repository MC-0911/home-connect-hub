-- Add attachment fields to messages table
ALTER TABLE public.messages
ADD COLUMN attachment_url TEXT,
ADD COLUMN attachment_type TEXT,
ADD COLUMN attachment_name TEXT;

-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for message attachments
CREATE POLICY "Anyone can view message attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'message-attachments');

CREATE POLICY "Authenticated users can upload message attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'message-attachments' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own message attachments"
ON storage.objects FOR DELETE
USING (bucket_id = 'message-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);