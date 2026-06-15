# Everest Backend – Kiến thức RLS & Grants trong `init_03_rls_and_grants.sql`

## Mục lục

- [1. RLS là gì?](#1-rls-là-gì)
- [2. Cách RLS hoạt động trong PostgreSQL](#2-cách-rls-hoạt-động-trong-postgresql)
- [3. Cấu trúc file `init_03_rls_and_grants.sql`](#3-cấu-trúc-file-init_03_rls_and_grantssql)
- [4. Phân tích từng phần](#4-phân-tích-từng-phần)
- [5. Các mẫu policy phổ biến trong Everest](#5-các-mẫu-policy-phổ-biến-trong-everest)
- [6. Lỗi thường gặp & cách fix](#6-lỗi-thường-gặp--cách-fix)
- [7. Grunts trong Everest](#7-grants-trong-everest)
- [8. Best practices](#8-best-practices)

---

## 1. RLS là gì?

**Row Level Security (RLS)** là cơ chế PostgreSQL cho phép bạn kiểm soát **hàng nào** (row-level) mà mỗi user có thể xem/sửa trong một bảng.

- Khi RLS **bật**: mọi truy vấn đều phải pass qua policy check
- Khi RLS **tắt**: ai cũng có thể đọc/ghi/xóa hết (UNRESTRICTED)
- Supabase dựa trên RLS để bảo vệ dữ liệu qua API

### Bật/tắt RLS

```sql
-- Bật RLS cho bảng
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Tắt RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

---

## 2. Cách RLS hoạt động trong PostgreSQL

### Luồng kiểm tra

```
User gửi query → Database → PostgreSQL kiểm tra RLS
    ↓
Policy nào match? (check: role, operation, USING clause)
    ↓
USING clause đúng? → Cho phép/Trả lỗi
    ↓
Nếu là INSERT/UPDATE: WITH CHECK clause xác nhận data mới
```

### Cú pháp CREATE POLICY

```sql
CREATE POLICY [policy_name] ON [table_name]
    FOR [operation] TO [role]
    USING ([condition])
    WITH CHECK ([condition]);  -- chỉ cho INSERT/UPDATE
```

### Giải thích các thành phần

| Thành phần | Mô tả | Ví dụ |
|------------|-------|-------|
| `FOR ALL` | Áp dụng cho mọi thao tác | `FOR ALL TO authenticated` |
| `FOR SELECT` | Chỉ đọc | `FOR SELECT TO anon` |
| `FOR INSERT` | Chỉ thêm mới | `FOR INSERT TO authenticated` |
| `FOR UPDATE` | Chỉ cập nhật | `FOR UPDATE TO authenticated` |
| `FOR DELETE` | Chỉ xóa | `FOR DELETE TO authenticated` |
| `TO authenticated` | Áp dụng cho user đã đăng nhập | `TO authenticated` |
| `TO anon` | Áp dụng cho user chưa đăng nhập | `TO anon` |
| `TO service_role` | Áp dụng cho service role (backend) | `TO service_role` |
| `USING` | Điều kiện đọc/UPDATE/DELETE | `auth.uid() = user_id` |
| `WITH CHECK` | Điều kiện INSERT/UPDATE mới | `status = 'Active'` |

---

## 3. Cấu trúc file `init_03_rls_and_grants.sql`

File này gồm 2 phần chính:

```
─── Section 7: ROW LEVEL SECURITY ─────────────────────────────
│   ├── 7.1  USERS (admin_all + user_self)
│   ├── 7.2  PARTNERS (admin_all + partner_self)
│   ├── 7.3  BRANCHES (admin_all + partner_own + public_read)
│   ├── 7.4  CATEGORIES (public_read + admin_modify)
│   ├── 7.5  BANNERS (public_read + admin_modify)
│   ├── 7.6  POLICIES (public_read + admin_modify)
│   ├── 7.7  VOUCHERS (admin_all + partner_own + customer_read)
│   ├── 7.8  VOUCHER_BRANCHES (admin_all + partner_voucher + customer_read)
│   ├── 7.9  CART_ITEMS (customer_own)
│   ├── 7.10 ORDERS (admin_all + partner_view + customer_own)
│   ├── 7.11 ORDER_ITEMS (customer_read + admin_all)
│   ├── 7.12 ISSUED_VOUCHERS (admin_all + partner_view + customer_view)
│   ├── 7.13 REVIEWS (customer_own + public_read + admin_all + partner_view)
│   └── 7.14 SYSTEM_LOGS (admin_only)
│
─── Section 8: GRANTS ──────────────────────────────────────────
    ├── GRANT USAGE ON SCHEMA public
    ├── GRANT SELECT trên bảng public
    ├── GRANT SELECT, INSERT, UPDATE, DELETE trên bảng user-owned
    └── GRANT ALL PRIVILEGES ON ALL TABLES/SEQUENCES/FUNCTIONS TO service_role
```

---

## 4. Phân tích từng phần

### 7.1 USERS

```sql
-- Cho phép Admin quản lý hết
CREATE POLICY "admin_all_users" ON users FOR ALL TO authenticated
    USING (auth.uid() IN (SELECT auth.uid() FROM users WHERE role = 'Admin'))
    WITH CHECK (auth.uid() IN (SELECT auth.uid() FROM users WHERE role = 'Admin'));

-- Cho phép user xem thông tin của chính mình
CREATE POLICY "user_self" ON users FOR SELECT TO authenticated
    USING (auth.uid() = user_id);
```

**Logic:**
- Admin xem/sửa/xóa bất kỳ user nào (kiểm tra role = 'Admin')
- User thường chỉ xem được thông tin của chính mình (so sánh UUID)

**Quyền thực tế:**
| Role | Xem user khác | Xem mình | Sửa mình | Xóa | Sửa khác |
|------|---------------|----------|----------|-----|----------|
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Customer | ❌ | ✅ | ❌ (không có policy) | ❌ | ❌ |
| Partner | ❌ | ✅ | ❌ | ❌ | ❌ |

### 7.3 BRANCHES

```sql
CREATE POLICY "partner_own_branches" ON branches FOR ALL TO authenticated
    USING (partner_id IN (SELECT partner_id FROM users WHERE user_id = auth.uid()))
    WITH CHECK (partner_id IN (SELECT partner_id FROM users WHERE user_id = auth.uid()));
```

**Logic:**
- Partner xem/sửa các chi nhánh của công ty mình
- `partner_id` từ JWT so sánh với `partner_id` trong bảng users

### 7.7 VOUCHERS

```sql
CREATE POLICY "customer_read_active_vouchers" ON vouchers FOR SELECT TO authenticated, anon
    USING (approval_status = 'Approved'
       AND display_status = 'Visible'
       AND start_date <= now()
       AND end_date >= now()
       AND available_quantity > 0);
```

**Logic:**
- Customer/guest chỉ xem voucher còn hàng, đã duyệt, đang hiển thị
- Dùng `TO authenticated, anon` để cả login/guest đều xem được

### 7.9 CART_ITEMS

```sql
CREATE POLICY "customer_own_cart" ON cart_items FOR ALL TO authenticated
    USING (customer_id = auth.uid())
    WITH CHECK (customer_id = auth.uid());
```

**Logic:**
- Customer chỉ thao tác với giỏ hàng của chính mình
- `auth.uid()` trả về UUID của user đang đăng nhập

### 7.13 REVIEWS

```sql
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT TO authenticated, anon
    USING (true);  -- Ai cũng xem được
```

**Logic:**
- Dùng `USING (true)` để tạo policy "cho phép tất cả" - pattern cho public data

---

## 5. Các mẫu policy phổ biến trong Everest

### Mẫu 1: Admin Full Access

```sql
CREATE POLICY "admin_all_[table]" ON [table] FOR ALL TO authenticated
    USING (auth.uid() IN (SELECT auth.uid() FROM users WHERE role = 'Admin'))
    WITH CHECK (auth.uid() IN (SELECT auth.uid() FROM users WHERE role = 'Admin'));
```

**Khi dùng:** Bảng cần admin quản lý (users, vouchers, orders...)

### Mẫu 2: Owner/Partner Access

```sql
CREATE POLICY "partner_own_[table]" ON [table] FOR ALL TO authenticated
    USING (partner_id IN (SELECT partner_id FROM users WHERE user_id = auth.uid()))
    WITH CHECK (partner_id IN (SELECT partner_id FROM users WHERE user_id = auth.uid()));
```

**Khi dùng:** Partner quản lý data của công ty mình (branches, vouchers)

### Mẫu 3: Customer Self Access

```sql
CREATE POLICY "customer_own_[table]" ON [table] FOR ALL TO authenticated
    USING (customer_id = auth.uid())
    WITH CHECK (customer_id = auth.uid());
```

**Khi dùng:** Customer thao tác data cá nhân (cart, orders, reviews)

### Mẫu 4: Public Read (Anonymous + Authenticated)

```sql
CREATE POLICY "public_read_[table]" ON [table] FOR SELECT TO authenticated, anon
    USING ([condition]);  -- true = ai cũng đọc được
```

**Khi dùng:** Danh sách public (categories, banners, policies, reviews)

### Mẫu 5: Conditional Read

```sql
CREATE POLICY "customer_read_active_vouchers" ON vouchers FOR SELECT TO authenticated, anon
    USING (approval_status = 'Approved'
       AND display_status = 'Visible'
       AND start_date <= now()
       AND end_date >= now()
       AND available_quantity > 0);
```

**Khi dùng:** Chỉ trả về row thỏa điều kiện nghiệp vụ

---

## 6. Lỗi thường gặp & cách fix

### ❌ Lỗi: `syntax error at or near ","`

**Nguyên nhân:** Dùng nhiều operations trong 1 policy

```sql
-- ❌ SAI - Supabase không chấp nhận
CREATE POLICY "admin_modify" ON categories FOR INSERT, UPDATE, DELETE TO authenticated ...;

-- ✅ ĐÚNG - Dùng FOR ALL
CREATE POLICY "admin_modify" ON categories FOR ALL TO authenticated ...;
```

### ❌ Lỗi: `policy does not exist` hoặc infinite loop

**Nguyên nhân:** Policy tự tham chiếu bảng chính (ví dụ: policy trên `users` query bảng `users`)

```sql
-- ❌ NGUY HIỂM - Có thể gây infinite loop
CREATE POLICY "admin_check" ON users FOR ALL TO authenticated
    USING (auth.uid() IN (SELECT user_id FROM users WHERE role = 'Admin'));

-- ✅ ĐÚNG - Dùng bảng an toàn hoặc subquery đơn giản
CREATE POLICY "admin_check" ON users FOR ALL TO authenticated
    USING (auth.uid() IN (SELECT auth.uid() FROM users WHERE role = 'Admin'));
```

### ❌ Lỗi: `new row violates row-level security policy`

**Nguyên nhân:** `WITH CHECK` clause bị từ chối khi INSERT/UPDATE

```sql
-- ❌ Nếu bạn chỉ định nghĩa USING nhưng thiếu WITH CHECK cho INSERT
CREATE POLICY "test" ON orders FOR INSERT TO authenticated
    USING (customer_id = auth.uid());
-- Khi INSERT mới, row chưa tồn tại nên USING không thể check → dùng WITH CHECK

-- ✅ ĐÚNG
CREATE POLICY "test" ON orders FOR INSERT TO authenticated
    WITH CHECK (customer_id = auth.uid());
```

### ❌ Lỗi: Empty subquery returns NULL

**Nguyên nhân:** Nếu không có user nào thỏa điều kiện, subquery trả về NULL → policy fail

```sql
-- Có thể thêm COALESCE để an toàn
USING (auth.uid() IN (
    SELECT auth.uid() FROM users WHERE role = 'Admin'
))
```

### ❌ Lỗi: Supabase SQL Editor "Syntax error"

**Nguyên nhân:** Chạy toàn bộ file 3 có thể có policy lỗi ở giữa

**Cách fix:** Chạy từng section (7.1, 7.2...) một cách tuần tự

---

## 7. Grants trong Everest

### Tại sao cần GRANT?

Supabase chạy trên PostgreSQL với **3 roles** chính:

| Role | Mô tả |
|------|-------|
| `anon` | User chưa đăng nhập (guest) |
| `authenticated` | User đã đăng nhập qua Supabase Auth |
| `service_role` | Backend/server key (bypass RLS) |

Mặc định PostgreSQL **không cho phép** các role này truy cập bảng. Cần `GRANT` để cấp quyền.

### Các lệnh GRANT trong Everest

```sql
-- 1. Cho phép dùng schema public (bắt buộc)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Bảng đọc được public (không cần login)
GRANT SELECT ON categories, banners, policies, vouchers, reviews TO anon, authenticated;

-- 3. Bảng user-owned (cần login)
GRANT SELECT, INSERT, UPDATE, DELETE ON users, cart_items, orders TO authenticated;
GRANT SELECT ON order_items, issued_vouchers TO authenticated;

-- 4. Backend có toàn quyền (bypass RLS!)
GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;
```

### Quyền thực tế theo role

| Bảng | anon | authenticated | service_role |
|------|------|---------------|---------------|
| categories | SELECT | SELECT | ALL |
| banners | SELECT | SELECT | ALL |
| policies | SELECT | SELECT | ALL |
| vouchers | SELECT | SELECT | ALL |
| reviews | SELECT | SELECT | ALL |
| users | ❌ | SELECT, INSERT, UPDATE, DELETE | ALL |
| cart_items | ❌ | SELECT, INSERT, UPDATE, DELETE | ALL |
| orders | ❌ | SELECT, INSERT, UPDATE, DELETE | ALL |
| order_items | ❌ | SELECT | ALL |
| issued_vouchers | ❌ | SELECT | ALL |

### Lưu ý quan trọng về service_role

```sql
-- service_role BYPASS RLS hoàn toàn!
-- Backend dùng service_role key có thể đọc/ghi mọi bảng bất kể policy

-- ✅ An toàn: service_role chỉ dùng ở backend, không expose ra frontend
// backend/src/config/prisma.ts
const prisma = new PrismaClient({
  adapter: new PrismaPg(new Pool({ connectionString: process.env.SUPABASE_SERVICE_ROLE_KEY }))
});

// ❌ Nguy hiểm: Nếu bạn lộ service_role key ra frontend → hacker có quyền full DB
```

---

## 8. Best practices

### 8.1 Luôn có policy mặc định

```sql
-- Nếu quên tạo policy cho INSERT, row sẽ bị reject
-- Khuyến nghị: Tạo policy mặc định cho mọi thao tác cần thiết
```

### 8.2 Dùng `FOR ALL` thay vì liệt kê operations

```sql
-- ❌ Dễ lỗi syntax khi liệt kê nhiều operations
FOR INSERT, UPDATE, DELETE TO authenticated

-- ✅ Đơn giản và rõ ràng
FOR ALL TO authenticated
```

### 8.3 `USING` vs `WITH CHECK`

```sql
-- USING: Áp dụng khi ĐỌC (SELECT, UPDATE, DELETE)
USING (customer_id = auth.uid())     -- Kiểm tra row hiện tại

-- WITH CHECK: Áp dụng khi THÊM MỚI (INSERT) hoặc UPDATE tạo row mới
WITH CHECK (customer_id = auth.uid()) -- Kiểm tra row mới tạo
```

### 8.4 `TO authenticated, anon` cho public data

```sql
-- Cho cả guest và logged-in user đọc được
FOR SELECT TO authenticated, anon USING (true);

-- Chỉ user đã đăng nhập
FOR SELECT TO authenticated USING (...);
```

### 8.5 Đặt tên policy theo convention

```
[scope]_[action]_[table]
```

Ví dụ:
- `admin_all_users` - Admin thao tác all trên users
- `partner_own_branches` - Partner quản lý branches của mình
- `public_read_banners` - Mọi người đọc banners
- `customer_own_cart` - Customer quản lý giỏ hàng riêng

### 8.6 Thứ tự tạo policy

```sql
-- 1. DROP policy cũ (nếu có) - idempotent
DROP POLICY IF EXISTS "policy_name" ON table_name;

-- 2. Tạo policy mới
CREATE POLICY "policy_name" ON table_name FOR ... USING ... WITH CHECK ...;
```

### 8.7 Test policy sau khi tạo

```sql
-- Chạy bằng authenticated user
SELECT * FROM users;  -- Phải chỉ thấy row mình được phép

-- Chạy bằng anon role
SET ROLE anon;
SELECT * FROM banners;  -- Phải thấy hết banners
SELECT * FROM users;    -- Phải fail (không có policy SELECT cho anon)
RESET ROLE;
```

---

## Tổng kết

| Khái niệm | Mô tả | Trong Everest |
|-----------|-------|---------------|
| **RLS** | Kiểm soát hàng nào user được xem/sửa | 14 bảng đều bật RLS |
| **Policy** | Quy tắc chi tiết (USING, WITH CHECK) | 20+ policies |
| **auth.uid()** | UUID của user đang đăng nhập | Dùng trong USING clause |
| **FOR ALL** | Áp dụng mọi thao tác CRUD | Admin policies |
| **TO authenticated** | Chỉ user đã đăng nhập | Customer/Partner policies |
| **TO anon** | Cho guest/không đăng nhập | Public read policies |
| **GRANT** | Cấp quyền schema/table | Cho anon, authenticated, service_role |
| **service_role** | Backend key bypass RLS | Dùng trong Prisma Client |

## Tài liệu tham khảo

- [PostgreSQL RLS Docs](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Policies](https://supabase.com/docs/guides/auth/policies)

---

*File này được tạo dựa trên `backend/db/init_03_rls_and_grants.sql` - Everest Voucher EC project.*
