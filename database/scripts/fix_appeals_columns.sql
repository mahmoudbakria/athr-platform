-- 1. Add city column (safe update)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appeals' AND column_name = 'city') THEN
        ALTER TABLE public.appeals ADD COLUMN city text DEFAULT 'Gaza' NOT NULL;
    END IF;
END $$;

-- 2. Add admin_note column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appeals' AND column_name = 'admin_note') THEN
        ALTER TABLE public.appeals ADD COLUMN admin_note text;
    END IF;
END $$;
