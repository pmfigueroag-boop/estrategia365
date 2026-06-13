'use client';
/**
 * PestelHeatMap — Cross-Factor Interaction Matrix (Sprint 3)
 * ============================================================
 * Renders a 6×6 heat map showing how PESTEL factors interact
 * and amplify each other's risk profiles.
 */

const FACTOR_ORDER = ['P', 'E', 'S', 'T', 'E2', 'L'];
const FACTOR_LABELS = { P: 'Político', E: 'Económico', S: 'Social', T: 'Tecnológico', E2: 'Ecológico', L: 'Legal' };

function intensityColor(value) {
  if (value >= 2.5) return 'rgba(239,68,68,0.7)';   // Red — Critical
  if (value >= 2.0) return 'rgba(249,115,22,0.6)';   // Orange — High
  if (value >= 1.5) return 'rgba(250,204,21,0.5)';   // Yellow — Moderate
  if (value >= 1.0) return 'rgba(34,197,94,0.35)';   // Green — Low
  if (value > 0)    return 'rgba(59,130,246,0.2)';    // Blue — Minimal
  return 'rgba(255,255,255,0.03)';                     // Empty
}

function intensityLabel(value) {
  if (value >= 2.5) return '🔴';
  if (value >= 2.0) return '🟠';
  if (value >= 1.5) return '🟡';
  if (value >= 1.0) return '🟢';
  if (value > 0)    return '🔵';
  return '·';
}

export default function PestelHeatMap({ heatMap }) {
  if (!heatMap || heatMap.length === 0) return null;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
        🔥 Matriz de Interacción Cross-Factor
      </h3>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
        Intensidad de correlación entre factores PESTEL — las celdas más oscuras indican mayor amplificación de riesgo
      </p>
      
      {/* Legend */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {[
          { color: 'rgba(239,68,68,0.7)', label: 'Crítico (2.5+)' },
          { color: 'rgba(249,115,22,0.6)', label: 'Alto (2.0)' },
          { color: 'rgba(250,204,21,0.5)', label: 'Moderado (1.5)' },
          { color: 'rgba(34,197,94,0.35)', label: 'Bajo (1.0)' },
          { color: 'rgba(59,130,246,0.2)', label: 'Mínimo' },
        ].map(({ color, label }) => (
          <span key={label} style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: color, display: 'inline-block' }}></span>
            <span style={{ color: 'var(--text-tertiary)' }}>{label}</span>
          </span>
        ))}
      </div>

      {/* Matrix Grid */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '3px' }}>
          <thead>
            <tr>
              <th style={{ padding: '6px', fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center', minWidth: '70px' }}></th>
              {FACTOR_ORDER.map(f => (
                <th key={f} style={{
                  padding: '6px 4px', fontSize: '0.7rem', fontWeight: 600,
                  color: 'var(--text-secondary)', textAlign: 'center', minWidth: '70px'
                }}>
                  {FACTOR_LABELS[f]?.slice(0, 6)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatMap.map((row) => (
              <tr key={row.factor}>
                <td style={{
                  padding: '6px 8px', fontSize: '0.75rem', fontWeight: 600,
                  color: 'var(--text-secondary)', textAlign: 'right'
                }}>
                  {FACTOR_LABELS[row.factor]?.slice(0, 6)}
                </td>
                {FACTOR_ORDER.map(col => {
                  const val = row[col] || 0;
                  const isDiag = row.factor === col;
                  return (
                    <td key={col} style={{
                      padding: '8px 4px',
                      background: isDiag ? 'rgba(139,92,246,0.25)' : intensityColor(val),
                      borderRadius: '6px',
                      textAlign: 'center',
                      fontSize: '0.85rem',
                      fontWeight: isDiag ? 700 : 500,
                      color: isDiag ? '#a78bfa' : 'var(--text-primary)',
                      border: isDiag ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.05)',
                      cursor: 'default',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                    }}
                      title={`${FACTOR_LABELS[row.factor]} → ${FACTOR_LABELS[col]}: ${val.toFixed(1)}/3.0`}
                    >
                      <span style={{ fontSize: '0.7rem' }}>{isDiag ? `⚡${val.toFixed(1)}` : (val > 0 ? val.toFixed(1) : '—')}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
