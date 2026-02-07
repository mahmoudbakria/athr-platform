-- 1. Add avatar_url to profiles
alter table public.profiles
add column if not exists avatar_url text;

-- 2. Create avatars bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/png', 'image/jpeg', 'image/gif', 'image/webp'])
on conflict (id) do update set public = true;

-- 3. Storage Policies

-- Public Read
create policy "Public Access Avatars"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Authenticated User Upload (Own folder or just any file? usually purely random names are fine)
-- We'll allow ANY authenticated user to upload to this bucket.
create policy "Authenticated Users can upload avatars"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'avatars' );

-- Authenticated User Update/Delete (Own files)
-- Since we don't strictly enforce folder paths like /userid/filename, we'll allow them to manage based on ownership
create policy "Users can update own avatars"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'avatars' and auth.uid() = owner );

create policy "Users can delete own avatars"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'avatars' and auth.uid() = owner );
