import { useRef, useState } from 'react';
import {
  VOUCHER_FORM_COLORS as COLORS,
  VOUCHER_LABEL_STYLE as LABEL_STYLE,
  VOUCHER_INPUT_STYLE as INPUT_STYLE,
  VOUCHER_INPUT_ERROR_STYLE as INPUT_ERROR_STYLE,
  VOUCHER_ERROR_TEXT as ERROR_TEXT,
  VOUCHER_HELP_TEXT as HELP_TEXT,
  VOUCHER_IMAGE_MAX_BYTES,
  VOUCHER_IMAGE_ALLOWED_TYPES,
  VOUCHER_IMAGE_ALLOWED_LABEL,
  type VoucherFormData,
  type VoucherFormErrors,
  EMPTY_FORM,
  validateVoucherForm,
  buildPayload,
} from './voucherForm.helpers';
import type { VoucherCategory } from '../../types/voucher';

interface VoucherFormProps {
  mode: 'create' | 'edit';
  initialData?: VoucherFormData;
  categories: VoucherCategory[];
  loadingCategories: boolean;
  preselectedBranchIds?: number[];
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  onCancel?: () => void;
  isSubmitting: boolean;
  submitError: string | null;
  cancelLabel?: string;
  submitLabel?: string;
}

// ── Component ────────────────────────────────────────────────────────────────
export function VoucherForm({
  mode,
  initialData,
  categories,
  loadingCategories,
  preselectedBranchIds,
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
  cancelLabel = 'Hủy',
  submitLabel,
}: VoucherFormProps) {
  const [formData, setFormData] = useState<VoucherFormData>(() => {
    const base = initialData || EMPTY_FORM;
    if (preselectedBranchIds && preselectedBranchIds.length > 0 && base.branchIds.length === 0) {
      return { ...base, branchIds: [...preselectedBranchIds] };
    }
    return base;
  });
  const [errors, setErrors] = useState<VoucherFormErrors>({});
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.imageUrl || null,
  );

  // Sync initialData when parent provides a NEW reference (e.g. edit form
  // remounts with fetched data). We track the previous reference and reset
  // state during render when it changes — no setState inside an effect.
  const [prevInitialData, setPrevInitialData] = useState(initialData);
  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    if (initialData) {
      setFormData(initialData);
      setImagePreview(initialData.imageUrl || null);
    }
  }

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = <K extends keyof VoucherFormData>(field: K, value: VoucherFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, imageUrl: 'Vui lòng chọn file ảnh' }));
      return;
    }
    if (!VOUCHER_IMAGE_ALLOWED_TYPES.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        imageUrl: `Định dạng không hỗ trợ. Vui lòng chọn ảnh ${VOUCHER_IMAGE_ALLOWED_LABEL}.`,
      }));
      // Reset input so the same file can be re-selected after the user
      // switches to a supported format.
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (file.size > VOUCHER_IMAGE_MAX_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const maxMB = Math.round(VOUCHER_IMAGE_MAX_BYTES / (1024 * 1024));
      setErrors(prev => ({
        ...prev,
        imageUrl: `Ảnh có kích thước ${sizeMB} MB vượt quá giới hạn ${maxMB} MB. Vui lòng chọn ảnh nhỏ hơn.`,
      }));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      const result = ev.target?.result as string;
      setImagePreview(result);
      handleChange('imageUrl', result);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImagePreview(null);
    handleChange('imageUrl', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateVoucherForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstKey = Object.keys(validationErrors)[0];
      document.getElementById(`voucher-${firstKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setErrors({});
    await onSubmit(buildPayload(formData));
  };

  const getInputStyle = (field: keyof VoucherFormData): React.CSSProperties =>
    errors[field] ? INPUT_ERROR_STYLE : INPUT_STYLE;

  const getFocusHandlers = (field: keyof VoucherFormData) => ({
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      e.currentTarget.style.borderColor = errors[field] ? COLORS.error : COLORS.primary;
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

      {/* === Basic info card === */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: 24,
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        marginBottom: 24,
      }}>
        <h2 style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: 16, fontWeight: 700, color: COLORS.text,
          marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, background: '#E8F4FA', borderRadius: 8,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </span>
          Thông tin cơ bản
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div id="voucher-title">
            <label style={LABEL_STYLE}>
              Tên voucher <span style={{ color: COLORS.error }}>*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={e => handleChange('title', e.target.value)}
              placeholder="Ví dụ: Voucher giảm 30% nhà hàng ABC"
              maxLength={150}
              style={getInputStyle('title')}
              {...getFocusHandlers('title')}
            />
            {errors.title ? (
              <div style={ERROR_TEXT}>{errors.title}</div>
            ) : (
              <div style={HELP_TEXT}>{formData.title.length}/150 ký tự</div>
            )}
          </div>

          <div id="voucher-description">
            <label style={LABEL_STYLE}>Mô tả</label>
            <textarea
              value={formData.description}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="Mô tả chi tiết về voucher..."
              rows={3}
              maxLength={500}
              style={{ ...INPUT_STYLE, resize: 'vertical' }}
              onFocus={e => (e.currentTarget.style.borderColor = COLORS.primary)}
              onBlur={e => (e.currentTarget.style.borderColor = COLORS.border)}
            />
            <div style={HELP_TEXT}>{formData.description.length}/500 ký tự</div>
          </div>

          <div id="voucher-categoryId">
            <label style={LABEL_STYLE}>
              Danh mục <span style={{ color: COLORS.error }}>*</span>
            </label>
            <select
              value={formData.categoryId}
              onChange={e => handleChange('categoryId', e.target.value)}
              disabled={loadingCategories}
              style={{
                ...getInputStyle('categoryId'),
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: 36,
              }}
              {...getFocusHandlers('categoryId')}
            >
              <option value="">
                {loadingCategories ? 'Đang tải danh mục...' : 'Chọn danh mục'}
              </option>
              {categories.map(c => (
                <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
              ))}
            </select>
            {errors.categoryId && <div style={ERROR_TEXT}>{errors.categoryId}</div>}
          </div>
        </div>
      </div>

      {/* === Pricing & quantity card === */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: 24,
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        marginBottom: 24,
      }}>
        <h2 style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: 16, fontWeight: 700, color: COLORS.text,
          marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, background: '#FEF3C7', borderRadius: 8,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </span>
          Giá & số lượng
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          <div id="voucher-originalPrice">
            <label style={LABEL_STYLE}>
              Giá gốc (VND) <span style={{ color: COLORS.error }}>*</span>
            </label>
            <input
              type="number"
              value={formData.originalPrice}
              onChange={e => handleChange('originalPrice', e.target.value)}
              placeholder="Ví dụ: 500000"
              min={0}
              style={getInputStyle('originalPrice')}
              {...getFocusHandlers('originalPrice')}
            />
            {errors.originalPrice && <div style={ERROR_TEXT}>{errors.originalPrice}</div>}
          </div>

          <div id="voucher-salePrice">
            <label style={LABEL_STYLE}>
              Giá bán (VND) <span style={{ color: COLORS.error }}>*</span>
            </label>
            <input
              type="number"
              value={formData.salePrice}
              onChange={e => handleChange('salePrice', e.target.value)}
              placeholder="Ví dụ: 350000"
              min={0}
              style={getInputStyle('salePrice')}
              {...getFocusHandlers('salePrice')}
            />
            {errors.salePrice && <div style={ERROR_TEXT}>{errors.salePrice}</div>}
          </div>

          <div id="voucher-totalQuantity">
            <label style={LABEL_STYLE}>
              Tổng số lượng <span style={{ color: COLORS.error }}>*</span>
            </label>
            <input
              type="number"
              value={formData.totalQuantity}
              onChange={e => handleChange('totalQuantity', e.target.value)}
              placeholder="Ví dụ: 100"
              min={1}
              style={getInputStyle('totalQuantity')}
              {...getFocusHandlers('totalQuantity')}
            />
            {errors.totalQuantity && <div style={ERROR_TEXT}>{errors.totalQuantity}</div>}
          </div>
        </div>
      </div>

      {/* === Image card === */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: 24,
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        marginBottom: 24,
      }}>
        <h2 style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: 16, fontWeight: 700, color: COLORS.text,
          marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, background: '#FCE7F3', borderRadius: 8,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#BE185D" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </span>
          Hình ảnh
        </h2>

        <div id="voucher-imageUrl">
          <input
            ref={fileInputRef}
            type="file"
            accept={VOUCHER_IMAGE_ALLOWED_TYPES.join(',')}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {imagePreview ? (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: 240,
                  borderRadius: 12,
                  border: `1px solid ${COLORS.border}`,
                  display: 'block',
                }}
              />
              <button
                type="button"
                onClick={handleClearImage}
                style={{
                  position: 'absolute',
                  top: 8, right: 8,
                  width: 32, height: 32,
                  background: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 16,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '12px 20px',
                background: COLORS.bgPage,
                border: `1.5px dashed ${COLORS.border}`,
                borderRadius: 10,
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                color: COLORS.textSecondary,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%',
                justifyContent: 'center',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Chọn ảnh
            </button>
          )}
          {errors.imageUrl ? (
            <div style={ERROR_TEXT}>{errors.imageUrl}</div>
          ) : (
            <div style={HELP_TEXT}>
              Hỗ trợ {VOUCHER_IMAGE_ALLOWED_LABEL}. Kích thước tối đa {Math.round(VOUCHER_IMAGE_MAX_BYTES / (1024 * 1024))} MB mỗi ảnh.
            </div>
          )}
        </div>
      </div>

      {/* === Dates card === */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: 24,
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        marginBottom: 24,
      }}>
        <h2 style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: 16, fontWeight: 700, color: COLORS.text,
          marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, background: '#E0F2FE', borderRadius: 8,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0369A1" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </span>
          Thời gian áp dụng
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          <div id="voucher-startDate">
            <label style={LABEL_STYLE}>
              Ngày bắt đầu <span style={{ color: COLORS.error }}>*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.startDate}
              onChange={e => handleChange('startDate', e.target.value)}
              style={getInputStyle('startDate')}
              {...getFocusHandlers('startDate')}
            />
            {errors.startDate && <div style={ERROR_TEXT}>{errors.startDate}</div>}
          </div>

          <div id="voucher-endDate">
            <label style={LABEL_STYLE}>
              Ngày kết thúc <span style={{ color: COLORS.error }}>*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.endDate}
              onChange={e => handleChange('endDate', e.target.value)}
              style={getInputStyle('endDate')}
              {...getFocusHandlers('endDate')}
            />
            {errors.endDate && <div style={ERROR_TEXT}>{errors.endDate}</div>}
          </div>

          <div id="voucher-expiryDays">
            <label style={LABEL_STYLE}>
              Số ngày hiệu lực <span style={{ color: COLORS.error }}>*</span>
            </label>
            <input
              type="number"
              value={formData.expiryDays}
              onChange={e => handleChange('expiryDays', e.target.value)}
              placeholder="Ví dụ: 30"
              min={1}
              style={getInputStyle('expiryDays')}
              {...getFocusHandlers('expiryDays')}
            />
            {errors.expiryDays ? (
              <div style={ERROR_TEXT}>{errors.expiryDays}</div>
            ) : (
              <div style={HELP_TEXT}>Số ngày từ khi voucher được cấp</div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 20 }} id="voucher-applicationCondition">
          <label style={LABEL_STYLE}>Điều kiện áp dụng</label>
          <textarea
            value={formData.applicationCondition}
            onChange={e => handleChange('applicationCondition', e.target.value)}
            placeholder="Ví dụ: Áp dụng cho khách hàng mới, không áp dụng chung với KM khác..."
            rows={2}
            maxLength={500}
            style={{ ...INPUT_STYLE, resize: 'vertical' }}
            onFocus={e => (e.currentTarget.style.borderColor = COLORS.primary)}
            onBlur={e => (e.currentTarget.style.borderColor = COLORS.border)}
          />
        </div>
      </div>

      {/* Submit buttons */}
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '12px 28px',
            background: isSubmitting ? COLORS.textMuted : COLORS.primary,
            color: 'white',
            border: 'none',
            borderRadius: 10,
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            fontWeight: 700,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
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
              {submitLabel ?? (mode === 'create' ? 'Tạo voucher' : 'Lưu thay đổi')}
            </>
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            style={{
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

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  );
}