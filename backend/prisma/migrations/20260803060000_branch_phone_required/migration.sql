<<<<<<< HEAD
-- Migration: 20260803060000_branch_phone_required

BEGIN;

ALTER TABLE "branches" ALTER COLUMN "phone_number" SET NOT NULL;

COMMIT;
=======
-- Business rule: Branch phoneNumber is required.
-- First, ensure no NULL values exist (update them to a placeholder so we can alter to NOT NULL).
UPDATE "branches"
SET "phone_number" = '0000000000'
WHERE "phone_number" IS NULL;

-- Alter column to NOT NULL.
ALTER TABLE "branches"
ALTER COLUMN "phone_number" SET NOT NULL;
>>>>>>> main
