/**
 * QR Code Utilities
 * ============================================================
 * Helpers cho QR code validation và parsing
 */

// QR format: EVR-XXXX-XXXX (ví dụ: EVR-AB12-CD34)
const VOUCHER_CODE_REGEX = /^EVR-[A-Z0-9]{4}-[A-Z0-9]{4}$/i;

/**
 * Normalize voucher code - trim và uppercase
 */
export function normalizeVoucherCode(rawCode: string): string {
  return rawCode.trim().toUpperCase();
}

/**
 * Validate voucher code format.
 * Returns true nếu code match format EVR-XXXX-XXXX.
 *
 * Lưu ý: function này chỉ validate format (regex), KHÔNG quan tâm
 * code đến từ QR scan hay manual input. Error message chung chung
 * để tránh leak context.
 */
export function isValidVoucherCode(code: string): boolean {
  if (!code || typeof code !== "string") {
    return false;
  }

  const normalized = normalizeVoucherCode(code);
  return VOUCHER_CODE_REGEX.test(normalized);
}

/**
 * Parse QR data - extract voucher code từ raw QR data
 * QR có thể chứa:
 * - Chỉ voucher code: "EVR-ABCD-1234"
 * - URL với query param: "everest://voucher?code=EVR-ABCD-1234"
 */
export function parseQrData(rawData: string): string | null {
  if (!rawData) return null;

  // Trim whitespace
  const trimmed = rawData.trim();

  // Case 1: Direct code
  if (isValidVoucherCode(trimmed)) {
    return normalizeVoucherCode(trimmed);
  }

  // Case 2: URL với code param
  // Pattern: everest://voucher?code=EVR-ABCD-1234
  // hoặc: https://voucher.app?code=EVR-ABCD-1234
  try {
    const url = new URL(trimmed);
    const code = url.searchParams.get("code");
    if (code && isValidVoucherCode(code)) {
      return normalizeVoucherCode(code);
    }
  } catch {
    // Not a valid URL, ignore
  }

  // Case 3: Deep link format "voucher:EVR-ABCD-1234"
  const deepLinkMatch = trimmed.match(/^voucher:(EVR-[A-Z0-9]{4}-[A-Z0-9]{4})$/i);
  if (deepLinkMatch) {
    return normalizeVoucherCode(deepLinkMatch[1]);
  }

  return null;
}

/**
 * Validate và parse QR data
 *
 * @param rawData - raw data từ QR scanner hoặc manual input
 * @param source - nguồn data: "qr" (camera scan) hoặc "manual" (nhập tay)
 *                 để error message phù hợp với context
 * @returns null nếu invalid
 */
export function validateAndParseQr(
  rawData: string,
  source: "qr" | "manual" = "qr",
): {
  isValid: boolean;
  code: string | null;
  error: string | null;
} {
  const code = parseQrData(rawData);

  if (!code) {
    // ✅ RCA Bug 3: Error message phải theo context.
    // QR scan: "Mã QR không hợp lệ... quét lại..."
    // Manual: "Mã voucher không hợp lệ... kiểm tra và nhập lại..."
    const error =
      source === "manual"
        ? "Mã voucher không hợp lệ. Vui lòng kiểm tra và nhập lại."
        : "Mã QR không hợp lệ. Vui lòng quét lại mã voucher.";
    return {
      isValid: false,
      code: null,
      error,
    };
  }

  return {
    isValid: true,
    code,
    error: null,
  };
}
