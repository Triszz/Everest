-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('ORDER_PURCHASED', 'ORDER_PAID', 'VOUCHER_GIFT_RECEIVED', 'VOUCHER_EXPIRING', 'SYSTEM');

-- CreateEnum
CREATE TYPE "notification_status" AS ENUM ('Unread', 'Read');

-- CreateTable
CREATE TABLE "notifications" (
    "notification_id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "notification_type" NOT NULL DEFAULT 'SYSTEM',
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "status" "notification_status" NOT NULL DEFAULT 'Unread',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notification_id")
);

-- CreateIndex
CREATE INDEX "notifications_user_id_status_idx" ON "notifications"("user_id", "status");

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
