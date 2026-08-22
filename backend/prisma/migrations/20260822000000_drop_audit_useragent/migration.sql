-- Migration: drop_audit_useragent_from_admin_audit_log
-- Remove user_agent column from admin_audit_log

BEGIN;

ALTER TABLE "admin_audit_log" DROP COLUMN IF EXISTS "ip_address";
ALTER TABLE "admin_audit_log" DROP COLUMN IF EXISTS "user_agent";

COMMIT;
