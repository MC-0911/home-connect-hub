-- Update the default status for new properties to 'under_review'
ALTER TABLE public.properties ALTER COLUMN status SET DEFAULT 'under_review'::property_status;