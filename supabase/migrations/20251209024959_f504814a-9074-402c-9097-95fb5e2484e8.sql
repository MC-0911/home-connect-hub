-- Create buyer_requirements table
CREATE TABLE public.buyer_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('buy', 'rent', 'both')),
  property_type TEXT NOT NULL,
  min_bedrooms INTEGER NOT NULL DEFAULT 0,
  min_bathrooms INTEGER NOT NULL DEFAULT 1,
  preferred_locations TEXT[] DEFAULT '{}',
  max_distance INTEGER,
  min_budget NUMERIC,
  max_budget NUMERIC,
  must_have_features TEXT[] DEFAULT '{}',
  additional_requirements TEXT,
  move_timeline TEXT,
  current_situation TEXT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  preferred_contact_method TEXT DEFAULT 'email',
  marketing_consent BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'matched', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.buyer_requirements ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for lead generation)
CREATE POLICY "Anyone can submit property requirements"
ON public.buyer_requirements
FOR INSERT
WITH CHECK (true);

-- Users can view their own submissions
CREATE POLICY "Users can view their own requirements"
ON public.buyer_requirements
FOR SELECT
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_buyer_requirements_updated_at
BEFORE UPDATE ON public.buyer_requirements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();