-- Add 'declined' value to property_status enum
ALTER TYPE property_status ADD VALUE IF NOT EXISTS 'declined';