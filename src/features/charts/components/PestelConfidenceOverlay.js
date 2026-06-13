/**
 * PestelConfidenceOverlay — AI Confidence Layer (Phase 5.3)
 * ==========================================================
 * Displays confidence metrics and per-signal confidence transparency.
 */
"use client";

const QUALITY_COLORS = {
  high: { color: '#30d158', label: 'Alta', bg: 'rgba(48,209,88,0.1)' },
  medium: { color: '#ffcc00', label: 'Media', bg: 'rgba(255,204,0,0.1)' },
  low: { color: '#ff453a', label: 'Baja', bg: 'rgba(255,69,58,0.1)' },
};

export default function PestelConfidenceOverlay({ confidenceMetrics, priorityMatrix }) {
  if (!confidenceMetrics) return null;

  const cm = confidenceMetrics;
  const avgConf = cm.avg_confidence || 70;
  const confColor = avgConf >= 80 ? '#30d158' : avgConf >= 60 ? '#ffcc00' : '#ff453a';

  // Sort signals by confidence
  const sorted = [...(priorityMatrix || [])].sort((a, b) => (a.confidence_score || 70) - (b.confidence_score || 70));
  const lowConf = sorted.filter(s => (s.confidence_score || 70) < 60);

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>AI Confidence Layer</h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', margin: '0.2rem 0 0' }}>
            Nivel de certeza de la IA y calidad de evidencia por senal
          </p>
        </div>
        <div style={{
          padding: '6px 12px', borderRadius: '8px', fontSize: '1.2rem', fontWeight: 800,
          fontFamily: 'monospace', color: confColor, background: `${confColor}15`,
          border: `1px solid ${confColor}33`,
        }}>
          {avgConf}%
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
        {[
          { label: 'Promedio', value: `${cm.avg_confidence}%`, color: confColor },
          { label: 'Minimo', value: `${cm.min_confidence}%`, color: cm.min_confidence < 50 ? '#ff453a' : '#ffcc00' },
          { label: 'Maximo', value: `${cm.max_confidence}%`, color: '#30d158' },
          { label: 'Alta Conf.', value: cm.high_confidence_count, color: '#30d158' },
          { label: 'Baja Conf.', value: cm.low_confidence_count, color: cm.low_confidence_count > 0 ? '#ff453a' : '#30d158' },
        ].map(kpi => (
          <div key={kpi.label} style={{
            padding: '0.5rem', borderRadius: '8px', textAlign: 'center',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: kpi.color, fontFamily: 'monospace' }}>{kpi.value}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Evidence Quality Distribution */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
          Distribucion de Calidad de Evidencia
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {Object.entries(cm.evidence_distribution || {}).map(([quality, count]) => {
            const qc = QUALITY_COLORS[quality] || QUALITY_COLORS.medium;
            const total = Object.values(cm.evidence_distribution).reduce((a, b) => a + b, 0) || 1;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={quality} style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: qc.color }}>{qc.label}</span>
                  <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: qc.color }}>{count} ({pct}%)</span>
                </div>
                <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: qc.color, borderRadius: '3px', transition: 'width 0.8s' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Low confidence signals */}
      {lowConf.length > 0 && (
        <div>
          <div style={{ fontSize: '0.7rem', color: '#ff453a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', fontWeight: 700 }}>
            Senales con Baja Confianza ({lowConf.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {lowConf.slice(0, 5).map((s, i) => {
              const conf = s.confidence_score || 70;
              const eq = s.evidence_quality || 'medium';
              const qc = QUALITY_COLORS[eq] || QUALITY_COLORS.medium;
              return (
                <div key={s.id || i} style={{
                  display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.4rem 0.6rem',
                  borderRadius: '6px', background: 'rgba(255,69,58,0.04)', border: '1px solid rgba(255,69,58,0.1)',
                }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, fontFamily: 'monospace', color: '#ff453a', width: '30px' }}>{conf}%</span>
                  <span style={{ flex: 1, fontSize: '0.75rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.title}
                  </span>
                  <span style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: '4px', background: qc.bg, color: qc.color, fontWeight: 600 }}>
                    {qc.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
