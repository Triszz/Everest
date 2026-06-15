-- =====================================================================
--  Everest Voucher EC – Database Initialization (PART 3/3)
-- =====================================================================

-- 7. ROW LEVEL SECURITY (RLS)
ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners          ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches          ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners           ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies          ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_branches  ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE issued_vouchers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews           ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs       ENABLE ROW LEVEL SECURITY;

-- 7.1 USERS
DROP POLICY IF EXISTS "admin_all_users" ON users;
DROP POLICY IF EXISTS "user_self"      ON users;
CREATE POLICY "admin_all_users" ON users FOR ALL TO authenticated
    USING (auth.uid() IN (SELECT auth.uid() FROM users WHERE role = 'Admin'))
    WITH CHECK (auth.uid() IN (SELECT auth.uid() FROM users WHERE role = 'Admin'));
CREATE POLICY "user_self"      ON users FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 7.2 PARTNERS
DROP POLICY IF EXISTS "admin_all_partners" ON partners;
DROP POLICY IF EXISTS "partner_self"      ON partners;
CREATE POLICY "admin_all_partners" ON partners FOR ALL TO authenticated
    USING (auth.uid() IN (SELECT auth.uid() FROM users WHERE role = 'Admin'))
    WITH CHECK (auth.uid() IN (SELECT auth.uid() FROM users WHERE role = 'Admin'));
CREATE POLICY "partner_self"      ON partners FOR SELECT TO authenticated USING (partner_id IN (SELECT partner_id FROM users WHERE user_id = auth.uid()));

-- 7.3 BRANCHES
DROP POLICY IF EXISTS "admin_all_branches"   ON branches;
DROP POLICY IF EXISTS "partner_own_branches" ON branches;
DROP POLICY IF EXISTS "public_read_branches" ON branches;
CREATE POLICY "admin_all_branches"   ON branches FOR ALL TO authenticated
    USING (auth.uid() IN (SELECT auth.uid() FROM users WHERE role = 'Admin'))
    WITH CHECK (auth.uid() IN (SELECT auth.uid() FROM users WHERE role = 'Admin'));
CREATE POLICY "partner_own_branches" ON branches FOR ALL TO authenticated
    USING (partner_id IN (SELECT partner_id FROM users WHERE user_id = auth.uid()))
    WITH CHECK (partner_id IN (SELECT partner_id FROM users WHERE user_id = auth.uid()));
CREATE POLICY "public_read_branches" ON branches FOR SELECT TO anon USING (true);

-- 7.4 CATEGORIES
DROP POLICY IF EXISTS "public_read_categories"  ON categories;
DROP POLICY IF EXISTS "admin_modify_categories" ON categories;
CREATE POLICY "public_read_categories"  ON categories FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "admin_modify_categories" ON categories FOR ALL TO authenticated
    USING (auth.uid() IN (SELECT auth.uid() FROM users WHERE role = 'Admin'))
    WITH CHECK (auth.uid() IN (SELECT auth.uid() FROM users WHERE role = 'Admin'));

-- 7.5 BANNERS
DROP POLICY IF EXISTS "public_read_banners"  ON banners;
DROP POLICY IF EXISTS "admin_modify_banners" ON banners;
CREATE POLICY "public_read_banners"  ON banners FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "admin_modify_banners" ON banners FOR ALL TO authenticated
    USING (auth.uid() IN (SELECT auth.uid() FROM users WHERE role = 'Admin'))
    WITH CHECK (auth.uid() IN (SELECT auth.uid() FROM users WHERE role = 'Admin'));

-- 7.6 POLICIES
DROP POLICY IF EXISTS "public_read_policies"  ON policies;
DROP POLICY IF EXISTS "admin_modify_policies" ON policies;
CREATE POLICY "public_read_policies"  ON policies FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "admin_modify_policies" ON policies FOR ALL TO authenticated
    USING (auth.uid() IN (SELECT auth.uid() FROM users WHERE role = 'Admin'))
    WITH CHECK (auth.uid() IN (SELECT auth.uid() FROM users WHERE role = 'Admin'));

