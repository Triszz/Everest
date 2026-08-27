import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function cleanDatabase() {
  console.log("🧹 Đang dọn dẹp (clean) toàn bộ dữ liệu trong Database PostgreSQL...");

  try {
    // Truncate tất cả các bảng theo đúng thứ tự phụ thuộc khóa ngoại
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE 
        "admin_audit_log", 
        "notifications", 
        "notification_preferences", 
        "email_otps", 
        "password_resets", 
        "feedbacks", 
        "reviews", 
        "issued_vouchers", 
        "order_items", 
        "orders", 
        "cart_items", 
        "voucher_branches", 
        "vouchers", 
        "policies", 
        "posts", 
        "popups", 
        "banners", 
        "categories", 
        "branches", 
        "users", 
        "partners" 
      RESTART IDENTITY CASCADE;
    `);

    console.log("✅ Đã dọn dẹp sạch sẽ toàn bộ Database thành công!");
  } catch (error) {
    console.error("❌ Lỗi khi dọn dẹp Database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
