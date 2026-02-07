-- Migration to fix Storage Buckets (Avatars & CMS)

-- 1. Avatars Bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/png', 'image/jpeg', 'image/gif', 'image/webp'])
on conflict (id) do update set public = true;

-- Policies for Avatars
drop policy if exists "Public Access Avatars" on storage.objects;
create policy "Public Access Avatars"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

drop policy if exists "Authenticated Users can upload avatars" on storage.objects;
create policy "Authenticated Users can upload avatars"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'avatars' ); 
  -- We could restrict path to user id, but simple check for now

drop policy if exists "Users can update own avatar" on storage.objects;
create policy "Users can update own avatar"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1] ); 
  -- Assuming folder structure is user_id/filename. If not, simple ownership check if owner column is set.
  -- Simplified:
  
drop policy if exists "Users can manage own avatars" on storage.objects;
create policy "Users can manage own avatars"
  on storage.objects for all
  to authenticated
  using ( bucket_id = 'avatars' and auth.uid() = owner );

-- 2. CMS Assets Bucket (Logo, Banners)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cms-assets', 'cms-assets', true, 5242880, array['image/png', 'image/jpeg', 'image/gif', 'image/webp'])
on conflict (id) do update set public = true;

-- Policies for CMS Assets
drop policy if exists "Public Access CMS" on storage.objects;
create policy "Public Access CMS"
  on storage.objects for select
  using ( bucket_id = 'cms-assets' );

drop policy if exists "Admins can manage cms assets" on storage.objects;
-- Relying on is_admin_or_mod() function
create policy "Admins can manage cms assets"
  on storage.objects for all
  using ( bucket_id = 'cms-assets' and public.is_admin_or_mod() );
