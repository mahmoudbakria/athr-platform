-- FINAL ATTEMPT: Allow ANYONE (including guests) to upload to this bucket.
-- If this fails, then the bucket itself might be missing or the project is in a broken state.

-- 1. Ensure Bucket Exists and is Public
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('category-images', 'category-images', true, 5242880, array['image/png', 'image/jpeg', 'image/gif', 'image/webp'])
on conflict (id) do update set public = true;

-- 2. Wipe Policies
drop policy if exists "Public Access Categories" on storage.objects;
drop policy if exists "Admins and Mods can upload category images" on storage.objects;
drop policy if exists "Authenticated Users can upload" on storage.objects;
drop policy if exists "Authenticated Users can manage" on storage.objects;
drop policy if exists "Allow Anon Uploads" on storage.objects;

-- 3. Create "Allow All" Policy
-- explicit for this bucket only
create policy "Allow Anon Uploads"
  on storage.objects for insert
  with check ( bucket_id = 'category-images' );

create policy "Allow Public Read"
  on storage.objects for select
  using ( bucket_id = 'category-images' );

-- 4. Grant usage just in case (rarely needed for storage schema but good measure)
grant all on table storage.objects to anon, authenticated, service_role;
