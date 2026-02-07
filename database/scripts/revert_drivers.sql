-- Revert Volunteer Delivery System
-- Warning: This DESTROYS data related to drivers and item transport needs.

-- 0. Drop dependent policies first
DROP POLICY IF EXISTS "Drivers can update items" ON public.items;

-- 1. Remove columns from items
ALTER TABLE public.items DROP COLUMN IF EXISTS needs_transport;
ALTER TABLE public.items DROP COLUMN IF EXISTS volunteer_id;
ALTER TABLE public.items DROP COLUMN IF EXISTS latitude;
ALTER TABLE public.items DROP COLUMN IF EXISTS longitude;

-- 2. Remove columns from profiles
-- Dropping is_transporter as requested
ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_transporter;

ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_driver;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_verified_driver;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS driver_city;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS driver_phone;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS vehicle_type;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS vehicle_notes;

-- 3. Remove system settings (cleanup key-value pairs)
DELETE FROM public.system_settings WHERE key = 'feature_drivers_enabled';
DELETE FROM public.system_settings WHERE key = 'feature_transporter';

-- 4. Reload schema cache
NOTIFY pgrst, 'reload schema';
