-- Migration: 20260803060000_branch_phone_required

BEGIN;

ALTER TABLE "branches" ALTER COLUMN "phone_number" SET NOT NULL;

COMMIT;