-- 7.7 VOUCHERS
DROP POLICY IF EXISTS "admin_all_vouchers"           ON vouchers;
DROP POLICY IF EXISTS "partner_own_vouchers"          ON vouchers;
DROP POLICY IF EXISTS "customer_read_active_vouchers" ON vouchers;
CREATE POLICY "admin_all_vouchers"           ON vouchers FOR ALL TO authenticated
    USING (auth.uid() IN (SELECT auth.uid() FROM users WHERE role = 'Admin'))
    WITH CHECK (auth.uid() IN (SELECT auth.uid() FROM users WHERE role = 'Admin'));
CREATE POLICY "partner_own_vouchers"          ON vouchers FOR ALL TO authenticated
    USING (partner_id IN (SELECT partner_id FROM users WHERE user_id = auth.uid()))
    WITH CHECK (partner_id IN (SELECT partner_id FROM users WHERE user_id = auth.uid()));
CREATE POLICY "customer_read_active_vouchers" ON vouchers FOR SELECT TO authenticated, anon USING (approval_status = 'Approved' AND display_status = 'Visible' AND start_date <= now() AND end_date >= now() AND available_quantity > 0);

-- 7.8 VOUCHER_BRANCHES
DROP POLICY IF EXISTS "admin_all_voucher_branches"       ON voucher_branches;
DROP POLICY IF EXISTS "partner_voucher_branches"          ON voucher_branches;
DROP POLICY IF EXISTS "customer_read_voucher_branches"    ON voucher_branches;
CREATE POLICY "admin_all_voucher_branches"       ON voucher_branches FOR ALL TO authenticated
    USING (auth.uid() IN (SELECT auth.uid() FROM users WHERE role = 'Admin'))
    WITH CHECK (auth.uid() IN (SELECT auth.uid() FROM users WHERE role = 'Admin'));
CREATE POLICY "partner_voucher_branches"          ON voucher_branches FOR ALL TO authenticated
    USING (branch_id IN (SELECT branch_id FROM branches WHERE partner_id IN (SELECT partner_id FROM users WHERE user_id = auth.uid())))
    WITH CHECK (branch_id IN (SELECT branch_id FROM branches WHERE partner_id IN (SELECT partner_id FROM users WHERE user_id = auth.uid())));
CREATE POLICY "customer_read_voucher_branches"    ON voucher_branches FOR SELECT TO authenticated, anon USING (voucher_id IN (SELECT voucher_id FROM vouchers WHERE approval_status = 'Approved' AND display_status = 'Visible'));

-- 7.9 CART_ITEMS
DROP POLICY IF EXISTS "customer_own_cart" ON cart_items;
CREATE POLICY "customer_own_cart" ON cart_items FOR ALL TO authenticated
    USING (customer_id = auth.uid())
    WITH CHECK (customer_id = auth.uid());

-- 7.10 ORDERS
DROP POLICY IF EXISTS "admin_all_orders"    ON orders;
DROP POLICY IF EXISTS "partner_own_orders"  ON orders;
DROP POLICY IF EXISTS "customer_own_orders" ON orders;
CREATE POLICY "admin_all_orders"    ON orders FOR ALL TO authenticated
    USING (auth.uid() IN (SELECT auth.uid() FROM users WHERE role = 'Admin'))
    WITH CHECK (auth.uid() IN (SELECT auth.uid() FROM users WHERE role = 'Admin'));
CREATE POLICY "partner_own_orders"  ON orders FOR SELECT TO authenticated USING (customer_id IN (SELECT user_id FROM users WHERE partner_id IN (SELECT partner_id FROM users WHERE user_id = auth.uid())));
CREATE POLICY "customer_own_orders" ON orders FOR ALL TO authenticated
    USING (customer_id = auth.uid())
    WITH CHECK (customer_id = auth.uid());

