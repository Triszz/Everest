/**
 * History Controller
 * ------------------------------------------------
 * HTTP handler cho History API
 */

import type { Request, Response } from "express";
import { getRedemptionHistory } from "./redemption.history.service";
import { historyQuerySchema } from "./redemption.history.schemas";

/**
 * GET /api/partner/redemption/history
 * Lấy lịch sử voucher đã xác nhận
 */
export async function getHistory(req: Request, res: Response): Promise<void> {
  // Parse + validate query
  const parsed = historyQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: {
        code: "INVALID_REQUEST",
        message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ",
      },
    });
    return;
  }

  const user = req.user!;
  const auth = {
    partnerId: user.partnerId!,
    branchId: user.branchId,
  };

  const result = await getRedemptionHistory(auth, parsed.data);

  res.status(200).json({
    success: true,
    ...result,
  });
}
