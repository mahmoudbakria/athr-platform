-- Migration: fix_appeal_delete_status_v2.sql
-- Description: Robust fix for the 'on_appeal_update_reset_status' trigger issue.

-- 1. Create or Replace the Function with safe logic
CREATE OR REPLACE FUNCTION public.on_appeal_update_reset_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    -- CRITICAL: Allow status to be set to 'deleted' without interference
    IF NEW.status = 'deleted' THEN
        RETURN NEW;
    END IF;

    -- Only reset status to 'pending' if vital content changed
    IF (OLD.title IS DISTINCT FROM NEW.title OR 
        OLD.story IS DISTINCT FROM NEW.story OR 
        OLD.target_amount IS DISTINCT FROM NEW.target_amount) THEN
            NEW.status := 'pending';
    END IF;

    RETURN NEW;
END;
$function$;

-- 2. Ensure the trigger exists and uses this function
-- We drop it first to be safe, assuming commonly used names
DROP TRIGGER IF EXISTS on_appeal_update_reset_status ON public.appeals;
DROP TRIGGER IF EXISTS on_appeal_update ON public.appeals;

CREATE TRIGGER on_appeal_update_reset_status
BEFORE UPDATE ON public.appeals
FOR EACH ROW
EXECUTE FUNCTION public.on_appeal_update_reset_status();
