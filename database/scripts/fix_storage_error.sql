-- 1. Create storage bucket for category images
insert into storage.buckets (id, name, public)
values ('category-images', 'category-images', true)
on conflict (id) do nothing;

-- Note: We skipped 'alter table storage.objects enable row level security' because it is already enabled by default.

-- 2. Drop existing policies to avoid conflicts if you ran parts of it before
drop policy if exists "Public Access Categories" on storage.objects;
drop policy if exists "Admins and Mods can manage category images" on storage.objects;

-- 3. Create Policies

-- Public Read
create policy "Public Access Categories"
  on storage.objects for select
  using ( bucket_id = 'category-images' );

-- Admins/Mods can insert/update/delete
create policy "Admins and Mods can manage category images"
  on storage.objects for all
  using ( bucket_id = 'category-images' and public.is_admin_or_mod() );
