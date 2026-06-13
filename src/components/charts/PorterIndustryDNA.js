/**
 * PorterIndustryDNA — Strategic Fingerprint Visualization (Phase 2 Premium)
 * ==========================================================================
 * Each industry generates a unique "DNA pattern" of competitive forces — 
 * like a strategic fingerprint. Visualized as a radial barcode with
 * concentric rings showing score, trend, and probability per force.
 * Ideal for cross-industry benchmarking.
 */
"use client";

const FORCE_ORDER = ['rivalry', 'new_entrants', 'substitutes', 'buyer_power', 'supplier_power'];

const FORCE_LABELS = {
  rivalry: 'RIV', new_entrants: 'NE', substitutes: 'SUS',
  buyer_power: 'PC', supplier_power: 'PP',
};

const FORCE_FULL = {
  rivalry: 'Rivalidad', new_entrants: 'Nuevos Entrantes', substitutes: 'Sustitutos',
  buyer_power: 'Poder Comprador', supplier_power: 'Poder Proveedor',
};

function getColor(cps) {
  if (cps >= 75) return '#ff4d6a';
  if (cps >= 60) return '#f0a500';
  if (cps >= 40) return '#6366f1';
  return '#00c896';
}

// Industry archetype benchmarks
const ARCHETYPES = {
  'Tech Startup':        { rivalry: 85, new_entrants: 70, substitutes: 75, buyer_power: 50, supplier_power: 30 },
  'Banking':             { rivalry: 60, new_entrants: 25, substitutes: 40, buyer_power: 55, supplier_power: 45 },
  'Higher Education':    { rivalry: 55, new_entrants: 45, substitutes: 50, buyer_power: 65, supplier_power: 35 },
  'Retail':              { rivalry: 90, new_entrants: 60, substitutes: 80, buyer_power: 85, supplier_power: 40 },
  'Pharmaceutical':      { rivalry: 50, new_entrants: 20, substitutes: 30, buyer_power: 40, supplier_power: 60 },
};

