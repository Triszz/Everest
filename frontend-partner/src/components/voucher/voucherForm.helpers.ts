// ── Design tokens (matching Customer) ───────────────────────────────────────
export const VOUCHER_FORM_COLORS = {
  primary: '#0E76A8',
  primaryHover: '#0A5C87',
  text: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  bgPage: '#F8FAFC',
  error: '#EF4444',
  success: '#10B981',
} as const;

export const VOUCHER_LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontFamily: 'Inter, sans-serif',
  fontSize: 14,
  fontWeight: 600,
  color: VOUCHER_FORM_COLORS.text,
  marginBottom: 8,
};

export const VOUCHER_INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: `1.5px solid ${VOUCHER_FORM_COLORS.border}`,
  borderRadius: 10,
  fontSize: 14,
  fontFamily: 'Inter, sans-serif',
  color: VOUCHER_FORM_COLORS.text,
  background: VOUCHER_FORM_COLORS.bgPage,
  outline: 'none',
  transition: 'border-color 0.2s',
};

export const VOUCHER_INPUT_ERROR_STYLE: React.CSSProperties = {
  ...VOUCHER_INPUT_STYLE,
  borderColor: VOUCHER_FORM_COLORS.error,
};

export const VOUCHER_ERROR_TEXT: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 12,
  color: VOUCHER_FORM_COLORS.error,
  marginTop: 4,
};

export const VOUCHER_HELP_TEXT: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 12,
  color: VOUCHER_FORM_COLORS.textMuted,
  marginTop: 4,
};

// ── Form data shape ─────────────────────────────────────────────────────────
export interface VoucherFormData {
  title: string;
  description: string;
  categoryId: string; // string for select, convert to number on submit
  originalPrice: string;
  salePrice: string;
  totalQuantity: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  expiryDays: string;
  applicationCondition: string;
  branchIds: number[];
}

export type VoucherFormErrors = Partial<Record<keyof VoucherFormData | 'general', string>>;

// ── Image upload limits ─────────────────────────────────────────────────────
// Mirrors the limits enforced by the backend JSON body parser so we can
// validate client-side before submitting. Keep in sync with
// `express.json({ limit: '10mb' })` in backend/src/app.ts.
// 5 MB binary ≈ 6.7 MB base64 — well below the 10 MB request limit, even
// with all the other voucher fields around it.
export const VOUCHER_IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const VOUCHER_IMAGE_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const VOUCHER_IMAGE_ALLOWED_LABEL = 'JPG, JPEG, PNG, WEBP';

// ── Default values ──────────────────────────────────────────────────────────
export const EMPTY_FORM: VoucherFormData = {
  title: '',
  description: '',
  categoryId: '',
  originalPrice: '',
  salePrice: '',
  totalQuantity: '',
  imageUrl: '',
  startDate: '',
  endDate: '',
  expiryDays: '',
  applicationCondition: '',
  branchIds: [],
};

// ── Validation (matching backend schemas exactly) ───────────────────────────
export function validateVoucherForm(data: VoucherFormData): VoucherFormErrors {
  const errors: VoucherFormErrors = {};

  // Title — min 5
  if (!data.title.trim()) {
    errors.title = 'Tên voucher không được để trống';
  } else if (data.title.trim().length < 5) {
    errors.title = 'Tên voucher ít nhất 5 ký tự';
  }

  // Category — required
  if (!data.categoryId) {
    errors.categoryId = 'Vui lòng chọn danh mục';
  }

  // Original price — positive
  const origPrice = Number(data.originalPrice);
  if (!data.originalPrice) {
    errors.originalPrice = 'Giá gốc không được để trống';
  } else if (isNaN(origPrice) || origPrice <= 0) {
    errors.originalPrice = 'Giá gốc phải lớn hơn 0';
  }

  // Sale price — positive, < original
  const salePrice = Number(data.salePrice);
  if (!data.salePrice) {
    errors.salePrice = 'Giá bán không được để trống';
  } else if (isNaN(salePrice) || salePrice <= 0) {
    errors.salePrice = 'Giá bán phải lớn hơn 0';
  } else if (origPrice > 0 && salePrice >= origPrice) {
    errors.salePrice = 'Giá bán phải nhỏ hơn giá gốc';
  }

  // Total quantity — positive integer
  const qty = Number(data.totalQuantity);
  if (!data.totalQuantity) {
    errors.totalQuantity = 'Số lượng không được để trống';
  } else if (isNaN(qty) || !Number.isInteger(qty) || qty <= 0) {
    errors.totalQuantity = 'Số lượng phải là số nguyên dương';
  }

  // Image URL — optional, validate format if provided
  if (data.imageUrl.trim()) {
    try {
      new URL(data.imageUrl);
    } catch {
      errors.imageUrl = 'URL ảnh không hợp lệ (ví dụ: https://...)';
    }
  }

  // Start date — required
  if (!data.startDate) {
    errors.startDate = 'Ngày bắt đầu không được để trống';
  }

  // End date — required, > start date
  if (!data.endDate) {
    errors.endDate = 'Ngày kết thúc không được để trống';
  } else if (data.startDate && new Date(data.endDate) <= new Date(data.startDate)) {
    errors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
  }

  // Expiry days — positive integer
  const expDays = Number(data.expiryDays);
  if (!data.expiryDays) {
    errors.expiryDays = 'Số ngày hiệu lực không được để trống';
  } else if (isNaN(expDays) || !Number.isInteger(expDays) || expDays <= 0) {
    errors.expiryDays = 'Số ngày hiệu lực phải là số nguyên dương';
  }

  // Branches — required, ≥ 1 (BR-PAR-02)
  // Voucher phải gán với ít nhất 1 chi nhánh của partner.
  if (!data.branchIds || data.branchIds.length === 0) {
    errors.branchIds = 'Vui lòng chọn ít nhất 1 chi nhánh áp dụng voucher';
  }

  return errors;
}

// ── Build API payload ───────────────────────────────────────────────────────
export function buildPayload(data: VoucherFormData): Record<string, unknown> {
  return {
    title: data.title.trim(),
    description: data.description.trim() || undefined,
    categoryId: Number(data.categoryId),
    originalPrice: Number(data.originalPrice),
    salePrice: Number(data.salePrice),
    totalQuantity: Number(data.totalQuantity),
    imageUrl: data.imageUrl.trim() || undefined,
    startDate: new Date(data.startDate).toISOString(),
    endDate: new Date(data.endDate).toISOString(),
    expiryDays: Number(data.expiryDays),
    applicationCondition: data.applicationCondition.trim() || undefined,
    branchIds: data.branchIds,
  };
}