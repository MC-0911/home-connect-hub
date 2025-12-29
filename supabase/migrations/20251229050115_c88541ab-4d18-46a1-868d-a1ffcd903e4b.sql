-- Add 'under_review' value to property_status enum
ALTER TYPE property_status ADD VALUE IF NOT EXISTS 'under_review';