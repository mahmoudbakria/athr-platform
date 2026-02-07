-- Add 'deleted' to the item_status enum type
ALTER TYPE item_status ADD VALUE IF NOT EXISTS 'deleted';
