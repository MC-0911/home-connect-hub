-- Add views column to blogs table
ALTER TABLE public.blogs 
ADD COLUMN views integer NOT NULL DEFAULT 0;