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

const dateFormatter = (dateStr: string, granularity: string) => {
  const d = new Date(dateStr);
  if (granularity === "month") {
    return d.toLocaleDateString("vi-VN", { month: "short", year: "2-digit" });
  }
  if (granularity === "week") {
    return `T${d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}`;
  }
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "short" });
};

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

interface RevenueChartProps {
  data?: RevenueChartData;
  loading?: boolean;
  children?: ReactNode;
}

export function RevenueChart({ data, loading = false, children }: RevenueChartProps) {
  if (loading) return <SkeletonChart height={240} />;

  const granularity = data?.granularity ?? "day";

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
          fontFamily: "Manrope, sans-serif", fontSize: 15, fontWeight: 700,
          color: REPORT_COLORS.text,
        }}>
          Biểu đồ doanh thu
        </div>
        {children && <div>{children}</div>}
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
