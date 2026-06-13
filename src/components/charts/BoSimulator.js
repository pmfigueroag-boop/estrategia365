/**
 * BoSimulator — Blue Ocean Value Curve Simulator (Fase 3)
 * ========================================================
 * ¿Qué pasa si subes un factor? ¿Si eliminas otro?
 * Sliders interactivos para cada factor → recalcula ERRC,
 * divergencia, y visualiza la nueva curva en tiempo real.
 * Scenarios presets: Aggressive Blue Ocean, Defensive Red, etc.
 */
"use client";
import { useState, useMemo } from 'react';

const ERRC_META = {
  eliminate: { color: '#ff4d6a', icon: '❌', label: 'Eliminar' },
  reduce:    { color: '#f59e0b', icon: '⬇️', label: 'Reducir'  },
  raise:     { color: '#6366f1', icon: '⬆️', label: 'Incrementar' },
  create:    { color: '#10b981', icon: '✨', label: 'Crear'    },
};

const SCENARIOS = [
  { id: 'current', label: '📊 Actual', desc: 'Propuesta IA original sin cambios', deltas: {} },
  { id: 'aggressive', label: '🚀 Agresivo', desc: 'Maximizar creación + eliminación', logic: f => {
    if (f.errc_action === 'create') return +2;
    if (f.errc_action === 'eliminate') return -2;
    if (f.errc_action === 'raise') return +1;
    return 0;
  }},
  { id: 'defensive', label: '🛡️ Defensivo', desc: 'Minimizar divergencia — acercarse a la industria', logic: f => {
    const delta = f.proposed_score - f.industry_score;
    return -Math.round(delta * 0.5);
  }},
  { id: 'focusCreate', label: '✨ Solo Crear', desc: 'Maximizar nuevos factores, mantener el resto', logic: f => f.errc_action === 'create' ? +2 : 0 },
  { id: 'costLeader', label: '⚙️ Costo', desc: 'Reducir y eliminar todo lo posible', logic: f => {
    if (f.errc_action === 'eliminate' || f.errc_action === 'reduce') return -1;
    return 0;
  }},
];

function reclassifyErrc(industry, proposed) {
  const delta = proposed - industry;
  if (proposed === 0 || proposed === 1) return 'eliminate';
  if (delta <= -1) return 'reduce';
  if (delta >= 2) return 'create';
  if (delta >= 1) return 'raise';
  if (delta === 0) return 'reduce';
  return delta > 0 ? 'raise' : 'reduce';
}

function pointsToPath(pts) {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
}

