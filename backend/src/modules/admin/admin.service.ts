import { prisma } from "../../config/prisma";
import { AppError } from "../../middlewares/errorHandler";
import type { AccountStatus, Role } from "../../shared/types";
import type { UserRole, VoucherApprovalStatus } from "../../generated/prisma/enums";
import type { PartnerStatus } from "../../generated/prisma/enums";
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
  ListPoliciesInput,
  GetPolicyByTypeInput,
  UpsertPolicyInput,
} from "./admin.schemas";
import { buildPaginated, getPagination } from "../../shared/utils/paginate";

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
        { phoneNumber: { contains: input.search, mode: "insensitive" } },
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

  async updateUserStatus(userId: string, input: UpdateUserStatusInput) {
    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) throw new AppError("Người dùng không tồn tại", 404, "NOT_FOUND");
    if (user.role === "Admin") {
      throw new AppError("Không thể thay đổi trạng thái tài khoản Admin", 403, "FORBIDDEN");
    }

    return prisma.user.update({
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
  },

  async updateUserRole(userId: string, input: UpdateUserRoleInput, actorRole: Role) {
    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) throw new AppError("Người dùng không tồn tại", 404, "NOT_FOUND");
    const rolePriority: Record<UserRole, number> = {
      Partner_Cashier: 1,
      Partner_Owner: 2,
      Customer: 1,
      Admin: 3,
    };
    if (rolePriority[input.role as UserRole] > rolePriority[actorRole as UserRole]) {
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

    return prisma.user.update({
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
    if (input.search) {
      where.OR = [
        { companyName: { contains: input.search, mode: "insensitive" } },
        { taxCode: { contains: input.search, mode: "insensitive" } },
      ];
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

  async approvePartner(partnerId: number, input: ApprovePartnerInput, actorId: string) {
    const partner = await prisma.partner.findUnique({ where: { partnerId } });
    if (!partner) throw new AppError("Đối tác không tồn tại", 404, "NOT_FOUND");
    if (partner.status === "Approved") {
      throw new AppError("Đối tác đã được duyệt trước đó", 400, "ALREADY_APPROVED");
    }
    if (partner.status === "Rejected") {
      throw new AppError("Đối tác đã bị từ chối. Không thể duyệt lại.", 400, "CANNOT_APPROVE_REJECTED");
    }

    return prisma.partner.update({
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
  },

  async rejectPartner(partnerId: number, input: RejectPartnerInput, actorId: string) {
    const partner = await prisma.partner.findUnique({ where: { partnerId } });
    if (!partner) throw new AppError("Đối tác không tồn tại", 404, "NOT_FOUND");
    if (partner.status === "Rejected") {
      throw new AppError("Đối tác đã bị từ chối trước đó", 400, "ALREADY_REJECTED");
    }
    if (partner.status === "Approved") {
      throw new AppError("Đối tác đã được duyệt. Không thể từ chối.", 400, "CANNOT_REJECT_APPROVED");
    }

    return prisma.partner.update({
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
  },

  async togglePartnerLock(partnerId: number, input: TogglePartnerLockInput) {
    const partner = await prisma.partner.findUnique({ where: { partnerId } });
    if (!partner) throw new AppError("Đối tác không tồn tại", 404, "NOT_FOUND");

    return prisma.partner.update({
      where: { partnerId },
      data: { isLocked: input.locked },
      select: {
        partnerId: true,
        companyName: true,
        taxCode: true,
        status: true,
        isLocked: true,
        updatedAt: true,
      },
    });
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

  async createBranch(partnerId: number, input: CreateBranchInput) {
    const partner = await prisma.partner.findUnique({ where: { partnerId } });
    if (!partner) throw new AppError("Đối tác không tồn tại", 404, "NOT_FOUND");

    return prisma.branch.create({
      data: { partnerId, ...input },
      select: {
        branchId: true,
        branchName: true,
        address: true,
        phoneNumber: true,
        isLocked: true,
        createdAt: true,
      },
    });
  },

  async updateBranch(partnerId: number, branchId: number, input: UpdateBranchInput) {
    const branch = await prisma.branch.findUnique({ where: { branchId, partnerId } });
    if (!branch) throw new AppError("Chi nhánh không tồn tại", 404, "NOT_FOUND");

    return prisma.branch.update({
      where: { branchId },
      data: input,
      select: {
        branchId: true,
        branchName: true,
        address: true,
        phoneNumber: true,
        isLocked: true,
        updatedAt: true,
      },
    });
  },

  async deleteBranch(partnerId: number, branchId: number) {
    const branch = await prisma.branch.findUnique({ where: { branchId, partnerId } });
    if (!branch) throw new AppError("Chi nhánh không tồn tại", 404, "NOT_FOUND");

    // Check for active issued vouchers at this branch
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

    await prisma.branch.delete({ where: { branchId } });
    return { branchId, deletedAt: new Date() };
  },

  async toggleBranchLock(partnerId: number, branchId: number, input: ToggleBranchLockInput) {
    const branch = await prisma.branch.findUnique({ where: { branchId, partnerId } });
    if (!branch) throw new AppError("Chi nhánh không tồn tại", 404, "NOT_FOUND");

    return prisma.branch.update({
      where: { branchId },
      data: { isLocked: input.locked },
      select: {
        branchId: true,
        branchName: true,
        address: true,
        isLocked: true,
        updatedAt: true,
      },
    });
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

    return buildPaginated(categories, total, page, limit);
  },

  async getCategoryById(categoryId: number) {
    const category = await prisma.category.findUnique({
      where: { categoryId },
      select: {
        categoryId: true,
        categoryName: true,
        description: true,
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
    return category;
  },

  async createCategory(input: CreateCategoryInput) {
    const existing = await prisma.category.findFirst({
      where: { categoryName: input.categoryName },
    });
    if (existing) {
      throw new AppError("Tên danh mục đã tồn tại", 409, "CATEGORY_EXISTS");
    }

    return prisma.category.create({
      data: input,
      select: { categoryId: true, categoryName: true, description: true },
    });
  },

  async updateCategory(categoryId: number, input: UpdateCategoryInput) {
    const category = await prisma.category.findUnique({ where: { categoryId } });
    if (!category) throw new AppError("Danh mục không tồn tại", 404, "NOT_FOUND");

    if (input.categoryName && input.categoryName !== category.categoryName) {
      const duplicate = await prisma.category.findFirst({
        where: { categoryName: input.categoryName },
      });
      if (duplicate) {
        throw new AppError("Tên danh mục đã tồn tại", 409, "CATEGORY_EXISTS");
      }
    }

    return prisma.category.update({
      where: { categoryId },
      data: input,
      select: { categoryId: true, categoryName: true, description: true, updatedAt: true },
    });
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

    await prisma.category.delete({ where: { categoryId } });
    return { categoryId, deletedAt: new Date() };
  },

  // ─── Voucher Management ─────────────────────────────────────────────────────

  async listVouchers(input: ListVouchersInput) {
    const { page, limit, skip } = getPagination({ page: input.page, limit: input.limit });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (input.search) {
      where.OR = [
        { title: { contains: input.search, mode: "insensitive" } },
        { description: { contains: input.search, mode: "insensitive" } },
      ];
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

  async approveVoucher(voucherId: number, input: ApproveVoucherInput) {
    const voucher = await prisma.voucher.findUnique({ where: { voucherId } });
    if (!voucher) throw new AppError("Voucher không tồn tại", 404, "NOT_FOUND");
    if (voucher.approvalStatus === "Approved") {
      throw new AppError("Voucher đã được duyệt trước đó", 400, "ALREADY_APPROVED");
    }
    if (voucher.approvalStatus === "Rejected") {
      throw new AppError("Voucher đã bị từ chối. Không thể duyệt lại.", 400, "CANNOT_APPROVE_REJECTED");
    }

    return prisma.voucher.update({
      where: { voucherId },
      data: { approvalStatus: "Approved" },
      select: {
        voucherId: true,
        title: true,
        approvalStatus: true,
        displayStatus: true,
        updatedAt: true,
      },
    });
  },

  async rejectVoucher(voucherId: number, input: RejectVoucherInput) {
    const voucher = await prisma.voucher.findUnique({ where: { voucherId } });
    if (!voucher) throw new AppError("Voucher không tồn tại", 404, "NOT_FOUND");
    if (voucher.approvalStatus === "Rejected") {
      throw new AppError("Voucher đã bị từ chối trước đó", 400, "ALREADY_REJECTED");
    }
    if (voucher.approvalStatus === "Approved") {
      throw new AppError("Voucher đã được duyệt. Không thể từ chối.", 400, "CANNOT_REJECT_APPROVED");
    }

    return prisma.voucher.update({
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
  ) {
    const voucher = await prisma.voucher.findUnique({ where: { voucherId } });
    if (!voucher) throw new AppError("Voucher không tồn tại", 404, "NOT_FOUND");

    return prisma.voucher.update({
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
    return prisma.policy.upsert({
      where: { title: input.title },
      create: { title: input.title, content: input.content },
      update: { title: input.title, content: input.content },
      select: {
        policyId: true,
        title: true,
        content: true,
        updatedAt: true,
      },
    });
  },
};
