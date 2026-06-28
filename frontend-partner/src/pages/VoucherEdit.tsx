import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { VoucherForm } from '../components/voucher/VoucherForm';
import { apiGetVoucher, apiUpdateVoucher } from '../services/voucher.service';
import { ApiException } from '../services/api-client';
import { voucherDetailToFormData } from '../utils/voucherForm';
import type { VoucherDetail } from '../types/voucher';
import type { ApprovalStatus } from '../types/voucher';

// ── Design tokens (matching VoucherCreate / VoucherDetail) ──────────────────
const COLORS = {
  primary: '#0E76A8',
  primaryHover: '#0A5C87',
  text: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  bgPage: '#F8FAFC',
  error: '#EF4444',
} as const;

const EDITABLE_STATUSES: ApprovalStatus[] = ['Draft', 'Rejected'];

const APPROVAL_LABEL: Record<ApprovalStatus, string> = {
  Draft: 'Nháp',
  Pending: 'Chờ duyệt',
  Approved: 'Đã duyệt',
  Rejected: 'Từ chối',
};

// ── Component ───────────────────────────────────────────────────────────────
export function VoucherEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const voucherId = Number(id);

  const [voucher, setVoucher] = useState<VoucherDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load voucher
  useEffect(() => {
    if (!voucherId || isNaN(voucherId)) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const data = await apiGetVoucher(voucherId);
        if (!cancelled) setVoucher(data);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiException && err.statusCode === 404) {
          setNotFound(true);
        } else {
          setError(err instanceof Error ? err.message : 'Không thể tải voucher');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [voucherId]);

  const handleCancel = () => navigate('/vouchers');

  const handleSubmit = async (payload: Record<string, unknown>) => {
    if (!voucher) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await apiUpdateVoucher(voucher.voucherId, payload);
      alert('Cập nhật voucher thành công!');
      navigate('/vouchers', { replace: true });
    } catch (err) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Cập nhật voucher thất bại';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ background: COLORS.bgPage, minHeight: '100vh' }}>
      {/* ── Page Header ──────────────────────────────── */}
      <div style={{ background: 'white', borderBottom: `1px solid ${COLORS.border}`, padding: '24px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: 12, fontSize: 13, color: COLORS.textSecondary }}>
            <Link to="/vouchers" style={{ color: COLORS.primary, textDecoration: 'none', fontWeight: 600 }}>
              Quản lý Voucher
            </Link>
            <span style={{ margin: '0 8px' }}>/</span>
            {voucher ? (
              <>
                <Link
                  to={`/vouchers/${voucher.voucherId}`}
                  style={{ color: COLORS.primary, textDecoration: 'none', fontWeight: 600 }}
                >
                  {voucher.title}
                </Link>
                <span style={{ margin: '0 8px' }}>/</span>
                <span style={{ color: COLORS.text, fontWeight: 600 }}>Chỉnh sửa</span>
              </>
            ) : (
              <span style={{ color: COLORS.text, fontWeight: 600 }}>Chỉnh sửa</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800, color: COLORS.text, marginBottom: 4 }}>
                Chỉnh sửa Voucher
              </h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: COLORS.textSecondary }}>
                Cập nhật thông tin voucher. Chỉ áp dụng cho voucher ở trạng thái Nháp hoặc Từ chối.
              </p>
            </div>
            <Link
              to="/vouchers"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 18px',
                background: 'white',
                color: COLORS.textSecondary,
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                fontWeight: 600,
                borderRadius: 10,
                textDecoration: 'none',
                border: `1.5px solid ${COLORS.border}`,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = COLORS.primary;
                e.currentTarget.style.color = COLORS.primary;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = COLORS.border;
                e.currentTarget.style.color = COLORS.textSecondary;
              }}
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

      {/* ── Content ───────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 48px' }}>
        {loading ? (
          <LoadingBlock />
        ) : notFound ? (
          <NotEditableCard
            title="Không tìm thấy voucher"
            description="Voucher này không tồn tại hoặc đã bị xóa."
            showBack
          />
        ) : error ? (
          <NotEditableCard
            title="Đã xảy ra lỗi"
            description={error}
            showBack
          />
        ) : !voucher ? (
          <NotEditableCard
            title="Không có dữ liệu"
            description="Không thể tải thông tin voucher."
            showBack
          />
        ) : !EDITABLE_STATUSES.includes(voucher.approvalStatus) ? (
          <NotEditableCard
            title="Voucher này không thể chỉnh sửa"
            description={`Voucher đang ở trạng thái "${APPROVAL_LABEL[voucher.approvalStatus]}". Chỉ voucher ở trạng thái Nháp hoặc Từ chối mới được phép chỉnh sửa.`}
            status={voucher.approvalStatus}
            showBack
          />
        ) : (
          <VoucherForm
            mode="edit"
            initialData={voucherDetailToFormData(voucher)}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            submitError={submitError}
            cancelLabel="Hủy"
            submitLabel="Lưu thay đổi"
          />
        )}
      </div>
    </div>
  );
}

// ── Read-only card shown when voucher is not editable ───────────────────────
function NotEditableCard({
  title, description, status, showBack,
}: {
  title: string;
  description: string;
  status?: ApprovalStatus;
  showBack?: boolean;
}) {
  const navigate = useNavigate();
  const statusColor =
    status === 'Pending' ? '#F59E0B' :
    status === 'Approved' ? COLORS.error :
    COLORS.text;

  return (
    <div style={{
      maxWidth: 560,
      margin: '0 auto',
      background: 'white',
      borderRadius: 16,
      padding: '48px 32px',
      border: `1px solid ${COLORS.border}`,
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      textAlign: 'center',
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: '#FEF2F2',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={COLORS.error} strokeWidth="1.8">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <h2 style={{
        fontFamily: 'Manrope, sans-serif',
        fontSize: 20, fontWeight: 700,
        color: COLORS.text, marginBottom: 10,
      }}>
        {title}
      </h2>

      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 28,
        lineHeight: 1.6,
      }}>
        {description}
      </p>

      {status && (
        <p style={{
          fontSize: 13,
          color: COLORS.textMuted,
          marginBottom: 28,
        }}>
          Trạng thái hiện tại:{' '}
          <span style={{
            fontWeight: 700, color: statusColor,
          }}>
            {APPROVAL_LABEL[status]}
          </span>
        </p>
      )}

      {showBack && (
        <button
          type="button"
          onClick={() => navigate('/vouchers')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 28px',
            background: COLORS.primary,
            color: 'white',
            border: 'none',
            borderRadius: 10,
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = COLORS.primaryHover)}
          onMouseLeave={e => (e.currentTarget.style.background = COLORS.primary)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Quay lại danh sách
        </button>
      )}
    </div>
  );
}

function LoadingBlock() {
  return (
    <div style={{
      background: 'white', borderRadius: 16, padding: 32,
      border: `1px solid ${COLORS.border}`,
    }}>
      <div style={{ width: '40%', height: 24, borderRadius: 6, background: '#E2E8F0', marginBottom: 24, animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ width: '90%', height: 14, borderRadius: 6, background: '#F1F5F9', marginBottom: 12, animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ width: '70%', height: 14, borderRadius: 6, background: '#F1F5F9', marginBottom: 12, animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ width: '80%', height: 14, borderRadius: 6, background: '#F1F5F9', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}