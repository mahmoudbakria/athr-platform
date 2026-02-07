-- Re-creating platform_settings to match Key-Value requirements
drop table if exists public.platform_settings;

create table public.platform_settings (
    key text primary key,
    value boolean default false,
    description text
);

-- Insert default keys
insert into public.platform_settings (key, value, description)
values 
    ('feature_maintenance', false, 'Enable maintenance mode to disable public access.'),
    ('feature_transporter', true, 'Enable the delivery and transporter module.'),
    ('feature_gamification', true, 'Enable points and leaderboards.'),
    ('feature_google_auth', true, 'Allow users to sign in with Google.')
on conflict (key) do nothing;
