-- Add contact_phone column to volunteer_deliveries table
ALTER TABLE public.volunteer_deliveries
ADD COLUMN IF NOT EXISTS contact_phone text;

-- Optional: You might want to backfill this from profiles if needed, but for now we leave it null for existing records.
