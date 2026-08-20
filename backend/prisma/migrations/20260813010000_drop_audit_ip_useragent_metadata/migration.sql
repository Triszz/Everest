-- Migration: drop_audit_ip_useragent
-- Remove ip_address column from admin_audit_log (keep metadata, was never created in DB)

BEGIN;

ALTER TABLE "admin_audit_log" DROP COLUMN IF EXISTS "ip_address";

COMMIT;
