/**
 * PorterExecutiveSummary — Deep Analysis Executive View (Sprint 2)
 * ================================================================
 * Displays industry verdict, KPIs, dominant force, risk distribution,
 * and top strategic actions from Porter deep analysis engine.
 */
"use client";

const RISK_COLORS = { critical: '#ff4d6a', high: '#f0a500', moderate: '#6366f1', low: '#00c896' };
const RISK_LABELS = { critical: 'Crítico', high: 'Elevado', moderate: 'Moderado', low: 'Bajo' };
const POSTURE_CONFIG = {
  defensive: { icon: '🛡️', label: 'Defensiva', color: '#ff4d6a' },
  selective: { icon: '⚖️', label: 'Selectiva', color: '#f0a500' },
  offensive: { icon: '⚔️', label: 'Ofensiva', color: '#00c896' },
};
const QUADRANT_LABELS = {
  critical_threat: '🔴 Amenaza Crítica',
  high_pressure: '🟠 Alta Presión',
  emerging_threat: '🟡 Amenaza Emergente',
  manageable: '🟢 Manejable',
};

export default function PorterExecutiveSummary({ executiveSummary, riskDistribution, topActions }) {
  if (!executiveSummary) return null;
  const { kpis, dominant_force, posture, industry_verdict } = executiveSummary;
  const postureConf = POSTURE_CONFIG[posture] || POSTURE_CONFIG.selective;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Industry Verdict */}
      <div className="glass-panel" style={{
        padding: '1.5rem', borderLeft: `4px solid ${postureConf.color}`,
        background: `linear-gradient(135deg, ${postureConf.color}08, transparent)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '2rem' }}>{postureConf.icon}</span>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Veredicto Industrial</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: postureConf.color }}>Postura {postureConf.label}</div>
          </div>
        </div>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{industry_verdict}</p>
      </div>

      {/* KPIs Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
        {[
          { label: 'Presión Ø', value: kpis.average_competitive_pressure?.toFixed(1), suffix: '/5', color: kpis.average_competitive_pressure >= 3.5 ? '#ff4d6a' : kpis.average_competitive_pressure >= 2.5 ? '#f0a500' : '#00c896' },
          { label: 'CPS Ø', value: kpis.average_cps?.toFixed(0), suffix: '', color: kpis.average_cps >= 70 ? '#ff4d6a' : kpis.average_cps >= 55 ? '#f0a500' : '#00c896' },
          { label: 'CPS Max', value: kpis.max_cps?.toFixed(0), suffix: '', color: '#ff4d6a' },
          { label: 'Fuerzas Críticas', value: kpis.critical_forces, suffix: '/5', color: kpis.critical_forces > 0 ? '#ff4d6a' : '#00c896' },
          { label: 'Sub-determinantes', value: kpis.total_sub_determinants, suffix: '', color: '#6366f1' },
        ].map((kpi, i) => (
          <div key={i} className="glass-panel" style={{ padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: kpi.color }}>{kpi.value}<span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-tertiary)' }}>{kpi.suffix}</span></div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Risk Distribution */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>📊 Distribución de Riesgo Competitivo</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {(riskDistribution || []).map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ width: '130px', fontSize: '0.85rem', fontWeight: 600, flexShrink: 0 }}>{r.label}</span>
              <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '4px', width: `${r.competitive_pressure_score}%`,
                  background: `linear-gradient(90deg, ${RISK_COLORS[r.risk_level]}88, ${RISK_COLORS[r.risk_level]})`,
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: RISK_COLORS[r.risk_level], width: '45px', textAlign: 'right' }}>{r.competitive_pressure_score}</span>
              <span style={{
                fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px',
                background: `${RISK_COLORS[r.risk_level]}22`, color: RISK_COLORS[r.risk_level],
                fontWeight: 600, width: '65px', textAlign: 'center',
              }}>{RISK_LABELS[r.risk_level]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Strategic Actions */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>🎯 Acciones Estratégicas Prioritarias</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {(topActions || []).map((a, i) => (
            <div key={i} style={{
              padding: '0.75rem', borderRadius: '8px',
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
              borderLeft: `3px solid ${RISK_COLORS[a.cps >= 75 ? 'critical' : a.cps >= 60 ? 'high' : a.cps >= 40 ? 'moderate' : 'low']}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{a.label}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{QUADRANT_LABELS[a.quadrant] || a.quadrant}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{a.recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
