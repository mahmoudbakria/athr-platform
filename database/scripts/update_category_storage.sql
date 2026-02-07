-- Create storage bucket for category images
insert into storage.buckets (id, name, public)
values ('category-images', 'category-images', true)
on conflict (id) do nothing;

-- Enable RLS on objects if not already (it is, but good to be safe)
alter table storage.objects enable row level security;

-- Policies for category-images

-- Public Read
create policy "Public Access Categories"
  on storage.objects for select
  using ( bucket_id = 'category-images' );

-- Admins/Mods can insert/update/delete
create policy "Admins and Mods can manage category images"
  on storage.objects for all
  using ( bucket_id = 'category-images' and public.is_admin_or_mod() );
