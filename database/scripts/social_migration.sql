-- SOCIAL MEDIA MIGRATION
-- Adds keys for social media links.
-- If you want to "disable" a link, simply leave the value empty in the CMS.

insert into public.site_config (key, value) values
  ('social_facebook', 'https://facebook.com'),
  ('social_twitter', 'https://twitter.com'),
  ('social_instagram', 'https://instagram.com')
on conflict (key) do nothing;
