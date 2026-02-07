-- Add 'deleted' to the appeal_status enum type
-- This is necessary because the status column is defined as an ENUM, not just text.

ALTER TYPE appeal_status ADD VALUE IF NOT EXISTS 'deleted';
