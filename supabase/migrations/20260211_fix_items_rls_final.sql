-- Comprehensive RLS fix for items table

-- 1. Ensure columns exist and are nullable
ALTER TABLE public.items ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS guest_name text;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS guest_email text;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can create their own items" ON public.items;
DROP POLICY IF EXISTS "Allow public insert on items" ON public.items;
DROP POLICY IF EXISTS "Anyone can insert items" ON public.items;
DROP POLICY IF EXISTS "Public items are viewable by everyone" ON public.items;

-- 3. Create new policies

-- Allow everyone to view items (SELECT)
CREATE POLICY "Public items are viewable by everyone" 
ON public.items FOR SELECT 
TO public 
USING (true);

-- Allow everyone to insert items (INSERT)
-- This covers both authenticated users (user_id will be set) and guests (user_id will be null)
CREATE POLICY "Anyone can insert items" 
ON public.items FOR INSERT 
TO public 
WITH CHECK (true);

-- Allow users to update ONLY their own items
CREATE POLICY "Users can update their own items" 
ON public.items FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete ONLY their own items
CREATE POLICY "Users can delete their own items" 
ON public.items FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 4. Ensure RLS is enabled
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
