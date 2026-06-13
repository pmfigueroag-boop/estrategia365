/**
 * PorterForceNetwork — Strategic Systems Thinking Engine
 * ======================================================
 * Weighted causal influence network. Forces are NOT independent.
 * Every link has a doctrine, a weight, and a directionality.
 * Hover any node or link to see the causal chain.
 * Visual: Bloomberg Terminal meets Palantir Intelligence Graph.
 */
"use client";
import { useState, useEffect, useRef } from 'react';

const FORCE_CONFIG = {
  rivalry:        { label: 'Rivalidad',          short: 'RIV', color: '#ff4d6a', x: 300, y: 90,  desc: 'Intensidad de la competencia entre rivales existentes' },
  new_entrants:   { label: 'Nuevos Entrantes',   short: 'NE',  color: '#a855f7', x: 510, y: 210, desc: 'Amenaza de que nuevos jugadores entren al mercado' },
  substitutes:    { label: 'Sustitutos',         short: 'SUS', color: '#f59e0b', x: 440, y: 390, desc: 'Amenaza de productos o servicios alternativos' },
  buyer_power:    { label: 'Poder Comprador',    short: 'PC',  color: '#3b82f6', x: 160, y: 390, desc: 'Capacidad de los clientes de presionar precios y condiciones' },
  supplier_power: { label: 'Poder Proveedor',   short: 'PP',  color: '#10b981', x: 90,  y: 210, desc: 'Capacidad de los proveedores de dictar condiciones' },
};

const CAUSAL_LINKS = [
  {
    from: 'new_entrants', to: 'rivalry', weight: 0.82, type: 'amplifies',
    label: 'Nuevos jugadores intensifican la rivalidad',
    doctrine: 'Disruptores aumentan la presión competitiva directa',
    impact: 'alto',
  },
  {
    from: 'substitutes', to: 'buyer_power', weight: 0.65, type: 'amplifies',
    label: 'Sustitutos fortalecen la posición del comprador',
    doctrine: 'Más alternativas = mayor poder de negociación del cliente',
    impact: 'medio',
  },
  {
    from: 'buyer_power', to: 'rivalry', weight: 0.72, type: 'amplifies',
    label: 'Compradores fuertes presionan a los rivales',
    doctrine: 'Clientes con poder exigen diferenciación o precios menores',
    impact: 'alto',
  },
  {
    from: 'supplier_power', to: 'rivalry', weight: 0.45, type: 'amplifies',
    label: 'Proveedores fuertes comprimen márgenes sectoriales',
    doctrine: 'Costos más altos obligan a competir más agresivamente',
    impact: 'medio',
  },
  {
    from: 'substitutes', to: 'rivalry', weight: 0.55, type: 'amplifies',
    label: 'Sustitutos amplían el campo de batalla competitivo',
    doctrine: 'La rivalidad crece cuando los límites del mercado se difuminan',
    impact: 'medio',
  },
  {
    from: 'rivalry', to: 'new_entrants', weight: 0.35, type: 'dampens',
    label: 'Alta rivalidad desincentiva la entrada',
    doctrine: 'Mercados muy competidos son menos atractivos para nuevos actores',
    impact: 'bajo',
  },
  {
    from: 'new_entrants', to: 'substitutes', weight: 0.38, type: 'amplifies',
    label: 'Disruptores suelen traer modelos de negocio sustitutos',
    doctrine: 'Nuevos entrantes frecuentemente innovan el modelo, no solo el precio',
    impact: 'bajo',
  },
  {
    from: 'supplier_power', to: 'buyer_power', weight: 0.28, type: 'dampens',
    label: 'Proveedores fuertes limitan opciones del comprador',
    doctrine: 'Concentración upstream reduce el leverage downstream',
    impact: 'bajo',
  },
];

const IMPACT_COLOR = { alto: '#ff4d6a', medio: '#f59e0b', bajo: '#10b981' };

function getEdgePoints(from, to, fromR, toR) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / len, uy = dy / len;
  return {
    x1: from.x + ux * fromR,
    y1: from.y + uy * fromR,
    x2: to.x - ux * toR,
    y2: to.y - uy * toR,
    mx: (from.x + to.x) / 2 + (-uy * 40),
    my: (from.y + to.y) / 2 + (ux * 40),
  };
}

