/**
 * SwotInfluenceNetwork — FODA Factor Interaction Network (Fase 2)
 * ===============================================================
 * Grafo causal: fortalezas mitigan amenazas, debilidades amplifican riesgos.
 * SVG interactivo con nodos pulsantes, arcos ponderados, panel lateral doctrinal.
 * Mirrors PorterForceNetwork aesthetic.
 */
"use client";
import { useState, useEffect } from 'react';

const Q = {
  strength:    { color: '#10b981', icon: '💪', short: 'F', label: 'Fortaleza' },
  weakness:    { color: '#ff4d6a', icon: '⚠️', short: 'D', label: 'Debilidad' },
  opportunity: { color: '#6366f1', icon: '🚀', short: 'O', label: 'Oportunidad' },
  threat:      { color: '#f59e0b', icon: '🔥', short: 'A', label: 'Amenaza' },
};

// Doctrinal relationship types
const LINK_TYPES = {
  mitigates:    { label: 'Mitiga',       color: '#10b981', dash: false, direction: 'strength→threat' },
  amplifies:    { label: 'Amplifica',    color: '#ff4d6a', dash: true,  direction: 'weakness→threat' },
  captures:     { label: 'Captura',      color: '#6366f1', dash: false, direction: 'strength→opportunity' },
  blocks:       { label: 'Bloquea',      color: '#f59e0b', dash: true,  direction: 'weakness→opportunity' },
};

// Build doctrinal links from top SWOT items
function buildLinks(swot) {
  const strengths    = swot.filter(s => s.quadrant === 'strength').sort((a,b) => (b.impact_score||3)-(a.impact_score||3)).slice(0,4);
  const weaknesses   = swot.filter(s => s.quadrant === 'weakness').sort((a,b) => (b.impact_score||3)-(a.impact_score||3)).slice(0,3);
  const opportunities= swot.filter(s => s.quadrant === 'opportunity').sort((a,b) => (b.impact_score||3)-(a.impact_score||3)).slice(0,3);
  const threats      = swot.filter(s => s.quadrant === 'threat').sort((a,b) => (b.impact_score||3)-(a.impact_score||3)).slice(0,3);

  const links = [];
  // Strengths → Threats (mitigates)
  strengths.forEach((s, i) => {
    const t = threats[i % threats.length];
    if (t) links.push({ from: s.id||`s-${i}`, to: t.id||`t-${i%threats.length}`, type: 'mitigates', weight: (s.impact_score||3)/5 });
  });
  // Weaknesses → Threats (amplifies)
  weaknesses.forEach((w, i) => {
    const t = threats[(i+1) % threats.length];
    if (t) links.push({ from: w.id||`w-${i}`, to: t.id||`t-${(i+1)%threats.length}`, type: 'amplifies', weight: (w.impact_score||3)/5 });
  });
  // Strengths → Opportunities (captures)
  strengths.slice(0,2).forEach((s, i) => {
    const o = opportunities[i % opportunities.length];
    if (o) links.push({ from: s.id||`s-${i}`, to: o.id||`o-${i%opportunities.length}`, type: 'captures', weight: 0.7 });
  });
  // Weaknesses → Opportunities (blocks)
  weaknesses.slice(0,2).forEach((w, i) => {
    const o = opportunities[(i+1) % opportunities.length];
    if (o) links.push({ from: w.id||`w-${i}`, to: o.id||`o-${(i+1)%opportunities.length}`, type: 'blocks', weight: 0.5 });
  });
  return links;
}

// Layout: 4 groups arranged in quadrants of a circle
function buildNodes(swot) {
  const CX = 250, CY = 200;
  const GROUPS = [
    { quadrant: 'strength',    cx: CX - 130, cy: CY - 100, startAngle: -150, spread: 60 },
    { quadrant: 'opportunity', cx: CX + 130, cy: CY - 100, startAngle: -30,  spread: 60 },
    { quadrant: 'weakness',    cx: CX - 130, cy: CY + 100, startAngle: 150,  spread: 60 },
    { quadrant: 'threat',      cx: CX + 130, cy: CY + 100, startAngle: 30,   spread: 60 },
  ];

  const nodes = [];
  GROUPS.forEach(g => {
    const items = swot.filter(s => s.quadrant === g.quadrant).slice(0, 4);
    const R = 48;
    items.forEach((item, i) => {
      const angle = (g.startAngle + (i - (items.length-1)/2) * (g.spread / Math.max(items.length-1,1))) * Math.PI / 180;
      const r = items.length > 1 ? R : 0;
      nodes.push({
        ...item,
        nid: item.id || `${g.quadrant}-${i}`,
        x: g.cx + r * Math.cos(angle),
        y: g.cy + r * Math.sin(angle),
        cfg: Q[g.quadrant],
        radius: 14 + (item.impact_score || 3) * 3,
      });
    });
  });
  return nodes;
}

