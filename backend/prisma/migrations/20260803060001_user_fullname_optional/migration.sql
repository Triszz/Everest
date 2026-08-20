-- Migration: 20260803060001_user_fullname_optional

BEGIN;

ALTER TABLE "users" ALTER COLUMN "full_name" DROP NOT NULL;

COMMIT;
