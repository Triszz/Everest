import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActivePopup } from '../hooks/useActivePopup';

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
          maxWidth: '30rem',
          width: '100%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
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
            background: 'rgba(0,0,0,0.5)',
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
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          ×
        </button>

        {/* Scrollable Container chứa ảnh + text + nút CTA */}
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* Click vào ảnh để chuyển trang */}
          {popup.imageUrl && (
            isExternal ? (
              <a
                href={target}
                target="_blank"
                rel="noopener noreferrer"
                onClick={dismiss}
                style={{ display: 'block', textDecoration: 'none', flexShrink: 0 }}
              >
                <img
                  src={popup.imageUrl}
                  alt={popup.title || 'Popup image'}
                  style={{
                    width: '100%',
                    maxHeight: '240px',
                    objectFit: 'cover',
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
                style={{ display: 'block', textDecoration: 'none', flexShrink: 0 }}
              >
                <img
                  src={popup.imageUrl}
                  alt={popup.title || 'Popup image'}
                  style={{
                    width: '100%',
                    maxHeight: '240px',
                    objectFit: 'cover',
                    display: 'block',
                    borderTopLeftRadius: '1rem',
                    borderTopRightRadius: '1rem',
                    cursor: 'pointer',
                  }}
                />
              </a>
            )
          )}

          <div style={{ padding: '1.25rem 1.5rem 1.5rem', textAlign: 'center' }}>
            {popup.title && (
              <h2 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-on-surface, #1e293b)' }}>
                {popup.title}
              </h2>
            )}
            {popup.body && (
              <p style={{ margin: 0, marginBottom: '1rem', color: 'var(--color-on-surface-variant, #64748b)', lineHeight: 1.5, fontSize: '0.925rem' }}>
                {popup.body}
              </p>
            )}

            {/* Nút bấm CTA căn giữa dưới cùng */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
              {isExternal ? (
                <a
                  href={target}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={dismiss}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.7rem 1.75rem',
                    borderRadius: '9999px',
                    background: 'linear-gradient(135deg, #0E76A8 0%, #1A8FC0 100%)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.925rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(14, 118, 168, 0.35)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(14, 118, 168, 0.45)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(14, 118, 168, 0.35)';
                  }}
                >
                  <span>{popup.ctaLabel?.trim() || 'Khám phá ngay'}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </a>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismiss();
                    navigate(target);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.7rem 1.75rem',
                    borderRadius: '9999px',
                    background: 'linear-gradient(135deg, #0E76A8 0%, #1A8FC0 100%)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.925rem',
                    border: 'none',
                    boxShadow: '0 4px 14px rgba(14, 118, 168, 0.35)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(14, 118, 168, 0.45)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(14, 118, 168, 0.35)';
                  }}
                >
                  <span>{popup.ctaLabel?.trim() || 'Khám phá ngay'}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}