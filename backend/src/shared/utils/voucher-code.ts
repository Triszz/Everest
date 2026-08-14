/**
 * Voucher Code Utilities
 * ------------------------------------------------
 * Chuẩn hóa voucher code cho toàn bộ project.
 * Dùng chung cho backend (Validate API, Order, Payment, Migrate script) và frontend (Expo).
 *
 * Alphabet: 56 ký tự (loại b� I, O, i, l, o, 1 để tránh nhầm lẫn khi nhập tay).
 * Entropy : log₂(56⁸) ≈ 45.6 bits
 *
 * Format  : EVR-XXXX-XXXX (8 ký tự ngẫu nhiên, phân tách bởi dấu '-').
 *
 * Lưu ý: alphabet này PHẢI đồng bộ giữa generator và regex.
 *        Nếu thay đổi alphabet, phải chạy lại `backend/scripts/migrate-voucher-codes.ts`
 *        để chuẩn hóa các code đã tồn tại trong DB.
 */
import crypto from "crypto";

/** Số ký tự ngẫu nhiên trong code (không tính prefix EVR- và dấu -) */
export const VOUCHER_CODE_LENGTH = 8;

/** Số ký tự mỗi phần: 4 + 4 */
export const VOUCHER_CODE_PART_LENGTH = 4;

/**
 * Regex validate voucher code.
 * Format: EVR-XXXX-XXXX
 * - Prefix: EVR-
 * - 2 phần, mỗi phần 4 ký tự alphanumeric
 * - KHÔNG chứa I, O, l, 1 (dễ nhầm)
 *
 * Alphabet: [0-9AC-HJ-NP-Za-hj-np-z] — 56 ký tự (khớp với generator)
 */
export const VOUCHER_CODE_REGEX =
  /^EVR-[0-9AC-HJ-NP-Za-hj-np-z]{4}-[0-9AC-HJ-NP-Za-hj-np-z]{4}$/i;

/**
 * Validate một chuỗi có phải voucher code hợp lệ hay không.
 * Dùng cho cả backend Validate API và frontend input validation.
 *
 * @param code - chuỗi cần kiểm tra
 * @returns true nếu hợp lệ
 *
 * @example
 * isValidVoucherCode("EVR-X8A4-KP72") // true
 * isValidVoucherCode("evr-x8a4-kp72") // true (case-insensitive)
 * isValidVoucherCode("EVR-X8A4")      // false (thiếu phần 2)
 * isValidVoucherCode("EVR-ABCD-1234") // false (chứa I, O, l, 1)
 */
export function isValidVoucherCode(code: unknown): code is string {
  if (typeof code !== "string") return false;
  return VOUCHER_CODE_REGEX.test(code.trim());
}

/**
 * Normalize voucher code về uppercase.
 * Frontend Expo gửi lên có thể là lowercase.
 *
 * @param code - chuỗi cần normalize
 * @returns voucher code uppercase hoặc null nếu không hợp lệ
 */
export function normalizeVoucherCode(code: string): string | null {
  const trimmed = typeof code === "string" ? code.trim().toUpperCase() : "";
  return isValidVoucherCode(trimmed) ? trimmed : null;
}

/**
 * Alphabet cho voucher code — 56 ký tự.
 * Loại bỏ I, O (uppercase), i, l, o (lowercase) và 1 (digit) để tránh nhầm lẫn khi nhập tay.
 * PHẢI khớp với VOUCHER_CODE_REGEX ở trên (cùng alphabet).
 */
const VOUCHER_CODE_CHARS =
  "023456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";
const VOUCHER_CODE_ALPHABET_SIZE = VOUCHER_CODE_CHARS.length; // 56
const MAX_RETRY = 3;

/**
 * Sinh 8 ký tự ngẫu nhiên uniform (rejection sampling).
 * Tránh modulo bias hoàn toàn.
 *
 * Internal — chỉ dùng bởi `generateUniqueVoucherCode`. Không export.
 */
function generateVoucherCodeRaw(): string {
  const result: string[] = [];
  // 256 % 56 = 32, loại bỏ 32 giá trị byte (224-255) để đạt uniform distribution
  const mask = VOUCHER_CODE_ALPHABET_SIZE * 4; // 224 — floor(256/56)*56

  for (let i = 0; i < VOUCHER_CODE_LENGTH; i++) {
    let byte: number;
    do {
      byte = crypto.randomBytes(1)[0];
    } while (byte >= mask); // rejection sampling
    result.push(VOUCHER_CODE_CHARS[byte % VOUCHER_CODE_ALPHABET_SIZE]);
  }

  const raw = result.join("");
  return `EVR-${raw.slice(0, 4)}-${raw.slice(4)}`;
}

/**
 * Prisma transaction client subset cần thiết để check uniqueness.
 * Chấp nhận cả `Prisma.TransactionClient` lẫn `PrismaClient`.
 */
type TxWithIssuedVoucher = {
  issuedVoucher: {
    findUnique: (args: {
      where: { voucherCode: string };
    }) => Promise<{ voucherCode: string } | null>;
  };
};

/**
 * Sinh code có retry trên @unique collision.
 * Dùng chung cho Order checkout, Payment success, Migration script.
 *
 * @param tx - Prisma transaction client (hoặc PrismaClient). Bắt buộc để
 *             check uniqueness trong cùng transaction với lệnh create,
 *             tránh race condition khi 2 request cùng tạo voucher đồng thời.
 * @returns voucher code duy nhất (uppercase, match regex)
 * @throws Error nếu không thể sinh code unique sau MAX_RETRY lần.
 */
export async function generateUniqueVoucherCode(
  tx: TxWithIssuedVoucher,
): Promise<string> {
  for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
    // Uppercase để chuẩn hóa: PostgreSQL VARCHAR collation mặc định là
    // case-sensitive, nên cùng 1 code viết thường vs HOA sẽ được coi là 2
    // record khác nhau → vi phạm @unique.
    const code = generateVoucherCodeRaw().toUpperCase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await (tx as any).issuedVoucher.findUnique({
      where: { voucherCode: code },
    });
    if (!existing) return code;
  }
  throw new Error(
    "Không thể sinh mã voucher duy nhất. Vui lòng thử lại.",
  );
}
