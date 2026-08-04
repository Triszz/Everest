/* eslint-disable react-refresh/only-export-components */

function SkeletonLine({
  width = "100%",
  height = 16,
  style,
}: {
  width?: string | number;
  height?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 8,
        background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        ...style,
      }}
    />
  );
}

export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  void rows;
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      padding: 24,
      border: '1px solid #F1F5F9',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    }}>
      <SkeletonLine width={120} height={14} style={{ marginBottom: 16 }} />
      <SkeletonLine width="60%" height={28} style={{ marginBottom: 8 }} />
      <SkeletonLine width="40%" height={12} />
    </div>
  );
}

export function SkeletonChart({ height = 300 }: { height?: number }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      padding: 24,
      border: '1px solid #F1F5F9',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    }}>
      <SkeletonLine width={160} height={16} style={{ marginBottom: 20 }} />
      <SkeletonLine width="100%" height={height} style={{ borderRadius: 12 }} />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      padding: 24,
      border: '1px solid #F1F5F9',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      overflow: 'hidden',
    }}>
      <SkeletonLine width={200} height={16} style={{ marginBottom: 20 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <SkeletonLine width="100%" height={40} />
        </div>
      ))}
    </div>
  );
}
