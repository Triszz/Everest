import { prisma } from "../../config/prisma";
import { AppError } from "../../middlewares/errorHandler";
import { notificationsService } from "../customer/notifications/notifications.service";
import type { AccountStatus, AuditActor, JwtPayload, Role } from "../../shared/types";
import type { UserRole, VoucherApprovalStatus, AuditTargetType } from "../../generated/prisma/enums";
import type { PartnerStatus } from "../../generated/prisma/enums";
import { AuditAction, AuditTarget } from "../../shared/constants/audit";
import { Prisma } from "../../generated/prisma/client";
import type {
  ListUsersInput,
  UpdateUserStatusInput,
  UpdateUserRoleInput,
  ListPartnersInput,
  ApprovePartnerInput,
  RejectPartnerInput,
  TogglePartnerLockInput,
  ListBranchesInput,
  CreateBranchInput,
  UpdateBranchInput,
  DeleteBranchInput,
  ToggleBranchLockInput,
  ListCategoriesInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  ListVouchersInput,
  ApproveVoucherInput,
  RejectVoucherInput,
  ToggleVoucherLockInput,
  ListPoliciesInput,
  GetPolicyByIdInput,
  UpsertPolicyInput,
  ListBannersInput,
  CreateBannerInput,
  UpdateBannerInput,
  UpdateBannerStatusInput,
  ListPopupsInput,
  CreatePopupInput,
  UpdatePopupInput,
  UpdatePopupStatusInput,
  ListPostsInput,
  CreatePostInput,
  UpdatePostInput,
  UpdatePostStatusInput,
  ListOrdersInput,
  CancelOrderInput,
  RefundOrderInput,
  ListAuditLogsInput,
} from "./admin.schemas";
import type { BannerStatus, PostStatus, PopupStatus } from "../../generated/prisma/enums";
import { buildPaginated, getPagination } from "../../shared/utils/paginate";

