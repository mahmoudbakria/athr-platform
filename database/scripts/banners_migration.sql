-- BANNERS MIGRATION
-- Adds default keys for homepage banners

insert into public.site_config (key, value) values
  ('banner_top_active', 'false'),
  ('banner_top_image', ''),
  ('banner_top_link', ''),
  
  ('banner_middle_active', 'false'),
  ('banner_middle_image', ''),
  ('banner_middle_link', ''),
  
  ('banner_bottom_active', 'false'),
  ('banner_bottom_image', ''),
  ('banner_bottom_link', '')
on conflict (key) do nothing;
