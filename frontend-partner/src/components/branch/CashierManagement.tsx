import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  apiCreateCashier,
  apiAssignCashier,
  apiRemoveCashier,
  apiSearchCashiers,
  type CashierSummary,
} from '../../services/branch.service';
import { ConfirmDialog } from '../common/ConfirmDialog';
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

const HELP_TEXT: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 12,
  color: COLORS.textMuted,
  marginTop: 4,
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface CashierManagementProps {
  branch: Branch;
  onRefresh: () => void;
}

// ── Cashier sub-view modes ────────────────────────────────────────────────────
type SubView = 'view' | 'create' | 'assign';

interface FormErrors {
  email?: string;
  password?: string;
  fullName?: string;
  phoneNumber?: string;
}

export function CashierManagement({ branch, onRefresh }: CashierManagementProps) {
  // ── BUSINESS RULE: A branch has exactly 1 cashier or none ──
  const [subView, setSubView] = useState<SubView>('view');
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
  });

  const [assigning, setAssigning] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [removing, setRemoving] = useState(false);

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
    if (!createForm.fullName.trim()) {
      errs.fullName = 'Họ tên không được để trống';
    } else if (createForm.fullName.trim().length < 2) {
      errs.fullName = 'Họ tên ít nhất 2 ký tự';
    }
    if (createForm.phoneNumber.trim() && !/^[0-9]{10,11}$/.test(createForm.phoneNumber.trim())) {
      errs.phoneNumber = 'Số điện thoại phải là 10-11 chữ số';
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
    setAssigning(true);
    try {
      await apiCreateCashier({
        email: createForm.email.trim(),
        password: createForm.password,
        fullName: createForm.fullName.trim(),
        phoneNumber: createForm.phoneNumber.trim() || undefined,
        branchId: branch.branchId,
      });
      toast.success('Đã tạo tài khoản thu ngân và gán vào chi nhánh.');
      setCreateForm({ email: '', password: '', fullName: '', phoneNumber: '' });
      onRefresh();
      setSubView('view');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Tạo tài khoản thu ngân thất bại');
    } finally {
      setAssigning(false);
    }
  };

  const handleAssignCashier = async (cashier: CashierSummary) => {
    setAssigning(true);
    try {
      await apiAssignCashier(branch.branchId, cashier.email);
      toast.success(`Đã gán thu ngân "${cashier.fullName}" vào chi nhánh.`);
      onRefresh();
      setSubView('view');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gán thu ngân thất bại');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveCashier = async () => {
    setRemoving(true);
    try {
      await apiRemoveCashier(branch.branchId);
      setShowRemoveDialog(false);
      toast.success('Đã gỡ thu ngân khỏi chi nhánh.');
      onRefresh();
      setSubView('view');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gỡ thu ngân thất bại');
    } finally {
      setRemoving(false);
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

  const goToView = () => setSubView('view');
  const goToCreate = () => {
    setFormErrors({});
    setCreateForm({ email: '', password: '', fullName: '', phoneNumber: '' });
    setSubView('create');
  };
  const goToAssign = () => setSubView('assign');

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
    <>
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
          <NoCashierCard
            onCreate={goToCreate}
            onAssign={goToAssign}
          />
        )}

        {/* ── Read-only view: Branch already has a cashier ───────────────── */}
        {branch.cashier && subView === 'view' && (
          <CashierView
            cashier={branch.cashier}
            onChangeCashier={goToAssign}
            onRemove={() => setShowRemoveDialog(true)}
          />
        )}

        {/* ── Assign existing cashier via autocomplete ──────────────────── */}
        {subView === 'assign' && (
          <CashierAutocomplete
            branchHasCashier={!!branch.cashier}
            submitting={assigning}
            onPick={handleAssignCashier}
            onCancel={goToView}
          />
        )}

        {/* ── Create new cashier ─────────────────────────────────────────── */}
        {subView === 'create' && (
          <CreateCashierForm
            values={createForm}
            errors={formErrors}
            submitting={assigning}
            onChange={handleCreateChange}
            onSubmit={handleCreateCashier}
            onCancel={branch.cashier ? goToView : undefined}
            getInputStyle={getInputStyle}
            inputHandlers={inputHandlers}
          />
        )}
      </div>

      {/* Remove confirmation */}
      {branch.cashier && showRemoveDialog && (
        <ConfirmDialog
          title="Gỡ thu ngân khỏi chi nhánh?"
          description={`Thu ngân "${branch.cashier.fullName}" sẽ không còn được gán vào chi nhánh này.`}
          confirmText="Gỡ thu ngân"
          cancelText="Hủy"
          variant="danger"
          loading={removing}
          onConfirm={handleRemoveCashier}
          onCancel={() => setShowRemoveDialog(false)}
        />
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

// ── Sub-component: No cashier card ───────────────────────────────────────────
function NoCashierCard({ onCreate, onAssign }: {
  onCreate: () => void;
  onAssign: () => void;
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
        Thu ngân là người sử dụng hệ thống để quét và xác nhận Voucher tại chi nhánh.
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
        <button
          type="button"
          onClick={onAssign}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '10px 16px',
            background: 'white', color: COLORS.text,
            border: `1.5px solid ${COLORS.border}`,
            borderRadius: 10,
            fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = COLORS.primary;
            e.currentTarget.style.color = COLORS.primary;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = COLORS.border;
            e.currentTarget.style.color = COLORS.text;
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Liên kết tài khoản có sẵn
        </button>
      </div>
    </div>
  );
}

// ── Sub-component: Read-only cashier view ────────────────────────────────────
function CashierView({ cashier, onChangeCashier, onRemove }: {
  cashier: NonNullable<Branch['cashier']>;
  onChangeCashier: () => void;
  onRemove: () => void;
}) {
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
            {cashier.fullName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 14, fontWeight: 700, color: COLORS.text,
            marginBottom: 2,
          }}>
            {cashier.fullName}
          </div>
          <div style={{ fontSize: 12, color: COLORS.textSecondary }}>
            {cashier.email}
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

      {/* Action row */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="button"
          onClick={onChangeCashier}
          style={{
            flex: 1,
            padding: '9px 16px',
            background: 'white',
            color: COLORS.primary,
            border: `1.5px solid ${COLORS.border}`,
            borderRadius: 10,
            fontFamily: 'Inter, sans-serif',
            fontSize: 13, fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
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
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Đổi thu ngân
        </button>
        <button
          type="button"
          onClick={onRemove}
          style={{
            flex: 1,
            padding: '9px 16px',
            background: 'white',
            color: COLORS.error,
            border: '1.5px solid #FECACA',
            borderRadius: 10,
            fontFamily: 'Inter, sans-serif',
            fontSize: 13, fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#FEF2F2';
            e.currentTarget.style.borderColor = COLORS.error;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.borderColor = '#FECACA';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          Gỡ thu ngân
        </button>
      </div>
    </div>
  );
}

// ── Sub-component: Autocomplete search cashier (gán thu ngân có sẵn) ──────────
function CashierAutocomplete({
  branchHasCashier, submitting, onPick, onCancel,
}: {
  branchHasCashier: boolean;
  submitting: boolean;
  onPick: (cashier: CashierSummary) => void;
  onCancel: () => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CashierSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [picked, setPicked] = useState<CashierSummary | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Debounced search (200ms — snappy for autocomplete)
  useEffect(() => {
    // If user has picked, no need to keep fetching
    if (picked) return;
    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await apiSearchCashiers({ q: query.trim() || undefined, limit: 20 });
        setResults(data);
        setHighlightedIndex(data.length > 0 ? 0 : -1);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(handle);
  }, [query, picked]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handlePick = (c: CashierSummary) => {
    setPicked(c);
    setOpen(false);
  };

  const handleConfirm = () => {
    if (picked) onPick(picked);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && results.length > 0) {
      e.preventDefault();
      setOpen(true);
      setHighlightedIndex(i => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp' && results.length > 0) {
      e.preventDefault();
      setHighlightedIndex(i => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && open && highlightedIndex >= 0 && results[highlightedIndex]) {
      e.preventDefault();
      handlePick(results[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 13, color: COLORS.textSecondary,
        margin: 0, lineHeight: 1.5,
      }}>
        {branchHasCashier
          ? 'Tìm kiếm thu ngân để thay thế. Tài khoản phải thuộc đối tác của bạn và chưa quản lý chi nhánh khác.'
          : 'Tìm kiếm thu ngân thuộc đối tác của bạn để gán vào chi nhánh này.'}
      </p>

      <div ref={containerRef} style={{ position: 'relative' }}>
        <label style={LABEL_STYLE}>Tìm thu ngân (theo tên hoặc email)</label>
        <div style={{ position: 'relative' }}>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="2"
            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={picked ? picked.fullName : query}
            onChange={e => {
              if (picked) setPicked(null);
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tên hoặc email..."
            autoComplete="off"
            style={{ ...INPUT_STYLE, paddingLeft: 40, paddingRight: picked ? 36 : 14 }}
            onFocusCapture={e => (e.currentTarget.style.borderColor = COLORS.primary)}
            onBlur={e => (e.currentTarget.style.borderColor = COLORS.border)}
            disabled={submitting}
          />
          {picked && (
            <button
              type="button"
              onClick={() => { setPicked(null); setQuery(''); }}
              aria-label="Bỏ chọn"
              style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                width: 24, height: 24, borderRadius: '50%',
                background: COLORS.bgPage, border: `1px solid ${COLORS.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', padding: 0,
              }}
              disabled={submitting}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Dropdown */}
        {open && !picked && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            marginTop: 4, zIndex: 20,
            background: 'white',
            border: `1.5px solid ${COLORS.border}`,
            borderRadius: 10,
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            maxHeight: 240, overflowY: 'auto',
          }}>
            {loading ? (
              <div style={{ padding: '14px 16px', fontSize: 13, color: COLORS.textMuted, textAlign: 'center' }}>
                Đang tìm kiếm...
              </div>
            ) : results.length === 0 ? (
              <div style={{ padding: '14px 16px', fontSize: 13, color: COLORS.textMuted, textAlign: 'center' }}>
                {query.trim() ? 'Không tìm thấy thu ngân nào' : 'Chưa có thu ngân nào trong đối tác'}
              </div>
            ) : (
              results.map((c, idx) => (
                <button
                  key={c.userId}
                  type="button"
                  onClick={() => handlePick(c)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '10px 14px',
                    background: highlightedIndex === idx ? '#E8F4FA' : 'white',
                    border: 'none', borderBottom: `1px solid ${COLORS.bgPage}`,
                    textAlign: 'left', cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: COLORS.primary,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 800, color: 'white' }}>
                      {c.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 1 }}>
                      {c.fullName}
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.email}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Picked preview */}
      {picked && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px',
          background: '#E8F4FA', border: '1px solid #BAE6FD',
          borderRadius: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: COLORS.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 800, color: 'white' }}>
              {picked.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>{picked.fullName}</div>
            <div style={{ fontSize: 12, color: COLORS.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis' }}>{picked.email}</div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.success, background: '#DCFCE7', padding: '3px 8px', borderRadius: 5 }}>
            Đã chọn
          </span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!picked || submitting}
          style={{
            padding: '10px 20px',
            background: !picked || submitting ? COLORS.textMuted : COLORS.primary,
            color: 'white', border: 'none', borderRadius: 10,
            fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700,
            cursor: !picked || submitting ? 'not-allowed' : 'pointer',
            opacity: !picked || submitting ? 0.7 : 1,
            transition: 'background 0.15s',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
          onMouseEnter={e => { if (picked && !submitting) e.currentTarget.style.background = COLORS.primaryHover; }}
          onMouseLeave={e => { if (picked && !submitting) e.currentTarget.style.background = COLORS.primary; }}
        >
          {submitting ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 0.8s linear infinite' }}>
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Đang gán...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Xác nhận gán
            </>
          )}
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
  );
}

// ── Sub-component: Create cashier form ───────────────────────────────────────
function CreateCashierForm({
  values, errors, submitting, onChange, onSubmit, onCancel,
  getInputStyle, inputHandlers,
}: {
  values: { email: string; password: string; fullName: string; phoneNumber: string };
  errors: FormErrors;
  submitting: boolean;
  onChange: (field: 'email' | 'password' | 'fullName' | 'phoneNumber', value: string) => void;
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
        Tạo tài khoản thu ngân mới. Tài khoản sẽ được tự động gán vào chi nhánh này.
      </p>

      <div>
        <label style={LABEL_STYLE}>Email <span style={{ color: COLORS.error }}>*</span></label>
        <input
          type="email"
          value={values.email}
          onChange={e => onChange('email', e.target.value)}
          placeholder="cashier@example.com"
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
          style={getInputStyle('password')}
          {...inputHandlers('password')}
        />
        {errors.password && <div style={ERROR_TEXT}>{errors.password}</div>}
      </div>

      <div>
        <label style={LABEL_STYLE}>Họ tên <span style={{ color: COLORS.error }}>*</span></label>
        <input
          type="text"
          value={values.fullName}
          onChange={e => onChange('fullName', e.target.value)}
          placeholder="Nguyễn Văn A"
          style={getInputStyle('fullName')}
          {...inputHandlers('fullName')}
        />
        {errors.fullName && <div style={ERROR_TEXT}>{errors.fullName}</div>}
      </div>

      <div>
        <label style={LABEL_STYLE}>Số điện thoại</label>
        <input
          type="tel"
          value={values.phoneNumber}
          onChange={e => onChange('phoneNumber', e.target.value)}
          placeholder="0909123456"
          maxLength={11}
          style={getInputStyle('phoneNumber')}
          {...inputHandlers('phoneNumber')}
        />
        {errors.phoneNumber ? (
          <div style={ERROR_TEXT}>{errors.phoneNumber}</div>
        ) : (
          <div style={HELP_TEXT}>10-11 chữ số, không bắt buộc</div>
        )}
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
