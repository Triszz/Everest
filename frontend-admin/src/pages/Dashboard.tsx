import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { adminDashboardApi, type DashboardResponse } from '../services/admin.service'

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
            {p.name}: {p.value.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const formatNumber = (n: number) => n.toLocaleString('vi-VN')

const monthShortLabel = (label: string) => {
  const [, m] = label.split('-')
  return `T${Number(m)}`
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  console.log(data)
  useEffect(() => {
    let mounted = true
    setLoading(true)
    adminDashboardApi
      .get()
      .then((res) => {
        if (mounted) {
          setData(res)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Không tải được dashboard')
          setLoading(false)
        }
      })
    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <div style={{ maxWidth: '1400px', padding: '2rem', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
        Đang tải dữ liệu dashboard...
      </div>
    )
  }

  if (error || !data) {
    return (
      <div style={{ maxWidth: '1400px', padding: '2rem' }}>
        <p className="font-body-sm" style={{ color: 'var(--color-error)' }}>
          Lỗi: {error ?? 'Không có dữ liệu'}
        </p>
      </div>
    )
  }

  const kpis = [
    { label: 'Tổng người dùng', value: formatNumber(data.kpis.totalUsers), icon: 'group', color: '#3B82F6' },
    { label: 'Tổng đối tác', value: formatNumber(data.kpis.totalPartners), icon: 'store', color: '#10B981' },
    { label: 'Tổng voucher', value: formatNumber(data.kpis.totalVouchers), icon: 'confirmation_number', color: '#005c86' },
    { label: 'Voucher đã phát hành', value: formatNumber(data.kpis.totalIssued), icon: 'redeem', color: '#F59E0B' },
    { label: 'Voucher đã sử dụng', value: formatNumber(data.kpis.totalUsed), icon: 'sell', color: '#7e4b00' },
  ]

  const revenueChart = data.revenueByMonth.map((p) => ({
    label: p.label,
    month: monthShortLabel(p.label),
    revenue: p.value,
  }))

  const ordersChart = data.ordersByMonth.map((p) => ({
    label: p.label,
    month: monthShortLabel(p.label),
    orders: p.value,
  }))

  const userRegChart = data.userRegistrationByMonth.map((p) => ({
    label: p.label,
    month: monthShortLabel(p.label),
    users: p.value,
  }))

  const statusChart = [
    { status: 'Hoàn tất', count: data.ordersByStatus.paid, fill: '#10B981' },
    { status: 'Đang xử lý', count: data.ordersByStatus.pending, fill: '#3B82F6' },
    { status: 'Đã hủy', count: data.ordersByStatus.cancelled, fill: '#EF4444' },
    { status: 'Hoàn tiền', count: data.ordersByStatus.refunded, fill: '#7e4b00' },
  ]

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
            </div>
            <p className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '0.25rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {kpi.label}
            </p>
            <p className="font-headline-md" style={{ fontSize: '1.5rem', color: 'var(--color-on-surface)', fontWeight: 700 }}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Revenue & Orders Charts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Revenue Chart */}
        <div className="admin-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="font-headline-md" style={{ fontSize: '1.25rem' }}>Doanh thu</h2>
            <span className="badge badge-info">6 tháng</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-on-surface-variant)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--color-on-surface-variant)' }} tickFormatter={(v) => v.toLocaleString()} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" name="Doanh thu (đ)" fill="#005c86" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="admin-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="font-headline-md" style={{ fontSize: '1.25rem' }}>Đơn hàng</h2>
            <span className="badge badge-info">6 tháng</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={ordersChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-on-surface-variant)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--color-on-surface-variant)' }} tickFormatter={(v) => v.toLocaleString()} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" name="Đơn hàng" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders by Status */}
      <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 className="font-headline-md" style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Đơn hàng theo trạng thái</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={statusChart} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-on-surface-variant)' }} />
            <YAxis type="category" dataKey="status" tick={{ fontSize: 11, fill: 'var(--color-on-surface-variant)' }} width={90} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" name="Số đơn" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* User Registration Chart */}
      <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="font-headline-md" style={{ fontSize: '1.25rem' }}>Người dùng đăng ký</h2>
          <span className="badge badge-info">6 tháng</span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={userRegChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-on-surface-variant)' }} />
            <YAxis tick={{ fontSize: 12, fill: 'var(--color-on-surface-variant)' }} tickFormatter={(v) => v.toLocaleString()} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="users" name="Người dùng mới" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Partners */}
      <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="font-headline-md" style={{ fontSize: '1.25rem' }}>Top 10 đối tác bán nhiều voucher nhất</h2>
          <a href="/partners" style={{ color: 'var(--color-primary)', fontSize: '0.75rem', textDecoration: 'none' }} className="font-label-sm">
            Xem tất cả
          </a>
        </div>
        {data.topPartners.length === 0 ? (
          <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)', textAlign: 'center', padding: '2rem 0' }}>
            Chưa có dữ liệu bán hàng.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {data.topPartners.map((p) => (
              <div
                key={p.partnerId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  background: 'var(--color-surface-container-low)',
                  borderRadius: '0.5rem',
                }}
              >
                <div
                  style={{
                    width: '1.75rem',
                    height: '1.75rem',
                    borderRadius: '50%',
                    background: p.rank <= 3 ? 'var(--color-primary)' : 'var(--color-outline-variant)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {p.rank}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="font-body-sm" style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.partnerName}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p className="font-label-md" style={{ fontWeight: 600 }}>{formatNumber(p.sold)} voucher</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Vouchers */}
      <div className="admin-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="font-headline-md" style={{ fontSize: '1.25rem' }}>Top 10 voucher bán chạy trong 6 tháng</h2>
          <a href="/vouchers" style={{ color: 'var(--color-primary)', fontSize: '0.75rem', textDecoration: 'none' }} className="font-label-sm">
            Xem tất cả
          </a>
        </div>
        {data.topVouchers.length === 0 ? (
          <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)', textAlign: 'center', padding: '2rem 0' }}>
            Chưa có dữ liệu bán voucher.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {data.topVouchers.map((v) => (
              <div
                key={v.voucherId}
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
                    {v.title}
                  </p>
                  <p className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.65rem' }}>
                    {v.partnerName}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p className="font-label-md" style={{ fontWeight: 600 }}>{formatNumber(v.sold)} đã bán</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.5); opacity: 0; }
        }`}</style>
    </div>
  )
}
