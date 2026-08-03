-- Business rule: Cashier không lưu thông tin cá nhân (fullName).
-- Cho phép User.fullName là NULL (cashier chỉ cần email/password).
-- Vẫn giữ NOT NULL cho các role khác (Customer, Partner_Owner) — enforce ở tầng service.

-- Trước tiên, thay thế chuỗi rỗng (nếu có) thành NULL để tránh vi phạm constraint.
UPDATE "users" SET "full_name" = NULL WHERE "full_name" = '';

-- Thay đổi cột full_name thành nullable.
ALTER TABLE "users"
ALTER COLUMN "full_name" DROP NOT NULL;