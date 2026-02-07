-- 1. Create table
create table public.appeal_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  slug text not null unique,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table public.appeal_categories enable row level security;

-- 3. Create Policies

-- Public can read all active categories (or all, depending on if we want to filter in query)
-- Let's say public can read all, front-end filters by is_active for new posts
create policy "Appeal Categories are viewable by everyone"
  on public.appeal_categories for select
  using (true);

-- Admins can do everything
create policy "Admins can manage appeal categories"
  on public.appeal_categories for all
  using (public.is_admin_or_mod());
  
-- 4. Seed default data
insert into public.appeal_categories (name, slug) values
('Medical', 'Medical'),
('Financial', 'Financial'),
('Education', 'Education'),
('Food', 'Food'),
('Other', 'Other')
on conflict (name) do nothing;
