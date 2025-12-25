-- Make the message-attachments bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'message-attachments';

-- Drop any existing policies on message-attachments
DROP POLICY IF EXISTS "Users can upload message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can view message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Conversation participants can view attachments" ON storage.objects;
DROP POLICY IF EXISTS "Conversation participants can upload attachments" ON storage.objects;

-- Create policy: Only conversation participants can upload attachments
-- Files are stored as: {conversation_id}/{filename}
CREATE POLICY "Conversation participants can upload attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'message-attachments' 
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id::text = (storage.foldername(name))[1]
    AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
);

-- Create policy: Only conversation participants can view attachments
CREATE POLICY "Conversation participants can view attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'message-attachments' 
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id::text = (storage.foldername(name))[1]
    AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
);

-- Create policy: Only conversation participants can delete their attachments
CREATE POLICY "Conversation participants can delete attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'message-attachments' 
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id::text = (storage.foldername(name))[1]
    AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
);