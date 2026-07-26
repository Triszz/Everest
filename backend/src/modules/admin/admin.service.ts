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
} from "./admin.schemas";
import type { BannerStatus, PostStatus, PopupStatus } from "../../generated/prisma/enums";
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

  async deletePolicy(policyId: number) {
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
    return prisma.banner.create({
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
  },

  async updateBanner(bannerId: number, input: UpdateBannerInput) {
    const banner = await prisma.banner.findUnique({ where: { bannerId } });
    if (!banner) throw new AppError("Banner không tồn tại", 404, "NOT_FOUND");

    return prisma.banner.update({
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
  },

  async updateBannerStatus(bannerId: number, input: UpdateBannerStatusInput) {
    const banner = await prisma.banner.findUnique({ where: { bannerId } });
    if (!banner) throw new AppError("Banner không tồn tại", 404, "NOT_FOUND");

    const nextStatus = input.status as BannerStatus;

    // Visibility is a single-active-banner constraint:
    // - Switching to Visible => every other banner must be Hidden.
    // - Switching to Hidden  => leave the others untouched.
    if (nextStatus === "Visible") {
      await prisma.banner.updateMany({
        where: { bannerId: { not: bannerId } },
        data: { status: "Hidden" },
      });
    }

    return prisma.banner.update({
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
  },

  async deleteBanner(bannerId: number) {
    const banner = await prisma.banner.findUnique({ where: { bannerId } });
    if (!banner) throw new AppError("Banner không tồn tại", 404, "NOT_FOUND");
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
    return prisma.popup.create({
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
  },

  async updatePopup(popupId: number, input: UpdatePopupInput) {
    const popup = await prisma.popup.findUnique({ where: { popupId } });
    if (!popup) throw new AppError("Popup không tồn tại", 404, "NOT_FOUND");

    return prisma.popup.update({
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
  },

  async updatePopupStatus(popupId: number, input: UpdatePopupStatusInput) {
    const popup = await prisma.popup.findUnique({ where: { popupId } });
    if (!popup) throw new AppError("Popup không tồn tại", 404, "NOT_FOUND");

    const nextStatus = input.status as PopupStatus;

    // Single-active-popup pattern (same as banner).
    if (nextStatus === "Visible") {
      await prisma.popup.updateMany({
        where: { popupId: { not: popupId } },
        data: { status: "Hidden" },
      });
    }

    return prisma.popup.update({
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
  },

  async deletePopup(popupId: number) {
    const popup = await prisma.popup.findUnique({ where: { popupId } });
    if (!popup) throw new AppError("Popup không tồn tại", 404, "NOT_FOUND");
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
        orderBy: [{ status: "asc" }, { publishedAt: "desc" }, { updatedAt: "desc" }],
        select: {
          postId: true,
          authorId: true,
          title: true,
          content: true,
          imageUrl: true,
          status: true,
          publishedAt: true,
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
        publishedAt: true,
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
    return prisma.post.create({
      data: {
        authorId,
        title: input.title,
        content: input.content,
        imageUrl: input.imageUrl ?? null,
        status,
        publishedAt: status === "Visible" ? new Date() : null,
      },
      select: {
        postId: true,
        authorId: true,
        title: true,
        content: true,
        imageUrl: true,
        status: true,
        publishedAt: true,
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
  },

  async updatePost(postId: number, input: UpdatePostInput) {
    const post = await prisma.post.findUnique({ where: { postId } });
    if (!post) throw new AppError("Bài viết không tồn tại", 404, "NOT_FOUND");

    return prisma.post.update({
      where: { postId },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.content !== undefined ? { content: input.content } : {}),
        ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
      },
      select: {
        postId: true,
        authorId: true,
        title: true,
        content: true,
        imageUrl: true,
        status: true,
        publishedAt: true,
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
  },

  async updatePostStatus(postId: number, input: UpdatePostStatusInput) {
    const post = await prisma.post.findUnique({ where: { postId } });
    if (!post) throw new AppError("Bài viết không tồn tại", 404, "NOT_FOUND");

    const nextStatus = input.status as PostStatus;
    const shouldStampPublishedAt =
      nextStatus === "Visible" && post.publishedAt === null;

    return prisma.post.update({
      where: { postId },
      data: {
        status: nextStatus,
        ...(shouldStampPublishedAt ? { publishedAt: new Date() } : {}),
      },
      select: {
        postId: true,
        authorId: true,
        title: true,
        content: true,
        imageUrl: true,
        status: true,
        publishedAt: true,
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
  },

  async deletePost(postId: number) {
    const post = await prisma.post.findUnique({ where: { postId } });
    if (!post) throw new AppError("Bài viết không tồn tại", 404, "NOT_FOUND");
    await prisma.post.delete({ where: { postId } });
    return { deleted: true, postId, deletedAt: new Date() };
  },
};
