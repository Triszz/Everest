/**
 * Redemption Service (Partner Web)
 * ============================================================
 * Wrapper cho các endpoint `/api/partner/redemption/*`.
 *
 * Backend đã có sẵn các endpoint này — reuse toàn bộ business logic:
 *   - validateVoucherForRedemption: format, partner scope, approval, visibility,
 *     validFrom/To, used, locked, payment, branch.
 *   - confirmVoucher: transaction với idempotency.
 *
 * Partner Web KHÔNG dùng QR scanner — chỉ nhập voucher code.
 */

import { post } from "./api-client";
import type {
  ValidateResponse,
  ConfirmResponse,
} from "../types/redemption";

// ── Lưu ý về response shape ───────────────────────────────────────────────
// Backend `/api/partner/redemption/validate` và `/confirm` trả về "flat" shape:
//   {
//     success: true | false,
//     status: "VALID" | "CONFIRMED" | <RedemptionStatus>,
//     canConfirm: boolean,
//     data?: ValidatedVoucherData,        // chỉ có khi success
//     message?: string,
//     error?: { code: RedemptionStatus, message: string },  // chỉ có khi !success
//   }
// KHÔNG bọc trong envelope `{ data: ValidateResponse }` như các endpoint khác
// (login, me, ...). Vì vậy ta KHÔNG gọi `.data` ở đây — trả về nguyên response.
//
// Pattern này giống với `apiSendResetOtp` trong auth.service.ts (các endpoint
// email-otp/* cũng trả về flat shape).

/**
 * POST /api/partner/redemption/validate
 * Body: { voucherCode: string }
 *
 * Returns: ValidateResponse (success → ValidatedVoucherData, error → status + message)
 */
export async function apiValidateVoucher(
  voucherCode: string,
): Promise<ValidateResponse> {
  const res = await post<ValidateResponse>(
    "/api/partner/redemption/validate",
    { voucherCode },
    { auth: true },
  );
  // Backend trả về flat shape — `res` chính là ValidateResponse (không có
  // wrapper `{ data: ValidateResponse }`). Field `data` trong envelope thực ra
  // là ValidatedVoucherData (chỉ có khi success).
  return res as unknown as ValidateResponse;
}

/**
 * POST /api/partner/redemption/confirm
 * Body: { voucherCode: string, selectedBranchId?: number }
 *
 * Returns: ConfirmResponse (success → ConfirmSuccessData, error → status + message)
 */
export async function apiConfirmVoucher(
  voucherCode: string,
  selectedBranchId?: number,
): Promise<ConfirmResponse> {
  const res = await post<ConfirmResponse>(
    "/api/partner/redemption/confirm",
    { voucherCode, selectedBranchId },
    { auth: true },
  );
  return res as unknown as ConfirmResponse;
}