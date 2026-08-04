import { Link } from "react-router-dom";
import { REPORT_COLORS } from "./report.constants";
import { EmptyState } from "../common/EmptyState";
import { SkeletonTable } from "./report.skeleton";
import type { VoucherReportRow, PaginationInfo, VoucherSortBy } from "../../types/report";

interface VoucherReportTableProps {
  data?: VoucherReportRow[];
  pagination?: PaginationInfo;
  loading?: boolean;
  sortBy: VoucherSortBy;
  sortOrder: "asc" | "desc";
  search: string;
  onSortChange: (sortBy: VoucherSortBy, sortOrder: "asc" | "desc") => void;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
}

function SortIcon({ active, direction }: { active: boolean; direction?: "asc" | "desc" }) {
  if (!active) {
    return (
      <svg
        width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke={REPORT_COLORS.textMuted} strokeWidth="2"
        style={{ marginLeft: 4, flexShrink: 0 }}
      >
        <polyline points="6 9 12 3 18 9" />
        <polyline points="6 15 12 21 18 15" />
      </svg>
    );
  }
  return (
    <svg
      width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke={REPORT_COLORS.primary} strokeWidth="2.5"
      style={{ marginLeft: 4, flexShrink: 0 }}
    >
      {direction === "asc" ? (
        <polyline points="18 15 12 9 6 15" />
      ) : (
        <polyline points="6 9 12 15 18 9" />
      )}
    </svg>
  );
}

interface ThProps {
  label: string;
  sortKey: VoucherSortBy;
  currentSort: VoucherSortBy;
  currentOrder: "asc" | "desc";
  onClick: () => void;
  align?: "left" | "right";
}

function Th({ label, sortKey, currentSort, currentOrder, onClick, align = "left" }: ThProps) {
  const active = currentSort === sortKey;
  return (
    <th style={{ padding: "12px 16px", textAlign: align }}>
      <button
        type="button" onClick={onClick}
        style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center",
          fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600,
          color: active ? REPORT_COLORS.primary : REPORT_COLORS.textMuted,
          textTransform: "uppercase" as const, letterSpacing: 0.5,
          padding: 0,
        }}
      >
        {label}
        <SortIcon active={active} direction={active ? currentOrder : undefined} />
      </button>
    </th>
  );
}

