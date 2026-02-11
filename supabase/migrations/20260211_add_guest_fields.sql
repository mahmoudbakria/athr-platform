-- Add guest columns to items table
ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS guest_name text,
ADD COLUMN IF NOT EXISTS guest_email text;
