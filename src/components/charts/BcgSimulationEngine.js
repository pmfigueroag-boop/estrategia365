/**
 * BcgSimulationEngine — Portfolio Reshaping Simulator (Fase 3)
 * =============================================================
 * ¿Qué pasa si aumentas inversión en una Star?
 * ¿Si desinviertes en Dogs y redireccionas a Question Marks?
 * ¿Si un nuevo competidor comprime shares?
 *
 * Sliders interactivos por unidad → proyección en matriz dinámica.
 * Doctrina: Resource Reallocation Theory + Scenario Planning.
 * 100% client-side. Sin backend. Pure boolean/number manipulation.
 */
"use client";
import { useState, useMemo } from 'react';

const QUADRANTS = {
  star:     { color: '#6366f1', icon: '⭐', label: 'Star'           },
  cow:      { color: '#10b981', icon: '🐄', label: 'Cash Cow'       },
  question: { color: '#f59e0b', icon: '❓', label: 'Question Mark'   },
  dog:      { color: '#ff4d6a', icon: '🐕', label: 'Dog'            },
};

const SCENARIOS = [
  { id: 'base',       label: '📊 Base',            desc: 'Posición actual sin cambios',                             shareΔ: {}, growthΔ: {} },
  { id: 'invest',     label: '🚀 Inversión Stars',  desc: 'Inyectar capital en Stars y convertir QM a Star',         shareΔ: { star: +0.12, question: +0.08 }, growthΔ: { star: +0.06 } },
  { id: 'optimize',   label: '⚙️ Optimizar Cows',  desc: 'Eficiencia en Cows — liberar caja para Stars',           shareΔ: { cow: -0.05 }, growthΔ: { cow: +0.02, star: +0.04 } },
  { id: 'divest',     label: '🏃 Desinvertir Dogs', desc: 'Liquidar Dogs — redirigir capital a Question Marks',     shareΔ: { dog: -0.15 }, growthΔ: { question: +0.1, star: +0.03 } },
  { id: 'shock',      label: '💥 Shock Competitivo', desc: 'Nuevo jugador agresivo comprime shares en todos',       shareΔ: { star: -0.1, cow: -0.12, question: -0.08 }, growthΔ: {} },
];

function applyScenario(units, scenario, manualDeltas) {
  return units.map(u => {
    const sΔ = (scenario.shareΔ[u.quadrant] || 0) + (manualDeltas[u.name]?.share || 0);
    const gΔ = (scenario.growthΔ[u.quadrant] || 0) + (manualDeltas[u.name]?.growth || 0);
    const newShare = Math.max(0.02, Math.min(0.98, u.share + sΔ));
    const newGrowth = Math.max(-0.1, Math.min(0.65, u.growth + gΔ));
    return { ...u, simShare: newShare, simGrowth: newGrowth, deltaShare: sΔ, deltaGrowth: gΔ };
  });
}

function toSvg(share, growth, W, H, pad) {
  const gMin = -0.15, gMax = 0.58;
  const x = pad + share * (W - 2 * pad);
  const y = H - pad - ((growth - gMin) / (gMax - gMin)) * (H - 2 * pad);
  return { x: Math.max(pad, Math.min(W - pad, x)), y: Math.max(pad, Math.min(H - pad, y)) };
}

function reclassify(share, growth, avgShare, avgGrowth) {
  if (share >= avgShare && growth >= avgGrowth) return 'star';
  if (share >= avgShare && growth < avgGrowth) return 'cow';
  if (share < avgShare && growth >= avgGrowth) return 'question';
  return 'dog';
}

