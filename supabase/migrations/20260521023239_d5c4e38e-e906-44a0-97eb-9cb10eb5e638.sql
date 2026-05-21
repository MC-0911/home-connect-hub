
CREATE TABLE public.promotional_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image_url text NOT NULL,
  rating numeric NOT NULL DEFAULT 4.5,
  price numeric NOT NULL DEFAULT 0,
  original_price numeric,
  discount_percentage integer NOT NULL DEFAULT 0,
  cta_link text,
  start_date date,
  end_date date,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.promotional_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active promotional offers"
ON public.promotional_offers
FOR SELECT
USING (
  is_active = true
  AND (start_date IS NULL OR start_date <= CURRENT_DATE)
  AND (end_date IS NULL OR end_date >= CURRENT_DATE)
);

CREATE POLICY "Admins can view all promotional offers"
ON public.promotional_offers
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert promotional offers"
ON public.promotional_offers
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update promotional offers"
ON public.promotional_offers
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete promotional offers"
ON public.promotional_offers
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_promotional_offers_updated_at
BEFORE UPDATE ON public.promotional_offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed a few initial offers so the homepage isn't empty
INSERT INTO public.promotional_offers (title, subtitle, image_url, rating, price, original_price, discount_percentage, display_order)
VALUES
  ('Ramada by Wyndham', '5 star hotel in Katibagiya', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', 4.7, 3671, 5500, 33, 1),
  ('Hotel Clarks Avadh', '5 star hotel in Qaisar Bagh', 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80', 4.3, 4114, 8249, 50, 2),
  ('The Oberoi Resort', 'Luxury resort with private pool', 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80', 4.9, 6750, 9000, 25, 3),
  ('Hyatt Regency', 'Business hotel near airport', 'https://images.unsplash.com/photo-1549294413-26f195200c16?w=800&q=80', 4.6, 5200, 6500, 20, 4),
  ('Radisson Blu', 'Modern hotel in city center', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80', 4.5, 4800, 7000, 31, 5);
