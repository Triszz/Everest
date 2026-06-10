import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middlewares/errorHandler";

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
// Health check — test kết nối Supabase
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    data: { status: "ok", timestamp: new Date().toISOString() },
  });
});

// TODO: Thêm routes từng module khi làm
// app.use('/api/auth', authRouter);
// app.use('/api/partner', authenticate, roleGuard('PARTNER'), partnerRouter);

// ── Error Handler (phải ở cuối) ───────────────────────────
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
