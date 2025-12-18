-- Add counter_amount column to property_offers
ALTER TABLE public.property_offers 
ADD COLUMN counter_amount NUMERIC;