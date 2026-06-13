/**
 * PestelCorrelationGraph — Cross-Dimensional Causal Network v2
 * =============================================================
 * Interactive weighted graph showing PESTEL interdependencies.
 * Click a node to see its causal relationships with doctrine.
 * Bloomberg/Palantir aesthetic.
 */
"use client";
import { useState, useEffect } from 'react';

const FACTORS = [
  { key: 'P',  label: 'Político',    short: 'POL', color: '#ff453a', icon: '🏛️', angle: -90  },
  { key: 'E',  label: 'Económico',   short: 'ECO', color: '#ff9f0a', icon: '📈', angle: -30  },
  { key: 'S',  label: 'Social',      short: 'SOC', color: '#30d158', icon: '👥', angle: 30   },
  { key: 'T',  label: 'Tecnológico', short: 'TEC', color: '#5e5ce6', icon: '⚡', angle: 90   },
  { key: 'E2', label: 'Ecológico',   short: 'ENV', color: '#bf5af2', icon: '🌍', angle: 150  },
  { key: 'L',  label: 'Legal',       short: 'LEG', color: '#ff6b35', icon: '⚖️', angle: 210  },
];

// Doctrinal causal relationships
const DOCTRINAL_LINKS = [
  { from: 'P', to: 'L',  weight: 0.85, label: 'Política → Regulación', doctrine: 'Cambios de gobierno generan marcos legales nuevos' },
  { from: 'P', to: 'E',  weight: 0.70, label: 'Política → Economía',   doctrine: 'Políticas fiscales y comerciales determinan el ciclo económico' },
  { from: 'T', to: 'S',  weight: 0.75, label: 'Tecnología → Social',   doctrine: 'Innovación tecnológica transforma comportamientos y expectativas' },
  { from: 'T', to: 'E',  weight: 0.65, label: 'Tecnología → Economía', doctrine: 'Automatización y digitalización reconfiguran la estructura de costos' },
  { from: 'E', to: 'S',  weight: 0.60, label: 'Economía → Social',     doctrine: 'El ciclo económico afecta movilidad social y bienestar' },
  { from: 'E2', to: 'L', weight: 0.80, label: 'Ecología → Legal',      doctrine: 'Presión ambiental acelera regulación ESG y compliance climático' },
  { from: 'E2', to: 'E', weight: 0.55, label: 'Ecología → Economía',   doctrine: 'Costos climáticos y transición energética presionan los márgenes' },
  { from: 'L', to: 'T',  weight: 0.45, label: 'Legal → Tecnología',    doctrine: 'Regulación de IA y datos define el espacio de innovación posible' },
  { from: 'S', to: 'P',  weight: 0.50, label: 'Social → Político',     doctrine: 'Presión social determina la agenda y estabilidad política' },
];

