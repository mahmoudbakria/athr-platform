-- Allow null user_id in items
-- First, make user_id nullable
ALTER TABLE public.items ALTER COLUMN user_id DROP NOT NULL;

-- Create policy to allow public inserts on items
CREATE POLICY "Allow public insert on items" ON public.items FOR INSERT TO public WITH CHECK (true);

-- Create policy to allow public uploads to item-images bucket
-- Note: This assumes storage schema is available
CREATE POLICY "Allow public uploads to item-images" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'item-images');
