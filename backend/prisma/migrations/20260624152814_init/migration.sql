-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('Admin', 'Customer', 'Partner_Owner', 'Partner_Cashier');

-- CreateEnum
CREATE TYPE "account_status" AS ENUM ('Active', 'Inactive', 'Banned');

-- CreateEnum
CREATE TYPE "partner_status" AS ENUM ('Pending', 'Approved', 'Rejected');

-- CreateEnum
CREATE TYPE "banner_status" AS ENUM ('Visible', 'Hidden');

-- CreateEnum
CREATE TYPE "policy_type" AS ENUM ('Terms_Of_Service', 'Privacy_Policy', 'Refund_Policy');

-- CreateEnum
CREATE TYPE "voucher_approval_status" AS ENUM ('Draft', 'Pending', 'Approved', 'Rejected');

-- CreateEnum
CREATE TYPE "voucher_display_status" AS ENUM ('Visible', 'Hidden');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('Pending', 'Paid', 'Cancelled');

-- CreateEnum
CREATE TYPE "voucher_usage_status" AS ENUM ('Unused', 'Used', 'Expired', 'Locked');

-- CreateTable
CREATE TABLE "users" (
    "user_id" UUID NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(15),
    "password_hash" VARCHAR(255),
    "full_name" VARCHAR(100) NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'Customer',
    "status" "account_status" NOT NULL DEFAULT 'Active',
    "partner_id" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "partners" (
    "partner_id" SERIAL NOT NULL,
    "company_name" VARCHAR(150) NOT NULL,
    "tax_code" VARCHAR(20) NOT NULL,
    "business_license_url" VARCHAR(255),
    "status" "partner_status" NOT NULL DEFAULT 'Pending',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("partner_id")
);

-- CreateTable
CREATE TABLE "branches" (
    "branch_id" SERIAL NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "cashier_id" UUID,
    "branch_name" VARCHAR(150) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "phone_number" VARCHAR(15),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("branch_id")
);

-- CreateTable
CREATE TABLE "categories" (
    "category_id" SERIAL NOT NULL,
    "category_name" VARCHAR(100) NOT NULL,
    "description" TEXT,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "banners" (
    "banner_id" SERIAL NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "image_url" VARCHAR(255) NOT NULL,
    "target_url" VARCHAR(255),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "status" "banner_status" NOT NULL DEFAULT 'Visible',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("banner_id")
);

-- CreateTable
CREATE TABLE "policies" (
    "policy_id" SERIAL NOT NULL,
    "policy_type" "policy_type" NOT NULL,
    "content" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policies_pkey" PRIMARY KEY ("policy_id")
);

-- CreateTable
CREATE TABLE "vouchers" (
    "voucher_id" SERIAL NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "original_price" DECIMAL(12,2) NOT NULL,
    "sale_price" DECIMAL(12,2) NOT NULL,
    "application_condition" TEXT,
    "total_quantity" INTEGER NOT NULL,
    "available_quantity" INTEGER NOT NULL,
    "image_url" VARCHAR(255),
    "start_date" TIMESTAMPTZ NOT NULL,
    "end_date" TIMESTAMPTZ NOT NULL,
    "expiry_days" INTEGER NOT NULL,
    "approval_status" "voucher_approval_status" NOT NULL DEFAULT 'Draft',
    "display_status" "voucher_display_status" NOT NULL DEFAULT 'Hidden',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("voucher_id")
);

-- CreateTable
CREATE TABLE "voucher_branches" (
    "voucher_id" INTEGER NOT NULL,
    "branch_id" INTEGER NOT NULL,

    CONSTRAINT "voucher_branches_pkey" PRIMARY KEY ("voucher_id","branch_id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "cart_item_id" SERIAL NOT NULL,
    "customer_id" UUID NOT NULL,
    "voucher_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "added_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("cart_item_id")
);

-- CreateTable
CREATE TABLE "orders" (
    "order_id" SERIAL NOT NULL,
    "customer_id" UUID NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "payment_method" VARCHAR(50),
    "payment_status" "payment_status" NOT NULL DEFAULT 'Pending',
    "is_gift" BOOLEAN NOT NULL DEFAULT false,
    "receiver_email" VARCHAR(100),
    "gift_message" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "order_item_id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "voucher_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("order_item_id")
);

-- CreateTable
CREATE TABLE "issued_vouchers" (
    "issued_voucher_id" SERIAL NOT NULL,
    "order_item_id" INTEGER NOT NULL,
    "voucher_code" VARCHAR(50) NOT NULL,
    "status" "voucher_usage_status" NOT NULL DEFAULT 'Unused',
    "valid_from" TIMESTAMPTZ NOT NULL,
    "valid_to" TIMESTAMPTZ NOT NULL,
    "used_at" TIMESTAMPTZ,
    "used_at_branch_id" INTEGER,

    CONSTRAINT "issued_vouchers_pkey" PRIMARY KEY ("issued_voucher_id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "review_id" SERIAL NOT NULL,
    "customer_id" UUID NOT NULL,
    "voucher_id" INTEGER NOT NULL,
    "issued_voucher_id" INTEGER,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("review_id")
);

-- CreateTable
CREATE TABLE "system_logs" (
    "log_id" BIGSERIAL NOT NULL,
    "actor_id" UUID,
    "actor_role" VARCHAR(50),
    "action" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "partners_tax_code_key" ON "partners"("tax_code");

-- CreateIndex
CREATE UNIQUE INDEX "branches_cashier_id_key" ON "branches"("cashier_id");

-- CreateIndex
CREATE UNIQUE INDEX "policies_policy_type_key" ON "policies"("policy_type");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_customer_id_voucher_id_key" ON "cart_items"("customer_id", "voucher_id");

-- CreateIndex
CREATE UNIQUE INDEX "issued_vouchers_voucher_code_key" ON "issued_vouchers"("voucher_code");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("partner_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("partner_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_cashier_id_fkey" FOREIGN KEY ("cashier_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("partner_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_branches" ADD CONSTRAINT "voucher_branches_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "vouchers"("voucher_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_branches" ADD CONSTRAINT "voucher_branches_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("branch_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "vouchers"("voucher_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "vouchers"("voucher_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_vouchers" ADD CONSTRAINT "issued_vouchers_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("order_item_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_vouchers" ADD CONSTRAINT "issued_vouchers_used_at_branch_id_fkey" FOREIGN KEY ("used_at_branch_id") REFERENCES "branches"("branch_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "vouchers"("voucher_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_issued_voucher_id_fkey" FOREIGN KEY ("issued_voucher_id") REFERENCES "issued_vouchers"("issued_voucher_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_logs" ADD CONSTRAINT "system_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
