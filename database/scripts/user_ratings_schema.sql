-- Create user_ratings table
create table if not exists public.user_ratings (
  id uuid default uuid_generate_v4() primary key,
  rater_id uuid references auth.users(id) on delete cascade not null,
  rated_user_id uuid references auth.users(id) on delete cascade not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamptz default now(),
  constraint unique_user_rating unique (rater_id, rated_user_id),
  constraint no_self_rating check (rater_id != rated_user_id)
);

-- Enable RLS
alter table public.user_ratings enable row level security;

-- Policies
create policy "Public can read ratings"
  on public.user_ratings for select
  using ( true );

create policy "Authenticated users can rate others"
  on public.user_ratings for insert
  to authenticated
  with check ( auth.uid() = rater_id );

create policy "Users can update their own ratings"
  on public.user_ratings for update
  to authenticated
  using ( auth.uid() = rater_id );

-- Function to get simplified rating stats
create or replace function public.get_user_rating_stats(p_user_id uuid)
returns json as $$
declare
  v_avg decimal(3, 2);
  v_count integer;
begin
  select 
    coalesce(avg(rating), 0),
    count(*)
  into v_avg, v_count
  from public.user_ratings
  where rated_user_id = p_user_id;

  return json_build_object(
    'average', v_avg,
    'count', v_count
  );
end;
$$ language plpgsql security definer;
