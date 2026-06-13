/**
 * VrioFortressMap — Strategic Moat / Fortress Visualization (Fase 1)
 * ==================================================================
 * Anillos concéntricos: cada anillo = nivel de dominancia VRIO.
 * Core (centro) = V+R+I+O = Ventaja Sostenida.
 * Outer rings = menos criterios = menor fortaleza.
 * Recursos como nodos en su anillo correspondiente.
 * Moat Strength KPI. Click para detalle.
 */
"use client";
import { useState, useEffect } from 'react';

const IMPLICATIONS = {
  sustained_advantage: { label: 'Ventaja Sostenida',    color: '#10b981', ring: 0, icon: '🏆', criteria: 4 },
  unused_advantage:    { label: 'No Explotada',         color: '#a855f7', ring: 1, icon: '🔓', criteria: 3 },
  temporary_advantage: { label: 'Ventaja Temporal',     color: '#6366f1', ring: 2, icon: '⏳', criteria: 2 },
  parity:              { label: 'Paridad',              color: '#f59e0b', ring: 3, icon: '⚖️', criteria: 1 },
  disadvantage:        { label: 'Desventaja',           color: '#ff4d6a', ring: 4, icon: '⚠️', criteria: 0 },
};

const RING_RADII = [48, 85, 122, 155, 182];

function criteriaCount(r) {
  return [r.valuable, r.rare, r.costly_to_imitate, r.organized].filter(Boolean).length;
}

