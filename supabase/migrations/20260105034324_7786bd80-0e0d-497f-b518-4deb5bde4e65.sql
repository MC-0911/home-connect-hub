-- Add new property fields
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS year_renovated integer,
ADD COLUMN IF NOT EXISTS parcel_number text,
ADD COLUMN IF NOT EXISTS annual_tax numeric,
ADD COLUMN IF NOT EXISTS lot_size_unit text DEFAULT 'sqft',
ADD COLUMN IF NOT EXISTS neighborhood_amenities jsonb DEFAULT '{}'::jsonb,
-- Land-specific fields
ADD COLUMN IF NOT EXISTS zoning_type text,
ADD COLUMN IF NOT EXISTS allowed_uses text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS buildable text,
ADD COLUMN IF NOT EXISTS can_subdivide text,
ADD COLUMN IF NOT EXISTS road_access text,
ADD COLUMN IF NOT EXISTS utilities_available text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS water_rights text,
ADD COLUMN IF NOT EXISTS topography text,
ADD COLUMN IF NOT EXISTS land_views text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS fencing text,
ADD COLUMN IF NOT EXISTS vegetation text,
ADD COLUMN IF NOT EXISTS distance_to_town text,
ADD COLUMN IF NOT EXISTS distance_to_grocery text,
ADD COLUMN IF NOT EXISTS recreational_features text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS land_additional_notes text;