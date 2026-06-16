-- =====================================================================
--  Everest Voucher EC – Database Initialization (PART 2/3)
-- =====================================================================

-- 4. INDEXES
CREATE INDEX idx_users_email        ON users(email);
CREATE INDEX idx_users_role         ON users(role);
CREATE INDEX idx_users_partner_id   ON users(partner_id);

CREATE INDEX idx_branches_partner   ON branches(partner_id);
CREATE INDEX idx_branches_cashier   ON branches(cashier_id);

CREATE INDEX idx_vouchers_partner          ON vouchers(partner_id);
CREATE INDEX idx_vouchers_category         ON vouchers(category_id);
CREATE INDEX idx_vouchers_approval_status  ON vouchers(approval_status);
CREATE INDEX idx_vouchers_display_status   ON vouchers(display_status);
CREATE INDEX idx_vouchers_start_end        ON vouchers(start_date, end_date);

CREATE INDEX idx_cart_customer      ON cart_items(customer_id);
CREATE INDEX idx_orders_customer     ON orders(customer_id);
CREATE INDEX idx_orders_status       ON orders(payment_status);
CREATE INDEX idx_order_items_order   ON order_items(order_id);
CREATE INDEX idx_order_items_voucher ON order_items(voucher_id);

CREATE INDEX idx_issued_voucher_code  ON issued_vouchers(voucher_code);
CREATE INDEX idx_issued_voucher_status ON issued_vouchers(status);
CREATE INDEX idx_issued_voucher_order_item ON issued_vouchers(order_item_id);

CREATE INDEX idx_reviews_voucher    ON reviews(voucher_id);
CREATE INDEX idx_reviews_customer   ON reviews(customer_id);

CREATE INDEX idx_logs_actor         ON system_logs(actor_id);
CREATE INDEX idx_logs_action        ON system_logs(action);
CREATE INDEX idx_logs_created_at    ON system_logs(created_at DESC);

-- 5. TRIGGERS – tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS trg_users_updated_at    ON users;
DROP TRIGGER IF EXISTS trg_partners_updated_at ON partners;
DROP TRIGGER IF EXISTS trg_vouchers_updated_at ON vouchers;
DROP TRIGGER IF EXISTS trg_orders_updated_at   ON orders;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_partners_updated_at
    BEFORE UPDATE ON partners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_vouchers_updated_at
    BEFORE UPDATE ON vouchers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- NOTE: Trigger handle_new_auth_user (Supabase Auth) đã bị xóa
-- Nếu cần, xóa function bằng: DROP FUNCTION IF EXISTS public.handle_new_auth_user();
