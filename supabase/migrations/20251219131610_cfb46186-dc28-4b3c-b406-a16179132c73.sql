-- Create trigger function for visit alerts
CREATE OR REPLACE FUNCTION public.create_visit_alert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.alerts (user_id, title, message, type, link)
  VALUES (
    NEW.seller_id,
    'New Visit Request',
    'Someone has requested to visit your property',
    'info',
    '/dashboard'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for property visits
CREATE TRIGGER on_visit_created
AFTER INSERT ON public.property_visits
FOR EACH ROW
EXECUTE FUNCTION public.create_visit_alert();

-- Create trigger function for offer alerts
CREATE OR REPLACE FUNCTION public.create_offer_alert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.alerts (user_id, title, message, type, link)
  VALUES (
    NEW.seller_id,
    'New Offer Received',
    'You have received a new offer on your property',
    'success',
    '/dashboard'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for property offers
CREATE TRIGGER on_offer_created
AFTER INSERT ON public.property_offers
FOR EACH ROW
EXECUTE FUNCTION public.create_offer_alert();