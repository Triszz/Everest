import { prisma } from "../../config/prisma";
import { AppError } from "../../middlewares/errorHandler";
import type { AccountStatus, Role } from "../../shared/types";
import type { UserRole } from "../../generated/prisma/enums";
import type { PartnerStatus } from "../../generated/prisma/enums";
import type {
  ListUsersInput,
  UpdateUserStatusInput,
  UpdateUserRoleInput,
  ListPartnersInput,
  ApprovePartnerInput,
  RejectPartnerInput,
  TogglePartnerLockInput,
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

    if (user.role === "Admin" || input.role === "Admin") {
      throw new AppError("Không thể gán hoặc thay đổi vai trò Admin", 403, "FORBIDDEN");
    }

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
};
