import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationApi } from '../services';
import type { Notification } from '../services';
import Loading from '../components/Loading';

const NOTIFICATION_ICONS: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
  ORDER_PAID: {
    bg: '#E0F2FE',
    color: '#0E76A8',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
  },
  ORDER_PURCHASED: {
    bg: '#E0F2FE',
    color: '#0E76A8',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    ),
  },
  VOUCHER_GIFT_RECEIVED: {
    bg: '#ECFDF5',
    color: '#10B981',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/>
        <line x1="12" y1="22" x2="12" y2="7"/>
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
      </svg>
    ),
  },
  VOUCHER_EXPIRING: {
    bg: '#FEF3C7',
    color: '#F59E0B',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  SYSTEM: {
    bg: '#F1F5F9',
    color: '#64748B',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    ),
  },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) {
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }
  if (days === 1) return 'Hôm qua';
  if (days < 7) return `${days} ngày trước`;
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const loadNotifications = async (pageNum: number, append: boolean = false) => {
    try {
      setLoading(true);
      const res = await notificationApi.list(pageNum, 20);
      if (res.success) {
        const newList = append ? [...notifications, ...res.notifications] : res.notifications;
        setNotifications(newList);
        setTotal(res.pagination.total);
        setHasMore(pageNum < res.pagination.totalPages);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(1);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.notificationId === id ? { ...n, status: 'Read' as const } : n))
    );
    try {
      await notificationApi.markAsRead(id);
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, status: 'Read' as const })));
    try {
      await notificationApi.markAllAsRead();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa thông báo này?')) return;
    setNotifications((prev) => prev.filter((n) => n.notificationId !== id));
    setTotal((t) => t - 1);
    try {
      await notificationApi.delete(id);
    } catch {
      // ignore
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadNotifications(nextPage, true);
  };

  const filtered = filter === 'unread'
    ? notifications.filter((n) => n.status === 'Unread')
    : notifications;

  const unreadCount = notifications.filter((n) => n.status === 'Unread').length;

  if (loading && notifications.length === 0) {
    return <Loading />;
  }

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '12px 24px' }}>
          <span style={{ fontSize: 13, color: '#64748B' }}>
            <Link to="/" style={{ color: '#0E76A8', textDecoration: 'none' }}>Trang chủ</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: '#1E293B', fontWeight: 600 }}>Thông báo</span>
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            padding: '24px 28px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <h1 style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: 22,
                fontWeight: 800,
                color: '#1E293B',
                margin: 0,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0E76A8" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                Thông báo
              </h1>
              <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#64748B' }}>
                {total > 0 ? `Tổng cộng ${total} thông báo` : 'Bạn chưa có thông báo nào'}
                {unreadCount > 0 && ` · ${unreadCount} chưa đọc`}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  padding: '8px 16px',
                  background: '#0E76A8',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#0A5C87'}
                onMouseLeave={e => e.currentTarget.style.background = '#0E76A8'}
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {/* Filter tabs */}
          {total > 0 && (
            <div style={{
              padding: '0 28px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              gap: 4,
            }}>
              <FilterTab
                label={`Tất cả (${total})`}
                active={filter === 'all'}
                onClick={() => setFilter('all')}
              />
              <FilterTab
                label={`Chưa đọc (${unreadCount})`}
                active={filter === 'unread'}
                onClick={() => setFilter('unread')}
              />
            </div>
          )}

          {/* Notification list */}
          {filtered.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            <>
              {filtered.map((n) => {
                const meta = NOTIFICATION_ICONS[n.type] || NOTIFICATION_ICONS.SYSTEM;
                const isUnread = n.status === 'Unread';
                return (
                  <NotificationItem
                    key={n.notificationId}
                    notification={n}
                    meta={meta}
                    isUnread={isUnread}
                    onMarkRead={() => handleMarkAsRead(n.notificationId)}
                    onDelete={() => handleDelete(n.notificationId)}
                  />
                );
              })}

              {hasMore && filter === 'all' && (
                <div style={{ padding: 20, textAlign: 'center', borderTop: '1px solid #F1F5F9' }}>
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    style={{
                      padding: '10px 24px',
                      background: 'white',
                      color: '#0E76A8',
                      border: '1.5px solid #0E76A8',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: loading ? 'wait' : 'pointer',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {loading ? 'Đang tải...' : 'Tải thêm'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '14px 16px',
        background: 'none',
        border: 'none',
        borderBottom: active ? '2px solid #0E76A8' : '2px solid transparent',
        color: active ? '#0E76A8' : '#64748B',
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        cursor: 'pointer',
        fontFamily: 'Inter, sans-serif',
        marginBottom: -1,
      }}
    >
      {label}
    </button>
  );
}

function NotificationItem({
  notification,
  meta,
  isUnread,
  onMarkRead,
  onDelete,
}: {
  notification: Notification;
  meta: { bg: string; color: string; icon: React.ReactNode };
  isUnread: boolean;
  onMarkRead: () => void;
  onDelete: () => void;
}) {
  const data = notification.data as { orderId?: number; voucherCode?: string } | null;
  const linkTarget = `/notifications/${notification.notificationId}`;

  const handleClick = () => {
    if (isUnread) onMarkRead();
  };

  return (
    <Link
      to={linkTarget}
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        padding: '18px 28px',
        background: isUnread ? '#F0F9FF' : 'white',
        borderBottom: '1px solid #F1F5F9',
        textDecoration: 'none',
        transition: 'background 0.15s',
        position: 'relative',
      }}
      onMouseEnter={e => {
        if (!isUnread) e.currentTarget.style.background = '#F8FAFC';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = isUnread ? '#F0F9FF' : 'white';
      }}
    >
      {/* Unread dot */}
      {isUnread && (
        <div style={{
          position: 'absolute', left: 10, top: 28,
          width: 8, height: 8, borderRadius: '50%',
          background: '#0E76A8',
        }}/>
      )}

      {/* Icon */}
      <div style={{
        width: 44, height: 44,
        background: meta.bg,
        color: meta.color,
        borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {meta.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          gap: 12, marginBottom: 4,
        }}>
          <h4 style={{
            margin: 0,
            fontSize: 14,
            fontWeight: isUnread ? 700 : 600,
            color: '#1E293B',
            fontFamily: 'Manrope, sans-serif',
          }}>
            {notification.title}
          </h4>
          <span style={{ fontSize: 11, color: '#94A3B8', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {formatDate(notification.createdAt)}
          </span>
        </div>
        <p style={{
          margin: 0,
          fontSize: 13,
          color: '#475569',
          lineHeight: 1.5,
        }}>
          {notification.message}
        </p>
      </div>

      {/* Actions */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete();
        }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 6,
          borderRadius: 8,
          color: '#94A3B8',
          display: 'flex',
          flexShrink: 0,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#FEE2E2';
          e.currentTarget.style.color = '#EF4444';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'none';
          e.currentTarget.style.color = '#94A3B8';
        }}
        aria-label="Xóa thông báo"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
    </Link>
  );
}

function EmptyState({ filter }: { filter: 'all' | 'unread' }) {
  return (
    <div style={{ padding: '60px 24px', textAlign: 'center' }}>
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" style={{ margin: '0 auto 16px', display: 'block' }}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#475569', margin: '0 0 8px 0' }}>
        {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
      </h3>
      <p style={{ fontSize: 13, color: '#94A3B8', margin: 0, maxWidth: 320, marginLeft: 'auto', marginRight: 'auto' }}>
        {filter === 'unread'
          ? 'Bạn đã đọc hết tất cả thông báo. Hẹn gặp lại!'
          : 'Các thông báo về đơn hàng, voucher tặng và cập nhật từ hệ thống sẽ xuất hiện ở đây.'}
      </p>
    </div>
  );
}