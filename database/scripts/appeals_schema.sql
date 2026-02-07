-- 1. Add feature flag to system_settings
insert into public.system_settings (key, value)
values ('feature_appeals_enabled', true)
on conflict (key) do nothing;

-- 2. Create Appeals Table
-- Create enum if it doesn't exist (handling potential reruns carefully, though "create type" errors if exists)
do $$
begin
    if not exists (select 1 from pg_type where typname = 'appeal_status') then
        create type appeal_status as enum ('pending', 'approved', 'rejected', 'closed');
    end if;
end
$$;

create table if not exists public.appeals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  story text not null,
  target_amount decimal(10, 2), -- Optional financial goal
  category text not null, -- e.g., 'Medical', 'Education', 'Emergency'
  city text not null, -- Added for location
  admin_note text, -- Internal notes
  contact_info text not null,
  created_at timestamptz default now(),
  status appeal_status default 'pending'::appeal_status
);

-- 3. Enable RLS
alter table public.appeals enable row level security;

-- 4. RLS Policies

-- Public: Read APPROVED appeals only
drop policy if exists "Public can read approved appeals" on public.appeals;
create policy "Public can read approved appeals"
  on public.appeals for select
  using ( status = 'approved' );

-- Users: Create appeals (Authenticated)
drop policy if exists "Users can create appeals" on public.appeals;
create policy "Users can create appeals"
  on public.appeals for insert
  to authenticated
  with check ( auth.uid() = user_id );

-- Users: Read OWN appeals (so they can see pending statuses)
drop policy if exists "Users can read own appeals" on public.appeals;
create policy "Users can read own appeals"
  on public.appeals for select
  to authenticated
  using ( auth.uid() = user_id );

-- Users: Update OWN pending appeals
drop policy if exists "Users can update own pending appeals" on public.appeals;
create policy "Users can update own pending appeals"
  on public.appeals for update
  to authenticated
  using ( auth.uid() = user_id and status = 'pending' );

-- Admins: Full Access
drop policy if exists "Admins have full access to appeals" on public.appeals;
create policy "Admins have full access to appeals"
  on public.appeals for all
  using ( public.is_admin_or_mod() );
