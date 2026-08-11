-- Migration: populate owner_device for existing personas and (optionally) enforce NOT NULL
-- Run from Supabase SQL editor or via the provided GitHub Action.

BEGIN;

-- 1) Add column if not exists
ALTER TABLE personas ADD COLUMN IF NOT EXISTS owner_device text;

-- 2) Populate existing rows
UPDATE personas
SET owner_device = 'migrated'
WHERE owner_device IS NULL;

COMMIT;

-- 3) If you've verified results, optionally enforce NOT NULL with:
-- ALTER TABLE personas ALTER COLUMN owner_device SET NOT NULL;

-- Notes:
-- - 'migrated' marks old rows; you may choose another value or create an admin flow to reassign.
-- - Execute the optional ALTER only after confirming the UPDATE.
