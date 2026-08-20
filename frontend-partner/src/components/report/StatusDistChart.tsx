import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { REPORT_COLORS } from "./report.constants";
import { EmptyState } from "../common/EmptyState";
import { SkeletonChart } from "./report.skeleton";
import type { StatusDistributionData } from "../../types/report";

const STATUS_COLORS: Record<string, string> = {
  "Bản nháp": "#94A3B8",
  "Chờ duyệt": "#F59E0B",
  "Đã duyệt": "#10B981",
  "Từ chối": "#EF4444",
  "Chưa sử dụng": "#3B82F6",
  "Đã sử dụng": "#10B981",
  "Hết hạn": "#EF4444",
  "Đã khóa": "#8B5CF6",
};

function CustomTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { label: string } }>;
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div style={{
      background: "#fff", border: `1px solid ${REPORT_COLORS.border}`,
      borderRadius: 10, padding: "10px 14px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    }}>
      <div style={{
        fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600,
        color: REPORT_COLORS.text,
      }}>
        {entry.payload.label}
      </div>
      <div style={{
        fontFamily: "Inter, sans-serif", fontSize: 11,
        color: REPORT_COLORS.textMuted, marginTop: 2,
      }}>
        {new Intl.NumberFormat("vi-VN").format(entry.value)} voucher
      </div>
    </div>
  );
}

interface StatusDistChartProps {
  data?: StatusDistributionData;
  loading?: boolean;
}

export function StatusDistChart({ data, loading = false }: StatusDistChartProps) {
  if (loading) return <SkeletonChart height={240} />;

  const items = data?.data ?? [];
  if (!items.length) {
    return (
      <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #E2E8F0' }}>
        <div style={{
          fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700,
          color: REPORT_COLORS.text, marginBottom: 4,
        }}>Tỷ lệ trạng thái voucher</div>
        <EmptyState
          title="Chưa có dữ liệu"
          description="Không có voucher nào trong khoảng thời gian này"
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5">
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
              <path d="M22 12A10 10 0 0 0 12 2v10z" />
            </svg>
          }
        />
      </div>
    );
  }

  const total = items.reduce((s, i) => s + i.count, 0);

  // Reserve a square slot for the donut so the chart can never overflow
  // or get clipped by the parent flex layout. Legend scrolls if it has too
  // many entries instead of pushing the chart off-screen.
  return (
    <div style={{
      background: "white", borderRadius: 16, padding: 24,
      border: "1px solid #E2E8F0",
    }}>
      <div style={{
        fontFamily: "Manrope, sans-serif", fontSize: 15, fontWeight: 700,
        color: REPORT_COLORS.text, marginBottom: 4,
      }}>
        Tỷ lệ trạng thái voucher
      </div>
      <div style={{
        fontFamily: "Inter, sans-serif", fontSize: 12,
        color: REPORT_COLORS.textMuted, marginBottom: 20,
      }}>
        Tổng: {new Intl.NumberFormat("vi-VN").format(total)} voucher
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
      }}>
        <div style={{ width: 220, height: 220, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={items} dataKey="count" nameKey="label"
                cx="50%" cy="50%"
                innerRadius="55%" outerRadius="88%"
                paddingAngle={2}
                stroke="none"
              >
                {items.map((item, i) => (
                  <Cell
                    key={item.label}
                    fill={STATUS_COLORS[item.label] ?? `#${((i * 0x9e3779 + 0xdeadbeef) >>> 0).toString(16).padStart(6, "0").slice(0, 6)}`}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{
          flex: 1, minWidth: 160,
          display: "flex", flexDirection: "column", gap: 8,
          maxHeight: 220, overflowY: "auto",
        }}>
          {items.map((item) => {
            const percent = total > 0 ? (item.count / total) * 100 : 0;
            return (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: 3,
                  background: STATUS_COLORS[item.label] ?? "#94A3B8", flexShrink: 0,
                }} />
                <span style={{
                  fontFamily: "Inter, sans-serif", fontSize: 12,
                  color: REPORT_COLORS.text, flex: 1, minWidth: 0,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {item.label}
                </span>
                <span style={{
                  fontFamily: "Manrope, sans-serif", fontSize: 12, fontWeight: 700,
                  color: REPORT_COLORS.text, flexShrink: 0,
                }}>
                  {new Intl.NumberFormat("vi-VN").format(item.count)}
                  <span style={{
                    fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 500,
                    color: REPORT_COLORS.textMuted, marginLeft: 4,
                  }}>
                    ({percent.toFixed(0)}%)
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
