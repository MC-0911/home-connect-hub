-- Add new columns for interior and exterior features
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS basement text,
ADD COLUMN IF NOT EXISTS flooring text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS rooms text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS indoor_features text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS architectural_style text,
ADD COLUMN IF NOT EXISTS parking text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS roofing_type text,
ADD COLUMN IF NOT EXISTS outdoor_amenities text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS views text[] DEFAULT '{}'::text[];