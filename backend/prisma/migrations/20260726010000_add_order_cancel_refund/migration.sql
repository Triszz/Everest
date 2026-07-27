-- AddOrderCancelRefund
ALTER TABLE "orders"
    ADD COLUMN "cancelled_at" TIMESTAMPTZ,
    ADD COLUMN "cancelled_by" UUID,
    ADD COLUMN "cancel_reason" TEXT,
    ADD COLUMN "refunded_at" TIMESTAMPTZ,
    ADD COLUMN "refunded_by" UUID,
    ADD COLUMN "refund_reason" TEXT,
    ADD COLUMN "refund_amount" DECIMAL(12, 2);

CREATE INDEX "orders_payment_status_idx" ON "orders"("payment_status");
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at");