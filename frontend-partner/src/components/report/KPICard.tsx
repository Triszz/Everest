import { REPORT_COLORS } from './report.constants';

const STATUS_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  Draft:    { label: 'Nháp',       color: '#64748B', bg: '#F1F5F9' },
  Pending:  { label: 'Chờ duyệt',  color: '#F59E0B', bg: '#FEF3C7' },
  Approved: { label: 'Đã duyệt',   color: '#10B981', bg: '#ECFDF5' },
  Rejected: { label: 'Từ chối',     color: '#EF4444', bg: '#FEF2F2' },
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? { label: status, color: '#64748B', bg: '#F1F5F9' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: 11, fontWeight: 600,
      color: style.color, background: style.bg,
      padding: '2px 10px', borderRadius: 6,
    }}>
      {style.label}
    </span>
  );
}

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  loading?: boolean;
  format?: "number" | "currency" | "percent";
  color?: string;
  style?: React.CSSProperties;
}

function formatValue(val: string | number, fmt: KPICardProps["format"]): string {
  if (typeof val === "string") return val;
  switch (fmt) {
    case "currency":
      return new Intl.NumberFormat("vi-VN", {
        style: "currency", currency: "VND", maximumFractionDigits: 0,
      }).format(val);
    case "percent":
      return `${val.toFixed(1)}%`;
    default:
      return new Intl.NumberFormat("vi-VN").format(val);
  }
}

export function KPICard({
  title, value, subtitle, icon, iconBg,
  loading = false, format = "number", color = REPORT_COLORS.primary,
  style: outerStyle,
}: KPICardProps) {
  if (loading) {
    return (
      <div style={{
        background: 'white', borderRadius: 16, padding: 20,
        border: '1px solid #F1F5F9', minHeight: 96,
        display: 'flex', alignItems: 'center', gap: 12,
        ...outerStyle,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: '#E2E8F0', flexShrink: 0,
        }} />
        <div style={{ flex: 1 }}>
          <div style={{ width: 80, height: 11, borderRadius: 6, background: '#E2E8F0', marginBottom: 6 }} />
          <div style={{ width: 100, height: 24, borderRadius: 6, background: '#E2E8F0' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white', borderRadius: 16, padding: 20,
      border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      transition: 'all 0.25s ease',
      ...outerStyle,
    }}
    onMouseEnter={e => {
      const el = e.currentTarget as HTMLDivElement;
      el.style.boxShadow = '0 8px 24px rgba(14,118,168,0.1)';
      el.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={e => {
      const el = e.currentTarget as HTMLDivElement;
      el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
      el.style.transform = 'translateY(0)';
    }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
            color: REPORT_COLORS.textMuted, marginBottom: 4,
          }}>
            {title}
          </div>
          <div style={{
            fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800,
            color, lineHeight: 1.2, wordBreak: 'break-word',
          }}>
            {formatValue(value, format)}
          </div>
          {subtitle && (
            <div style={{
              fontFamily: 'Inter, sans-serif', fontSize: 11,
              color: REPORT_COLORS.textMuted, marginTop: 4,
            }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
