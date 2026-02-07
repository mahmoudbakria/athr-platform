-- Insert default values for volunteer points
INSERT INTO public.point_values (key, value) VALUES
    ('volunteer_delivery', 1.00)
ON CONFLICT (key) DO NOTHING;

-- Insert default value for enabling volunteer points (if not already handled by code default)
INSERT INTO public.system_settings (key, value) VALUES
    ('enable_volunteer_points', true)
ON CONFLICT (key) DO NOTHING;
