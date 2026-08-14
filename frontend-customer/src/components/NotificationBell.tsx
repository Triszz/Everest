import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { notificationApi } from '../services';
import type { Notification } from '../services';

const NOTIFICATION_ICONS: Record<string, { bg: string; icon: React.ReactNode }> = {
  ORDER_PAID: {
    bg: '#E0F2FE',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0E76A8" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
  },
  VOUCHER_GIFT_RECEIVED: {
    bg: '#ECFDF5',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
        <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/>
        <line x1="12" y1="22" x2="12" y2="7"/>
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
      </svg>
    ),
  },
  VOUCHER_EXPIRING: {
    bg: '#FEF3C7',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  SYSTEM: {
    bg: '#F1F5F9',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    ),
  },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} ngày trước`;
  if (hours > 0) return `${hours} giờ trước`;
  if (minutes > 0) return `${minutes} phút trước`;
  return 'Vừa xong';
}

interface NotificationBellProps {
  isLoggedIn: boolean;
}

export function NotificationBell({ isLoggedIn }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadUnreadCount = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const res = await notificationApi.getUnreadCount();
      if (res.success && res.data) {
        setUnreadCount(res.data.count);
      }
    } catch {
      // ignore
    }
  }, [isLoggedIn]);

  // Polling mỗi 30s
  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  // Khi mở dropdown → load list mới nhất
  const handleToggle = async () => {
    if (!open) {
      setLoading(true);
      try {
        const res = await notificationApi.list(1, 5);
        if (res.success) {
          setNotifications(res.notifications);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    setOpen(!open);
  };

  // Click outside để đóng
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }
  }, [open]);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'Read' as const })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        id="header-notification"
        aria-label="Notifications"
        onClick={handleToggle}
        style={{
          position: 'relative',
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: open ? '1.5px solid #BAE6FD' : '1.5px solid #E2E8F0',
          borderRadius: 10,
          background: open ? '#E8F4FA' : 'white',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          if (!open) {
            e.currentTarget.style.borderColor = '#0E76A8';
            e.currentTarget.style.background = '#E8F4FA';
          }
        }}
        onMouseLeave={e => {
          if (!open) {
            e.currentTarget.style.borderColor = '#E2E8F0';
            e.currentTarget.style.background = 'white';
          }
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -6, right: -6,
            minWidth: 18, height: 18,
            background: '#EF4444',
            color: 'white',
            fontSize: 10, fontWeight: 700,
            borderRadius: 9,
            padding: '0 5px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 0 2px white',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 360,
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 100,
            animation: 'dropIn 0.15s ease-out',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px',
            borderBottom: '1px solid #F1F5F9',
          }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1E293B', fontFamily: 'Manrope, sans-serif' }}>
              Thông báo
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 12, color: '#0E76A8', fontWeight: 600,
                }}
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
                Đang tải...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" style={{ margin: '0 auto 12px', display: 'block' }}>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                Chưa có thông báo nào
              </div>
            ) : (
              notifications.map((n) => {
                const meta = NOTIFICATION_ICONS[n.type] || NOTIFICATION_ICONS.SYSTEM;
                const isUnread = n.status === 'Unread';
                return (
                  <Link
                    key={n.notificationId}
                    to={`/notifications/${n.notificationId}`}
                    onClick={() => setOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '12px 16px',
                      textDecoration: 'none',
                      background: isUnread ? '#F0F9FF' : 'white',
                      borderBottom: '1px solid #F1F5F9',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                    onMouseLeave={e => e.currentTarget.style.background = isUnread ? '#F0F9FF' : 'white'}
                  >
                    <div style={{
                      width: 36, height: 36,
                      background: meta.bg,
                      borderRadius: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {meta.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: isUnread ? 700 : 600,
                        color: '#1E293B', marginBottom: 2,
                      }}>
                        {n.title}
                      </div>
                      <div style={{
                        fontSize: 12, color: '#64748B',
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        lineHeight: 1.4,
                      }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                        {timeAgo(n.createdAt)}
                      </div>
                    </div>
                    {isUnread && (
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: '#0E76A8', flexShrink: 0, marginTop: 8,
                      }}/>
                    )}
                  </Link>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              style={{
                display: 'block',
                padding: '12px 16px',
                textAlign: 'center',
                fontSize: 13, fontWeight: 600,
                color: '#0E76A8',
                textDecoration: 'none',
                borderTop: '1px solid #F1F5F9',
                background: '#F8FAFC',
              }}
            >
              Xem tất cả thông báo
            </Link>
          )}
        </div>
      )}
    </div>
  );
}