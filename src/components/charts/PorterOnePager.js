/**
 * PorterOnePager — Executive Board One-Pager (Phase 3 Premium)
 * ==============================================================
 * Ultra-executive single-page competitive intelligence brief.
 * Design: McKinsey/BCG premium deck aesthetic. Readable in 3 minutes.
 * Includes: global score, top threats, opportunities, trajectory,
 * strategic recommendations, confidence, key evidence.
 */
"use client";

const FORCE_LABELS = {
  rivalry: 'Rivalidad', new_entrants: 'Nuevos Entrantes',
  substitutes: 'Sustitutos', buyer_power: 'Poder Comprador',
  supplier_power: 'Poder Proveedor',
};

function getRisk(cps) {
  if (cps >= 75) return { label: 'CRITICAL', color: '#ff4d6a', icon: '🔴' };
  if (cps >= 60) return { label: 'HIGH', color: '#f0a500', icon: '🟠' };
  if (cps >= 40) return { label: 'MODERATE', color: '#6366f1', icon: '🟡' };
  return { label: 'LOW', color: '#00c896', icon: '🟢' };
}

export default function PorterOnePager({ forces = [], executiveSummary, topActions = [], industryAssessment }) {
  if (!forces.length) return null;

  const forceData = forces.map(f => {
    const key = f.force_name || f.force || '';
    const cps = f.competitive_pressure_score || (f.score || 3) * 20;
    return {
      key, label: FORCE_LABELS[key] || key, cps: Math.round(cps),
      risk: getRisk(cps), score: f.score || 3,
      trend: f.trend || 'stable', probability: f.probability || 50,
      source: f.source || 'unknown',
    };
  }).sort((a, b) => b.cps - a.cps);

  const avgCPS = Math.round(forceData.reduce((s, d) => s + d.cps, 0) / forceData.length);
  const globalRisk = getRisk(avgCPS);
  const dominant = forceData[0];
  const posture = industryAssessment?.posture || executiveSummary?.verdict?.posture || 'selective';
  const threats = forceData.filter(d => d.cps >= 60);
  const opportunities = forceData.filter(d => d.cps < 40);
  const improving = forceData.filter(d => d.trend === 'improving');

  // Confidence score
  const avgConfidence = Math.round(forceData.reduce((s, d) => {
    const sourceQ = d.source === 'Gemini AI' ? 85 : d.source === 'Manual' ? 95 : 45;
    return s + sourceQ;
  }, 0) / forceData.length);

  const now = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="glass-panel animate-fade-in" style={{
      padding: '2rem', background: 'linear-gradient(180deg, rgba(10,15,26,0.98), rgba(15,20,35,0.95))',
      border: '1px solid rgba(255,255,255,0.08)', maxWidth: '800px', margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          Estrategia 365 • Competitive Intelligence Brief
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.4rem 0 0.25rem' }}>
          Porter Five Forces — Executive Summary
        </h2>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
          {now} • Confianza: {avgConfidence}% • Fuentes: {forces.length} fuerzas
        </div>
      </div>

      {/* Global Score Hero */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem',
        marginBottom: '1.5rem', padding: '1.25rem', borderRadius: '12px',
        background: `linear-gradient(135deg, ${globalRisk.color}08, ${globalRisk.color}04)`,
        border: `1px solid ${globalRisk.color}22`,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: 900, color: globalRisk.color, lineHeight: 1 }}>{avgCPS}</div>
          <div style={{ fontSize: '0.65rem', color: globalRisk.color, fontWeight: 600 }}>CPS PROMEDIO</div>
        </div>
        <div style={{ width: '1px', height: '50px', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {posture === 'defensive' ? '🛡️' : posture === 'offensive' ? '⚔️' : '⚖️'}
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
            Postura {posture === 'defensive' ? 'Defensiva' : posture === 'offensive' ? 'Ofensiva' : 'Selectiva'}
          </div>
        </div>
        <div style={{ width: '1px', height: '50px', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: dominant?.risk.color }}>{dominant?.cps}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>FUERZA DOMINANTE</div>
          <div style={{ fontSize: '0.7rem', color: dominant?.risk.color, fontWeight: 600 }}>{dominant?.label}</div>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        {/* Top Threats */}
        <div>
          <div style={{ fontSize: '0.7rem', color: '#ff4d6a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            ⚠️ Amenazas Principales ({threats.length})
          </div>
          {threats.length > 0 ? threats.map((t, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.4rem 0.5rem', marginBottom: '0.25rem', borderRadius: '6px',
              background: '#ff4d6a08', borderLeft: `2px solid ${t.risk.color}`,
            }}>
              <span style={{ fontSize: '0.8rem' }}>{t.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: t.risk.color }}>{t.cps}</span>
                <span style={{ fontSize: '0.6rem' }}>{t.trend === 'improving' ? '📈' : t.trend === 'declining' ? '📉' : '➡️'}</span>
              </div>
            </div>
          )) : (
            <div style={{ fontSize: '0.8rem', color: '#00c896', padding: '0.4rem' }}>✅ Sin amenazas críticas</div>
          )}
        </div>

        {/* Opportunities */}
        <div>
          <div style={{ fontSize: '0.7rem', color: '#00c896', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            ✅ Oportunidades ({opportunities.length})
          </div>
          {opportunities.length > 0 ? opportunities.map((o, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.4rem 0.5rem', marginBottom: '0.25rem', borderRadius: '6px',
              background: '#00c89608', borderLeft: '2px solid #00c896',
            }}>
              <span style={{ fontSize: '0.8rem' }}>{o.label}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#00c896' }}>{o.cps}</span>
            </div>
          )) : (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', padding: '0.4rem' }}>Todas las fuerzas ≥40 CPS</div>
          )}
        </div>
      </div>

      {/* Force scoreboard */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          📊 Scoreboard Competitivo
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.4rem' }}>
          {forceData.map((d, i) => (
            <div key={i} style={{
              padding: '0.6rem 0.4rem', borderRadius: '8px', textAlign: 'center',
              background: `${d.risk.color}08`, border: `1px solid ${d.risk.color}22`,
            }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: d.risk.color }}>{d.cps}</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>{d.label}</div>
              <div style={{ fontSize: '0.6rem', marginTop: '0.15rem' }}>
                {d.trend === 'improving' ? '📈' : d.trend === 'declining' ? '📉' : '➡️'} {d.risk.icon}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Recommendations */}
      {topActions.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            🎯 Recomendaciones Estratégicas
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {topActions.slice(0, 3).map((action, i) => (
              <div key={i} style={{
                padding: '0.5rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem',
                background: 'rgba(99,102,241,0.04)', borderLeft: '2px solid #6366f1',
                color: 'var(--text-secondary)', lineHeight: 1.5,
              }}>
                <strong style={{ color: '#6366f1' }}>{i + 1}.</strong> {action.recommendation || action.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trajectory & Confidence */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem',
        padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
            Trayectoria
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {improving.length > 0
              ? `⚠️ ${improving.length} fuerza(s) intensificándose: ${improving.map(f => f.label).join(', ')}`
              : '✅ Todas las fuerzas estables o en descenso'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
            Confianza del Análisis
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)' }}>
              <div style={{ height: '100%', width: `${avgConfidence}%`, borderRadius: '3px', background: avgConfidence >= 70 ? '#00c896' : '#f0a500' }} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: avgConfidence >= 70 ? '#00c896' : '#f0a500' }}>{avgConfidence}%</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '1rem', textAlign: 'center', fontSize: '0.6rem', color: 'var(--text-tertiary)',
        paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        Generado por Estrategia 365 Intelligence Engine • Porter, M.E. (1980, 2008) • Documento Confidencial
      </div>
    </div>
  );
}
