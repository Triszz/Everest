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
import { emailOtpService } from "./email-otp.service";

const SALT_ROUNDS = 12;

type AuthUser = {
  userId: string;
  email: string;
  role: string;
  partnerId: number | null;
};

type PartnerAccessContext = {
  branchId?: number;
};

async function assertPartnerAccess(
  user: AuthUser,
): Promise<PartnerAccessContext> {
  /*
   * Admin và Customer không cần kiểm tra partner.
   */
  if (
    user.role !== "Partner_Owner" &&
    user.role !== "Partner_Cashier"
  ) {
    return {};
  }

  /*
   * Cả Owner và Cashier đều bắt buộc phải liên kết với partner.
   */
  if (user.partnerId == null) {
    throw new AppError(
      "Tài khoản chưa được liên kết với đối tác",
      403,
      "PARTNER_NOT_LINKED",
    );
  }

  const partner = await prisma.partner.findUnique({
    where: {
      partnerId: user.partnerId,
    },
    select: {
      partnerId: true,
      status: true,
      isLocked: true,
    },
  });

  /*
   * partnerId có trong user nhưng bản ghi partner không còn tồn tại.
   */
  if (!partner) {
    throw new AppError(
      "Không tìm thấy thông tin đối tác",
      403,
      "PARTNER_NOT_FOUND",
    );
  }

  /*
   * Phân biệt rõ Pending và Rejected để frontend hiển thị đúng thông báo.
   */
  if (partner.status === "Pending") {
    throw new AppError(
      "Tài khoản đối tác đang chờ Admin phê duyệt",
      403,
      "PARTNER_PENDING",
    );
  }

  if (partner.status === "Rejected") {
    throw new AppError(
      "Tài khoản đối tác đã bị từ chối",
      403,
      "PARTNER_REJECTED",
    );
  }

  /*
   * Phòng trường hợp sau này enum có thêm trạng thái khác.
   */
  if (partner.status !== "Approved") {
    throw new AppError(
      "Đối tác chưa được phép hoạt động",
      403,
      "PARTNER_NOT_APPROVED",
    );
  }

  /*
   * Đối tác đã Approved nhưng bị Admin khóa.
   */
  if (partner.isLocked) {
    throw new AppError(
      "Tài khoản đối tác đang bị khóa",
      403,
      "PARTNER_LOCKED",
    );
  }

  /*
   * Owner không cần chi nhánh khi đăng nhập.
   */
  if (user.role === "Partner_Owner") {
    return {};
  }

  /*
   * Từ đây trở xuống chỉ áp dụng cho Partner_Cashier.
   *
   * cashierId có @unique trong Prisma nên dùng findUnique được.
   */
  const branch = await prisma.branch.findUnique({
    where: {
      cashierId: user.userId,
    },
    select: {
      branchId: true,
      partnerId: true,
      isLocked: true,
    },
  });

  /*
   * Cashier đã bị gỡ khỏi branch hoặc chưa từng được phân công.
   */
  if (!branch) {
    throw new AppError(
      "Thu ngân chưa được phân công chi nhánh",
      403,
      "CASHIER_NOT_ASSIGNED",
    );
  }

  /*
   * Kiểm tra phòng trường hợp dữ liệu bị liên kết sai:
   * user thuộc partner A nhưng branch lại thuộc partner B.
   */
  if (branch.partnerId !== user.partnerId) {
    throw new AppError(
      "Chi nhánh không thuộc đối tác của thu ngân",
      403,
      "CASHIER_PARTNER_MISMATCH",
    );
  }

  /*
   * Branch bị Admin hoặc Owner khóa.
   */
  if (branch.isLocked) {
    throw new AppError(
      "Chi nhánh đang bị khóa",
      403,
      "BRANCH_LOCKED",
    );
  }

  return {
    branchId: branch.branchId,
  };
}

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
async function buildPayload(
  user: AuthUser,
  sessionId?: string,
  branchId?: number,
): Promise<JwtPayload> {
  const payload: JwtPayload = {
    userId: user.userId,
    email: user.email,
    role: user.role as Role,
    ...(user.partnerId != null && {
      partnerId: user.partnerId,
    }),
    ...(sessionId && {
      sessionId,
    }),
  };

  /*
   * Cashier bắt buộc phải có branchId.
   * branchId đã được kiểm tra bởi assertPartnerAccess().
   */
  if (user.role === "Partner_Cashier") {
    if (branchId == null) {
      throw new AppError(
        "Thu ngân chưa được phân công chi nhánh",
        403,
        "CASHIER_NOT_ASSIGNED",
      );
    }

    payload.branchId = branchId;
  }

  return payload;
}

// ── Auth Service ───────────────────────────────────────────────────────────

