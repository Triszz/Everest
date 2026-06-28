import { useState, useEffect } from 'react';
import type { Category } from '../../services/category.service';
import type { Branch } from '../../services/branch.service';
import { apiListCategories } from '../../services/category.service';
import { apiListBranches } from '../../services/branch.service';

// ── Design tokens (matching Customer) ───────────────────────────────────────
const COLORS = {
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

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontFamily: 'Inter, sans-serif',
  fontSize: 14,
  fontWeight: 600,
  color: COLORS.text,
  marginBottom: 8,
};

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: `1.5px solid ${COLORS.border}`,
  borderRadius: 10,
  fontSize: 14,
  fontFamily: 'Inter, sans-serif',
  color: COLORS.text,
  background: COLORS.bgPage,
  outline: 'none',
  transition: 'border-color 0.2s',
};

const INPUT_ERROR_STYLE: React.CSSProperties = {
  ...INPUT_STYLE,
  borderColor: COLORS.error,
};

const ERROR_TEXT: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 12,
  color: COLORS.error,
  marginTop: 4,
};

const HELP_TEXT: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 12,
  color: COLORS.textMuted,
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
    branchIds: data.branchIds.length > 0 ? data.branchIds : undefined,
  };
}

// ── Props ───────────────────────────────────────────────────────────────────
interface VoucherFormProps {
  mode: 'create' | 'edit';
  initialData?: VoucherFormData;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  onCancel?: () => void;
  isSubmitting: boolean;
  submitError: string | null;
  cancelLabel?: string;
  submitLabel?: string;
}

