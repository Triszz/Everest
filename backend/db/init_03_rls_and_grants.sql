-- =====================================================================
--  Everest Voucher EC – Database Initialization (PART 3/3)
-- =====================================================================

-- 7. GRANTS (Prisma + service_role – không dùng Supabase Auth)
GRANT USAGE ON SCHEMA public TO service_role;

GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- File này không có seed data – bạn sẽ insert sau khi DB chạy ổn.
