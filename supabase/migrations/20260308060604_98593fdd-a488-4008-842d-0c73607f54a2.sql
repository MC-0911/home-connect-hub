CREATE OR REPLACE FUNCTION public.get_property_view_counts(_user_id uuid)
RETURNS TABLE(property_id text, view_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    replace(pv.page_path, '/property/', '') AS property_id,
    count(*) AS view_count
  FROM public.page_views pv
  INNER JOIN public.properties p ON replace(pv.page_path, '/property/', '') = p.id::text
  WHERE pv.page_path LIKE '/property/%'
    AND p.user_id = _user_id
  GROUP BY pv.page_path;
$$;