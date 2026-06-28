import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiGetVoucher } from '../services/voucher.service';
import { ApiException } from '../services/api-client';
import type { VoucherDetail } from '../types/voucher';
import type { ApprovalStatus, DisplayStatus } from '../types/voucher';

// ── Design tokens (matching Vouchers list + VoucherCreate) ──────────────────
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
  info: '#3B82F6',
} as const;

const APPROVAL_BADGE: Record<ApprovalStatus, { label: string; color: string; bg: string }> = {
  Draft:    { label: 'Nháp',      color: '#64748B', bg: '#F1F5F9' },
  Pending:  { label: 'Chờ duyệt', color: '#F59E0B', bg: '#FEF3C7' },
  Approved: { label: 'Đã duyệt',  color: '#10B981', bg: '#ECFDF5' },
  Rejected: { label: 'Từ chối',   color: '#EF4444', bg: '#FEF2F2' },
};

const DISPLAY_BADGE: Record<DisplayStatus, { label: string; color: string; bg: string }> = {
  Visible: { label: 'Hiển thị', color: '#10B981', bg: '#ECFDF5' },
  Hidden:  { label: 'Ẩn',       color: '#64748B', bg: '#F1F5F9' },
};

// ── Helpers ─────────────────────────────────────────────────────────────────
function formatPrice(p: string | number): string {
  return Number(p).toLocaleString('vi-VN') + 'đ';
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop';

// ── Component ───────────────────────────────────────────────────────────────
export function VoucherDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const voucherId = Number(id);

  const [voucher, setVoucher] = useState<VoucherDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

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
          setError(err instanceof Error ? err.message : 'Không thể tải chi tiết voucher');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [voucherId]);

  const handleBack = () => navigate('/vouchers');

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
            <span style={{ color: COLORS.text, fontWeight: 600 }}>Chi tiết Voucher</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800, color: COLORS.text, marginBottom: 4 }}>
                Chi tiết Voucher
              </h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: COLORS.textSecondary }}>
                Xem thông tin chi tiết và thống kê của voucher
              </p>
            </div>

            <button
              type="button"
              onClick={handleBack}
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
                border: `1.5px solid ${COLORS.border}`,
                cursor: 'pointer',
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
              Quay lại
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 48px' }}>
        {loading ? (
          <DetailSkeleton />
        ) : notFound ? (
          <EmptyState
            icon={
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            }
            title="Không tìm thấy voucher"
            description="Voucher này không tồn tại hoặc đã bị xóa."
            action={
              <button
                onClick={handleBack}
                style={{
                  padding: '10px 24px',
                  background: COLORS.primary, color: 'white',
                  border: 'none', borderRadius: 10,
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}
              >
                Quay lại danh sách
              </button>
            }
          />
        ) : error ? (
          <EmptyState
            icon={
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={COLORS.error} strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            }
            title="Đã xảy ra lỗi"
            description={error}
            action={
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 24px',
                  background: COLORS.primary, color: 'white',
                  border: 'none', borderRadius: 10,
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}
              >
                Thử lại
              </button>
            }
          />
        ) : voucher ? (
          <VoucherDetailView voucher={voucher} />
        ) : null}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

