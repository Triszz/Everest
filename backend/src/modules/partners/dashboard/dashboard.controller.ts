/**
 * Dashboard Controller
 * ------------------------------------------------
 * HTTP handler cho Dashboard API
 */

import type { Request, Response } from "express";
import { getDashboardData } from "./dashboard.service";
import { dashboardQuerySchema } from "./dashboard.schemas";

/**
 * GET /api/partner/dashboard/stats
 */
export async function getDashboardStats(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = dashboardQuerySchema.safeParse(req.query);
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

  const data = await getDashboardData(auth, parsed.data);

  // Header chống browser/proxy cache để dashboard luôn phản ánh data mới nhất
  // sau khi user thực hiện action ở trang khác (vd: confirm voucher ở /validate).
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.status(200).json({
    success: true,
    data,
  });
}
