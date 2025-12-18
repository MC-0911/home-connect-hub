-- Create a function to get user emails for admins
CREATE OR REPLACE FUNCTION public.get_user_emails()
RETURNS TABLE (user_id uuid, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins to access this function
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  RETURN QUERY
  SELECT au.id as user_id, au.email::text
  FROM auth.users au;
END;
$$;