import { useState } from 'react';
import toast from 'react-hot-toast';
import { apiCreateCashier, apiResetCashierPassword } from '../../services/branch.service';
import type { Branch } from '../../types/branch';

// ── Design tokens ───────────────────────────────────────────────────────────────
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
  warning: '#F59E0B',
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
  boxSizing: 'border-box',
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

// ── Props ─────────────────────────────────────────────────────────────────────
interface CashierManagementProps {
  branch: Branch;
  onRefresh: () => void;
}

// ── Cashier sub-view modes ────────────────────────────────────────────────────
type SubView = 'view' | 'create';

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function CashierManagement({ branch, onRefresh }: CashierManagementProps) {
  // ── BUSINESS RULE: A branch has exactly 1 cashier or none ──
  const [subView, setSubView] = useState<SubView>('view');
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [creating, setCreating] = useState(false);

  // Reset password dialog state
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateCreateForm = (): FormErrors => {
    const errs: FormErrors = {};
    if (!createForm.email.trim()) {
      errs.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email.trim())) {
      errs.email = 'Email không hợp lệ';
    }
    if (!createForm.password) {
      errs.password = 'Mật khẩu không được để trống';
    } else if (createForm.password.length < 6) {
      errs.password = 'Mật khẩu ít nhất 6 ký tự';
    }
    if (!createForm.confirmPassword) {
      errs.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (createForm.confirmPassword !== createForm.password) {
      errs.confirmPassword = 'Mật khẩu xác nhận không trùng khớp';
    }
    return errs;
  };

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleCreateCashier = async () => {
    const errs = validateCreateForm();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setFormErrors({});
    setCreating(true);
    try {
      await apiCreateCashier({
        email: createForm.email.trim(),
        password: createForm.password,
        branchId: branch.branchId,
      });
      toast.success('Đã tạo tài khoản thu ngân và gán vào chi nhánh.');
      setCreateForm({ email: '', password: '', confirmPassword: '' });
      onRefresh();
      setSubView('view');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Tạo tài khoản thu ngân thất bại');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateChange = (field: keyof typeof createForm, value: string) => {
    setCreateForm(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => {
        const next = { ...prev };
        delete next[field as keyof FormErrors];
        return next;
      });
    }
  };

  const openResetDialog = () => {
    setNewPassword('');
    setConfirmNewPassword('');
    setResetError(null);
    setShowResetDialog(true);
  };
  const closeResetDialog = () => {
    setShowResetDialog(false);
    setResetError(null);
  };

  const handleResetPassword = async () => {
    if (!branch.cashier) return;
    if (!newPassword) {
      setResetError('Mật khẩu mới không được để trống');
      return;
    }
    if (newPassword.length < 6) {
      setResetError('Mật khẩu mới ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setResetError('Mật khẩu xác nhận không trùng khớp');
      return;
    }
    setResetError(null);
    setResetting(true);
    try {
      await apiResetCashierPassword(branch.branchId, newPassword);
      toast.success('Đã đổi mật khẩu thu ngân.');
      closeResetDialog();
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'Đổi mật khẩu thất bại');
    } finally {
      setResetting(false);
    }
  };

  const goToView = () => setSubView('view');
  const goToCreate = () => {
    setFormErrors({});
    setCreateForm({ email: '', password: '', confirmPassword: '' });
    setSubView('create');
  };

  const getInputStyle = (field: keyof FormErrors) =>
    formErrors[field] ? INPUT_ERROR_STYLE : INPUT_STYLE;

  const inputHandlers = (field: keyof FormErrors) => ({
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
      e.currentTarget.style.borderColor = formErrors[field] ? COLORS.error : COLORS.primary;
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      e.currentTarget.style.borderColor = formErrors[field] ? COLORS.error : COLORS.border;
    },
  });

  return (
    <div style={{
      background: 'white',
      borderRadius: 16,
      padding: 24,
      border: '1px solid #F1F5F9',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20,
      }}>
        <h2 style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: 16, fontWeight: 700, color: COLORS.text,
          display: 'flex', alignItems: 'center', gap: 10, margin: 0,
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, background: '#FEF9C3', borderRadius: 8,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.warning} strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          Thu ngân chi nhánh
        </h2>
      </div>

      {/* ── Empty state: Branch has no cashier ─────────────────────────── */}
      {!branch.cashier && subView === 'view' && (
        <NoCashierCard onCreate={goToCreate} />
      )}

      {/* ── Read-only view: Branch already has a cashier ───────────────── */}
      {branch.cashier && subView === 'view' && (
        <CashierView
          cashier={branch.cashier}
          createdAt={branch.createdAt}
          onResetPassword={openResetDialog}
        />
      )}

      {/* ── Create new cashier ─────────────────────────────────────────── */}
      {subView === 'create' && (
        <CreateCashierForm
          values={createForm}
          errors={formErrors}
          submitting={creating}
          onChange={handleCreateChange}
          onSubmit={handleCreateCashier}
          onCancel={branch.cashier ? goToView : undefined}
          getInputStyle={getInputStyle}
          inputHandlers={inputHandlers}
        />
      )}

      {/* Reset password dialog */}
      {showResetDialog && branch.cashier && (
        <ResetPasswordDialog
          cashierEmail={branch.cashier.email}
          newPassword={newPassword}
          confirmPassword={confirmNewPassword}
          error={resetError}
          submitting={resetting}
          onChangeNew={setNewPassword}
          onChangeConfirm={setConfirmNewPassword}
          onSubmit={handleResetPassword}
          onCancel={closeResetDialog}
        />
      )}
    </div>
  );
}