// ── Component ───────────────────────────────────────────────────────────────
export function VoucherForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
  cancelLabel = 'Hủy',
  submitLabel,
}: VoucherFormProps) {
  const [formData, setFormData] = useState<VoucherFormData>(initialData || EMPTY_FORM);
  const [errors, setErrors] = useState<VoucherFormErrors>({});

  // Data sources
  const [categories, setCategories] = useState<Category[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Image preview
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);

  // Load categories & branches
  useEffect(() => {
    const load = async () => {
      try {
        const [cats, brs] = await Promise.all([apiListCategories(), apiListBranches()]);
        setCategories(cats);
        setBranches(brs);
      } catch {
        // Silently fail — fields will show "no data" state
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, []);

  // Sync initialData for edit mode
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setImagePreview(initialData.imageUrl || null);
    }
  }, [initialData]);

  // Field change handler
  const handleChange = (field: keyof VoucherFormData, value: string | number[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Image URL → preview
  const handleImageUrlChange = (url: string) => {
    handleChange('imageUrl', url);
    if (url.trim()) {
      try {
        new URL(url);
        setImagePreview(url);
      } catch {
        setImagePreview(null);
      }
    } else {
      setImagePreview(null);
    }
  };

  // Branch toggle
  const toggleBranch = (branchId: number) => {
    setFormData(prev => {
      const ids = prev.branchIds.includes(branchId)
        ? prev.branchIds.filter(id => id !== branchId)
        : [...prev.branchIds, branchId];
      return { ...prev, branchIds: ids };
    });
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateVoucherForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to first error
      const firstKey = Object.keys(validationErrors)[0];
      document.getElementById(`voucher-${firstKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setErrors({});
    const payload = buildPayload(formData);
    await onSubmit(payload);
  };

  // Helper to get input style with error state
  const getInputStyle = (field: keyof VoucherFormData): React.CSSProperties =>
    errors[field] ? INPUT_ERROR_STYLE : INPUT_STYLE;

  const getInputHandlers = (field: keyof VoucherFormData) => ({
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      e.currentTarget.style.borderColor = errors[field] ? COLORS.error : COLORS.primary;
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      e.currentTarget.style.borderColor = errors[field] ? COLORS.error : COLORS.border;
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      {/* General error */}
      {(submitError || errors.general) && (
        <div style={{
          padding: '12px 16px',
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: 10,
          marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.error} strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: COLORS.error }}>
            {submitError || errors.general}
          </span>
        </div>
      )}

      {/* ── Two column layout ─────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
        {/* LEFT: Main fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Card: Thông tin cơ bản */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: `1px solid #F1F5F9`, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: '#E8F4FA', borderRadius: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              </span>
              Thông tin cơ bản
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Title */}
              <div id="voucher-title">
                <label style={LABEL_STYLE}>Tên voucher <span style={{ color: COLORS.error }}>*</span></label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => handleChange('title', e.target.value)}
                  placeholder="Ví dụ: Giảm 50% Combo 2 người tại ABC"
                  maxLength={255}
                  style={getInputStyle('title')}
                  {...getInputHandlers('title')}
                />
                {errors.title && <div style={ERROR_TEXT}>{errors.title}</div>}
                <div style={HELP_TEXT}>{formData.title.length}/255 ký tự</div>
              </div>

              {/* Description */}
              <div>
                <label style={LABEL_STYLE}>Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={e => handleChange('description', e.target.value)}
                  placeholder="Mô tả chi tiết voucher..."
                  rows={3}
                  style={{ ...INPUT_STYLE, resize: 'vertical' }}
                  onFocus={e => (e.currentTarget.style.borderColor = COLORS.primary)}
                  onBlur={e => (e.currentTarget.style.borderColor = COLORS.border)}
                />
              </div>

              {/* Application Condition */}
              <div>
                <label style={LABEL_STYLE}>Điều kiện áp dụng</label>
                <textarea
                  value={formData.applicationCondition}
                  onChange={e => handleChange('applicationCondition', e.target.value)}
                  placeholder="Ví dụ: Áp dụng cho đơn từ 200.000đ, không kèm khuyến mãi khác"
                  rows={2}
                  style={{ ...INPUT_STYLE, resize: 'vertical' }}
                  onFocus={e => (e.currentTarget.style.borderColor = COLORS.primary)}
                  onBlur={e => (e.currentTarget.style.borderColor = COLORS.border)}
                />
              </div>

              {/* Category */}
              <div id="voucher-categoryId">
                <label style={LABEL_STYLE}>Danh mục <span style={{ color: COLORS.error }}>*</span></label>
                <select
                  value={formData.categoryId}
                  onChange={e => handleChange('categoryId', e.target.value)}
                  style={{ ...getInputStyle('categoryId'), cursor: 'pointer' }}
                  {...getInputHandlers('categoryId')}
                >
                  <option value="">— Chọn danh mục —</option>
                  {loadingData ? (
                    <option disabled>Đang tải...</option>
                  ) : categories.length === 0 ? (
                    <option disabled>Không có danh mục</option>
                  ) : (
                    categories.map(cat => (
                      <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                    ))
                  )}
                </select>
                {errors.categoryId && <div style={ERROR_TEXT}>{errors.categoryId}</div>}
              </div>
            </div>
          </div>

          {/* Card: Giá & Số lượng */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: `1px solid #F1F5F9`, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: '#ECFDF5', borderRadius: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.success} strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              </span>
              Giá & Số lượng
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Original price */}
              <div id="voucher-originalPrice">
                <label style={LABEL_STYLE}>Giá gốc (VNĐ) <span style={{ color: COLORS.error }}>*</span></label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.originalPrice}
                  onChange={e => handleChange('originalPrice', e.target.value)}
                  placeholder="500000"
                  style={getInputStyle('originalPrice')}
                  {...getInputHandlers('originalPrice')}
                />
                {errors.originalPrice && <div style={ERROR_TEXT}>{errors.originalPrice}</div>}
              </div>

              {/* Sale price */}
              <div id="voucher-salePrice">
                <label style={LABEL_STYLE}>Giá bán (VNĐ) <span style={{ color: COLORS.error }}>*</span></label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.salePrice}
                  onChange={e => handleChange('salePrice', e.target.value)}
                  placeholder="250000"
                  style={getInputStyle('salePrice')}
                  {...getInputHandlers('salePrice')}
                />
                {errors.salePrice && <div style={ERROR_TEXT}>{errors.salePrice}</div>}
                {/* Discount preview */}
                {Number(formData.originalPrice) > 0 && Number(formData.salePrice) > 0 && Number(formData.salePrice) < Number(formData.originalPrice) && (
                  <div style={{ ...HELP_TEXT, color: COLORS.success, fontWeight: 600 }}>
                    Giảm {Math.round((1 - Number(formData.salePrice) / Number(formData.originalPrice)) * 100)}%
                  </div>
                )}
              </div>

              {/* Total quantity */}
              <div id="voucher-totalQuantity">
                <label style={LABEL_STYLE}>Tổng số lượng <span style={{ color: COLORS.error }}>*</span></label>
                <input
                  type="number"
                  min="1"
                  value={formData.totalQuantity}
                  onChange={e => handleChange('totalQuantity', e.target.value)}
                  placeholder="100"
                  style={getInputStyle('totalQuantity')}
                  {...getInputHandlers('totalQuantity')}
                />
                {errors.totalQuantity && <div style={ERROR_TEXT}>{errors.totalQuantity}</div>}
              </div>

              {/* Expiry days */}
              <div id="voucher-expiryDays">
                <label style={LABEL_STYLE}>Số ngày hiệu lực <span style={{ color: COLORS.error }}>*</span></label>
                <input
                  type="number"
                  min="1"
                  value={formData.expiryDays}
                  onChange={e => handleChange('expiryDays', e.target.value)}
                  placeholder="30"
                  style={getInputStyle('expiryDays')}
                  {...getInputHandlers('expiryDays')}
                />
                {errors.expiryDays && <div style={ERROR_TEXT}>{errors.expiryDays}</div>}
                <div style={HELP_TEXT}>Số ngày voucher có hiệu lực sau khi khách mua</div>
              </div>
            </div>
          </div>

          {/* Card: Thời gian bán */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: `1px solid #F1F5F9`, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: '#FEF3C7', borderRadius: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              </span>
              Thời gian bán
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Start date */}
              <div id="voucher-startDate">
                <label style={LABEL_STYLE}>Ngày bắt đầu <span style={{ color: COLORS.error }}>*</span></label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={e => handleChange('startDate', e.target.value)}
                  style={getInputStyle('startDate')}
                  {...getInputHandlers('startDate')}
                />
                {errors.startDate && <div style={ERROR_TEXT}>{errors.startDate}</div>}
              </div>

              {/* End date */}
              <div id="voucher-endDate">
                <label style={LABEL_STYLE}>Ngày kết thúc <span style={{ color: COLORS.error }}>*</span></label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={e => handleChange('endDate', e.target.value)}
                  min={formData.startDate || undefined}
                  style={getInputStyle('endDate')}
                  {...getInputHandlers('endDate')}
                />
                {errors.endDate && <div style={ERROR_TEXT}>{errors.endDate}</div>}
              </div>
            </div>
          </div>

          {/* Card: Chi nhánh áp dụng */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: `1px solid #F1F5F9`, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: '#FEF2F2', borderRadius: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.error} strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              </span>
              Chi nhánh áp dụng
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 400, color: COLORS.textMuted }}>(Tùy chọn)</span>
            </h2>

            {loadingData ? (
              <div style={{ padding: 16, textAlign: 'center', color: COLORS.textSecondary, fontSize: 14 }}>Đang tải danh sách chi nhánh...</div>
            ) : branches.length === 0 ? (
              <div style={{ padding: 16, textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: COLORS.textMuted, marginBottom: 4 }}>Chưa có chi nhánh nào</p>
                <p style={{ fontSize: 12, color: COLORS.textMuted }}>Tạo chi nhánh trong mục Quản lý chi nhánh để chọn nơi áp dụng voucher</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {formData.branchIds.length > 0 && (
                  <div style={{ fontSize: 12, color: COLORS.primary, fontWeight: 600, marginBottom: 4 }}>
                    Đã chọn {formData.branchIds.length}/{branches.length} chi nhánh
                  </div>
                )}
                {branches.map(branch => {
                  const checked = formData.branchIds.includes(branch.branchId);
                  return (
                    <label
                      key={branch.branchId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 14px',
                        background: checked ? '#E8F4FA' : COLORS.bgPage,
                        borderRadius: 10,
                        border: `1.5px solid ${checked ? COLORS.primary : 'transparent'}`,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleBranch(branch.branchId)}
                        style={{ width: 18, height: 18, accentColor: COLORS.primary, cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{branch.branchName}</div>
                        {branch.address && <div style={{ fontSize: 12, color: COLORS.textMuted }}>{branch.address}</div>}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Sidebar — Image + Preview + Submit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 24 }}>
          {/* Card: Ảnh voucher */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: `1px solid #F1F5F9`, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: '#F3E8FF', borderRadius: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
              </span>
              Ảnh voucher
            </h2>

            {/* Preview */}
            <div style={{
              width: '100%',
              aspectRatio: '4/3',
              borderRadius: 12,
              border: `2px dashed ${imagePreview ? 'transparent' : COLORS.border}`,
              background: imagePreview ? 'transparent' : COLORS.bgPage,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              marginBottom: 16,
            }}>
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }}
                  onError={() => setImagePreview(null)}
                />
              ) : (
                <div style={{ textAlign: 'center', color: COLORS.textMuted }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 8 }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <div style={{ fontSize: 13 }}>Nhập URL để xem trước</div>
                </div>
              )}
            </div>

            <div id="voucher-imageUrl">
              <label style={LABEL_STYLE}>URL ảnh</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={e => handleImageUrlChange(e.target.value)}
                placeholder="https://example.com/image.jpg"
                style={getInputStyle('imageUrl')}
                {...getInputHandlers('imageUrl')}
              />
              {errors.imageUrl && <div style={ERROR_TEXT}>{errors.imageUrl}</div>}
              <div style={HELP_TEXT}>
                {/* TODO: Khi có API upload, thay bằng component upload */}
                Dán đường dẫn ảnh từ internet
              </div>
            </div>
          </div>

          {/* Card: Preview voucher info */}
          {formData.title && (
            <div style={{ background: 'white', borderRadius: 16, padding: 20, border: `1px solid #F1F5F9`, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Xem trước</div>
              <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>
                {formData.title || 'Tên voucher'}
              </div>
              {Number(formData.originalPrice) > 0 && Number(formData.salePrice) > 0 && (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: COLORS.textMuted, textDecoration: 'line-through' }}>
                    {Number(formData.originalPrice).toLocaleString('vi-VN')}đ
                  </span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: COLORS.primary }}>
                    {Number(formData.salePrice).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              )}
              {formData.totalQuantity && (
                <div style={{ fontSize: 13, color: COLORS.textSecondary }}>
                  Số lượng: {formData.totalQuantity}
                </div>
              )}
            </div>
          )}

          {/* Submit buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: isSubmitting ? COLORS.textMuted : COLORS.primary,
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.background = COLORS.primaryHover; }}
              onMouseLeave={e => { if (!isSubmitting) e.currentTarget.style.background = COLORS.primary; }}
            >
              {isSubmitting ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                  Đang lưu...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {submitLabel ?? (mode === 'create' ? 'Tạo Voucher' : 'Lưu thay đổi')}
                </>
              )}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  background: 'white',
                  color: COLORS.textSecondary,
                  border: `1.5px solid ${COLORS.border}`,
                  borderRadius: 10,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.6 : 1,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  if (!isSubmitting) {
                    e.currentTarget.style.borderColor = COLORS.textSecondary;
                    e.currentTarget.style.color = COLORS.text;
                  }
                }}
                onMouseLeave={e => {
                  if (!isSubmitting) {
                    e.currentTarget.style.borderColor = COLORS.border;
                    e.currentTarget.style.color = COLORS.textSecondary;
                  }
                }}
              >
                {cancelLabel}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  );
}
