-- 1. Update profiles table to support decimal points
-- We use NUMERIC or FLOAT. NUMERIC is better for exact precision, but FLOAT is fine.
-- Using decimal(10, 2) allows for values like 0.50, 100.50, etc.

DO $$
BEGIN
    -- Check if column exists generic way, or just run alter if we know it's there
    -- We'll just alter the type.
    -- If it fails because of casting, we might need a USING clause, but INT to NUMERIC is safe.
    ALTER TABLE public.profiles 
    ALTER COLUMN points TYPE decimal(10, 2) 
    USING points::decimal;
    
    -- Set default if not set (it was 0, now 0.00)
    ALTER TABLE public.profiles 
    ALTER COLUMN points SET DEFAULT 0;
END $$;

-- 2. Create point_values table for dynamic configuration
CREATE TABLE IF NOT EXISTS public.point_values (
    key text PRIMARY KEY,
    value decimal(10, 2) NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.point_values ENABLE ROW LEVEL SECURITY;

-- Policies for point_values
-- Public/Users can READ (needed to display potential points)
CREATE POLICY "Everyone can view point values" 
    ON public.point_values FOR SELECT 
    USING (true);

-- Only Admins/Mods can UPDATE/INSERT
CREATE POLICY "Admins can manage point values" 
    ON public.point_values FOR ALL 
    USING (public.is_admin_or_mod());

-- 3. Insert default values
INSERT INTO public.point_values (key, value) VALUES
    ('upload_item', 0.50),
    ('donate_item', 1.00)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 4. RPC for atomic point increment
CREATE OR REPLACE FUNCTION public.increment_points(user_id uuid, amount decimal)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET points = COALESCE(points, 0) + amount
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