// ── Sub-component: Read-only view ───────────────────────────────────────────
function VoucherDetailView({ voucher }: { voucher: VoucherDetail }) {
  const approval = APPROVAL_BADGE[voucher.approvalStatus];
  const display = DISPLAY_BADGE[voucher.displayStatus];
  const total = voucher.totalQuantity;
  const sold = voucher.stats.soldCount;
  const used = voucher.stats.usedCount;
  const remaining = Math.max(0, total - sold);
  const isEditable = voucher.approvalStatus === 'Draft' || voucher.approvalStatus === 'Rejected';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
      {/* LEFT: Main info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Card: Thông tin cơ bản */}
        <Card title="Thông tin cơ bản" iconBg="#E8F4FA" iconColor={COLORS.primary}>
          <Field label="Tên voucher" value={voucher.title} />
          <Field
            label="Danh mục"
            value={voucher.category?.categoryName ?? '—'}
          />
          <Field
            label="Mô tả"
            value={voucher.description ?? '—'}
            multiline
          />
          <Field
            label="Điều kiện áp dụng"
            value={voucher.applicationCondition ?? '—'}
            multiline
          />
        </Card>

        {/* Card: Giá & Số lượng */}
        <Card title="Giá & Số lượng" iconBg="#ECFDF5" iconColor={COLORS.success}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Giá gốc" value={formatPrice(voucher.originalPrice)} />
            <Field
              label="Giá bán"
              value={
                <span style={{ color: COLORS.primary, fontWeight: 800 }}>
                  {formatPrice(voucher.salePrice)}
                </span>
              }
            />
            <Field label="Tổng số lượng" value={String(total)} />
            <Field
              label="Số lượng còn lại"
              value={
                <span style={{ color: remaining > 0 ? COLORS.success : COLORS.error, fontWeight: 700 }}>
                  {remaining}
                </span>
              }
            />
            <Field label="Số ngày hiệu lực" value={`${voucher.expiryDays} ngày`} />
          </div>
        </Card>

        {/* Card: Thời gian */}
        <Card title="Thời gian bán" iconBg="#FEF3C7" iconColor="#F59E0B">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Ngày bắt đầu" value={formatDate(voucher.startDate)} />
            <Field label="Ngày kết thúc" value={formatDate(voucher.endDate)} />
          </div>
        </Card>

        {/* Card: Chi nhánh áp dụng */}
        <Card
          title="Chi nhánh áp dụng"
          iconBg="#FEF2F2"
          iconColor={COLORS.error}
          titleExtra={<span style={{ fontSize: 12, fontWeight: 400, color: COLORS.textMuted }}>(Tùy chọn)</span>}
        >
          {voucher.voucherBranches.length === 0 ? (
            <p style={{ fontSize: 14, color: COLORS.textMuted }}>Áp dụng cho tất cả chi nhánh</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {voucher.voucherBranches.map(vb => (
                <div
                  key={vb.branch.branchId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    background: COLORS.bgPage,
                    borderRadius: 10,
                    border: `1.5px solid transparent`,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>
                      {vb.branch.branchName}
                    </div>
                    {vb.branch.address && (
                      <div style={{ fontSize: 12, color: COLORS.textMuted }}>{vb.branch.address}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Card: Trạng thái & Thời điểm */}
        <Card title="Trạng thái & Lịch sử" iconBg="#F3E8FF" iconColor="#8B5CF6">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field
              label="Trạng thái duyệt"
              value={
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: approval.color, background: approval.bg,
                  padding: '4px 12px', borderRadius: 6,
                  display: 'inline-block',
                }}>
                  {approval.label}
                </span>
              }
            />
            <Field
              label="Hiển thị"
              value={
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: display.color, background: display.bg,
                  padding: '4px 12px', borderRadius: 6,
                  display: 'inline-block',
                }}>
                  {display.label}
                </span>
              }
            />
            <Field label="Ngày tạo" value={formatDate(voucher.createdAt)} />
            <Field label="Cập nhật lần cuối" value={formatDate(voucher.updatedAt)} />
          </div>
        </Card>
      </div>

      {/* RIGHT: Sidebar — Image + Stats + Edit CTA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 24 }}>
        {/* Card: Ảnh voucher */}
        <Card title="Ảnh voucher" iconBg="#F3E8FF" iconColor="#8B5CF6" noPadding>
          <div style={{ padding: 16 }}>
            <img
              src={voucher.imageUrl || FALLBACK_IMAGE}
              alt={voucher.title}
              style={{ width: '100%', borderRadius: 10, aspectRatio: '4/3', objectFit: 'cover' }}
            />
          </div>
        </Card>

        {/* Card: Thống kê */}
        <Card title="Thống kê" iconBg="#DBEAFE" iconColor={COLORS.info}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <StatRow
              label="Đã bán"
              value={sold}
              color={COLORS.primary}
              bg="#E8F4FA"
            />
            <StatRow
              label="Đã sử dụng"
              value={used}
              color={COLORS.warning}
              bg="#FEF3C7"
            />
            <StatRow
              label="Còn lại"
              value={remaining}
              color={COLORS.success}
              bg="#ECFDF5"
            />
          </div>
        </Card>

        {/* CTA: Edit (only for editable statuses) */}
        {isEditable && (
          <Link
            to={`/vouchers/${voucher.voucherId}/edit`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              width: '100%',
              padding: '12px 24px',
              background: COLORS.primary,
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = COLORS.primaryHover)}
            onMouseLeave={e => (e.currentTarget.style.background = COLORS.primary)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Chỉnh sửa voucher
          </Link>
        )}
      </div>
    </div>
  );
}

// ── Reusable building blocks (kept local to this page) ──────────────────────
function Card({
  title, iconBg, iconColor, children, titleExtra, noPadding,
}: {
  title: string;
  iconBg: string;
  iconColor: string;
  children: React.ReactNode;
  titleExtra?: React.ReactNode;
  noPadding?: boolean;
}) {
  return (
    <div style={{
      background: 'white',
      borderRadius: 16,
      padding: noPadding ? 0 : 24,
      border: '1px solid #F1F5F9',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    }}>
      <h2 style={{
        fontFamily: 'Manrope, sans-serif',
        fontSize: 16, fontWeight: 700, color: COLORS.text,
        marginBottom: noPadding ? 0 : 20,
        padding: noPadding ? '20px 24px 0' : undefined,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32, background: iconBg, borderRadius: 8,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
          </svg>
        </span>
        {title}
        {titleExtra}
      </h2>
      <div style={{
        padding: noPadding ? '16px 24px 24px' : 0,
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, multiline }: {
  label: string;
  value: React.ReactNode;
  multiline?: boolean;
}) {
  return (
    <div>
      <div style={{
        fontSize: 12, fontWeight: 600, color: COLORS.textMuted,
        textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 14,
        color: COLORS.text,
        fontWeight: 500,
        whiteSpace: multiline ? 'pre-wrap' : 'normal',
        wordBreak: 'break-word',
      }}>
        {value || '—'}
      </div>
    </div>
  );
}

function StatRow({ label, value, color, bg }: {
  label: string; value: number; color: string; bg: string;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 14px',
      background: bg, borderRadius: 10,
    }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{label}</span>
      <span style={{
        fontSize: 22, fontWeight: 800, color,
        fontFamily: 'Manrope, sans-serif',
      }}>
        {value.toLocaleString('vi-VN')}
      </span>
    </div>
  );
}

function EmptyState({
  icon, title, description, action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
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
        {icon}
      </div>
      <h3 style={{
        fontFamily: 'Manrope, sans-serif',
        fontSize: 18, fontWeight: 700, color: COLORS.text, marginBottom: 8,
      }}>
        {title}
      </h3>
      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 14, color: COLORS.textSecondary, marginBottom: 24,
      }}>
        {description}
      </p>
      {action}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            background: 'white', borderRadius: 16, padding: 24,
            border: `1px solid ${COLORS.border}`,
          }}>
            <div style={{ width: '30%', height: 18, borderRadius: 6, background: '#E2E8F0', marginBottom: 16, animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ width: '90%', height: 14, borderRadius: 6, background: '#F1F5F9', marginBottom: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ width: '70%', height: 14, borderRadius: 6, background: '#F1F5F9', animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{
          background: 'white', borderRadius: 16, padding: 24,
          border: `1px solid ${COLORS.border}`,
        }}>
          <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: 10, background: '#E2E8F0', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
      </div>
    </div>
  );
}