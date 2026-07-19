import { Request, Response } from "express";
import { ZodError } from "zod";
import { adminService } from "./admin.service";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { AppError } from "../../middlewares/errorHandler";
import {
  listUsersSchema,
  updateUserStatusSchema,
  updateUserRoleSchema,
  getUserByIdSchema,
  listPartnersSchema,
  getPartnerByIdSchema,
  approvePartnerSchema,
  rejectPartnerSchema,
  togglePartnerLockSchema,
  listBranchesSchema,
  getBranchByIdSchema,
  createBranchSchema,
  updateBranchSchema,
  deleteBranchSchema,
  toggleBranchLockSchema,
  listCategoriesSchema,
  createCategorySchema,
  updateCategorySchema,
  getCategoryByIdSchema,
  listVouchersSchema,
  getVoucherByIdSchema,
  approveVoucherSchema,
  rejectVoucherSchema,
  toggleVoucherDisplaySchema,
} from "./admin.schemas";

const parseQuery = <T>(schema: { parse: (v: unknown) => T }, value: unknown): T => {
  try {
    return schema.parse(value);
  } catch (err) {
    if (err instanceof ZodError) {
      throw new AppError(err.issues[0].message, 400, "VALIDATION_ERROR");
    }
    throw err;
  }
};

const parseBody = <T>(schema: { parse: (v: unknown) => T }, body: unknown): T => {
  try {
    return schema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      throw new AppError(err.issues[0].message, 400, "VALIDATION_ERROR");
    }
    throw err;
  }
};

