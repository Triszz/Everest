/**
 * utils/constants.ts
 * ------------------------------------------------------------------
 * Hằng số dùng chung trong customer app: filter options, sort options, areas.
 */

export const DISCOUNT_OPTIONS = [
  { label: "Tất cả", value: "" },
  { label: "Giảm ≥ 10%", value: "10" },
  { label: "Giảm ≥ 20%", value: "20" },
  { label: "Giảm ≥ 30%", value: "30" },
  { label: "Giảm ≥ 50%", value: "50" },
] as const;

export const PRICE_OPTIONS = [
  { label: "Tất cả mức giá", value: "" },
  { label: "Dưới 50.000đ", value: "0-50000" },
  { label: "50.000đ – 100.000đ", value: "50000-100000" },
  { label: "100.000đ – 200.000đ", value: "100000-200000" },
  { label: "Trên 200.000đ", value: "200000-999999999" },
] as const;

export const SORT_OPTIONS = [
  { label: "Mới nhất", value: "newest" },
  { label: "Phổ biến nhất", value: "popular" },
  { label: "Giá: Thấp → Cao", value: "price_asc" },
  { label: "Giá: Cao → Thấp", value: "price_desc" },
] as const;

/** BR-CUS-03: Filter theo khu vực (so khớp với `address` của branch). */
export const AREA_OPTIONS = [
  { label: "Tất cả khu vực", value: "" },
  { label: "TP. Hồ Chí Minh", value: "Hồ Chí Minh" },
  { label: "Hà Nội", value: "Hà Nội" },
  { label: "Đà Nẵng", value: "Đà Nẵng" },
  { label: "Cần Thơ", value: "Cần Thơ" },
  { label: "Hải Phòng", value: "Hải Phòng" },
  { label: "Biên Hòa", value: "Biên Hòa" },
  { label: "Nha Trang", value: "Nha Trang" },
] as const;

/** Các page size phổ biến cho pagination. */
export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;