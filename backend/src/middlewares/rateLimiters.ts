import rateLimit from "express-rate-limit";

const buildLimiter = (windowMs: number, max: number, messageStr: string) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: messageStr,
      },
    },
  });

/**
 * 1. Auth Sensitive Limiter (Login, Register, Forgot Password, Reset Password, Verify OTP)
 * Hạn mức: 10 requests / 15 phút
 */
export const authSensitiveLimiter = buildLimiter(
  15 * 60 * 1000,
  10,
  "Bạn đã gửi quá nhiều yêu cầu xác thực. Vui lòng thử lại sau 15 phút.",
);

/**
 * 2. Redemption Limiter (Validate & Confirm mã voucher tại chi nhánh)
 * Hạn mức: 30 requests / 1 phút
 */
export const redemptionLimiter = buildLimiter(
  1 * 60 * 1000,
  30,
  "Thao tác quét/xác nhận mã quá dồn dập. Vui lòng thử lại sau 1 phút.",
);

/**
 * 3. Checkout & Payment Limiter (Tạo đơn hàng, Thanh toán, Tạo URL VNPAY)
 * Hạn mức: 20 requests / 1 phút
 */
export const checkoutLimiter = buildLimiter(
  1 * 60 * 1000,
  20,
  "Thao tác đặt hàng/thanh toán quá nhanh. Vui lòng thử lại sau ít phút.",
);

/**
 * 4. Content Write Limiter (Đánh giá, Gửi phản hồi/khiếu nại)
 * Hạn mức: 15 requests / 15 phút
 */
export const contentWriteLimiter = buildLimiter(
  15 * 60 * 1000,
  15,
  "Bạn đã gửi đánh giá/phản hồi quá nhiều lần. Vui lòng thử lại sau 15 phút.",
);

/**
 * 5. General Read Limiter (Trang chủ, Tìm kiếm, Danh mục, Tra cứu public)
 * Hạn mức: 200 requests / 1 phút
 */
export const generalLimiter = buildLimiter(
  1 * 60 * 1000,
  200,
  "Hệ thống nhận quá nhiều yêu cầu truy cập từ IP của bạn. Vui lòng thử lại sau ít phút.",
);
