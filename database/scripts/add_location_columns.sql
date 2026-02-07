-- Add latitude and longitude columns to items table
alter table public.items 
add column latitude double precision null,
add column longitude double precision null;