export default function BcgSimulationEngine({ units = [] }) {
  const [scenarioId, setScenarioId] = useState('base');
  const [manualDeltas, setManualDeltas] = useState({});
  const [showDiff, setShowDiff] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState(null);

  if (!units.length) return null;

  const scenario = SCENARIOS.find(s => s.id === scenarioId);
  const simUnits = useMemo(() => applyScenario(units, scenario, manualDeltas), [units, scenario, manualDeltas]);

  const avgShare = simUnits.reduce((s, u) => s + u.simShare, 0) / simUnits.length;
  const avgGrowth = simUnits.reduce((s, u) => s + u.simGrowth, 0) / simUnits.length;
  const baseAvgShare = units.reduce((s, u) => s + u.share, 0) / units.length;
  const baseAvgGrowth = units.reduce((s, u) => s + u.growth, 0) / units.length;

  const reclassified = simUnits.map(u => ({
    ...u,
    newQuadrant: reclassify(u.simShare, u.simGrowth, avgShare, avgGrowth),
    changed: reclassify(u.simShare, u.simGrowth, avgShare, avgGrowth) !== u.quadrant,
  }));

  const changedCount = reclassified.filter(u => u.changed).length;
  const W = 440, H = 380, PAD = 48;
  const midX = PAD + avgShare * (W - 2 * PAD);
  const midY = H - PAD - ((avgGrowth - (-0.15)) / (0.58 - (-0.15))) * (H - 2 * PAD);

  const sel = selectedUnit ? reclassified.find(u => u.name === selectedUnit) : null;

  const updateDelta = (name, field, val) => {
    setManualDeltas(d => ({ ...d, [name]: { ...(d[name] || {}), [field]: parseFloat(val) } }));
  };

  const resetDeltas = () => { setManualDeltas({}); setScenarioId('base'); };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🧪</div>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>Portfolio Simulation Engine</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
            Simula reasignación de capital y shocks competitivos · Proyecta cambios de cuadrante en tiempo real
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {changedCount > 0 && <span style={{ padding: '0.25rem 0.65rem', borderRadius: 6, fontSize: '0.65rem', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontWeight: 700 }}>⚡ {changedCount} reclasificada{changedCount !== 1 ? 's' : ''}</span>}
          <button onClick={resetDeltas} style={{ padding: '0.25rem 0.6rem', borderRadius: 6, fontSize: '0.65rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>↺ Reset</button>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input type="checkbox" checked={showDiff} onChange={e => setShowDiff(e.target.checked)} style={{ accentColor: '#f59e0b' }} /> Mostrar movimiento
          </label>
        </div>
      </div>

      {/* Scenario selector */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {SCENARIOS.map(s => (
          <button key={s.id} onClick={() => setScenarioId(s.id)} style={{
            padding: '0.4rem 0.8rem', borderRadius: 8, fontSize: '0.72rem', cursor: 'pointer',
            border: `1px solid ${scenarioId === s.id ? 'rgba(245,158,11,0.55)' : 'rgba(255,255,255,0.1)'}`,
            background: scenarioId === s.id ? 'rgba(245,158,11,0.12)' : 'transparent',
            color: scenarioId === s.id ? '#fbbf24' : 'var(--text-secondary)',
            fontWeight: scenarioId === s.id ? 700 : 400, transition: 'all 0.2s',
          }}>{s.label}</button>
        ))}
      </div>
      {scenario.id !== 'base' && (
        <div style={{ padding: '0.5rem 0.85rem', borderRadius: 8, background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', fontSize: '0.7rem', color: '#fbbf24' }}>
          📋 {scenario.desc}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1rem', alignItems: 'start' }}>
        {/* Simulation matrix */}
        <div className="glass-panel" style={{ padding: '0.75rem', background: 'linear-gradient(135deg, rgba(2,4,16,0.97), rgba(6,8,24,0.95))' }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
            <defs>
              <filter id="simGlow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              <marker id="simArr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="4" markerHeight="4" orient="auto">
                <path d="M 0 0 L 8 4 L 0 8 z" fill="#f59e0b" fillOpacity="0.8" />
              </marker>
            </defs>

            {/* Quadrant backgrounds */}
            <rect x={PAD} y={PAD} width={midX-PAD} height={midY-PAD} fill="rgba(245,158,11,0.03)" />
            <rect x={midX} y={PAD} width={W-PAD-midX} height={midY-PAD} fill="rgba(99,102,241,0.04)" />
            <rect x={PAD} y={midY} width={midX-PAD} height={H-PAD-midY} fill="rgba(255,77,106,0.03)" />
            <rect x={midX} y={midY} width={W-PAD-midX} height={H-PAD-midY} fill="rgba(16,185,129,0.04)" />

            {/* Axes */}
            <line x1={PAD} y1={PAD} x2={PAD} y2={H-PAD} stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
            <line x1={PAD} y1={H-PAD} x2={W-PAD} y2={H-PAD} stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
            <line x1={midX} y1={PAD} x2={midX} y2={H-PAD} stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="5,4" />
            <line x1={PAD} y1={midY} x2={W-PAD} y2={midY} stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="5,4" />

            {/* Quadrant labels */}
            {[
              { q: 'question', tx: PAD+8, ty: PAD+14 }, { q: 'star', tx: midX+8, ty: PAD+14 },
              { q: 'dog', tx: PAD+8, ty: H-PAD-8 }, { q: 'cow', tx: midX+8, ty: H-PAD-8 },
            ].map(({q, tx, ty}) => (
              <text key={q} x={tx} y={ty} fill={QUADRANTS[q].color} fontSize="9" fontWeight="700" fillOpacity="0.4">{QUADRANTS[q].icon} {QUADRANTS[q].label}</text>
            ))}

            {/* Movement arrows + nodes */}
            {reclassified.map((u, i) => {
              const origPos = toSvg(u.share, u.growth, W, H, PAD);
              const simPos = toSvg(u.simShare, u.simGrowth, W, H, PAD);
              const origQ = QUADRANTS[u.quadrant];
              const newQ = QUADRANTS[u.newQuadrant];
              const isSel = selectedUnit === u.name;
              const moved = Math.abs(simPos.x - origPos.x) > 3 || Math.abs(simPos.y - origPos.y) > 3;

              return (
                <g key={i} onClick={() => setSelectedUnit(isSel ? null : u.name)} style={{ cursor: 'pointer' }}>
                  {/* Original position (ghost) */}
                  {showDiff && moved && (
                    <circle cx={origPos.x} cy={origPos.y} r={9} fill={`${origQ.color}12`} stroke={origQ.color} strokeWidth="1" strokeDasharray="3,2" strokeOpacity="0.4" />
                  )}
                  {/* Movement arrow */}
                  {showDiff && moved && (
                    <line x1={origPos.x} y1={origPos.y} x2={simPos.x} y2={simPos.y}
                      stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.6" markerEnd="url(#simArr)" />
                  )}
                  {/* Simulated position */}
                  <circle cx={simPos.x} cy={simPos.y} r={isSel ? 14 : 11}
                    fill={`${newQ.color}25`} stroke={newQ.color} strokeWidth={isSel ? 2.5 : u.changed ? 2 : 1.5}
                    filter={isSel ? 'url(#simGlow)' : undefined} />
                  <text x={simPos.x} y={simPos.y+1} textAnchor="middle" dominantBaseline="middle" fontSize="9">{newQ.icon}</text>
                  {/* Changed badge */}
                  {u.changed && (
                    <circle cx={simPos.x+9} cy={simPos.y-9} r={5} fill="#f59e0b" />
                  )}
                  <text x={simPos.x} y={simPos.y+18} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="7">
                    {u.name?.slice(0, 14)}
                  </text>
                </g>
              );
            })}
            <text x={W/2} y={H-5} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="8">Participación Relativa →</text>
          </svg>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '0.25rem' }}>
            ⚡ = reclasificado · Línea = trayectoria · Ghost = posición original · Cruces = nueva mediana
          </div>
        </div>

        {/* Controls panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {/* Results summary */}
          <div className="glass-panel" style={{ padding: '0.85rem' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Resultados de Simulación</div>
            {Object.entries(QUADRANTS).map(([q, qd]) => {
              const before = units.filter(u => u.quadrant === q).length;
              const after = reclassified.filter(u => u.newQuadrant === q).length;
              const diff = after - before;
              return (
                <div key={q} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.68rem', color: qd.color }}>{qd.icon} {qd.label}</span>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{before}</span>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)' }}>→</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: qd.color }}>{after}</span>
                    {diff !== 0 && <span style={{ fontSize: '0.6rem', color: diff > 0 ? '#10b981' : '#ff4d6a', fontWeight: 700 }}>{diff > 0 ? `+${diff}` : diff}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Manual sliders */}
          <div className="glass-panel" style={{ padding: '0.85rem', maxHeight: 280, overflowY: 'auto' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Ajustes Manuales por Unidad</div>
            {units.map((u, i) => {
              const q = QUADRANTS[u.quadrant];
              const md = manualDeltas[u.name] || {};
              return (
                <div key={i} style={{ marginBottom: '0.75rem', paddingBottom: '0.65rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: q.color, marginBottom: '0.3rem' }}>{q.icon} {u.name}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 32px', gap: '0.3rem', alignItems: 'center', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>Share Δ</span>
                    <input type="range" min="-0.3" max="0.3" step="0.01" value={md.share || 0}
                      onChange={e => updateDelta(u.name, 'share', e.target.value)}
                      style={{ accentColor: q.color, width: '100%' }} />
                    <span style={{ fontSize: '0.6rem', color: q.color, textAlign: 'right' }}>
                      {((md.share || 0) > 0 ? '+' : '')}{((md.share || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 32px', gap: '0.3rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>Growth Δ</span>
                    <input type="range" min="-0.3" max="0.3" step="0.01" value={md.growth || 0}
                      onChange={e => updateDelta(u.name, 'growth', e.target.value)}
                      style={{ accentColor: q.color, width: '100%' }} />
                    <span style={{ fontSize: '0.6rem', color: q.color, textAlign: 'right' }}>
                      {((md.growth || 0) > 0 ? '+' : '')}{((md.growth || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected unit detail */}
          {sel && (
            <div className="glass-panel animate-fade-in" style={{ padding: '0.85rem', borderLeft: `3px solid ${QUADRANTS[sel.newQuadrant]?.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{sel.name}</span>
                <button onClick={() => setSelectedUnit(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                {[['Cuadrante', `${QUADRANTS[sel.quadrant]?.icon} → ${QUADRANTS[sel.newQuadrant]?.icon}`, sel.changed ? '#f59e0b' : 'var(--text-secondary)'],
                  ['Share', `${(sel.share*100).toFixed(0)}% → ${(sel.simShare*100).toFixed(0)}%`, sel.deltaShare !== 0 ? '#f59e0b' : 'var(--text-secondary)'],
                  ['Growth', `${(sel.growth*100).toFixed(0)}% → ${(sel.simGrowth*100).toFixed(0)}%`, sel.deltaGrowth !== 0 ? '#f59e0b' : 'var(--text-secondary)'],
                  ['Estado', sel.changed ? 'RECLASIFICADO' : 'Sin cambio', sel.changed ? '#f59e0b' : 'var(--text-tertiary)']
                ].map(([k, v, c], i) => (
                  <div key={i} style={{ padding: '0.35rem 0.45rem', borderRadius: 6, background: 'rgba(255,255,255,0.03)' }}>
                    <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>{k}</div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: c }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
