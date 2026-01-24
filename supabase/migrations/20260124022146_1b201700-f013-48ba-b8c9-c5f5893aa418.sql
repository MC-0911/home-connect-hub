-- Scheduled publishing support
ALTER TABLE public.blogs
ADD COLUMN IF NOT EXISTS publish_at timestamptz;

-- Ensure status can include 'scheduled'
DO $$
DECLARE
  c_name text;
BEGIN
  SELECT conname INTO c_name
  FROM pg_constraint
  WHERE conrelid = 'public.blogs'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%status%';

  IF c_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.blogs DROP CONSTRAINT %I', c_name);
  END IF;
END $$;

ALTER TABLE public.blogs
ADD CONSTRAINT blogs_status_check
CHECK (status IN ('draft', 'scheduled', 'published', 'archived'));

CREATE INDEX IF NOT EXISTS idx_blogs_publish_at
ON public.blogs (publish_at)
WHERE publish_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_blogs_status_publish_at
ON public.blogs (status, publish_at);