-- DEBUG: Temporarily Disable RLS to unblock the page
-- If the page loads after running this, we know 100% it was a Policy Infinite Loop.

alter table public.items disable row level security;
alter table public.profiles disable row level security;
alter table public.categories disable row level security;
