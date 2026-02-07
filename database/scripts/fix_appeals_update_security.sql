-- ==============================================================================
-- FIX: Allow Users to Edit Apps & Force Re-approval (No Admin Key Needed)
-- ==============================================================================

-- 1. DROP old restrictive update policy
-- (This policy prevented users from editing 'approved' appeals)
DROP POLICY IF EXISTS "Users can update own pending appeals" ON public.appeals;

-- 2. CREATE new permissive update policy
-- (Allows users to update their own appeals regardless of status)
CREATE POLICY "Users can update own appeals"
  ON public.appeals
  FOR UPDATE
  TO authenticated
  USING ( auth.uid() = user_id );

-- 3. CREATE Trigger Function to Enforce 'Pending' Status
-- (This ensures security: users can edit, but it ALWAYS resets to pending)
CREATE OR REPLACE FUNCTION public.handle_appeal_update_security()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the user is an admin or mod
  -- If NOT admin/mod, force status to 'pending' upon any edit
  IF NOT public.is_admin_or_mod() THEN
    NEW.status := 'pending';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. ATTACH Trigger to Appeals Table
DROP TRIGGER IF EXISTS on_appeal_update_reset_status ON public.appeals;
CREATE TRIGGER on_appeal_update_reset_status
  BEFORE UPDATE ON public.appeals
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_appeal_update_security();

-- ==============================================================================
-- INSTRUCTIONS:
-- Run this script in your Supabase SQL Editor.
-- It replaces the need for the "Service Role Key" in the code.
-- ==============================================================================
