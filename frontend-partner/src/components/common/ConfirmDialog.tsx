import { useEffect, useRef } from 'react';

// ── Variant styles ────────────────────────────────────────────────────────────
type Variant = 'danger' | 'warning' | 'primary';

interface VariantConfig {
  confirmBg: string;
  confirmBgHover: string;
  confirmColor: string;
  iconBg: string;
  iconColor: string;
}

const VARIANT_CONFIG: Record<Variant, VariantConfig> = {
  danger: {
    confirmBg: '#EF4444',
    confirmBgHover: '#DC2626',
    confirmColor: '#ffffff',
    iconBg: '#FEF2F2',
    iconColor: '#EF4444',
  },
  warning: {
    confirmBg: '#F59E0B',
    confirmBgHover: '#D97706',
    confirmColor: '#ffffff',
    iconBg: '#FFFBEB',
    iconColor: '#F59E0B',
  },
  primary: {
    confirmBg: '#0E76A8',
    confirmBgHover: '#0A5C87',
    confirmColor: '#ffffff',
    iconBg: '#E8F4FA',
    iconColor: '#0E76A8',
  },
};

// ── Props ────────────────────────────────────────────────────────────────────
export interface ConfirmDialogProps {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: Variant;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// ── Component ───────────────────────────────────────────────────────────────
export function ConfirmDialog({
  title,
  description,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cfg = VARIANT_CONFIG[variant];
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus cancel on open so keyboard Enter = stay, Escape = stay
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      cancelRef.current?.focus();
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={loading ? undefined : onCancel}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(2px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: 420,
          margin: '0 16px',
          background: 'white',
          borderRadius: 16,
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          zIndex: 1001,
          overflow: 'hidden',
          animation: 'cd-slide-in 0.2s ease-out',
        }}
      >
        <div style={{ padding: '28px 28px 24px' }}>
          {/* Icon */}
          <div style={{
            width: 52, height: 52,
            borderRadius: 14,
            background: cfg.iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 18,
          }}>
            {variant === 'danger' ? (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={cfg.iconColor} strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            ) : variant === 'warning' ? (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={cfg.iconColor} strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={cfg.iconColor} strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
          </div>

          {/* Title */}
          <h2
            id="confirm-dialog-title"
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: 18, fontWeight: 700,
              color: '#1E293B',
              marginBottom: 8,
            }}
          >
            {title}
          </h2>

          {/* Description */}
          {description && (
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              color: '#64748B',
              lineHeight: 1.6,
              margin: 0,
            }}>
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex', gap: 10,
          padding: '0 28px 24px',
        }}>
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              flex: 1,
              padding: '11px 20px',
              background: 'white',
              color: '#64748B',
              border: '1.5px solid #E2E8F0',
              borderRadius: 10,
              fontFamily: 'Inter, sans-serif',
              fontSize: 14, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.currentTarget.style.borderColor = '#CBD5E1';
                e.currentTarget.style.color = '#1E293B';
              }
            }}
            onMouseLeave={e => {
              if (!loading) {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.color = '#64748B';
              }
            }}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1,
              padding: '11px 20px',
              background: loading ? cfg.confirmBg : cfg.confirmBgHover,
              color: cfg.confirmColor,
              border: 'none',
              borderRadius: 10,
              fontFamily: 'Inter, sans-serif',
              fontSize: 14, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'background 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  style={{ animation: 'spin 0.8s linear infinite' }}>
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                Đang xử lý...
              </>
            ) : confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes cd-slide-in {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 12px)); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
