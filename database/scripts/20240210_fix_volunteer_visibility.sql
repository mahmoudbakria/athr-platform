-- Migration: Fix Volunteer Visibility
-- This script adds a public Row Level Security (RLS) policy to allow reading approved volunteer deliveries.
-- This is required for the "Related Volunteers" section to appear on item detail pages.

BEGIN;

-- 1. Enable RLS if not already enabled
ALTER TABLE IF EXISTS public.volunteer_deliveries ENABLE ROW LEVEL SECURITY;

-- 2. Add public read access to approved deliveries
DROP POLICY IF EXISTS "Anyone can read approved volunteer deliveries" ON public.volunteer_deliveries;
CREATE POLICY "Anyone can read approved volunteer deliveries"
  ON public.volunteer_deliveries FOR SELECT
  USING ( status = 'approved' );

COMMIT;
