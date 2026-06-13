'use client';

/**
 * ScoreBar — Visual score indicator (0-10 or 0-100)
 * Phase 1: Base UI Component Library
 *
 * @param {number} value - Current score value
 * @param {number} max - Maximum possible value (default: 10)
 * @param {string} label - Optional label text
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} showValue - Show numeric value
 */
export default function ScoreBar({ value = 0, max = 10, label, size = 'md', showValue = true }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const color = pct >= 70 ? 'var(--success-color)' : pct >= 40 ? 'var(--warning-color)' : 'var(--danger-color)';
  const heights = { sm: 6, md: 10, lg: 16 };
  const h = heights[size] || 10;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
      {label && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', minWidth: 60 }}>{label}</span>}
      <div style={{
        flex: 1, height: h, borderRadius: h / 2,
        background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: h / 2,
          background: color, transition: 'width 0.5s ease',
        }} />
      </div>
      {showValue && (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', minWidth: 32, textAlign: 'right' }}>
          {typeof value === 'number' ? value.toFixed(1) : value}/{max}
        </span>
      )}
    </div>
  );
}
