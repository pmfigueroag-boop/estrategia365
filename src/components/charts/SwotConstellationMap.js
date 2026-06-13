/**
 * SwotConstellationMap — SWOT Cosmos / Gravitational Map (Fase 2)
 * ===============================================================
 * Factores FODA como nodos orbitando la organización central.
 * Fortalezas = órbita interna estable.
 * Oportunidades = atraen expansión (exterior).
 * Debilidades = órbita interna inestable.
 * Amenazas = presionan desde el exterior.
 * Animación orbital + pulso + tamaño por impacto.
 */
"use client";
import { useState, useEffect } from 'react';

const Q = {
  strength:    { color: '#10b981', icon: '💪', label: 'Fortaleza',   ring: 0.38, layer: 'inner' },
  weakness:    { color: '#ff4d6a', icon: '⚠️', label: 'Debilidad',   ring: 0.52, layer: 'inner' },
  opportunity: { color: '#6366f1', icon: '🚀', label: 'Oportunidad', ring: 0.72, layer: 'outer' },
  threat:      { color: '#f59e0b', icon: '🔥', label: 'Amenaza',     ring: 0.85, layer: 'outer' },
};

// Distribute items evenly on their ring
function placeNodes(swot, CX, CY, R) {
  const groups = { strength: [], weakness: [], opportunity: [], threat: [] };
  swot.forEach(s => { if (groups[s.quadrant]) groups[s.quadrant].push(s); });
  const nodes = [];
  Object.entries(groups).forEach(([q, items]) => {
    const cfg = Q[q];
    const ring = cfg.ring * R;
    const offset = q === 'strength' ? 0 : q === 'weakness' ? Math.PI / items.length : q === 'opportunity' ? 0.3 : 0.6;
    items.forEach((item, i) => {
      const angle = offset + (i / items.length) * 2 * Math.PI;
      nodes.push({
        ...item,
        nid: item.id || `${q}-${i}`,
        angle,
        ring,
        x: CX + ring * Math.cos(angle),
        y: CY + ring * Math.sin(angle),
        cfg,
        radius: 10 + (item.impact_score || 3) * 3.5,
        speed: q === 'strength' ? 0.0003 : q === 'weakness' ? 0.0004 : q === 'opportunity' ? 0.0002 : 0.00015,
      });
    });
  });
  return nodes;
}

