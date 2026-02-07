-- Fix JSON API Relationship for appeals -> profiles
-- Currently appeals.user_id references auth.users, so PostgREST cannot see 'profiles' (public schema) as a relation.
-- We change appeals.user_id to point to public.profiles(id) to enable the join.

-- 1. Drop the old constraint (auto-named, so we might need to guess or it's appeals_user_id_fkey)
-- We'll try strictly dropping the likely name.
alter table public.appeals drop constraint if exists appeals_user_id_fkey;

-- 2. Add new constraint pointing to profiles
-- This is safe because profiles.id is also auth.users.id
alter table public.appeals
add constraint appeals_user_id_fkey
foreign key (user_id)
references public.profiles(id)
on delete cascade;

-- Now supabase.from('appeals').select('*, profiles(*)') will work.
