/**
 * VrioLifecycleTimeline — Capability Lifecycle & Decay Monitor (Fase 3)
 * =======================================================================
 * Las ventajas competitivas nacen, maduran y se erosionan.
 * Visualiza la trayectoria proyectada de cada recurso VRIO.
 * Basado en competitive_implication + criterios:
 * - Sostenida: horizonte largo, baja erosión
 * - Temporal: erosión media-alta
 * - Paridad: erosión alta
 * - Desventaja: ya erosionada
 * SVG timeline con sparklines de decay proyectado.
 */
"use client";
import { useState } from 'react';

const IMPLICATIONS = {
  sustained_advantage: { color: '#10b981', icon: '🏆', label: 'Sostenida',    decayRate: 0.05, horizon: 8, resilience: 'Alta' },
  unused_advantage:    { color: '#a855f7', icon: '🔓', label: 'No Explotada', decayRate: 0.12, horizon: 5, resilience: 'Media-Alta' },
  temporary_advantage: { color: '#6366f1', icon: '⏳', label: 'Temporal',     decayRate: 0.22, horizon: 3, resilience: 'Media' },
  parity:              { color: '#f59e0b', icon: '⚖️', label: 'Paridad',      decayRate: 0.35, horizon: 2, resilience: 'Baja' },
  disadvantage:        { color: '#ff4d6a', icon: '⚠️', label: 'Desventaja',   decayRate: 0.55, horizon: 1, resilience: 'Muy Baja' },
};

const PHASES = ['Hoy', 'Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5'];

// Project decay curve over 5 years for a resource
function projectDecay(r, years = 5) {
  const impl = IMPLICATIONS[r.competitive_implication] || IMPLICATIONS.parity;
  const criteriaFactor = [r.valuable, r.rare, r.costly_to_imitate, r.organized].filter(Boolean).length / 4;
  const baseStrength = criteriaFactor; // 0..1
  const decay = impl.decayRate * (1 - criteriaFactor * 0.4); // more criteria = slower decay
  return Array.from({ length: years + 1 }, (_, t) => Math.max(0, baseStrength * Math.exp(-decay * t)));
}

// Generate sparkline path from data points
function sparklinePath(points, W, H) {
  const max = Math.max(...points, 0.001);
  const xs = points.map((_, i) => (i / (points.length - 1)) * W);
  const ys = points.map(v => H - (v / max) * H * 0.9 - H * 0.05);
  return xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ');
}

