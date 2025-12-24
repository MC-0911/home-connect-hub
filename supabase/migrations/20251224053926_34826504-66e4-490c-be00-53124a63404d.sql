-- Create trigger for new property listing alerts
CREATE OR REPLACE FUNCTION public.create_new_listing_alert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.alerts (user_id, title, message, type, link)
  VALUES (
    NEW.user_id,
    'Listing Created Successfully',
    'Your property "' || NEW.title || '" has been listed successfully.',
    'success',
    '/property/' || NEW.id
  );
  RETURN NEW;
END;
$function$;

-- Create trigger for property status change alerts
CREATE OR REPLACE FUNCTION public.create_status_change_alert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only trigger if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.alerts (user_id, title, message, type, link)
    VALUES (
      NEW.user_id,
      'Listing Status Updated',
      'Your property "' || NEW.title || '" status changed to ' || NEW.status || '.',
      'info',
      '/property/' || NEW.id
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- Create trigger for new listing
DROP TRIGGER IF EXISTS on_new_property_listing ON public.properties;
CREATE TRIGGER on_new_property_listing
  AFTER INSERT ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.create_new_listing_alert();

-- Create trigger for status change
DROP TRIGGER IF EXISTS on_property_status_change ON public.properties;
CREATE TRIGGER on_property_status_change
  AFTER UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.create_status_change_alert();

-- Create trigger for new visit (if not exists)
DROP TRIGGER IF EXISTS on_new_visit_request ON public.property_visits;
CREATE TRIGGER on_new_visit_request
  AFTER INSERT ON public.property_visits
  FOR EACH ROW
  EXECUTE FUNCTION public.create_visit_alert();

-- Create trigger for new offer (if not exists)
DROP TRIGGER IF EXISTS on_new_offer ON public.property_offers;
CREATE TRIGGER on_new_offer
  AFTER INSERT ON public.property_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.create_offer_alert();