export default function PorterIndustryDNA({ forces = [], industryAssessment }) {
  if (!forces.length) return null;

  const W = 560, H = 380, CX = 200, CY = H / 2;
  const MAX_R = 140;
  const RING_GAP = MAX_R / 5;

  // Build force data
  const forceData = FORCE_ORDER.map((key, i) => {
    const f = forces.find(f => (f.force_name || f.force) === key);
    const cps = f?.competitive_pressure_score || (f?.score || 3) * 20;
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    return {
      key, angle,
      cps: Math.round(cps),
      score: f?.score || 3,
      trend: f?.trend || 'stable',
      probability: f?.probability || 50,
      color: getColor(cps),
    };
  });

  // DNA strands (concentric rings at CPS level)
  const dnaPath = forceData.map((d, i) => {
    const r = (d.cps / 100) * MAX_R;
    const x = CX + Math.cos(d.angle) * r;
    const y = CY + Math.sin(d.angle) * r;
    return { x, y, ...d };
  });

  // Create SVG polygon path
  const polygonPoints = dnaPath.map(p => `${p.x},${p.y}`).join(' ');

  // DNA barcode stripes (radial)
  const stripes = forceData.map((d, i) => {
    const innerR = 30;
    const outerR = (d.cps / 100) * MAX_R;
    const x1 = CX + Math.cos(d.angle) * innerR;
    const y1 = CY + Math.sin(d.angle) * innerR;
    const x2 = CX + Math.cos(d.angle) * outerR;
    const y2 = CY + Math.sin(d.angle) * outerR;
    // Label position
    const lx = CX + Math.cos(d.angle) * (MAX_R + 20);
    const ly = CY + Math.sin(d.angle) * (MAX_R + 20);
    return { x1, y1, x2, y2, lx, ly, ...d };
  });

  const posture = industryAssessment?.posture || 'selective';
  const avgCPS = Math.round(forceData.reduce((s, d) => s + d.cps, 0) / 5);

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>
            🧬 ADN Competitivo de la Industria
          </h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
            Huella digital estratégica — patrón único de fuerzas competitivas
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: getColor(avgCPS) }}>{avgCPS}</div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>CPS Promedio</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* DNA visualization */}
        <svg viewBox={`0 0 ${W} ${H}`} style={{ flex: '1', minWidth: '340px', maxWidth: '400px' }}>
          {/* Concentric reference rings */}
          {[20, 40, 60, 80, 100].map((level, i) => (
            <circle key={i} cx={CX} cy={CY} r={(level / 100) * MAX_R}
                    fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          ))}

          {/* Ring labels */}
          {[20, 40, 60, 80].map((level, i) => (
            <text key={i} x={CX + 4} y={CY - (level / 100) * MAX_R + 3}
                  fill="rgba(255,255,255,0.15)" fontSize="7">{level}</text>
          ))}

          {/* DNA polygon fill */}
          <polygon points={polygonPoints}
                   fill={`${getColor(avgCPS)}10`} stroke={getColor(avgCPS)}
                   strokeWidth="2" strokeOpacity="0.6" />

          {/* Radial stripes (barcode) */}
          {stripes.map((s, i) => (
            <g key={i}>
              {/* Main stripe */}
              <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
                    stroke={s.color} strokeWidth="4" strokeOpacity="0.7"
                    strokeLinecap="round" />
              {/* Glow */}
              <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
                    stroke={s.color} strokeWidth="8" strokeOpacity="0.15"
                    strokeLinecap="round" />
              {/* Node */}
              <circle cx={s.x2} cy={s.y2} r="6"
                      fill={s.color} fillOpacity="0.3" stroke={s.color} strokeWidth="1.5" />
              {/* Trend indicator */}
              {s.trend === 'improving' && (
                <circle cx={s.x2} cy={s.y2} r="9"
                        fill="none" stroke="#ff4d6a" strokeWidth="1"
                        strokeDasharray="2,2" strokeOpacity="0.5" />
              )}
              {/* Label */}
              <text x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="central"
                    fill={s.color} fontSize="10" fontWeight="700">
                {FORCE_LABELS[s.key]} {s.cps}
              </text>
            </g>
          ))}

          {/* Core */}
          <circle cx={CX} cy={CY} r="18" fill="rgba(10,15,26,0.8)"
                  stroke={getColor(avgCPS)} strokeWidth="1.5" />
          <text x={CX} y={CY - 2} textAnchor="middle" fill={getColor(avgCPS)} fontSize="10">🧬</text>
          <text x={CX} y={CY + 10} textAnchor="middle" fill="var(--text-tertiary)" fontSize="6">DNA</text>
        </svg>

        {/* Archetype comparison panel */}
        <div style={{ flex: '1', minWidth: '220px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
            Arquetipos Sectoriales
          </div>
          {Object.entries(ARCHETYPES).map(([name, benchmark]) => {
            const archAvg = Math.round(Object.values(benchmark).reduce((s, v) => s + v, 0) / 5);
            // Similarity score (inverse of distance)
            const distance = Math.sqrt(
              FORCE_ORDER.reduce((s, key) => {
                const myVal = forceData.find(d => d.key === key)?.cps || 50;
                return s + Math.pow(myVal - benchmark[key], 2);
              }, 0)
            );
            const similarity = Math.max(0, Math.round(100 - distance / 2));

            return (
              <div key={name} style={{
                padding: '0.5rem 0.6rem', marginBottom: '0.35rem', borderRadius: '6px',
                background: similarity >= 70 ? 'rgba(0,200,150,0.05)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${similarity >= 70 ? '#00c89622' : 'rgba(255,255,255,0.04)'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{name}</span>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700,
                    color: similarity >= 70 ? '#00c896' : similarity >= 50 ? '#f0a500' : 'var(--text-tertiary)',
                  }}>
                    {similarity}% similar
                  </span>
                </div>
                {/* Mini bar comparison */}
                <div style={{ display: 'flex', gap: '2px', marginTop: '0.25rem' }}>
                  {FORCE_ORDER.map(key => (
                    <div key={key} style={{ flex: 1, height: '3px', borderRadius: '1px', background: 'rgba(255,255,255,0.06)' }}>
                      <div style={{
                        height: '100%', width: `${benchmark[key]}%`, borderRadius: '1px',
                        background: getColor(benchmark[key]),
                      }} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Force legend for archetype bars */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>
            {FORCE_ORDER.map(key => (
              <span key={key}>{FORCE_LABELS[key]}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '1rem', padding: '0.5rem 0.75rem', fontSize: '0.7rem',
        color: 'var(--text-tertiary)', borderLeft: '3px solid var(--accent-secondary)',
        background: 'rgba(255,255,255,0.02)', borderRadius: '0 6px 6px 0',
      }}>
        🧬 Cada industria genera un patrón competitivo único. La similitud se calcula
        como distancia euclidiana inversa entre vectores CPS. Arquetipos basados en
        análisis sectorial (Porter, 1980; Magretta, 2012).
      </div>
    </div>
  );
}
