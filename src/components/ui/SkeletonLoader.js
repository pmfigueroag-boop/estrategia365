/**
 * Institutional Skeleton Loaders
 * Replace "⏳ Cargando…" text with shimmer animations.
 */

export function CardSkeleton({ count = 1 }) {
  return Array.from({ length: count }, (_, i) => (
    <div key={i} className="glass-panel skeleton skeleton-card" style={{ marginBottom: '1rem' }} />
  ));
}

export function KPISkeleton({ count = 4 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(count, 4)}, 1fr)`, gap: '1rem' }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="glass-panel skeleton skeleton-kpi" />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div className="skeleton skeleton-title" />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton skeleton-text" style={{ width: `${70 + Math.random() * 30}%` }} />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="animate-fade-in" style={{ padding: '1rem 0' }}>
      <div className="skeleton skeleton-title" style={{ width: '35%', marginBottom: '0.5rem' }} />
      <div className="skeleton skeleton-text sm" style={{ marginBottom: '2rem' }} />
      <KPISkeleton count={4} />
      <div style={{ marginTop: '1.5rem' }}>
        <CardSkeleton count={2} />
      </div>
    </div>
  );
}
