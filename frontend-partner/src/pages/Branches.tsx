import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiListBranches, apiDeleteBranch } from '../services/branch.service';
import type { Branch } from '../services/branch.service';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import type { ConfirmDialogProps } from '../components/common/ConfirmDialog';

// ── Design tokens (matching Vouchers.tsx) ─────────────────────────────────────
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
} as const;

// ── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

// ── Component ───────────────────────────────────────────────────────────────
export function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Action loading
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);

  const fetchBranches = async () => {
    try {
      const data = await apiListBranches();
      setBranches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách chi nhánh');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch — effect just SUBSCRIBES; all setState happens in async
  // callback (allowed by `set-state-in-effect` rule).
  const [fetchTick, setFetchTick] = useState(0);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await fetchBranches();
    })();
    return () => { cancelled = true; };
  }, [fetchTick]);

  // Trigger refresh from UI — setLoading(true) is in an event handler, not
  // in the effect body, so it's allowed.
  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    setFetchTick(t => t + 1);
  };

  // Filtered list
  const filteredBranches = debouncedSearch
    ? branches.filter(b =>
        b.branchName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        b.address.toLowerCase().includes(debouncedSearch.toLowerCase()),
      )
    : branches;

  // ── Delete action ────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget.branchId);
    setDeleteTarget(null);
    try {
      await apiDeleteBranch(deleteTarget.branchId);
      toast.success('Đã xóa chi nhánh thành công.');
      handleRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xóa thất bại');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteDialogProps = (): ConfirmDialogProps | null =>
    deleteTarget
      ? {
          title: 'Xóa chi nhánh này?',
          description: `Chi nhánh "${deleteTarget.branchName}" sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.`,
          confirmText: 'Xóa chi nhánh',
          cancelText: 'Hủy',
          variant: 'danger',
          loading: actionLoading !== null,
          onConfirm: handleDeleteConfirm,
          onCancel: () => setDeleteTarget(null),
        }
      : null;

  return (
    <div style={{ background: COLORS.bgPage, minHeight: '100vh' }}>
      {/* ── Page Header ─────────────────────────────────── */}
      <div style={{ background: 'white', borderBottom: `1px solid ${COLORS.border}`, padding: '24px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800, color: COLORS.text, marginBottom: 4 }}>
                Quản lý Chi nhánh
              </h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: COLORS.textSecondary }}>
                Quản lý các chi nhánh và nhân viên thu ngân
              </p>
            </div>
            <Link
              to="/branches/create"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 24px',
                background: COLORS.primary,
                color: 'white',
                fontFamily: 'Inter, sans-serif',
                fontSize: 14, fontWeight: 700,
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
              Tạo Chi nhánh
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
                placeholder="Tìm kiếm chi nhánh..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '10px 16px 10px 40px',
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

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
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
                background: 'white', borderRadius: 16, padding: 20,
                display: 'flex', gap: 16, alignItems: 'center',
                border: `1px solid ${COLORS.border}`,
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#E2E8F0', animation: 'pulse 1.5s ease-in-out infinite' }} />
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
            textAlign: 'center', padding: '64px 24px',
            background: 'white', borderRadius: 16, border: `1px solid ${COLORS.border}`,
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
              onClick={handleRefresh}
              style={{
                padding: '10px 24px', background: COLORS.primary, color: 'white',
                border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >Thử lại</button>
          </div>
        ) : filteredBranches.length === 0 ? (
          /* Empty state */
          <div style={{
            textAlign: 'center', padding: '64px 24px',
            background: 'white', borderRadius: 16, border: `1px solid ${COLORS.border}`,
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20, background: '#F1F5F9',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 18, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>
              {debouncedSearch ? 'Không tìm thấy chi nhánh' : 'Chưa có chi nhánh nào'}
            </h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 }}>
              {debouncedSearch
                ? 'Thử thay đổi từ khóa tìm kiếm'
                : 'Tạo chi nhánh đầu tiên của bạn'}
            </p>
            {!debouncedSearch && (
              <Link
                to="/branches/create"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 24px', background: COLORS.primary, color: 'white',
                  fontSize: 14, fontWeight: 700, borderRadius: 10, textDecoration: 'none',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Tạo Chi nhánh
              </Link>
            )}
          </div>
        ) : (
          <>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: COLORS.textSecondary, marginBottom: 16 }}>
              Tìm thấy {filteredBranches.length} chi nhánh
            </p>

            {/* ── Branch Cards ───────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredBranches.map(branch => {
                const isActionLoading = actionLoading === branch.branchId;

                return (
                  <div
                    key={branch.branchId}
                    style={{
                      display: 'flex', gap: 16, padding: 16,
                      background: COLORS.bgCard,
                      borderRadius: 16,
                      border: `1px solid #F1F5F9`,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                      transition: 'all 0.25s ease',
                      opacity: isActionLoading ? 0.6 : 1,
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
                    {/* Icon */}
                    <div style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: '#E8F4FA',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
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
                          }}>
                            {branch.branchName}
                          </h3>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: COLORS.textSecondary }}>
                          {branch.address && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                              {branch.address}
                            </span>
                          )}
                          {branch.phoneNumber && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.93 3.52 2 2 0 0 1 3.91 1.34h3a2 2 0 0 1 2 1.72c.13 1 .39 1.99.75 2.95a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l.75-.75a2 2 0 0 1 2.11-.45c.96.36 1.95.62 2.95.75a2 2 0 0 1 1.72 2.02z" />
                              </svg>
                              {branch.phoneNumber}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, marginTop: 4 }}>
                          {/* Cashier status */}
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            color: branch.cashier ? COLORS.success : COLORS.textMuted,
                          }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            {branch.cashier
                              ? `Thu ngân: ${branch.cashier.email}`
                              : 'Chưa phân công thu ngân'}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>
                          Ngày tạo: {formatDate(branch.createdAt as unknown as string)}
                        </div>
                      </div>

                      {/* Bottom: Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                        <div style={{ fontSize: 13, color: COLORS.textMuted }}>
                          {branch._count.voucherBranches} voucher áp dụng
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {/* View */}
                          <Link
                            to={`/branches/${branch.branchId}`}
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
                          <Link
                            to={`/branches/${branch.branchId}/edit`}
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
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Sửa
                          </Link>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTarget(branch)}
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
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Confirm dialog */}
      {deleteDialogProps() && <ConfirmDialog {...deleteDialogProps()!} />}

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
