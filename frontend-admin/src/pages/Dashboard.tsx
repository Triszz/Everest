import { useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

// Mock data
const revenueData = [
  { month: 'T1', revenue: 1.2, orders: 245 },
  { month: 'T2', revenue: 1.8, orders: 320 },
  { month: 'T3', revenue: 1.5, orders: 280 },
  { month: 'T4', revenue: 2.1, orders: 410 },
  { month: 'T5', revenue: 2.45, orders: 485 },
  { month: 'T6', revenue: 2.8, orders: 560 },
]

const topVouchers = [
  { rank: 1, name: 'Combo Buffet Nướng Cao Cấp', sold: 512, revenue: '256M', partner: 'The Golden Grill' },
  { rank: 2, name: 'Gói Gym & Yoga 3 Tháng', sold: 348, revenue: '174M', partner: 'Elite Fitness' },
  { rank: 3, name: 'Liệu trình Spa Thư Giãn 90p', sold: 285, revenue: '114M', partner: 'Lotus Wellness' },
  { rank: 4, name: 'Thẻ Cinema IMAX 4K', sold: 210, revenue: '94.5M', partner: 'CGV Cinemas' },
  { rank: 5, name: 'Buffet Hải Sản Premium', sold: 178, revenue: '89M', partner: 'Ocean Terrace' },
]

const alerts = [
  { id: 1, type: 'error', icon: 'inventory_2', text: 'Voucher X sắp hết hàng (chỉ còn 5 vé)', time: '10 phút trước' },
  { id: 2, type: 'warning', icon: 'schedule', text: '3 đối tác chờ duyệt hơn 3 ngày', time: '1 giờ trước' },
  { id: 3, type: 'warning', icon: 'report', text: 'Đơn hàng bất thường #ORD-12345', time: '2 giờ trước' },
]

const kpis = [
  { label: 'Tổng người dùng', value: '15,420', change: '+5.2%', up: true, icon: 'group', color: '#3B82F6' },
  { label: 'Tổng đối tác', value: '128', change: '+4', up: true, icon: 'store', color: '#10B981' },
  { label: 'Tổng voucher', value: '1,250', change: '+12', up: true, icon: 'confirmation_number', color: '#005c86' },
  { label: 'Doanh thu tháng', value: '2.45B đ', change: '+18.2%', up: true, icon: 'payments', color: '#7e4b00' },
  { label: 'Đơn hàng tháng', value: '485', change: '+8.4%', up: true, icon: 'shopping_cart', color: '#F59E0B' },
  { label: 'Voucher đã sử dụng', value: '5,620', change: '+15.2%', up: true, icon: 'sell', color: '#006b5f' },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'var(--color-surface-container-lowest)',
          border: '1px solid var(--color-outline-variant)',
          borderRadius: '0.5rem',
          padding: '0.75rem 1rem',
          fontSize: '0.75rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('month')

  return (
    <div style={{ maxWidth: '1400px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 className="font-headline-lg" style={{ fontSize: '2rem', color: 'var(--color-on-surface)', marginBottom: '0.25rem' }}>
            Tổng quan hệ thống
          </h1>
          <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            Theo dõi hiệu suất và phê duyệt yêu cầu thời gian thực.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'var(--color-surface-container-lowest)',
              border: '1px solid var(--color-outline-variant)',
              borderRadius: '0.5rem',
            }}
          >
            <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '18px' }}>
              calendar_today
            </span>
            <select
              className="admin-input admin-select"
              style={{ background: 'transparent', border: 'none', width: 'auto', padding: 0, boxShadow: 'none' }}
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="week">7 ngày qua</option>
              <option value="month">30 ngày qua</option>
              <option value="quarter">90 ngày qua</option>
            </select>
          </div>
          <button className="admin-btn admin-btn-primary">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {kpis.map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '0.5rem',
                  background: `${kpi.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span className="material-symbols-outlined" style={{ color: kpi.color, fontSize: '20px' }}>
                  {kpi.icon}
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontFamily: '"JetBrains Mono", monospace',
                  color: kpi.up ? 'var(--color-success-active)' : 'var(--color-error-danger)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.125rem',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                  {kpi.up ? 'trending_up' : 'trending_down'}
                </span>
                {kpi.change}
              </span>
            </div>
            <p className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '0.25rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {kpi.label}
            </p>
            <p className="font-headline-md" style={{ fontSize: '1.5rem', color: kpi.label === 'Doanh thu tháng' ? 'var(--color-primary)' : 'var(--color-on-surface)', fontWeight: 700 }}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Revenue Chart */}
        <div className="admin-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="font-headline-md" style={{ fontSize: '1.25rem' }}>Doanh thu & Đơn hàng</h2>
            <span className="badge badge-info">6 tháng</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-on-surface-variant)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--color-on-surface-variant)' }} yAxisId="left" />
              <YAxis tick={{ fontSize: 12, fill: 'var(--color-on-surface-variant)' }} yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
              <Line yAxisId="left" type="monotone" dataKey="revenue" name="Doanh thu (B đ)" stroke="#005c86" strokeWidth={2} dot={{ fill: '#005c86', r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="orders" name="Đơn hàng" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#10B981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by Status */}
        <div className="admin-card" style={{ padding: '1.5rem' }}>
          <h2 className="font-headline-md" style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Đơn hàng theo trạng thái</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={[
                { status: 'Hoàn tất', count: 320, fill: '#10B981' },
                { status: 'Đang xử lý', count: 85, fill: '#3B82F6' },
                { status: 'Chờ thanh toán', count: 45, fill: '#F59E0B' },
                { status: 'Đã hủy', count: 20, fill: '#EF4444' },
                { status: 'Hoàn tiền', count: 15, fill: '#7e4b00' },
              ]}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-on-surface-variant)' }} />
              <YAxis type="category" dataKey="status" tick={{ fontSize: 11, fill: 'var(--color-on-surface-variant)' }} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Số đơn" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Hoàn tất', color: '#10B981' },
              { label: 'Xử lý', color: '#3B82F6' },
              { label: 'Chờ TT', color: '#F59E0B' },
              { label: 'Hủy', color: '#EF4444' },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.7rem' }}>
                <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: item.color }} />
                <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Top Vouchers + Alerts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
        }}
      >
        {/* Top Vouchers */}
        <div className="admin-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="font-headline-md" style={{ fontSize: '1.25rem' }}>Top voucher bán chạy</h2>
            <a href="/vouchers" style={{ color: 'var(--color-primary)', fontSize: '0.75rem', textDecoration: 'none' }} className="font-label-sm">
              Xem tất cả
            </a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {topVouchers.map((v) => (
              <div
                key={v.rank}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  background: 'var(--color-surface-container-low)',
                  borderRadius: '0.5rem',
                  transition: 'background 0.15s',
                }}
              >
                <div
                  style={{
                    width: '1.75rem',
                    height: '1.75rem',
                    borderRadius: '50%',
                    background: v.rank <= 3 ? 'var(--color-primary)' : 'var(--color-outline-variant)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {v.rank}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="font-body-sm" style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {v.name}
                  </p>
                  <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem' }}>
                    {v.partner}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p className="font-label-md" style={{ fontWeight: 600 }}>{v.sold} đã bán</p>
                  <p className="font-label-sm" style={{ color: 'var(--color-primary)', fontSize: '0.65rem' }}>{v.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Alerts */}
        <div className="admin-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="font-headline-md" style={{ fontSize: '1.25rem' }}>Cảnh báo hệ thống</h2>
            <span
              className="badge badge-pending"
              style={{
                background: alerts.length > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                color: alerts.length > 0 ? '#EF4444' : '#10B981',
                border: alerts.length > 0 ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(16,185,129,0.2)',
              }}
            >
              {alerts.length > 0 ? `${alerts.length} cảnh báo` : 'Tất cả ổn'}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {alerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-success-active)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>verified</span>
                <p className="font-body-sm" style={{ marginTop: '0.5rem' }}>Hệ thống hoạt động bình thường</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    background: 'var(--color-error-container)',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(239,68,68,0.15)',
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ color: 'var(--color-error-danger)', fontSize: '20px', marginTop: '0.125rem', flexShrink: 0 }}
                  >
                    {alert.icon}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p className="font-body-sm" style={{ lineHeight: 1.4 }}>{alert.text}</p>
                    <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginTop: '0.25rem', fontSize: '0.65rem' }}>
                      {alert.time}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* System Health */}
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'var(--color-surface-container-low)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                background: 'rgba(16,185,129,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ color: 'var(--color-success-active)', fontSize: '20px' }}>
                speed
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <p className="font-label-md" style={{ fontWeight: 600 }}>Trạng thái hệ thống</p>
              <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem' }}>
                Ổn định — Độ trễ 14ms
              </p>
            </div>
            <div style={{ position: 'relative', width: '0.75rem', height: '0.75rem' }}>
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: '#10B981',
                  display: 'block',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  inset: '-4px',
                  borderRadius: '50%',
                  background: '#10B981',
                  opacity: 0.4,
                  animation: 'pulse 2s infinite',
                  display: 'block',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
