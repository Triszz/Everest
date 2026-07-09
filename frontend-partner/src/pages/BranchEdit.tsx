import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BranchForm } from '../components/branch/BranchForm';
import { apiGetBranch, apiUpdateBranch } from '../services/branch.service';
import { ApiException } from '../services/api-client';
import type { Branch } from '../services/branch.service';
import type { UpdateBranchInput } from '../types/branch';

// ── Design tokens ───────────────────────────────────────────────────────────────
const COLORS = {
  primary: '#0E76A8',
  text: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  bgPage: '#F8FAFC',
} as const;

export function BranchEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const parsedId = id ? Number(id) : NaN;
  const branchId = Number.isFinite(parsedId) && parsedId > 0 ? parsedId : null;
  const invalidId = branchId === null;

  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load branch — effect only SUBSCRIBES to branchId; all setState happens
  // in async callbacks (which the `set-state-in-effect` rule allows).
  useEffect(() => {
    if (invalidId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGetBranch(branchId!);
        if (!cancelled) setBranch(data);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiException && err.statusCode === 404) {
          setNotFound(true);
        } else {
          setError(err instanceof Error ? err.message : 'Không thể tải thông tin chi nhánh');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [branchId, invalidId]);

  const handleCancel = () => navigate('/branches');

  const handleSubmit = async (payload: UpdateBranchInput) => {
    if (!branch) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await apiUpdateBranch(branch.branchId, payload);
      toast.success('Cập nhật chi nhánh thành công!');
      navigate('/branches', { replace: true });
    } catch (err) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Cập nhật thất bại';
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
            <Link to="/branches" style={{ color: COLORS.primary, textDecoration: 'none', fontWeight: 600 }}>
              Quản lý Chi nhánh
            </Link>
            <span style={{ margin: '0 8px' }}>/</span>
            {branch ? (
              <>
                <Link
                  to={`/branches/${branch.branchId}`}
                  style={{ color: COLORS.primary, textDecoration: 'none', fontWeight: 600 }}
                >
                  {branch.branchName}
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
                Chỉnh sửa Chi nhánh
              </h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: COLORS.textSecondary }}>
                Cập nhật thông tin chi nhánh
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

      {/* ── Content ───────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 48px' }}>
        {loading ? (
          <LoadingBlock />
        ) : invalidId || notFound ? (
          <NotEditableCard
            title="Không tìm thấy chi nhánh"
            description="Chi nhánh này không tồn tại hoặc đã bị xóa."
            showBack
          />
        ) : error ? (
          <NotEditableCard
            title="Đã xảy ra lỗi"
            description={error}
            showBack
          />
        ) : !branch ? (
          <NotEditableCard
            title="Không có dữ liệu"
            description="Không thể tải thông tin chi nhánh."
            showBack
          />
        ) : (
          <BranchForm
            mode="edit"
            initialData={{
              branchName: branch.branchName,
              address: branch.address,
              phoneNumber: branch.phoneNumber ?? '',
            }}
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

function NotEditableCard({
  title, description, showBack,
}: {
  title: string;
  description: string;
  showBack?: boolean;
}) {
  const navigate = useNavigate();

  return (
    <div style={{
      maxWidth: 560, margin: '0 auto',
      background: 'white', borderRadius: 16, padding: '48px 32px',
      border: `1px solid ${COLORS.border}`,
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      textAlign: 'center',
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20, background: '#FEF2F2',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth="1.8">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 20, fontWeight: 700, color: COLORS.text, marginBottom: 10 }}>
        {title}
      </h2>

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: COLORS.textSecondary, marginBottom: 28, lineHeight: 1.6 }}>
        {description}
      </p>

      {showBack && (
        <button
          type="button"
          onClick={() => navigate('/branches')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 28px',
            background: COLORS.primary, color: 'white',
            border: 'none', borderRadius: 10,
            fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#0A5C87')}
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
    <div style={{ background: 'white', borderRadius: 16, padding: 32, border: `1px solid ${COLORS.border}` }}>
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
