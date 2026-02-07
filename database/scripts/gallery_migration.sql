-- Phase 1: Multi-Image Gallery Migration (Corrected)

-- 1. Add gallery column
alter table public.items 
add column if not exists gallery text[] default array[]::text[];

-- 2. Migrate existing data
-- Source column is 'images' (text array), not 'image_url'
-- We copy the content directly
update public.items 
set gallery = images 
where images is not null;
