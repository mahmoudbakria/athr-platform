-- Drop the function first to avoid "cannot remove parameter defaults" error
DROP FUNCTION IF EXISTS get_admin_stats(timestamptz, timestamptz);

-- Function to get admin dashboard stats
create or replace function get_admin_stats(start_date timestamptz, end_date timestamptz)
returns json
language plpgsql
security definer
as $$
declare
  result json;
  appeals_status json;
  volunteers_status json;
begin
  -- Dynamic fetch for Appeals Status
  if to_regclass('public.appeals') is not null then
    execute 'select coalesce(json_agg(t), ''[]''::json) from (select status as name, count(*) as value from appeals where created_at between $1 and $2 group by status) t'
    into appeals_status
    using start_date, end_date;
  else
    appeals_status := '[]'::json;
  end if;

  -- Dynamic fetch for Volunteer Status
  if to_regclass('public.volunteer_deliveries') is not null then
    execute 'select coalesce(json_agg(t), ''[]''::json) from (select status as name, count(*) as value from volunteer_deliveries where created_at between $1 and $2 group by status) t'
    into volunteers_status
    using start_date, end_date;
  else
    volunteers_status := '[]'::json;
  end if;

  -- Build final JSON
  select json_build_object(
    'items_status', (
      select coalesce(json_agg(t), '[]'::json)
      from (
        select status as name, count(*) as value
        from items
        where created_at between start_date and end_date
        group by status
      ) t
    ),
    'categories', (
      select coalesce(json_agg(t), '[]'::json)
      from (
        select c.name, count(i.id) as value
        from items i
        join categories c on i.category_id = c.id
        where i.created_at between start_date and end_date
        group by c.name
      ) t
    ),
    'volunteers_status', volunteers_status,
    'appeals_status', appeals_status,
    'growth', (
      select coalesce(json_agg(t), '[]'::json)
      from (
        select 
          day::date as date,
          (select count(*) from items where date_trunc('day', created_at) = day) as items,
          (select count(*) from auth.users where date_trunc('day', created_at) = day) as users,
          0 as appeals,    -- Placeholder for robustness
          0 as volunteers  -- Placeholder for robustness
        from generate_series(start_date, end_date, '1 day'::interval) as day
      ) t
    )
  ) into result;

  return result;
end;
$$;
