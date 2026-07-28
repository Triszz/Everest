import { Request, Response } from "express";
import { ZodError, ZodType } from "zod";
import { partnerService } from "./partner.service";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { AppError } from "../../middlewares/errorHandler";
import {
  updatePartnerSchema,
  createBranchSchema,
  updateBranchSchema,
  assignCashierSchema,
  createCashierSchema,
  branchIdParam,
  listCashiersQuerySchema,
} from "./partner.schemas";

type PartnerRole = "Partner_Owner" | "Partner_Cashier";

/**
 * Lấy partnerId từ JWT.
 * Cả Partner_Owner và Partner_Cashier đều phải có partnerId.
 */
const requirePartnerId = (req: Request): number => {
  const partnerId = req.user?.partnerId;

  if (!partnerId) {
    throw new AppError(
      "Không tìm thấy thông tin đối tác",
      403,
      "FORBIDDEN",
    );
  }

  return partnerId;
};

/**
 * Kiểm tra role hiện tại có phải vai trò đối tác hay không.
 *
 * Mặc dù route đã có roleGuard, TypeScript không tự hiểu rằng
 * req.user.role đã được thu hẹp còn hai role này.
 */
const requirePartnerRole = (req: Request): PartnerRole => {
  const role = req.user?.role;

  if (role !== "Partner_Owner" && role !== "Partner_Cashier") {
    throw new AppError(
      "Bạn không có quyền truy cập khu vực đối tác",
      403,
      "FORBIDDEN",
    );
  }

  return role;
};

/**
 * Đọc branchId từ URL.
 * Ví dụ: /branches/12
 */
const parseBranchId = (req: Request): number => {
  try {
    return branchIdParam.parse(req.params).branchId;
  } catch {
    throw new AppError(
      "branchId không hợp lệ",
      400,
      "VALIDATION_ERROR",
    );
  }
};

/**
 * Parse dữ liệu bằng Zod và chuyển ZodError sang AppError.
 */
const parseOrThrow = <T>(
  schema: ZodType<T>,
  value: unknown,
): T => {
  try {
    return schema.parse(value);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const message =
        error.issues[0]?.message ?? "Dữ liệu không hợp lệ";

      throw new AppError(
        message,
        400,
        "VALIDATION_ERROR",
      );
    }

    throw error;
  }
};

export const partnerController = {
  // =========================================================
  // PROFILE
  // =========================================================

  getProfile: asyncHandler(
    async (req: Request, res: Response) => {
      const partnerId = requirePartnerId(req);

      const data =
        await partnerService.getProfile(partnerId);

      res.json({
        success: true,
        data,
      });
    },
  ),

  /**
   * Owner:
   * - nhận user + partner
   *
   * Cashier:
   * - nhận user + partner + branch được phân công
   */
  getSettings: asyncHandler(
  async (req: Request, res: Response) => {
    const partnerId = requirePartnerId(req);
    const userId = req.user!.userId;
    const role = req.user!.role;

    // Thu hẹp kiểu Role trước khi truyền xuống service
    if (
      role !== "Partner_Owner" &&
      role !== "Partner_Cashier"
    ) {
      throw new AppError(
        "Bạn không có quyền truy cập khu vực đối tác",
        403,
        "FORBIDDEN",
      );
    }

    /*
     * Sau câu if phía trên, TypeScript hiểu role chỉ có thể là:
     * "Partner_Owner" | "Partner_Cashier"
     */
    const data = await partnerService.getSettings(
      partnerId,
      userId,
      role,
    );

    res.json({
      success: true,
      data,
    });
  },
),

  updateProfile: asyncHandler(
    async (req: Request, res: Response) => {
      const partnerId = requirePartnerId(req);
      const body = parseOrThrow(
        updatePartnerSchema,
        req.body,
      );

      const data =
        await partnerService.updateProfile(
          partnerId,
          body,
        );

      res.json({
        success: true,
        data,
      });
    },
  ),

  // =========================================================
  // BRANCHES
  // =========================================================

  listBranches: asyncHandler(
    async (req: Request, res: Response) => {
      const partnerId = requirePartnerId(req);

      const data =
        await partnerService.listBranches(partnerId);

      res.json({
        success: true,
        data,
      });
    },
  ),

  getBranch: asyncHandler(
    async (req: Request, res: Response) => {
      const branchId = parseBranchId(req);
      const partnerId = requirePartnerId(req);

      const data = await partnerService.getBranch(
        branchId,
        partnerId,
      );

      res.json({
        success: true,
        data,
      });
    },
  ),

  createBranch: asyncHandler(
    async (req: Request, res: Response) => {
      const partnerId = requirePartnerId(req);
      const body = parseOrThrow(
        createBranchSchema,
        req.body,
      );

      const data =
        await partnerService.createBranch(
          partnerId,
          body,
        );

      res.status(201).json({
        success: true,
        data,
      });
    },
  ),

  updateBranch: asyncHandler(
    async (req: Request, res: Response) => {
      const branchId = parseBranchId(req);
      const partnerId = requirePartnerId(req);
      const body = parseOrThrow(
        updateBranchSchema,
        req.body,
      );

      const data =
        await partnerService.updateBranch(
          branchId,
          partnerId,
          body,
        );

      res.json({
        success: true,
        data,
      });
    },
  ),

  deleteBranch: asyncHandler(
    async (req: Request, res: Response) => {
      const branchId = parseBranchId(req);
      const partnerId = requirePartnerId(req);

      await partnerService.deleteBranch(
        branchId,
        partnerId,
      );

      res.json({
        success: true,
        data: null,
        message: "Xóa chi nhánh thành công",
      });
    },
  ),

  // =========================================================
  // CASHIER MANAGEMENT
  // =========================================================

  listCashiers: asyncHandler(
    async (req: Request, res: Response) => {
      const partnerId = requirePartnerId(req);
      const query = parseOrThrow(
        listCashiersQuerySchema,
        req.query,
      );

      const data =
        await partnerService.searchCashiers(
          partnerId,
          query,
        );

      res.json({
        success: true,
        data,
      });
    },
  ),

  assignCashier: asyncHandler(
    async (req: Request, res: Response) => {
      const branchId = parseBranchId(req);
      const partnerId = requirePartnerId(req);

      const body = parseOrThrow(
        assignCashierSchema,
        req.body,
      );

      const data =
        await partnerService.assignCashier(
          branchId,
          partnerId,
          body.cashierEmail,
        );

      res.json({
        success: true,
        data,
      });
    },
  ),

  removeCashier: asyncHandler(
    async (req: Request, res: Response) => {
      const branchId = parseBranchId(req);
      const partnerId = requirePartnerId(req);

      const data =
        await partnerService.removeCashier(
          branchId,
          partnerId,
        );

      res.json({
        success: true,
        data,
        message: "Đã gỡ thu ngân",
      });
    },
  ),

  createCashier: asyncHandler(
    async (req: Request, res: Response) => {
      const partnerId = requirePartnerId(req);

      const body = parseOrThrow(
        createCashierSchema,
        req.body,
      );

      const data =
        await partnerService.createCashierAccount(
          partnerId,
          body,
        );

      res.status(201).json({
        success: true,
        data,
      });
    },
  ),
};