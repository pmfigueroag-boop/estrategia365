'use client';
/**
 * PestelExecutiveSummary — Strategic Intelligence Dashboard (Sprint 3)
 * =====================================================================
 * Displays executive narrative, risk distribution bars, and top 3 actions.
 */

const RISK_COLORS = {
  critical: { bg: 'rgba(239,68,68,0.15)', border: '#f87171', text: '#f87171', label: 'Crítico' },
  high: { bg: 'rgba(249,115,22,0.15)', border: '#fb923c', text: '#fb923c', label: 'Alto' },
  moderate: { bg: 'rgba(250,204,21,0.15)', border: '#facc15', text: '#facc15', label: 'Moderado' },
  low: { bg: 'rgba(34,197,94,0.15)', border: '#4ade80', text: '#4ade80', label: 'Bajo' },
  none: { bg: 'rgba(255,255,255,0.05)', border: '#555', text: '#888', label: 'Sin datos' },
};

const TREND_ICONS = { declining: '📉', improving: '📈', stable: '➡️' };

const POSTURE_STYLES = {
  'crítico': { bg: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))', icon: '🔴', border: '#f87171' },
  'elevado': { bg: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(249,115,22,0.05))', icon: '🟠', border: '#fb923c' },
  'moderado': { bg: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05))', icon: '🟢', border: '#4ade80' },
};

export default function PestelExecutiveSummary({ executiveSummary, riskDistribution, topActions }) {
  if (!executiveSummary) return null;

  const posture = POSTURE_STYLES[executiveSummary.overall_risk_posture] || POSTURE_STYLES['moderado'];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Executive Summary Card ── */}
      <div className="glass-panel" style={{
        padding: '1.5rem',
        background: posture.bg,
        borderLeft: `4px solid ${posture.border}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>📋 Resumen Ejecutivo PESTEL</h3>
          <div style={{
            padding: '4px 12px', borderRadius: '20px',
            background: posture.bg, border: `1px solid ${posture.border}`,
            fontSize: '0.8rem', fontWeight: 700,
          }}>
            {posture.icon} Postura: {executiveSummary.overall_risk_posture?.toUpperCase()}
          </div>
        </div>

        <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          {executiveSummary.narrative}
        </p>

        {/* KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.75rem' }}>
          {[
            { label: 'Senales', value: executiveSummary.total_signals, icon: '📊' },
            { label: 'Oportunidades', value: executiveSummary.opportunities_count || 0, icon: '🟢', color: '#4ade80' },
            { label: 'Amenazas', value: executiveSummary.threats_count || 0, icon: '🔴', color: '#f87171' },
            { label: 'Prioridad Ø', value: executiveSummary.avg_priority_score, icon: '⚡', color: executiveSummary.avg_priority_score >= 75 ? '#f87171' : executiveSummary.avg_priority_score >= 55 ? '#facc15' : '#4ade80' },
            { label: 'Prob. Ø', value: `${executiveSummary.avg_probability}%`, icon: '🎯' },
            { label: 'Corto plazo', value: executiveSummary.short_term_signals, icon: '⏰', color: '#facc15' },
          ].map(kpi => (
            <div key={kpi.label} style={{
              padding: '8px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.03)', textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{kpi.icon} {kpi.label}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: kpi.color || 'var(--text-primary)' }}>{kpi.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Risk Distribution Bars ── */}
      {riskDistribution && riskDistribution.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>📊 Distribución de Riesgo por Factor</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {riskDistribution.map(r => {
              const riskStyle = RISK_COLORS[r.risk_level] || RISK_COLORS.none;
              return (
                <div key={r.factor} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ width: '80px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>
                    {r.label}
                  </span>
                  <div style={{ flex: 1, position: 'relative', height: '28px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                    <div style={{
                      position: 'absolute', left: 0, top: 0, height: '100%',
                      width: `${Math.min(r.avg_priority, 100)}%`,
                      borderRadius: '6px',
                      background: `linear-gradient(90deg, ${riskStyle.bg}, ${riskStyle.border})`,
                      transition: 'width 0.8s ease',
                    }}></div>
                    <div style={{
                      position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
                      fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-primary)',
                      display: 'flex', gap: '0.5rem', alignItems: 'center',
                    }}>
                      <span>{TREND_ICONS[r.dominant_trend] || '➡️'}</span>
                      <span>{r.count} señales</span>
                      <span style={{ color: riskStyle.text }}>⚡{r.avg_priority}</span>
                      <span style={{ color: 'var(--text-tertiary)' }}>Prob: {r.avg_probability}%</span>
                    </div>
                  </div>
                  <span style={{
                    padding: '2px 8px', borderRadius: '12px', fontSize: '0.65rem',
                    fontWeight: 600, background: riskStyle.bg, color: riskStyle.text,
                    border: `1px solid ${riskStyle.border}`, minWidth: '60px', textAlign: 'center',
                  }}>
                    {riskStyle.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Top Strategic Actions (split by type) ── */}
      {topActions && topActions.length > 0 && (() => {
        const opps = topActions.filter(a => a.type === 'opportunity');
        const threats = topActions.filter(a => a.type === 'threat');
        const renderAction = (a) => (
          <div key={`${a.type}-${a.rank}`} style={{
            padding: '1rem', borderRadius: '10px',
            background: a.type === 'opportunity' ? 'rgba(48,209,88,0.04)' : 'rgba(239,68,68,0.04)',
            border: `1px solid ${a.type === 'opportunity' ? 'rgba(48,209,88,0.12)' : 'rgba(239,68,68,0.12)'}`,
            display: 'flex', gap: '1rem', alignItems: 'flex-start',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: a.type === 'opportunity' ? 'rgba(48,209,88,0.15)' : 'rgba(239,68,68,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 800, flexShrink: 0,
              color: a.type === 'opportunity' ? '#4ade80' : '#f87171',
              fontFamily: 'monospace',
            }}>
              {a.priority_score}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <strong style={{ fontSize: '0.9rem' }}>{a.signal_title}</strong>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0' }}>{a.action}</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '4px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '8px', background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>
                  {a.factor_label}
                </span>
                <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '8px', background: a.urgency === 'inmediata' ? 'rgba(239,68,68,0.15)' : 'rgba(250,204,21,0.15)', color: a.urgency === 'inmediata' ? '#f87171' : '#facc15' }}>
                  {a.urgency === 'inmediata' ? '🔴 Inmediata' : a.urgency === 'planificada' ? '🟡 Planificada' : '🟢 Estrategica'}
                </span>
                <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-tertiary)' }}>
                  {TREND_ICONS[a.trend] || '➡️'} {a.trend === 'declining' ? 'Empeorando' : a.trend === 'improving' ? 'Mejorando' : 'Estable'}
                </span>
              </div>
            </div>
          </div>
        );
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {opps.length > 0 && (
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#4ade80' }}></span>
                  Top Oportunidades Estrategicas
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {opps.map(renderAction)}
                </div>
              </div>
            )}
            {threats.length > 0 && (
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#f87171' }}></span>
                  Top Amenazas Estrategicas
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {threats.map(renderAction)}
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
