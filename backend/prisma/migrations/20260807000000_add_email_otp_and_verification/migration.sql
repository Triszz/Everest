-- CreateEnum
CREATE TYPE "otp_purpose" AS ENUM ('REGISTER_VERIFY', 'RESET_PASSWORD', 'TWO_FA_LOGIN');

-- CreateTable
CREATE TABLE "email_otps" (
    "otp_id" SERIAL NOT NULL,
    "user_id" UUID,
    "email" VARCHAR(100) NOT NULL,
    "code_hash" VARCHAR(255) NOT NULL,
    "purpose" "otp_purpose" NOT NULL DEFAULT 'REGISTER_VERIFY',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "consumed_at" TIMESTAMPTZ,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_otps_pkey" PRIMARY KEY ("otp_id")
);

-- CreateIndex
CREATE INDEX "email_otps_email_purpose_consumed_at_idx" ON "email_otps"("email", "purpose", "consumed_at");

-- AddForeignKey
ALTER TABLE "email_otps" ADD CONSTRAINT "email_otps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "users" ADD COLUMN "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "email_verified_at" TIMESTAMPTZ;
