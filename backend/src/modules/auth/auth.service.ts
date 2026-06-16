import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middlewares/errorHandler";
import type { JwtPayload, Role } from "../../shared/types";
import type {
  LoginInput,
  RegisterCustomerInput,
  RegisterPartnerInput,
} from "./auth.schemas";

const SALT_ROUNDS = 12;

// ── Token helpers ──────────────────────────────────────────────────────────

const signAccessToken = (payload: JwtPayload) =>
  jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn:
      (process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]) || "15m",
  });

const signRefreshToken = (userId: string) =>
  jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn:
      (process.env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"]) ||
      "7d",
  });

/** Build JWT payload, enrich branchId nếu là cashier */
async function buildPayload(user: {
  userId: string;
  email: string;
  role: string;
  partnerId: number | null;
}): Promise<JwtPayload> {
  const payload: JwtPayload = {
    userId: user.userId,
    email: user.email,
    role: user.role as Role,
    ...(user.partnerId != null && { partnerId: user.partnerId }),
  };

  if (user.role === "Partner_Cashier") {
    const branch = await prisma.branch.findUnique({
      where: { cashierId: user.userId },
      select: { branchId: true },
    });
    if (branch) payload.branchId = branch.branchId;
  }

  return payload;
}

// ── Auth Service ───────────────────────────────────────────────────────────

export const authService = {
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user || !user.passwordHash) {
      throw new AppError("Email hoặc mật khẩu không đúng", 401, "UNAUTHORIZED");
    }
    if (user.status === "Banned") {
      throw new AppError("Tài khoản đã bị khóa", 403, "FORBIDDEN");
    }
    if (user.status === "Inactive") {
      throw new AppError("Tài khoản chưa được kích hoạt", 403, "FORBIDDEN");
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid)
      throw new AppError("Email hoặc mật khẩu không đúng", 401, "UNAUTHORIZED");

    // Nếu Partner_Owner: partner status phải Approved
    if (user.role === "Partner_Owner" && user.partnerId) {
      const partner = await prisma.partner.findUnique({
        where: { partnerId: user.partnerId },
        select: { status: true },
      });
      if (partner?.status === "Pending") {
        throw new AppError(
          "Tài khoản đối tác đang chờ Admin phê duyệt",
          403,
          "FORBIDDEN",
        );
      }
      if (partner?.status === "Rejected") {
        throw new AppError("Tài khoản đối tác đã bị từ chối", 403, "FORBIDDEN");
      }
    }

    const payload = await buildPayload(user);

    return {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(user.userId),
      user: {
        userId: user.userId,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        partnerId: user.partnerId,
      },
    };
  },

  async registerCustomer(input: RegisterCustomerInput) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: input.email },
          ...(input.phoneNumber ? [{ phoneNumber: input.phoneNumber }] : []),
        ],
      },
    });

    if (existing) {
      const field = existing.email === input.email ? "Email" : "Số điện thoại";
      throw new AppError(`${field} đã được sử dụng`, 409, "CONFLICT");
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        fullName: input.fullName,
        phoneNumber: input.phoneNumber,
        role: "Customer",
        status: "Active",
      },
    });

    const payload: JwtPayload = {
      userId: user.userId,
      email: user.email,
      role: "Customer",
    };

    return {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(user.userId),
      user: {
        userId: user.userId,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
      },
    };
  },

  async registerPartner(input: RegisterPartnerInput) {
    const [existingUser, existingPartner] = await Promise.all([
      prisma.user.findFirst({
        where: {
          OR: [
            { email: input.email },
            ...(input.phoneNumber ? [{ phoneNumber: input.phoneNumber }] : []),
          ],
        },
      }),
      prisma.partner.findUnique({ where: { taxCode: input.taxCode } }),
    ]);

    if (existingUser) {
      const field =
        existingUser.email === input.email ? "Email" : "Số điện thoại";
      throw new AppError(`${field} đã được sử dụng`, 409, "CONFLICT");
    }
    if (existingPartner) {
      throw new AppError("Mã số thuế đã được đăng ký", 409, "CONFLICT");
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    // Transaction: tạo user → partner → link partnerId
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email,
          passwordHash,
          fullName: input.fullName,
          phoneNumber: input.phoneNumber,
          role: "Partner_Owner",
          status: "Active",
        },
      });

      const partner = await tx.partner.create({
        data: {
          companyName: input.companyName,
          taxCode: input.taxCode,
          businessLicenseUrl: input.businessLicenseUrl,
          status: "Pending",
        },
      });

      const linked = await tx.user.update({
        where: { userId: user.userId },
        data: { partnerId: partner.partnerId },
      });

      return { user: linked, partner };
    });

    // Không trả token → partner phải chờ Admin duyệt mới login được
    return {
      user: {
        userId: result.user.userId,
        email: result.user.email,
        fullName: result.user.fullName,
        partnerId: result.user.partnerId,
      },
      partner: {
        partnerId: result.partner.partnerId,
        companyName: result.partner.companyName,
        status: result.partner.status,
      },
    };
  },

  async refreshAccessToken(token: string) {
    let decoded: { userId: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as {
        userId: string;
      };
    } catch {
      throw new AppError(
        "Refresh token không hợp lệ hoặc đã hết hạn",
        401,
        "UNAUTHORIZED",
      );
    }

    const user = await prisma.user.findUnique({
      where: { userId: decoded.userId },
    });
    if (!user || user.status === "Banned") {
      throw new AppError(
        "Không thể làm mới phiên đăng nhập",
        401,
        "UNAUTHORIZED",
      );
    }

    const payload = await buildPayload(user);
    return { accessToken: signAccessToken(payload) };
  },

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        email: true,
        phoneNumber: true,
        fullName: true,
        role: true,
        status: true,
        partnerId: true,
        createdAt: true,
      },
    });
    if (!user) throw new AppError("Người dùng không tồn tại", 404, "NOT_FOUND");
    return user;
  },

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user?.passwordHash)
      throw new AppError("Người dùng không tồn tại", 404, "NOT_FOUND");

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid)
      throw new AppError(
        "Mật khẩu hiện tại không đúng",
        400,
        "VALIDATION_ERROR",
      );

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { userId },
      data: { passwordHash: newHash },
    });
  },

  async updateProfile(
    userId: string,
    data: { fullName?: string; phoneNumber?: string | null },
  ) {
    if (data.phoneNumber) {
      const existing = await prisma.user.findFirst({
        where: { phoneNumber: data.phoneNumber, NOT: { userId } },
      });
      if (existing)
        throw new AppError("Số điện thoại đã được sử dụng", 409, "CONFLICT");
    }
    return prisma.user.update({
      where: { userId },
      data,
      select: {
        userId: true,
        email: true,
        phoneNumber: true,
        fullName: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });
  },
};
