-- Store author display fields directly on blogs so BlogPost can render them publicly
ALTER TABLE public.blogs
ADD COLUMN IF NOT EXISTS author_name text,
ADD COLUMN IF NOT EXISTS author_avatar_url text;