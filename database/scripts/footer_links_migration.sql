-- FOOTER LINKS MIGRATION
-- Adds keys for footer link columns.
-- Format for links is multiline: Label|URL

insert into public.site_config (key, value) values
  ('footer_col1_title', 'Platform'),
  ('footer_col1_links', 'About Us|/about
How it Works|/how-it-works
Our Impact|/impact
Contact|/contact'),
  ('footer_col2_title', 'Legal'),
  ('footer_col2_links', 'Privacy Policy|/privacy
Terms of Service|/terms
Cookie Policy|/cookies')
on conflict (key) do nothing;
