-- Create property_visits table
CREATE TABLE public.property_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  seller_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create property_offers table
CREATE TABLE public.property_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  offer_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  seller_response TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.property_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_offers ENABLE ROW LEVEL SECURITY;

-- RLS policies for property_visits
CREATE POLICY "Users can view their own visits" ON public.property_visits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Sellers can view visits on their properties" ON public.property_visits
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Users can create visits" ON public.property_visits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own visits" ON public.property_visits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Sellers can update visits on their properties" ON public.property_visits
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own visits" ON public.property_visits
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for property_offers
CREATE POLICY "Users can view their own offers" ON public.property_offers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Sellers can view offers on their properties" ON public.property_offers
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Users can create offers" ON public.property_offers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own offers" ON public.property_offers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Sellers can update offers on their properties" ON public.property_offers
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own offers" ON public.property_offers
  FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_property_visits_updated_at
  BEFORE UPDATE ON public.property_visits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_property_offers_updated_at
  BEFORE UPDATE ON public.property_offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();