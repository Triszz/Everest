/**
 * Migration Script: Fix voucher codes generated with broken alphabet
 *
 * Context:
 *   Backend's VOUCHER_CODE_CHARS in orders.service.ts contained lowercase
 *   'i', 'o', and digit '1' that the comment claimed to have removed.
 *   This caused ~22% of generated codes to be rejected by the validation
 *   regex (which excludes I, O, l, 1 in any case).
 *
 * What this script does:
 *   1. Connects to PostgreSQL via DATABASE_URL.
 *   2. UPDATEs issued_vouchers.voucher_code for ALL rows that contain
 *      forbidden chars (lowercase i, o or digit 1).
 *   3. Re-issues codes for Unused + still-valid vouchers.
 *   4. Leaves Used / Expired / Locked vouchers untouched.
 *
 * Safety:
 *   - Never modifies status='Used' rows (preserve audit history).
 *   - DB transaction ensures atomicity.
 *   - Generates new codes using the SAME alphabet as production (so they
 *     pass validation regex).
 *
 * Run:
 *   # Dry run (no DB writes) — recommended first:
 *   cd backend && npx tsx scripts/migrate-voucher-codes.ts --dry-run
 *
 *   # Actual migration:
 *   cd backend && npx tsx scripts/migrate-voucher-codes.ts
 *
 * @author: Cursor
 */

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import crypto from "crypto";

// Sanity check: confirm DATABASE_URL was loaded from .env
if (!process.env.DATABASE_URL) {
  console.error(
    "\n❌ DATABASE_URL is undefined.\n" +
      "   Script phải chạy từ thư mục backend/ để tìm thấy .env.\n" +
      "   Run: cd backend && npx tsx scripts/migrate-voucher-codes.ts\n",
  );
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

// PHẢI khớp với orders.service.ts (đã fix)
const VOUCHER_CODE_CHARS =
  "023456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";
const VOUCHER_CODE_ALPHABET_SIZE = VOUCHER_CODE_CHARS.length; // 56
const VOUCHER_CODE_LENGTH = 8;
const MAX_RETRY = 5;

function generateVoucherCode(): string {
  const result: string[] = [];
  const mask = VOUCHER_CODE_ALPHABET_SIZE * 4; // 224
  for (let i = 0; i < VOUCHER_CODE_LENGTH; i++) {
    let byte: number;
    do {
      byte = crypto.randomBytes(1)[0];
    } while (byte >= mask);
    result.push(VOUCHER_CODE_CHARS[byte % VOUCHER_CODE_ALPHABET_SIZE]);
  }
  const raw = result.join("");
  return `EVR-${raw.slice(0, 4)}-${raw.slice(4)}`;
}

async function generateUniqueVoucherCode(): Promise<string> {
  for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
    // Uppercase để khớp với DB schema sau khi fix production code.
    const code = generateVoucherCode().toUpperCase();
    const existing = await prisma.issuedVoucher.findUnique({
      where: { voucherCode: code },
    });
    if (!existing) return code;
  }
  throw new Error("Failed to generate unique voucher code");
}

const VALID_REGEX = /^[0-9AC-HJ-NP-Za-hj-np-z]{4}-[0-9AC-HJ-NP-Za-hj-np-z]{4}$/i;

function hasInvalidChars(code: string): boolean {
  return !VALID_REGEX.test(code.trim());
}

async function main() {
  const isDryRun = process.argv.includes("--dry-run");
  console.log(`\n========== VOUCHER CODE MIGRATION (${isDryRun ? "DRY-RUN" : "LIVE"}) ==========\n`);

  // Step 1: Count affected rows
  const allIssued = await prisma.issuedVoucher.findMany({
    select: {
      issuedVoucherId: true,
      voucherCode: true,
      status: true,
      validTo: true,
      orderItemId: true,
    },
  });

  const invalidCodes = allIssued.filter((iv) => hasInvalidChars(iv.voucherCode));
  console.log(`Total issued_vouchers: ${allIssued.length}`);
  console.log(`Invalid codes (contain forbidden chars): ${invalidCodes.length}`);

  if (invalidCodes.length === 0) {
    console.log("\n✅ No invalid codes found. Migration not needed.");
    return;
  }

  // Step 2: Categorize
  const now = new Date();
  const toReissue: typeof invalidCodes = [];
  const toKeepAsUsed: typeof invalidCodes = [];
  const toKeepAsExpired: typeof invalidCodes = [];

  for (const iv of invalidCodes) {
    if (iv.status === "Used") {
      toKeepAsUsed.push(iv);
    } else if (iv.status === "Expired" || iv.status === "Locked" || iv.validTo < now) {
      toKeepAsExpired.push(iv);
    } else {
      // Unused + còn hạn → reissue
      toReissue.push(iv);
    }
  }

  console.log(`\nCategorized:`);
  console.log(`  - Used (giữ nguyên để bảo toàn audit): ${toKeepAsUsed.length}`);
  console.log(`  - Expired/Locked (giữ nguyên): ${toKeepAsExpired.length}`);
  console.log(`  - Unused + còn hạn (RE-ISSUE): ${toReissue.length}`);

  if (toReissue.length === 0) {
    console.log("\n⚠️  No reissueable codes. Migration complete.");
    return;
  }

  if (isDryRun) {
    console.log(`\n[DRY-RUN] Would re-issue ${toReissue.length} codes.`);
    console.log(`First 10 invalid codes (sample):`);
    for (let i = 0; i < Math.min(10, invalidCodes.length); i++) {
      const iv = invalidCodes[i];
      console.log(`  ${iv.issuedVoucherId}: ${iv.voucherCode} (${iv.status})`);
    }
    console.log(`\n[DRY-RUN] No changes made. Run without --dry-run to apply.`);
    return;
  }

  // Step 3: Re-issue
  console.log(`\nStep 3: Re-issuing ${toReissue.length} codes...`);
  const replacements: Map<number, { old: string; new: string }> = new Map();
  let successCount = 0;
  let failCount = 0;

  for (const iv of toReissue) {
    try {
      const newCode = await generateUniqueVoucherCode();
      replacements.set(iv.issuedVoucherId, {
        old: iv.voucherCode,
        new: newCode,
      });
      successCount++;
    } catch (err) {
      console.error(`Failed to generate code for ${iv.issuedVoucherId}:`, err);
      failCount++;
    }
  }

  console.log(`Generated: ${successCount}, Failed: ${failCount}`);

  // Step 4: Apply updates in transaction
  console.log(`\nStep 4: Applying updates to DB...`);
  await prisma.$transaction(async (tx) => {
    for (const [ivId, { old: _old, new: newCode }] of replacements) {
      await tx.issuedVoucher.update({
        where: { issuedVoucherId: ivId },
        data: { voucherCode: newCode },
      });
    }
  });

  console.log(`✅ Updated ${replacements.size} rows.`);

  // Step 5: Log
  console.log(`\nFirst 10 replacements (for audit):`);
  let i = 0;
  for (const [ivId, { old, new: newCode }] of replacements) {
    if (i++ >= 10) break;
    console.log(`  ${ivId}: ${old} → ${newCode}`);
  }

  console.log(`\n========== MIGRATION COMPLETE ==========\n`);
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
