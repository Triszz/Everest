/**
 * Debug script: Investigate voucher code mismatch
 *
 * Question: After fix, generator creates valid codes (e.g. EVR-2K4M-7NP9).
 *           Staff scans QR (or types) → backend normalizes → uppercase.
 *           Prisma findUnique returns null. Why?
 *
 * Hypotheses:
 *   H1: DB stores 'EVR-2K4M-7np9' (mixed case from generator) → fine.
 *       Staff sends 'EVR-2K4M-7NP9' → normalize → 'EVR-2K4M-7NP9' → match.
 *   H2: DB stores 'EVR-2k4m-7np9' (lowercase) → normalize uppercases → 'EVR-2K4M-7NP9' ≠ 'EVR-2k4m-7np9' → NOT FOUND.
 *   H3: DB schema is case-sensitive but server assumes case-insensitive.
 *
 * Run: cd backend && npx tsx scripts/debug-voucher-lookup.ts EVR-XXXX-XXXX
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const targetCode = process.argv[2] ?? "EVR-8OVU-GVFY";

async function main() {
  console.log("\n========== DEBUG VOUCHER LOOKUP ==========\n");
  console.log("Target code:", targetCode);

  // Step 1: Try findUnique with exact case
  console.log("\n--- Query 1: findUnique({ voucherCode: targetCode }) ---");
  const exact = await prisma.issuedVoucher.findUnique({
    where: { voucherCode: targetCode },
  });
  console.log("Result:", exact ?? "NULL");

  // Step 2: Try with uppercase
  console.log("\n--- Query 2: findUnique({ voucherCode: targetCode.toUpperCase() }) ---");
  const upper = await prisma.issuedVoucher.findUnique({
    where: { voucherCode: targetCode.toUpperCase() },
  });
  console.log("Result:", upper ?? "NULL");

  // Step 3: Try with lowercase
  console.log("\n--- Query 3: findUnique({ voucherCode: targetCode.toLowerCase() }) ---");
  const lower = await prisma.issuedVoucher.findUnique({
    where: { voucherCode: targetCode.toLowerCase() },
  });
  console.log("Result:", lower ?? "NULL");

  // Step 4: Search via findMany (case-insensitive via raw SQL would be ILIKE)
  console.log("\n--- Query 4: findFirst with raw SQL ILIKE ---");
  const all = await prisma.$queryRawUnsafe<{ voucher_code: string; status: string; issued_voucher_id: number }[]>(
    `SELECT voucher_code, status, issued_voucher_id FROM issued_vouchers WHERE voucher_code ILIKE $1 LIMIT 20`,
    targetCode
  );
  console.log("Found rows (case-insensitive):", all.length);
  for (const r of all) {
    console.log(`  ID=${r.issued_voucher_id} status=${r.status} code="${r.voucher_code}"`);
  }

  // Step 5: Show last 20 issued vouchers (any case)
  console.log("\n--- Query 5: Last 20 issued vouchers (any case) ---");
  const recent = await prisma.issuedVoucher.findMany({
    take: 20,
    orderBy: { issuedVoucherId: "desc" },
    select: { issuedVoucherId: true, voucherCode: true, status: true, validTo: true },
  });
  for (const r of recent) {
    console.log(`  ID=${r.issuedVoucherId} status=${r.status} code="${r.voucherCode}" validTo=${r.validTo.toISOString()}`);
  }

  // Step 6: Count rows with mixed-case codes
  console.log("\n--- Query 6: Count rows with lowercase letters ---");
  const mixed = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT COUNT(*) as count FROM issued_vouchers WHERE voucher_code ~ '[a-z]'`
  );
  console.log("Rows with lowercase:", mixed[0]?.count ?? "?");

  const upperOnly = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT COUNT(*) as count FROM issued_vouchers WHERE voucher_code = UPPER(voucher_code)`
  );
  console.log("Rows that are already ALL UPPER:", upperOnly[0]?.count ?? "?");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
