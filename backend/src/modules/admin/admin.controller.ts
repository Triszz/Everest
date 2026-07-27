import { Request, Response } from "express";
import { ZodError } from "zod";
import { prisma } from "../../config/prisma";
import { adminService } from "./admin.service";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { AppError } from "../../middlewares/errorHandler";
import { getPagination } from "../../shared/utils/paginate";
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
  listAllBranchesSchema,
  listCategoriesSchema,
  createCategorySchema,
  updateCategorySchema,
  getCategoryByIdSchema,
  listVouchersSchema,
  getVoucherByIdSchema,
  approveVoucherSchema,
  rejectVoucherSchema,
  toggleVoucherDisplaySchema,
  listPoliciesSchema,
  getPolicyByIdSchema,
  upsertPolicySchema,
  deletePolicySchema,
  listBannersSchema,
  getBannerByIdSchema,
  createBannerSchema,
  updateBannerSchema,
  updateBannerStatusSchema,
  listPopupsSchema,
  getPopupByIdSchema,
  createPopupSchema,
  updatePopupSchema,
  updatePopupStatusSchema,
  listPostsSchema,
  getPostByIdSchema,
  createPostSchema,
  updatePostSchema,
  updatePostStatusSchema,
  listOrdersSchema,
  getOrderByIdSchema,
  cancelOrderSchema,
  refundOrderSchema,
  listAuditLogsSchema,
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
    const actor = { userId: req.user!.userId, ipAddress: req.auditCtx?.ipAddress, userAgent: req.auditCtx?.userAgent };
    const data = await adminService.updateUserStatus(userId, input, actor);
    res.json({ success: true, data, message: "Cập nhật trạng thái thành công" });
  }),

  updateUserRole: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = parseQuery(getUserByIdSchema, req.params);
    const input = parseBody(updateUserRoleSchema, req.body);
    const actor = { userId: req.user!.userId, ipAddress: req.auditCtx?.ipAddress, userAgent: req.auditCtx?.userAgent };
    const data = await adminService.updateUserRole(userId, input, req.user!.role, actor);
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
    const actor = { userId: req.user!.userId, ipAddress: req.auditCtx?.ipAddress, userAgent: req.auditCtx?.userAgent };
    const data = await adminService.approvePartner(partnerId, input, actor);
    res.json({ success: true, data, message: "Duyệt đối tác thành công" });
  }),

  rejectPartner: asyncHandler(async (req: Request, res: Response) => {
    const { partnerId } = parseQuery(getPartnerByIdSchema, req.params);
    const input = parseBody(rejectPartnerSchema, req.body);
    const actor = { userId: req.user!.userId, ipAddress: req.auditCtx?.ipAddress, userAgent: req.auditCtx?.userAgent };
    const data = await adminService.rejectPartner(partnerId, input, actor);
    res.json({ success: true, data, message: "Từ chối đối tác thành công" });
  }),

  togglePartnerLock: asyncHandler(async (req: Request, res: Response) => {
    const { partnerId } = parseQuery(getPartnerByIdSchema, req.params);
    const input = parseBody(togglePartnerLockSchema, req.body);
    const actor = { userId: req.user!.userId, ipAddress: req.auditCtx?.ipAddress, userAgent: req.auditCtx?.userAgent };
    const result = await adminService.togglePartnerLock(partnerId, input, actor);
    const msg = input.locked
      ? `Đã khóa đối tác (${result.affected.branches} chi nhánh, ${result.affected.cashiers} nhân viên)`
      : `Đã mở khóa đối tác (${result.affected.branches} chi nhánh, ${result.affected.cashiers} nhân viên)`;
    res.json({ success: true, data: result, message: msg });
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
    const actor = { userId: req.user!.userId, ipAddress: req.auditCtx?.ipAddress, userAgent: req.auditCtx?.userAgent };
    const data = await adminService.createBranch(partnerId, input, actor);
    res.json({ success: true, data, message: "Thêm chi nhánh thành công" });
  }),

  updateBranch: asyncHandler(async (req: Request, res: Response) => {
    const { partnerId, branchId } = parseQuery(getBranchByIdSchema, req.params);
    const input = parseBody(updateBranchSchema, req.body);
    const actor = { userId: req.user!.userId, ipAddress: req.auditCtx?.ipAddress, userAgent: req.auditCtx?.userAgent };
    const data = await adminService.updateBranch(partnerId, branchId, input, actor);
    res.json({ success: true, data, message: "Cập nhật chi nhánh thành công" });
  }),

  deleteBranch: asyncHandler(async (req: Request, res: Response) => {
    const { partnerId, branchId } = parseQuery(getBranchByIdSchema, req.params);
    const actor = { userId: req.user!.userId, ipAddress: req.auditCtx?.ipAddress, userAgent: req.auditCtx?.userAgent };
    await adminService.deleteBranch(partnerId, branchId, actor);
    res.json({ success: true, message: "Xóa chi nhánh thành công" });
  }),

  toggleBranchLock: asyncHandler(async (req: Request, res: Response) => {
    const { partnerId, branchId } = parseQuery(getBranchByIdSchema, req.params);
    const input = parseBody(toggleBranchLockSchema, req.body);
    const actor = { userId: req.user!.userId, ipAddress: req.auditCtx?.ipAddress, userAgent: req.auditCtx?.userAgent };
    const data = await adminService.toggleBranchLock(partnerId, branchId, input, actor);
    const msg = input.locked ? "Khóa chi nhánh thành công" : "Mở khóa chi nhánh thành công";
    res.json({ success: true, data, message: msg });
  }),

  // ─── All Branches (cross-partner) ─────────────────────────────────────────

  listAllBranches: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip } = getPagination({
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
    });
    const input = {
      page,
      limit,
      skip,
      search: req.query.search as string | undefined,
      isLocked:
        req.query.isLocked === "true"
          ? true
          : req.query.isLocked === "false"
            ? false
            : undefined,
      partnerId: req.query.partnerId ? Number(req.query.partnerId) : undefined,
    };
    const data = await adminService.listAllBranches(input);
    res.json({ success: true, data });
  }),

  getBranchByIdSimple: asyncHandler(async (req: Request, res: Response) => {
    const branchId = Number(req.params.branchId);
    if (!branchId || isNaN(branchId)) {
      throw new AppError("branchId không hợp lệ", 400, "INVALID_INPUT");
    }
    const branch = await prisma.branch.findUnique({
      where: { branchId },
      select: {
        branchId: true,
        partnerId: true,
        cashierId: true,
        branchName: true,
        address: true,
        phoneNumber: true,
        isLocked: true,
        createdAt: true,
        updatedAt: true,
        cashier: {
          select: { userId: true, fullName: true, email: true, status: true },
        },
        partner: {
          select: { partnerId: true, companyName: true, status: true },
        },
      },
    });
    if (!branch) throw new AppError("Chi nhánh không tồn tại", 404, "NOT_FOUND");
    res.json({ success: true, data: branch });
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
    const actor = { userId: req.user!.userId, ipAddress: req.auditCtx?.ipAddress, userAgent: req.auditCtx?.userAgent };
    const data = await adminService.createCategory(input, actor);
    res.json({ success: true, data, message: "Tạo danh mục thành công" });
  }),

  updateCategory: asyncHandler(async (req: Request, res: Response) => {
    const { categoryId } = parseQuery(getCategoryByIdSchema, req.params);
    const input = parseBody(updateCategorySchema, req.body);
    const actor = { userId: req.user!.userId, ipAddress: req.auditCtx?.ipAddress, userAgent: req.auditCtx?.userAgent };
    const data = await adminService.updateCategory(categoryId, input, actor);
    res.json({ success: true, data, message: "Cập nhật danh mục thành công" });
  }),

  deleteCategory: asyncHandler(async (req: Request, res: Response) => {
    const { categoryId } = parseQuery(getCategoryByIdSchema, req.params);
    const actor = { userId: req.user!.userId, ipAddress: req.auditCtx?.ipAddress, userAgent: req.auditCtx?.userAgent };
    await adminService.deleteCategory(categoryId, actor);
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
    const actor = { userId: req.user!.userId, ipAddress: req.auditCtx?.ipAddress, userAgent: req.auditCtx?.userAgent };
    const data = await adminService.approveVoucher(voucherId, input, actor);
    res.json({ success: true, data, message: "Duyệt voucher thành công" });
  }),

  rejectVoucher: asyncHandler(async (req: Request, res: Response) => {
    const { voucherId } = parseQuery(getVoucherByIdSchema, req.params);
    const input = parseBody(rejectVoucherSchema, req.body);
    const actor = { userId: req.user!.userId, ipAddress: req.auditCtx?.ipAddress, userAgent: req.auditCtx?.userAgent };
    const data = await adminService.rejectVoucher(voucherId, input, actor);
    res.json({ success: true, data, message: "Từ chối voucher thành công" });
  }),

  setVoucherDisplayStatus: asyncHandler(async (req: Request, res: Response) => {
    const { voucherId } = parseQuery(getVoucherByIdSchema, req.params);
    const input = parseBody(toggleVoucherDisplaySchema, req.body);
    const actor = { userId: req.user!.userId, ipAddress: req.auditCtx?.ipAddress, userAgent: req.auditCtx?.userAgent };
    const data = await adminService.setVoucherDisplayStatus(voucherId, input, actor);
    const msg = input.displayStatus === "Visible" ? "Hiển thị voucher thành công" : "Ẩn voucher thành công";
    res.json({ success: true, data, message: msg });
  }),

  getVoucherStats: asyncHandler(async (_req: Request, res: Response) => {
    const data = await adminService.getVoucherStats();
    res.json({ success: true, data });
  }),

  // ─── Policy Management ─────────────────────────────────────────────────────

  listPolicies: asyncHandler(async (req: Request, res: Response) => {
    const input = parseQuery(listPoliciesSchema, req.query);
    const data = await adminService.listPolicies(input);
    res.json({ success: true, data });
  }),

  getPolicyById: asyncHandler(async (req: Request, res: Response) => {
    const input = parseQuery(getPolicyByIdSchema, req.params);
    const data = await adminService.getPolicyById(input.policyId);
    res.json({ success: true, data });
  }),

  upsertPolicy: asyncHandler(async (req: Request, res: Response) => {
    const input = parseBody(upsertPolicySchema, req.body);
    const actor = { userId: req.user!.userId, ipAddress: req.auditCtx?.ipAddress, userAgent: req.auditCtx?.userAgent };
    const data = await adminService.upsertPolicy(input, actor);
    res.json({ success: true, data, message: "Lưu chính sách thành công" });
  }),

  deletePolicy: asyncHandler(async (req: Request, res: Response) => {
    const input = parseBody(deletePolicySchema, req.body);
    const actor = { userId: req.user!.userId, ipAddress: req.auditCtx?.ipAddress, userAgent: req.auditCtx?.userAgent };
    await adminService.deletePolicy(input.policyId, actor);
    res.json({ success: true, message: "Xóa chính sách thành công" });
  }),

  // ─── Banner Management ───────────────────────────────────────────────────

  listBanners: asyncHandler(async (req: Request, res: Response) => {
    const input = parseQuery(listBannersSchema, req.query);
    const data = await adminService.listBanners(input);
    res.json({ success: true, data });
  }),

  getBannerById: asyncHandler(async (req: Request, res: Response) => {
    const { bannerId } = parseQuery(getBannerByIdSchema, req.params);
    const data = await adminService.getBannerById(bannerId);
    res.json({ success: true, data });
  }),

  createBanner: asyncHandler(async (req: Request, res: Response) => {
    const input = parseBody(createBannerSchema, req.body);
    const actor = { userId: req.user!.userId, ipAddress: req.auditCtx?.ipAddress, userAgent: req.auditCtx?.userAgent };
    const data = await adminService.createBanner(input, actor);
    res.json({ success: true, data, message: "Tạo banner thành công" });
  }),

  updateBanner: asyncHandler(async (req: Request, res: Response) => {
    const { bannerId } = parseQuery(getBannerByIdSchema, req.params);
    const input = parseBody(updateBannerSchema, req.body);
    const actor = { userId: req.user!.userId, ipAddress: req.auditCtx?.ipAddress, userAgent: req.auditCtx?.userAgent };
    const data = await adminService.updateBanner(bannerId, input, actor);
    res.json({ success: true, data, message: "Cập nhật banner thành công" });
  }),

  updateBannerStatus: asyncHandler(async (req: Request, res: Response) => {
    const { bannerId } = parseQuery(getBannerByIdSchema, req.params);
    const input = parseBody(updateBannerStatusSchema, req.body);
    const actor = { userId: req.user!.userId, ipAddress: req.auditCtx?.ipAddress, userAgent: req.auditCtx?.userAgent };
    const data = await adminService.updateBannerStatus(bannerId, input, actor);
    const msg =
      input.status === "Visible"
        ? "Hiển thị banner thành công (các banner khác đã được ẩn)"
        : "Ẩn banner thành công";
    res.json({ success: true, data, message: msg });
  }),

  deleteBanner: asyncHandler(async (req: Request, res: Response) => {
    const { bannerId } = parseQuery(getBannerByIdSchema, req.params);
    const actor = { userId: req.user!.userId, ipAddress: req.auditCtx?.ipAddress, userAgent: req.auditCtx?.userAgent };
    await adminService.deleteBanner(bannerId, actor);
    res.json({ success: true, message: "Xóa banner thành công" });
  }),

  // ─── Popup ───────────────────────────────────────────────────────────────

  listPopups: asyncHandler(async (req: Request, res: Response) => {
    const input = parseQuery(listPopupsSchema, req.query);
    const data = await adminService.listPopups(input);
    res.json({ success: true, data });
  }),

  getPopupById: asyncHandler(async (req: Request, res: Response) => {
    const { popupId } = parseQuery(getPopupByIdSchema, req.params);
    const data = await adminService.getPopupById(popupId);
    res.json({ success: true, data });
  }),

  createPopup: asyncHandler(async (req: Request, res: Response) => {
    const input = parseBody(createPopupSchema, req.body);
    const actor = { userId: req.user!.userId, ipAddress: req.auditCtx?.ipAddress, userAgent: req.auditCtx?.userAgent };
    const data = await adminService.createPopup(input, actor);
    res.json({ success: true, data, message: "Tạo popup thành công" });
  }),

  updatePopup: asyncHandler(async (req: Request, res: Response) => {
    const { popupId } = parseQuery(getPopupByIdSchema, req.params);
    const input = parseBody(updatePopupSchema, req.body);
    const actor = { userId: req.user!.userId, ipAddress: req.auditCtx?.ipAddress, userAgent: req.auditCtx?.userAgent };
    const data = await adminService.updatePopup(popupId, input, actor);
    res.json({ success: true, data, message: "Cập nhật popup thành công" });
  }),

  updatePopupStatus: asyncHandler(async (req: Request, res: Response) => {
    const { popupId } = parseQuery(getPopupByIdSchema, req.params);
    const input = parseBody(updatePopupStatusSchema, req.body);
    const actor = { userId: req.user!.userId, ipAddress: req.auditCtx?.ipAddress, userAgent: req.auditCtx?.userAgent };
    const data = await adminService.updatePopupStatus(popupId, input, actor);
    const msg =
      input.status === "Visible"
        ? "Hiển thị popup thành công (các popup khác đã được ẩn)"
        : "Ẩn popup thành công";
    res.json({ success: true, data, message: msg });
  }),

  deletePopup: asyncHandler(async (req: Request, res: Response) => {
    const { popupId } = parseQuery(getPopupByIdSchema, req.params);
    const actor = { userId: req.user!.userId, ipAddress: req.auditCtx?.ipAddress, userAgent: req.auditCtx?.userAgent };
    await adminService.deletePopup(popupId, actor);
    res.json({ success: true, message: "Xóa popup thành công" });
  }),

  // ─── Post ────────────────────────────────────────────────────────────────

  listPosts: asyncHandler(async (req: Request, res: Response) => {
    const input = parseQuery(listPostsSchema, req.query);
    const data = await adminService.listPosts(input);
    res.json({ success: true, data });
  }),

  getPostById: asyncHandler(async (req: Request, res: Response) => {
    const { postId } = parseQuery(getPostByIdSchema, req.params);
    const data = await adminService.getPostById(postId);
    res.json({ success: true, data });
  }),

  createPost: asyncHandler(async (req: Request, res: Response) => {
    const input = parseBody(createPostSchema, req.body);
    const actor = { userId: req.user!.userId, ipAddress: req.auditCtx?.ipAddress, userAgent: req.auditCtx?.userAgent };
    const data = await adminService.createPost(actor.userId, input, actor);
    res.json({ success: true, data, message: "Tạo bài viết thành công" });
  }),

  updatePost: asyncHandler(async (req: Request, res: Response) => {
    const { postId } = parseQuery(getPostByIdSchema, req.params);
    const input = parseBody(updatePostSchema, req.body);
    const actor = { userId: req.user!.userId, ipAddress: req.auditCtx?.ipAddress, userAgent: req.auditCtx?.userAgent };
    const data = await adminService.updatePost(postId, input, actor);
    res.json({ success: true, data, message: "Cập nhật bài viết thành công" });
  }),

  updatePostStatus: asyncHandler(async (req: Request, res: Response) => {
    const { postId } = parseQuery(getPostByIdSchema, req.params);
    const input = parseBody(updatePostStatusSchema, req.body);
    const actor = { userId: req.user!.userId, ipAddress: req.auditCtx?.ipAddress, userAgent: req.auditCtx?.userAgent };
    const data = await adminService.updatePostStatus(postId, input, actor);
    const msg =
      input.status === "Visible"
        ? "Đã đăng bài viết"
        : "Đã ẩn bài viết";
    res.json({ success: true, data, message: msg });
  }),

  deletePost: asyncHandler(async (req: Request, res: Response) => {
    const { postId } = parseQuery(getPostByIdSchema, req.params);
    const actor = { userId: req.user!.userId, ipAddress: req.auditCtx?.ipAddress, userAgent: req.auditCtx?.userAgent };
    await adminService.deletePost(postId, actor);
    res.json({ success: true, message: "Xóa bài viết thành công" });
  }),

  // ─── Order ────────────────────────────────────────────────────────────

  listOrders: asyncHandler(async (req: Request, res: Response) => {
    const input = parseQuery(listOrdersSchema, req.query);
    const data = await adminService.listOrders(input);
    res.json({ success: true, data });
  }),

  getOrderById: asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = parseQuery(getOrderByIdSchema, req.params);
    const data = await adminService.getOrderById(orderId);
    res.json({ success: true, data });
  }),

  cancelOrder: asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = parseQuery(getOrderByIdSchema, req.params);
    const input = parseBody(cancelOrderSchema, req.body);
    const actor = { userId: req.user!.userId, ipAddress: req.auditCtx?.ipAddress, userAgent: req.auditCtx?.userAgent };
    const data = await adminService.cancelOrder(actor.userId, orderId, input, actor);
    res.json({ success: true, data, message: "Đã hủy đơn hàng" });
  }),

  refundOrder: asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = parseQuery(getOrderByIdSchema, req.params);
    const input = parseBody(refundOrderSchema, req.body);
    const actor = { userId: req.user!.userId, ipAddress: req.auditCtx?.ipAddress, userAgent: req.auditCtx?.userAgent };
    const data = await adminService.refundOrder(actor.userId, orderId, input, actor);
    res.json({
      success: true,
      data,
      message: `Đã ghi nhận hoàn tiền (giả lập) ${input.amount?.toLocaleString('vi-VN') ?? ''}đ`,
    });
  }),

  // ─── Audit Logs ──────────────────────────────────────────────────────

  listAuditLogs: asyncHandler(async (req: Request, res: Response) => {
    const input = parseQuery(listAuditLogsSchema, req.query);
    const data = await adminService.listAuditLogs(input);
    res.json({ success: true, data });
  }),
};
