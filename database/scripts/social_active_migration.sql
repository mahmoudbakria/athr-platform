-- SOCIAL MEDIA ACTIVE FLAGS
-- Adds keys to toggle social media links without removing the URL.

insert into public.site_config (key, value) values
  ('social_facebook_active', 'true'),
  ('social_twitter_active', 'true'),
  ('social_instagram_active', 'true')
on conflict (key) do nothing;
