import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middlewares/errorHandler";
import authRouter from "./modules/auth/auth.routes";
import partnerRouter from "./modules/partners/partner.routes";
import adminUsersRouter from "./modules/admin/users/admin-users.routes";
import voucherRouter from "./modules/customer/vouchers/vouchers.routes";
import categoryRouter from "./modules/customer/categories/categories.routes";

const app = express();

// ── Security ──────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

// Rate limit cho auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 20,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT",
      message: "Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút",
    },
  },
});
app.use("/api/auth", authLimiter);

// ── Routes ────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/partner", partnerRouter);
app.use("/api/admin/users", adminUsersRouter);
app.use("/api/vouchers", voucherRouter);
app.use("/api/categories", categoryRouter);

// Nhân sẽ thêm:  app.use('/api/customer', customerRouter);
// Bảo sẽ thêm:   app.use('/api/admin', adminRouter);

// Health check — test kết nối Supabase
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    data: { status: "ok", timestamp: new Date().toISOString() },
  });
});

// ── Error Handler (phải ở cuối) ───────────────────────────
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
