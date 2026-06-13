/**
 * VrioDependencyGraph — Resource Capability Dependency Network (Fase 3)
 * ======================================================================
 * Grafo causal: las capacidades dependen unas de otras.
 * Cultura → Innovación → Tecnología → Datos → IA
 * Talento → Velocidad de Ejecución → Ventaja Operativa
 * 
 * Sin scores. Links inferidos desde competitive_implication y keywords en resource_name/description.
 * SVG interactivo con nodos pulsantes, arcos dirigidos, panel de dependencia.
 * Doctrina: Resource Dependency Theory (Pfeffer & Salancik) + VBSE (Sanchez).
 */
"use client";
import { useState, useEffect } from 'react';

const IMPLICATIONS = {
  sustained_advantage: { color: '#10b981', icon: '🏆', label: 'Sostenida' },
  unused_advantage:    { color: '#a855f7', icon: '🔓', label: 'No Explotada' },
  temporary_advantage: { color: '#6366f1', icon: '⏳', label: 'Temporal' },
  parity:              { color: '#f59e0b', icon: '⚖️', label: 'Paridad' },
  disadvantage:        { color: '#ff4d6a', icon: '⚠️', label: 'Desventaja' },
};

// Detect capability category from resource name + description keywords
function detectCategory(r) {
  const text = `${r.resource_name} ${r.description || ''}`.toLowerCase();
  if (/cultur|valor|identidad|clima|equipo|people|human|talent|persona/.test(text)) return 'culture';
  if (/tecnolog|software|sistema|plataform|infraestructur|digital|tech|it /.test(text)) return 'tech';
  if (/dato|data|analítica|analytic|inteligencia|ia |ai |machine|model/.test(text)) return 'data';
  if (/marca|brand|reputaci|imagen|posicionamiento/.test(text)) return 'brand';
  if (/proceso|operaci|eficiencia|cadena|supply|logíst/.test(text)) return 'operations';
  if (/cliente|customer|relacion|partner|alianza|network/.test(text)) return 'relationships';
  if (/financi|capital|recurso|inversi|liquidez/.test(text)) return 'capital';
  if (/innov|i\+d|investigaci|patent|propied/.test(text)) return 'innovation';
  return 'other';
}

const CATEGORY_META = {
  culture:       { color: '#f59e0b', icon: '🧠', label: 'Cultura' },
  tech:          { color: '#6366f1', icon: '⚙️', label: 'Tecnología' },
  data:          { color: '#10b981', icon: '📊', label: 'Datos/IA' },
  brand:         { color: '#a855f7', icon: '✨', label: 'Marca' },
  operations:    { color: '#64748b', icon: '🔄', label: 'Operaciones' },
  relationships: { color: '#0ea5e9', icon: '🤝', label: 'Relaciones' },
  capital:       { color: '#22c55e', icon: '💰', label: 'Capital' },
  innovation:    { color: '#ec4899', icon: '💡', label: 'Innovación' },
  other:         { color: '#94a3b8', icon: '📦', label: 'Otro' },
};

// Doctrinal dependency rules between categories
const DEPENDENCY_RULES = [
  { from: 'culture',       to: 'innovation',    weight: 0.9, label: 'impulsa' },
  { from: 'culture',       to: 'tech',          weight: 0.6, label: 'adopta' },
  { from: 'culture',       to: 'operations',    weight: 0.7, label: 'define ritmo de' },
  { from: 'tech',          to: 'data',          weight: 0.85, label: 'genera' },
  { from: 'data',          to: 'innovation',    weight: 0.8, label: 'acelera' },
  { from: 'data',          to: 'brand',         weight: 0.6, label: 'personaliza' },
  { from: 'innovation',    to: 'tech',          weight: 0.75, label: 'produce' },
  { from: 'innovation',    to: 'brand',         weight: 0.7, label: 'fortalece' },
  { from: 'brand',         to: 'relationships', weight: 0.8, label: 'atrae' },
  { from: 'relationships', to: 'capital',       weight: 0.65, label: 'accede a' },
  { from: 'capital',       to: 'tech',          weight: 0.7, label: 'financia' },
  { from: 'capital',       to: 'innovation',    weight: 0.75, label: 'invierte en' },
  { from: 'operations',    to: 'capital',       weight: 0.6, label: 'genera' },
  { from: 'culture',       to: 'relationships', weight: 0.55, label: 'fortalece' },
];

