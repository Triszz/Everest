-- Business rule: Branch phoneNumber is required.
-- First, ensure no NULL values exist (update them to a placeholder so we can alter to NOT NULL).
UPDATE "branches"
SET "phone_number" = '0000000000'
WHERE "phone_number" IS NULL;

-- Alter column to NOT NULL.
ALTER TABLE "branches"
ALTER COLUMN "phone_number" SET NOT NULL;
