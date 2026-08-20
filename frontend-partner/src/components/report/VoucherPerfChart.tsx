import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { REPORT_COLORS } from "./report.constants";
import { EmptyState } from "../common/EmptyState";
import { SkeletonChart } from "./report.skeleton";
import type { VoucherPerformanceData } from "../../types/report";

const CHART_COLORS = [
  "#0E76A8", "#60A5FA", "#34D399", "#FBBF24",
  "#F87171", "#A78BFA", "#F472B6", "#2DD4BF",
];

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: `1px solid ${REPORT_COLORS.border}`,
      borderRadius: 10, padding: "10px 14px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)", maxWidth: 240,
    }}>
      <div style={{
        fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 600,
        color: REPORT_COLORS.textMuted, marginBottom: 6,
      }}>
        {label}
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{
          fontFamily: "Inter, sans-serif", fontSize: 12,
          color: REPORT_COLORS.text, display: "flex",
          justifyContent: "space-between", gap: 12,
        }}>
          <span>{p.name === "sold" ? "Đã bán" : "Đã dùng"}</span>
          <span style={{ fontWeight: 700 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

interface VoucherPerfChartProps {
  data?: VoucherPerformanceData;
  loading?: boolean;
}

export function VoucherPerfChart({ data, loading = false }: VoucherPerfChartProps) {
  if (loading) return <SkeletonChart height={240} />;

  if (!data?.data?.length) {
    return (
      <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #E2E8F0' }}>
        <div style={{
          fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700,
          color: REPORT_COLORS.text, marginBottom: 4,
        }}>Top voucher bán chạy</div>
        <EmptyState
          title="Chưa có dữ liệu"
          description="Không có voucher nào trong khoảng thời gian này"
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
          }
        />
      </div>
    );
  }

  const chartData = data.data.map((v) => ({
    ...v,
    shortTitle: v.title.length > 20 ? v.title.slice(0, 20) + "…" : v.title,
  }));

  return (
    <div style={{
      background: "white", borderRadius: 16, padding: 24,
      border: "1px solid #E2E8F0",
    }}>
      <div style={{
        fontFamily: "Manrope, sans-serif", fontSize: 15, fontWeight: 700,
        color: REPORT_COLORS.text, marginBottom: 4,
      }}>
        Top voucher bán chạy
      </div>
      <div style={{
        fontFamily: "Inter, sans-serif", fontSize: 12,
        color: REPORT_COLORS.textMuted, marginBottom: 20,
      }}>
        {data.data.length} voucher được hiển thị
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontFamily: "Inter, sans-serif", fontSize: 11, fill: REPORT_COLORS.textMuted }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            type="category" dataKey="shortTitle"
            tick={{ fontFamily: "Inter, sans-serif", fontSize: 11, fill: REPORT_COLORS.text }}
            axisLine={false} tickLine={false} width={120}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="sold" name="sold" radius={[0, 4, 4, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
