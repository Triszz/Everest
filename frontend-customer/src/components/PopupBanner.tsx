import { useEffect, useState } from 'react';
import { useActivePopup } from '../hooks/useActivePopup';
import type { Popup } from '../services/api';

interface PopupBannerProps {
  delayMs?: number;
}

export default function PopupBanner({ delayMs = 1500 }: PopupBannerProps) {
  const { popup, isVisible, dismiss } = useActivePopup();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setShouldShow(false);
      return;
    }
    const t = setTimeout(() => setShouldShow(true), delayMs);
    return () => clearTimeout(t);
  }, [isVisible, delayMs]);

  if (!popup || !shouldShow) return null;

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
      onClick={dismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-surface, #fff)',
          borderRadius: '1rem',
          maxWidth: '32rem',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          animation: 'scaleIn 0.25s ease-out',
        }}
      >
        {popup.imageUrl && (
          <img
            src={popup.imageUrl}
            alt={popup.title}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '14rem',
              objectFit: 'cover',
              borderTopLeftRadius: '1rem',
              borderTopRightRadius: '1rem',
            }}
          />
        )}
        <div style={{ padding: '1.5rem', position: 'relative' }}>
          <button
            onClick={dismiss}
            aria-label="Đóng popup"
            style={{
              position: 'absolute',
              top: '0.75rem',
              right: '0.75rem',
              background: 'rgba(0,0,0,0.05)',
              border: 'none',
              borderRadius: '50%',
              width: '2rem',
              height: '2rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              color: 'var(--color-on-surface, #222)',
            }}
          >
            ×
          </button>
          <h2 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 600, paddingRight: '2rem' }}>
            {popup.title}
          </h2>
          <p style={{ margin: 0, marginBottom: '1.25rem', color: 'var(--color-on-surface-variant, #555)', lineHeight: 1.5 }}>
            {popup.body}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button
              onClick={dismiss}
              style={{
                padding: '0.625rem 1.25rem',
                background: 'transparent',
                border: '1px solid var(--color-outline, #ccc)',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                color: 'var(--color-on-surface, #222)',
                fontWeight: 500,
              }}
            >
              Đóng
            </button>
            {popup.ctaLabel && (
              <a
                href={popup.ctaTargetUrl ?? '#'}
                onClick={dismiss}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: 'var(--color-primary, #0066cc)',
                  color: 'var(--color-on-primary, #fff)',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                {popup.ctaLabel}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}