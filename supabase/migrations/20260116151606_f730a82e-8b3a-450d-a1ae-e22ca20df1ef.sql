-- Create a function to increment blog views
CREATE OR REPLACE FUNCTION public.increment_blog_views(blog_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.blogs
  SET views = views + 1
  WHERE slug = blog_slug AND status = 'published';
END;
$$;