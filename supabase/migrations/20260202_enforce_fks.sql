-- Migration to enforce ON DELETE CASCADE on Foreign Keys

-- 1. items.user_id -> profiles.id (ON DELETE CASCADE)
-- We first drop the existing constraint (constraint name might vary, so we handle standard name)
ALTER TABLE items
DROP CONSTRAINT IF EXISTS items_user_id_fkey;

ALTER TABLE items
ADD CONSTRAINT items_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- 2. appeals.user_id -> profiles.id (ON DELETE CASCADE)
ALTER TABLE appeals
DROP CONSTRAINT IF EXISTS appeals_user_id_fkey;

ALTER TABLE appeals
ADD CONSTRAINT appeals_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Note: `appeals.item_id` was requested but the column does not exist in the current schema.
-- Skipping constraint for appeals.item_id to prevent migration failure.
