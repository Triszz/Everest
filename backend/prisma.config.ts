// Prisma 7 – Config cho Supabase PostgreSQL
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma CLI (migrate, studio, validate, db push) → dùng DATABASE_URL (pooler, port 6543)
    // vì máy dev có thể bị chặn port 5432 (TCP direct). Runtime trong app sẽ
    // tự resolve url trong schema.prisma → DATABASE_URL (pooler).
    // Lưu ý: Supabase pooler hỗ trợ cả DDL/SQL transaction.
    url: process.env["DATABASE_URL"]!,
  },
});
