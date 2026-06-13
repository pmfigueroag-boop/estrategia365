/**
 * PestelScenarioMatrix — Probability × Impact Scatter (Phase 5.3)
 * ================================================================
 * 2×2 matrix with quadrants: Monitor | Strategic Watch |
 * Operational Planning | Immediate Action.
 */
"use client";

const FACTOR_COLORS = { P: '#ff453a', E: '#ff9f0a', S: '#30d158', T: '#5e5ce6', E2: '#bf5af2', L: '#ff6b35' };

const QUADRANTS = {
  tl: { label: 'Strategic Watch', desc: 'Baja probabilidad, alto impacto', bg: 'rgba(255,149,0,0.05)', border: 'rgba(255,149,0,0.15)' },
  tr: { label: 'Immediate Action', desc: 'Alta probabilidad, alto impacto', bg: 'rgba(255,45,85,0.05)', border: 'rgba(255,45,85,0.15)' },
  bl: { label: 'Monitor', desc: 'Baja probabilidad, bajo impacto', bg: 'rgba(48,209,88,0.05)', border: 'rgba(48,209,88,0.15)' },
  br: { label: 'Operational Planning', desc: 'Alta probabilidad, bajo impacto', bg: 'rgba(94,92,230,0.05)', border: 'rgba(94,92,230,0.15)' },
};

export default function PestelScenarioMatrix({ priorityMatrix }) {
  if (!priorityMatrix || !priorityMatrix.length) return null;

  const W = 400, H = 320, PAD = 40;
  const CW = W - PAD * 2, CH = H - PAD * 2;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: '0 0 0.25rem' }}>Scenario Planning Matrix</h3>
      <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', margin: '0 0 1rem' }}>
        Probabilidad de materializacion vs Impacto estrategico — 4 cuadrantes de respuesta
      </p>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: '500px' }}>
          {/* Quadrant backgrounds */}
          <rect x={PAD} y={PAD} width={CW/2} height={CH/2} fill={QUADRANTS.tl.bg} stroke={QUADRANTS.tl.border} strokeWidth="0.5" rx="4" />
          <rect x={PAD+CW/2} y={PAD} width={CW/2} height={CH/2} fill={QUADRANTS.tr.bg} stroke={QUADRANTS.tr.border} strokeWidth="0.5" rx="4" />
          <rect x={PAD} y={PAD+CH/2} width={CW/2} height={CH/2} fill={QUADRANTS.bl.bg} stroke={QUADRANTS.bl.border} strokeWidth="0.5" rx="4" />
          <rect x={PAD+CW/2} y={PAD+CH/2} width={CW/2} height={CH/2} fill={QUADRANTS.br.bg} stroke={QUADRANTS.br.border} strokeWidth="0.5" rx="4" />

          {/* Quadrant labels */}
          <text x={PAD+CW/4} y={PAD+16} textAnchor="middle" fill="rgba(255,149,0,0.5)" fontSize="8" fontWeight="700" fontFamily="monospace">STRATEGIC WATCH</text>
          <text x={PAD+CW*3/4} y={PAD+16} textAnchor="middle" fill="rgba(255,45,85,0.5)" fontSize="8" fontWeight="700" fontFamily="monospace">IMMEDIATE ACTION</text>
          <text x={PAD+CW/4} y={PAD+CH/2+16} textAnchor="middle" fill="rgba(48,209,88,0.5)" fontSize="8" fontWeight="700" fontFamily="monospace">MONITOR</text>
          <text x={PAD+CW*3/4} y={PAD+CH/2+16} textAnchor="middle" fill="rgba(94,92,230,0.5)" fontSize="8" fontWeight="700" fontFamily="monospace">OPERATIONAL PLAN</text>

          {/* Axes */}
          <line x1={PAD} y1={PAD+CH} x2={PAD+CW} y2={PAD+CH} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <line x1={PAD} y1={PAD} x2={PAD} y2={PAD+CH} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <text x={PAD+CW/2} y={H-5} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">PROBABILIDAD →</text>
          <text x={8} y={PAD+CH/2} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace" transform={`rotate(-90,8,${PAD+CH/2})`}>IMPACTO →</text>

          {/* Midlines */}
          <line x1={PAD+CW/2} y1={PAD} x2={PAD+CW/2} y2={PAD+CH} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="4,4" />
          <line x1={PAD} y1={PAD+CH/2} x2={PAD+CW} y2={PAD+CH/2} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="4,4" />

          {/* Data points */}
          {priorityMatrix.map((s, i) => {
            const prob = s.probability || 50;
            const impact = s.impact || 50;
            const cx = PAD + (prob / 100) * CW;
            const cy = PAD + CH - (impact / 100) * CH;
            const r = 5 + (s.priority_score / 100) * 6;
            const fc = FACTOR_COLORS[s.factor] || '#888';
            const isOpp = s.impact_type === 'opportunity';
            const conf = s.confidence_score || 70;
            const opacity = 0.3 + (conf / 100) * 0.7;

            return (
              <g key={s.id || i}>
                {isOpp ? (
                  <polygon points={`${cx},${cy-r} ${cx+r},${cy} ${cx},${cy+r} ${cx-r},${cy}`}
                    fill={fc} fillOpacity={opacity} stroke={fc} strokeWidth="1" strokeOpacity={opacity}>
                    <title>{`${s.title}\nP:${prob}% | I:${Math.round(impact)} | Conf:${conf}%`}</title>
                  </polygon>
                ) : (
                  <circle cx={cx} cy={cy} r={r}
                    fill={fc} fillOpacity={opacity} stroke={fc} strokeWidth="1" strokeOpacity={opacity}>
                    <title>{`${s.title}\nP:${prob}% | I:${Math.round(impact)} | Conf:${conf}%`}</title>
                  </circle>
                )}
                <text x={cx} y={cy+3} textAnchor="middle" fill="white" fontSize="6" fontWeight="700" style={{pointerEvents:'none'}}>
                  {s.factor}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Quadrant summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.75rem' }}>
        {[
          { key: 'immediate', label: 'Immediate Action', color: '#ff2d55', filter: s => s.probability >= 50 && s.impact >= 50 },
          { key: 'strategic', label: 'Strategic Watch', color: '#ff9500', filter: s => s.probability < 50 && s.impact >= 50 },
          { key: 'operational', label: 'Operational Plan', color: '#5e5ce6', filter: s => s.probability >= 50 && s.impact < 50 },
          { key: 'monitor', label: 'Monitor', color: '#30d158', filter: s => s.probability < 50 && s.impact < 50 },
        ].map(q => {
          const count = priorityMatrix.filter(q.filter).length;
          return (
            <div key={q.key} style={{
              padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem',
              background: `${q.color}08`, border: `1px solid ${q.color}22`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ color: q.color, fontWeight: 600 }}>{q.label}</span>
              <span style={{ fontWeight: 800, fontFamily: 'monospace', color: q.color }}>{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
