-- Drop the old constraint
ALTER TABLE public.volunteer_deliveries
DROP CONSTRAINT IF EXISTS volunteer_deliveries_user_id_fkey;

-- Add new constraint pointing to profiles
ALTER TABLE public.volunteer_deliveries
ADD CONSTRAINT volunteer_deliveries_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Verify
-- The relationship should now be detected by PostgREST as 'volunteer_deliveries.user_id' -> 'profiles.id'
