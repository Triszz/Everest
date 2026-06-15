// Prisma 7 – Config cho Supabase PostgreSQL
// Lưu ý: Prisma 7 không cho phép url/directUrl trong schema.prisma nữa.
// Tất cả connection config phải ở đây.
import "dotenv/config";
import { defineConfig } from "prisma/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"]!, // Dùng DIRECT_URL cho migrate (session mode)
  },
});