// ── Sub-component: No cashier card ───────────────────────────────────────────
function NoCashierCard({ onCreate }: {
  onCreate: () => void;
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 14,
      padding: 18,
      background: '#FEF9C3',
      border: '1px solid #FDE68A',
      borderRadius: 12,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: '#FDE68A',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 14, fontWeight: 700, color: '#92400E',
          }}>
            Chi nhánh này chưa có tài khoản Thu ngân
          </div>
        </div>
      </div>

      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 12, color: '#78350F',
        margin: 0, lineHeight: 1.5,
      }}>
        Thu ngân là tài khoản đăng nhập của máy POS tại chi nhánh, dùng để quét và xác nhận Voucher.
        Một chi nhánh chỉ có thể hoạt động khi có đúng 1 tài khoản thu ngân.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
        <button
          type="button"
          onClick={onCreate}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '10px 16px',
            background: COLORS.primary, color: 'white',
            border: 'none', borderRadius: 10,
            fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = COLORS.primaryHover)}
          onMouseLeave={e => (e.currentTarget.style.background = COLORS.primary)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tạo tài khoản Thu ngân
        </button>
      </div>
    </div>
  );
}

// ── Sub-component: Read-only cashier view ────────────────────────────────────
function CashierView({ cashier, createdAt, onResetPassword }: {
  cashier: NonNullable<Branch['cashier']>;
  createdAt: string;
  onResetPassword: () => void;
}) {
  const emailInitial = (cashier.email?.charAt(0) ?? 'P').toUpperCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Card: cashier info */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px',
        background: '#F0FDF4',
        borderRadius: 12,
        border: '1px solid #BBF7D0',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: COLORS.success,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 18, fontWeight: 800, color: 'white',
          }}>
            {emailInitial}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 14, fontWeight: 700, color: COLORS.text,
            marginBottom: 2,
          }}>
            {cashier.email}
          </div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>
            Ngày tạo: {new Date(createdAt).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </div>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700,
          color: COLORS.success, background: '#DCFCE7',
          padding: '3px 10px', borderRadius: 6,
        }}>
          Đang hoạt động
        </span>
      </div>

      {/* Action: Reset password */}
      <button
        type="button"
        onClick={onResetPassword}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '10px 14px',
          background: 'white', color: COLORS.primary,
          border: `1.5px solid ${COLORS.border}`,
          borderRadius: 10,
          fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', transition: 'all 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = COLORS.primary;
          e.currentTarget.style.background = '#E8F4FA';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = COLORS.border;
          e.currentTarget.style.background = 'white';
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Đổi mật khẩu
      </button>
    </div>
  );
}

