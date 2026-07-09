-- Add isLocked to partners
ALTER TABLE "partners" ADD COLUMN "is_locked" BOOLEAN NOT NULL DEFAULT false;

-- Add isLocked to branches
ALTER TABLE "branches" ADD COLUMN "is_locked" BOOLEAN NOT NULL DEFAULT false;