-- 7.11 ORDER_ITEMS
DROP POLICY IF EXISTS "customer_own_order_items" ON order_items;
DROP POLICY IF EXISTS "admin_order_items"        ON order_items;
CREATE POLICY "customer_own_order_items" ON order_items FOR SELECT TO authenticated USING (order_id IN (SELECT order_id FROM orders WHERE customer_id = auth.uid()));
CREATE POLICY "admin_order_items"        ON order_items FOR ALL TO authenticated
    USING (auth.uid() IN (SELECT auth.uid() FROM users WHERE role = 'Admin'))
    WITH CHECK (auth.uid() IN (SELECT auth.uid() FROM users WHERE role = 'Admin'));

-- 7.12 ISSUED_VOUCHERS
DROP POLICY IF EXISTS "admin_all_issued"    ON issued_vouchers;
DROP POLICY IF EXISTS "partner_own_issued"  ON issued_vouchers;
DROP POLICY IF EXISTS "customer_own_issued" ON issued_vouchers;
CREATE POLICY "admin_all_issued"    ON issued_vouchers FOR ALL TO authenticated
    USING (auth.uid() IN (SELECT auth.uid() FROM users WHERE role = 'Admin'))
    WITH CHECK (auth.uid() IN (SELECT auth.uid() FROM users WHERE role = 'Admin'));
CREATE POLICY "partner_own_issued"  ON issued_vouchers FOR SELECT TO authenticated USING (order_item_id IN (SELECT order_item_id FROM order_items WHERE voucher_id IN (SELECT voucher_id FROM vouchers WHERE partner_id IN (SELECT partner_id FROM users WHERE user_id = auth.uid()))));
CREATE POLICY "customer_own_issued" ON issued_vouchers FOR SELECT TO authenticated USING (order_item_id IN (SELECT order_item_id FROM order_items WHERE order_id IN (SELECT order_id FROM orders WHERE customer_id = auth.uid())));

-- 7.13 REVIEWS
DROP POLICY IF EXISTS "customer_own_reviews" ON reviews;
DROP POLICY IF EXISTS "public_read_reviews"  ON reviews;
DROP POLICY IF EXISTS "admin_reviews"        ON reviews;
DROP POLICY IF EXISTS "partner_reviews"      ON reviews;
CREATE POLICY "customer_own_reviews" ON reviews FOR ALL TO authenticated
    USING (customer_id = auth.uid())
    WITH CHECK (customer_id = auth.uid());
CREATE POLICY "public_read_reviews"  ON reviews FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "admin_reviews"        ON reviews FOR ALL TO authenticated
    USING (auth.uid() IN (SELECT auth.uid() FROM users WHERE role = 'Admin'))
    WITH CHECK (auth.uid() IN (SELECT auth.uid() FROM users WHERE role = 'Admin'));
CREATE POLICY "partner_reviews"      ON reviews FOR SELECT TO authenticated USING (voucher_id IN (SELECT voucher_id FROM vouchers WHERE partner_id IN (SELECT partner_id FROM users WHERE user_id = auth.uid())));

-- 7.14 SYSTEM_LOGS
DROP POLICY IF EXISTS "admin_only_logs" ON system_logs;
CREATE POLICY "admin_only_logs" ON system_logs FOR ALL TO authenticated
    USING (auth.uid() IN (SELECT auth.uid() FROM users WHERE role = 'Admin'))
    WITH CHECK (auth.uid() IN (SELECT auth.uid() FROM users WHERE role = 'Admin'));

-- 8. GRANTS
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT ON categories, banners, policies, vouchers, reviews TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON users, cart_items, orders TO authenticated;
GRANT SELECT ON order_items, issued_vouchers TO authenticated;

GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- File này không có seed data – bạn sẽ insert sau khi DB chạy ổn.
