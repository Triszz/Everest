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

/**
 * BR-CUS-03: Filter theo khu vực - Danh sách 63 tỉnh thành Việt Nam
 * Format: value là tên tỉnh/thành phố để match với branch.address
 */
export const AREA_OPTIONS = [
  { label: "Tất cả khu vực", value: "" },
  { label: "TP. Hồ Chí Minh", value: "Hồ Chí Minh" },
  { label: "Hà Nội", value: "Hà Nội" },
  { label: "Đà Nẵng", value: "Đà Nẵng" },
  { label: "Hải Phòng", value: "Hải Phòng" },
  { label: "Cần Thơ", value: "Cần Thơ" },
  { label: "An Giang", value: "An Giang" },
  { label: "Bà Rịa - Vũng Tàu", value: "Bà Rịa - Vũng Tàu" },
  { label: "Bắc Giang", value: "Bắc Giang" },
  { label: "Bắc Kạn", value: "Bắc Kạn" },
  { label: "Bạc Liêu", value: "Bạc Liêu" },
  { label: "Bắc Ninh", value: "Bắc Ninh" },
  { label: "Bến Tre", value: "Bến Tre" },
  { label: "Bình Định", value: "Bình Định" },
  { label: "Bình Dương", value: "Bình Dương" },
  { label: "Bình Phước", value: "Bình Phước" },
  { label: "Bình Thuận", value: "Bình Thuận" },
  { label: "Cà Mau", value: "Cà Mau" },
  { label: "Cao Bằng", value: "Cao Bằng" },
  { label: "Đắk Lắk", value: "Đắk Lắk" },
  { label: "Đắk Nông", value: "Đắk Nông" },
  { label: "Điện Biên", value: "Điện Biên" },
  { label: "Đồng Nai", value: "Đồng Nai" },
  { label: "Đồng Tháp", value: "Đồng Tháp" },
  { label: "Gia Lai", value: "Gia Lai" },
  { label: "Hà Giang", value: "Hà Giang" },
  { label: "Hà Nam", value: "Hà Nam" },
  { label: "Hà Tĩnh", value: "Hà Tĩnh" },
  { label: "Hậu Giang", value: "Hậu Giang" },
  { label: "Hòa Bình", value: "Hòa Bình" },
  { label: "Hưng Yên", value: "Hưng Yên" },
  { label: "Khánh Hòa", value: "Khánh Hòa" },
  { label: "Kiên Giang", value: "Kiên Giang" },
  { label: "Kon Tum", value: "Kon Tum" },
  { label: "Lai Châu", value: "Lai Châu" },
  { label: "Lâm Đồng", value: "Lâm Đồng" },
  { label: "Lạng Sơn", value: "Lạng Sơn" },
  { label: "Lào Cai", value: "Lào Cai" },
  { label: "Long An", value: "Long An" },
  { label: "Nam Định", value: "Nam Định" },
  { label: "Nghệ An", value: "Nghệ An" },
  { label: "Ninh Bình", value: "Ninh Bình" },
  { label: "Ninh Thuận", value: "Ninh Thuận" },
  { label: "Phú Thọ", value: "Phú Thọ" },
  { label: "Phú Yên", value: "Phú Yên" },
  { label: "Quảng Bình", value: "Quảng Bình" },
  { label: "Quảng Nam", value: "Quảng Nam" },
  { label: "Quảng Ngãi", value: "Quảng Ngãi" },
  { label: "Quảng Ninh", value: "Quảng Ninh" },
  { label: "Quảng Trị", value: "Quảng Trị" },
  { label: "Sóc Trăng", value: "Sóc Trăng" },
  { label: "Sơn La", value: "Sơn La" },
  { label: "Tây Ninh", value: "Tây Ninh" },
  { label: "Thái Bình", value: "Thái Bình" },
  { label: "Thái Nguyên", value: "Thái Nguyên" },
  { label: "Thanh Hóa", value: "Thanh Hóa" },
  { label: "Thừa Thiên Huế", value: "Thừa Thiên Huế" },
  { label: "Tiền Giang", value: "Tiền Giang" },
  { label: "Trà Vinh", value: "Trà Vinh" },
  { label: "Tuyên Quang", value: "Tuyên Quang" },
  { label: "Vĩnh Long", value: "Vĩnh Long" },
  { label: "Vĩnh Phúc", value: "Vĩnh Phúc" },
  { label: "Yên Bái", value: "Yên Bái" },
] as const;

/**
 * BR-CUS-03: Filter theo trạng thái hiệu lực của voucher
 * - "all": Tất cả voucher đang bán
 * - "available": Còn hàng (available_quantity > 0)
 * - "selling": Đang trong thời gian bán (start_date <= now <= end_date)
 * - "expiring_soon": Sắp hết hạn (còn ≤ 3 ngày)
 */
export const VALIDITY_OPTIONS = [
  { label: "Tất cả", value: "" },
  { label: "Còn hàng", value: "available" },
  { label: "Đang bán", value: "selling" },
  { label: "Sắp hết hạn", value: "expiring_soon" },
] as const;

/** Các page size phổ biến cho pagination. */
export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;