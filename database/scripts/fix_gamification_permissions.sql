-- Allow public read access to system_settings
DROP POLICY IF EXISTS "Settings are viewable by everyone" ON public.system_settings;
DROP POLICY IF EXISTS "Public read settings" ON public.system_settings;

CREATE POLICY "Public read settings"
ON public.system_settings FOR SELECT
USING (true);

-- Allow public read access to point_values
DROP POLICY IF EXISTS "Point values are viewable by everyone" ON public.point_values;
DROP POLICY IF EXISTS "Public read point values" ON public.point_values;

CREATE POLICY "Public read point values"
ON public.point_values FOR SELECT
USING (true);

-- Ensure tables are enabled for RLS (just in case)
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_values ENABLE ROW LEVEL SECURITY;

-- Grant access to anon and authenticated roles explicitly
GRANT SELECT ON public.system_settings TO anon, authenticated;
GRANT SELECT ON public.point_values TO anon, authenticated;