// Layout resources in a circle, grouped by category
function layoutNodes(resources, CX, CY, R) {
  const byCategory = {};
  resources.forEach(r => {
    const cat = detectCategory(r);
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push({ ...r, category: cat, catMeta: CATEGORY_META[cat] || CATEGORY_META.other });
  });

  const nodes = [];
  const cats = Object.keys(byCategory);
  cats.forEach((cat, ci) => {
    const items = byCategory[cat];
    const catAngle = (ci / cats.length) * 2 * Math.PI - Math.PI / 2;
    const subR = R * 0.38;
    items.forEach((item, ii) => {
      const spread = items.length > 1 ? (ii / (items.length - 1) - 0.5) * 0.7 : 0;
      const angle = catAngle + spread;
      nodes.push({
        ...item,
        nid: item.id || item.resource_name,
        x: CX + R * Math.cos(catAngle) + subR * Math.cos(catAngle + Math.PI / 2) * spread * 2,
        y: CY + R * Math.sin(catAngle) + subR * Math.sin(catAngle + Math.PI / 2) * spread * 2,
        cat,
      });
    });
  });

  // Re-layout: simple circular
  const total = nodes.length;
  return nodes.map((n, i) => {
    const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
    return { ...n, x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) };
  });
}

// Build links between actual resources based on dependency rules
function buildLinks(nodes) {
  const links = [];
  DEPENDENCY_RULES.forEach(rule => {
    const fromNodes = nodes.filter(n => n.category === rule.from);
    const toNodes = nodes.filter(n => n.category === rule.to);
    if (!fromNodes.length || !toNodes.length) return;
    // Connect highest-implication from → highest-implication to
    const fromN = fromNodes.sort((a, b) => {
      const order = { sustained_advantage: 0, unused_advantage: 1, temporary_advantage: 2, parity: 3, disadvantage: 4 };
      return (order[a.competitive_implication] || 3) - (order[b.competitive_implication] || 3);
    })[0];
    const toN = toNodes[0];
    if (fromN.nid !== toN.nid) {
      links.push({ from: fromN, to: toN, weight: rule.weight, label: rule.label });
    }
  });
  return links;
}