export function VoucherReportTable({
  data, pagination, loading = false,
  sortBy, sortOrder, search,
  onSortChange, onPageChange, onSearchChange,
}: VoucherReportTableProps) {
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 0;

  const handleSort = (key: VoucherSortBy) => {
    if (sortBy === key) {
      onSortChange(key, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSortChange(key, "desc");
    }
  };

  if (loading) return <SkeletonTable rows={6} />;

  return (
    <div style={{
      background: "white", borderRadius: 16,
      border: "1px solid #E2E8F0", overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: `1px solid ${REPORT_COLORS.border}`,
        display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
      }}>
        <span style={{
          fontFamily: "Manrope, sans-serif", fontSize: 15, fontWeight: 700,
          color: REPORT_COLORS.text,
        }}>
          Hiệu quả từng voucher
        </span>
        {pagination && (
          <span style={{
            fontFamily: "Inter, sans-serif", fontSize: 12,
            color: REPORT_COLORS.textMuted,
          }}>
            {pagination.total} voucher
          </span>
        )}
        <div style={{ marginLeft: "auto" }}>
          <div style={{ position: "relative" }}>
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke={REPORT_COLORS.textMuted} strokeWidth="2"
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text" placeholder="Tìm voucher..."
              value={search} onChange={(e) => onSearchChange(e.target.value)}
              style={{
                padding: "8px 12px 8px 34px", borderRadius: 10,
                border: `1.5px solid ${REPORT_COLORS.border}`,
                background: REPORT_COLORS.bgPage,
                fontFamily: "Inter, sans-serif", fontSize: 13,
                color: REPORT_COLORS.text, outline: "none", width: 200,
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = REPORT_COLORS.primary; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = REPORT_COLORS.border; }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: REPORT_COLORS.bgPage }}>
              <Th label="Tên voucher" sortKey="title" currentSort={sortBy} currentOrder={sortOrder} onClick={() => handleSort("title")} />
              <Th label="Đã phát hành" sortKey="issued" currentSort={sortBy} currentOrder={sortOrder} onClick={() => handleSort("issued")} align="right" />
              <Th label="Đã bán" sortKey="sold" currentSort={sortBy} currentOrder={sortOrder} onClick={() => handleSort("sold")} align="right" />
              <Th label="Đã sử dụng" sortKey="used" currentSort={sortBy} currentOrder={sortOrder} onClick={() => handleSort("used")} align="right" />
              <Th label="Tỷ lệ dùng" sortKey="usageRate" currentSort={sortBy} currentOrder={sortOrder} onClick={() => handleSort("usageRate")} align="right" />
              <Th label="Trạng thái" sortKey="status" currentSort={sortBy} currentOrder={sortOrder} onClick={() => handleSort("status")} />
            </tr>
          </thead>
          <tbody>
            {!data?.length ? (
              <tr>
                <td colSpan={6} style={{ padding: "48px 24px" }}>
                  <EmptyState
                    title={search ? "Không tìm thấy voucher" : "Chưa có dữ liệu voucher"}
                    description={search ? "Thử thay đổi từ khóa tìm kiếm" : "Bắt đầu tạo voucher để xem thống kê"}
                  />
                </td>
              </tr>
            ) : (
              data.map((v) => (
                <tr
                  key={v.voucherId}
                  style={{ borderBottom: `1px solid ${REPORT_COLORS.border}` }}
                >
                  <td style={{ padding: "14px 16px" }}>
                    <Link
                      to={`/vouchers/${v.voucherId}`}
                      style={{
                        fontFamily: "Manrope, sans-serif", fontSize: 13, fontWeight: 700,
                        color: REPORT_COLORS.primary, textDecoration: "none",
                      }}
                    >
                      {v.title}
                    </Link>
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <span style={{
                      fontFamily: "Inter, sans-serif", fontSize: 13,
                      color: REPORT_COLORS.text,
                    }}>
                      {v.issued}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <span style={{
                      fontFamily: "Inter, sans-serif", fontSize: 13,
                      color: REPORT_COLORS.text,
                    }}>
                      {new Intl.NumberFormat("vi-VN").format(v.sold)}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <span style={{
                      fontFamily: "Inter, sans-serif", fontSize: 13,
                      color: REPORT_COLORS.text,
                    }}>
                      {new Intl.NumberFormat("vi-VN").format(v.used)}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <span style={{
                      fontFamily: "Manrope, sans-serif", fontSize: 13, fontWeight: 700,
                      color: v.usageRate > 50 ? REPORT_COLORS.success
                        : v.usageRate > 0 ? REPORT_COLORS.warning
                        : REPORT_COLORS.textMuted,
                    }}>
                      {v.usageRate.toFixed(1)}%
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <StatusBadgeInline status={v.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div style={{
          padding: "14px 20px",
          borderTop: `1px solid ${REPORT_COLORS.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <span style={{
            fontFamily: "Inter, sans-serif", fontSize: 12,
            color: REPORT_COLORS.textMuted,
          }}>
            Trang {pagination.page} / {totalPages}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              style={{
                padding: "7px 14px", borderRadius: 8,
                border: `1px solid ${REPORT_COLORS.border}`, background: "white",
                color: REPORT_COLORS.textSecondary, fontFamily: "Inter, sans-serif",
                fontSize: 13, fontWeight: 600,
                cursor: pagination.page <= 1 ? "not-allowed" : "pointer",
                opacity: pagination.page <= 1 ? 0.5 : 1,
              }}
            >
              ←
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                style={{
                  padding: "7px 14px", borderRadius: 8,
                  border: page === pagination.page
                    ? `2px solid ${REPORT_COLORS.primary}`
                    : `1px solid ${REPORT_COLORS.border}`,
                  background: page === pagination.page ? "#E8F4FA" : "white",
                  color: page === pagination.page ? REPORT_COLORS.primary : REPORT_COLORS.textSecondary,
                  fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
              style={{
                padding: "7px 14px", borderRadius: 8,
                border: `1px solid ${REPORT_COLORS.border}`, background: "white",
                color: REPORT_COLORS.textSecondary, fontFamily: "Inter, sans-serif",
                fontSize: 13, fontWeight: 600,
                cursor: pagination.page >= totalPages ? "not-allowed" : "pointer",
                opacity: pagination.page >= totalPages ? 0.5 : 1,
              }}
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadgeInline({ status }: { status: string }) {
  const STATUS_STYLES: Record<string, { color: string; bg: string; label: string }> = {
    Draft:    { label: 'Nháp',       color: '#64748B', bg: '#F1F5F9' },
    Pending:  { label: 'Chờ duyệt',  color: '#F59E0B', bg: '#FEF3C7' },
    Approved: { label: 'Đã duyệt',   color: '#10B981', bg: '#ECFDF5' },
    Rejected: { label: 'Từ chối',     color: '#EF4444', bg: '#FEF2F2' },
  };
  const s = STATUS_STYLES[status] ?? { label: status, color: '#64748B', bg: '#F1F5F9' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: 11, fontWeight: 600, color: s.color, background: s.bg,
      padding: '3px 10px', borderRadius: 6,
    }}>
      {s.label}
    </span>
  );
}
