import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middlewares/errorHandler";
import { requestLogger } from "./middlewares/requestLogger";
import {
  authLimiter,
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  feedbackLimiter,
  ordersLimiter,
  claimVoucherLimiter,
  customerLimiter,
} from "./middlewares/rateLimit";

// ── Auth ──────────────────────────────────────────────────────────────────────
import authRouter from "./modules/auth/auth.routes";

// ── Partner ──────────────────────────────────────────────────────────────────
import partnerRouter from "./modules/partners/partner.routes";

// ── Admin ───────────────────────────────────────────────────────────────────
import adminRouter from "./modules/admin/admin.routes";

// ── Customer modules ──────────────────────────────────────────────────────────
import voucherRouter from "./modules/customer/vouchers/vouchers.routes";
import categoryRouter from "./modules/customer/categories/categories.routes";
import bannerRouter from "./modules/customer/banners/banners.routes";
import popupRouter from "./modules/customer/popups/popups.routes";
import postRouter from "./modules/customer/posts/posts.routes";
import cartRouter from "./modules/customer/cart/cart.routes";
import ordersRouter from "./modules/customer/orders/orders.routes";
import issuedVouchersRouter from "./modules/customer/issued-vouchers/issued-vouchers.routes";
import reviewsRouter from "./modules/customer/reviews/reviews.routes";
import profileRouter from "./modules/customer/profile/profile.routes";
import notificationsRouter from "./modules/customer/notifications/notifications.routes";
import feedbackRouter, {
  feedbackAdminRouter,
} from "./modules/customer/feedback/feedback.routes";
import paymentRouter from "./modules/customer/payment/payment.routes";

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
    ],
    credentials: true,
  }),
);
// ── Body parsers ──────────────────────────────────────────────
// Default Express limit is 100 KB which is far too small for our
// base64 image uploads. Allow up to 10 MB per request, well above
// the frontend's 5 MB per-image limit (5 MB binary ≈ 6.7 MB base64).
const MAX_JSON_BODY = "10mb";

app.use(express.json({ limit: MAX_JSON_BODY }));
app.use(
  express.urlencoded({
    extended: true,
    limit: MAX_JSON_BODY,
  }),
);
// ── Request Logging ───────────────────────────────────────────────────────────
app.use(requestLogger);

// ── Routes ───────────────────────────────────────────────────────────────────

// Auth — với rate limit riêng cho từng endpoint
app.use("/api/auth", authLimiter, authRouter);

// Partner
app.use("/api/partner", partnerRouter);

// Admin (base)
app.use("/api/admin", adminRouter);

// Customer — public content (không cần rate limit vì read-only)
app.use("/api/vouchers", voucherRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/banners", bannerRouter);
app.use("/api/popups", popupRouter);
app.use("/api/posts", postRouter);

// Customer — authenticated với rate limit chung
app.use("/api/cart", customerLimiter, cartRouter);
app.use("/api/customer/profile", customerLimiter, profileRouter);
app.use("/api/customer/orders", ordersLimiter, ordersRouter);
app.use("/api/customer/payment", customerLimiter, paymentRouter);
app.use("/api/customer/issued-vouchers", customerLimiter, issuedVouchersRouter);
app.use("/api/customer/vouchers", customerLimiter, reviewsRouter); // reviews GET + POST
app.use("/api/customer/notifications", customerLimiter, notificationsRouter);

// Feedback — public (submit) với rate limit
app.use("/api/feedback", feedbackLimiter, feedbackRouter);
app.use("/api/admin/feedback", feedbackAdminRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    data: { status: "ok", timestamp: new Date().toISOString() },
  });
});

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;