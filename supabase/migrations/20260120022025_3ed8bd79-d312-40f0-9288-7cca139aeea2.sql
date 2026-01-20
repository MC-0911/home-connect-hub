-- Create service_bookings table
CREATE TABLE public.service_bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  service_slug text NOT NULL,
  service_name text NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  preferred_date date NOT NULL,
  preferred_time text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can submit a booking
CREATE POLICY "Anyone can submit service bookings"
ON public.service_bookings
FOR INSERT
WITH CHECK (true);

-- Policy: Users can view their own bookings
CREATE POLICY "Users can view their own bookings"
ON public.service_bookings
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Admins can view all bookings
CREATE POLICY "Admins can view all service bookings"
ON public.service_bookings
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy: Admins can update bookings
CREATE POLICY "Admins can update service bookings"
ON public.service_bookings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy: Admins can delete bookings
CREATE POLICY "Admins can delete service bookings"
ON public.service_bookings
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_service_bookings_updated_at
BEFORE UPDATE ON public.service_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();