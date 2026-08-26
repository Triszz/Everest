import "dotenv/config";
import express from "express";
import cors from "cors";
import type { CorsOptions } from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middlewares/errorHandler";
import { requestLogger } from "./middlewares/requestLogger";

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
import feedbackRouter, { feedbackAdminRouter } from "./modules/customer/feedback/feedback.routes";
import paymentRouter from "./modules/customer/payment/payment.routes";
import { startExpirySweeper } from "./modules/customer/orders/orders.expiry";

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());

const CORS_ORIGINS = (
  [
    process.env.ADMIN_URL,
    process.env.PARTNER_URL,
    process.env.STAFF_URL,
    process.env.USER_URL,
  ].filter((v): v is string => Boolean(v))
);

// Nếu không có URL nào được cấu hình (dev thường gặp khi mới deploy
// hoặc quên set .env) → fallback cho phép tất cả localhost origins
// để không chặn dev. Production BẮT BUỘC set đủ biến môi trường.
const corsOriginConfig: CorsOptions['origin'] =
  CORS_ORIGINS.length > 0
    ? (origin, cb) => {
        // Cho phép request không có Origin (curl, Postman) hoặc origin hợp lệ
        if (!origin || CORS_ORIGINS.includes(origin)) {
          cb(null, true);
          return;
        }
        cb(new Error(`CORS: origin "${origin}" not allowed`));
      }
    : true; // không whitelist → cors lib nhận mọi origin

app.use(
  cors({
    origin: corsOriginConfig,
    credentials: true,
  }),
);
// app.use(
//   cors({
//     origin: true,
//     credentials: true,
//   }),
// );
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
import { generalLimiter } from "./middlewares/rateLimiters";

// ── Rate Limiter ─────────────────────────────────────────────────────────────
app.use("/api", generalLimiter);

// ── Request Logging ───────────────────────────────────────────────────────────
app.use(requestLogger);

// ── Routes ───────────────────────────────────────────────────────────────────

// Auth
app.use("/api/auth", authRouter);

// Partner
app.use("/api/partner", partnerRouter);

// Admin (base)
app.use("/api/admin", adminRouter);

// Customer — public content
app.use("/api/vouchers", voucherRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/banners", bannerRouter);
app.use("/api/popups", popupRouter);
app.use("/api/posts", postRouter);

// Customer — authenticated
app.use("/api/cart", cartRouter);
app.use("/api/customer/profile", profileRouter);
app.use("/api/customer/orders", ordersRouter);
app.use("/api/customer/payment", paymentRouter);
app.use("/api/customer/issued-vouchers", issuedVouchersRouter);
app.use("/api/customer/vouchers", reviewsRouter); // reviews GET + POST
app.use("/api/customer/notifications", notificationsRouter);

// Feedback — public (submit) + admin
app.use("/api/feedback", feedbackRouter);
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
  startExpirySweeper();
});

export default app;