export default function VrioDependencyGraph({ resources = [] }) {
  const [selected, setSelected] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulse(p => (p + 1) % 100), 50);
    return () => clearInterval(t);
  }, []);

  if (!resources.length) return null;

  const W = 500, H = 440, CX = W / 2, CY = H / 2, R = 175;
  const nodes = layoutNodes(resources, CX, CY, R);
  const links = buildLinks(nodes);
  const nodeMap = Object.fromEntries(nodes.map(n => [n.nid, n]));

  const sel = selected ? nodes.find(n => n.nid === selected) : null;
  const selLinks = sel ? links.filter(l => l.from.nid === selected || l.to.nid === selected) : [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="glass-panel" style={{ padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🕸️</div>
          <span style={{ fontSize: '1rem', fontWeight: 700 }}>Resource Dependency Graph</span>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
          Las capacidades no son independientes — se refuerzan y dependen entre sí · Pfeffer & Salancik · Click en nodo
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1rem', alignItems: 'start' }}>
        <div className="glass-panel" style={{ padding: '1rem', background: 'linear-gradient(135deg, rgba(2,4,16,0.97), rgba(6,8,24,0.95))' }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block', overflow: 'visible' }}>
            <defs>
              {Object.entries(IMPLICATIONS).map(([k, v]) => (
                <marker key={k} id={`arr-dep-${k}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={v.color} fillOpacity="0.5" />
                </marker>
              ))}
              <filter id="depGlow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>

            {/* Center */}
            <circle cx={CX} cy={CY} r={22} fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.25)" strokeWidth="1.5" />
            <text x={CX} y={CY + 1} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.6)" fontSize="8.5" fontWeight="800">VRIO</text>

            {/* Links */}
            {links.map((l, i) => {
              const impl = IMPLICATIONS[l.from.competitive_implication] || IMPLICATIONS.parity;
              const isHov = hoveredLink === i;
              const dimmed = (selected && !selLinks.includes(l)) || (hoveredLink !== null && !isHov);
              return (
                <g key={i} onMouseEnter={() => setHoveredLink(i)} onMouseLeave={() => setHoveredLink(null)} style={{ cursor: 'pointer' }}>
                  <line x1={l.from.x} y1={l.from.y} x2={l.to.x} y2={l.to.y} stroke="transparent" strokeWidth="14" />
                  <line x1={l.from.x} y1={l.from.y} x2={l.to.x} y2={l.to.y}
                    stroke={impl.color} strokeWidth={isHov ? l.weight * 4 + 2 : l.weight * 2 + 0.5}
                    strokeOpacity={dimmed ? 0.06 : isHov ? 0.9 : 0.3}
                    markerEnd={`url(#arr-dep-${l.from.competitive_implication || 'parity'})`}
                    strokeDasharray={l.weight < 0.7 ? '5,4' : 'none'}
                    style={{ transition: 'all 0.2s' }} />
                  {isHov && (
                    <text x={(l.from.x + l.to.x) / 2} y={(l.from.y + l.to.y) / 2 - 8}
                      textAnchor="middle" fill={impl.color} fontSize="8.5" fontWeight="700">{l.label}</text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((n, i) => {
              const impl = IMPLICATIONS[n.competitive_implication] || IMPLICATIONS.parity;
              const catMeta = n.catMeta;
              const isSel = selected === n.nid;
              const dimmed = selected && !isSel && !selLinks.some(l => l.from.nid === n.nid || l.to.nid === n.nid);
              const r = 13 + ([n.valuable, n.rare, n.costly_to_imitate, n.organized].filter(Boolean).length) * 3;
              const pr = r + 7 + (pulse % 50) * (isSel ? 0.25 : 0);
              return (
                <g key={i} onClick={() => setSelected(isSel ? null : n.nid)}
                  style={{ cursor: 'pointer', opacity: dimmed ? 0.15 : 1, transition: 'opacity 0.2s' }}>
                  {isSel && <circle cx={n.x} cy={n.y} r={pr} fill="none" stroke={impl.color} strokeWidth="1" strokeOpacity={Math.max(0, 0.4 - (pulse % 50) * 0.008)} />}
                  <circle cx={n.x} cy={n.y} r={r + 6} fill={`${catMeta.color}08`} />
                  <circle cx={n.x} cy={n.y} r={r}
                    fill={`${impl.color}22`} stroke={impl.color} strokeWidth={isSel ? 2.5 : 1.5}
                    filter={isSel ? 'url(#depGlow)' : undefined} />
                  <text x={n.x} y={n.y - 2} textAnchor="middle" dominantBaseline="middle" fill={catMeta.color} fontSize="10">{catMeta.icon}</text>
                  <text x={n.x} y={n.y + 8} textAnchor="middle" dominantBaseline="middle" fill={impl.color} fontSize="6.5" fontWeight="700">{impl.icon}</text>
                  <text x={n.x} y={n.y + r + 12} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="6.5">
                    {(n.resource_name || '').slice(0, 14)}{(n.resource_name || '').length > 14 ? '…' : ''}
                  </text>
                </g>
              );
            })}
          </svg>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
            {Object.entries(CATEGORY_META).filter(([k]) => nodes.some(n => n.category === k)).map(([k, v]) => (
              <span key={k} style={{ fontSize: '0.6rem', color: v.color, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>{v.icon} {v.label}</span>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sel ? (
            <div className="glass-panel animate-fade-in" style={{ padding: '1rem', borderLeft: `3px solid ${(IMPLICATIONS[sel.competitive_implication] || IMPLICATIONS.parity).color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{sel.catMeta?.icon} {sel.resource_name}</span>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ fontSize: '0.67rem', color: (IMPLICATIONS[sel.competitive_implication] || IMPLICATIONS.parity).color, fontWeight: 700, marginBottom: '0.4rem' }}>
                {(IMPLICATIONS[sel.competitive_implication] || IMPLICATIONS.parity).icon} {(IMPLICATIONS[sel.competitive_implication] || IMPLICATIONS.parity).label} · {sel.catMeta?.label}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.6rem' }}>{sel.description}</div>
              {selLinks.length > 0 && (
                <>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>Dependencias ({selLinks.length})</div>
                  {selLinks.map((l, i) => {
                    const isOut = l.from.nid === selected;
                    const other = isOut ? l.to : l.from;
                    const otherImpl = IMPLICATIONS[other.competitive_implication] || IMPLICATIONS.parity;
                    return (
                      <div key={i} style={{ padding: '0.35rem 0.5rem', borderRadius: 7, marginBottom: '0.25rem', background: `${otherImpl.color}08`, border: `1px solid ${otherImpl.color}22`, fontSize: '0.68rem' }}>
                        <span style={{ color: otherImpl.color, fontWeight: 700 }}>{isOut ? '→' : '←'} {l.label}: </span>
                        <span style={{ color: 'var(--text-secondary)' }}>{other.resource_name}</span>
                      </div>
                    );
                  })}
                </>
              )}
              {sel.recommendation && (
                <div style={{ marginTop: '0.4rem', padding: '0.4rem 0.5rem', borderRadius: 7, background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.68rem', color: '#6366f1', lineHeight: 1.4 }}>
                  📌 {sel.recommendation}
                </div>
              )}
            </div>
          ) : hoveredLink !== null && links[hoveredLink] ? (
            <div className="glass-panel animate-fade-in" style={{ padding: '1rem', borderLeft: '3px solid #6366f1' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>Dependencia Doctrinal</div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', marginBottom: '0.2rem' }}>{links[hoveredLink].from.resource_name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '0.15rem' }}>→ {links[hoveredLink].label}</div>
              <div style={{ fontSize: '0.75rem', color: '#6366f1' }}>{links[hoveredLink].to.resource_name}</div>
              <div style={{ marginTop: '0.4rem', fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                Peso causal: {Math.round(links[hoveredLink].weight * 100)}% · {links[hoveredLink].weight >= 0.8 ? 'Dependencia fuerte' : links[hoveredLink].weight >= 0.65 ? 'Dependencia moderada' : 'Dependencia débil'}
              </div>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Categorías ({nodes.length} nodos)</div>
              {Object.entries(CATEGORY_META).filter(([k]) => nodes.some(n => n.category === k)).map(([k, v]) => {
                const count = nodes.filter(n => n.category === k).length;
                return (
                  <div key={k} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.85rem' }}>{v.icon}</span>
                    <span style={{ fontSize: '0.7rem', color: v.color, flex: 1 }}>{v.label}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{count}</span>
                  </div>
                );
              })}
              <div style={{ marginTop: '0.5rem', fontSize: '0.62rem', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                {links.length} dependencias causales · Click en nodo o hover en enlace
              </div>
            </div>
          )}
          <div className="glass-panel" style={{ padding: '0.85rem' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>📚 Doctrina</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Las capacidades no son activos aislados — forman sistemas de refuerzo mutuo. Una fortaleza en Cultura amplifica Innovación. Datos potencian Tecnología. La ventaja competitiva real emerge de estas interdependencias.
            </div>
            <div style={{ fontSize: '0.65rem', color: '#6366f1', marginTop: '0.3rem', fontWeight: 700 }}>Pfeffer & Salancik (1978) · Sanchez VBSE</div>
          </div>
        </div>
      </div>
    </div>
  );
}
