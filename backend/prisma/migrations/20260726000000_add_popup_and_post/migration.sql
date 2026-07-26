-- CreateEnum
CREATE TYPE "post_status" AS ENUM ('Visible', 'Hidden');
CREATE TYPE "popup_status" AS ENUM ('Visible', 'Hidden');

-- CreateTable
CREATE TABLE "popups" (
    "popup_id" SERIAL NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "body" VARCHAR(500) NOT NULL,
    "image_url" VARCHAR(255),
    "cta_label" VARCHAR(40),
    "cta_target_url" VARCHAR(255),
    "status" "popup_status" NOT NULL DEFAULT 'Hidden',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "popups_pkey" PRIMARY KEY ("popup_id")
);

CREATE TABLE "posts" (
    "post_id" SERIAL NOT NULL,
    "author_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "image_url" VARCHAR(255),
    "status" "post_status" NOT NULL DEFAULT 'Hidden',
    "published_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("post_id")
);

-- Indexes
CREATE INDEX "popups_status_idx" ON "popups"("status");
CREATE INDEX "posts_status_published_at_idx" ON "posts"("status", "published_at" DESC);

-- Foreign key
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_fkey"
    FOREIGN KEY ("author_id") REFERENCES "users"("user_id")
    ON DELETE RESTRICT ON UPDATE CASCADE;