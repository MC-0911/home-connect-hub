CREATE TABLE public.promo_offer_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_id UUID NULL REFERENCES public.promotional_offers(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('impression','cta_click')),
  session_id TEXT NULL,
  device_type TEXT NULL,
  page_path TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_promo_events_offer ON public.promo_offer_events(offer_id);
CREATE INDEX idx_promo_events_type_created ON public.promo_offer_events(event_type, created_at DESC);

ALTER TABLE public.promo_offer_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert promo events"
ON public.promo_offer_events
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view promo events"
ON public.promo_offer_events
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));