import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActivePopup } from '../hooks/useActivePopup';
import type { Popup } from '../services/api';

interface PopupBannerProps {
  delayMs?: number;
}

function resolveLink(url: string | null) {
  const fallback = '/vouchers';
  const target = url && url.trim() !== '' ? url : fallback;
  const isExternal = /^https?:\/\//i.test(target);
  return { target, isExternal };
}

export default function PopupBanner({ delayMs = 1500 }: PopupBannerProps) {
  const { popup, isVisible, dismiss } = useActivePopup();
  const [shouldShow, setShouldShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isVisible) {
      setShouldShow(false);
      return;
    }
    const t = setTimeout(() => setShouldShow(true), delayMs);
    return () => clearTimeout(t);
  }, [isVisible, delayMs]);

  if (!popup || !shouldShow) return null;

  const { target, isExternal } = resolveLink(popup.ctaTargetUrl);

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isExternal) {
      // external link: let <a target="_blank"> handle it
      return;
    }
    e.preventDefault();
    dismiss();
    navigate(target);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-surface, #fff)',
          borderRadius: '1rem',
          maxWidth: '32rem',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          animation: 'scaleIn 0.25s ease-out',
          position: 'relative',
        }}
      >
        {/* Nút đóng — nằm trên cùng, bên phải popup */}
        <button
          onClick={dismiss}
          aria-label="Đóng popup"
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            background: 'rgba(0,0,0,0.45)',
            border: 'none',
            borderRadius: '50%',
            width: '2rem',
            height: '2rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem',
            color: '#fff',
            zIndex: 10,
          }}
        >
          ×
        </button>

        {/* Click vào ảnh để chuyển trang */}
        {popup.imageUrl && (
          isExternal ? (
            <a
              href={target}
              target="_blank"
              rel="noopener noreferrer"
              onClick={dismiss}
              style={{ display: 'block', textDecoration: 'none' }}
            >
              <img
                src={popup.imageUrl}
                alt={popup.title}
                style={{
                  width: '100%',
                  display: 'block',
                  borderTopLeftRadius: '1rem',
                  borderTopRightRadius: '1rem',
                  cursor: 'pointer',
                }}
              />
            </a>
          ) : (
            <a
              href={target}
              onClick={handleImageClick}
              style={{ display: 'block', textDecoration: 'none' }}
            >
              <img
                src={popup.imageUrl}
                alt={popup.title}
                style={{
                  width: '100%',
                  display: 'block',
                  borderTopLeftRadius: '1rem',
                  borderTopRightRadius: '1rem',
                  cursor: 'pointer',
                }}
              />
            </a>
          )
        )}

        <div style={{ padding: '1.5rem' }}>
          <h2 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 600 }}>
            {popup.title}
          </h2>
          <p style={{ margin: 0, color: 'var(--color-on-surface-variant, #555)', lineHeight: 1.5 }}>
            {popup.body}
          </p>
        </div>
      </div>
    </div>
  );
}