export default function PorterForceNetwork({ heatMap = [], forces = [] }) {
  const [hoveredLink, setHoveredLink] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [pulse, setPulse] = useState(0);

  // Animate pulse rings
  useEffect(() => {
    const t = setInterval(() => setPulse(p => (p + 1) % 100), 50);
    return () => clearInterval(t);
  }, []);

  const W = 600, H = 490;

  // Build CPS map from forces data
  const cpsMap = {};
  forces.forEach(f => {
    const key = f.force_name || f.force || '';
    cpsMap[key] = f.competitive_pressure_score || (f.score || 3) * 20;
  });

  const nodes = Object.entries(FORCE_CONFIG).map(([key, cfg]) => {
    const cps = cpsMap[key] || 50;
    const radius = 26 + (cps / 100) * 16;
    const isSelected = selectedNode === key;
    const isHovered = hoveredNode === key;
    // Check if this node is involved in hovered link
    const inHoveredLink = hoveredLink !== null && (
      CAUSAL_LINKS[hoveredLink]?.from === key || CAUSAL_LINKS[hoveredLink]?.to === key
    );
    return { key, ...cfg, cps: Math.round(cps), radius, isSelected, isHovered, inHoveredLink };
  });

  const nodeMap = Object.fromEntries(nodes.map(n => [n.key, n]));

  const links = CAUSAL_LINKS.map((link, i) => {
    const fromN = nodeMap[link.from];
    const toN = nodeMap[link.to];
    if (!fromN || !toN) return null;

    const heatCell = heatMap.find(h =>
      (h.row === link.from && h.col === link.to) || (h.row === link.to && h.col === link.from)
    );
    const w = heatCell ? (heatCell.interaction_score || 3) / 5 : link.weight;
    const pts = getEdgePoints(fromN, toN, fromN.radius, toN.radius);
    const isAmplify = link.type === 'amplifies';
    const strokeColor = isAmplify ? '#ff4d6a' : '#10b981';
    const isHov = hoveredLink === i;
    const involvedInSelected = selectedNode && (link.from === selectedNode || link.to === selectedNode);

    return {
      ...link, idx: i, pts, w,
      strokeColor,
      strokeWidth: isHov ? w * 5 + 2 : w * 4 + 1,
      opacity: selectedNode
        ? involvedInSelected ? 0.9 : 0.1
        : hoveredLink !== null
          ? isHov ? 0.95 : 0.12
          : 0.35 + w * 0.4,
    };
  }).filter(Boolean);

  // Node panel: links for selected node
  const selectedLinks = selectedNode
    ? links.filter(l => l.from === selectedNode || l.to === selectedNode)
    : [];

  const activeLink = hoveredLink !== null ? links[hoveredLink] : null;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
            }}>🕸️</div>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>Red de Interacción Causal</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
            Las 5 fuerzas NO son independientes · Strategic Systems Thinking Engine · Porter (2008)
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <svg width="24" height="6"><line x1="0" y1="3" x2="18" y2="3" stroke="#ff4d6a" strokeWidth="2"/><polygon points="18,0.5 24,3 18,5.5" fill="#ff4d6a"/></svg>
            Amplifica
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <svg width="24" height="6"><line x1="0" y1="3" x2="18" y2="3" stroke="#10b981" strokeWidth="2" strokeDasharray="4,2"/><polygon points="18,0.5 24,3 18,5.5" fill="#10b981"/></svg>
            Amortigua
          </span>
          <span>○ Tamaño = CPS</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1rem', alignItems: 'start' }}>

        {/* SVG Graph */}
        <div className="glass-panel" style={{ padding: '1rem', overflow: 'hidden' }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
            <defs>
              <marker id="arrowAmp" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#ff4d6a" />
              </marker>
              <marker id="arrowDamp" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
              </marker>
              {nodes.map(n => (
                <radialGradient key={n.key} id={`grd-${n.key}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={n.color} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={n.color} stopOpacity="0.05" />
                </radialGradient>
              ))}
              <filter id="glow">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Background grid */}
            {Array.from({ length: 6 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 80 + 40} x2={W} y2={i * 80 + 40}
                stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
            ))}

            {/* Links */}
            {links.map((link) => {
              const { pts, idx } = link;
              const isHov = hoveredLink === idx;
              return (
                <g key={idx}
                  onMouseEnter={() => setHoveredLink(idx)}
                  onMouseLeave={() => setHoveredLink(null)}
                  style={{ cursor: 'pointer' }}>
                  {/* Hit area */}
                  <path
                    d={`M ${pts.x1} ${pts.y1} Q ${pts.mx} ${pts.my} ${pts.x2} ${pts.y2}`}
                    fill="none" stroke="transparent" strokeWidth="16" />
                  {/* Visual */}
                  <path
                    d={`M ${pts.x1} ${pts.y1} Q ${pts.mx} ${pts.my} ${pts.x2} ${pts.y2}`}
                    fill="none"
                    stroke={link.strokeColor}
                    strokeWidth={link.strokeWidth}
                    strokeOpacity={link.opacity}
                    strokeDasharray={link.type === 'dampens' ? '7,5' : 'none'}
                    markerEnd={link.type === 'amplifies' ? 'url(#arrowAmp)' : 'url(#arrowDamp)'}
                    style={{ transition: 'stroke-opacity 0.2s, stroke-width 0.2s' }}
                  />
                  {/* Weight badge on hover */}
                  {isHov && (
                    <g>
                      <rect x={pts.mx - 36} y={pts.my - 13} width="72" height="22"
                        rx="5" fill="rgba(10,15,26,0.95)"
                        stroke={link.strokeColor} strokeOpacity="0.5" strokeWidth="1" />
                      <text x={pts.mx} y={pts.my + 2}
                        textAnchor="middle" fill={link.strokeColor}
                        fontSize="8.5" fontWeight="700">
                        {link.type === 'amplifies' ? '↑' : '↓'} {Math.round(link.w * 100)}%
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map(n => {
              const isActive = n.isSelected || n.inHoveredLink;
              const dimmed = (selectedNode && !n.isSelected && !n.inHoveredLink) ||
                (hoveredLink !== null && !n.inHoveredLink);

              // Pulse animation
              const pulseR = n.radius + 8 + (pulse % 50) * 0.3;
              const pulseOp = isActive ? Math.max(0, 0.25 - (pulse % 50) * 0.005) : 0;

              return (
                <g key={n.key}
                  onClick={() => setSelectedNode(selectedNode === n.key ? null : n.key)}
                  onMouseEnter={() => setHoveredNode(n.key)}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{ cursor: 'pointer', opacity: dimmed ? 0.25 : 1, transition: 'opacity 0.2s' }}>

                  {/* Pulse ring */}
                  <circle cx={n.x} cy={n.y} r={pulseR}
                    fill="none" stroke={n.color} strokeWidth="1.5"
                    strokeOpacity={pulseOp} />

                  {/* Glow halo */}
                  <circle cx={n.x} cy={n.y} r={n.radius + 14}
                    fill={`url(#grd-${n.key})`}
                    style={{ transition: 'all 0.2s' }} />

                  {/* Main circle */}
                  <circle cx={n.x} cy={n.y} r={n.radius}
                    fill={`${n.color}18`}
                    stroke={n.color}
                    strokeWidth={n.isSelected ? 3 : n.isHovered ? 2.5 : 1.8}
                    filter={n.isSelected || n.isHovered ? 'url(#glow)' : undefined}
                    style={{ transition: 'all 0.2s' }} />

                  {/* CPS ring arc */}
                  <circle cx={n.x} cy={n.y} r={n.radius - 5}
                    fill="none" stroke={n.color} strokeWidth="2.5"
                    strokeOpacity="0.4"
                    strokeDasharray={`${(n.cps / 100) * 2 * Math.PI * (n.radius - 5)} ${2 * Math.PI * (n.radius - 5)}`}
                    transform={`rotate(-90 ${n.x} ${n.y})`} />

                  {/* Labels */}
                  <text x={n.x} y={n.y - 5} textAnchor="middle"
                    fill={n.color} fontSize="10" fontWeight="900">{n.short}</text>
                  <text x={n.x} y={n.y + 8} textAnchor="middle"
                    fill="var(--text-secondary)" fontSize="8.5" fontWeight="600">{n.cps}%</text>
                  <text x={n.x} y={n.y + n.radius + 18} textAnchor="middle"
                    fill="var(--text-tertiary)" fontSize="8.5">{n.label}</text>
                </g>
              );
            })}
          </svg>
          <div style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
            Click en un nodo para ver sus relaciones · Hover en un enlace para ver el peso causal
          </div>
        </div>

        {/* Side Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

          {/* Node info */}
          {selectedNode && nodeMap[selectedNode] && (
            <div className="glass-panel animate-fade-in" style={{ padding: '1rem', borderLeft: `3px solid ${nodeMap[selectedNode].color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: nodeMap[selectedNode].color }}>
                    {nodeMap[selectedNode].label}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                    CPS: {nodeMap[selectedNode].cps}%
                  </div>
                </div>
                <button onClick={() => setSelectedNode(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                {nodeMap[selectedNode].desc}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Relaciones causales ({selectedLinks.length})
              </div>
              {selectedLinks.map((l, i) => {
                const isOut = l.from === selectedNode;
                const otherKey = isOut ? l.to : l.from;
                const otherNode = nodeMap[otherKey];
                return (
                  <div key={i} style={{
                    padding: '0.5rem 0.6rem', borderRadius: '7px', marginBottom: '0.35rem',
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${l.strokeColor}22`,
                    fontSize: '0.7rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      <span style={{ color: l.strokeColor, fontWeight: 700 }}>
                        {isOut ? '→' : '←'} {otherNode?.label}
                      </span>
                      <span style={{
                        fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: '10px',
                        background: `${IMPACT_COLOR[l.impact]}22`, color: IMPACT_COLOR[l.impact], fontWeight: 700,
                      }}>{l.impact}</span>
                    </div>
                    <div style={{ color: 'var(--text-tertiary)', lineHeight: 1.4 }}>{l.label}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Link info on hover */}
          {activeLink && !selectedNode && (
            <div className="glass-panel animate-fade-in" style={{
              padding: '1rem', borderLeft: `3px solid ${activeLink.strokeColor}`,
            }}>
              <div style={{ fontSize: '0.65rem', color: activeLink.strokeColor, fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                {activeLink.type === 'amplifies' ? '↑ Relación Amplificadora' : '↓ Relación Amortiguadora'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                {FORCE_CONFIG[activeLink.from]?.label} → {FORCE_CONFIG[activeLink.to]?.label}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', lineHeight: 1.5, marginBottom: '0.6rem' }}>
                {activeLink.doctrine}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Peso causal</span>
                <span style={{ color: activeLink.strokeColor, fontWeight: 700 }}>{Math.round(activeLink.w * 100)}%</span>
              </div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${activeLink.w * 100}%`,
                  background: activeLink.strokeColor, borderRadius: 2,
                }} />
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ color: IMPACT_COLOR[activeLink.impact], fontWeight: 700 }}>● {activeLink.impact}</span>
                <span>impacto sistémico</span>
              </div>
            </div>
          )}

          {/* Default legend */}
          {!selectedNode && !activeLink && (
            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Fuerzas del Sector
              </div>
              {nodes.map(n => (
                <div key={n.key}
                  onClick={() => setSelectedNode(n.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    padding: '0.5rem 0.6rem', borderRadius: '8px', marginBottom: '0.3rem',
                    cursor: 'pointer', transition: 'all 0.2s',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${n.color}12`; e.currentTarget.style.borderColor = `${n.color}33`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{n.label}</div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: n.color, fontWeight: 700 }}>{n.cps}%</div>
                </div>
              ))}
              <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.5rem', textAlign: 'center' }}>
                {links.filter(l => l.type === 'amplifies').length} amplificaciones · {links.filter(l => l.type === 'dampens').length} amortiguaciones
              </div>
            </div>
          )}

          {/* Systemic insights */}
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.6rem' }}>
              Insight Sistémico
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {(() => {
                const maxCps = nodes.reduce((acc, n) => n.cps > acc.cps ? n : acc, nodes[0]);
                const amplifyCount = links.filter(l => l.from === maxCps?.key && l.type === 'amplifies').length;
                return `${maxCps?.label || '—'} (CPS ${maxCps?.cps}%) es el nodo de mayor presión y amplifica ${amplifyCount} fuerza${amplifyCount !== 1 ? 's' : ''} adicional${amplifyCount !== 1 ? 'es' : ''}. Reducir esta presión genera el mayor impacto sistémico en el sector.`;
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
