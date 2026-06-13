/**
 * PestelExposureDashboard — Strategic Exposure by Factor (Phase 5.2)
 * ====================================================================
 * Horizontal gauge bars showing organizational exposure per PESTEL dimension.
 */
"use client";

const FACTORS = [
  { key: 'P', label: 'Politico', color: '#ff453a' },
  { key: 'E', label: 'Economico', color: '#ff9f0a' },
  { key: 'S', label: 'Social', color: '#30d158' },
  { key: 'T', label: 'Tecnologico', color: '#5e5ce6' },
  { key: 'E2', label: 'Ecologico', color: '#bf5af2' },
  { key: 'L', label: 'Legal', color: '#ff6b35' },
];

function exposureLevel(score) {
  if (score >= 80) return { label: 'EXTREMA', color: '#ff2d55', bg: 'rgba(255,45,85,0.1)' };
  if (score >= 60) return { label: 'ALTA', color: '#ff9500', bg: 'rgba(255,149,0,0.1)' };
  if (score >= 40) return { label: 'MODERADA', color: '#ffcc00', bg: 'rgba(255,204,0,0.1)' };
  return { label: 'BAJA', color: '#30d158', bg: 'rgba(48,209,88,0.1)' };
}

export default function PestelExposureDashboard({ riskDistribution }) {
  if (!riskDistribution || !riskDistribution.length) return null;

  const maxExposure = Math.max(...riskDistribution.map(r => r.avg_priority || 0), 1);

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: '0 0 0.25rem' }}>Strategic Exposure Dashboard</h3>
      <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', margin: '0 0 1rem' }}>
        Nivel de exposicion organizacional por dimension PESTEL
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {FACTORS.map(f => {
          const data = riskDistribution.find(r => r.factor === f.key);
          if (!data) return null;
          const score = data.avg_priority || 0;
          const exp = exposureLevel(score);
          const count = data.count || 0;
          const prob = data.avg_probability || 0;

          return (
            <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Factor badge */}
              <div style={{
                width: '44px', height: '44px', borderRadius: '8px', flexShrink: 0,
                background: `${f.color}10`, border: `1px solid ${f.color}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column',
              }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: f.color, fontFamily: 'monospace' }}>{f.key}</span>
                <span style={{ fontSize: '0.5rem', color: 'var(--text-tertiary)' }}>{count}sig</span>
              </div>

              {/* Bar + info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{f.label}</span>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', fontWeight: 700, color: exp.color }}>{Math.round(score)}</span>
                    <span style={{
                      fontSize: '0.55rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px',
                      background: exp.bg, color: exp.color,
                    }}>{exp.label}</span>
                  </div>
                </div>
                <div style={{ position: 'relative', height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute', left: 0, top: 0, height: '100%',
                    width: `${(score / 100) * 100}%`,
                    borderRadius: '4px',
                    background: `linear-gradient(90deg, ${f.color}66, ${f.color})`,
                    transition: 'width 0.8s ease',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>
                    Prob: {prob}% | Tendencia: {data.dominant_trend === 'declining' ? 'Deterioro' : data.dominant_trend === 'improving' ? 'Mejora' : 'Estable'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
