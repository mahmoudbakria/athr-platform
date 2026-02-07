-- 1. Redefine the helper function to be absolutely sure it bypasses RLS
-- SECURITY DEFINER is key here. It allows the function to run with the privileges of the creator (superuser),
-- thus ignoring the RLS policies on the 'profiles' table that might otherwise cause infinite recursion.
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

-- 2. Drop existing policies on storage.objects to start clean
drop policy if exists "Public Access Categories" on storage.objects;
drop policy if exists "Admins and Mods can manage category images" on storage.objects;
drop policy if exists "Everyone can uploads" on storage.objects;

-- 3. Re-create Robust Policies

-- ALLOW Public Read (View images)
create policy "Public Access Categories"
  on storage.objects for select
  using ( bucket_id = 'category-images' );

-- ALLOW Admins/Mods to INSERT (Upload)
-- We separate INSERT to be explicit with 'with check'
create policy "Admins and Mods can upload category images"
  on storage.objects for insert
  with check ( 
      bucket_id = 'category-images' 
      and public.is_admin_or_mod() 
  );

-- ALLOW Admins/Mods to UPDATE/DELETE
create policy "Admins and Mods can update delete category images"
  on storage.objects for update
  using ( 
      bucket_id = 'category-images' 
      and public.is_admin_or_mod() 
  );

create policy "Admins and Mods can delete category images"
  on storage.objects for delete
  using ( 
      bucket_id = 'category-images' 
      and public.is_admin_or_mod() 
  );
