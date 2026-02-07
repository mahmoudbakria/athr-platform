-- 1. Add volunteer_points column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS volunteer_points decimal(10, 2) DEFAULT 0;

-- 2. RPC to increment volunteer points specifically
CREATE OR REPLACE FUNCTION public.increment_volunteer_points(user_id uuid, amount decimal)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET volunteer_points = COALESCE(volunteer_points, 0) + amount
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Seed default values for volunteer points configuration
-- This is critical: if this row doesn't exist, the system assumes 0 points.
INSERT INTO public.point_values (key, value) VALUES
    ('volunteer_delivery', 1.00)
ON CONFLICT (key) DO NOTHING;

-- 4. Ensure the feature is enabled by default in settings
INSERT INTO public.system_settings (key, value) VALUES
    ('enable_volunteer_points', true)
ON CONFLICT (key) DO NOTHING;
