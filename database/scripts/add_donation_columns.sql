-- Add donation-specific columns to items table
alter table public.items 
add column condition text null, -- 'new', 'like_new', 'used'
add column delivery_available boolean default false;
