import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BranchForm } from '../components/branch/BranchForm';
import { apiCreateBranch } from '../services/branch.service';
import type { Branch, CreateBranchInput, UpdateBranchInput } from '../types/branch';

// ── Design tokens ───────────────────────────────────────────────────────────────
const COLORS = {
  primary: '#0E76A8',
  primaryHover: '#0A5C87',
  text: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  bgPage: '#F8FAFC',
  success: '#10B981',
} as const;

export function BranchCreatePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdBranch, setCreatedBranch] = useState<Branch | null>(null);

  const handleCancel = () => navigate('/branches');

  const handleSubmit = async (payload: CreateBranchInput | UpdateBranchInput) => {
    const p = payload as CreateBranchInput;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const created = await apiCreateBranch(p);
      toast.success('Tạo chi nhánh thành công!');
      setCreatedBranch(created);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Tạo chi nhánh thất bại';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCashierNow = () => {
    if (!createdBranch) return;
    // Đi tới trang chi tiết chi nhánh — phần Quản lý Thu ngân (CashierManagement)
    // sẽ hiển thị CTA "Tạo tài khoản" tương ứng.
    navigate(`/branches/${createdBranch.branchId}`);
  };

  const handleSkipCashier = () => {
    if (!createdBranch) return;
    // Đã ở trang detail rồi — chỉ cần đóng dialog (replace để không back về form).
    // Dùng replace để user back browser sẽ về /branches, không phải form.
    navigate(`/branches/${createdBranch.branchId}`, { replace: true });
  };

  return (
    <div style={{ background: COLORS.bgPage, minHeight: '100vh' }}>
      {/* ── Page Header ─────────────────────────────────── */}
      <div style={{ background: 'white', borderBottom: `1px solid ${COLORS.border}`, padding: '24px 0' }}>
        <div className="partner-container" style={{ paddingTop: 0, paddingBottom: 0 }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: 12, fontSize: 13, color: COLORS.textSecondary }}>
            <Link to="/branches" style={{ color: COLORS.primary, textDecoration: 'none', fontWeight: 600 }}>
              Quản lý Chi nhánh
            </Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: COLORS.text, fontWeight: 600 }}>Tạo Chi nhánh</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800, color: COLORS.text, marginBottom: 4 }}>
                Tạo Chi nhánh mới
              </h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: COLORS.textSecondary }}>
                Điền thông tin bên dưới để tạo chi nhánh mới cho đối tác của bạn.
              </p>
            </div>
            <Link
              to="/branches"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 18px', background: 'white', color: COLORS.textSecondary,
                fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600,
                borderRadius: 10, textDecoration: 'none', border: `1.5px solid ${COLORS.border}`,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.primary; e.currentTarget.style.color = COLORS.primary; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textSecondary; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────── */}
      <div className="partner-container" style={{ paddingTop: 24, paddingBottom: 48 }}>
        <BranchForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          submitError={submitError}
          cancelLabel="Hủy"
          submitLabel="Tạo chi nhánh"
        />
      </div>

      {/* Post-create cashier dialog */}
      {createdBranch && (
        <CashierSuggestionDialog
          branch={createdBranch}
          onCreateCashier={handleCreateCashierNow}
          onSkip={handleSkipCashier}
        />
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pop-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

// ── Post-create cashier suggestion dialog ────────────────────────────────────
function CashierSuggestionDialog({
  branch, onCreateCashier, onSkip,
}: {
  branch: Branch;
  onCreateCashier: () => void;
  onSkip: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15, 23, 42, 0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 16,
        animation: 'fade-in 0.15s ease-out',
      }}
      onClick={onSkip}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: 16,
          width: '100%', maxWidth: 480,
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
          animation: 'pop-in 0.2s ease-out',
          overflow: 'hidden',
        }}
      >
        {/* Icon header */}
        <div style={{
          padding: '28px 28px 16px',
          textAlign: 'center',
          background: '#F0FDF4',
          borderBottom: '1px solid #DCFCE7',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: COLORS.success,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12, boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 18, fontWeight: 700, color: COLORS.text, margin: 0,
          }}>
            Chi nhánh đã được tạo thành công
          </h3>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 28px 28px' }}>
          <div style={{
            padding: '12px 14px',
            background: '#FEF9C3', borderRadius: 10,
            border: '1px solid #FDE68A',
            marginBottom: 16,
          }}>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 14, color: '#78350F',
              margin: 0, lineHeight: 1.5,
            }}>
              Để chi nhánh <strong>{branch.branchName}</strong> có thể quét và xác nhận voucher,
              bạn nên tạo tài khoản <strong>Thu ngân</strong> ngay bây giờ.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              type="button"
              onClick={onCreateCashier}
              autoFocus
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', padding: '12px 20px',
                background: COLORS.primary, color: 'white',
                border: 'none', borderRadius: 10,
                fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = COLORS.primaryHover)}
              onMouseLeave={e => (e.currentTarget.style.background = COLORS.primary)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Tạo tài khoản Thu ngân
            </button>

            <button
              type="button"
              onClick={onSkip}
              style={{
                width: '100%', padding: '12px 20px',
                background: 'white', color: COLORS.textSecondary,
                border: `1.5px solid ${COLORS.border}`, borderRadius: 10,
                fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = COLORS.textSecondary;
                e.currentTarget.style.color = COLORS.text;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = COLORS.border;
                e.currentTarget.style.color = COLORS.textSecondary;
              }}
            >
              Để sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
