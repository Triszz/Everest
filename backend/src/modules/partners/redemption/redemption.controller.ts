/**
 * Redemption Controller
 * ------------------------------------------------
 * Xử lý HTTP cho Validate và Confirm API.
 * Chỉ parse request, gọi service, trả response.
 * KHÔNG chứa business logic.
 */

import type { Request, Response } from "express";
import {
  validateVoucherForRedemption,
  confirmVoucher,
  getVoucherDetailForPartner,
} from "./redemption.service";
import {
  validateVoucherSchema,
  confirmVoucherSchema,
  RedemptionStatus,
  NON_CONFIRMABLE_STATUSES,
  type ValidateVoucherResult,
} from "./redemption.schemas";
import { normalizeVoucherCode } from "../../../shared/utils/voucher-code";

// ============================================================
// VALIDATE
// ============================================================

/**
 * POST /api/partner/redemption/validate
 * Kiểm tra voucher có thể xác nhận sử dụng hay không.
 *
 * Auth: Partner_Owner | Partner_Cashier
 * Body: { voucherCode: string }
 */
export async function validateVoucher(
  req: Request,
  res: Response,
): Promise<void> {
  // 1. Parse + validate request body
  const parsed = validateVoucherSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      status: parsed.error.issues[0]?.message as string ?? "INVALID_REQUEST",
      canConfirm: false,
      error: {
        code: "INVALID_REQUEST",
        message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ",
      },
    });
    return;
  }

  // 2. Normalize voucher code (trim + uppercase)
  const code = normalizeVoucherCode(parsed.data.voucherCode);
  if (!code) {
    res.status(200).json({
      success: false,
      status: RedemptionStatus.INVALID_CODE,
      canConfirm: false,
      error: {
        code: RedemptionStatus.INVALID_CODE,
        message: "Mã voucher không hợp lệ. Vui lòng kiểm tra lại.",
      },
    });
    return;
  }

  // 3. Build auth context
  const user = req.user!;
  const auth = {
    userId: user.userId,
    role: user.role as "Partner_Owner" | "Partner_Cashier",
    partnerId: user.partnerId!,
    branchId: user.branchId,
  };

  // 4. Gọi service (không thay đổi DB)
  const result: ValidateVoucherResult = await validateVoucherForRedemption(code, auth);

  // 5. Trả response
  if (!result.isValid) {
    res.status(200).json({
      success: false,
      status: result.status,
      canConfirm: NON_CONFIRMABLE_STATUSES.has(result.status),
      error: {
        code: result.status,
        message: result.message,
      },
    });
    return;
  }

  res.status(200).json({
    success: true,
    status: "VALID",
    canConfirm: true,
    data: result.data,
    message: "Voucher hợp lệ",
  });
}

// ============================================================
// CONFIRM
// ============================================================

/**
 * POST /api/partner/redemption/confirm
 * Xác nhận voucher đã được sử dụng.
 *
 * Auth: Partner_Owner | Partner_Cashier
 * Body: { voucherCode: string, selectedBranchId?: number }
 */
export async function confirmVoucherHandler(
  req: Request,
  res: Response,
): Promise<void> {
  // 1. Parse + validate request body
  const parsed = confirmVoucherSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      status: "INVALID_REQUEST",
      canConfirm: false,
      error: {
        code: "INVALID_REQUEST",
        message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ",
      },
    });
    return;
  }

  // 2. Normalize voucher code
  const code = normalizeVoucherCode(parsed.data.voucherCode);
  if (!code) {
    res.status(200).json({
      success: false,
      status: RedemptionStatus.INVALID_CODE,
      canConfirm: false,
      error: {
        code: RedemptionStatus.INVALID_CODE,
        message: "Mã voucher không hợp lệ. Vui lòng kiểm tra lại.",
      },
    });
    return;
  }

  // 3. Build auth context
  const user = req.user!;
  const auth = {
    userId: user.userId,
    role: user.role as "Partner_Owner" | "Partner_Cashier",
    partnerId: user.partnerId!,
    branchId: user.branchId,
  };

  // 4. Gọi service (có transaction)
  try {
    const result = await confirmVoucher(code, auth, parsed.data.selectedBranchId);

    if (!result.isValid) {
      res.status(200).json({
        success: false,
        status: result.status,
        canConfirm: false,
        error: {
          code: result.status,
          message: result.message,
        },
      });
      return;
    }

    // CONFIRMED
    res.status(200).json({
      success: true,
      status: "CONFIRMED",
      data: {
        issuedVoucherId: result.data!.issuedVoucherId,
        voucherCode: result.data!.voucherCode,
        usedAt: result.data!.usedAt!,
        usedAtBranchId: (result.data as { usedAtBranchId?: number }).usedAtBranchId!,
      },
      message: "Xác nhận sử dụng voucher thành công",
    });
  } catch (err) {
    // Lỗi không mong muốn
    console.error("[confirmVoucher] Unexpected error:", err);
    res.status(500).json({
      success: false,
      status: RedemptionStatus.UNKNOWN_ERROR,
      canConfirm: false,
      error: {
        code: RedemptionStatus.UNKNOWN_ERROR,
        message: "Đã xảy ra lỗi không mong muốn",
      },
    });
  }
}

// ============================================================
// GET DETAIL (any status, for History navigation)
// ============================================================

/**
 * GET /api/partner/redemption/voucher/:voucherCode
 * Lấy chi tiết voucher bất kể trạng thái (Unused / Used / Locked).
 * Dùng cho navigation từ History — tránh bị validate trả về ALREADY_USED.
 *
 * Auth: Partner_Owner | Partner_Cashier
 */
export async function getVoucherDetailHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const rawCode = req.params.voucherCode;
  const code = normalizeVoucherCode(typeof rawCode === "string" ? rawCode : "");
  if (!code) {
    res.status(200).json({
      success: false,
      status: RedemptionStatus.INVALID_CODE,
      canConfirm: false,
      error: {
        code: RedemptionStatus.INVALID_CODE,
        message: "Mã voucher không hợp lệ. Vui lòng kiểm tra lại.",
      },
    });
    return;
  }

  const user = req.user!;
  const auth = {
    userId: user.userId,
    role: user.role as "Partner_Owner" | "Partner_Cashier",
    partnerId: user.partnerId!,
    branchId: user.branchId,
  };

  const result: ValidateVoucherResult = await getVoucherDetailForPartner(code, auth);

  if (!result.isValid) {
    res.status(200).json({
      success: false,
      status: result.status,
      canConfirm: false,
      error: {
        code: result.status,
        message: result.message,
      },
    });
    return;
  }

  res.status(200).json({
    success: true,
    status: "VALID",
    canConfirm: false, // Voucher này có thể đã Used — không cho confirm
    data: result.data,
    message: "Voucher found",
  });
}