export default function VrioLifecycleTimeline({ resources = [] }) {
  const [selected, setSelected] = useState(null);
  const [sortBy, setSortBy] = useState('risk'); // risk | horizon | name

  if (!resources.length) return null;

  const enriched = resources.map(r => {
    const impl = IMPLICATIONS[r.competitive_implication] || IMPLICATIONS.parity;
    const projection = projectDecay(r);
    const criteriaCount = [r.valuable, r.rare, r.costly_to_imitate, r.organized].filter(Boolean).length;
    const finalStrength = projection[projection.length - 1];
    const erosionRisk = finalStrength < 0.15 ? 'CRÍTICO' : finalStrength < 0.35 ? 'ALTO' : finalStrength < 0.6 ? 'MEDIO' : 'BAJO';
    const riskColor = finalStrength < 0.15 ? '#ff4d6a' : finalStrength < 0.35 ? '#f59e0b' : finalStrength < 0.6 ? '#6366f1' : '#10b981';
    return { ...r, impl, projection, criteriaCount, finalStrength, erosionRisk, riskColor };
  });

  const sorted = [...enriched].sort((a, b) => {
    if (sortBy === 'risk') return a.finalStrength - b.finalStrength; // most at risk first
    if (sortBy === 'horizon') return (IMPLICATIONS[a.competitive_implication]?.horizon || 3) - (IMPLICATIONS[b.competitive_implication]?.horizon || 3);
    return (a.resource_name || '').localeCompare(b.resource_name || '');
  });

  const sel = selected ? enriched.find(r => (r.id || r.resource_name) === selected) : null;
  const criticalCount = enriched.filter(r => r.erosionRisk === 'CRÍTICO').length;
  const highRiskCount = enriched.filter(r => r.erosionRisk === 'ALTO').length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📉</div>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>Capability Lifecycle & Decay Monitor</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
            Las ventajas nacen, maduran y se erosionan · Proyección a 5 años por recurso VRIO
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {criticalCount > 0 && <span style={{ padding: '0.25rem 0.6rem', borderRadius: 6, fontSize: '0.65rem', background: 'rgba(255,77,106,0.15)', color: '#ff4d6a', fontWeight: 700 }}>🔴 {criticalCount} crítico{criticalCount !== 1 ? 's' : ''}</span>}
          {highRiskCount > 0 && <span style={{ padding: '0.25rem 0.6rem', borderRadius: 6, fontSize: '0.65rem', background: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontWeight: 700 }}>⚠️ {highRiskCount} alto riesgo</span>}
        </div>
      </div>

      {/* Sort + column header */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[{ k: 'risk', l: '⚠️ Mayor riesgo' }, { k: 'horizon', l: '⏳ Horizonte' }, { k: 'name', l: '🔤 Nombre' }].map(s => (
              <button key={s.k} onClick={() => setSortBy(s.k)} style={{
                padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.65rem', cursor: 'pointer',
                border: `1px solid ${sortBy === s.k ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'}`,
                background: sortBy === s.k ? 'rgba(255,255,255,0.07)' : 'transparent',
                color: sortBy === s.k ? 'var(--text-primary)' : 'var(--text-tertiary)',
              }}>{s.l}</button>
            ))}
          </div>
          {/* Timeline header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0', width: 220 }}>
            {PHASES.map((p, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: '0.58rem', color: i === 0 ? 'var(--text-secondary)' : 'var(--text-tertiary)', fontWeight: i === 0 ? 700 : 400 }}>{p}</div>
            ))}
          </div>
        </div>

        {/* Resource rows */}
        {sorted.map((r, i) => {
          const isSel = selected === (r.id || r.resource_name);
          const SPW = 200, SPH = 44;
          const path = sparklinePath(r.projection, SPW, SPH);
          const areaPath = `${path} L ${SPW} ${SPH} L 0 ${SPH} Z`;
          return (
            <div key={i} onClick={() => setSelected(isSel ? null : (r.id || r.resource_name))} style={{
              display: 'grid', gridTemplateColumns: '1fr 90px 220px 80px',
              gap: '0.75rem', alignItems: 'center',
              padding: '0.6rem 0.75rem', borderRadius: 9, marginBottom: '0.35rem',
              background: isSel ? `${r.impl.color}10` : 'rgba(255,255,255,0.02)',
              border: `1px solid ${isSel ? r.impl.color + '44' : 'rgba(255,255,255,0.05)'}`,
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {/* Name + implication */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.1rem' }}>
                  {r.resource_name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.62rem', color: r.impl.color, fontWeight: 700 }}>{r.impl.icon} {r.impl.label}</span>
                  <span style={{ fontSize: '0.58rem', color: 'var(--text-tertiary)' }}>· {r.criteriaCount}/4 VRIO</span>
                </div>
              </div>

              {/* Resilience + horizon */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: r.riskColor }}>{r.erosionRisk}</div>
                <div style={{ fontSize: '0.58rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>
                  {IMPLICATIONS[r.competitive_implication]?.horizon || 2} años útiles
                </div>
              </div>

              {/* Sparkline */}
              <div>
                <svg viewBox={`0 0 ${SPW} ${SPH}`} style={{ width: '100%', height: 36, display: 'block', overflow: 'visible' }}>
                  <path d={areaPath} fill={`${r.impl.color}12`} />
                  <path d={path} fill="none" stroke={r.impl.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  {r.projection.map((v, t) => {
                    const x = (t / (r.projection.length - 1)) * SPW;
                    const max = Math.max(...r.projection, 0.001);
                    const y = SPH - (v / max) * SPH * 0.9 - SPH * 0.05;
                    return <circle key={t} cx={x} cy={y} r={t === 0 || t === r.projection.length - 1 ? 2.5 : 1.5} fill={r.impl.color} />;
                  })}
                  {/* Danger zone */}
                  {r.finalStrength < 0.3 && (
                    <rect x={0} y={SPH * 0.75} width={SPW} height={SPH * 0.25} fill="rgba(255,77,106,0.05)" />
                  )}
                </svg>
              </div>

              {/* Risk badge */}
              <div style={{ display: 'flex', gap: '2px', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div style={{ padding: '0.15rem 0.4rem', borderRadius: 5, fontSize: '0.58rem', fontWeight: 700, background: `${r.riskColor}15`, border: `1px solid ${r.riskColor}33`, color: r.riskColor }}>
                  {r.erosionRisk}
                </div>
                <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>
                  {Math.round(r.finalStrength * 100)}% fuerza
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected detail */}
      {sel && (
        <div className="glass-panel animate-fade-in" style={{ padding: '1.25rem', borderLeft: `4px solid ${sel.impl.color}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{sel.resource_name}</div>
              <div style={{ fontSize: '0.7rem', color: sel.impl.color }}>{sel.impl.icon} {sel.impl.label} · {IMPLICATIONS[sel.competitive_implication]?.resilience} resiliencia</div>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ padding: '0.6rem', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginBottom: '0.2rem' }}>Tasa de decay proyectada</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: sel.riskColor }}>{Math.round((IMPLICATIONS[sel.competitive_implication]?.decayRate || 0.2) * 100)}%/año</div>
            </div>
            <div style={{ padding: '0.6rem', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginBottom: '0.2rem' }}>Fuerza residual en año 5</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: sel.riskColor }}>{Math.round(sel.finalStrength * 100)}%</div>
            </div>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.5rem' }}>{sel.description}</div>
          <div style={{ padding: '0.5rem 0.65rem', borderRadius: 8, background: sel.erosionRisk === 'CRÍTICO' ? 'rgba(255,77,106,0.08)' : 'rgba(99,102,241,0.07)', border: `1px solid ${sel.riskColor}25`, fontSize: '0.7rem', color: sel.riskColor, lineHeight: 1.5 }}>
            {sel.erosionRisk === 'CRÍTICO' ? '🔴 Acción urgente: esta ventaja se erosionará completamente en el horizonte proyectado.' :
             sel.erosionRisk === 'ALTO' ? '⚠️ Riesgo significativo de pérdida de relevancia competitiva. Planificar sustitución.' :
             sel.erosionRisk === 'MEDIO' ? '🟡 Ventana de oportunidad disponible. Monitorear señales de commoditización.' :
             '✅ Posición resiliente. Mantener inversión para sostener la ventaja.'}
          </div>
          {sel.recommendation && (
            <div style={{ marginTop: '0.5rem', padding: '0.4rem 0.6rem', borderRadius: 7, background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.7rem', color: '#6366f1', lineHeight: 1.4 }}>
              📌 {sel.recommendation}
            </div>
          )}
        </div>
      )}

      <div style={{ padding: '0.65rem 1rem', borderRadius: 8, fontSize: '0.65rem', color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
        📉 Las tasas de decay son estimaciones doctrinales basadas en la posición VRIO. Recursos inimitables (I=✓) tienen decaimiento más lento que los imitables.
      </div>
    </div>
  );
}
