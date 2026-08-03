import { useState } from 'react';
import type { CreateBranchInput, UpdateBranchInput } from '../../types/branch';
import {
  BRANCH_FORM_COLORS as COLORS,
  BRANCH_FORM_LABEL_STYLE as LABEL_STYLE,
  BRANCH_INPUT_STYLE as INPUT_STYLE,
  BRANCH_INPUT_ERROR_STYLE as INPUT_ERROR_STYLE,
  BRANCH_ERROR_TEXT as ERROR_TEXT,
  BRANCH_HELP_TEXT as HELP_TEXT,
  type BranchFormData,
  type BranchFormErrors,
  EMPTY_BRANCH_FORM,
  validateBranchForm,
  buildBranchPayload,
} from './branchForm.helpers';

interface BranchFormProps {
  mode: 'create' | 'edit';
  initialData?: BranchFormData;
  onSubmit: (payload: CreateBranchInput | UpdateBranchInput) => Promise<void>;
  onCancel?: () => void;
  isSubmitting: boolean;
  submitError: string | null;
  cancelLabel?: string;
  submitLabel?: string;
}

// ── Component ────────────────────────────────────────────────────────────────
export function BranchForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
  cancelLabel = 'Hủy',
  submitLabel,
}: BranchFormProps) {
  const [formData, setFormData] = useState<BranchFormData>(
    initialData || EMPTY_BRANCH_FORM,
  );
  const [errors, setErrors] = useState<BranchFormErrors>({});

  // Sync initialData when parent provides a NEW reference (e.g. edit form
  // remounts with fetched data). We track the previous reference and reset
  // state during render when it changes — no setState inside an effect.
  const [prevInitialData, setPrevInitialData] = useState(initialData);
  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    if (initialData) setFormData(initialData);
  }

  const handleChange = (field: keyof BranchFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateBranchForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstKey = Object.keys(validationErrors)[0];
      document.getElementById(`branch-${firstKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setErrors({});
    const payload = buildBranchPayload(formData);
    await onSubmit(payload);
  };

  const getInputStyle = (field: keyof BranchFormData): React.CSSProperties =>
    errors[field] ? INPUT_ERROR_STYLE : INPUT_STYLE;

  const getInputHandlers = (field: keyof BranchFormData) => ({
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
      e.currentTarget.style.borderColor = errors[field] ? COLORS.error : COLORS.primary;
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
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

      {/* Form fields in a single card — width is fully controlled by the
          parent page (BranchCreate/BranchEdit) so the form stays consistent
          with VoucherCreate/VoucherEdit. The reusable BranchForm has no
          hardcoded `maxWidth` so it always fills the available container. */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: 24,
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        width: '100%',
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
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>
          {mode === 'create' ? 'Thông tin chi nhánh' : 'Chỉnh sửa chi nhánh'}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Branch name */}
          <div id="branch-branchName">
            <label style={LABEL_STYLE}>
              Tên chi nhánh <span style={{ color: COLORS.error }}>*</span>
            </label>
            <input
              type="text"
              value={formData.branchName}
              onChange={e => handleChange('branchName', e.target.value)}
              placeholder="Ví dụ: Chi nhánh Quận 1"
              maxLength={150}
              style={getInputStyle('branchName')}
              {...getInputHandlers('branchName')}
            />
            {errors.branchName ? (
              <div style={ERROR_TEXT}>{errors.branchName}</div>
            ) : (
              <div style={HELP_TEXT}>{formData.branchName.length}/150 ký tự</div>
            )}
          </div>

          {/* Address */}
          <div id="branch-address">
            <label style={LABEL_STYLE}>
              Địa chỉ <span style={{ color: COLORS.error }}>*</span>
            </label>
            <textarea
              value={formData.address}
              onChange={e => handleChange('address', e.target.value)}
              placeholder="Ví dụ: 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh"
              rows={3}
              style={{
                ...INPUT_STYLE,
                resize: 'vertical',
                ...(errors.address ? { borderColor: COLORS.error } : {}),
              }}
              onFocus={e => (e.currentTarget.style.borderColor = errors.address ? COLORS.error : COLORS.primary)}
              onBlur={e => (e.currentTarget.style.borderColor = errors.address ? COLORS.error : COLORS.border)}
            />
            {errors.address && <div style={ERROR_TEXT}>{errors.address}</div>}
          </div>

          {/* Phone number */}
          <div id="branch-phoneNumber">
            <label style={LABEL_STYLE}>
              Số điện thoại <span style={{ color: COLORS.error }}>*</span>
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={e => handleChange('phoneNumber', e.target.value)}
              placeholder="Ví dụ: 0909123456"
              maxLength={11}
              style={getInputStyle('phoneNumber')}
              {...getInputHandlers('phoneNumber')}
            />
            {errors.phoneNumber ? (
              <div style={ERROR_TEXT}>{errors.phoneNumber}</div>
            ) : (
              <div style={HELP_TEXT}>10-11 chữ số</div>
            )}
          </div>
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
              {submitLabel ?? (mode === 'create' ? 'Tạo chi nhánh' : 'Lưu thay đổi')}
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