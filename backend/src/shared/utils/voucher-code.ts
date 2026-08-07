/**
 * Voucher Code Utilities
 * ------------------------------------------------
 * Chuẩn hóa voucher code cho toàn bộ project.
 * Dùng chung cho backend (Validate API) và frontend (Expo).
 *
 * Alphabet: 59 ký tự
 *   - 0-9   (10)
 *   - A-Z   loại I, O  (24)
 *   - a-z   loại l      (25)
 * Entropy : log₂(59⁸) ≈ 48.5 bits
 */

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
 * Alphabet: [0-9AC-HJ-NP-Za-hj-np-z] — 59 ký tự
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
