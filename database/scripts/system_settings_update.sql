-- 5. System Settings Defaults
-- Insert default values for the new volunteer feature flags
-- This ensures the system behaves predictably even before an admin toggles them.

INSERT INTO public.system_settings (key, value)
VALUES 
    ('feature_volunteer_delivery', true),
    ('feature_item_related_volunteers', true)
ON CONFLICT (key) DO NOTHING;
