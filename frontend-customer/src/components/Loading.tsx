import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
  variant?: 'page' | 'section' | 'inline';
  size?: number;
}

export default function Loading({
  message,
  variant = 'page',
  size = 40,
}: LoadingProps) {
  const styles: React.CSSProperties =
    variant === 'page'
      ? {
          width: '100%',
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          boxSizing: 'border-box',
        }
      : variant === 'section'
      ? {
          width: '100%',
          padding: '64px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
        }
      : {
          width: '100%',
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxSizing: 'border-box',
        };

  return (
    <div role="status" aria-live="polite" style={styles}>
      {message ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Loader2
            size={size}
            style={{
              animation: 'spin 1s linear infinite',
              color: '#0E76A8',
            }}
          />
          <p
            style={{
              margin: 0,
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              color: '#64748B',
              textAlign: 'center',
            }}
          >
            {message}
          </p>
        </div>
      ) : (
        <Loader2
          size={size}
          style={{
            animation: 'spin 1s linear infinite',
            color: '#0E76A8',
          }}
        />
      )}
    </div>
  );
}