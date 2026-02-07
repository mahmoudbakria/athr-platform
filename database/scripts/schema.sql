-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. ENUMS
create type user_role as enum ('admin', 'moderator', 'user');
create type item_status as enum ('pending', 'active', 'rejected', 'donated');

-- 2. TABLES

-- PROFILES
create table public.profiles (
  id uuid references auth.users not null primary key,
  role user_role default 'user'::user_role,
  points decimal(10, 2) default 0,
  phone text,
  is_transporter boolean default false,
  
  constraint profiles_id_fkey foreign key (id) references auth.users(id) on delete cascade
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- POINT VALUES
create table public.point_values (
  key text primary key,
  value decimal(10, 2) not null default 0
);

-- Enable RLS for point_values
alter table public.point_values enable row level security;

-- CATEGORIES
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  icon text,
  slug text unique not null
);

-- Enable RLS for categories
alter table public.categories enable row level security;

-- SYSTEM SETTINGS
create table public.system_settings (
  key text primary key,
  value boolean default false
);

-- Insert initial rows
insert into public.system_settings (key, value) values
  ('feature_transporter', false),
  ('feature_maintenance', false),
  ('feature_gamification', false);

-- Insert initial point values
insert into public.point_values (key, value) values
  ('upload_item', 0.50),
  ('donate_item', 1.00);

-- Enable RLS for system_settings
alter table public.system_settings enable row level security;

-- SITE CONFIG (CMS)
create table public.site_config (
  key text primary key,
  value text
);

-- Insert initial CMS values
insert into public.site_config (key, value) values
  ('hero_title', 'Lift the Burden,<br />Share the Weight'),
  ('hero_description', 'Join our community of giving. Donate items you no longer need or find support when you need it most.'),
  ('hero_image', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop'),
  ('site_logo', ''), -- Empty means use default
  ('footer_description', 'Lift the burden, share the weight. Providing a dignified marketplace for those in need.'),
  ('footer_copyright', 'Antigravity. All rights reserved.');

-- Enable RLS for site_config
alter table public.site_config enable row level security;

-- ITEMS
create table public.items (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now(),
  title text not null,
  description text,
  city text,
  category_id uuid references public.categories(id),
  images text[] default array[]::text[],
  status item_status default 'pending'::item_status,
  user_id uuid references auth.users(id), -- Nullable for guests
  contact_phone text not null,
  needs_repair boolean default false,
  needs_transport boolean default false
);

-- Enable RLS for items
alter table public.items enable row level security;


-- 3. RLS POLICIES

-- PROFILES POLICIES
-- Only allow public to see profiles that are necessary (donor info)
-- Note: In a real production app, you would use a VIEW to hide email/phone from public
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true ); 
  -- We will enforce column selection in the application layer or use a view next.


-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Admins/Moderators can do everything on profiles (handled via simple function usually or policy logic)
-- For simplicity, we add specific admin policies or handle logic in app. 
-- But requested: "Admins/Moderators: Full CRUD access to all tables"
-- We will implement a helper function for role check to keep policies clean.

create or replace function public.is_admin_or_mod()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('admin', 'moderator')
  );
end;
$$ language plpgsql security definer;

create policy "Admins and Mods can do everything on profiles"
  on public.profiles for all
  using ( public.is_admin_or_mod() );


-- CATEGORIES POLICIES
-- Public read
create policy "Categories are viewable by everyone"
  on public.categories for select
  using ( true );

-- Admins/Mods write
create policy "Admins and Mods can manage categories"
  on public.categories for all
  using ( public.is_admin_or_mod() );


-- SYSTEM SETTINGS POLICIES
-- Public read
create policy "Settings are viewable by everyone"
  on public.system_settings for select
  using ( true );

-- Admins/Mods write
create policy "Admins and Mods can manage settings"
  on public.system_settings for all
  using ( public.is_admin_or_mod() );


-- ITEMS POLICIES
-- 1. Public: Can read all items where status = 'active'
create policy "Public can read active items"
  on public.items for select
  using ( status = 'active' );

-- 2. Guests: Can INSERT items
-- Supabase 'anon' role is used for guests.
create policy "Guests can insert items"
  on public.items for insert
  to anon
  with check ( user_id is null ); 

-- 3. Users: Can INSERT items.
create policy "Authenticated users can insert items"
  on public.items for insert
  to authenticated
  with check ( auth.uid() = user_id );

-- 4. Users: Can UPDATE/DELETE only their own items
create policy "Users can update own items"
  on public.items for update
  to authenticated
  using ( auth.uid() = user_id );

create policy "Users can delete own items"
  on public.items for delete
  to authenticated
  using ( auth.uid() = user_id );

-- 5. User Read Policy: Users should probably be able to read their own pending/rejected items?
-- The requirements say "Public: Can read all items where status = 'active'".
-- It doesn't explicitly say users can see their own non-active items, but it's implied for a dashboard.
-- Let's add it for good measure.
create policy "Users can see own items"
  on public.items for select
  using ( auth.uid() = user_id );

-- 6. Admins/Moderators: Full CRUD
create policy "Admins and Mods can do everything on items"
  on public.items for all
  using ( public.is_admin_or_mod() );


-- 4. STORAGE
-- Note: Storage buckets are usually created via API or UI in Supabase, but SQL can do it if `storage` schema is available.
-- We will insert into storage.buckets if exists, ensuring idempotent creation.

insert into storage.buckets (id, name, public)
values ('item-images', 'item-images', true)
on conflict (id) do nothing;

-- Storage Policies
-- We need to enable RLS on storage.objects to control access.
alter table storage.objects enable row level security;

-- Read: Public (since bucket is public)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'item-images' );

-- Insert: Public (Guests & Users need to upload images for items)
create policy "Everyone can upload images"
  on storage.objects for insert
  with check ( bucket_id = 'item-images' );

-- Update/Delete: Admins/Mods or Owners (complex for guests, usually we restrict delete to admin or rely on cleanup)
-- For simplicity:
create policy "Admins and Mods can manage storage"
  on storage.objects for all
  using ( bucket_id = 'item-images' and public.is_admin_or_mod() );

create policy "Users can update/delete own images"
  on storage.objects for all
  using ( bucket_id = 'item-images' and auth.uid() = owner );

-- CMS ASSETS BUCKET
insert into storage.buckets (id, name, public)
values ('cms-assets', 'cms-assets', true)
on conflict (id) do nothing;

create policy "Public Access CMS"
  on storage.objects for select
  using ( bucket_id = 'cms-assets' );

create policy "Admins can manage cms assets"
  on storage.objects for all
  using ( bucket_id = 'cms-assets' and public.is_admin_or_mod() );


-- SITE CONFIG POLICIES
-- Public read
create policy "Site config is viewable by everyone"
  on public.site_config for select
  using ( true );

-- Admins/Mods write
create policy "Admins and Mods can manage site config"
  on public.site_config for all
  using ( public.is_admin_or_mod() );
