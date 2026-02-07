-- Add full_name and email to profiles
alter table public.profiles 
add column if not exists full_name text,
add column if not exists email text;

-- Check if we can sync data (optional, relies on existing session or metadata)
-- For future inserts, we should update handle_new_user function

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, points, phone, full_name, email)
  values (
    new.id, 
    'user', 
    0, 
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'full_name',
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;