function polar(cx, cy, r, deg) {
  const rad = deg * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default function PestelCorrelationGraph({ heatMap, riskDistribution }) {
  const [hoveredLink, setHoveredLink] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulse(p => (p + 1) % 100), 60);
    return () => clearInterval(t);
  }, []);

  if (!heatMap || !heatMap.length) return null;

  const CX = 160, CY = 160, R = 110;
  const nodes = FACTORS.map(f => {
    const p = polar(CX, CY, R, f.angle);
    const d = riskDistribution?.find(r => r.factor === f.key);
    const score = d?.avg_priority || 0;
    const risk = d?.risk_level || 'none';
    const radius = 20 + (score / 100) * 12;
    return { ...f, ...p, score: Math.round(score), risk, radius };
  });
  const nodeMap = Object.fromEntries(nodes.map(n => [n.key, n]));

  const links = DOCTRINAL_LINKS.map((l, i) => {
    const from = nodeMap[l.from], to = nodeMap[l.to];
    if (!from || !to) return null;
    const dx = to.x - from.x, dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len, uy = dy / len;
    const x1 = from.x + ux * from.radius, y1 = from.y + uy * from.radius;
    const x2 = to.x - ux * to.radius,     y2 = to.y - uy * to.radius;
    const mx = (x1 + x2) / 2 - uy * 25, my = (y1 + y2) / 2 + ux * 25;
    const involvedInSelected = selectedNode && (l.from === selectedNode || l.to === selectedNode);
    return { ...l, idx: i, x1, y1, x2, y2, mx, my, from, to, involvedInSelected };
  }).filter(Boolean);

  const selectedLinks = selectedNode ? links.filter(l => l.from === selectedNode || l.to === selectedNode) : [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(94,92,230,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🕸️</div>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>Red de Correlación Cross-Dimensional</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
            Las dimensiones PESTEL NO son independientes · Sistema complejo adaptativo · Click en nodo para causalidad
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <svg width="20" height="4"><rect width="20" height="4" rx="2" fill="#ff453a" opacity="0.7"/></svg> Alta
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <svg width="20" height="2"><rect width="20" height="2" rx="1" fill="#5e5ce6" opacity="0.5"/></svg> Baja
          </span>
          <span>○ Tamaño = Score</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1rem', alignItems: 'start' }}>
        <div className="glass-panel" style={{ padding: '1rem' }}>
          <svg viewBox={`0 0 ${CX * 2} ${CY * 2}`} style={{ width: '100%', display: 'block' }}>
            <defs>
              <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255,255,255,0.3)" />
              </marker>
              <filter id="glow2">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Links */}
            {links.map(l => {
              const isHov = hoveredLink === l.idx;
              const dimmed = (selectedNode && !l.involvedInSelected) || (hoveredLink !== null && !isHov);
              const opacity = dimmed ? 0.08 : 0.25 + l.weight * 0.45;
              const strokeW = isHov ? l.weight * 5 + 2 : l.weight * 3.5 + 0.5;
              const color = l.weight >= 0.7 ? '#ff453a' : l.weight >= 0.5 ? '#ff9f0a' : '#5e5ce6';
              return (
                <g key={l.idx}
                  onMouseEnter={() => setHoveredLink(l.idx)}
                  onMouseLeave={() => setHoveredLink(null)}
                  style={{ cursor: 'pointer' }}>
                  <path d={`M ${l.x1} ${l.y1} Q ${l.mx} ${l.my} ${l.x2} ${l.y2}`}
                    fill="none" stroke="transparent" strokeWidth="14" />
                  <path d={`M ${l.x1} ${l.y1} Q ${l.mx} ${l.my} ${l.x2} ${l.y2}`}
                    fill="none" stroke={color} strokeWidth={strokeW} strokeOpacity={opacity}
                    markerEnd="url(#arr)"
                    style={{ transition: 'all 0.2s' }} />
                  {isHov && (
                    <g>
                      <rect x={l.mx - 55} y={l.my - 14} width="110" height="22" rx="5"
                        fill="rgba(8,12,22,0.95)" stroke={color} strokeOpacity="0.5" strokeWidth="1" />
                      <text x={l.mx} y={l.my + 2} textAnchor="middle" fill={color} fontSize="8" fontWeight="700">
                        {l.label} ({Math.round(l.weight * 100)}%)
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map(n => {
              const isSelected = selectedNode === n.key;
              const dimmed = selectedNode && !isSelected && !selectedLinks.some(l => l.from === n.key || l.to === n.key);
              const pulseR = n.radius + 8 + (pulse % 50) * 0.25;
              const pulseOp = isSelected ? Math.max(0, 0.3 - (pulse % 50) * 0.006) : 0;
              return (
                <g key={n.key} onClick={() => setSelectedNode(selectedNode === n.key ? null : n.key)}
                  style={{ cursor: 'pointer', opacity: dimmed ? 0.2 : 1, transition: 'opacity 0.2s' }}>
                  <circle cx={n.x} cy={n.y} r={pulseR} fill="none" stroke={n.color} strokeWidth="1" strokeOpacity={pulseOp} />
                  <circle cx={n.x} cy={n.y} r={n.radius + 10} fill={`${n.color}08`} />
                  <circle cx={n.x} cy={n.y} r={n.radius} fill={`${n.color}18`} stroke={n.color}
                    strokeWidth={isSelected ? 3 : 1.8} filter={isSelected ? 'url(#glow2)' : undefined}
                    style={{ transition: 'all 0.2s' }} />
                  <text x={n.x} y={n.y - 4} textAnchor="middle" fill={n.color} fontSize="9" fontWeight="900">{n.short}</text>
                  <text x={n.x} y={n.y + 8} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8">{n.score}</text>
                  <text x={n.x} y={n.y + n.radius + 15} textAnchor="middle" fill="var(--text-tertiary)" fontSize="8">{n.label}</text>
                </g>
              );
            })}
          </svg>
          <div style={{ textAlign: 'center', fontSize: '0.62rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
            Click en dimensión para ver su red causal · Hover en enlace para ver el peso
          </div>
        </div>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {selectedNode && nodeMap[selectedNode] ? (
            <div className="glass-panel animate-fade-in" style={{ padding: '1rem', borderLeft: `3px solid ${nodeMap[selectedNode].color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: nodeMap[selectedNode].color }}>
                    {nodeMap[selectedNode].icon} {nodeMap[selectedNode].label}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)' }}>Score: {nodeMap[selectedNode].score}</div>
                </div>
                <button onClick={() => setSelectedNode(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Relaciones causales ({selectedLinks.length})
              </div>
              {selectedLinks.map((l, i) => {
                const isOut = l.from === selectedNode;
                const other = nodeMap[isOut ? l.to : l.from];
                const color = l.weight >= 0.7 ? '#ff453a' : l.weight >= 0.5 ? '#ff9f0a' : '#5e5ce6';
                return (
                  <div key={i} style={{ padding: '0.5rem', borderRadius: 8, marginBottom: '0.3rem', background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}22` }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color, marginBottom: '0.15rem' }}>
                      {isOut ? '→' : '←'} {other?.label} <span style={{ opacity: 0.6, fontWeight: 400 }}>({Math.round(l.weight * 100)}%)</span>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>{l.doctrine}</div>
                  </div>
                );
              })}
            </div>
          ) : hoveredLink !== null && links[hoveredLink] ? (
            <div className="glass-panel animate-fade-in" style={{ padding: '1rem', borderLeft: `3px solid #5e5ce6` }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#5e5ce6', marginBottom: '0.35rem' }}>{links[hoveredLink].label}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.5rem' }}>{links[hoveredLink].doctrine}</div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${links[hoveredLink].weight * 100}%`, background: '#5e5ce6', borderRadius: 2 }} />
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>Peso causal: {Math.round(links[hoveredLink].weight * 100)}%</div>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Dimensiones PESTEL</div>
              {nodes.map(n => (
                <div key={n.key} onClick={() => setSelectedNode(n.key)} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.4rem 0.6rem', borderRadius: 8, marginBottom: '0.3rem',
                  cursor: 'pointer', background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${n.color}10`; e.currentTarget.style.borderColor = `${n.color}30`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; }}>
                  <span style={{ fontSize: '0.9rem' }}>{n.icon}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, flex: 1 }}>{n.label}</span>
                  <span style={{ fontSize: '0.75rem', color: n.color, fontWeight: 700 }}>{n.score}</span>
                </div>
              ))}
              <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', marginTop: '0.5rem', textAlign: 'center' }}>
                {links.length} relaciones causales documentadas
              </div>
            </div>
          )}

          <div className="glass-panel" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Insight Sistémico</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {(() => {
                const maxNode = nodes.reduce((a, b) => b.score > a.score ? b : a, nodes[0]);
                const outLinks = links.filter(l => l.from === maxNode?.key).length;
                return `${maxNode?.label || '—'} (${maxNode?.score}) es la dimensión más presionada y genera ${outLinks} efecto${outLinks !== 1 ? 's' : ''} causal${outLinks !== 1 ? 'es' : ''} en el entorno.`;
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
