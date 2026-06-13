/**
 * PorterBlueOceanOverlay — Red Ocean / Blue Ocean Mapping (Phase 4 Premium)
 * ===========================================================================
 * Cross-module visualization connecting Porter analysis with Blue Ocean strategy.
 * Shows hypercompeted zones (red ocean) vs strategic whitespace (blue ocean).
 * Enables strategic pivot identification. Porter (1980) ↔ Kim & Mauborgne (2005).
 */
"use client";

const FORCE_CONFIG = {
  rivalry:        { label: 'Rivalidad',        color: '#ff4d6a', icon: '⚔️' },
  new_entrants:   { label: 'Nuevos Entrantes', color: '#a855f7', icon: '🚪' },
  substitutes:    { label: 'Sustitutos',       color: '#f0a500', icon: '🔄' },
  buyer_power:    { label: 'Poder Comprador',   color: '#3b82f6', icon: '🛒' },
  supplier_power: { label: 'Poder Proveedor',   color: '#00c896', icon: '📦' },
};

function classifyOcean(cps, trend) {
  if (cps >= 75) return { zone: 'deep_red', label: 'Océano Rojo Profundo', color: '#ff4d6a', bg: '#ff4d6a18', desc: 'Competencia brutal — diferenciarse o salir' };
  if (cps >= 60) return { zone: 'red', label: 'Océano Rojo', color: '#f0a500', bg: '#f0a50012', desc: 'Alta competencia — buscar diferenciación' };
  if (cps >= 40) {
    if (trend === 'declining') return { zone: 'blue_emerging', label: 'Océano Azul Emergente', color: '#38bdf8', bg: '#38bdf812', desc: 'Presión en descenso — oportunidad estratégica' };
    return { zone: 'contested', label: 'Zona Disputada', color: '#6366f1', bg: '#6366f10c', desc: 'Competencia moderada — potencial de innovación' };
  }
  return { zone: 'blue', label: 'Océano Azul', color: '#06b6d4', bg: '#06b6d412', desc: 'Baja competencia — espacio estratégico disponible' };
}

