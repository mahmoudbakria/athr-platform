-- Restore Location Columns for Items
-- Adds latitude and longitude back to items table without driver logic

ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS latitude double precision,
ADD COLUMN IF NOT EXISTS longitude double precision;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
