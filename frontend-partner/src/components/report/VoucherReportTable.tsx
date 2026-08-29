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
  onSearchSubmit: () => void;
  onSearchReset: () => void;
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
  onSortChange, onPageChange, onSearchChange, onSearchSubmit, onSearchReset,
}: VoucherReportTableProps) {
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 0;

  const handleSort = (key: VoucherSortBy) => {
    if (sortBy === key) {
      onSortChange(key, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSortChange(key, "desc");
    }
  };

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
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 auto" }}>
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke={REPORT_COLORS.textMuted} strokeWidth="2"
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text" placeholder="Tìm voucher..."
              value={search} onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSearchSubmit();
                }
              }}
              style={{
                padding: "8px 12px 8px 34px", borderRadius: 10,
                border: `1.5px solid ${REPORT_COLORS.border}`,
                background: REPORT_COLORS.bgPage,
                fontFamily: "Inter, sans-serif", fontSize: 13,
                color: REPORT_COLORS.text, outline: "none", width: "100%", minWidth: 150, maxWidth: 250,
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = REPORT_COLORS.primary; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = REPORT_COLORS.border; }}
            />
          </div>
          <button
            type="button"
            onClick={onSearchSubmit}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "8px 14px", borderRadius: 10,
              border: `1.5px solid ${REPORT_COLORS.primary}`,
              background: REPORT_COLORS.primary,
              fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600,
              color: "white", cursor: "pointer",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap" as const,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = REPORT_COLORS.primaryHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = REPORT_COLORS.primary; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Tìm kiếm
          </button>
          
          <button
            type="button"
            onClick={onSearchReset}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "8px 14px", borderRadius: 10,
              border: `1.5px solid ${REPORT_COLORS.border}`,
              background: "white",
              fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600,
              color: REPORT_COLORS.textSecondary, cursor: "pointer",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap" as const,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#F1F5F9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "white"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        {loading ? (
          <SkeletonTable rows={6} />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: REPORT_COLORS.bgPage }}>
              <Th label="Tên voucher" sortKey="title" currentSort={sortBy} currentOrder={sortOrder} onClick={() => handleSort("title")} />
              <Th
                label="Tổng phát hành"
                sortKey="totalQuantity"
                currentSort={sortBy}
                currentOrder={sortOrder}
                onClick={() => handleSort("totalQuantity")}
                align="right"
              />
              <Th
                label="Đang bán"
                sortKey="isLive"
                currentSort={sortBy}
                currentOrder={sortOrder}
                onClick={() => handleSort("isLive")}
              />
              <Th label="Đã bán" sortKey="sold" currentSort={sortBy} currentOrder={sortOrder} onClick={() => handleSort("sold")} align="right" />
              <Th label="Đã sử dụng" sortKey="used" currentSort={sortBy} currentOrder={sortOrder} onClick={() => handleSort("used")} align="right" />
              <Th
                label="Tỷ lệ bán"
                sortKey="soldRate"
                currentSort={sortBy}
                currentOrder={sortOrder}
                onClick={() => handleSort("soldRate")}
                align="right"
              />
              <Th label="Tỷ lệ dùng" sortKey="usageRate" currentSort={sortBy} currentOrder={sortOrder} onClick={() => handleSort("usageRate")} align="right" />
              <Th label="Trạng thái" sortKey="status" currentSort={sortBy} currentOrder={sortOrder} onClick={() => handleSort("status")} />
            </tr>
          </thead>
          <tbody>
            {!data?.length ? (
              <tr>
                <td colSpan={8} style={{ padding: "48px 24px" }}>
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
                      fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600,
                      color: REPORT_COLORS.text,
                    }}>
                      {new Intl.NumberFormat("vi-VN").format(v.totalQuantity)}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    {v.isLive ? (
                      <span
                        title="Voucher đang được bày bán (Approved + Visible)"
                        style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          width: 26, height: 26, borderRadius: "50%",
                          background: "#ECFDF5", color: "#059669",
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    ) : (
                      <span
                        title="Voucher chưa được bày bán (chưa duyệt hoặc đang ẩn)"
                        style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          width: 26, height: 26, borderRadius: "50%",
                          background: "#F1F5F9", color: "#94A3B8",
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </span>
                    )}
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
                      color: v.soldRate > 50 ? REPORT_COLORS.success
                        : v.soldRate > 0 ? REPORT_COLORS.warning
                        : REPORT_COLORS.textMuted,
                    }}>
                      {v.soldRate.toFixed(1)}%
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
        )}
      </div>

      {/* Pagination */}
      {!loading && pagination && totalPages > 1 && (
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