export const authService = {
  async login(input: LoginInput) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: input.email },
          { phoneNumber: input.email },
        ],
      },
      select: {
        userId: true,
        email: true,
        passwordHash: true,
        fullName: true,
        role: true,
        status: true,
        partnerId: true,
        emailVerified: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new AppError("Email/Số điện thoại hoặc mật khẩu không đúng", 401, "UNAUTHORIZED");
    }
    if (user.status !== "Active") {
      throw new AppError("Tài khoản đã bị khóa", 403, "FORBIDDEN");
    }

    // Customer bắt buộc verify email trước khi đăng nhập.
    // Admin và Partner (Owner/Cashier) có thể được admin tạo trực tiếp nên không bắt buộc.
    if (user.role === "Customer" && !user.emailVerified) {
      throw new AppError(
        "Vui lòng xác thực email trước khi đăng nhập. Kiểm tra hộp thư để nhận mã OTP.",
        403,
        "EMAIL_NOT_VERIFIED",
      );
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid)
      throw new AppError("Email hoặc mật khẩu không đúng", 401, "UNAUTHORIZED");

        // Nếu Partner_Owner: partner status phải Approved
    const partnerAccess = await assertPartnerAccess(user);


    const session = await prisma.userSession.create({
      data: {
        userId: user.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const payload = await buildPayload(
  user,
  session.sessionId,
  partnerAccess.branchId,
);

    return {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(user.userId),
      sessionId: session.sessionId,
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
      select: {
        userId: true,
        email: true,
        phoneNumber: true,
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
        emailVerified: false, // chờ OTP verify
      },
    });

    // Gửi OTP verify (fail throw nhẹ không chặn register — user vẫn có thể bấm resend)
    try {
      await emailOtpService.sendOtp(
        user.email,
        "REGISTER_VERIFY",
        undefined,
        user.userId,
        input.otpChannel || "email",
      );
    } catch (err) {
      console.error("[registerCustomer] Gửi OTP thất bại:", err);
    }

    // Không cấp token ngay — user phải verify OTP mới login được.
    return {
      user: {
        userId: user.userId,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
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
        select: {
          userId: true,
          email: true,
          phoneNumber: true,
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
    decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET!,
    ) as {
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
    where: {
      userId: decoded.userId,
    },
    select: {
      userId: true,
      email: true,
      role: true,
      status: true,
      partnerId: true,
      emailVerified: true,
    },
  });

  /*
   * Không cấp access token mới nếu user không tồn tại
   * hoặc tài khoản không còn ở trạng thái Active.
   */
  if (!user || user.status !== "Active") {
    throw new AppError(
      "Không thể làm mới phiên đăng nhập",
      401,
      "UNAUTHORIZED",
    );
  }

  // Customer chưa verify email thì không cấp token mới
  if (user.role === "Customer" && !user.emailVerified) {
    throw new AppError(
      "Vui lòng xác thực email trước khi tiếp tục sử dụng.",
      403,
      "EMAIL_NOT_VERIFIED",
    );
  }

  /*
   * Admin và Customer nhận {}.
   *
   * Partner Owner:
   * - Partner phải Approved
   * - Partner không bị khóa
   *
   * Partner Cashier:
   * - Partner hợp lệ
   * - Cashier còn được gán chi nhánh
   * - Chi nhánh không bị khóa
   */
  const partnerAccess = await assertPartnerAccess(user);

  /*
   * Cashier cần branchId trong access token mới.
   */
  const payload = await buildPayload(
    user,
    undefined,
    partnerAccess.branchId,
  );

  return {
    accessToken: signAccessToken(payload),
  };
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
    const user = await prisma.user.findUnique({
      where: { userId },
      select: { userId: true, passwordHash: true },
    });
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
        select: {
          userId: true,
          phoneNumber: true,
        },
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

  async listSessions(userId: string) {
    const sessions = await prisma.userSession.findMany({
      where: { userId, revokedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        sessionId: true,
        deviceType: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    return sessions.map((s) => ({
      id: s.sessionId,
      device: s.deviceType || "Unknown",
      browser: s.userAgent || "Unknown",
      ip: s.ipAddress || "Unknown",
      location: s.ipAddress ? "Việt Nam" : "Unknown",
      lastActive: s.createdAt,
      expiresAt: s.expiresAt,
    }));
  },

  async revokeSession(userId: string, sessionId: string) {
    const session = await prisma.userSession.findFirst({
      where: { sessionId, userId, revokedAt: null },
    });

    if (!session) {
      throw new AppError("Phiên không tồn tại", 404, "SESSION_NOT_FOUND");
    }

    await prisma.userSession.update({
      where: { sessionId },
      data: { revokedAt: new Date() },
    });

    return { message: "Đăng xuất thiết bị thành công" };
  },

  async revokeAllOtherSessions(userId: string, exceptSessionId?: string) {
    await prisma.userSession.updateMany({
      where: {
        userId,
        revokedAt: null,
        ...(exceptSessionId ? { sessionId: { not: exceptSessionId } } : {}),
      },
      data: { revokedAt: new Date() },
    });

    return { message: "Đăng xuất tất cả thiết bị khác thành công" };
  },
};
