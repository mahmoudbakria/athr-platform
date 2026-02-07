-- COMPLETELY DISABLE RLS for settings tables to ensure they are readable
ALTER TABLE public.system_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_values DISABLE ROW LEVEL SECURITY;

-- Grant explicit SELECT to everyone just in case
GRANT SELECT ON public.system_settings TO public;
GRANT SELECT ON public.point_values TO public;
GRANT SELECT ON public.system_settings TO anon;
GRANT SELECT ON public.point_values TO anon;
GRANT SELECT ON public.system_settings TO authenticated;
GRANT SELECT ON public.point_values TO authenticated;

-- Force value to TRUE manually to verify if it's a data issue
UPDATE public.system_settings 
SET value = true 
WHERE key = 'feature_gamification';

-- If row missing, insert it
INSERT INTO public.system_settings (key, value)
VALUES ('feature_gamification', true)
ON CONFLICT (key) DO UPDATE SET value = true;
