-- 1. Add 'cancelled' to enum safely
DO $$
BEGIN
    ALTER TYPE public.volunteer_status ADD VALUE IF NOT EXISTS 'cancelled';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add UPDATE Policy for Users
-- Allow users to update their own records (needed for Editing details AND Soft Deleting/Cancelling)
DROP POLICY IF EXISTS "Users can update own volunteer requests" ON public.volunteer_deliveries;

CREATE POLICY "Users can update own volunteer requests"
ON public.volunteer_deliveries
FOR UPDATE
TO authenticated
USING ( auth.uid() = user_id )
WITH CHECK ( auth.uid() = user_id );

-- 3. Verify DELETE Policy for Admins (Just to be safe)
DROP POLICY IF EXISTS "Admins can delete volunteer requests" ON public.volunteer_deliveries;

CREATE POLICY "Admins can delete volunteer requests"
ON public.volunteer_deliveries
FOR DELETE
TO authenticated
USING ( public.is_admin_or_mod() );