export default function PorterBlueOceanOverlay({ forces = [] }) {
  if (!forces.length) return null;

  const forceData = forces.map(f => {
    const key = f.force_name || f.force || '';
    const cps = f.competitive_pressure_score || (f.score || 3) * 20;
    const trend = f.trend || 'stable';
    const ocean = classifyOcean(cps, trend);
    const config = FORCE_CONFIG[key] || { label: key, color: '#888', icon: '•' };
    return { key, config, cps: Math.round(cps), trend, ocean, probability: f.probability || 50 };
  }).sort((a, b) => b.cps - a.cps);

  const redCount = forceData.filter(d => d.ocean.zone === 'deep_red' || d.ocean.zone === 'red').length;
  const blueCount = forceData.filter(d => d.ocean.zone === 'blue' || d.ocean.zone === 'blue_emerging').length;
  const avgCPS = Math.round(forceData.reduce((s, d) => s + d.cps, 0) / forceData.length);

  // Strategic recommendations based on ocean mapping
  const recommendations = [];
  forceData.forEach(d => {
    if (d.ocean.zone === 'deep_red') {
      recommendations.push({ force: d.config.label, type: 'pivot', text: `Considerar Blue Ocean: crear nueva demanda fuera de ${d.config.label}`, color: '#ff4d6a' });
    }
    if (d.ocean.zone === 'blue' || d.ocean.zone === 'blue_emerging') {
      recommendations.push({ force: d.config.label, type: 'exploit', text: `Explotar espacio azul en ${d.config.label}: ventaja competitiva natural`, color: '#06b6d4' });
    }
  });

  const W = 600, H = 100;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>
            🌊 Porter × Blue Ocean Overlay
          </h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
            Zonas hipercompetidas vs. espacios estratégicos vacíos • Porter (1980) ↔ Kim & Mauborgne (2005)
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, background: '#ff4d6a15', color: '#ff4d6a', border: '1px solid #ff4d6a33' }}>
            {redCount} Red
          </span>
          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, background: '#06b6d415', color: '#06b6d4', border: '1px solid #06b6d433' }}>
            {blueCount} Blue
          </span>
        </div>
      </div>

      {/* Ocean spectrum bar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: '0.35rem', display: 'flex', justifyContent: 'space-between' }}>
          <span>🔵 Océano Azul (CPS 0)</span>
          <span>🔴 Océano Rojo (CPS 100)</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', borderRadius: '8px', overflow: 'visible' }}>
          {/* Background gradient */}
          <defs>
            <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="40%" stopColor="#6366f1" stopOpacity="0.15" />
              <stop offset="60%" stopColor="#f0a500" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#ff4d6a" stopOpacity="0.25" />
            </linearGradient>
          </defs>
          <rect x="0" y="20" width={W} height="60" rx="8" fill="url(#oceanGrad)" />

          {/* Zone labels */}
          <text x="40" y="55" fill="#06b6d4" fontSize="8" fontWeight="600">AZUL</text>
          <text x={W / 2} y="55" fill="#6366f1" fontSize="8" fontWeight="600" textAnchor="middle">DISPUTADO</text>
          <text x={W - 40} y="55" fill="#ff4d6a" fontSize="8" fontWeight="600" textAnchor="end">ROJO</text>

          {/* Force markers */}
          {forceData.map((d, i) => {
            const x = (d.cps / 100) * (W - 40) + 20;
            return (
              <g key={d.key}>
                <circle cx={x} cy={50} r={14}
                        fill={`${d.ocean.color}33`} stroke={d.ocean.color} strokeWidth="2" />
                <text x={x} y={47} textAnchor="middle" fill={d.ocean.color} fontSize="10">{d.config.icon}</text>
                <text x={x} y={57} textAnchor="middle" fill="white" fontSize="7" fontWeight="700">{d.cps}</text>
                {/* Label */}
                <text x={x} y={90} textAnchor="middle" fill="var(--text-tertiary)" fontSize="7">
                  {d.config.label}
                </text>
              </g>
            );
          })}

          {/* Average marker */}
          <line x1={(avgCPS / 100) * (W - 40) + 20} y1="18" x2={(avgCPS / 100) * (W - 40) + 20} y2="82"
                stroke="white" strokeWidth="1" strokeDasharray="3,3" strokeOpacity="0.4" />
          <text x={(avgCPS / 100) * (W - 40) + 20} y="14"
                textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7">Ø {avgCPS}</text>
        </svg>
      </div>

      {/* Force cards with ocean classification */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
        {forceData.map((d, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: 'auto 1fr auto',
            alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem',
            borderRadius: '8px', background: d.ocean.bg, border: `1px solid ${d.ocean.color}22`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: '160px' }}>
              <span style={{ fontSize: '1.1rem' }}>{d.config.icon}</span>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{d.config.label}</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>
                  {d.trend === 'improving' ? '📈 Intensificando' : d.trend === 'declining' ? '📉 Reduciéndose' : '➡️ Estable'}
                </div>
              </div>
            </div>
            <div style={{
              padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem',
              background: `${d.ocean.color}15`, color: d.ocean.color, fontWeight: 600,
              border: `1px solid ${d.ocean.color}33`, textAlign: 'center',
            }}>
              {d.ocean.label}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', maxWidth: '200px' }}>
              {d.ocean.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Strategic recommendations */}
      {recommendations.length > 0 && (
        <div>
          <div style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
            🎯 Recomendaciones Blue Ocean
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {recommendations.map((r, i) => (
              <div key={i} style={{
                padding: '0.45rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem',
                background: `${r.color}08`, borderLeft: `3px solid ${r.color}`,
                color: 'var(--text-secondary)', lineHeight: 1.4,
              }}>
                {r.type === 'pivot' ? '🔄' : '🚀'} {r.text}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{
        marginTop: '1rem', padding: '0.5rem 0.75rem', fontSize: '0.7rem',
        color: 'var(--text-tertiary)', borderLeft: '3px solid var(--accent-secondary)',
        background: 'rgba(255,255,255,0.02)', borderRadius: '0 6px 6px 0',
      }}>
        🌊 Overlay doctrinario: Porter identifica dónde la competencia es intensa (rojo),
        Blue Ocean Strategy identifica dónde crear nueva demanda (azul).
        La intersección revela oportunidades de pivote estratégico.
      </div>
    </div>
  );
}
