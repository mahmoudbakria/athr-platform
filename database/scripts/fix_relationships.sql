-- Fix JSON API Relationship for items -> profiles
-- Currently items.user_id references auth.users, so PostgREST cannot see 'profiles' (public schema) as a relation.
-- We verify that items.user_id points to public.profiles(id) to enable the join.

-- 1. Drop the old constraint (we need to find its name, usually items_user_id_fkey)
alter table public.items drop constraint if exists items_user_id_fkey;

-- 2. Add new constraint pointing to profiles
-- This is safe because profiles.id is also auth.users.id
alter table public.items
add constraint items_user_id_fkey
foreign key (user_id)
references public.profiles(id)
on delete set null;

-- Now supabase.from('items').select('*, profiles(*)') will work.
