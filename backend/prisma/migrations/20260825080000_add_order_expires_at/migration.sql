-- Migration: add expires_at column for Order
-- Orders ở trạng thái Pending sẽ tự động expire sau 15 phút nếu không checkout.
-- Index composite (payment_status, expires_at) để auto-cancel job quét nhanh.

ALTER TABLE "orders"
  ADD COLUMN "expires_at" TIMESTAMPTZ;

CREATE INDEX "orders_payment_status_expires_at_idx"
  ON "orders" ("payment_status", "expires_at")
  WHERE "expires_at" IS NOT NULL;