export const adminController = {
  listUsers: asyncHandler(async (req: Request, res: Response) => {
    const input = parseQuery(listUsersSchema, req.query);
    const data = await adminService.listUsers(input);
    res.json({ success: true, data });
  }),

  getUserById: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = parseQuery(getUserByIdSchema, req.params);
    const data = await adminService.getUserById(userId);
    res.json({ success: true, data });
  }),

  updateUserStatus: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = parseQuery(getUserByIdSchema, req.params);
    const input = parseBody(updateUserStatusSchema, req.body);
    const data = await adminService.updateUserStatus(userId, input);
    res.json({ success: true, data, message: "Cập nhật trạng thái thành công" });
  }),

  updateUserRole: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = parseQuery(getUserByIdSchema, req.params);
    const input = parseBody(updateUserRoleSchema, req.body);
    const data = await adminService.updateUserRole(userId, input, req.user!.role);
    res.json({ success: true, data, message: "Phân quyền thành công" });
  }),

  // ─── Partner Approval ───────────────────────────────────────────────────────

  listPartners: asyncHandler(async (req: Request, res: Response) => {
    const input = parseQuery(listPartnersSchema, req.query);
    const data = await adminService.listPartners(input);
    res.json({ success: true, data });
  }),

  getPartnerById: asyncHandler(async (req: Request, res: Response) => {
    const { partnerId } = parseQuery(getPartnerByIdSchema, req.params);
    const data = await adminService.getPartnerById(partnerId);
    res.json({ success: true, data });
  }),

  approvePartner: asyncHandler(async (req: Request, res: Response) => {
    const { partnerId } = parseQuery(getPartnerByIdSchema, req.params);
    const input = parseBody(approvePartnerSchema, req.body);
    const data = await adminService.approvePartner(partnerId, input, req.user!.userId);
    res.json({ success: true, data, message: "Duyệt đối tác thành công" });
  }),

  rejectPartner: asyncHandler(async (req: Request, res: Response) => {
    const { partnerId } = parseQuery(getPartnerByIdSchema, req.params);
    const input = parseBody(rejectPartnerSchema, req.body);
    const data = await adminService.rejectPartner(partnerId, input, req.user!.userId);
    res.json({ success: true, data, message: "Từ chối đối tác thành công" });
  }),

  togglePartnerLock: asyncHandler(async (req: Request, res: Response) => {
    const { partnerId } = parseQuery(getPartnerByIdSchema, req.params);
    const input = parseBody(togglePartnerLockSchema, req.body);
    const data = await adminService.togglePartnerLock(partnerId, input);
    const msg = input.locked ? "Khóa đối tác thành công" : "Mở khóa đối tác thành công";
    res.json({ success: true, data, message: msg });
  }),

  // ─── Branch Management ───────────────────────────────────────────────────────

  listBranches: asyncHandler(async (req: Request, res: Response) => {
    const { partnerId } = parseQuery(getPartnerByIdSchema, req.params);
    const input = parseQuery(listBranchesSchema, req.query);
    const data = await adminService.listBranches(partnerId, input);
    res.json({ success: true, data });
  }),

  getBranchById: asyncHandler(async (req: Request, res: Response) => {
    const { partnerId, branchId } = parseQuery(getBranchByIdSchema, req.params);
    const data = await adminService.getBranchById(partnerId, branchId);
    res.json({ success: true, data });
  }),

  createBranch: asyncHandler(async (req: Request, res: Response) => {
    const { partnerId } = parseQuery(getPartnerByIdSchema, req.params);
    const input = parseBody(createBranchSchema, req.body);
    const data = await adminService.createBranch(partnerId, input);
    res.json({ success: true, data, message: "Thêm chi nhánh thành công" });
  }),

  updateBranch: asyncHandler(async (req: Request, res: Response) => {
    const { partnerId, branchId } = parseQuery(getBranchByIdSchema, req.params);
    const input = parseBody(updateBranchSchema, req.body);
    const data = await adminService.updateBranch(partnerId, branchId, input);
    res.json({ success: true, data, message: "Cập nhật chi nhánh thành công" });
  }),

  deleteBranch: asyncHandler(async (req: Request, res: Response) => {
    const { partnerId, branchId } = parseQuery(getBranchByIdSchema, req.params);
    await adminService.deleteBranch(partnerId, branchId);
    res.json({ success: true, message: "Xóa chi nhánh thành công" });
  }),

  toggleBranchLock: asyncHandler(async (req: Request, res: Response) => {
    const { partnerId, branchId } = parseQuery(getBranchByIdSchema, req.params);
    const input = parseBody(toggleBranchLockSchema, req.body);
    const data = await adminService.toggleBranchLock(partnerId, branchId, input);
    const msg = input.locked ? "Khóa chi nhánh thành công" : "Mở khóa chi nhánh thành công";
    res.json({ success: true, data, message: msg });
  }),

  // ─── Category Management ────────────────────────────────────────────────────

  listCategories: asyncHandler(async (req: Request, res: Response) => {
    const input = parseQuery(listCategoriesSchema, req.query);
    const data = await adminService.listCategories(input);
    res.json({ success: true, data });
  }),

  getCategoryById: asyncHandler(async (req: Request, res: Response) => {
    const { categoryId } = parseQuery(getCategoryByIdSchema, req.params);
    const data = await adminService.getCategoryById(categoryId);
    res.json({ success: true, data });
  }),

  createCategory: asyncHandler(async (req: Request, res: Response) => {
    const input = parseBody(createCategorySchema, req.body);
    const data = await adminService.createCategory(input);
    res.json({ success: true, data, message: "Tạo danh mục thành công" });
  }),

  updateCategory: asyncHandler(async (req: Request, res: Response) => {
    const { categoryId } = parseQuery(getCategoryByIdSchema, req.params);
    const input = parseBody(updateCategorySchema, req.body);
    const data = await adminService.updateCategory(categoryId, input);
    res.json({ success: true, data, message: "Cập nhật danh mục thành công" });
  }),

  deleteCategory: asyncHandler(async (req: Request, res: Response) => {
    const { categoryId } = parseQuery(getCategoryByIdSchema, req.params);
    await adminService.deleteCategory(categoryId);
    res.json({ success: true, message: "Xóa danh mục thành công" });
  }),

  // ─── Voucher Management ─────────────────────────────────────────────────────

  listVouchers: asyncHandler(async (req: Request, res: Response) => {
    const input = parseQuery(listVouchersSchema, req.query);
    const data = await adminService.listVouchers(input);
    res.json({ success: true, data });
  }),

  approveVoucher: asyncHandler(async (req: Request, res: Response) => {
    const { voucherId } = parseQuery(getVoucherByIdSchema, req.params);
    const input = parseBody(approveVoucherSchema, req.body);
    const data = await adminService.approveVoucher(voucherId, input);
    res.json({ success: true, data, message: "Duyệt voucher thành công" });
  }),

  rejectVoucher: asyncHandler(async (req: Request, res: Response) => {
    const { voucherId } = parseQuery(getVoucherByIdSchema, req.params);
    const input = parseBody(rejectVoucherSchema, req.body);
    const data = await adminService.rejectVoucher(voucherId, input);
    res.json({ success: true, data, message: "Từ chối voucher thành công" });
  }),

  setVoucherDisplayStatus: asyncHandler(async (req: Request, res: Response) => {
    const { voucherId } = parseQuery(getVoucherByIdSchema, req.params);
    const input = parseBody(toggleVoucherDisplaySchema, req.body);
    const data = await adminService.setVoucherDisplayStatus(voucherId, input);
    const msg = input.displayStatus === "Visible" ? "Hiển thị voucher thành công" : "Ẩn voucher thành công";
    res.json({ success: true, data, message: msg });
  }),

  getVoucherStats: asyncHandler(async (_req: Request, res: Response) => {
    const data = await adminService.getVoucherStats();
    res.json({ success: true, data });
  }),
};
