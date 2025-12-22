-- =====================================================
-- FIX 1: Improve trigger functions to validate seller_id matches property owner
-- =====================================================

-- Drop existing trigger functions and recreate with validation
CREATE OR REPLACE FUNCTION public.create_visit_alert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  property_owner_id uuid;
BEGIN
  -- Validate that seller_id matches the property owner
  SELECT user_id INTO property_owner_id
  FROM public.properties
  WHERE id = NEW.property_id;
  
  -- Only create alert if seller_id matches property owner
  IF property_owner_id IS NOT NULL AND property_owner_id = NEW.seller_id THEN
    INSERT INTO public.alerts (user_id, title, message, type, link)
    VALUES (
      NEW.seller_id,
      'New Visit Request',
      'Someone has requested to visit your property',
      'info',
      '/dashboard'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_offer_alert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  property_owner_id uuid;
BEGIN
  -- Validate that seller_id matches the property owner
  SELECT user_id INTO property_owner_id
  FROM public.properties
  WHERE id = NEW.property_id;
  
  -- Only create alert if seller_id matches property owner
  IF property_owner_id IS NOT NULL AND property_owner_id = NEW.seller_id THEN
    INSERT INTO public.alerts (user_id, title, message, type, link)
    VALUES (
      NEW.seller_id,
      'New Offer Received',
      'You have received a new offer on your property',
      'success',
      '/dashboard'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- =====================================================
-- FIX 2: Add database-level validation for buyer_requirements
-- =====================================================

-- Add length constraints by altering columns to have sensible limits
-- Using CHECK constraints for validation

-- Add check constraint for email format (basic validation)
ALTER TABLE public.buyer_requirements 
ADD CONSTRAINT buyer_requirements_email_format_check 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add length constraints
ALTER TABLE public.buyer_requirements 
ADD CONSTRAINT buyer_requirements_email_length_check 
CHECK (char_length(email) <= 320);

ALTER TABLE public.buyer_requirements 
ADD CONSTRAINT buyer_requirements_full_name_length_check 
CHECK (char_length(full_name) <= 200);

ALTER TABLE public.buyer_requirements 
ADD CONSTRAINT buyer_requirements_phone_length_check 
CHECK (phone IS NULL OR char_length(phone) <= 30);

ALTER TABLE public.buyer_requirements 
ADD CONSTRAINT buyer_requirements_additional_req_length_check 
CHECK (additional_requirements IS NULL OR char_length(additional_requirements) <= 5000);

-- Add constraints for positive budget values
ALTER TABLE public.buyer_requirements 
ADD CONSTRAINT buyer_requirements_min_budget_positive_check 
CHECK (min_budget IS NULL OR min_budget >= 0);

ALTER TABLE public.buyer_requirements 
ADD CONSTRAINT buyer_requirements_max_budget_positive_check 
CHECK (max_budget IS NULL OR max_budget >= 0);

-- Ensure max_budget >= min_budget when both are set
ALTER TABLE public.buyer_requirements 
ADD CONSTRAINT buyer_requirements_budget_range_check 
CHECK (min_budget IS NULL OR max_budget IS NULL OR max_budget >= min_budget);

-- Add constraint for positive distance
ALTER TABLE public.buyer_requirements 
ADD CONSTRAINT buyer_requirements_max_distance_positive_check 
CHECK (max_distance IS NULL OR max_distance >= 0);

-- Add constraints for bedrooms and bathrooms
ALTER TABLE public.buyer_requirements 
ADD CONSTRAINT buyer_requirements_min_bedrooms_positive_check 
CHECK (min_bedrooms >= 0);

ALTER TABLE public.buyer_requirements 
ADD CONSTRAINT buyer_requirements_min_bathrooms_positive_check 
CHECK (min_bathrooms >= 0);