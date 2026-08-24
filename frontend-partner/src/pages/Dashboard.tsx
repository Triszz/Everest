/**
 * Dashboard Page (minimal)
 * ============================================================
 * Hiển thị tổng quan nhanh cho Partner_Owner:
 *   - Số voucher đã xác nhận (redeem) trong ngày hôm nay
 *   - Thời điểm xác nhận gần nhất
 *
 * Dữ liệu lấy từ `/api/partner/dashboard/stats` (đã có sẵn từ Staff Mobile).
 * Bảng hoạt động chi tiết được chuyển sang trang /validate
 * để tránh trùng lặp với "Lịch sử xác thực voucher".
 */

import { useDashboardStats } from "../hooks/useDashboard";
import { REPORT_COLORS } from "../components/report/report.constants";

const C = REPORT_COLORS;

// ── Inline icons (style khớp với ReportsPage) ──────────────────────────────
const TicketIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const ClockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.warning} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

// ── Helpers ─────────────────────────────────────────────────────────────────
function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ── Page ────────────────────────────────────────────────────────────────────
export function DashboardPage() {
  // recentLimit = 5 — chỉ dùng cho 1 metric thống kê phụ nếu cần sau này.
  // Hiện tại Dashboard KHÔNG render bảng recent activity (đã chuyển sang /validate)
  // nên API call không cần trả recentActivity. Tuy nhiên để tương thích ngược
  // và an toàn nếu sau này tái sử dụng, giữ call với limit nhỏ.
  const { data, loading: isLoading, refetch, lastFetchedAt } = useDashboardStats(5);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
      {/* Title + Refresh */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 8,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "Manrope, sans-serif",
              fontSize: 28,
              fontWeight: 800,
              color: C.text,
              marginBottom: 8,
            }}
          >
            Dashboard
          </h1>
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              color: C.textSecondary,
              margin: 0,
            }}
          >
            Tổng quan hoạt động đối tác hôm nay
          </p>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 4,
          }}
        >
          <button
            type="button"
            onClick={refetch}
            disabled={isLoading}
            style={{
              padding: "8px 14px",
              background: C.bgCard,
              color: C.text,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              fontSize: 13,
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.6 : 1,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              style={{
                animation: isLoading ? "spin 1s linear infinite" : undefined,
              }}
            >
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
              <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
            </svg>
            {isLoading ? "Đang tải..." : "Làm mới"}
          </button>
          {lastFetchedAt && (
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 11,
                color: C.textMuted,
              }}
            >
              Cập nhật: {formatDateTime(lastFetchedAt)}
            </span>
          )}
        </div>
      </div>

      <div style={{ height: 32 }} />

      {/* KPI row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 12,
        }}
      >
        <KPIBox
          icon={<TicketIcon />}
          iconBg="#EFF6FF"
          label="Voucher đã xác nhận hôm nay"
          value={isLoading ? "—" : data?.summary.confirmedCount ?? 0}
          subtitle="Số lượng voucher đã redeem trong ngày"
        />
        <KPIBox
          icon={<ClockIcon />}
          iconBg="#FFFBEB"
          label="Lần xác nhận gần nhất"
          value={isLoading ? "—" : formatDateTime(data?.summary.lastConfirmedAt ?? null)}
          isText
          subtitle="Thời điểm redeem cuối cùng"
        />
      </div>

      {/* Note: bảng hoạt động gần nhất đã được di chuyển sang trang /validate
          để tránh trùng lặp với "Lịch sử xác thực voucher" ở đó. */}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function KPIBox({
  icon,
  iconBg,
  label,
  value,
  subtitle,
  isText,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number | string;
  subtitle?: string;
  isText?: boolean;
}) {
  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            color: C.textSecondary,
            fontWeight: 500,
          }}
        >
          {label}
        </div>
      </div>
      <div
        style={{
          fontFamily: "Manrope, sans-serif",
          fontSize: isText ? 16 : 28,
          fontWeight: 800,
          color: C.text,
        }}
      >
        {value}
      </div>
      {subtitle && (
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            color: C.textMuted,
            marginTop: 4,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}

// ── Global keyframe for refresh button icon ───────────────────────────────
const SPIN_KEYFRAME_ID = "dashboard-spin-animation";
if (typeof document !== "undefined" && !document.getElementById(SPIN_KEYFRAME_ID)) {
  const style = document.createElement("style");
  style.id = SPIN_KEYFRAME_ID;
  style.textContent = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
}