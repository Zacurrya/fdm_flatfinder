-- Add source column to Listings table
-- Run this in the Supabase SQL Editor

ALTER TABLE "Listings"
ADD COLUMN IF NOT EXISTS "source" TEXT DEFAULT 'FDM' NOT NULL;

-- Add check constraint for valid sources
ALTER TABLE "Listings"
DROP CONSTRAINT IF EXISTS "Listings_source_check";

ALTER TABLE "Listings"
ADD CONSTRAINT "Listings_source_check"
CHECK ("source" IN ('FDM', 'RIGHTMOVE', 'OPENRENT', 'ZOOPLA'));
