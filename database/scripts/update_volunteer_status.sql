-- Add 'cancelled' to the volunteer_status enum
ALTER TYPE public.volunteer_status ADD VALUE IF NOT EXISTS 'cancelled';
