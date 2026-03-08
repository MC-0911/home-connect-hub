CREATE TABLE public.rent_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  payment_month text NOT NULL,
  payment_method text DEFAULT 'cash',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rent_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rent payments"
  ON public.rent_payments FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rent payments"
  ON public.rent_payments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rent payments"
  ON public.rent_payments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rent payments"
  ON public.rent_payments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);