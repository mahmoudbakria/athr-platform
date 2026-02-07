-- Migration: volunteer_system_setup
-- Description: Adds driver support, item transport fields, and system settings for the Volunteer Delivery System.

-- 1. Update system_settings Table
-- Create table if it doesn't exist (it should, but safety first)
CREATE TABLE IF NOT EXISTS public.system_settings (
    key text PRIMARY KEY,
    value text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add feature_drivers_enabled column if it acts as a structured setting, 
-- but usually system_settings is key-value. 
-- The user requested: "Add column: feature_drivers_enabled (boolean, default true)".
-- Let's check if the table is structured or KV. 
-- Assuming it is structured based on the request "Add column".
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'system_settings' AND column_name = 'feature_drivers_enabled') THEN 
        ALTER TABLE public.system_settings ADD COLUMN feature_drivers_enabled boolean DEFAULT true; 
    END IF; 
END $$;


-- 2. Update profiles Table
-- is_driver (boolean, default false)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_driver') THEN 
        ALTER TABLE public.profiles ADD COLUMN is_driver boolean DEFAULT false; 
    END IF; 
END $$;

-- is_verified_driver (boolean, default false)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_verified_driver') THEN 
        ALTER TABLE public.profiles ADD COLUMN is_verified_driver boolean DEFAULT false; 
    END IF; 
END $$;

-- driver_city (text, nullable)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'driver_city') THEN 
        ALTER TABLE public.profiles ADD COLUMN driver_city text; 
    END IF; 
END $$;

-- driver_phone (text, nullable)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'driver_phone') THEN 
        ALTER TABLE public.profiles ADD COLUMN driver_phone text; 
    END IF; 
END $$;

-- vehicle_type (text, nullable)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'vehicle_type') THEN 
        ALTER TABLE public.profiles ADD COLUMN vehicle_type text; 
    END IF; 
END $$;

-- vehicle_notes (text, nullable)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'vehicle_notes') THEN 
        ALTER TABLE public.profiles ADD COLUMN vehicle_notes text; 
    END IF; 
END $$;


-- 3. Update items Table
-- needs_transport (boolean, default false)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'needs_transport') THEN 
        ALTER TABLE public.items ADD COLUMN needs_transport boolean DEFAULT false; 
    END IF; 
END $$;

-- volunteer_id (uuid, FK to profiles, nullable)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'volunteer_id') THEN 
        ALTER TABLE public.items ADD COLUMN volunteer_id uuid REFERENCES public.profiles(id); 
    END IF; 
END $$;

-- latitude (float, nullable)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'latitude') THEN 
        ALTER TABLE public.items ADD COLUMN latitude double precision; 
    END IF; 
END $$;

-- longitude (float, nullable)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'longitude') THEN 
        ALTER TABLE public.items ADD COLUMN longitude double precision; 
    END IF; 
END $$;
