/**
 * PorterConfidenceOverlay — AI Confidence & Evidence Quality (Phase 1 Premium)
 * ==============================================================================
 * Shows per-force confidence scoring based on source quality, evidence density,
 * probability calibration, and data freshness. Elevates institutional credibility.
 */
"use client";

const SOURCE_QUALITY = {
  'Gemini AI': { score: 85, label: 'IA Verificada', icon: '🤖' },
  'Stochastic Fallback': { score: 45, label: 'Estimación', icon: '🎲' },
  'Manual': { score: 95, label: 'Experto', icon: '👤' },
};

const FORCE_LABELS = {
  rivalry: 'Rivalidad', new_entrants: 'Nuevos Entrantes',
  substitutes: 'Sustitutos', buyer_power: 'Poder Comprador',
  supplier_power: 'Poder Proveedor',
};

function computeConfidence(force) {
  const source = force.source || 'Stochastic Fallback';
  const sourceQ = SOURCE_QUALITY[source] || { score: 40, label: 'Desconocido', icon: '❓' };

  // Evidence density: sub-determinants count
  const subCount = (force.sub_determinants || []).length;
  const evidenceDensity = Math.min(100, subCount * 25); // 0-100, 4 subs = 100

  // Probability calibration: how confident the probability assignment is
  const prob = force.probability || 50;
  const probCalibration = prob >= 30 && prob <= 80 ? 70 : prob > 80 ? 90 : 50;

  // Data freshness: based on modified_at
  let freshness = 80;
  if (force.modified_at) {
    const daysOld = (Date.now() - new Date(force.modified_at).getTime()) / (1000 * 60 * 60 * 24);
    freshness = daysOld < 7 ? 95 : daysOld < 30 ? 80 : daysOld < 90 ? 60 : 40;
  }

  // Weighted confidence
  const confidence = Math.round(
    sourceQ.score * 0.35 + evidenceDensity * 0.25 + probCalibration * 0.20 + freshness * 0.20
  );

  return {
    overall: confidence,
    sourceQuality: sourceQ,
    evidenceDensity,
    probCalibration,
    freshness,
  };
}

function getConfidenceColor(c) {
  if (c >= 80) return '#00c896';
  if (c >= 60) return '#f0a500';
  if (c >= 40) return '#6366f1';
  return '#ff4d6a';
}

export default function PorterConfidenceOverlay({ forces = [] }) {
  if (!forces.length) return null;

  const forceData = forces.map(f => {
    const key = f.force_name || f.force || 'unknown';
    const cps = f.competitive_pressure_score || (f.score || 3) * 20;
    const conf = computeConfidence(f);
    return { key, label: FORCE_LABELS[key] || key, cps: Math.round(cps), ...conf, score: f.score };
  });

  const avgConfidence = Math.round(forceData.reduce((s, d) => s + d.overall, 0) / forceData.length);
  const avgColor = getConfidenceColor(avgConfidence);

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>🧠 Confianza de IA & Calidad de Evidencia</h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Ponderado: fuente 35% • evidencia 25% • calibración 20% • frescura 20%</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: avgColor, lineHeight: 1 }}>{avgConfidence}%</div>
          <div style={{ fontSize: '0.65rem', color: avgColor, fontWeight: 600 }}>Confianza Ø</div>
        </div>
      </div>

      {/* Force confidence cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {forceData.map((d, i) => {
          const confColor = getConfidenceColor(d.overall);
          return (
            <div key={i} style={{
              padding: '0.85rem', borderRadius: '10px',
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
              borderLeft: `3px solid ${confColor}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>{d.label}</span>
                  <span style={{
                    fontSize: '0.65rem', padding: '0.1rem 0.35rem', borderRadius: '4px',
                    background: `${confColor}22`, color: confColor, fontWeight: 600,
                  }}>CPS {d.cps}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: confColor }}>{d.overall}%</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>confianza</span>
                </div>
              </div>

              {/* Metric bars */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {[
                  { label: `${d.sourceQuality.icon} Fuente`, value: d.sourceQuality.score, detail: d.sourceQuality.label },
                  { label: '📋 Evidencia', value: d.evidenceDensity, detail: `${(d.evidenceDensity / 25).toFixed(0)} subs` },
                  { label: '🎯 Calibración', value: d.probCalibration, detail: `Prob ${forces[i]?.probability || 50}%` },
                  { label: '⏱️ Frescura', value: d.freshness, detail: d.freshness >= 80 ? 'Actual' : 'Histórico' },
                ].map((m, j) => (
                  <div key={j}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: '0.2rem' }}>{m.label}</div>
                    <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${m.value}%`, borderRadius: '2px',
                        background: getConfidenceColor(m.value),
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>{m.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Methodology note */}
      <div style={{
        marginTop: '1rem', padding: '0.6rem 0.75rem', fontSize: '0.7rem',
        color: 'var(--text-tertiary)', borderLeft: '3px solid var(--accent-secondary)',
        background: 'rgba(255,255,255,0.02)', borderRadius: '0 6px 6px 0',
      }}>
        🔬 La confianza se calcula automáticamente basada en la calidad de la fuente (IA/Manual/Fallback),
        densidad de sub-determinantes, calibración probabilística, y frescura de datos.
        Scores &gt;80% indican alta fiabilidad para decisiones ejecutivas.
      </div>
    </div>
  );
}