function logAudit(tx: Prisma.TransactionClient, actor: AuditActor) {
  return (params: {
    action: (typeof AuditAction)[keyof typeof AuditAction];
    targetType: AuditTargetType;
    targetId: string;
    description: string;
    metadata?: Record<string, unknown>;
  }) =>
    tx.adminAuditLog.create({
      data: {
        action: params.action,
        actorId: actor.userId,
        actorType: "ADMIN",
        targetType: params.targetType,
        targetId: params.targetId,
        description: params.description,
        metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
}

export const adminService = {
  async listUsers(input: ListUsersInput) {
    const { page, limit, skip } = getPagination({
      page: input.page,
      limit: input.limit,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (input.role) where.role = input.role;
    if (input.status) where.status = input.status;
    if (input.search) {
      where.OR = [
        { fullName: { contains: input.search, mode: "insensitive" } },
        { email: { contains: input.search, mode: "insensitive" } },
        { phoneNumber: { contains: input.search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          userId: true,
          email: true,
          fullName: true,
          phoneNumber: true,
          role: true,
          status: true,
          partnerId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return buildPaginated(users, total, page, limit);
  },

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        role: true,
        status: true,
        partnerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new AppError("Người dùng không tồn tại", 404, "NOT_FOUND");
    return user;
  },

  async updateUserStatus(userId: string, input: UpdateUserStatusInput, actor: AuditActor) {
    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) throw new AppError("Người dùng không tồn tại", 404, "NOT_FOUND");
    if (user.role === "Admin") {
      throw new AppError("Không thể thay đổi trạng thái tài khoản Admin", 403, "FORBIDDEN");
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { userId },
        data: { status: input.status as AccountStatus },
        select: {
          userId: true,
          email: true,
          fullName: true,
          role: true,
          status: true,
          updatedAt: true,
        },
      });
      if( input.status === "Banned" )
      {
        await prisma.userSession.updateMany({
          where: {
            userId,
            revokedAt: null,
          },
          data: { revokedAt: new Date() },
        });
      }
      await logAudit(tx, actor)({
        action: AuditAction.UPDATE_USER_STATUS,
        targetType: AuditTarget.USER,
        targetId: userId,
        description: `Admin ${actor.email} đổi trạng thái user ${userId} (${user.email}) thành ${input.status}`,
        metadata: {
          userId,
          email: user.email,
          oldStatus: user.status,
          newStatus: input.status,
        },
      });

      return updated;
    });

    return result;
  },

  async updateUserRole(userId: string, input: UpdateUserRoleInput, actor: AuditActor) {
    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) throw new AppError("Người dùng không tồn tại", 404, "NOT_FOUND");

    const partnerRoles: UserRole[] = ["Partner_Owner", "Partner_Cashier"];
    const editableRoles: UserRole[] = ["Admin", "Customer"];
    if (partnerRoles.includes(user.role as UserRole)) {
      throw new AppError(
        "Không thể thay đổi vai trò của tài khoản Partner hoặc Partner Cashier",
        400,
        "PARTNER_ROLE_IMMUTABLE",
      );
    }
    if (!editableRoles.includes(input.role as UserRole)) {
      throw new AppError(
        "Chỉ có thể phân quyền tài khoản thành Admin hoặc Customer",
        400,
        "INVALID_ROLE_CHANGE",
      );
    }

    const rolePriority: Record<UserRole, number> = {
      Partner_Cashier: 1,
      Partner_Owner: 2,
      Customer: 1,
      Admin: 3,
    };
    if (rolePriority[input.role as UserRole] > rolePriority[actor.role as UserRole]) {
      throw new AppError("Không thể phân quyền cao hơn vai trò của bạn", 403, "FORBIDDEN");
    }

    if (
      (input.role === "Partner_Owner" || input.role === "Partner_Cashier") &&
      !user.partnerId
    ) {
      throw new AppError(
        "Người dùng chưa liên kết với đối tác nào. Gán vai trò đối tác không hợp lệ.",
        400,
        "VALIDATION_ERROR",
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { userId },
        data: { role: input.role as Role },
        select: {
          userId: true,
          email: true,
          fullName: true,
          role: true,
          status: true,
          partnerId: true,
          updatedAt: true,
        },
      });

      await logAudit(tx, actor)({
        action: AuditAction.UPDATE_USER_ROLE,
        targetType: AuditTarget.USER,
        targetId: userId,
        description: `Admin ${actor.email} đổi role user ${userId} (${user.email}) từ ${user.role} → ${input.role}`,
        metadata: {
          userId,
          email: user.email,
          oldRole: user.role,
          newRole: input.role,
        },
      });

      return updated;
    });

    return result;
  },

  // ─── Partner Approval ──────────────────────────────────────────────────────

  async listPartners(input: ListPartnersInput) {
    const { page, limit, skip } = getPagination({
      page: input.page,
      limit: input.limit,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (input.status) where.status = input.status as PartnerStatus;
    if (input.isLocked !== undefined) where.isLocked = input.isLocked;
    if (input.search && input.search.trim() !== "") {
      const term = input.search.trim();
      const field = input.searchField ?? "companyName";
      if (field === "partnerId") {
        const numericId = Number(term);
        if (Number.isInteger(numericId) && numericId > 0) {
          where.partnerId = numericId;
        } else {
          where.partnerId = -1;
        }
      } else if (field === "phoneNumber") {
        where.users = {
          some: { phoneNumber: { contains: term } },
        };
      } else if (field === "email") {
        where.users = {
          some: { email: { contains: term, mode: "insensitive" } },
        };
      } else {
        where.companyName = { contains: term, mode: "insensitive" };
      }
    }

    const [partners, total] = await Promise.all([
      prisma.partner.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          partnerId: true,
          companyName: true,
          taxCode: true,
          businessLicenseUrl: true,
          status: true,
          isLocked: true,
          createdAt: true,
          updatedAt: true,
          users: {
            select: {
              userId: true,
              email: true,
              fullName: true,
              role: true,
            },
          },
          _count: {
            select: { branches: true },
          },
        },
      }),
      prisma.partner.count({ where }),
    ]);

    return buildPaginated(partners, total, page, limit);
  },

  async getPartnerById(partnerId: number) {
    const partner = await prisma.partner.findUnique({
      where: { partnerId },
      select: {
        partnerId: true,
        companyName: true,
        taxCode: true,
        businessLicenseUrl: true,
        status: true,
        isLocked: true,
        createdAt: true,
        updatedAt: true,
        users: {
          select: {
            userId: true,
            email: true,
            fullName: true,
            phoneNumber: true,
            role: true,
            status: true,
          },
        },
        branches: {
          select: {
            branchId: true,
            branchName: true,
            address: true,
            phoneNumber: true,
            isLocked: true,
            createdAt: true,
          },
        },
      },
    });
    if (!partner) throw new AppError("Đối tác không tồn tại", 404, "NOT_FOUND");
    return partner;
  },

  async approvePartner(partnerId: number, input: ApprovePartnerInput, actor: AuditActor) {
    const partner = await prisma.partner.findUnique({ where: { partnerId } });
    if (!partner) throw new AppError("Đối tác không tồn tại", 404, "NOT_FOUND");
    if (partner.status === "Approved") {
      throw new AppError("Đối tác đã được duyệt trước đó", 400, "ALREADY_APPROVED");
    }
    if (partner.status === "Rejected") {
      throw new AppError("Đối tác đã bị từ chối. Không thể duyệt lại.", 400, "CANNOT_APPROVE_REJECTED");
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.partner.update({
        where: { partnerId },
        data: { status: "Approved" },
        select: {
          partnerId: true,
          companyName: true,
          taxCode: true,
          status: true,
          isLocked: true,
          updatedAt: true,
        },
      });

      await logAudit(tx, actor)({
        action: AuditAction.APPROVE_PARTNER,
        targetType: AuditTarget.PARTNER,
        targetId: String(partnerId),
        description: `Admin ${actor.email} duyệt đối tác "${partner.companyName}" (#${partnerId})`,
        metadata: {
          partnerId,
          companyName: partner.companyName,
          taxCode: partner.taxCode,
        },
      });

      return updated;
    });

    return result;
  },

  async rejectPartner(partnerId: number, input: RejectPartnerInput, actor: AuditActor) {
    const partner = await prisma.partner.findUnique({ where: { partnerId } });
    if (!partner) throw new AppError("Đối tác không tồn tại", 404, "NOT_FOUND");
    if (partner.status === "Rejected") {
      throw new AppError("Đối tác đã bị từ chối trước đó", 400, "ALREADY_REJECTED");
    }
    if (partner.status === "Approved") {
      throw new AppError("Đối tác đã được duyệt. Không thể từ chối.", 400, "CANNOT_REJECT_APPROVED");
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.partner.update({
        where: { partnerId },
        data: { status: "Rejected" },
        select: {
          partnerId: true,
          companyName: true,
          taxCode: true,
          status: true,
          isLocked: true,
          updatedAt: true,
        },
      });

      await logAudit(tx, actor)({
        action: AuditAction.REJECT_PARTNER,
        targetType: AuditTarget.PARTNER,
        targetId: String(partnerId),
        description: `Admin ${actor.email} từ chối đối tác "${partner.companyName}" (#${partnerId}). Lý do: ${input.reason ?? "Không có"}`,
        metadata: {
          partnerId,
          companyName: partner.companyName,
          taxCode: partner.taxCode,
          reason: input.reason,
        },
      });

      return updated;
    });

    return result;
  },

  async togglePartnerLock(partnerId: number, input: TogglePartnerLockInput, actor: AuditActor) {
    const partner = await prisma.partner.findUnique({ where: { partnerId } });
    if (!partner) throw new AppError("Đối tác không tồn tại", 404, "NOT_FOUND");

    const newLocked = input.locked;

    const result = await prisma.$transaction(async (tx) => {
      await tx.partner.update({
        where: { partnerId },
        data: { isLocked: newLocked },
      });
      const branchResult = await tx.branch.updateMany({
        where: { partnerId },
        data: { isLocked: newLocked },
      });
      const voucherResult = await tx.voucher.updateMany({
        where: { partnerId },
        data: {
          isLocked: newLocked,
          displayStatus: newLocked ? "Hidden" : "Visible",
        },
      });
      const updated = await tx.partner.findUnique({
        where: { partnerId },
        select: {
          partnerId: true,
          companyName: true,
          taxCode: true,
          status: true,
          isLocked: true,
          updatedAt: true,
        },
      });

      await logAudit(tx, actor)({
        action: AuditAction.LOCK_PARTNER,
        targetType: AuditTarget.PARTNER,
        targetId: String(partnerId),
        description: `Admin ${actor.email} ${newLocked ? "khóa" : "mở khóa"} đối tác "${partner.companyName}" (#${partnerId})`,
        metadata: {
          partnerId,
          companyName: partner.companyName,
          oldLocked: partner.isLocked,
          newLocked,
          affectedBranches: branchResult.count,
          affectedVouchers: voucherResult.count,
        },
      });

      return {
        partner: updated!,
        affected: { branches: branchResult.count, vouchers: voucherResult.count },
      };
    });

    return result;
  },

  // ─── Branch Management ───────────────────────────────────────────────────────

  async listBranches(partnerId: number, input: ListBranchesInput) {
    const { page, limit, skip } = getPagination({ page: input.page, limit: input.limit });

    const partner = await prisma.partner.findUnique({ where: { partnerId } });
    if (!partner) throw new AppError("Đối tác không tồn tại", 404, "NOT_FOUND");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { partnerId };
    if (input.isLocked !== undefined) where.isLocked = input.isLocked;
    if (input.search) {
      where.OR = [
        { branchName: { contains: input.search, mode: "insensitive" } },
        { address: { contains: input.search, mode: "insensitive" } },
      ];
    }

    const [branches, total] = await Promise.all([
      prisma.branch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          branchId: true,
          branchName: true,
          address: true,
          phoneNumber: true,
          isLocked: true,
          createdAt: true,
          updatedAt: true,
          cashier: {
            select: { userId: true, fullName: true, email: true },
          },
        },
      }),
      prisma.branch.count({ where }),
    ]);

    return buildPaginated(branches, total, page, limit);
  },

  async getBranchById(partnerId: number, branchId: number) {
    const branch = await prisma.branch.findUnique({
      where: { branchId, partnerId },
      select: {
        branchId: true,
        partnerId: true,
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
    return branch;
  },

  async listAllBranches(input: { page: number; limit: number; skip: number; search?: string; isLocked?: boolean; partnerId?: number }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (input.isLocked !== undefined) where.isLocked = input.isLocked;
    if (input.partnerId) where.partnerId = input.partnerId;
    if (input.search) {
      where.OR = [
        { branchName: { contains: input.search, mode: "insensitive" } },
        { address: { contains: input.search, mode: "insensitive" } },
        { partner: { companyName: { contains: input.search, mode: "insensitive" } } },
      ];
    }

    const [branches, total] = await Promise.all([
      prisma.branch.findMany({
        where,
        skip: input.skip,
        take: input.limit,
        orderBy: { createdAt: "desc" },
        select: {
          branchId: true,
          partnerId: true,
          cashierId: true,
          branchName: true,
          address: true,
          phoneNumber: true,
          isLocked: true,
          createdAt: true,
          partner: {
            select: { partnerId: true, companyName: true },
          },
        },
      }),
      prisma.branch.count({ where }),
    ]);

    return buildPaginated(branches, total, input.page, input.limit);
  },

  async createBranch(partnerId: number, input: CreateBranchInput) {
    const partner = await prisma.partner.findUnique({ where: { partnerId } });
    if (!partner) throw new AppError("Đối tác không tồn tại", 404, "NOT_FOUND");

    const result = await prisma.branch.create({
      data: { partnerId, ...input, phoneNumber: input.phoneNumber ?? "" },
      select: {
        branchId: true,
        branchName: true,
        address: true,
        city: true,
        phoneNumber: true,
        isLocked: true,
        createdAt: true,
      },
    });

    return result;
  },

  async updateBranch(partnerId: number, branchId: number, input: UpdateBranchInput) {
    const branch = await prisma.branch.findUnique({ where: { branchId, partnerId } });
    if (!branch) throw new AppError("Chi nhánh không tồn tại", 404, "NOT_FOUND");

    const result = await prisma.branch.update({
      where: { branchId },
      data: { ...input, phoneNumber: input.phoneNumber ?? undefined },
      select: {
        branchId: true,
        branchName: true,
        address: true,
        city: true,
        phoneNumber: true,
        isLocked: true,
      },
    });

    return result;
  },

  async deleteBranch(partnerId: number, branchId: number) {
    const branch = await prisma.branch.findUnique({ where: { branchId, partnerId } });
    if (!branch) throw new AppError("Chi nhánh không tồn tại", 404, "NOT_FOUND");

    const activeVouchers = await prisma.issuedVoucher.count({
      where: {
        branchId,
        status: { notIn: ["Used", "Expired"] },
      },
    });
    if (activeVouchers > 0) {
      throw new AppError(
        `Chi nhánh đang có ${activeVouchers} voucher đang hoạt động. Không thể xóa.`,
        400,
        "BRANCH_HAS_ACTIVE_VOUCHERS",
      );
    }

    const branchName = branch.branchName;
    await prisma.branch.delete({ where: { branchId } });

    return { branchId, deletedAt: new Date() };
  },

  async toggleBranchLock(partnerId: number, branchId: number, input: ToggleBranchLockInput, actor: AuditActor) {
    const branch = await prisma.branch.findUnique({ where: { branchId, partnerId } });
    if (!branch) throw new AppError("Chi nhánh không tồn tại", 404, "NOT_FOUND");

    if (!input.locked) {
      const partner = await prisma.partner.findUnique({ where: { partnerId } });
      if (!partner) throw new AppError("Đối tác không tồn tại", 404, "NOT_FOUND");
      if (partner.isLocked) {
        throw new AppError("Partner đang bị khóa", 400, "PARTNER_IS_LOCKED");
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.branch.update({
        where: { branchId },
        data: { isLocked: input.locked },
        select: {
          branchId: true,
          partnerId: true,
          branchName: true,
          address: true,
          phoneNumber: true,
          isLocked: true,
          createdAt: true,
        },
      });

      if (input.locked && (branch as Record<string, unknown>).cashierId) {
        await tx.user.updateMany({
          where: { userId: (branch as Record<string, unknown>).cashierId as string },
          data: { status: "Banned" },
        });
      }

      await logAudit(tx, actor)({
        action: AuditAction.LOCK_BRANCH,
        targetType: AuditTarget.BRANCH,
        targetId: String(branchId),
        description: `Admin ${actor.email} ${input.locked ? "khóa" : "mở khóa"} chi nhánh "${branch.branchName}" (#${branchId})`,
        metadata: {
          branchId,
          partnerId,
          branchName: branch.branchName,
          oldLocked: branch.isLocked,
          newLocked: input.locked,
        },
      });

      return updated;
    });

    return result;
  },

  // ─── Category Management ─────────────────────────────────────────────────────

  async listCategories(input: ListCategoriesInput) {
    const { page, limit, skip } = getPagination({ page: input.page, limit: input.limit });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (input.search) {
      where.OR = [
        { categoryName: { contains: input.search, mode: "insensitive" } },
        { description: { contains: input.search, mode: "insensitive" } },
      ];
    }

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { categoryId: "asc" },
        select: {
          categoryId: true,
          categoryName: true,
          description: true,
          _count: { select: { vouchers: true } },
        },
      }),
      prisma.category.count({ where }),
    ]);

    return buildPaginated(
      categories.map(({ _count, ...category }) => ({
        ...category,
        voucherCount: _count.vouchers,
      })),
      total,
      page,
      limit,
    );
  },

  async getCategoryById(categoryId: number) {
    const category = await prisma.category.findUnique({
      where: { categoryId },
      select: {
        categoryId: true,
        categoryName: true,
        description: true,
        _count: { select: { vouchers: true } },
        vouchers: {
          select: {
            voucherId: true,
            title: true,
            approvalStatus: true,
            displayStatus: true,
            availableQuantity: true,
            salePrice: true,
          },
        },
      },
    });
    if (!category) throw new AppError("Danh mục không tồn tại", 404, "NOT_FOUND");
    const { _count, ...categoryData } = category;
    return { ...categoryData, voucherCount: _count.vouchers };
  },

  async createCategory(input: CreateCategoryInput) {
    const normalizedName = input.categoryName.trim();
    const existing = await prisma.category.findFirst({
      where: { categoryName: { equals: normalizedName, mode: "insensitive" } },
    });
    if (existing) {
      throw new AppError("Tên danh mục đã tồn tại", 409, "CATEGORY_EXISTS");
    }

    const result = await prisma.category.create({
      data: { ...input, categoryName: normalizedName },
      select: { categoryId: true, categoryName: true, description: true },
    });

    return result;
  },

  async updateCategory(categoryId: number, input: UpdateCategoryInput) {
    const category = await prisma.category.findUnique({ where: { categoryId } });
    if (!category) throw new AppError("Danh mục không tồn tại", 404, "NOT_FOUND");

    if (input.categoryName) {
      const normalizedName = input.categoryName.trim();
      if (normalizedName !== category.categoryName) {
        const duplicate = await prisma.category.findFirst({
          where: { categoryName: { equals: normalizedName, mode: "insensitive" } },
        });
        if (duplicate) {
          throw new AppError("Tên danh mục đã tồn tại", 409, "CATEGORY_EXISTS");
        }
      }
      input.categoryName = normalizedName;
    }

    const result = await prisma.category.update({
      where: { categoryId },
      data: input,
      select: { categoryId: true, categoryName: true, description: true },
    });

    return result;
  },

  async deleteCategory(categoryId: number) {
    const category = await prisma.category.findUnique({ where: { categoryId } });
    if (!category) throw new AppError("Danh mục không tồn tại", 404, "NOT_FOUND");

    const voucherCount = await prisma.voucher.count({ where: { categoryId } });
    if (voucherCount > 0) {
      throw new AppError(
        `Danh mục đang chứa ${voucherCount} voucher. Không thể xóa.`,
        400,
        "CATEGORY_HAS_VOUCHERS",
      );
    }

    const categoryName = category.categoryName;
    await prisma.category.delete({ where: { categoryId } });

    return { categoryId, deletedAt: new Date() };
  },

  // ─── Voucher Management ─────────────────────────────────────────────────────

  async listVouchers(input: ListVouchersInput) {
    const { page, limit, skip } = getPagination({ page: input.page, limit: input.limit });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (input.search) {
      if (input.searchField === "voucherId") {
        const id = Number(input.search);
        if (!isNaN(id)) where.voucherId = id;
      } else {
        const term = input.search.trim();
        where.OR = [
          { title: { contains: term, mode: "insensitive" } },
        ];
      }
    }
    if (input.categoryId) where.categoryId = input.categoryId;
    if (input.partnerId) where.partnerId = input.partnerId;
    if (input.approvalStatus) where.approvalStatus = input.approvalStatus as VoucherApprovalStatus;

    const [vouchers, total] = await Promise.all([
      prisma.voucher.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          voucherId: true,
          title: true,
          description: true,
          originalPrice: true,
          salePrice: true,
          totalQuantity: true,
          availableQuantity: true,
          approvalStatus: true,
          displayStatus: true,
          isLocked: true,
          startDate: true,
          endDate: true,
          category: { select: { categoryId: true, categoryName: true } },
          partner: { select: { partnerId: true, companyName: true } },
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.voucher.count({ where }),
    ]);

    return buildPaginated(vouchers, total, page, limit);
  },

  // ─── Voucher Approval ───────────────────────────────────────────────────────

  async getVoucherById(voucherId: number) {
    const voucher = await prisma.voucher.findUnique({
      where: { voucherId },
      select: {
        voucherId: true,
        title: true,
        description: true,
        originalPrice: true,
        salePrice: true,
        totalQuantity: true,
        availableQuantity: true,
        imageUrl: true,
        startDate: true,
        endDate: true,
        expiryDays: true,
        approvalStatus: true,
        displayStatus: true,
        isLocked: true,
        createdAt: true,
        updatedAt: true,
        partner: {
          select: {
            partnerId: true,
            companyName: true,
            status: true,
            isLocked: true,
          },
        },
        category: {
          select: { categoryId: true, categoryName: true },
        },
      },
    });
    if (!voucher) throw new AppError("Voucher không tồn tại", 404, "NOT_FOUND");
    return voucher;
  },

  async approveVoucher(voucherId: number, input: ApproveVoucherInput, actor: AuditActor) {
    const voucher = await prisma.voucher.findUnique({ where: { voucherId } });
    if (!voucher) throw new AppError("Voucher không tồn tại", 404, "NOT_FOUND");
    if (voucher.approvalStatus === "Approved") {
      throw new AppError("Voucher đã được duyệt trước đó", 400, "ALREADY_APPROVED");
    }
    if (voucher.approvalStatus === "Rejected") {
      throw new AppError("Voucher đã bị từ chối. Không thể duyệt lại.", 400, "CANNOT_APPROVE_REJECTED");
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.voucher.update({
        where: { voucherId },
        data: { approvalStatus: "Approved", displayStatus: "Visible" },
        select: {
          voucherId: true,
          title: true,
          approvalStatus: true,
          displayStatus: true,
          updatedAt: true,
        },
      });

      await logAudit(tx, actor)({
        action: AuditAction.APPROVE_VOUCHER,
        targetType: AuditTarget.VOUCHER,
        targetId: String(voucherId),
        description: `Admin ${actor.email} duyệt voucher "${voucher.title}" (#${voucherId})`,
        metadata: {
          voucherId,
          title: voucher.title,
        },
      });

      return updated;
    });

    return result;
  },

  async rejectVoucher(voucherId: number, input: RejectVoucherInput, actor: AuditActor) {
    const voucher = await prisma.voucher.findUnique({ where: { voucherId } });
    if (!voucher) throw new AppError("Voucher không tồn tại", 404, "NOT_FOUND");
    if (voucher.approvalStatus === "Rejected") {
      throw new AppError("Voucher đã bị từ chối trước đó", 400, "ALREADY_REJECTED");
    }
    if (voucher.approvalStatus === "Approved") {
      throw new AppError("Voucher đã được duyệt. Không thể từ chối.", 400, "CANNOT_REJECT_APPROVED");
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.voucher.update({
        where: { voucherId },
        data: { approvalStatus: "Rejected" },
        select: {
          voucherId: true,
          title: true,
          approvalStatus: true,
          displayStatus: true,
          updatedAt: true,
        },
      });

      await logAudit(tx, actor)({
        action: AuditAction.REJECT_VOUCHER,
        targetType: AuditTarget.VOUCHER,
        targetId: String(voucherId),
        description: `Admin ${actor.email} từ chối voucher "${voucher.title}" (#${voucherId}). Lý do: ${input.reason ?? "Không có"}`,
        metadata: {
          voucherId,
          title: voucher.title,
          reason: input.reason,
        },
      });

      return updated;
    });

    return result;
  },

  async getVoucherStats() {
    const [total, approved, pending, rejected, totalIssued, totalUsed] = await Promise.all([
      prisma.voucher.count(),
      prisma.voucher.count({ where: { approvalStatus: "Approved" } }),
      prisma.voucher.count({ where: { approvalStatus: "Pending" } }),
      prisma.voucher.count({ where: { approvalStatus: "Rejected" } }),
      prisma.issuedVoucher.count(),
      prisma.issuedVoucher.count({ where: { status: "Used" } }),
    ]);

    return { total, approved, pending, rejected, totalIssued, totalUsed };
  },

  async setVoucherDisplayStatus(
    voucherId: number,
    input: { displayStatus: "Visible" | "Hidden" },
    actor: AuditActor,
  ) {
    const voucher = await prisma.voucher.findUnique({ where: { voucherId } });
    if (!voucher) throw new AppError("Voucher không tồn tại", 404, "NOT_FOUND");

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.voucher.update({
        where: { voucherId },
        data: { displayStatus: input.displayStatus },
        select: {
          voucherId: true,
          title: true,
          approvalStatus: true,
          displayStatus: true,
          updatedAt: true,
        },
      });

      await logAudit(tx, actor)({
        action: AuditAction.SET_VOUCHER_DISPLAY,
        targetType: AuditTarget.VOUCHER,
        targetId: String(voucherId),
        description: `Admin ${actor.email} ${input.displayStatus === "Visible" ? "hiện" : "ẩn"} voucher "${voucher.title}" (#${voucherId})`,
        metadata: {
          voucherId,
          title: voucher.title,
          oldDisplayStatus: voucher.displayStatus,
          newDisplayStatus: input.displayStatus,
        },
      });

      return updated;
    });

    return result;
  },

  async updateVoucherDates(voucherId: number, input: { endDate: Date }, actor: AuditActor) {
    const voucher = await prisma.voucher.findUnique({
      where: { voucherId },
      select: { startDate: true, title: true, endDate: true },
    });
    if (!voucher) throw new AppError("Voucher không tồn tại", 404, "NOT_FOUND");
    if (input.endDate <= voucher.startDate) {
      throw new AppError("Ngày kết thúc phải lớn hơn ngày bắt đầu", 400, "INVALID_DATE_RANGE");
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.voucher.update({
        where: { voucherId },
        data: { endDate: input.endDate },
        select: {
          voucherId: true,
          title: true,
          startDate: true,
          endDate: true,
          approvalStatus: true,
          displayStatus: true,
          updatedAt: true,
        },
      });

      await logAudit(tx, actor)({
        action: AuditAction.UPDATE_VOUCHER_DATES,
        targetType: AuditTarget.VOUCHER,
        targetId: String(voucherId),
        description: `Admin ${actor.email} cập nhật ngày kết thúc voucher "${voucher.title}" (#${voucherId})`,
        metadata: {
          voucherId,
          title: voucher.title,
          oldEndDate: voucher.endDate?.toISOString(),
          newEndDate: input.endDate.toISOString(),
        },
      });

      return updated;
    });

    return result;
  },

  async expireVoucherNow(voucherId: number, actor: AuditActor) {
    const now = new Date();
    const voucher = await prisma.voucher.findUnique({
      where: { voucherId },
      select: { startDate: true, title: true, endDate: true },
    });
    if (!voucher) throw new AppError("Voucher không tồn tại", 404, "NOT_FOUND");
    if (now <= voucher.startDate) {
      throw new AppError(
        "Không thể hết hạn voucher trước khi voucher bắt đầu",
        400,
        "VOUCHER_NOT_STARTED",
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.voucher.update({
        where: { voucherId },
        data: { endDate: now },
        select: {
          voucherId: true,
          title: true,
          startDate: true,
          endDate: true,
          approvalStatus: true,
          displayStatus: true,
          updatedAt: true,
        },
      });

      await logAudit(tx, actor)({
        action: AuditAction.EXPIRE_VOUCHER,
        targetType: AuditTarget.VOUCHER,
        targetId: String(voucherId),
        description: `Admin ${actor.email} force-expire voucher "${voucher.title}" (#${voucherId})`,
        metadata: {
          voucherId,
          title: voucher.title,
          oldEndDate: voucher.endDate?.toISOString(),
          newEndDate: now.toISOString(),
        },
      });

      return updated;
    });

    return result;
  },

  async toggleVoucherLock(voucherId: number, input: ToggleVoucherLockInput, actor: AuditActor) {
    const voucher = await prisma.voucher.findUnique({ where: { voucherId } });
    if (!voucher) throw new AppError("Voucher không tồn tại", 404, "NOT_FOUND");

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.voucher.update({
        where: { voucherId },
        data: { isLocked: input.locked },
        select: {
          voucherId: true,
          title: true,
          isLocked: true,
          displayStatus: true,
          approvalStatus: true,
          updatedAt: true,
        },
      });

      await logAudit(tx, actor)({
        action: AuditAction.LOCK_VOUCHER,
        targetType: AuditTarget.VOUCHER,
        targetId: String(voucherId),
        description: `Admin ${actor.email} ${input.locked ? "khóa" : "mở khóa"} voucher "${voucher.title}" (#${voucherId})`,
        metadata: {
          voucherId,
          title: voucher.title,
          oldLocked: voucher.isLocked,
          newLocked: input.locked,
        },
      });

      return updated;
    });

    return result;
  },

  // ─── Policy Management ───────────────────────────────────────────────────────

  async listPolicies(_input: ListPoliciesInput) {
    const policies = await prisma.policy.findMany({
      orderBy: { policyId: "asc" },
      select: {
        policyId: true,
        title: true,
        content: true,
        updatedAt: true,
      },
    });
    return policies;
  },

  async getPolicyById(policyId: number) {
    const policy = await prisma.policy.findUnique({
      where: { policyId },
      select: {
        policyId: true,
        title: true,
        content: true,
        updatedAt: true,
      },
    });
    if (!policy) throw new AppError("Chính sách không tồn tại", 404, "NOT_FOUND");
    return policy;
  },

  async upsertPolicy(input: UpsertPolicyInput) {
    const select = {
      policyId: true,
      title: true,
      content: true,
      updatedAt: true,
    } as const;

    const result = input.policyId
      ? await prisma.policy.update({
          where: { policyId: input.policyId },
          data: {
            title: input.title,
            content: input.content,
            updatedAt: new Date(),
          },
          select,
        })
      : await prisma.policy.upsert({
          where: { title: input.title },
          create: { title: input.title, content: input.content },
          update: { content: input.content },
          select,
        });

    return result;
  },

  async deletePolicy(policyId: number) {
    const policy = await prisma.policy.findUnique({ where: { policyId }, select: { title: true } });
    await prisma.policy.delete({ where: { policyId } });

    return { deleted: true, policyId };
  },

  // ─── Banner Management ────────────────────────────────────────────────────

  async listBanners(input: ListBannersInput) {
    const { page, limit, skip } = getPagination({ page: input.page, limit: input.limit });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (input.status) where.status = input.status as BannerStatus;
    if (input.search) {
      where.OR = [
        { title: { contains: input.search, mode: "insensitive" } },
        { imageUrl: { contains: input.search, mode: "insensitive" } },
      ];
    }

    const [banners, total] = await Promise.all([
      prisma.banner.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ status: "desc" }, { createdAt: "desc" }],
        select: {
          bannerId: true,
          title: true,
          imageUrl: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.banner.count({ where }),
    ]);

    return buildPaginated(banners, total, page, limit);
  },

  async getBannerById(bannerId: number) {
    const banner = await prisma.banner.findUnique({
      where: { bannerId },
      select: {
        bannerId: true,
        title: true,
        imageUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!banner) throw new AppError("Banner không tồn tại", 404, "NOT_FOUND");
    return banner;
  },

  async createBanner(input: CreateBannerInput) {
    const result = await prisma.banner.create({
      data: {
        title: input.title,
        imageUrl: input.imageUrl,
        status: (input.status ?? "Hidden") as BannerStatus,
      },
      select: {
        bannerId: true,
        title: true,
        imageUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return result;
  },

  async updateBanner(bannerId: number, input: UpdateBannerInput) {
    const banner = await prisma.banner.findUnique({ where: { bannerId } });
    if (!banner) throw new AppError("Banner không tồn tại", 404, "NOT_FOUND");

    const result = await prisma.banner.update({
      where: { bannerId },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
      },
      select: {
        bannerId: true,
        title: true,
        imageUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return result;
  },

  async updateBannerStatus(bannerId: number, input: UpdateBannerStatusInput) {
    const banner = await prisma.banner.findUnique({ where: { bannerId } });
    if (!banner) throw new AppError("Banner không tồn tại", 404, "NOT_FOUND");

    const nextStatus = input.status as BannerStatus;

    const result = await prisma.banner.update({
      where: { bannerId },
      data: { status: nextStatus },
      select: {
        bannerId: true,
        title: true,
        imageUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return result;
  },

  async deleteBanner(bannerId: number) {
    const banner = await prisma.banner.findUnique({ where: { bannerId } });
    if (!banner) throw new AppError("Banner không tồn tại", 404, "NOT_FOUND");
    const title = banner.title;
    await prisma.banner.delete({ where: { bannerId } });

    return { deleted: true, bannerId, deletedAt: new Date() };
  },

  // ─── Popup Management ────────────────────────────────────────────────────

  async listPopups(input: ListPopupsInput) {
    const { page, limit, skip } = getPagination({
      page: input.page,
      limit: input.limit,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (input.status) where.status = input.status;
    if (input.search) {
      where.OR = [
        { title: { contains: input.search, mode: "insensitive" } },
        { body: { contains: input.search, mode: "insensitive" } },
      ];
    }

    const [popups, total] = await Promise.all([
      prisma.popup.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
        select: {
          popupId: true,
          title: true,
          body: true,
          imageUrl: true,
          ctaLabel: true,
          ctaTargetUrl: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.popup.count({ where }),
    ]);

    return buildPaginated(popups, total, page, limit);
  },

  async getPopupById(popupId: number) {
    const popup = await prisma.popup.findUnique({
      where: { popupId },
      select: {
        popupId: true,
        title: true,
        body: true,
        imageUrl: true,
        ctaLabel: true,
        ctaTargetUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!popup) throw new AppError("Popup không tồn tại", 404, "NOT_FOUND");
    return popup;
  },

  async createPopup(input: CreatePopupInput) {
    const result = await prisma.popup.create({
      data: {
        title: input.title,
        body: input.body,
        imageUrl: input.imageUrl ?? null,
        ctaLabel: input.ctaLabel ?? null,
        ctaTargetUrl: input.ctaTargetUrl ?? null,
        status: (input.status ?? "Hidden") as PopupStatus,
      },
      select: {
        popupId: true,
        title: true,
        body: true,
        imageUrl: true,
        ctaLabel: true,
        ctaTargetUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return result;
  },

  async updatePopup(popupId: number, input: UpdatePopupInput) {
    const popup = await prisma.popup.findUnique({ where: { popupId } });
    if (!popup) throw new AppError("Popup không tồn tại", 404, "NOT_FOUND");

    const result = await prisma.popup.update({
      where: { popupId },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.body !== undefined ? { body: input.body } : {}),
        ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
        ...(input.ctaLabel !== undefined ? { ctaLabel: input.ctaLabel } : {}),
        ...(input.ctaTargetUrl !== undefined ? { ctaTargetUrl: input.ctaTargetUrl } : {}),
      },
      select: {
        popupId: true,
        title: true,
        body: true,
        imageUrl: true,
        ctaLabel: true,
        ctaTargetUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return result;
  },

  async updatePopupStatus(popupId: number, input: UpdatePopupStatusInput) {
    const popup = await prisma.popup.findUnique({ where: { popupId } });
    if (!popup) throw new AppError("Popup không tồn tại", 404, "NOT_FOUND");

    const nextStatus = input.status as PopupStatus;

    const result = await prisma.popup.update({
      where: { popupId },
      data: { status: nextStatus },
      select: {
        popupId: true,
        title: true,
        body: true,
        imageUrl: true,
        ctaLabel: true,
        ctaTargetUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return result;
  },

  async deletePopup(popupId: number) {
    const popup = await prisma.popup.findUnique({ where: { popupId } });
    if (!popup) throw new AppError("Popup không tồn tại", 404, "NOT_FOUND");
    const title = popup.title;
    await prisma.popup.delete({ where: { popupId } });

    return { deleted: true, popupId, deletedAt: new Date() };
  },

  // ─── Post Management ─────────────────────────────────────────────────────

  async listPosts(input: ListPostsInput) {
    const { page, limit, skip } = getPagination({
      page: input.page,
      limit: input.limit,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (input.status) where.status = input.status;
    if (input.search) {
      where.OR = [
        { title: { contains: input.search, mode: "insensitive" } },
        { content: { contains: input.search, mode: "insensitive" } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
        select: {
          postId: true,
          authorId: true,
          title: true,
          content: true,
          imageUrl: true,
          status: true,


          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              userId: true,
              fullName: true,
              email: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    return buildPaginated(posts, total, page, limit);
  },

  async getPostById(postId: number) {
    const post = await prisma.post.findUnique({
      where: { postId },
      select: {
        postId: true,
        authorId: true,
        title: true,
        content: true,
        imageUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            userId: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
    if (!post) throw new AppError("Bài viết không tồn tại", 404, "NOT_FOUND");
    return post;
  },

  async createPost(authorId: string, input: CreatePostInput) {
    const status = (input.status ?? "Hidden") as PostStatus;
    const result = await prisma.post.create({
      data: {
        authorId,
        title: input.title,
        content: input.content,
        imageUrl: input.imageUrl ?? null,
        status,
      },
      select: {
        postId: true,
        authorId: true,
        title: true,
        content: true,
        imageUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            userId: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return result;
  },

  async updatePost(postId: number, input: UpdatePostInput) {
    const post = await prisma.post.findUnique({ where: { postId } });
    if (!post) throw new AppError("Bài viết không tồn tại", 404, "NOT_FOUND");

    const newStatus = input.status as PostStatus | undefined;

    const result = await prisma.post.update({
      where: { postId },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.content !== undefined ? { content: input.content } : {}),
        ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
        ...(newStatus !== undefined ? { status: newStatus } : {}),
      },
      select: {
        postId: true,
        authorId: true,
        title: true,
        content: true,
        imageUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            userId: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return result;
  },

  async updatePostStatus(postId: number, input: UpdatePostStatusInput) {
    const post = await prisma.post.findUnique({ where: { postId } });
    if (!post) throw new AppError("Bài viết không tồn tại", 404, "NOT_FOUND");

    const nextStatus = input.status as PostStatus;

    const result = await prisma.post.update({
      where: { postId },
      data: {
        status: nextStatus,
      },
      select: {
        postId: true,
        authorId: true,
        title: true,
        content: true,
        imageUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            userId: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return result;
  },

  async deletePost(postId: number) {
    const post = await prisma.post.findUnique({ where: { postId } });
    if (!post) throw new AppError("Bài viết không tồn tại", 404, "NOT_FOUND");
    const title = post.title;
    await prisma.post.delete({ where: { postId } });

    return { deleted: true, postId, deletedAt: new Date() };
  },

  // ─── Order Management ──────────────────────────────────────────────────

  async listOrders(input: ListOrdersInput) {
    const { page, limit, skip } = getPagination({
      page: input.page,
      limit: input.limit,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (input.status === "Refunded") where.refundedAt = { not: null };
    else if (input.status === "Cancelled") where.cancelledAt = { not: null };
    else if (input.status) where.paymentStatus = input.status;
    else if (input.paymentStatus === "Cancelled") where.cancelledAt = { not: null };
    else if (input.paymentStatus) where.paymentStatus = input.paymentStatus;
    if (input.userId || input.customerId) where.customerId = input.userId ?? input.customerId;
    if (input.fromDate || input.toDate) {
      where.createdAt = {};
      if (input.fromDate) where.createdAt.gte = input.fromDate;
      if (input.toDate) where.createdAt.lte = input.toDate;
    }
    if (input.search) {
      const orderId = Number(input.search);
      where.orderId = Number.isInteger(orderId) && orderId > 0 ? orderId : -1;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          orderId: true,
          customerId: true,
          totalAmount: true,
          paymentMethod: true,
          paymentStatus: true,
          isGift: true,
          receiverEmail: true,
          giftMessage: true,
          cancelledAt: true,
          cancelledBy: true,
          cancelReason: true,
          refundedAt: true,
          refundAmount: true,
          createdAt: true,
          updatedAt: true,
          customer: {
            select: {
              userId: true,
              fullName: true,
              email: true,
              phoneNumber: true,
            },
          },
          orderItems: {
            select: {
              orderItemId: true,
              voucherId: true,
              quantity: true,
              price: true,
              voucher: {
                select: { voucherId: true, title: true, imageUrl: true },
              },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return buildPaginated(orders, total, page, limit);
  },

  async getOrderById(orderId: number) {
    const order = await prisma.order.findUnique({
      where: { orderId },
      include: {
        customer: {
          select: {
            userId: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            avatar: true,
          },
        },
        orderItems: {
          include: {
            voucher: {
              select: { voucherId: true, title: true, imageUrl: true, salePrice: true },
            },
            issuedVouchers: {
              select: {
                issuedVoucherId: true,
                voucherCode: true,
                status: true,
                validFrom: true,
                validTo: true,
                usedAt: true,
              },
            },
          },
        },
      },
    });
    if (!order) throw new AppError("Đơn hàng không tồn tại", 404, "NOT_FOUND");
    return order;
  },

  async cancelOrder(orderId: number, input: CancelOrderInput, actor: AuditActor) {
    const order = await prisma.order.findUnique({
      where: { orderId },
      include: { orderItems: { include: { issuedVouchers: true } } },
    });
    if (!order) throw new AppError("Đơn hàng không tồn tại", 404, "NOT_FOUND");
    if (order.cancelledAt || order.paymentStatus === "Cancelled") {
      throw new AppError("Đơn hàng đã được hủy trước đó", 400, "ALREADY_CANCELLED");
    }
    if (order.refundedAt) {
      throw new AppError("Đơn đã được hoàn tiền, không thể hủy", 400, "ALREADY_REFUNDED");
    }
    if (order.paymentStatus !== "Pending" && order.paymentStatus !== "Paid") {
      throw new AppError(
        "Chỉ có thể hủy đơn đang chờ thanh toán hoặc đã thanh toán",
        400,
        "ORDER_NOT_CANCELABLE",
      );
    }

    const usedVouchers = order.orderItems.flatMap((oi) =>
      oi.issuedVouchers.filter((iv) => iv.status === "Used"),
    );
    if (usedVouchers.length > 0) {
      throw new AppError(
        "Đơn có voucher đã sử dụng, không thể hủy",
        400,
        "VOUCHER_ALREADY_USED",
      );
    }

    const now = new Date();
    const result = await prisma.$transaction(async (tx) => {
      await tx.issuedVoucher.updateMany({
        where: {
          orderItemId: { in: order.orderItems.map((oi) => oi.orderItemId) },
          status: { in: ["Unused", "Locked"] },
        },
        data: { status: "Expired" },
      });

      for (const oi of order.orderItems) {
        await tx.voucher.update({
          where: { voucherId: oi.voucherId },
          data: { availableQuantity: { increment: oi.quantity } },
        });
      }

      const updated = await tx.order.update({
        where: { orderId },
        data: {
          paymentStatus: "Cancelled",
          cancelledAt: now,
          cancelledBy: actor.userId,
          cancelReason: input.reason,
        },
        select: {
          orderId: true,
          paymentStatus: true,
          cancelledAt: true,
          cancelledBy: true,
          cancelReason: true,
          updatedAt: true,
        },
      });

      await logAudit(tx, actor)({
        action: AuditAction.CANCEL_ORDER,
        targetType: AuditTarget.ORDER,
        targetId: String(orderId),
        description: `Admin ${actor.email} hủy đơn hàng #${orderId}`,
        metadata: {
          orderId,
          customerId: order.customerId,
          totalAmount: order.totalAmount,
          paymentStatus: order.paymentStatus,
          reason: input.reason,
        },
      });

      // Gửi thông báo cho khách hàng
      await notificationsService.notifyOrderCancelled(
        order.customerId,
        orderId,
        input.reason,
      );

      return updated;
    });

    return result;
  },

  async refundOrder(orderId: number, input: RefundOrderInput, actor: AuditActor) {
    const order = await prisma.order.findUnique({ where: { orderId } });
    if (!order) throw new AppError("Đơn hàng không tồn tại", 404, "NOT_FOUND");
    if (!order.cancelledAt) {
      throw new AppError(
        "Chỉ có thể hoàn tiền sau khi đã hủy đơn hàng",
        400,
        "ORDER_MUST_BE_CANCELLED",
      );
    }
    if (order.paymentStatus !== "Paid") {
      throw new AppError(
        "Chỉ đơn đã thanh toán mới có thể hoàn tiền",
        400,
        "ORDER_NOT_PAID",
      );
    }
    if (order.refundedAt) {
      throw new AppError("Đơn đã được hoàn tiền trước đó", 400, "ALREADY_REFUNDED");
    }

    const refundAmount = Number(order.totalAmount);

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { orderId },
        data: {
          refundedAt: new Date(),
          refundedBy: actor.userId,
          refundReason: input.reason,
          refundAmount,
        },
        select: {
          orderId: true,
          paymentStatus: true,
          refundedAt: true,
          refundedBy: true,
          refundReason: true,
          refundAmount: true,
          updatedAt: true,
        },
      });

      await logAudit(tx, actor)({
        action: AuditAction.REFUND_ORDER,
        targetType: AuditTarget.ORDER,
        targetId: String(orderId),
        description: `Admin ${actor.email} hoàn tiền đơn hàng #${orderId} (${refundAmount.toLocaleString("vi-VN")}đ)`,
        metadata: {
          orderId,
          customerId: order.customerId,
          refundAmount,
          refundReason: input.reason,
        },
      });

      return updated;
    });

    return result;
  },

  async markOrderPaid(orderId: number, actor: AuditActor) {
    const order = await prisma.order.findUnique({ where: { orderId } });
    if (!order) throw new AppError("Đơn hàng không tồn tại", 404, "NOT_FOUND");
    if (order.cancelledAt || order.paymentStatus === "Cancelled" || order.refundedAt) {
      throw new AppError("Không thể ghi nhận thanh toán cho đơn đã hủy/hoàn tiền", 400, "ORDER_NOT_PAYABLE");
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { orderId },
        data: { paymentStatus: "Paid" },
        select: { orderId: true, paymentStatus: true, updatedAt: true },
      });

      await logAudit(tx, actor)({
        action: AuditAction.MARK_ORDER_PAID,
        targetType: AuditTarget.ORDER,
        targetId: String(orderId),
        description: `Admin ${actor.email} đánh dấu đơn hàng #${orderId} là đã thanh toán (thủ công)`,
        metadata: {
          orderId,
          customerId: order.customerId,
          totalAmount: order.totalAmount,
        },
      });

      return updated;
    });

    return result;
  },

  // ─── Dashboard ──────────────────────────────────────────────────────────────

  async getDashboard() {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Run everything in parallel where possible
    const [
      totalUsers,
      totalPartners,
      totalVouchers,
      totalIssued,
      totalUsed,
      revenueByMonth,
      ordersByMonth,
      userRegByMonth,
      ordersByStatus,
      topVouchers,
      topPartners,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.partner.count({ where: { status: "Approved" } }),
      prisma.voucher.count(),
      prisma.issuedVoucher.count(),
      prisma.issuedVoucher.count({ where: { status: "Used" } }),
      prisma.$queryRaw<{ month: string; year: number; total: bigint | number }[]>`
        SELECT
          EXTRACT(MONTH FROM o."created_at")::int AS month,
          EXTRACT(YEAR FROM o."created_at")::int AS year,
          COALESCE(SUM(o."total_amount"), 0)::bigint AS total
        FROM orders o
        WHERE o."created_at" >= ${startDate}
          AND o."payment_status" = 'Paid'
          AND o."cancelled_at" IS NULL
          AND o."refunded_at" IS NULL
        GROUP BY year, month
        ORDER BY year, month
      `,
      prisma.$queryRaw<{ month: string; year: number; total: bigint | number }[]>`
        SELECT
          EXTRACT(MONTH FROM o."created_at")::int AS month,
          EXTRACT(YEAR FROM o."created_at")::int AS year,
          COUNT(o."order_id")::bigint AS total
        FROM orders o
        WHERE o."created_at" >= ${startDate}
        GROUP BY year, month
        ORDER BY year, month
      `,
      prisma.$queryRaw<{ month: string; year: number; total: bigint | number }[]>`
        SELECT
          EXTRACT(MONTH FROM u."created_at")::int AS month,
          EXTRACT(YEAR FROM u."created_at")::int AS year,
          COUNT(u."user_id")::bigint AS total
        FROM users u
        WHERE u."created_at" >= ${startDate}
        GROUP BY year, month
        ORDER BY year, month
      `,
      prisma.order.groupBy({
        by: ["paymentStatus"],
        _count: { _all: true },
      }),
      prisma.$queryRaw<{ voucherId: number; title: string; partnerId: number; partnerName: string; sold: bigint | number }[]>`
        SELECT
          v."voucher_id" AS "voucherId",
          v."title" AS title,
          p."partner_id" AS "partnerId",
          p."company_name" AS "partnerName",
          COALESCE(SUM(oi."quantity"), 0)::bigint AS sold
        FROM vouchers v
        INNER JOIN order_items oi ON oi."voucher_id" = v."voucher_id"
        INNER JOIN orders o ON o."order_id" = oi."order_id"
        INNER JOIN partners p ON p."partner_id" = v."partner_id"
        WHERE o."cancelled_at" IS NULL
          AND o."refunded_at" IS NULL
          AND o."payment_status" = 'Paid'
        GROUP BY v."voucher_id", v."title", p."partner_id", p."company_name"
        ORDER BY sold DESC
        LIMIT 10
      `,
      prisma.$queryRaw<{ partnerId: number; partnerName: string; sold: bigint | number }[]>`
        SELECT
          p."partner_id" AS "partnerId",
          p."company_name" AS "partnerName",
          COALESCE(SUM(oi."quantity"), 0)::bigint AS sold
        FROM partners p
        INNER JOIN vouchers v ON v."partner_id" = p."partner_id"
        INNER JOIN order_items oi ON oi."voucher_id" = v."voucher_id"
        INNER JOIN orders o ON o."order_id" = oi."order_id"
        WHERE o."cancelled_at" IS NULL
          AND o."refunded_at" IS NULL
          AND o."payment_status" = 'Paid'
        GROUP BY p."partner_id", p."company_name"
        ORDER BY sold DESC
        LIMIT 10
      `,
    ]);

    // Build last-6-months axis (oldest -> newest), fill missing months with 0
    const monthsAxis: { month: string; year: number; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthsAxis.push({
        month: String(d.getMonth() + 1),
        year: d.getFullYear(),
        label: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      });
    }

    const pickSeries = (
      rows: { month: string; year: number; total: bigint | number }[],
      divisor = 1,
    ) =>
      monthsAxis.map((slot) => {
        const match = rows.find(
          (r) => Number(r.month) === Number(slot.month) && Number(r.year) === Number(slot.year),
        );
        const raw = match ? Number(match.total) : 0;
        return { ...slot, value: divisor === 1 ? raw : Number((raw / divisor).toFixed(2)) };
      });

    const revenueSeries = pickSeries(revenueByMonth);
    const ordersSeries = pickSeries(ordersByMonth);
    const userRegSeries = pickSeries(userRegByMonth);

    // Order status breakdown
    let paid = 0;
    let pending = 0;
    let cancelled = 0;
    let refunded = 0;
    for (const row of ordersByStatus) {
      const count = row._count._all;
      if (row.paymentStatus === "Paid") paid = count;
      else if (row.paymentStatus === "Pending") pending = count;
      else if (row.paymentStatus === "Cancelled") cancelled += count;
    }
    const refundedCount = await prisma.order.count({
      where: { refundedAt: { not: null } },
    });
    refunded = refundedCount;

    return {
      kpis: {
        totalUsers,
        totalPartners,
        totalVouchers,
        totalIssued,
        totalUsed,
      },
      revenueByMonth: revenueSeries,
      ordersByMonth: ordersSeries,
      userRegistrationByMonth: userRegSeries,
      ordersByStatus: {
        paid,
        pending,
        cancelled,
        refunded,
      },
      topVouchers: topVouchers.map((v, i) => ({
        rank: i + 1,
        voucherId: v.voucherId,
        title: v.title,
        partnerId: v.partnerId,
        partnerName: v.partnerName,
        sold: Number(v.sold),
      })),
      topPartners: topPartners.map((p, i) => ({
        rank: i + 1,
        partnerId: p.partnerId,
        partnerName: p.partnerName,
        sold: Number(p.sold),
      })),
    };
  },

  // ─── Audit Logs ──────────────────────────────────────────────────────

  async listAuditLogs(input: ListAuditLogsInput) {
    const { page, limit, action, actorId, actorType, targetType, targetId, fromDate, toDate } = input;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (action) where.action = action;
    if (actorId) where.actorId = actorId;
    if (actorType) where.actorType = actorType;
    if (targetType) where.targetType = targetType;
    if (targetId) where.targetId = targetId;
    if (fromDate || toDate) {
      where.createdAt = {
        ...(fromDate ? { gte: fromDate } : {}),
        ...(toDate ? { lte: toDate } : {}),
      };
    }

    const [logs, total, actions] = await Promise.all([
      prisma.adminAuditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          logId: true,
          actorId: true,
          actorType: true,
          action: true,
          targetType: true,
          targetId: true,
          description: true,
          metadata: true,
          createdAt: true,
          actor: {
            select: {
              userId: true,
              fullName: true,
              email: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.adminAuditLog.count({ where }),
      prisma.adminAuditLog.findMany({
        distinct: ["action"],
        select: { action: true },
        orderBy: { action: "asc" },
      }),
    ]);

    return {
      data: logs.map((l) => ({
        logId: String(l.logId),
        actorId: l.actorId,
        actorType: l.actorType,
        action: l.action,
        targetType: l.targetType,
        targetId: l.targetId,
        description: l.description,
        metadata: l.metadata as Record<string, unknown> | null,
        createdAt: l.createdAt.toISOString(),
        actor: l.actor
          ? {
              userId: l.actor.userId,
              fullName: l.actor.fullName,
              email: l.actor.email,
              avatar: l.actor.avatar,
            }
          : null,
      })),
      actions: actions.map((a) => a.action),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  },
};
