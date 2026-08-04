import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  type?: 'empty' | 'error';
}

const ICONS = {
  empty: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5">
      <path d="M20 12v10H4V12" />
      <path d="M2 7h20v5H2z" />
      <path d="M12 22V7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  ),
  error: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  type = 'empty',
}: EmptyStateProps) {
  const content = (
    <div style={{ textAlign: 'center', padding: '64px 24px', background: 'white', borderRadius: 16, border: '1px solid #E2E8F0' }}>
      <div style={{
        width: 64, height: 64, borderRadius: 20, background: '#F1F5F9',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
      }}>
        {icon ?? ICONS[type]}
      </div>
      <h3 style={{
        fontFamily: 'Manrope, sans-serif',
        fontSize: 18, fontWeight: 700,
        color: '#1E293B', marginBottom: 8,
      }}>
        {title}
      </h3>
      {description && (
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 14, color: '#64748B', marginBottom: 24,
        }}>
          {description}
        </p>
      )}
      {action && (
        action.href ? (
          <Link
            to={action.href}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 24px', background: '#0E76A8', color: 'white',
              fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700,
              borderRadius: 10, textDecoration: 'none',
            }}
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            style={{
              padding: '10px 24px', background: '#0E76A8', color: 'white',
              border: 'none', borderRadius: 10,
              fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );

  return content;
}
