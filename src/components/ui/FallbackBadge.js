'use client';

/**
 * FallbackBadge — AI-002 Remediation (Phase 2.7 Enhanced)
 * =========================================================
 * Visual indicator when analysis data comes from stochastic fallback
 * instead of real AI analysis. This ensures users NEVER make strategic
 * decisions based on generic placeholder data without knowing it.
 *
 * Detects fallback via:
 *   1. `is_fallback: true` boolean from API (Phase 2.7)
 *   2. `source` string containing "Fallback" (legacy compat)
 *
 * Usage:
 *   <FallbackBadge items={pestelSignals} />
 *   <FallbackBadge isFallback={true} />
 */

function _isFallbackItem(item) {
  // Phase 2.7: API now sends explicit is_fallback boolean
  if (item.is_fallback === true) return true;
  // Legacy: check source string
  if (typeof item.source === 'string') {
    const s = item.source.toLowerCase();
    return s.includes('fallback') || s.includes('stochastic');
  }
  return false;
}

export default function FallbackBadge({ items, isFallback, compact = false }) {
  // Determine fallback status
  const hasFallback = isFallback ?? (
    Array.isArray(items) && items.length > 0 &&
    items.some(_isFallbackItem)
  );

  if (!hasFallback) return null;

  const allFallback = isFallback ?? (
    Array.isArray(items) && items.length > 0 &&
    items.every(_isFallbackItem)
  );

  if (compact) {
    return (
      <span
        title="Datos de respaldo genéricos — No basados en análisis institucional real"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '2px 8px', borderRadius: 6, fontSize: '0.7rem',
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          color: '#f59e0b',
        }}
      >
        ⚠️ Respaldo
      </span>
    );
  }

  return (
    <div
      role="alert"
      id="fallback-alert"
      style={{
        padding: '0.75rem 1rem',
        marginBottom: '1rem',
        borderRadius: 10,
        background: allFallback
          ? 'rgba(239, 68, 68, 0.08)'
          : 'rgba(245, 158, 11, 0.08)',
        border: `1px solid ${allFallback
          ? 'rgba(239, 68, 68, 0.3)'
          : 'rgba(245, 158, 11, 0.3)'}`,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        fontSize: '0.85rem',
        lineHeight: 1.5,
      }}
    >
      <span style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: 1 }}>
        {allFallback ? '🔴' : '🟡'}
      </span>
      <div>
        <strong style={{ color: allFallback ? '#ef4444' : '#f59e0b' }}>
          {allFallback
            ? 'Datos de respaldo — No son análisis reales'
            : 'Algunos datos provienen de respaldo genérico'}
        </strong>
        <p style={{
          margin: '0.25rem 0 0 0', fontSize: '0.8rem',
          color: 'var(--text-secondary)', lineHeight: 1.4,
        }}>
          {allFallback
            ? 'La IA no pudo generar un análisis personalizado. Estos datos son contextualizados con el perfil de su institución pero NO son un análisis profundo. Ejecute un nuevo análisis para obtener resultados reales.'
            : 'Parte de estos datos fueron generados como respaldo contextualizado. Los items marcados deben ser verificados o regenerados.'}
        </p>
      </div>
    </div>
  );
}

/**
 * FallbackItemTag — Inline indicator for individual items
 * Supports both `is_fallback` boolean and legacy `source` string detection.
 */
export function FallbackItemTag({ source, is_fallback }) {
  const isFb = is_fallback === true || _isFallbackItem({ source, is_fallback });
  if (!isFb) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '1px 6px', borderRadius: 4, fontSize: '0.65rem',
      background: 'rgba(245, 158, 11, 0.12)',
      border: '1px solid rgba(245, 158, 11, 0.25)',
      color: '#f59e0b', marginLeft: 6, verticalAlign: 'middle',
    }}>
      ⚠ respaldo
    </span>
  );
}