// ── Sub-component: Create cashier form ───────────────────────────────────────
function CreateCashierForm({
  values, errors, submitting, onChange, onSubmit, onCancel,
  getInputStyle, inputHandlers,
}: {
  values: { email: string; password: string; confirmPassword: string };
  errors: FormErrors;
  submitting: boolean;
  onChange: (field: 'email' | 'password' | 'confirmPassword', value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  getInputStyle: (field: keyof FormErrors) => React.CSSProperties;
  inputHandlers: (field: keyof FormErrors) => {
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  };
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 13, color: COLORS.textSecondary,
        margin: 0, lineHeight: 1.5,
      }}>
        Tạo tài khoản đăng nhập cho máy POS tại chi nhánh này.
        Tài khoản sẽ được tự động gán vào chi nhánh.
      </p>

      <div>
        <label style={LABEL_STYLE}>Email <span style={{ color: COLORS.error }}>*</span></label>
        <input
          type="email"
          value={values.email}
          onChange={e => onChange('email', e.target.value)}
          placeholder="pos@branch.com"
          autoComplete="off"
          style={getInputStyle('email')}
          {...inputHandlers('email')}
        />
        {errors.email && <div style={ERROR_TEXT}>{errors.email}</div>}
      </div>

      <div>
        <label style={LABEL_STYLE}>Mật khẩu <span style={{ color: COLORS.error }}>*</span></label>
        <input
          type="password"
          value={values.password}
          onChange={e => onChange('password', e.target.value)}
          placeholder="Ít nhất 6 ký tự"
          autoComplete="new-password"
          style={getInputStyle('password')}
          {...inputHandlers('password')}
        />
        {errors.password && <div style={ERROR_TEXT}>{errors.password}</div>}
      </div>

      <div>
        <label style={LABEL_STYLE}>Xác nhận mật khẩu <span style={{ color: COLORS.error }}>*</span></label>
        <input
          type="password"
          value={values.confirmPassword}
          onChange={e => onChange('confirmPassword', e.target.value)}
          placeholder="Nhập lại mật khẩu"
          autoComplete="new-password"
          style={getInputStyle('confirmPassword')}
          {...inputHandlers('confirmPassword')}
        />
        {errors.confirmPassword && <div style={ERROR_TEXT}>{errors.confirmPassword}</div>}
      </div>

      <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          style={{
            padding: '10px 20px',
            background: submitting ? COLORS.textMuted : COLORS.primary,
            color: 'white', border: 'none', borderRadius: 10,
            fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700,
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1,
            transition: 'background 0.15s',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
          onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = COLORS.primaryHover; }}
          onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = COLORS.primary; }}
        >
          {submitting ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 0.8s linear infinite' }}>
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Đang tạo...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Tạo tài khoản
            </>
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            style={{
              padding: '10px 20px',
              background: 'white', color: COLORS.textSecondary,
              border: `1.5px solid ${COLORS.border}`, borderRadius: 10,
              fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.6 : 1,
            }}
          >
            Hủy
          </button>
        )}
      </div>
    </div>
  );
}

// ── Sub-component: Reset password dialog ────────────────────────────────────
function ResetPasswordDialog({
  cashierEmail,
  newPassword,
  confirmPassword,
  error,
  submitting,
  onChangeNew,
  onChangeConfirm,
  onSubmit,
  onCancel,
}: {
  cashierEmail: string;
  newPassword: string;
  confirmPassword: string;
  error: string | null;
  submitting: boolean;
  onChangeNew: (v: string) => void;
  onChangeConfirm: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const getInputStyle = (hasError: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '10px 14px',
    border: `1.5px solid ${hasError ? COLORS.error : COLORS.border}`,
    borderRadius: 10,
    fontSize: 14,
    fontFamily: 'Inter, sans-serif',
    color: COLORS.text,
    background: COLORS.bgPage,
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15, 23, 42, 0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 16,
      }}
      onClick={onCancel}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: 16,
          width: '100%', maxWidth: 480,
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 24px 16px',
          borderBottom: `1px solid ${COLORS.border}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, background: '#E8F4FA',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <h3 style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: 17, fontWeight: 700, color: COLORS.text, margin: 0,
            }}>
              Đổi mật khẩu thu ngân
            </h3>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 13, color: COLORS.textSecondary, margin: '2px 0 0',
            }}>
              {cashierEmail}
            </p>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={LABEL_STYLE}>Mật khẩu mới <span style={{ color: COLORS.error }}>*</span></label>
            <input
              type="password"
              value={newPassword}
              onChange={e => onChangeNew(e.target.value)}
              placeholder="Ít nhất 6 ký tự"
              autoComplete="new-password"
              style={getInputStyle(error === 'Mật khẩu mới không được để trống' || error === 'Mật khẩu mới ít nhất 6 ký tự')}
            />
          </div>

          <div>
            <label style={LABEL_STYLE}>Xác nhận mật khẩu mới <span style={{ color: COLORS.error }}>*</span></label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => onChangeConfirm(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              autoComplete="new-password"
              style={getInputStyle(error === 'Mật khẩu xác nhận không trùng khớp')}
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 14px',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: 10,
              fontFamily: 'Inter, sans-serif',
              fontSize: 13, color: COLORS.error,
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting}
              style={{
                padding: '10px 20px',
                background: submitting ? COLORS.textMuted : COLORS.primary,
                color: 'white', border: 'none', borderRadius: 10,
                fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                transition: 'background 0.15s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
              onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = COLORS.primaryHover; }}
              onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = COLORS.primary; }}
            >
              {submitting ? 'Đang lưu...' : 'Đổi mật khẩu'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              style={{
                padding: '10px 20px',
                background: 'white', color: COLORS.textSecondary,
                border: `1.5px solid ${COLORS.border}`, borderRadius: 10,
                fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}