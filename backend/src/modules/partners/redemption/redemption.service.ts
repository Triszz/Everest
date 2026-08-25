/**
 * Redemption Service
 * ------------------------------------------------
 * Chứa business logic cho Validate và Confirm API.
 * KHÔNG chứa HTTP handling (đó là controller).
 *
 * Nguyên tắc:
 * - Tất cả business logic nằm trong service
 * - Validate KHÔNG thay đổi database
 * - Confirm tái sử dụng validateVoucherForRedemption() rồi update trong transaction
 */

import { prisma } from "../../../config/prisma";
import { AppError } from "../../../middlewares/errorHandler";
import {
  RedemptionStatus,
  type ValidateVoucherResult,
  type ValidatedVoucherData,
  type AuthContext,
  type BranchInfo,
} from "./redemption.schemas";

// ============================================================
// VALIDATE
// ============================================================

/**
 * Kiểm tra voucher có thể xác nhận sử dụng hay không.
 * Dùng chung cho cả Validate API và Confirm API (Phase 5).
 *
 * THỨ TỰ KIỂM TRA (stop-on-first-fail):
 *  1. Format voucherCode hợp lệ?
 *  2. IssuedVoucher tồn tại?
 *  3. Voucher thuộc Partner đang đăng nhập?
 *  4. Voucher Approved?
 *  5. Voucher Visible?
 *  6. validFrom đã tới?
 *  7. validTo còn hạn?
 *  8. IssuedVoucher status = Used?
 *  9. IssuedVoucher status = Locked?
 * 10. Order Paid?
 * 11. Branch hợp lệ? (Owner: mọi branch; Cashier: branch trong VoucherBranch)
 *
 * @param voucherCode - mã voucher cần kiểm tra (đã normalized)
 * @param auth - context từ JWT
 * @returns ValidateVoucherResult (chứa đầy đủ internal data cho Confirm)
 */
