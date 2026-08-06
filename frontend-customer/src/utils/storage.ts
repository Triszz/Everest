/**
 * utils/storage.ts
 * ------------------------------------------------------------------
 * Wrapper quản lý localStorage với type-safety + error handling.
 *
 * Lưu ý: token access/refresh được quản lý qua `services/http.ts`
 * (xem `getAccessToken`, `setTokens`, `clearTokens`).
 * File này phục vụ các key khác (user info, giỏ hàng offline, UI prefs, ...).
 */

export const storage = {
  /** Đọc giá trị JSON từ localStorage. Trả về fallback nếu không tồn tại / parse lỗi. */
  get<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },

  /** Ghi giá trị JSON xuống localStorage. */
  set<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`[storage.set] Failed to write "${key}":`, err);
    }
  },

  /** Xoá key khỏi localStorage. */
  remove(key: string): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.warn(`[storage.remove] Failed to remove "${key}":`, err);
    }
  },
};

/** Hằng số các key thường dùng trong customer app. */
export const STORAGE_KEYS = {
  USER: "everest_user",
  CART_DRAFT: "everest_cart_draft",
  THEME: "everest_theme",
  LANGUAGE: "everest_language",
} as const;