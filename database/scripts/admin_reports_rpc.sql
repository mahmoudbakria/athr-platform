-- RPC Function to calculate Admin Stats efficiently in Database

CREATE OR REPLACE FUNCTION get_admin_stats(
  start_date timestamptz DEFAULT (now() - interval '30 days'),
  end_date timestamptz DEFAULT now()
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of creator (ensure admin/postgres creates this)
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    -- 1. GROWTH DATA (Daily counts for chart)
    'growth', (
      SELECT json_agg(day_data)
      FROM (
        SELECT
          to_char(day_series, 'Mon DD') as date,
          (SELECT count(*) FROM items WHERE created_at::date = day_series::date) as items,
          (SELECT count(*) FROM profiles WHERE created_at::date = day_series::date) as users,
          (SELECT count(*) FROM appeals WHERE created_at::date = day_series::date) as appeals,
          (SELECT count(*) FROM volunteer_deliveries WHERE created_at::date = day_series::date) as volunteers
        FROM generate_series(start_date, end_date, '1 day'::interval) as day_series
      ) day_data
    ),

    -- 2. STATUS COUNTS (For pie charts/stats)
    'items_status', (
      SELECT json_agg(json_build_object('name', status, 'value', count))
      FROM (
        SELECT status, count(*) 
        FROM items 
        GROUP BY status 
        ORDER BY count DESC
      ) s
    ),
    'appeals_status', (
      SELECT json_agg(json_build_object('name', status, 'value', count))
      FROM (
        SELECT status, count(*) 
        FROM appeals 
        WHERE created_at >= start_date AND created_at <= end_date
        GROUP BY status 
        ORDER BY count DESC
      ) s
    ),
    'volunteers_status', (
      SELECT json_agg(json_build_object('name', status, 'value', count))
      FROM (
        SELECT status, count(*) 
        FROM volunteer_deliveries 
        WHERE created_at >= start_date AND created_at <= end_date
        GROUP BY status 
        ORDER BY count DESC
      ) s
    ),

    -- 3. CATEGORY STATS
    'categories', (
      SELECT json_agg(json_build_object('name', c.name, 'value', count(i.id)))
      FROM categories c
      LEFT JOIN items i ON i.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY count(i.id) DESC
    )
  ) INTO result;

  RETURN result;
END;
$$;
