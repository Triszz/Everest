/**
 * QR Code helpers — tạo QR code SVG thật (quét được bằng camera)
 * dùng thư viện `qrcode` (https://www.npmjs.com/package/qrcode)
 *
 * Trước đây dùng fake pattern (không scan được) — giờ dùng QR chuẩn ISO/IEC 18004.
 */
import QRCode from "qrcode";

const QR_OPTS = {
  type: "svg" as const,
  margin: 1,
  color: {
    dark: "#1E293B",
    light: "#FFFFFF",
  },
  errorCorrectionLevel: "M" as const,
};

/** Tạo QR SVG string cho 1 mã code. */
export async function buildQRString(code: string, size = 120): Promise<string> {
  return QRCode.toString(code, { ...QR_OPTS, width: size });
}

/** Tạo QR data URL (image/svg+xml) sẵn để gán vào `<img src>`. */
export async function buildQRDataURL(code: string, size = 120): Promise<string> {
  const svg = await buildQRString(code, size);
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

/** QR lớn (modal chi tiết). */
export async function buildQRLargeDataURL(code: string): Promise<string> {
  return buildQRDataURL(code, 200);
}