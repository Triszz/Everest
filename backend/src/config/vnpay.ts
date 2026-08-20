/**
 * VNPAY Configuration — chỗ duy nhất cần thay đổi khi đổi merchant.
 *
 * Mọi giá trị liên quan VNPAY (tmnCode, hashSecret, URLs…)
 * đều đọc từ .env để dễ chuyển đổi giữa sandbox / production.
 *
 * Ví dụ .env:
 *   VNP_TMN_CODE="YOUR_TMN_CODE"
 *   VNP_HASH_SECRET="YOUR_HASH_SECRET"
 *   VNP_RETURN_URL="https://yourdomain.com/payment/return"
 *   VNP_IPN_URL="https://api.yourdomain.com/api/customer/payment/ipn"
 *   VNP_URL="https://sandbox.vnpayment.vn"     # sandbox
 *   # VNP_URL="https://vnpay.vn"                # production
 */
import { HashAlgorithm } from "vnpay";

export const vnpayConfig = {
  /** Mã merchant VNPAY cấp (vnp_TmnCode). */
  tmnCode: process.env.VNP_TMN_CODE || "",

  /** Hash secret để ký/verify callback (vnp_HashSecret). */
  hashSecret: process.env.VNP_HASH_SECRET || "",

  /** Host VNPAY. Sandbox: https://sandbox.vnpayment.vn | Production: https://vnpay.vn */
  vnpayHost: process.env.VNP_URL || "https://sandbox.vnpayment.vn",

  /** URL user quay về trình duyệt (frontend). */
  returnUrl: process.env.VNP_RETURN_URL || "http://localhost:5173/payment/return",

  /** URL VNPAY gọi server-to-server (webhook). Phải public từ internet khi production. */
  ipnUrl: process.env.VNP_IPN_URL || "http://localhost:3000/api/customer/payment/ipn",

  /** true = sandbox, false = production. Tự detect qua VNP_URL. */
  testMode: process.env.VNP_URL?.includes("sandbox") ?? true,

  /** Thuật toán hash VNPAY yêu cầu (mặc định SHA512 — kiểm tra trên portal merchant). */
  hashAlgorithm: HashAlgorithm.SHA512,

  /** Thời gian hết hạn payment URL (phút). Mặc định 15 phút. */
  expireMinutes: 15,
};

/**
 * Validate đủ config ngay khi import — fail-fast nếu thiếu thông tin.
 */
export function validateVnpayConfig(): void {
  const missing: string[] = [];
  if (!vnpayConfig.tmnCode) missing.push("VNP_TMN_CODE");
  if (!vnpayConfig.hashSecret) missing.push("VNP_HASH_SECRET");
  if (!vnpayConfig.returnUrl) missing.push("VNP_RETURN_URL");
  if (!vnpayConfig.ipnUrl) missing.push("VNP_IPN_URL");

  if (missing.length > 0) {
    console.warn(
      `[vnpay config] Thiếu biến môi trường: ${missing.join(", ")}\n` +
      `Vui lòng thêm vào .env. Tham khảo: https://sandbox.vnpayment.vn/apis`,
    );
  }
}
