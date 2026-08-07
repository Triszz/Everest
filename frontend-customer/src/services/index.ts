/**
 * services/index.ts (Barrel)
 * ------------------------------------------------------------------
 * Re-export toàn bộ API modules + types cho tiện dùng.
 *
 * Cách dùng:
 *   import { voucherApi, authApi } from "../services";
 *   import type { Voucher, User } from "../services";
 *
 * Backwards-compat: giữ nguyên tất cả tên export từ file `api.ts` cũ
 * để không phải sửa từng trang.
 * ------------------------------------------------------------------
 */

// ── API modules ─────────────────────────────────────────────────────
export { voucherApi, categoryApi, partnerApi } from "./voucherApi";
export { cartApi } from "./cartApi";
export { orderApi } from "./orderApi";
export { authApi } from "./authApi";
export { profileApi } from "./profileApi";
export { reviewApi } from "./reviewApi";
export { bannerApi, popupApi, postApi } from "./contentApi";
export { feedbackApi } from "./feedbackApi";

// ── HTTP helpers ────────────────────────────────────────────────────
export {
  authFetch,
  handleResponse,
  buildQuery,
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  ApiResponseError,
  BASE_URL,
} from "./http";

// ── Shared types ────────────────────────────────────────────────────
export type {
  PaginationMeta,
  Voucher,
  VoucherQuery,
  CategoryVoucherQuery,
  Review,
  ReviewPayload,
  Category,
  Partner,
  Banner,
  Popup,
  Post,
  CartVoucher,
  CartItem,
  Cart,
  User,
  AuthResponse,
  MeResponse,
  IssuedVoucher,
  IssuedVoucherStatus,
  OrderItem,
  OrderDetail,
  OrderSummary,
  CreateOrderPayload,
  CreateOrderResponse,
  CheckoutResponse,
  FeedbackPayload,
  FeedbackSubmitResponse,
} from "./types";
export type { ApiError } from "./http";