function distributeOnRing(items, cx, cy, radius) {
  return items.map((item, i) => {
    const angle = (i / items.length) * 2 * Math.PI - Math.PI / 2;
    return { ...item, x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  });
}

export default function VrioFortressMap({ resources = [] }) {
  const [selected, setSelected] = useState(null);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulse(p => (p + 1) % 100), 60);
    return () => clearInterval(t);
  }, []);

  if (!resources.length) return null;

  const W = 420, H = 420, CX = W / 2, CY = H / 2;

  const grouped = {};
  Object.keys(IMPLICATIONS).forEach(k => { grouped[k] = []; });
  resources.forEach(r => {
    const key = r.competitive_implication || 'parity';
    if (grouped[key]) grouped[key].push(r);
  });

  const allNodes = [];
  Object.entries(IMPLICATIONS).forEach(([implKey, impl]) => {
    const items = grouped[implKey] || [];
    const radius = RING_RADII[impl.ring];
    const placed = distributeOnRing(items, CX, CY, radius);
    placed.forEach(n => allNodes.push({ ...n, implKey, impl }));
  });

  const sel = selected ? allNodes.find(n => (n.id || n.resource_name) === selected) : null;
  const innerCount = (grouped.sustained_advantage?.length || 0) + (grouped.unused_advantage?.length || 0);
  const moatStrength = resources.length > 0 ? Math.round((innerCount / resources.length) * 100) : 0;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏰</div>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>Strategic Fortress Map</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
            El núcleo es lo que ningún rival puede copiar · Barney (1991) + Buffett Moat Thinking · Click en recurso
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '0.6rem 1rem', borderRadius: 10, background: moatStrength >= 50 ? 'rgba(16,185,129,0.1)' : moatStrength >= 25 ? 'rgba(245,158,11,0.1)' : 'rgba(255,77,106,0.1)', border: `1px solid ${moatStrength >= 50 ? '#10b981' : moatStrength >= 25 ? '#f59e0b' : '#ff4d6a'}33` }}>
          <div style={{ fontSize: '0.58rem', color: 'var(--text-tertiary)', marginBottom: '0.1rem' }}>MOAT STRENGTH</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: moatStrength >= 50 ? '#10b981' : moatStrength >= 25 ? '#f59e0b' : '#ff4d6a', lineHeight: 1 }}>{moatStrength}%</div>
          <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>{innerCount}/{resources.length} en núcleo</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '1rem', alignItems: 'start' }}>
        <div className="glass-panel" style={{ padding: '1rem', background: 'linear-gradient(135deg, rgba(2,4,16,0.97), rgba(6,8,24,0.95))' }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
            <defs>
              <radialGradient id="fortressCoreGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(16,185,129,0.2)" />
                <stop offset="100%" stopColor="rgba(16,185,129,0)" />
              </radialGradient>
              <filter id="fortNodeGlow"><feGaussianBlur stdDeviation="3.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>

            {/* Rings outer→inner */}
            {[...Object.entries(IMPLICATIONS)].reverse().map(([k, impl]) => (
              <circle key={k} cx={CX} cy={CY} r={RING_RADII[impl.ring] + 14}
                fill={impl.ring === 0 ? 'url(#fortressCoreGrad)' : 'rgba(255,255,255,0.012)'}
                stroke={impl.color} strokeWidth={impl.ring === 0 ? 1.5 : 0.6}
                strokeOpacity={impl.ring === 0 ? 0.45 : 0.12}
                strokeDasharray={impl.ring >= 3 ? '6,5' : impl.ring === 2 ? '4,4' : 'none'} />
            ))}

            {/* Pulse on core */}
            <circle cx={CX} cy={CY} r={RING_RADII[0] + 14 + (pulse % 50) * 0.35}
              fill="none" stroke="#10b981" strokeWidth="1"
              strokeOpacity={Math.max(0, 0.3 - (pulse % 50) * 0.006)} />

            {/* Ring labels */}
            {Object.entries(IMPLICATIONS).map(([k, impl]) => (
              <text key={k} x={CX} y={CY - RING_RADII[impl.ring] - 17}
                textAnchor="middle" fill={impl.color} fontSize={impl.ring === 0 ? 9.5 : 8}
                fontWeight={impl.ring === 0 ? 800 : 600} fillOpacity="0.5">
                {impl.icon} {impl.label}
              </text>
            ))}

            {/* Resource nodes */}
            {allNodes.map((n, i) => {
              const isSel = selected === (n.id || n.resource_name);
              const dimmed = selected && !isSel;
              const nodeR = 10 + criteriaCount(n) * 2.5;
              return (
                <g key={i} onClick={() => setSelected(isSel ? null : (n.id || n.resource_name))}
                  style={{ cursor: 'pointer', opacity: dimmed ? 0.18 : 1, transition: 'opacity 0.2s' }}>
                  {isSel && <circle cx={n.x} cy={n.y} r={nodeR + 8} fill="none" stroke={n.impl.color} strokeWidth="1.5" strokeOpacity="0.45" />}
                  <circle cx={n.x} cy={n.y} r={nodeR}
                    fill={`${n.impl.color}22`} stroke={n.impl.color} strokeWidth={isSel ? 2.5 : 1.5}
                    filter={n.impl.ring === 0 ? 'url(#fortNodeGlow)' : undefined} />
                  <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle"
                    fill={n.impl.color} fontSize="7.5" fontWeight="800">
                    {(n.resource_name || '').slice(0, 3).toUpperCase()}
                  </text>
                </g>
              );
            })}

            {/* Center */}
            <circle cx={CX} cy={CY} r={20} fill="rgba(16,185,129,0.15)" stroke="rgba(16,185,129,0.4)" strokeWidth="1.5" />
            <text x={CX} y={CY + 1} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.7)" fontSize="8.5" fontWeight="900">CORE</text>
          </svg>
          <div style={{ textAlign: 'center', fontSize: '0.62rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
            Tamaño = criterios cumplidos · Núcleo = Ventaja Sostenida · Exterior = Desventaja
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sel ? (
            <div className="glass-panel animate-fade-in" style={{ padding: '1rem', borderLeft: `3px solid ${sel.impl.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: sel.impl.color }}>{sel.impl.icon} {sel.resource_name}</span>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                {[{ k: 'valuable', l: 'V', c: '#10b981' }, { k: 'rare', l: 'R', c: '#6366f1' }, { k: 'costly_to_imitate', l: 'I', c: '#f59e0b' }, { k: 'organized', l: 'O', c: '#a855f7' }].map(d => (
                  <div key={d.k} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.45rem', borderRadius: 6, background: sel[d.k] ? `${d.c}18` : 'rgba(255,77,106,0.1)', border: `1px solid ${sel[d.k] ? d.c + '44' : '#ff4d6a33'}` }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: sel[d.k] ? d.c : '#ff4d6a' }}>{d.l}</span>
                    <span style={{ fontSize: '0.72rem' }}>{sel[d.k] ? '✓' : '✗'}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: '0.35rem 0.55rem', borderRadius: 7, background: `${sel.impl.color}10`, border: `1px solid ${sel.impl.color}30`, marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: sel.impl.color }}>{sel.impl.icon} {sel.impl.label}</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.4rem' }}>{sel.description}</div>
              {sel.recommendation && (
                <div style={{ fontSize: '0.68rem', color: '#6366f1', lineHeight: 1.4, padding: '0.4rem 0.5rem', borderRadius: 7, background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  📌 {sel.recommendation}
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.6rem' }}>Distribución del Foso</div>
              {Object.entries(IMPLICATIONS).map(([key, impl]) => {
                const count = grouped[key]?.length || 0;
                const pct = resources.length > 0 ? Math.round((count / resources.length) * 100) : 0;
                return (
                  <div key={key} style={{ marginBottom: '0.45rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.67rem', marginBottom: '0.18rem' }}>
                      <span style={{ color: impl.color }}>{impl.icon} {impl.label}</span>
                      <span style={{ color: 'var(--text-tertiary)' }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: impl.color, borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="glass-panel" style={{ padding: '0.85rem' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>🏰 Doctrina del Foso</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Un foso competitivo real existe cuando los rivales no pueden copiar, comprar ni sustituir tus capacidades. Solo los recursos en el núcleo (4/4 VRIO) crean rentas económicas superiores sostenibles.
            </div>
            <div style={{ fontSize: '0.65rem', marginTop: '0.4rem', fontWeight: 700, color: moatStrength >= 50 ? '#10b981' : moatStrength >= 25 ? '#f59e0b' : '#ff4d6a' }}>
              {moatStrength >= 50 ? '✅ Foso sólido — posición defensible' : moatStrength >= 25 ? '⚠️ Foso parcial — consolidar' : '🔴 Foso débil — riesgo de erosión'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
