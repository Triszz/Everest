import rateLimit from "express-rate-limit";

// ── Rate Limit Messages ───────────────────────────────────────────────────────
const RATE_LIMIT_MESSAGES = {
  auth: {
    code: "RATE_LIMIT_AUTH",
    message: "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
  },
  login: {
    code: "RATE_LIMIT_LOGIN",
    message: "Quá nhiều lần đăng nhập. Vui lòng thử lại sau 15 phút.",
  },
  register: {
    code: "RATE_LIMIT_REGISTER",
    message: "Quá nhiều lần đăng ký. Vui lòng thử lại sau 15 phút.",
  },
  forgotPassword: {
    code: "RATE_LIMIT_FORGOT_PASSWORD",
    message: "Quá nhiều yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau 15 phút.",
  },
  feedback: {
    code: "RATE_LIMIT_FEEDBACK",
    message: "Quá nhiều lần gửi đánh giá. Vui lòng thử lại sau.",
  },
  orders: {
    code: "RATE_LIMIT_ORDERS",
    message: "Quá nhiều yêu cầu tạo đơn hàng. Vui lòng thử lại sau.",
  },
  claimVoucher: {
    code: "RATE_LIMIT_CLAIM",
    message: "Quá nhiều yêu cầu nhận voucher. Vui lòng thử lại sau.",
  },
  customer: {
    code: "RATE_LIMIT_CUSTOMER",
    message: "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
  },
};

// ── General Auth Rate Limit ───────────────────────────────────────────────────
// Áp dụng cho tất cả /api/auth/*
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: RATE_LIMIT_MESSAGES.auth,
  },
});

// ── Login Rate Limit ───────────────────────────────────────────────────────────
// Áp dụng cho /api/auth/login
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // 5 lần đăng nhập
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: RATE_LIMIT_MESSAGES.login,
  },
  skipSuccessfulRequests: false, // Vẫn đếm cả request thành công để chống brute force
});

// ── Register Rate Limit ────────────────────────────────────────────────────────
// Áp dụng cho /api/auth/register
export const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 3, // 3 lần đăng ký
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: RATE_LIMIT_MESSAGES.register,
  },
});

// ── Forgot Password Rate Limit ────────────────────────────────────────────────
// Áp dụng cho /api/auth/forgot-password
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 3, // 3 lần request
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: RATE_LIMIT_MESSAGES.forgotPassword,
  },
});

// ── Feedback Rate Limit ────────────────────────────────────────────────────────
// Áp dụng cho /api/feedback (public submit)
export const feedbackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 5, // 5 lần gửi feedback
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: RATE_LIMIT_MESSAGES.feedback,
  },
});

// ── Orders Rate Limit ──────────────────────────────────────────────────────────
// Áp dụng cho /api/customer/orders
export const ordersLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 10, // 10 lần tạo đơn
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: RATE_LIMIT_MESSAGES.orders,
  },
});

// ── Voucher Claim Rate Limit ──────────────────────────────────────────────────
// Áp dụng cho /api/customer/issued-vouchers/claim
export const claimVoucherLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 20, // 20 lần claim
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: RATE_LIMIT_MESSAGES.claimVoucher,
  },
});

// ── General Customer Rate Limit ───────────────────────────────────────────────
// Áp dụng cho tất cả /api/customer/*
export const customerLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 100, // 100 request/phút
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: RATE_LIMIT_MESSAGES.customer,
  },
});