export default function BoSimulator({ factors = [] }) {
  const [scenarioId, setScenarioId] = useState('current');
  const [manualDeltas, setManualDeltas] = useState({});

  if (!factors.length) return null;

  const scenario = SCENARIOS.find(s => s.id === scenarioId);

  const simFactors = useMemo(() => {
    return factors.map(f => {
      const scenarioDelta = scenario.logic ? scenario.logic(f) : 0;
      const manualDelta = manualDeltas[f.name] || 0;
      const newScore = Math.max(0, Math.min(5, f.proposed_score + scenarioDelta + manualDelta));
      const newErrc = reclassifyErrc(f.industry_score, newScore);
      return { ...f, simScore: newScore, simErrc: newErrc, origScore: f.proposed_score, delta: newScore - f.industry_score, changed: newScore !== f.proposed_score };
    });
  }, [factors, scenario, manualDeltas]);

  const W = 580, H = 220, PAD_L = 16, PAD_R = 16, PAD_T = 20, PAD_B = 50;
  const chartW = W - PAD_L - PAD_R, chartH = H - PAD_T - PAD_B;
  const idxToX = i => PAD_L + (i / (factors.length - 1 || 1)) * chartW;
  const scoreToY = s => PAD_T + chartH - ((s - 0) / 5) * chartH;

  const industryPts = factors.map((f, i) => ({ x: idxToX(i), y: scoreToY(f.industry_score) }));
  const origPts = factors.map((f, i) => ({ x: idxToX(i), y: scoreToY(f.proposed_score) }));
  const simPts = simFactors.map((f, i) => ({ x: idxToX(i), y: scoreToY(f.simScore) }));

  const origDivergence = factors.reduce((s, f) => s + Math.abs(f.proposed_score - f.industry_score), 0);
  const simDivergence = simFactors.reduce((s, f) => s + Math.abs(f.simScore - f.industry_score), 0);
  const divDelta = simDivergence - origDivergence;

  const changedCount = simFactors.filter(f => f.changed).length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🧪</div>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>Value Curve Simulator</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
            Simula cambios en la curva de valor · Proyecta el impacto en divergencia y clasificación ERRC
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {changedCount > 0 && <span style={{ padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.65rem', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontWeight: 700 }}>⚡ {changedCount} cambio{changedCount !== 1 ? 's' : ''}</span>}
          <button onClick={() => { setManualDeltas({}); setScenarioId('current'); }} style={{ padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.65rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>↺ Reset</button>
        </div>
      </div>

      {/* Scenarios */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {SCENARIOS.map(s => (
          <button key={s.id} onClick={() => { setScenarioId(s.id); setManualDeltas({}); }} style={{
            padding: '0.35rem 0.75rem', borderRadius: 8, fontSize: '0.7rem', cursor: 'pointer',
            border: `1px solid ${scenarioId === s.id ? 'rgba(245,158,11,0.55)' : 'rgba(255,255,255,0.1)'}`,
            background: scenarioId === s.id ? 'rgba(245,158,11,0.12)' : 'transparent',
            color: scenarioId === s.id ? '#fbbf24' : 'var(--text-secondary)',
            fontWeight: scenarioId === s.id ? 700 : 400,
          }}>{s.label}</button>
        ))}
      </div>

      {/* Live canvas */}
      <div className="glass-panel" style={{ padding: '1rem', background: 'linear-gradient(135deg, rgba(2,4,16,0.97), rgba(6,8,24,0.95))' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
          <defs>
            <filter id="simBoGlow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          {[1,2,3,4,5].map(v => (
            <g key={v}>
              <line x1={PAD_L} y1={scoreToY(v)} x2={W-PAD_R} y2={scoreToY(v)} stroke="rgba(255,255,255,0.05)" />
              <text x={PAD_L-2} y={scoreToY(v)} textAnchor="end" dominantBaseline="middle" fill="rgba(255,255,255,0.15)" fontSize="8">{v}</text>
            </g>
          ))}
          {/* Industry */}
          <path d={pointsToPath(industryPts)} fill="none" stroke="#ff4d6a" strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="4,3" />
          {/* Original proposal (ghost) */}
          <path d={pointsToPath(origPts)} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3,2" />
          {/* Simulated */}
          <path d={pointsToPath(simPts)} fill="none" stroke="#10b981" strokeWidth="2.5" filter="url(#simBoGlow)" />
          {/* Factor dots */}
          {simFactors.map((f, i) => {
            const errc = ERRC_META[f.simErrc];
            return (
              <g key={i}>
                <circle cx={idxToX(i)} cy={scoreToY(f.simScore)} r={6} fill={`${errc?.color}35`} stroke={errc?.color} strokeWidth="1.5" />
                <text x={idxToX(i)} y={scoreToY(f.simScore)} textAnchor="middle" dominantBaseline="middle" fontSize="7">{errc?.icon}</text>
                <text x={idxToX(i)} y={H - PAD_B + 14} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="7"
                  transform={`rotate(-35, ${idxToX(i)}, ${H - PAD_B + 14})`}>
                  {f.name?.slice(0, 12)}
                </text>
              </g>
            );
          })}
        </svg>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.3rem' }}>
          {[['Industria', '#ff4d6a', '- -'], ['Original', 'rgba(255,255,255,0.3)', '···'], ['Simulación', '#10b981', '—']].map(([l, c, dash]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem' }}>
              <div style={{ width: 18, height: 2, background: c, borderRadius: 1 }} />
              <span style={{ color: c }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '1rem', alignItems: 'start' }}>
        {/* Sliders */}
        <div className="glass-panel" style={{ padding: '1rem', maxHeight: 320, overflowY: 'auto' }}>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.6rem' }}>Ajustes por Factor</div>
          {simFactors.map((f, i) => {
            const errc = ERRC_META[f.simErrc];
            return (
              <div key={i} style={{ marginBottom: '0.6rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: errc?.color }}>{errc?.icon} {f.name}</span>
                  <span style={{ fontSize: '0.65rem', color: f.changed ? '#f59e0b' : 'var(--text-tertiary)' }}>
                    {f.origScore}→{f.simScore} {f.changed ? '⚡' : ''}
                  </span>
                </div>
                <input type="range" min="-3" max="3" step="1" value={manualDeltas[f.name] || 0}
                  onChange={e => setManualDeltas(d => ({ ...d, [f.name]: parseInt(e.target.value) }))}
                  style={{ width: '100%', accentColor: errc?.color || '#10b981' }} />
              </div>
            );
          })}
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Impacto de Simulación</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
              {[['Divergencia', `${simDivergence}pts`, divDelta > 0 ? '#10b981' : '#ff4d6a'],
                ['Δ vs Original', (divDelta > 0 ? '+' : '') + divDelta, divDelta > 0 ? '#10b981' : '#ff4d6a'],
                ['Factores mod.', changedCount, '#f59e0b'],
                ['ERRC reclasif.', simFactors.filter(f => f.simErrc !== f.errc_action).length, '#6366f1']
              ].map(([l, v, c]) => (
                <div key={l} style={{ padding: '0.4rem', borderRadius: 7, background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>{l}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: c }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>ERRC Simulado</div>
            {Object.entries(ERRC_META).map(([k, m]) => {
              const count = simFactors.filter(f => f.simErrc === k).length;
              const orig = factors.filter(f => f.errc_action === k).length;
              const diff = count - orig;
              return (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.68rem', color: m.color }}>{m.icon} {m.label}</span>
                  <span style={{ fontSize: '0.68rem', color: diff !== 0 ? '#f59e0b' : 'var(--text-tertiary)' }}>
                    {count} {diff !== 0 ? `(${diff > 0 ? '+' : ''}${diff})` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
