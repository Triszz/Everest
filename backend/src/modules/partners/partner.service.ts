import bcrypt from "bcrypt";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middlewares/errorHandler";

export const partnerService = {
  // ── Profile ──────────────────────────────────────────────────

  async getProfile(partnerId: number) {
    const partner = await prisma.partner.findUnique({
      where: { partnerId },
      include: {
        branches: {
          select: {
            branchId: true,
            branchName: true,
            address: true,
            phoneNumber: true,
            cashier: { select: { userId: true, fullName: true, email: true } },
          },
          orderBy: { branchId: "asc" },
        },
        _count: { select: { vouchers: true } },
      },
    });

    if (!partner)
      throw new AppError("Không tìm thấy thông tin đối tác", 404, "NOT_FOUND");
    return partner;
  },

  async updateProfile(
    partnerId: number,
    data: { companyName?: string; businessLicenseUrl?: string | null },
  ) {
    const partner = await prisma.partner.findUnique({ where: { partnerId } });
    if (!partner)
      throw new AppError("Không tìm thấy đối tác", 404, "NOT_FOUND");

    return prisma.partner.update({ where: { partnerId }, data });
  },

  // ── Branches ─────────────────────────────────────────────────

  async listBranches(partnerId: number) {
    return prisma.branch.findMany({
      where: { partnerId },
      include: {
        cashier: { select: { userId: true, fullName: true, email: true } },
        _count: { select: { voucherBranches: true } },
      },
      orderBy: { branchId: "asc" },
    });
  },

  async getBranch(branchId: number, partnerId: number) {
    const branch = await prisma.branch.findFirst({
      where: { branchId, partnerId },
      include: {
        cashier: { select: { userId: true, fullName: true, email: true } },
        voucherBranches: {
          include: {
            voucher: {
              select: {
                voucherId: true,
                title: true,
                approvalStatus: true,
                displayStatus: true,
              },
            },
          },
        },
      },
    });

    if (!branch)
      throw new AppError("Không tìm thấy chi nhánh", 404, "NOT_FOUND");
    return branch;
  },

  async createBranch(
    partnerId: number,
    data: { branchName: string; address: string; phoneNumber?: string },
  ) {
    return prisma.branch.create({ data: { ...data, partnerId } });
  },

  async updateBranch(
    branchId: number,
    partnerId: number,
    data: {
      branchName?: string;
      address?: string;
      phoneNumber?: string | null;
    },
  ) {
    const branch = await prisma.branch.findFirst({
      where: { branchId, partnerId },
    });
    if (!branch)
      throw new AppError("Không tìm thấy chi nhánh", 404, "NOT_FOUND");

    return prisma.branch.update({ where: { branchId }, data });
  },

  async deleteBranch(branchId: number, partnerId: number) {
    const branch = await prisma.branch.findFirst({
      where: { branchId, partnerId },
    });
    if (!branch)
      throw new AppError("Không tìm thấy chi nhánh", 404, "NOT_FOUND");

    // Không xóa nếu có issued voucher chưa dùng tại chi nhánh này
    const hasActive = await prisma.issuedVoucher.findFirst({
      where: { usedAtBranchId: branchId, status: "Unused" },
    });
    if (hasActive) {
      throw new AppError(
        "Chi nhánh còn voucher chưa sử dụng, không thể xóa",
        409,
        "CONFLICT",
      );
    }

    await prisma.branch.delete({ where: { branchId } });
  },

  // ── Cashier Management ───────────────────────────────────────

  async assignCashier(
    branchId: number,
    partnerId: number,
    cashierEmail: string,
  ) {
    const [branch, cashier] = await Promise.all([
      prisma.branch.findFirst({ where: { branchId, partnerId } }),
      prisma.user.findUnique({ where: { email: cashierEmail } }),
    ]);

    if (!branch)
      throw new AppError("Không tìm thấy chi nhánh", 404, "NOT_FOUND");
    if (!cashier)
      throw new AppError(
        "Không tìm thấy người dùng với email này",
        404,
        "NOT_FOUND",
      );
    if (cashier.role !== "Partner_Cashier") {
      throw new AppError(
        "Người dùng này không có vai trò Thu ngân",
        400,
        "VALIDATION_ERROR",
      );
    }
    if (cashier.partnerId !== partnerId) {
      throw new AppError(
        "Thu ngân không thuộc đối tác của bạn",
        403,
        "FORBIDDEN",
      );
    }

    // Kiểm tra cashier đang quản lý chi nhánh khác
    const currentBranch = await prisma.branch.findUnique({
      where: { cashierId: cashier.userId },
    });
    if (currentBranch && currentBranch.branchId !== branchId) {
      throw new AppError(
        `Thu ngân đang quản lý chi nhánh "${currentBranch.branchName}"`,
        409,
        "CONFLICT",
      );
    }

    return prisma.branch.update({
      where: { branchId },
      data: { cashierId: cashier.userId },
      include: {
        cashier: { select: { userId: true, fullName: true, email: true } },
      },
    });
  },

  async removeCashier(branchId: number, partnerId: number) {
    const branch = await prisma.branch.findFirst({
      where: { branchId, partnerId },
    });
    if (!branch)
      throw new AppError("Không tìm thấy chi nhánh", 404, "NOT_FOUND");
    if (!branch.cashierId)
      throw new AppError("Chi nhánh chưa có thu ngân", 400, "VALIDATION_ERROR");

    return prisma.branch.update({
      where: { branchId },
      data: { cashierId: null },
    });
  },

  async createCashierAccount(
    partnerId: number,
    data: {
      email: string;
      password: string;
      fullName: string;
      phoneNumber?: string;
    },
  ) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          ...(data.phoneNumber ? [{ phoneNumber: data.phoneNumber }] : []),
        ],
      },
    });
    if (existing) {
      const field = existing.email === data.email ? "Email" : "Số điện thoại";
      throw new AppError(`${field} đã được sử dụng`, 409, "CONFLICT");
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        role: "Partner_Cashier",
        status: "Active",
        partnerId,
      },
      select: {
        userId: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        partnerId: true,
      },
    });
  },
};
