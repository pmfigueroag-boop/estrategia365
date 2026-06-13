'use client';
/**
 * PestelPriorityMatrix — Urgency × Impact Scatter Plot (Sprint 3)
 * =================================================================
 * Visual quadrant-based priority matrix for PESTEL signals.
 * Quadrants: Act Now | Plan Ahead | Monitor | Watch
 */

const FACTOR_COLORS = {
  P: '#f87171', E: '#facc15', S: '#4ade80', T: '#60a5fa', E2: '#a78bfa', L: '#f97316'
};
const QUADRANT_LABELS = {
  act_now: { label: '🚨 Actuar Ya', color: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)' },
  plan_ahead: { label: '📋 Planificar', color: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)' },
  monitor: { label: '👁️ Monitorear', color: 'rgba(250,204,21,0.12)', border: 'rgba(250,204,21,0.3)' },
  watch: { label: '📡 Observar', color: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)' },
};

export default function PestelPriorityMatrix({ priorityMatrix }) {
  if (!priorityMatrix || priorityMatrix.length === 0) return null;

  const CHART_W = 520;
  const CHART_H = 340;
  const PAD = 40;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
        🎯 Matriz de Prioridad Estratégica
      </h3>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
        Urgencia vs. Impacto — Las señales en el cuadrante superior derecho requieren acción inmediata
      </p>

      {/* SVG Scatter Plot */}
      <div style={{ overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
        <svg viewBox={`0 0 ${CHART_W + PAD*2} ${CHART_H + PAD*2}`} style={{ width: '100%', maxWidth: '600px', height: 'auto' }}>
          {/* Quadrant backgrounds */}
          <rect x={PAD + CHART_W/2} y={PAD} width={CHART_W/2} height={CHART_H*0.33} rx="4" fill={QUADRANT_LABELS.act_now.color} stroke={QUADRANT_LABELS.act_now.border} strokeWidth="0.5"/>
          <rect x={PAD} y={PAD} width={CHART_W/2} height={CHART_H*0.33} rx="4" fill={QUADRANT_LABELS.plan_ahead.color} stroke={QUADRANT_LABELS.plan_ahead.border} strokeWidth="0.5"/>
          <rect x={PAD + CHART_W/2} y={PAD + CHART_H*0.33} width={CHART_W/2} height={CHART_H*0.67} rx="4" fill={QUADRANT_LABELS.monitor.color} stroke={QUADRANT_LABELS.monitor.border} strokeWidth="0.5"/>
          <rect x={PAD} y={PAD + CHART_H*0.33} width={CHART_W/2} height={CHART_H*0.67} rx="4" fill={QUADRANT_LABELS.watch.color} stroke={QUADRANT_LABELS.watch.border} strokeWidth="0.5"/>

          {/* Quadrant labels */}
          <text x={PAD + CHART_W*0.75} y={PAD + 18} fill="#f87171" fontSize="10" textAnchor="middle" fontWeight="600">🚨 ACTUAR YA</text>
          <text x={PAD + CHART_W*0.25} y={PAD + 18} fill="#60a5fa" fontSize="10" textAnchor="middle" fontWeight="600">📋 PLANIFICAR</text>
          <text x={PAD + CHART_W*0.75} y={PAD + CHART_H - 10} fill="#facc15" fontSize="10" textAnchor="middle" fontWeight="600">👁️ MONITOREAR</text>
          <text x={PAD + CHART_W*0.25} y={PAD + CHART_H - 10} fill="#4ade80" fontSize="10" textAnchor="middle" fontWeight="600">📡 OBSERVAR</text>

          {/* Axes */}
          <line x1={PAD} y1={PAD + CHART_H} x2={PAD + CHART_W} y2={PAD + CHART_H} stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
          <line x1={PAD} y1={PAD} x2={PAD} y2={PAD + CHART_H} stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
          <text x={PAD + CHART_W/2} y={PAD + CHART_H + 30} fill="var(--text-tertiary,#888)" fontSize="10" textAnchor="middle">Urgencia →</text>
          <text x={12} y={PAD + CHART_H/2} fill="var(--text-tertiary,#888)" fontSize="10" textAnchor="middle" transform={`rotate(-90, 12, ${PAD + CHART_H/2})`}>Impacto →</text>

          {/* Data points */}
          {priorityMatrix.map((s, i) => {
            const cx = PAD + (s.urgency / 100) * CHART_W;
            const cy = PAD + CHART_H - (s.impact / 100) * CHART_H;
            const r = 6 + (s.priority_score / 100) * 8;
            const isOpp = s.impact_type === 'opportunity';
            const fc = FACTOR_COLORS[s.factor] || '#888';
            return (
              <g key={s.id || i}>
                {isOpp ? (
                  <polygon
                    points={`${cx},${cy-r} ${cx+r},${cy} ${cx},${cy+r} ${cx-r},${cy}`}
                    fill={fc} fillOpacity={0.7} stroke={fc} strokeWidth="1.5" strokeOpacity={0.9}>
                    <title>{`${s.title}\n${s.factor_label} | OPP | Score:${s.priority_score} | Prob: ${s.probability}%`}</title>
                  </polygon>
                ) : (
                  <circle cx={cx} cy={cy} r={r} fill={fc} fillOpacity={0.7} stroke={fc} strokeWidth="1.5" strokeOpacity={0.9}>
                    <title>{`${s.title}\n${s.factor_label} | THR | Score:${s.priority_score} | Prob: ${s.probability}%`}</title>
                  </circle>
                )}
                <text x={cx} y={cy + 3} fill="white" fontSize="7" textAnchor="middle" fontWeight="700" style={{pointerEvents:'none'}}>
                  {s.factor}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Factor Legend + Shape Legend */}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.5rem' }}>
        {Object.entries(FACTOR_COLORS).map(([f, color]) => (
          <span key={f} style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, display: 'inline-block' }}></span>
            <span style={{ color: 'var(--text-tertiary)' }}>{{ P:'Politico', E:'Economico', S:'Social', T:'Tecnologico', E2:'Ecologico', L:'Legal' }[f]}</span>
          </span>
        ))}
        <span style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '0.5rem', paddingLeft: '0.5rem', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
          <svg width="12" height="12" viewBox="0 0 12 12"><polygon points="6,1 11,6 6,11 1,6" fill="#888" /></svg>
          <span style={{ color: 'var(--text-tertiary)' }}>Oportunidad</span>
        </span>
        <span style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#888', display: 'inline-block' }}></span>
          <span style={{ color: 'var(--text-tertiary)' }}>Amenaza</span>
        </span>
      </div>

      {/* Quadrant Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
        {Object.entries(QUADRANT_LABELS).map(([q, cfg]) => {
          const count = priorityMatrix.filter(s => s.quadrant === q).length;
          return (
            <div key={q} style={{
              padding: '8px 12px', borderRadius: '8px',
              background: cfg.color, border: `1px solid ${cfg.border}`,
              fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span>{cfg.label}</span>
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