export default function SwotConstellationMap({ swot = [] }) {
  const [time, setTime] = useState(0);
  const [selected, setSelected] = useState(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setTime(t => t + 1), 40);
    return () => clearInterval(t);
  }, [paused]);

  if (!swot.length) return (
    <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌌</div>
      <p>Genera el análisis FODA para ver el mapa de constelación.</p>
    </div>
  );

  const W = 520, H = 520;
  const CX = W / 2, CY = H / 2, R = 220;

  const baseNodes = placeNodes(swot, CX, CY, R);
  // Animate angles
  const nodes = baseNodes.map(n => {
    const angle = n.angle + n.speed * time;
    return { ...n, ax: CX + n.ring * Math.cos(angle), ay: CY + n.ring * Math.sin(angle) };
  });

  const sel = selected ? nodes.find(n => n.nid === selected) : null;
  const nodeMap = Object.fromEntries(nodes.map(n => [n.nid, n]));

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Header */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🌌</div>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>SWOT Constellation Map</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
            Sistema gravitacional estratégico · Órbita interna = capacidades · Exterior = entorno
          </div>
        </div>
        <button onClick={() => setPaused(!paused)} style={{
          padding: '0.3rem 0.7rem', borderRadius: 8, fontSize: '0.7rem', cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)',
          color: 'var(--text-secondary)',
        }}>
          {paused ? '▶ Reanudar' : '⏸ Pausar'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '1rem', alignItems: 'start' }}>
        {/* Cosmos SVG */}
        <div className="glass-panel" style={{ padding: '1rem', background: 'linear-gradient(135deg, rgba(2,4,16,0.97), rgba(6,8,24,0.95))' }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
            <defs>
              <radialGradient id="cosmosBg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(99,102,241,0.06)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </radialGradient>
              <filter id="cosmosGlow">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="orbGlow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Background cosmos */}
            <circle cx={CX} cy={CY} r={R * 1.05} fill="url(#cosmosBg)" />

            {/* Orbital rings */}
            {Object.entries(Q).map(([q, cfg]) => (
              <circle key={q} cx={CX} cy={CY} r={cfg.ring * R}
                fill="none" stroke={cfg.color} strokeWidth="0.5" strokeOpacity="0.1"
                strokeDasharray={cfg.layer === 'inner' ? 'none' : '8,6'} />
            ))}

            {/* Ring labels */}
            {Object.entries(Q).map(([q, cfg]) => (
              <text key={q} x={CX + cfg.ring * R + 5} y={CY - 4}
                fill={cfg.color} fontSize="7.5" fontOpacity="0.4" fillOpacity="0.35">{cfg.label}s</text>
            ))}

            {/* Connection lines from selected to org center */}
            {sel && (
              <line x1={CX} y1={CY} x2={sel.ax} y2={sel.ay}
                stroke={sel.cfg.color} strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="5,4" />
            )}

            {/* Central org node */}
            <circle cx={CX} cy={CY} r={36} fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.2)" strokeWidth="2" />
            <circle cx={CX} cy={CY} r={28} fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.35)" strokeWidth="1.5"
              filter="url(#cosmosGlow)" />
            <text x={CX} y={CY - 5} textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="10" fontWeight="900">ORG</text>
            <text x={CX} y={CY + 9} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7.5">posición</text>

            {/* Stars (decorative) */}
            {Array.from({ length: 35 }, (_, i) => {
              const hash = (i * 2731 + 1999) % (W * H);
              const sx = (hash % W * 0.9) + W * 0.05;
              const sy = (Math.floor(hash / W) % (H * 0.9)) + H * 0.05;
              const dist = Math.sqrt((sx - CX) ** 2 + (sy - CY) ** 2);
              if (dist < R * 0.25 || dist > R * 1.1) return null;
              return <circle key={i} cx={sx} cy={sy} r={(i % 3 === 0 ? 1.2 : 0.7)} fill="rgba(255,255,255,0.15)" />;
            })}

            {/* Factor nodes */}
            {nodes.map(n => {
              const isSel = selected === n.nid;
              const dimmed = selected && !isSel;
              return (
                <g key={n.nid} onClick={() => setSelected(isSel ? null : n.nid)}
                  style={{ cursor: 'pointer', opacity: dimmed ? 0.2 : 1, transition: 'opacity 0.3s' }}>
                  {/* Glow ring */}
                  {(isSel || n.cfg.layer === 'outer') && (
                    <circle cx={n.ax} cy={n.ay} r={n.radius + 7}
                      fill="none" stroke={n.cfg.color} strokeWidth="0.8" strokeOpacity={isSel ? 0.5 : 0.12} />
                  )}
                  <circle cx={n.ax} cy={n.ay} r={n.radius}
                    fill={`${n.cfg.color}20`} stroke={n.cfg.color}
                    strokeWidth={isSel ? 2.5 : 1.5} strokeOpacity={isSel ? 1 : 0.7}
                    filter={isSel ? 'url(#orbGlow)' : undefined} />
                  <text x={n.ax} y={n.ay - 2} textAnchor="middle" dominantBaseline="middle"
                    fill={n.cfg.color} fontSize={n.radius > 17 ? 10 : 8.5} fontWeight="800">{n.cfg.short}</text>
                  <text x={n.ax} y={n.ay + n.radius + 12} textAnchor="middle"
                    fill="rgba(255,255,255,0.2)" fontSize="6.5">
                    {(n.description || '').slice(0, 12)}{(n.description || '').length > 12 ? '…' : ''}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sel ? (
            <div className="glass-panel animate-fade-in" style={{ padding: '1rem', borderLeft: `3px solid ${sel.cfg.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: sel.cfg.color }}>{sel.cfg.icon} {sel.cfg.label}</div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.6rem' }}>{sel.description}</div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span style={{ padding: '0.2rem 0.5rem', borderRadius: 6, background: `${sel.cfg.color}18`, color: sel.cfg.color, fontSize: '0.65rem', fontWeight: 700 }}>
                  Impacto: {sel.impact_score || 3}/5
                </span>
                <span style={{ padding: '0.2rem 0.5rem', borderRadius: 6, background: 'rgba(255,255,255,0.05)', color: 'var(--text-tertiary)', fontSize: '0.65rem' }}>
                  {sel.cfg.layer === 'inner' ? '🏠 Factor interno' : '🌐 Factor externo'}
                </span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.5, padding: '0.5rem', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: `1px solid ${sel.cfg.color}22` }}>
                {sel.quadrant === 'strength' ? '⚡ Órbita interna estabilizadora. Refuerza el centro gravitacional de la organización.' :
                 sel.quadrant === 'weakness' ? '⚠️ Órbita interna inestable. Erosiona la capacidad de respuesta ante amenazas externas.' :
                 sel.quadrant === 'opportunity' ? '🎯 Fuerza de atracción exterior. Expande el perímetro estratégico si se captura.' :
                 '🔴 Presión exterior. Comprime el espacio estratégico disponible. Requiere escudo defensivo.'}
              </div>
              {sel.source_signal && (
                <div style={{ fontSize: '0.65rem', color: '#6366f1', marginTop: '0.4rem' }}>📌 {sel.source_signal}</div>
              )}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.6rem' }}>Doctrina Gravitacional</div>
              {[
                { color: '#10b981', icon: '💪', label: 'Fortalezas', desc: 'Órbita interna estabilizadora — sostienen el centro', ring: 'Aro 1' },
                { color: '#ff4d6a', icon: '⚠️', label: 'Debilidades', desc: 'Órbita interna inestable — vulnerabilidades propias', ring: 'Aro 2' },
                { color: '#6366f1', icon: '🚀', label: 'Oportunidades', desc: 'Campo exterior de atracción — expansión posible', ring: 'Aro 3' },
                { color: '#f59e0b', icon: '🔥', label: 'Amenazas', desc: 'Presión exterior — comprime el espacio estratégico', ring: 'Aro 4' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${r.color}18`, border: `1.5px solid ${r.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.85rem' }}>{r.icon}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: r.color, fontWeight: 700 }}>{r.label} <span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}>· {r.ring}</span></div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', lineHeight: 1.3 }}>{r.desc}</div>
                  </div>
                </div>
              ))}
              <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', padding: '0.5rem', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', lineHeight: 1.5 }}>
                Tamaño del nodo = impacto estratégico · Velocidad orbital = urgencia
              </div>
            </div>
          )}

          {/* Counter */}
          <div className="glass-panel" style={{ padding: '0.85rem', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.5rem' }}>
            {Object.entries(Q).map(([q, cfg]) => {
              const count = swot.filter(s => s.quadrant === q).length;
              return (
                <div key={q} style={{ textAlign: 'center', padding: '0.5rem', borderRadius: 8, background: `${cfg.color}08`, border: `1px solid ${cfg.color}22` }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: cfg.color }}>{count}</div>
                  <div style={{ fontSize: '0.58rem', color: 'var(--text-tertiary)' }}>{cfg.icon} {cfg.label.slice(0, 7)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
