import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  apiListVouchers,
  apiSubmitVoucher,
  apiDeleteVoucher,
} from '../services/voucher.service';
import type { VoucherQueryParams } from '../services/voucher.service';
import type { Voucher, ApprovalStatus, Pagination } from '../types/voucher';

// ── Design tokens (matching Customer) ───────────────────────────────────────
const COLORS = {
  primary: '#0E76A8',
  primaryHover: '#0A5C87',
  text: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  bgPage: '#F8FAFC',
  bgCard: '#ffffff',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
} as const;

const BADGE_MAP: Record<ApprovalStatus, { label: string; color: string; bg: string }> = {
  Draft:    { label: 'Nháp',       color: '#64748B', bg: '#F1F5F9' },
  Pending:  { label: 'Chờ duyệt',  color: '#F59E0B', bg: '#FEF3C7' },
  Approved: { label: 'Đã duyệt',   color: '#10B981', bg: '#ECFDF5' },
  Rejected: { label: 'Từ chối',     color: '#EF4444', bg: '#FEF2F2' },
};

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '',         label: 'Tất cả trạng thái' },
  { value: 'Draft',    label: 'Nháp' },
  { value: 'Pending',  label: 'Chờ duyệt' },
  { value: 'Approved', label: 'Đã duyệt' },
  { value: 'Rejected', label: 'Từ chối' },
];

