import { useMemo, useState } from 'react';
import { useToast } from '../components/shared/Toast';
import { useAuditLog } from '../hooks/useAuditLog';
import {
  AUDIT_ACTIONS,
  AUDIT_ACTOR_TYPE_LABELS,
  AUDIT_TARGET_TYPE_LABELS,
  type AuditActorType,
  type AuditLog,
  type AuditTargetType,
} from '../types/audit';

const ACTOR_TYPES: Array<{ value: '' | AuditActorType; label: string }> = [
  { value: '', label: 'Tất cả actor' },
  { value: 'ADMIN', label: AUDIT_ACTOR_TYPE_LABELS.ADMIN },
  { value: 'CUSTOMER', label: AUDIT_ACTOR_TYPE_LABELS.CUSTOMER },
  { value: 'PARTNER', label: AUDIT_ACTOR_TYPE_LABELS.PARTNER },
];

const TARGET_TYPES: Array<{ value: '' | AuditTargetType; label: string }> = [
  { value: '', label: 'Tất cả đối tượng' },
  ...(Object.entries(AUDIT_TARGET_TYPE_LABELS) as Array<[AuditTargetType, string]>).map(
    ([v, l]) => ({ value: v, label: l }),
  ),
];

const actionStyle = (action: string): { bg: string; color: string } => {
  if (action.includes('APPROVE')) return { bg: 'rgba(16,185,129,0.1)', color: '#10B981' };
  if (action.includes('REJECT') || action.includes('CANCEL') || action.includes('DELETE'))
    return { bg: 'rgba(239,68,68,0.1)', color: '#EF4444' };
  if (action.includes('LOCK') || action.includes('TOGGLE'))
    return { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B' };
  if (action.includes('CREATE')) return { bg: 'rgba(16,185,129,0.1)', color: '#10B981' };
  if (action.includes('UPDATE')) return { bg: 'rgba(59,130,246,0.1)', color: '#3B82F6' };
  if (action.includes('REFUND')) return { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B' };
  if (action === 'LOGIN' || action === 'LOGOUT')
    return { bg: 'rgba(112,120,128,0.1)', color: '#707880' };
  return { bg: 'rgba(0,92,134,0.1)', color: '#005c86' };
};

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const getActionLabel = (action: string): string =>
  AUDIT_ACTIONS.find((a) => a.value === action)?.label ?? action;

const targetIcon = (t: AuditTargetType | null): string => {
  switch (t) {
    case 'USER':
      return 'person';
    case 'PARTNER':
      return 'store';
    case 'VOUCHER':
      return 'confirmation_number';
    case 'ORDER':
      return 'shopping_cart';
    case 'BRANCH':
      return 'storefront';
    case 'CATEGORY':
      return 'category';
    case 'POLICY':
      return 'policy';
    case 'BANNER':
      return 'image';
    case 'POPUP':
      return 'campaign';
    case 'POST':
      return 'article';
    case 'ADMIN':
      return 'admin_panel_settings';
    default:
      return 'help';
  }
};

export default function AuditLogs() {
  const { showToast } = useToast();
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const {
    logs,
    actions: dbActions,
    page,
    limit,
    total,
    totalPages,
    filters,
    loading,
    error,
    setPage,
    setLimit,
    updateFilters,
    resetFilters,
    refresh,
  } = useAuditLog();

  const actionOptions = useMemo(() => {
    const all = new Set<string>([...AUDIT_ACTIONS.map((a) => a.value), ...dbActions]);
    return Array.from(all).sort();
  }, [dbActions]);

  const filteredLogs = useMemo(() => logs, [logs]);

  const handleExportCsv = () => {
    if (filteredLogs.length === 0) {
      showToast('Không có dữ liệu để xuất', 'warning');
      return;
    }
    const headers = [
      'logId',
      'createdAt',
      'actorId',
      'actorType',
      'action',
      'targetType',
      'targetId',
      'description',
      'metadata',
    ];
    const rows = filteredLogs.map((l) =>
      [
        l.logId,
        l.createdAt,
        l.actorId ?? '',
        l.actorType,
        l.action,
        l.targetType ?? '',
        l.targetId ?? '',
        `"${l.description.replace(/"/g, '""')}"`,
        l.metadata ? `"${JSON.stringify(l.metadata).replace(/"/g, '""')}"` : '',
      ].join(','),
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Đã xuất ${filteredLogs.length} nhật ký`, 'success');
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 className="font-headline-lg" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
            Nhật ký hệ thống
          </h1>
          <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            Truy vết toàn bộ thao tác admin trên hệ thống.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="admin-btn admin-btn-ghost" onClick={refresh}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              refresh
            </span>
            Làm mới
          </button>
          <button className="admin-btn admin-btn-ghost" onClick={handleExportCsv}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              file_download
            </span>
            Xuất CSV
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {[
          { label: 'Tổng nhật ký', value: total, color: '#3B82F6' },
          { label: 'Hành động duy nhất', value: dbActions.length, color: '#005c86' },
          { label: 'Số trang', value: totalPages, color: '#10B981' },
          { label: 'Đang tải', value: loading ? '...' : 'OK', color: loading ? '#F59E0B' : '#10B981' },
        ].map((s) => (
          <div key={s.label} className="admin-card" style={{ padding: '1rem', textAlign: 'center' }}>
            <p
              className="font-label-sm"
              style={{
                color: 'var(--color-on-surface-variant)',
                marginBottom: '0.25rem',
                fontSize: '0.65rem',
              }}
            >
              {s.label}
            </p>
            <p className="font-headline-md" style={{ fontSize: '1.5rem', color: s.color }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="admin-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="admin-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder="ID đối tượng (targetId)"
            value={filters.targetId ?? ''}
            onChange={(e) => updateFilters({ targetId: e.target.value || undefined })}
          />
          <select
            className="admin-input admin-select"
            style={{ width: 'auto' }}
            value={filters.action ?? ''}
            onChange={(e) => updateFilters({ action: e.target.value || undefined })}
          >
            <option value="">Tất cả hành động</option>
            {actionOptions.map((a) => (
              <option key={a} value={a}>
                {getActionLabel(a)}
              </option>
            ))}
          </select>
          <select
            className="admin-input admin-select"
            style={{ width: 'auto' }}
            value={filters.targetType ?? ''}
            onChange={(e) =>
              updateFilters({ targetType: (e.target.value || undefined) as AuditTargetType | undefined })
            }
          >
            {TARGET_TYPES.map((t) => (
              <option key={t.value || 'all'} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            className="admin-input admin-select"
            style={{ width: 'auto' }}
            value={filters.actorType ?? ''}
            onChange={(e) =>
              updateFilters({ actorType: (e.target.value || undefined) as AuditActorType | undefined })
            }
          >
            {ACTOR_TYPES.map((a) => (
              <option key={a.value || 'all'} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
          <input
            className="admin-input"
            type="date"
            style={{ width: 'auto' }}
            value={filters.fromDate?.slice(0, 10) ?? ''}
            onChange={(e) =>
              updateFilters({ fromDate: e.target.value ? `${e.target.value}T00:00:00.000Z` : undefined })
            }
          />
          <span className="font-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            →
          </span>
          <input
            className="admin-input"
            type="date"
            style={{ width: 'auto' }}
            value={filters.toDate?.slice(0, 10) ?? ''}
            onChange={(e) =>
              updateFilters({ toDate: e.target.value ? `${e.target.value}T23:59:59.999Z` : undefined })
            }
          />
          <button className="admin-btn admin-btn-ghost" onClick={resetFilters}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              filter_alt_off
            </span>
            Reset
          </button>
        </div>
      </div>

      {error && (
        <div
          className="admin-card"
          style={{
            padding: '1rem',
            marginBottom: '1rem',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#EF4444',
          }}
        >
          <strong>Lỗi:</strong> {error}
        </div>
      )}

      <div className="admin-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Người thực hiện</th>
                <th>Hành động</th>
                <th>Đối tượng</th>
                <th>Mô tả</th>
                <th style={{ textAlign: 'right' }}>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-on-surface-variant)' }}
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-on-surface-variant)' }}
                  >
                    Không tìm thấy nhật ký nào.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const ac = actionStyle(log.action);
                  const initials = (log.actor?.fullName ?? log.actor?.email ?? 'SY')
                    .split(/[\s@_]/)
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();
                  return (
                    <tr key={log.logId}>
                      <td>
                        <span
                          className="font-label-sm"
                          style={{
                            color: 'var(--color-outline)',
                            fontSize: '0.7rem',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formatDate(log.createdAt)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div
                            style={{
                              width: '1.75rem',
                              height: '1.75rem',
                              borderRadius: '50%',
                              background:
                                log.actorType === 'ADMIN' ? 'rgba(0,92,134,0.15)' : 'rgba(112,120,128,0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.6rem',
                              fontWeight: 700,
                              color: log.actorType === 'ADMIN' ? '#005c86' : '#707880',
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <p className="font-body-sm" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                              {log.actor?.fullName ?? log.actor?.email ?? '—'}
                            </p>
                            <p
                              className="font-label-sm"
                              style={{
                                color: 'var(--color-on-surface-variant)',
                                fontSize: '0.6rem',
                              }}
                            >
                              {AUDIT_ACTOR_TYPE_LABELS[log.actorType]}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '9999px',
                            background: ac.bg,
                            color: ac.color,
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: '0.65rem',
                            fontWeight: 600,
                          }}
                        >
                          {getActionLabel(log.action)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: '16px', color: 'var(--color-on-surface-variant)' }}
                          >
                            {targetIcon(log.targetType)}
                          </span>
                          <div>
                            <p className="font-body-sm" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                              {log.targetType ? AUDIT_TARGET_TYPE_LABELS[log.targetType] : '—'}
                            </p>
                            <p
                              className="font-label-sm"
                              style={{ color: 'var(--color-outline)', fontSize: '0.65rem' }}
                            >
                              {log.targetId ?? '—'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="font-body-sm" style={{ fontSize: '0.8rem', lineHeight: 1.4, maxWidth: '400px' }}>
                          {log.description}
                        </p>
                      </td>
                      <td>
                        <button
                          className="admin-btn admin-btn-ghost"
                          style={{ padding: '0.25rem', fontSize: '0.7rem' }}
                          onClick={() => setSelectedLog(log)}
                          title="Xem chi tiết"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                            info
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--color-outline-variant)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <p className="font-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            Trang {page}/{totalPages || 1} · Tổng {total} nhật ký
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select
              className="admin-input admin-select"
              style={{ width: 'auto', padding: '0.25rem 0.5rem' }}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
              <option value={100}>100 / trang</option>
            </select>
            <button
              className="pagination-btn"
              disabled={page <= 1 || loading}
              onClick={() => setPage(page - 1)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                chevron_left
              </span>
            </button>
            <button
              className="pagination-btn"
              disabled={page >= totalPages || loading}
              onClick={() => setPage(page + 1)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>

      {selectedLog && (
        <>
          <div className="side-panel-overlay" onClick={() => setSelectedLog(null)} />
          <div className="side-panel" style={{ width: '36rem' }}>
            <div
              style={{
                padding: '1.5rem',
                borderBottom: '1px solid var(--color-outline-variant)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3 className="font-headline-md" style={{ fontSize: '1.25rem' }}>
                Chi tiết nhật ký
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                }}
              >
                {[
                  { label: 'Mã nhật ký', value: `#LOG-${selectedLog.logId}` },
                  { label: 'Thời gian', value: formatDate(selectedLog.createdAt) },
                  {
                    label: 'Người thực hiện',
                    value: selectedLog.actor?.fullName ?? selectedLog.actor?.email ?? '—',
                  },
                  { label: 'Loại actor', value: AUDIT_ACTOR_TYPE_LABELS[selectedLog.actorType] },
                  { label: 'Hành động', value: getActionLabel(selectedLog.action) },
                  {
                    label: 'Đối tượng',
                    value: `${selectedLog.targetType ? AUDIT_TARGET_TYPE_LABELS[selectedLog.targetType] : '—'} — ${
                      selectedLog.targetId ?? '—'
                    }`,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      padding: '0.75rem',
                      background: 'var(--color-surface-container-low)',
                      borderRadius: '0.5rem',
                    }}
                  >
                    <p
                      className="font-label-sm"
                      style={{
                        color: 'var(--color-on-surface-variant)',
                        fontSize: '0.65rem',
                        marginBottom: '0.25rem',
                      }}
                    >
                      {item.label}
                    </p>
                    <p
                      className="font-body-sm"
                      style={{ fontWeight: 600, fontSize: '0.8rem', wordBreak: 'break-all' }}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4
                  className="font-label-md"
                  style={{
                    marginBottom: '0.5rem',
                    color: 'var(--color-primary)',
                    borderBottom: '1px solid rgba(0,92,134,0.2)',
                    paddingBottom: '0.5rem',
                  }}
                >
                  MÔ TẢ HÀNH ĐỘNG
                </h4>
                <p className="font-body-sm" style={{ lineHeight: 1.6, color: 'var(--color-on-surface-variant)' }}>
                  {selectedLog.description}
                </p>
              </div>

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <h4
                    className="font-label-md"
                    style={{
                      marginBottom: '0.5rem',
                      color: 'var(--color-primary)',
                      borderBottom: '1px solid rgba(0,92,134,0.2)',
                      paddingBottom: '0.5rem',
                    }}
                  >
                    METADATA (before/after, payload...)
                  </h4>
                  <pre
                    style={{
                      background: 'var(--color-surface-container-lowest)',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.7rem',
                      fontFamily: '"JetBrains Mono", monospace',
                      overflowX: 'auto',
                      maxHeight: '24rem',
                      color: 'var(--color-on-surface)',
                    }}
                  >
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}