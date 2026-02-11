-- 1. Create Enum
do $$
begin
    if not exists (select 1 from pg_type where typname = 'volunteer_status') then
        create type volunteer_status as enum ('pending', 'approved', 'rejected');
    end if;
end
$$;

-- 2. Create Table
create table if not exists public.volunteer_deliveries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  from_city text not null,
  to_city text not null,
  delivery_date date not null,
  delivery_time time,
  car_type text not null,
  max_weight_kg decimal(10, 2),
  notes text,
  status volunteer_status default 'pending'::volunteer_status,
  created_at timestamptz default now()
);

-- 3. Enable RLS
alter table public.volunteer_deliveries enable row level security;

-- 4. Policies

-- Public: Read access for approved deliveries
drop policy if exists "Anyone can read approved volunteer deliveries" on public.volunteer_deliveries;
create policy "Anyone can read approved volunteer deliveries"
  on public.volunteer_deliveries for select
  using ( status = 'approved' );

-- Users: Create Own
drop policy if exists "Users can create volunteer requests" on public.volunteer_deliveries;
create policy "Users can create volunteer requests"
  on public.volunteer_deliveries for insert
  to authenticated
  with check ( auth.uid() = user_id );

-- Users: Read Own
drop policy if exists "Users can read own volunteer requests" on public.volunteer_deliveries;
create policy "Users can read own volunteer requests"
  on public.volunteer_deliveries for select
  to authenticated
  using ( auth.uid() = user_id );

-- Admins: Full Access
drop policy if exists "Admins have full access to volunteer deliveries" on public.volunteer_deliveries;
create policy "Admins have full access to volunteer deliveries"
  on public.volunteer_deliveries for all
  using ( public.is_admin_or_mod() );

-- 5. System Settings
insert into public.system_settings (key, value)
values ('feature_volunteer_delivery', true)
on conflict (key) do nothing;