export async function validateVoucherForRedemption(
  voucherCode: string,
  auth: AuthContext,
): Promise<ValidateVoucherResult> {
  // 1. Format — đã normalized ở controller, nhưng vẫn check lại
  if (!voucherCode || voucherCode.length < 8) {
    return {
      isValid: false,
      status: RedemptionStatus.INVALID_CODE,
      message: "Mã voucher không hợp lệ",
    };
  }

  // 2. Tìm IssuedVoucher + eager load tất cả data cần thiết (branch đầy đủ)
  const issued = await prisma.issuedVoucher.findUnique({
    where: { voucherCode },
    include: {
      orderItem: {
        include: {
          order: {
            select: {
              paymentStatus: true,
              customerId: true,
              customer: { select: { fullName: true, email: true, phoneNumber: true } },
            },
          },
          voucher: {
            include: {
              partner: { select: { partnerId: true, companyName: true } },
              voucherBranches: {
                select: {
                  branch: {
                    select: { branchId: true, branchName: true, address: true, phoneNumber: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!issued) {
    return {
      isValid: false,
      status: RedemptionStatus.NOT_FOUND,
      message: "Không tìm thấy voucher với mã này",
    };
  }

  const voucher = issued.orderItem.voucher;
  const order = issued.orderItem.order;
  const partner = voucher.partner;
  const now = new Date();

  // 3. Voucher thuộc Partner đang đăng nhập?
  if (voucher.partnerId !== auth.partnerId) {
    return {
      isValid: false,
      status: RedemptionStatus.WRONG_PARTNER,
      message: "Voucher không thuộc đối tác của bạn",
    };
  }

  // 4. Voucher Approved?
  if (voucher.approvalStatus !== "Approved") {
    return {
      isValid: false,
      status: RedemptionStatus.NOT_APPROVED,
      message: "Voucher chưa được duyệt",
    };
  }

  // 5. Voucher Visible?
  if (voucher.displayStatus !== "Visible") {
    return {
      isValid: false,
      status: RedemptionStatus.NOT_VISIBLE,
      message: "Voucher đang không hiển thị",
    };
  }

  // 6. validFrom đã tới?
  if (issued.validFrom && now < issued.validFrom) {
    return {
      isValid: false,
      status: RedemptionStatus.NOT_STARTED,
      message: "Voucher chưa đến ngày bắt đầu hiệu lực",
    };
  }

  // 7. validTo còn hạn?
  if (issued.validTo && now > issued.validTo) {
    return {
      isValid: false,
      status: RedemptionStatus.EXPIRED,
      message: "Voucher đã hết hạn",
    };
  }

  // 8. IssuedVoucher status = Used?
  if (issued.status === "Used") {
    return {
      isValid: false,
      status: RedemptionStatus.ALREADY_USED,
      message: "Voucher đã được sử dụng",
    };
  }

  // 9. IssuedVoucher hoặc Voucher status = Locked?
  if (voucher.isLocked || issued.status === "Locked") {
    return {
      isValid: false,
      status: RedemptionStatus.LOCKED,
      message: "Voucher đang bị khóa bởi hệ thống và không thể sử dụng",
    };
  }

  // 10. Order Paid?
  if (order.paymentStatus !== "Paid") {
    return {
      isValid: false,
      status: RedemptionStatus.PAYMENT_PENDING,
      message: "Đơn hàng chưa được thanh toán",
    };
  }

  // 11. Branch hợp lệ?
  // Owner: được kiểm tra mọi voucher thuộc partner
  // Cashier: chỉ được kiểm tra voucher có branch của mình
  if (auth.role === "Partner_Cashier" && auth.branchId !== undefined) {
    const voucherBranchIds = voucher.voucherBranches.map((vb) => vb.branch.branchId);
    if (!voucherBranchIds.includes(auth.branchId)) {
      return {
        isValid: false,
        status: RedemptionStatus.WRONG_BRANCH,
        message: "Voucher không áp dụng tại chi nhánh này",
      };
    }
  }

  // ✅ Tất cả kiểm tra đều qua — voucher hợp lệ

  // Map branch đầy đủ
  const applicableBranches: BranchInfo[] = voucher.voucherBranches.map((vb) => ({
    branchId: vb.branch.branchId,
    branchName: vb.branch.branchName,
    address: vb.branch.address,
    phoneNumber: vb.branch.phoneNumber,
  }));

  const data: ValidatedVoucherData = {
    issuedVoucherId: issued.issuedVoucherId,
    voucherCode: issued.voucherCode,
    usageStatus: issued.status,
    validFrom: issued.validFrom.toISOString(),
    validTo: issued.validTo.toISOString(),
    usedAt: issued.usedAt ? issued.usedAt.toISOString() : null,
    voucher: {
      title: voucher.title,
      description: voucher.description,
      imageUrl: voucher.imageUrl,
      partnerName: partner.companyName,
    },
    applicableBranches,
    customer: {
      fullName: order.customer.fullName,
      email: order.customer.email,
      phoneNumber: order.customer.phoneNumber,
    },
  };

  return {
    isValid: true,
    status: RedemptionStatus.VALID,
    message: "Voucher hợp lệ",
    data,
    internal: {
      issued: {
        issuedVoucherId: issued.issuedVoucherId,
        voucherCode: issued.voucherCode,
        status: issued.status,
        validFrom: issued.validFrom,
        validTo: issued.validTo,
        usedAt: issued.usedAt,
        usedAtBranchId: issued.usedAtBranchId,
        orderItemId: issued.orderItemId,
      },
      voucher: {
        voucherId: voucher.voucherId,
        partnerId: voucher.partnerId,
        title: voucher.title,
        approvalStatus: voucher.approvalStatus,
        displayStatus: voucher.displayStatus,
        voucherBranches: applicableBranches,
      },
      partner: {
        partnerId: partner.partnerId,
        companyName: partner.companyName,
      },
      order: {
        paymentStatus: order.paymentStatus,
        customerId: order.customerId,
      },
      customer: {
        fullName: order.customer.fullName,
        email: order.customer.email,
        phoneNumber: order.customer.phoneNumber,
      },
    },
  };
}

// ============================================================
// GET DETAIL (any status, for History navigation)
// ============================================================

/**
 * Lấy voucher detail cho Partner — trả về đầy đủ data cho MỌI trạng thái
 * (Unused, Used, Locked, Expired). KHÔNG dùng để validate redemption.
 *
 * Mục đích: cho phép Partner xem chi tiết voucher đã sử dụng từ History,
 * mà không cần gọi validate (validate sẽ trả về ALREADY_USED error).
 *
 * @param voucherCode - mã voucher (đã normalized)
 * @param auth - context từ JWT
 * @returns ValidateVoucherResult — nếu success=true → data chứa đầy đủ info
 *                                   nếu success=false → status là NOT_FOUND/WRONG_PARTNER
 */
export async function getVoucherDetailForPartner(
  voucherCode: string,
  auth: AuthContext,
): Promise<ValidateVoucherResult> {
  // Tìm voucher
  const issued = await prisma.issuedVoucher.findUnique({
    where: { voucherCode },
    include: {
      orderItem: {
        include: {
          order: {
            select: {
              customerId: true,
              customer: { select: { fullName: true, email: true, phoneNumber: true } },
            },
          },
          voucher: {
            include: {
              partner: { select: { partnerId: true, companyName: true } },
              voucherBranches: {
                select: {
                  branch: {
                    select: { branchId: true, branchName: true, address: true, phoneNumber: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!issued) {
    return {
      isValid: false,
      status: RedemptionStatus.NOT_FOUND,
      message: "Không tìm thấy voucher với mã này",
    };
  }

  const voucher = issued.orderItem.voucher;
  const order = issued.orderItem.order;
  const partner = voucher.partner;

  // Ownership check: voucher phải thuộc Partner đang đăng nhập
  if (voucher.partnerId !== auth.partnerId) {
    return {
      isValid: false,
      status: RedemptionStatus.WRONG_PARTNER,
      message: "Voucher không thuộc đối tác của bạn",
    };
  }

  // Map branches
  const applicableBranches: BranchInfo[] = voucher.voucherBranches.map((vb) => ({
    branchId: vb.branch.branchId,
    branchName: vb.branch.branchName,
    address: vb.branch.address,
    phoneNumber: vb.branch.phoneNumber,
  }));

  const data: ValidatedVoucherData = {
    issuedVoucherId: issued.issuedVoucherId,
    voucherCode: issued.voucherCode,
    usageStatus: issued.status,
    validFrom: issued.validFrom.toISOString(),
    validTo: issued.validTo.toISOString(),
    usedAt: issued.usedAt ? issued.usedAt.toISOString() : null,
    voucher: {
      title: voucher.title,
      description: voucher.description,
      imageUrl: voucher.imageUrl,
      partnerName: partner.companyName,
    },
    applicableBranches,
    customer: {
      fullName: order.customer.fullName,
      email: order.customer.email,
      phoneNumber: order.customer.phoneNumber,
    },
  };

  return {
    isValid: true,
    status: RedemptionStatus.VALID,
    message: "Voucher found",
    data,
  };
}

// ============================================================
// CONFIRM
// ============================================================

/**
 * Xác nhận voucher đã được sử dụng.
 * Bắt buộc gọi validateVoucherForRedemption() trước.
 * Chạy trong transaction để đảm bảo atomicity.
 *
 * @param voucherCode - mã voucher (đã normalized)
 * @param auth - context từ JWT
 * @param selectedBranchId - branch được chọn (optional)
 * @returns ValidateVoucherResult (cùng format với validate)
 */
export async function confirmVoucher(
  voucherCode: string,
  auth: AuthContext,
  selectedBranchId?: number,
): Promise<ValidateVoucherResult> {
  // 1. BẮT BUỘC: validate trước
  const validateResult = await validateVoucherForRedemption(voucherCode, auth);

  // 2. Nếu validate fail → trả ngay
  if (!validateResult.isValid) {
    return validateResult;
  }

  // 3. Validate pass → xác định branchId để ghi
  if (!validateResult.internal) {
    throw new AppError("Internal error: missing validation data", 500, "INTERNAL_ERROR");
  }

  const internal = validateResult.internal;

  // Xác định branch confirm:
  // - Cashier: dùng auth.branchId (bắt buộc)
  // - Owner + selectedBranchId: dùng selectedBranchId nếu hợp lệ
  // - Owner + không selectedBranchId: dùng branch đầu tiên trong VoucherBranch
  let confirmBranchId: number;

  if (auth.role === "Partner_Cashier") {
    if (!auth.branchId) {
      return {
        isValid: false,
        status: RedemptionStatus.WRONG_BRANCH,
        message: "Không xác định được chi nhánh để xác nhận",
      };
    }
    confirmBranchId = auth.branchId;
  } else {
    // Owner
    if (selectedBranchId !== undefined) {
      // Kiểm tra selectedBranchId có trong VoucherBranch không
      const branchIds = internal.voucher.voucherBranches.map((b) => b.branchId);
      if (!branchIds.includes(selectedBranchId)) {
        return {
          isValid: false,
          status: RedemptionStatus.WRONG_BRANCH,
          message: "Chi nhánh được chọn không nằm trong danh sách áp dụng",
        };
      }
      confirmBranchId = selectedBranchId;
    } else {
      // Dùng branch đầu tiên
      if (internal.voucher.voucherBranches.length === 0) {
        return {
          isValid: false,
          status: RedemptionStatus.WRONG_BRANCH,
          message: "Voucher không có chi nhánh áp dụng",
        };
      }
      confirmBranchId = internal.voucher.voucherBranches[0].branchId;
    }
  }

  const usedAt = new Date();
  const customerId = internal.order.customerId;

  // 4. Chạy transaction: lock + check + update + audit
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 4a. Đọc lại trong transaction (prevent race condition)
      const current = await tx.issuedVoucher.findUnique({
        where: { voucherCode },
        select: {
          status: true,
          validFrom: true,
          validTo: true,
        },
      });

      if (!current) {
        throw new AppError("Voucher không tồn tại", 404, "NOT_FOUND");
      }

      // 4b. Kiểm tra lại trong transaction
      const now = new Date();

      if (current.status === "Used") {
        // Idempotency: đã used → không update, không audit, trả ALREADY_USED
        throw { isIdempotent: true, code: RedemptionStatus.ALREADY_USED };
      }

      if (current.status === "Locked") {
        throw { code: RedemptionStatus.LOCKED, message: "Voucher đang bị khóa" };
      }

      if (now > current.validTo) {
        throw { code: RedemptionStatus.EXPIRED, message: "Voucher đã hết hạn" };
      }

      if (now < current.validFrom) {
        throw { code: RedemptionStatus.NOT_STARTED, message: "Voucher chưa đến ngày bắt đầu" };
      }

      // 4c. Update IssuedVoucher (Atomic conditional update chống race condition - RB-07)
      const updatedCount = await tx.issuedVoucher.updateMany({
        where: {
          voucherCode,
          status: "Unused",
        },
        data: {
          status: "Used",
          usedAt,
          usedAtBranchId: confirmBranchId,
        },
      });

      if (updatedCount.count === 0) {
        throw { isIdempotent: true, code: RedemptionStatus.ALREADY_USED };
      }

      const updated = await tx.issuedVoucher.findUnique({
        where: { voucherCode },
        select: {
          issuedVoucherId: true,
          voucherCode: true,
          usedAt: true,
          usedAtBranchId: true,
        },
      });

      if (!updated) {
        throw new AppError("Voucher không tồn tại", 404, "NOT_FOUND");
      }

      return updated;
    });

    // 5. Thành công
    return {
      isValid: true,
      status: RedemptionStatus.CONFIRMED,
      message: "Xác nhận sử dụng voucher thành công",
      data: {
        issuedVoucherId: result.issuedVoucherId,
        voucherCode: result.voucherCode,
        usageStatus: "Used" as const,
        validFrom: internal.issued.validFrom.toISOString(),
        validTo: internal.issued.validTo.toISOString(),
        usedAt: result.usedAt ? result.usedAt.toISOString() : null,
        // Populate usedAtBranchId + usedAtBranchName để controller expose
        // cho client (trước đây controller đọc từ field không tồn tại → undefined).
        usedAtBranchId: result.usedAtBranchId,
        usedAtBranchName:
          internal.voucher.voucherBranches.find(
            (b) => b.branchId === result.usedAtBranchId,
          )?.branchName ?? null,
        voucher: {
          title: internal.voucher.title,
          description: null,
          imageUrl: null,
          partnerName: internal.partner.companyName,
        },
        applicableBranches: internal.voucher.voucherBranches,
        customer: {
          fullName: internal.customer.fullName,
          email: internal.customer.email,
          phoneNumber: internal.customer.phoneNumber,
        },
      },
    };
  } catch (err) {
    // Idempotency: đã Used → trả ALREADY_USED (không throw lên)
    if (err && typeof err === "object") {
      const e = err as { isIdempotent?: boolean; code?: string };
      if (e.isIdempotent && e.code === RedemptionStatus.ALREADY_USED) {
        return {
          isValid: false,
          status: RedemptionStatus.ALREADY_USED,
          message: "Voucher đã được sử dụng",
        };
      }
    }
    // Các lỗi khác → throw để controller xử lý
    if (err instanceof AppError) throw err;
    throw new AppError(
      (err as Error)?.message ?? "Lỗi xác nhận voucher",
      500,
      "CONFIRM_ERROR",
    );
  }
}
