import { prisma } from "../../../config/prisma";
import { AppError } from "../../../middlewares/errorHandler";
import type { AccountStatus, Role } from "../../../shared/types";
import type {
  ListUsersInput,
  UpdateUserStatusInput,
  UpdateUserRoleInput,
} from "./admin-users.schemas";
import { buildPaginated, getPagination } from "../../../shared/utils/paginate";

export const adminUsersService = {
  async list(input: ListUsersInput) {
    const { page, limit, skip } = getPagination({
      page: input.page,
      limit: input.limit,
    });

    const where: Parameters<typeof prisma.user.findMany>[0]["where"] = {};
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

  async getById(userId: string) {
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

  async updateStatus(userId: string, input: UpdateUserStatusInput) {
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

  async updateRole(userId: string, input: UpdateUserRoleInput, actorRole: Role) {
    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) throw new AppError("Người dùng không tồn tại", 404, "NOT_FOUND");

    if (user.role === "Admin" || input.role === "Admin") {
      throw new AppError("Không thể gán hoặc thay đổi vai trò Admin", 403, "FORBIDDEN");
    }

    // Không cho phép grant quyền cao hơn actor
    const rolePriority: Record<Role, number> = {
      Partner_Cashier: 1,
      Partner_Owner: 2,
      Customer: 1,
      Admin: 3,
    };
    if (rolePriority[input.role] > rolePriority[actorRole]) {
      throw new AppError("Không thể phân quyền cao hơn vai trò của bạn", 403, "FORBIDDEN");
    }

    // Nếu gán Partner_Owner hoặc Partner_Cashier thì cần có partnerId
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
};
