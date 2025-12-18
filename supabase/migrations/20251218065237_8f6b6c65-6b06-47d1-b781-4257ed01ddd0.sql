-- Add is_suspended column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_suspended boolean DEFAULT false,
ADD COLUMN suspended_at timestamp with time zone,
ADD COLUMN suspension_reason text;

-- Add policy for admins to update suspension status
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));