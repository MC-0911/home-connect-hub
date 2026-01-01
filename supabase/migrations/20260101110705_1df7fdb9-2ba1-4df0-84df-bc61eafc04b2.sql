-- Drop duplicate triggers that are causing double alerts
DROP TRIGGER IF EXISTS on_new_visit_request ON public.property_visits;
DROP TRIGGER IF EXISTS on_new_offer ON public.property_offers;