-- THEME COLOR MIGRATION
-- Adds key for customizable primary color.

insert into public.site_config (key, value) values
  ('theme_primary_color', 'oklch(0.6 0.15 180)')
on conflict (key) do nothing;
