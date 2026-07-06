import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { VoucherForm } from '../components/voucher/VoucherForm';
import { apiCreateVoucher } from '../services/voucher.service';
import { apiListCategories } from '../services/category.service';
import { ApiException } from '../services/api-client';
import type { VoucherCategory } from '../types/voucher';
import { parseVoucherCreateSearchParams } from '../utils/searchParams';

// ── Design tokens (matching Vouchers list + Customer) ────────────────────────
const COLORS = {
  primary: '#0E76A8',
  text: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  bgPage: '#F8FAFC',
} as const;

export function VoucherCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [categories, setCategories] = useState<VoucherCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Parse ?branch=... bằng Zod. Invalid → bỏ qua, form mở không preselect.
  const { branch: preselectedBranchId } = parseVoucherCreateSearchParams(searchParams);
  const preselectedBranchIds = preselectedBranchId ? [preselectedBranchId] : [];

  // Derived loading state — true khi chưa có categories & chưa có lỗi & chưa bỏ qua
  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await apiListCategories();
      setCategories(data);
    } catch {
      toast.error('Không thể tải danh mục. Vui lòng thử lại.');
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await loadCategories();
    })();
    return () => { cancelled = true; };
    // We intentionally depend only on mount — categories don't need re-fetch
  }, []);

  const handleCancel = () => {
    navigate('/vouchers');
  };

  const handleSubmit = async (payload: Record<string, unknown>) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await apiCreateVoucher(payload);
      toast.success('Tạo voucher thành công! Voucher đã được lưu vào danh sách nháp.');
      navigate('/vouchers', { replace: true });
    } catch (err) {
      const message =
        err instanceof ApiException
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Tạo voucher thất bại';
      setSubmitError(message);
      // Re-throw is unnecessary — form just shows submitError
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ background: COLORS.bgPage, minHeight: '100vh' }}>
      {/* ── Page Header ─────────────────────────────────── */}
      <div style={{ background: 'white', borderBottom: `1px solid ${COLORS.border}`, padding: '24px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: 12, fontSize: 13, color: COLORS.textSecondary }}>
            <Link to="/vouchers" style={{ color: COLORS.primary, textDecoration: 'none', fontWeight: 600 }}>
              Quản lý Voucher
            </Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: COLORS.text, fontWeight: 600 }}>Tạo Voucher</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800, color: COLORS.text, marginBottom: 4 }}>
                Tạo Voucher mới
              </h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: COLORS.textSecondary }}>
                Điền thông tin bên dưới để tạo voucher. Voucher sẽ được lưu ở trạng thái nháp, bạn có thể gửi duyệt sau.
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

      {/* ── Content ──────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 48px' }}>
        <VoucherForm
          mode="create"
          preselectedBranchIds={preselectedBranchIds}
          categories={categories}
          loadingCategories={loadingCategories}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          submitError={submitError}
          cancelLabel="Hủy"
          submitLabel="Lưu nháp"
        />
      </div>
    </div>
  );
}