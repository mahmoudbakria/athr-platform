-- CMS MIGRATION SCRIPT
-- Run this script to add CMS capabilities to your existing database.

-- 1. Create site_config table
create table if not exists public.site_config (
  key text primary key,
  value text
);

-- 2. Enable RLS
alter table public.site_config enable row level security;

-- 3. Insert default values (only if they don't exist)
insert into public.site_config (key, value) values
  ('hero_title', 'Lift the Burden,<br />Share the Weight'),
  ('hero_description', 'Join our community of giving. Donate items you no longer need or find support when you need it most.'),
  ('hero_image', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop'),
  ('site_logo', ''), 
  ('footer_description', 'Lift the burden, share the weight. Providing a dignified marketplace for those in need.'),
  ('footer_copyright', 'Antigravity. All rights reserved.')
on conflict (key) do nothing;

-- 4. Add RLS Policies for site_config
-- Drop existing policies if they exist to avoid errors (optional but safer for re-runs)
drop policy if exists "Site config is viewable by everyone" on public.site_config;
drop policy if exists "Admins and Mods can manage site config" on public.site_config;

create policy "Site config is viewable by everyone"
  on public.site_config for select
  using ( true );

create policy "Admins and Mods can manage site config"
  on public.site_config for all
  using ( public.is_admin_or_mod() );

-- 5. Create Storage Bucket for CMS Assets
insert into storage.buckets (id, name, public)
values ('cms-assets', 'cms-assets', true)
on conflict (id) do nothing;

-- 6. Add Storage Policies
-- Note: We need to make sure we don't duplicate policies.
-- In Supabase SQL editor, usually best to just run these.

-- Drop potential existing policies for this bucket to be safe
drop policy if exists "Public Access CMS" on storage.objects;
drop policy if exists "Admins can manage cms assets" on storage.objects;

create policy "Public Access CMS"
  on storage.objects for select
  using ( bucket_id = 'cms-assets' );

create policy "Admins can manage cms assets"
  on storage.objects for all
  using ( bucket_id = 'cms-assets' and public.is_admin_or_mod() );
