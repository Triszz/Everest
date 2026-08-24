-- Migration: add_voucher_is_locked
-- Add is_locked field to vouchers table

ALTER TABLE "vouchers" ADD COLUMN "is_locked" BOOLEAN NOT NULL DEFAULT false;
