-- Add show_avatar to profiles
alter table public.profiles 
add column if not exists show_avatar boolean default true;
