/**
 * Breadcrumb — Component điều hướng tái sử dụng
 * -----------------------------------------------
 * Hiển thị thanh breadcrumb + nút "Quay lại" tuỳ chọn.
 *
 * Props:
 *  - items: mảng { label, href? } — item cuối không cần href
 *  - backHref?: link quay lại cụ thể (dùng thay cho navigate(-1))
 *  - showBack?: có hiện nút "Quay lại" không (mặc định true)
 *  - maxWidth?: độ rộng container (mặc định 1200)
 */
import { Link, useNavigate } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  backHref?: string;
  showBack?: boolean;
  maxWidth?: number;
}

export function Breadcrumb({
  items,
  backHref,
  showBack = true,
  maxWidth = 1280,
}: BreadcrumbProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backHref) navigate(backHref);
    else navigate(-1);
  };

  return (
    <div style={{
      background: 'white',
      borderBottom: '1px solid #E2E8F0',
      position: 'sticky',
      top: 64,          // dưới header sticky (64px)
      zIndex: 40,
    }}>
      <div style={{
        maxWidth,
        margin: '0 auto',
        padding: '0 24px',
        height: 44,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        {/* Back button */}
        {showBack && (
          <button
            id="btn-breadcrumb-back"
            onClick={handleBack}
            aria-label="Quay lại"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px',
              background: 'none',
              border: '1.5px solid #E2E8F0',
              borderRadius: 8,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              fontSize: 13, fontWeight: 600,
              color: '#64748B',
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#0E76A8';
              e.currentTarget.style.color = '#0E76A8';
              e.currentTarget.style.background = '#F0F9FF';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#E2E8F0';
              e.currentTarget.style.color = '#64748B';
              e.currentTarget.style.background = 'none';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Quay lại
          </button>
        )}

        {/* Separator */}
        {showBack && (
          <div style={{ width: 1, height: 20, background: '#E2E8F0', flexShrink: 0 }} />
        )}

        {/* Breadcrumb trail */}
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                {idx > 0 && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                )}
                {isLast || !item.href ? (
                  <span style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 13,
                    fontWeight: isLast ? 600 : 400,
                    color: isLast ? '#1E293B' : '#64748B',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 200,
                  }}>
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.href}
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 13,
                      fontWeight: 400,
                      color: '#0E76A8',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#0A5C87'}
                    onMouseLeave={e => e.currentTarget.style.color = '#0E76A8'}
                  >
                    {item.label}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
