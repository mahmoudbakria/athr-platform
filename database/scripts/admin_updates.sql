-- Admin Dashboard Upgrade Migration Script

-- 1. Update ITEMS table
-- Add rejection_reason column
alter table public.items 
add column if not exists rejection_reason text;

-- Add is_urgent column
alter table public.items 
add column if not exists is_urgent boolean default false;

-- Add tags column
alter table public.items 
add column if not exists tags text[] default array[]::text[];

-- 2. Update PROFILES table
-- Add is_banned column
alter table public.profiles 
add column if not exists is_banned boolean default false;

-- Add avatar_url column
alter table public.profiles 
add column if not exists avatar_url text;

-- 3. Update CATEGORIES table
-- Add parent_id column for sub-categories
alter table public.categories 
add column if not exists parent_id uuid references public.categories(id);

-- 4. Policies Updates (Optional but recommended)
-- Ensure Admins can update these new fields.
-- Existing policy "Admins and Mods can do everything on items" should cover items.
-- Existing policy "Admins and Mods can do everything on profiles" should cover profiles.
-- Existing policy "Admins and Mods can manage categories" should cover categories.

-- Additional Security Check: Banned users should not be able to interact.
-- This usually requires updating *all* RLS policies to check for `is_banned`.
-- For now, we will assume the application layer handles the ban check or a trigger is added.
-- A simple policy addition for banning would be:
/*
create or replace function public.is_not_banned()
returns boolean as $$
begin
  return not exists (
    select 1 from public.profiles
    where id = auth.uid()
    and is_banned = true
  );
end;
$$ language plpgsql security definer;
*/
-- (Uncomment the above if strict database-level banning is desired immediately, 
-- but per requirements, just the schema change is requested for now).
