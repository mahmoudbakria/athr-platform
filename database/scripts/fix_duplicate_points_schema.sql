-- Add flags to track if points have been awarded to prevent duplicate awards on updates

-- 1. For Items: Track upload points and donation points separately
ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS upload_points_awarded boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS donation_points_awarded boolean DEFAULT false;

-- Backfill existing active items as having upload points awarded
UPDATE public.items 
SET upload_points_awarded = true 
WHERE status IN ('active', 'donated');

-- Backfill existing donated items as having donation points awarded
UPDATE public.items 
SET donation_points_awarded = true 
WHERE status = 'donated';

-- 2. For Volunteer Deliveries: Track completion/approval points
ALTER TABLE public.volunteer_deliveries
ADD COLUMN IF NOT EXISTS points_awarded boolean DEFAULT false;

-- Backfill existing approved volunteer deliveries
UPDATE public.volunteer_deliveries
SET points_awarded = true
WHERE status = 'approved';
