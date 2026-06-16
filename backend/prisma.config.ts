// Prisma 7 – Config cho Supabase PostgreSQL
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma CLI (migrate, studio, validate, db push) → dùng DIRECT_URL (direct connection, port 5432)
    // Runtime (app chạy) → dùng DATABASE_URL (pooler, port 6543) — connection string trong code sẽ tự resolve
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"]!,
  },
});