export default function SwotInfluenceNetwork({ swot = [] }) {
  const [selected, setSelected] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulse(p => (p + 1) % 100), 60);
    return () => clearInterval(t);
  }, []);

  if (!swot.length) return (
    <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🕸️</div>
      <p>Genera el análisis FODA para activar la red de influencia.</p>
    </div>
  );

  const nodes = buildNodes(swot);
  const rawLinks = buildLinks(swot);
  const nodeMap = Object.fromEntries(nodes.map(n => [n.nid, n]));
  const links = rawLinks.map((l, i) => {
    const from = nodeMap[l.from], to = nodeMap[l.to];
    if (!from || !to) return null;
    return { ...l, idx: i, from, to };
  }).filter(Boolean);

  const sel = selected ? nodes.find(n => n.nid === selected) : null;
  const selLinks = sel ? links.filter(l => l.from.nid === selected || l.to.nid === selected) : [];

  const W = 500, H = 400;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🕸️</div>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>Red de Influencia FODA</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
            Factores internos y externos interactúan · Click en nodo para ver conexiones causales
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.65rem', color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
          {Object.entries(LINK_TYPES).map(([k, v]) => (
            <span key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke={v.color} strokeWidth="2" strokeDasharray={v.dash ? '4,2' : 'none'} /></svg>
              {v.label}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1rem', alignItems: 'start' }}>
        {/* SVG Graph */}
        <div className="glass-panel" style={{ padding: '1rem' }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block', overflow: 'visible' }}>
            <defs>
              {Object.entries(LINK_TYPES).map(([k, v]) => (
                <marker key={k} id={`arr-${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={v.color} fillOpacity="0.6" />
                </marker>
              ))}
              <filter id="glow-swot">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Quadrant labels */}
            {[
              { label: '💪 Fortalezas', x: 60, y: 22, color: '#10b981' },
              { label: '🚀 Oportunidades', x: 390, y: 22, color: '#6366f1' },
              { label: '⚠️ Debilidades', x: 60, y: H - 8, color: '#ff4d6a' },
              { label: '🔥 Amenazas', x: 390, y: H - 8, color: '#f59e0b' },
            ].map((lbl, i) => (
              <text key={i} x={lbl.x} y={lbl.y} textAnchor="middle" fill={lbl.color} fontSize="9.5" fontWeight="700" fillOpacity="0.7">{lbl.label}</text>
            ))}

            {/* Center org node */}
            <circle cx={W/2} cy={H/2} r={28} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
            <text x={W/2} y={H/2 - 4} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="9" fontWeight="800">ORG</text>
            <text x={W/2} y={H/2 + 9} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7.5">posición</text>

            {/* Links */}
            {links.map(l => {
              const lt = LINK_TYPES[l.type];
              const isHov = hoveredLink === l.idx;
              const dimmed = (selected && !selLinks.includes(l)) || (hoveredLink !== null && !isHov);
              return (
                <g key={l.idx}
                  onMouseEnter={() => setHoveredLink(l.idx)}
                  onMouseLeave={() => setHoveredLink(null)}
                  style={{ cursor: 'pointer' }}>
                  <line x1={l.from.x} y1={l.from.y} x2={l.to.x} y2={l.to.y}
                    stroke="transparent" strokeWidth="12" />
                  <line x1={l.from.x} y1={l.from.y} x2={l.to.x} y2={l.to.y}
                    stroke={lt.color}
                    strokeWidth={isHov ? l.weight * 5 + 2 : l.weight * 3 + 0.8}
                    strokeOpacity={dimmed ? 0.07 : isHov ? 0.9 : 0.4}
                    strokeDasharray={lt.dash ? '6,4' : 'none'}
                    markerEnd={`url(#arr-${l.type})`}
                    style={{ transition: 'all 0.2s' }} />
                  {isHov && (
                    <text x={(l.from.x + l.to.x)/2} y={(l.from.y + l.to.y)/2 - 6}
                      textAnchor="middle" fill={lt.color} fontSize="9" fontWeight="700">
                      {lt.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map(n => {
              const isSel = selected === n.nid;
              const dimmed = selected && !isSel && !selLinks.some(l => l.from.nid === n.nid || l.to.nid === n.nid);
              const pr = n.radius + 8 + (pulse % 50) * 0.2;
              const po = isSel ? Math.max(0, 0.35 - (pulse % 50) * 0.007) : 0;
              return (
                <g key={n.nid} onClick={() => setSelected(selected === n.nid ? null : n.nid)}
                  style={{ cursor: 'pointer', opacity: dimmed ? 0.18 : 1, transition: 'opacity 0.2s' }}>
                  <circle cx={n.x} cy={n.y} r={pr} fill="none" stroke={n.cfg.color} strokeWidth="1" strokeOpacity={po} />
                  <circle cx={n.x} cy={n.y} r={n.radius + 6} fill={`${n.cfg.color}08`} />
                  <circle cx={n.x} cy={n.y} r={n.radius}
                    fill={`${n.cfg.color}18`} stroke={n.cfg.color}
                    strokeWidth={isSel ? 2.5 : 1.5}
                    filter={isSel ? 'url(#glow-swot)' : undefined}
                    style={{ transition: 'all 0.2s' }} />
                  <text x={n.x} y={n.y - 3} textAnchor="middle" fill={n.cfg.color} fontSize="8.5" fontWeight="800">{n.cfg.short}</text>
                  <text x={n.x} y={n.y + 8} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="7.5">
                    {n.impact_score || 3}/5
                  </text>
                  {/* Truncated label below */}
                  <text x={n.x} y={n.y + n.radius + 13} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="6.5">
                    {(n.description || '').slice(0, 14)}{(n.description || '').length > 14 ? '…' : ''}
                  </text>
                </g>
              );
            })}
          </svg>
          <div style={{ textAlign: 'center', fontSize: '0.62rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
            Tamaño = Impacto · Click en nodo · Hover en enlace
          </div>
        </div>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sel ? (
            <div className="glass-panel animate-fade-in" style={{ padding: '1rem', borderLeft: `3px solid ${sel.cfg.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: sel.cfg.color }}>
                    {sel.cfg.icon} {sel.cfg.label}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>
                    Impacto: {sel.impact_score || 3}/5
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                {sel.description}
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Relaciones ({selLinks.length})
              </div>
              {selLinks.map((l, i) => {
                const isOut = l.from.nid === selected;
                const other = isOut ? l.to : l.from;
                const lt = LINK_TYPES[l.type];
                return (
                  <div key={i} style={{ padding: '0.45rem 0.6rem', borderRadius: 8, marginBottom: '0.3rem', background: `${lt.color}0a`, border: `1px solid ${lt.color}25` }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: lt.color, marginBottom: '0.1rem' }}>
                      {isOut ? '→' : '←'} {other.cfg.icon} {lt.label}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', lineHeight: 1.3 }}>
                      {other.description?.slice(0, 55)}{(other.description || '').length > 55 ? '…' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : hoveredLink !== null && links[hoveredLink] ? (
            <div className="glass-panel animate-fade-in" style={{ padding: '1rem', borderLeft: `3px solid ${LINK_TYPES[links[hoveredLink].type]?.color}` }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: LINK_TYPES[links[hoveredLink].type]?.color, marginBottom: '0.35rem' }}>
                {LINK_TYPES[links[hoveredLink].type]?.label}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                {links[hoveredLink].from.description?.slice(0,50)}…
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>→ {links[hoveredLink].to.description?.slice(0,50)}…</div>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.6rem' }}>Nodos del Sistema</div>
              {['strength','weakness','opportunity','threat'].map(q => {
                const items = swot.filter(s => s.quadrant === q);
                const cfg = Q[q];
                return (
                  <div key={q} style={{ marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.65rem', color: cfg.color, fontWeight: 700, marginBottom: '0.2rem' }}>{cfg.icon} {cfg.label} ({items.length})</div>
                    {items.slice(0,3).map((it, i) => (
                      <div key={i} onClick={() => setSelected(it.id || `${q}-${i}`)} style={{ fontSize: '0.67rem', color: 'var(--text-tertiary)', padding: '0.2rem 0.4rem', borderRadius: 5, cursor: 'pointer', marginBottom: '0.15rem', background: 'rgba(255,255,255,0.02)' }}>
                        {(it.description || '').slice(0, 45)}{(it.description || '').length > 45 ? '…' : ''}
                      </div>
                    ))}
                  </div>
                );
              })}
              <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', marginTop: '0.4rem', textAlign: 'center' }}>{links.length} relaciones causales · {nodes.length} nodos</div>
            </div>
          )}

          {/* Insight */}
          <div className="glass-panel" style={{ padding: '0.85rem' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>🧠 Insight Sistémico</div>
            {(() => {
              const topStr = swot.filter(s => s.quadrant === 'strength').sort((a,b)=>(b.impact_score||3)-(a.impact_score||3))[0];
              const topThr = swot.filter(s => s.quadrant === 'threat').sort((a,b)=>(b.impact_score||3)-(a.impact_score||3))[0];
              if (!topStr || !topThr) return <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Genera el FODA para ver insights.</div>;
              return <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong style={{ color: '#10b981' }}>"{topStr.description?.slice(0,35)}…"</strong> es tu principal escudo frente a <strong style={{ color: '#f59e0b' }}>"{topThr.description?.slice(0,35)}…"</strong>. Capitaliza esta capacidad defensiva.
              </div>;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
