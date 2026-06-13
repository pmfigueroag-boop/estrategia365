/**
 * PestelVolatilityGauge — Strategic Volatility Index (SVI) Gauge (Phase 5.2)
 * ============================================================================
 * Speedometer-style gauge displaying the composite SVI score with zones.
 */
"use client";

const ZONES = [
  { max: 35, color: '#30d158', label: 'Estable' },
  { max: 55, color: '#ffcc00', label: 'Moderado' },
  { max: 75, color: '#ff9500', label: 'Elevado' },
  { max: 100, color: '#ff2d55', label: 'Critico' },
];

function getZone(score) {
  return ZONES.find(z => score <= z.max) || ZONES[3];
}

export default function PestelVolatilityGauge({ svi, driftData }) {
  if (!svi) return null;

  const score = svi.score || 0;
  const zone = getZone(score);
  const angle = -135 + (score / 100) * 270; // -135 to 135 degrees
  const CX = 120, CY = 120, R = 90;

  // Build arc segments
  const arcs = ZONES.map((z, i) => {
    const prevMax = i === 0 ? 0 : ZONES[i - 1].max;
    const startAngle = -135 + (prevMax / 100) * 270;
    const endAngle = -135 + (z.max / 100) * 270;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = CX + R * Math.cos(startRad);
    const y1 = CY + R * Math.sin(startRad);
    const x2 = CX + R * Math.cos(endRad);
    const y2 = CY + R * Math.sin(endRad);
    const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;
    return (
      <path key={i}
        d={`M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}`}
        fill="none" stroke={z.color} strokeWidth="8" strokeLinecap="round" opacity="0.3" />
    );
  });

  // Needle
  const needleRad = (angle * Math.PI) / 180;
  const needleLen = R - 15;
  const nx = CX + needleLen * Math.cos(needleRad);
  const ny = CY + needleLen * Math.sin(needleRad);

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>Strategic Volatility Index</h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', margin: '0.2rem 0 0' }}>
            Indice compuesto de turbulencia estrategica del entorno
          </p>
        </div>
        <div style={{
          padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700,
          background: `${zone.color}15`, border: `1px solid ${zone.color}33`, color: zone.color,
        }}>
          {zone.label.toUpperCase()}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
        {/* SVG Gauge */}
        <svg viewBox="0 0 240 160" style={{ width: '100%', maxWidth: '260px', height: 'auto' }}>
          <defs>
            <filter id="sviGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Background arc */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />

          {/* Zone arcs */}
          {arcs}

          {/* Active arc */}
          {(() => {
            const startRad = (-135 * Math.PI) / 180;
            const endRad = (angle * Math.PI) / 180;
            const x1 = CX + R * Math.cos(startRad);
            const y1 = CY + R * Math.sin(startRad);
            const x2 = CX + R * Math.cos(endRad);
            const y2 = CY + R * Math.sin(endRad);
            const sweep = angle + 135 > 180 ? 1 : 0;
            return <path d={`M ${x1} ${y1} A ${R} ${R} 0 ${sweep} 1 ${x2} ${y2}`}
              fill="none" stroke={zone.color} strokeWidth="8" strokeLinecap="round"
              filter="url(#sviGlow)" style={{ transition: 'all 0.8s ease' }} />;
          })()}

          {/* Needle */}
          <line x1={CX} y1={CY} x2={nx} y2={ny}
            stroke={zone.color} strokeWidth="2" strokeLinecap="round"
            filter="url(#sviGlow)" style={{ transition: 'all 0.8s ease' }} />
          <circle cx={CX} cy={CY} r="4" fill={zone.color} />

          {/* Score text */}
          <text x={CX} y={CY + 30} textAnchor="middle" fill={zone.color}
            fontSize="28" fontWeight="800" fontFamily="monospace">{score}</text>
          <text x={CX} y={CY + 44} textAnchor="middle" fill="rgba(255,255,255,0.4)"
            fontSize="8" fontFamily="monospace" letterSpacing="2">SVI SCORE</text>

          {/* Zone labels */}
          <text x={25} y={CY + 15} fill="#30d158" fontSize="7" fontFamily="monospace">ESTABLE</text>
          <text x={195} y={CY + 15} fill="#ff2d55" fontSize="7" fontFamily="monospace">CRITICO</text>
        </svg>

        {/* Description + Drift */}
        <div style={{ flex: 1, minWidth: '180px' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
            {svi.description || 'Calculando...'}
          </p>

          {driftData && driftData.has_history && (
            <div style={{
              padding: '0.75rem', borderRadius: '8px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Environmental Drift
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{
                  fontSize: '1.2rem', fontWeight: 800, fontFamily: 'monospace',
                  color: driftData.drift_level === 'high' ? '#ff2d55' : driftData.drift_level === 'moderate' ? '#ff9500' : '#30d158',
                }}>{driftData.drift_score}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Drift {driftData.drift_level} ({driftData.total_snapshots} snapshots)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