// ── Helpers ─────────────────────────────────────────────────────────────────
function formatPrice(p: string | number): string {
  return Number(p).toLocaleString('vi-VN') + 'đ';
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function canEdit(status: ApprovalStatus): boolean {
  return status === 'Draft' || status === 'Rejected';
}
function canSubmit(status: ApprovalStatus): boolean {
  return status === 'Draft' || status === 'Rejected';
}
function canDelete(status: ApprovalStatus): boolean {
  return status === 'Draft';
}

// ── Component ───────────────────────────────────────────────────────────────
export function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Action loading
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: VoucherQueryParams = {
        page: currentPage,
        limit: 10,
      };
      if (statusFilter) params.status = statusFilter as ApprovalStatus;
      if (debouncedSearch) params.q = debouncedSearch;

      const result = await apiListVouchers(params);
      setVouchers(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  // Reset page when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, debouncedSearch]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleSubmit = async (voucher: Voucher) => {
    if (!window.confirm(`Gửi duyệt voucher "${voucher.title}"?`)) return;
    setActionLoading(voucher.voucherId);
    try {
      await apiSubmitVoucher(voucher.voucherId);
      await fetchVouchers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gửi duyệt thất bại');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (voucher: Voucher) => {
    if (!window.confirm(`Xóa voucher "${voucher.title}"? Hành động này không thể hoàn tác.`)) return;
    setActionLoading(voucher.voucherId);
    try {
      await apiDeleteVoucher(voucher.voucherId);
      await fetchVouchers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Xóa thất bại');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ background: COLORS.bgPage, minHeight: '100vh' }}>
      {/* ── Page Header ─────────────────────────────────── */}
      <div style={{ background: 'white', borderBottom: `1px solid ${COLORS.border}`, padding: '24px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800, color: COLORS.text, marginBottom: 4 }}>
                Quản lý Voucher
              </h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: COLORS.textSecondary }}>
                Tạo, quản lý và theo dõi voucher của bạn
              </p>
            </div>
            <Link
              to="/vouchers/create"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 24px',
                background: COLORS.primary,
                color: 'white',
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                borderRadius: 10,
                textDecoration: 'none',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = COLORS.primaryHover)}
              onMouseLeave={e => (e.currentTarget.style.background = COLORS.primary)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Tạo Voucher
            </Link>
          </div>

          {/* ── Toolbar ──────────────────────────────────── */}
          <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="2"
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm voucher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 16px 10px 40px',
                  border: `1.5px solid ${COLORS.border}`,
                  borderRadius: 10,
                  fontSize: 14,
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                  background: COLORS.bgPage,
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = COLORS.primary)}
                onBlur={e => (e.currentTarget.style.borderColor = COLORS.border)}
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{
                padding: '10px 16px',
                border: `1.5px solid ${COLORS.border}`,
                borderRadius: 10,
                fontSize: 14,
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
                cursor: 'pointer',
                background: 'white',
                color: COLORS.text,
                minWidth: 170,
              }}
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Refresh */}
            <button
              onClick={fetchVouchers}
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 16px',
                border: `1.5px solid ${COLORS.border}`,
                borderRadius: 10,
                background: 'white',
                fontSize: 14,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                color: COLORS.textSecondary,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.primary; e.currentTarget.style.color = COLORS.primary; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textSecondary; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}>
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Làm mới
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 48px' }}>
        {loading ? (
          /* Loading skeleton */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                background: 'white',
                borderRadius: 16,
                padding: 20,
                display: 'flex',
                gap: 16,
                alignItems: 'center',
                border: `1px solid ${COLORS.border}`,
              }}>
                <div style={{ width: 100, height: 72, borderRadius: 12, background: '#E2E8F0', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ width: '40%', height: 16, borderRadius: 6, background: '#E2E8F0', marginBottom: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <div style={{ width: '60%', height: 12, borderRadius: 6, background: '#F1F5F9', animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error state */
          <div style={{
            textAlign: 'center',
            padding: '64px 24px',
            background: 'white',
            borderRadius: 16,
            border: `1px solid ${COLORS.border}`,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, background: '#FEF2F2',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={COLORS.error} strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: COLORS.error, marginBottom: 16 }}>{error}</p>
            <button
              onClick={fetchVouchers}
              style={{
                padding: '10px 24px',
                background: COLORS.primary,
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >Thử lại</button>
          </div>
        ) : vouchers.length === 0 ? (
          /* Empty state */
          <div style={{
            textAlign: 'center',
            padding: '64px 24px',
            background: 'white',
            borderRadius: 16,
            border: `1px solid ${COLORS.border}`,
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20, background: '#F1F5F9',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="1.5">
                <path d="M20 12v10H4V12" />
                <path d="M2 7h20v5H2z" />
                <path d="M12 22V7" />
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
              </svg>
            </div>
            <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 18, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>
              {debouncedSearch || statusFilter ? 'Không tìm thấy voucher' : 'Chưa có voucher nào'}
            </h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 }}>
              {debouncedSearch || statusFilter
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                : 'Bắt đầu tạo voucher đầu tiên của bạn'}
            </p>
            {!debouncedSearch && !statusFilter && (
              <Link
                to="/vouchers/create"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 24px',
                  background: COLORS.primary,
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 700,
                  borderRadius: 10,
                  textDecoration: 'none',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Tạo Voucher
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Result count */}
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: COLORS.textSecondary, marginBottom: 16 }}>
              Tìm thấy {pagination.total} voucher
            </p>

            {/* ── Voucher Cards ──────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {vouchers.map(voucher => {
                const badge = BADGE_MAP[voucher.approvalStatus];
                const discount = Math.round((1 - Number(voucher.salePrice) / Number(voucher.originalPrice)) * 100);
                const imageUrl = voucher.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop';
                const isActionLoading = actionLoading === voucher.voucherId;

                return (
                  <div
                    key={voucher.voucherId}
                    style={{
                      display: 'flex',
                      gap: 16,
                      padding: 16,
                      background: COLORS.bgCard,
                      borderRadius: 16,
                      border: `1px solid #F1F5F9`,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                      transition: 'all 0.25s ease',
                      opacity: isActionLoading ? 0.6 : 1,
                      cursor: 'default',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(14,118,168,0.1)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Image */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img
                        src={imageUrl}
                        alt={voucher.title}
                        style={{ width: 120, height: 88, borderRadius: 12, objectFit: 'cover' }}
                      />
                      {discount > 0 && (
                        <span style={{
                          position: 'absolute', top: 6, left: 6,
                          background: COLORS.error, color: 'white',
                          fontSize: 10, fontWeight: 700,
                          padding: '2px 6px', borderRadius: 5,
                        }}>-{discount}%</span>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <h3 style={{
                            fontFamily: 'Manrope, sans-serif',
                            fontSize: 15, fontWeight: 700, color: COLORS.text,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            margin: 0,
                          }}>{voucher.title}</h3>
                          {/* Approval badge */}
                          <span style={{
                            fontSize: 11, fontWeight: 600,
                            color: badge.color, background: badge.bg,
                            padding: '2px 10px', borderRadius: 6,
                            whiteSpace: 'nowrap', flexShrink: 0,
                          }}>{badge.label}</span>
                          {/* Display status */}
                          {voucher.approvalStatus === 'Approved' && (
                            <span style={{
                              fontSize: 11, fontWeight: 600,
                              color: voucher.displayStatus === 'Visible' ? COLORS.success : COLORS.textMuted,
                              background: voucher.displayStatus === 'Visible' ? '#ECFDF5' : '#F1F5F9',
                              padding: '2px 10px', borderRadius: 6,
                              whiteSpace: 'nowrap', flexShrink: 0,
                            }}>{voucher.displayStatus === 'Visible' ? 'Hiển thị' : 'Ẩn'}</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: COLORS.textSecondary }}>
                          {voucher.category && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                            }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                                <line x1="4" y1="22" x2="4" y2="15" />
                              </svg>
                              {voucher.category.categoryName}
                            </span>
                          )}
                          <span>SL: {voucher.availableQuantity}/{voucher.totalQuantity}</span>
                          <span>{formatDate(voucher.startDate)} – {formatDate(voucher.endDate)}</span>
                        </div>
                      </div>

                      {/* Bottom: Price + Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                          <span style={{ fontSize: 12, color: COLORS.textMuted, textDecoration: 'line-through' }}>
                            {formatPrice(voucher.originalPrice)}
                          </span>
                          <span style={{ fontSize: 17, fontWeight: 800, color: COLORS.primary }}>
                            {formatPrice(voucher.salePrice)}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: 8 }}>
                          {/* View */}
                          <Link
                            to={`/vouchers/${voucher.voucherId}`}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              padding: '6px 12px',
                              border: `1px solid ${COLORS.border}`,
                              borderRadius: 8,
                              fontSize: 12, fontWeight: 600, color: COLORS.textSecondary,
                              background: 'white',
                              textDecoration: 'none',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.primary; e.currentTarget.style.color = COLORS.primary; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textSecondary; }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            Xem
                          </Link>

                          {/* Edit */}
                          {canEdit(voucher.approvalStatus) && (
                            <Link
                              to={`/vouchers/${voucher.voucherId}/edit`}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                padding: '6px 12px',
                                border: `1px solid ${COLORS.border}`,
                                borderRadius: 8,
                                fontSize: 12, fontWeight: 600, color: COLORS.textSecondary,
                                background: 'white',
                                textDecoration: 'none',
                                transition: 'all 0.15s',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.info; e.currentTarget.style.color = COLORS.info; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textSecondary; }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                              Sửa
                            </Link>
                          )}

                          {/* Submit for approval */}
                          {canSubmit(voucher.approvalStatus) && (
                            <button
                              onClick={() => handleSubmit(voucher)}
                              disabled={isActionLoading}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                padding: '6px 12px',
                                border: 'none',
                                borderRadius: 8,
                                fontSize: 12, fontWeight: 600,
                                color: 'white', background: COLORS.warning,
                                cursor: isActionLoading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.15s',
                              }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                              </svg>
                              Gửi duyệt
                            </button>
                          )}

                          {/* Delete */}
                          {canDelete(voucher.approvalStatus) && (
                            <button
                              onClick={() => handleDelete(voucher)}
                              disabled={isActionLoading}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                padding: '6px 12px',
                                border: `1px solid #FECACA`,
                                borderRadius: 8,
                                fontSize: 12, fontWeight: 600,
                                color: COLORS.error, background: '#FEF2F2',
                                cursor: isActionLoading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.15s',
                              }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                              Xóa
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Pagination (matching Customer) ──────────── */}
            {pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  style={{
                    padding: '8px 16px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 8,
                    background: 'white',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.5 : 1,
                    fontSize: 14,
                  }}
                >←</button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      padding: '8px 16px',
                      border: page === currentPage ? `2px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`,
                      borderRadius: 8,
                      background: page === currentPage ? '#E8F4FA' : 'white',
                      color: page === currentPage ? COLORS.primary : COLORS.textSecondary,
                      fontWeight: page === currentPage ? 700 : 400,
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                  >{page}</button>
                ))}
                <button
                  disabled={currentPage === pagination.totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  style={{
                    padding: '8px 16px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 8,
                    background: 'white',
                    cursor: currentPage === pagination.totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === pagination.totalPages ? 0.5 : 1,
                    fontSize: 14,
                  }}
                >→</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
