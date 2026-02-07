-- Create avatars bucket if not exists
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Enable RLS
alter table storage.objects enable row level security;

-- Public read access for avatars
create policy "Avatar Public Read"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Authenticated users can upload avatars
create policy "Avatar Upload"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1] );

-- Users can update their own avatar
create policy "Avatar Update"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1] );

-- Users can delete their own avatar
create policy "Avatar Delete"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1] );
