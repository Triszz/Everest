import type { ReactNode } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { REPORT_COLORS } from "./report.constants";
import { EmptyState } from "../common/EmptyState";
import { SkeletonChart } from "./report.skeleton";
import type { RevenueChartData } from "../../types/report";

const currencyFormatter = (val: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency", currency: "VND", maximumFractionDigits: 0,
  }).format(val);

// Vietnamese short month names. Hard-coded để tránh locale Intl hiển thị
// ngày khi browser/platform không hỗ trợ option đầy đủ.
const VI_SHORT_MONTHS = [
  "Th1", "Th2", "Th3", "Th4", "Th5", "Th6",
  "Th7", "Th8", "Th9", "Th10", "Th11", "Th12",
];

// Parse date key từ backend (luôn ở UTC) và format theo granularity.
// Backend trả 3 dạng key:
//   • day:   "YYYY-MM-DD"
//   • week:  "YYYY-MM-DD" (ngày thứ 2 của tuần)
//   • month: "YYYY-MM"   (chỉ tháng)
// Tất cả đều trả "dd/mm" (hoặc "ThM/yy" cho month) để đồng nhất.
const dateFormatter = (dateStr: string, granularity: string) => {
  if (granularity === "month") {
    // Hiển thị "ThM/yy", ví dụ "Th8/26".
    const [year, month] = dateStr.split("-");
    if (!year || !month) return dateStr;
    const m = Number(month);
    if (m < 1 || m > 12) return dateStr;
    const yy = String(Number(year)).slice(-2);
    return `${VI_SHORT_MONTHS[m - 1]}/${yy}`;
  }
  // day và week: format "dd/mm"
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return dateStr;
  return `${String(Number(day)).padStart(2, "0")}/${String(Number(month)).padStart(2, "0")}`;
};

// Label mô tả cửa sổ thời gian hiện tại cho tuần/tháng.
function rangeLabel(
  granularity: string,
  offset: number,
  customLabel?: string,
): string | null {
  if (customLabel) return customLabel;
  if (granularity !== "week" && granularity !== "month") return null;
  if (offset === 0) {
    return granularity === "week" ? "Tuần này" : "Tháng này";
  }
  if (offset > 0) {
    return granularity === "week"
      ? `${offset} tuần trước`
      : `${offset} tháng trước`;
  }
  return granularity === "week"
    ? `${Math.abs(offset)} tuần sau`
    : `${Math.abs(offset)} tháng sau`;
}

function CustomTooltip({ active, payload, label, granularity }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  granularity?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: `1px solid ${REPORT_COLORS.border}`,
      borderRadius: 10, padding: "10px 14px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    }}>
      {/* Với tuần: tooltip hiển thị "Tuần: dd/mm – dd/mm" ở trên + ngày cụ thể ở dưới */}
      {granularity === "week" && label && (
        <div style={{
          fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 600,
          color: REPORT_COLORS.text, marginBottom: 4,
        }}>
          Tuần: {weekRangeLabel(label)}
        </div>
      )}
      <div style={{
        fontFamily: "Inter, sans-serif", fontSize: 11,
        color: REPORT_COLORS.textMuted, marginBottom: 4,
      }}>
        {label ? dateFormatter(label, granularity ?? "day") : ""}
      </div>
      <div style={{
        fontFamily: "Manrope, sans-serif", fontSize: 14, fontWeight: 700,
        color: REPORT_COLORS.primary,
      }}>
        {currencyFormatter(payload[0].value)}
      </div>
    </div>
  );
}

// Tính range tuần (Mon..Sun) cho một ngày bất kỳ, trả "dd/mm – dd/mm".
function weekRangeLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return dateStr;
  const d = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  const dayOfWeek = d.getUTCDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() - daysToMonday);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  const fmt = (date: Date) =>
    `${String(date.getUTCDate()).padStart(2, "0")}/${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
  return `${fmt(monday)} – ${fmt(sunday)}`;
}

interface RevenueChartProps {
  data?: RevenueChartData;
  loading?: boolean;
  offset?: number;
  onPrev?: () => void;
  onNext?: () => void;
  canGoNext?: boolean;
  children?: ReactNode;
}

export function RevenueChart({
  data, loading = false,
  offset = 0, onPrev, onNext, canGoNext = false,
  children,
}: RevenueChartProps) {
  if (loading) return <SkeletonChart height={240} />;

  const granularity = data?.granularity ?? "day";
  const showNav = granularity === "week" || granularity === "month";
  const label = rangeLabel(granularity, offset);

  return (
    <div style={{
      background: "white", borderRadius: 16, padding: 24,
      border: "1px solid #E2E8F0",
    }}>
      {/* Card header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 20, flexWrap: "wrap", gap: 8,
      }}>
        <div style={{
          display: "flex", flexDirection: "column", gap: 2,
        }}>
          <div style={{
            fontFamily: "Manrope, sans-serif", fontSize: 15, fontWeight: 700,
            color: REPORT_COLORS.text,
          }}>
            Biểu đồ doanh thu
          </div>
          {label && (
            <div style={{
              fontFamily: "Inter, sans-serif", fontSize: 12,
              color: REPORT_COLORS.textSecondary, fontWeight: 500,
            }}>
              {label}
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Prev/Next navigation for week / month */}
          {showNav && onPrev && onNext && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button
                type="button"
                onClick={onPrev}
                aria-label="Khoảng trước"
                title="Khoảng trước"
                style={{
                  width: 30, height: 30,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  border: `1px solid ${REPORT_COLORS.border}`,
                  borderRadius: 8,
                  background: "white",
                  color: REPORT_COLORS.textSecondary,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = REPORT_COLORS.primary;
                  e.currentTarget.style.color = REPORT_COLORS.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = REPORT_COLORS.border;
                  e.currentTarget.style.color = REPORT_COLORS.textSecondary;
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={onNext}
                disabled={!canGoNext}
                aria-label="Khoảng sau"
                title={canGoNext ? "Khoảng sau" : "Không thể đi tiếp"}
                style={{
                  width: 30, height: 30,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  border: `1px solid ${REPORT_COLORS.border}`,
                  borderRadius: 8,
                  background: "white",
                  color: REPORT_COLORS.textSecondary,
                  cursor: canGoNext ? "pointer" : "not-allowed",
                  opacity: canGoNext ? 1 : 0.4,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (canGoNext) {
                    e.currentTarget.style.borderColor = REPORT_COLORS.primary;
                    e.currentTarget.style.color = REPORT_COLORS.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (canGoNext) {
                    e.currentTarget.style.borderColor = REPORT_COLORS.border;
                    e.currentTarget.style.color = REPORT_COLORS.textSecondary;
                  }
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          )}
          {children && <div>{children}</div>}
        </div>
      </div>

      {/* Empty state */}
      {!data?.data?.length ? (
        <EmptyState
          title="Chưa có dữ liệu"
          description="Không có doanh thu trong khoảng thời gian này"
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          }
        />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data.data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => dateFormatter(v, granularity)}
              tick={{ fontFamily: "Inter, sans-serif", fontSize: 11, fill: REPORT_COLORS.textMuted }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tickFormatter={currencyFormatter}
              tick={{ fontFamily: "Inter, sans-serif", fontSize: 11, fill: REPORT_COLORS.textMuted }}
              axisLine={false} tickLine={false} width={80}
            />
            <Tooltip content={<CustomTooltip granularity={granularity} />} />
            <Line
              type="monotone" dataKey="revenue"
              stroke={REPORT_COLORS.primary} strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: REPORT_COLORS.primary, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
