/**
 * BcgPortfolioGalaxy — Institutional Portfolio Galaxy Map (Fase 2)
 * ================================================================
 * Cada unidad flota en un universo estratégico.
 * Tamaño = capital estratégico (share × growth weighting).
 * Color = cuadrante BCG.
 * Brillo = posición competitiva.
 * Órbitas = clusters de cuadrante con gravedad doctrinal.
 * Visual: Bloomberg × Palantir aesthetic. Diferenciador máximo.
 */
"use client";
import { useState, useEffect, useRef } from 'react';

const QUADRANTS = {
  star:     { color: '#6366f1', icon: '⭐', label: 'Star',         glow: 'rgba(99,102,241,0.4)'  },
  cow:      { color: '#10b981', icon: '🐄', label: 'Cash Cow',     glow: 'rgba(16,185,129,0.4)'  },
  question: { color: '#f59e0b', icon: '❓', label: 'Question Mark', glow: 'rgba(245,158,11,0.35)' },
  dog:      { color: '#ff4d6a', icon: '🐕', label: 'Dog',          glow: 'rgba(255,77,106,0.3)'  },
};

// Quadrant orbital centers (relative to canvas center)
const ORBITAL_CENTERS = {
  star:     { dx: -110, dy: -95  },
  cow:      { dx:  110, dy: -95  },
  question: { dx: -110, dy:  95  },
  dog:      { dx:  110, dy:  95  },
};

// Compute node size from BCG position
function nodeSize(u) {
  const base = { star: 22, cow: 24, question: 16, dog: 13 };
  const b = base[u.quadrant] || 16;
  return b + u.share * 10 + Math.max(0, u.growth) * 8;
}

// Spread units in their orbital cluster
function layoutGalaxy(units, CX, CY) {
  const byQ = { star: [], cow: [], question: [], dog: [] };
  units.forEach(u => { if (byQ[u.quadrant]) byQ[u.quadrant].push(u); });

  const nodes = [];
  Object.entries(byQ).forEach(([q, items]) => {
    const oc = ORBITAL_CENTERS[q];
    if (!oc) return;
    items.forEach((u, i) => {
      const count = items.length;
      const angle = count > 1 ? (i / count) * 2 * Math.PI + (q === 'star' ? 0 : q === 'cow' ? Math.PI / 4 : q === 'question' ? Math.PI / 2 : Math.PI * 0.75) : 0;
      const spread = count > 1 ? 48 + count * 8 : 0;
      nodes.push({
        ...u,
        x: CX + oc.dx + (count > 1 ? Math.cos(angle) * spread : 0),
        y: CY + oc.dy + (count > 1 ? Math.sin(angle) * spread : 0),
        q,
        r: nodeSize(u),
      });
    });
  });
  return nodes;
}

export default function BcgPortfolioGalaxy({ units = [], summary }) {
  const [selected, setSelected] = useState(null);
  const [frame, setFrame] = useState(0);
  const animRef = useRef(null);

  useEffect(() => {
    let f = 0;
    const run = () => { f = (f + 1) % 360; setFrame(f); animRef.current = requestAnimationFrame(run); };
    animRef.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  if (!units.length) return null;

  const W = 560, H = 480, CX = W / 2, CY = H / 2;
  const nodes = layoutGalaxy(units, CX, CY);
  const sel = selected ? nodes.find(n => n.name === selected) : null;

  // Portfolio balance score
  const stars = units.filter(u => u.quadrant === 'star').length;
  const cows = units.filter(u => u.quadrant === 'cow').length;
  const questions = units.filter(u => u.quadrant === 'question').length;
  const dogs = units.filter(u => u.quadrant === 'dog').length;
  const balanceScore = Math.round(((stars + cows) / units.length) * 100);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🌌</div>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>Institutional Portfolio Galaxy</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
            Cada unidad orbita en su zona estratégica · Tamaño = capital · Brillo = posición · Bloomberg × Palantir aesthetic
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '0.5rem 1rem', borderRadius: 10, background: balanceScore >= 60 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${balanceScore >= 60 ? '#10b981' : '#f59e0b'}33` }}>
          <div style={{ fontSize: '0.58rem', color: 'var(--text-tertiary)', marginBottom: '0.1rem' }}>PORTFOLIO BALANCE</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: balanceScore >= 60 ? '#10b981' : '#f59e0b', lineHeight: 1 }}>{balanceScore}%</div>
          <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>activos generadores</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '1rem', alignItems: 'start' }}>
        <div className="glass-panel" style={{ padding: '0.5rem', background: 'radial-gradient(ellipse at center, rgba(6,8,28,0.98) 0%, rgba(2,4,16,1) 100%)', position: 'relative', overflow: 'hidden' }}>
          {/* Star field */}
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block', position: 'relative', zIndex: 1 }}>
            <defs>
              {Object.entries(QUADRANTS).map(([q, qd]) => (
                <radialGradient key={q} id={`gal-grad-${q}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={qd.color} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={qd.color} stopOpacity="0" />
                </radialGradient>
              ))}
              <filter id="galNodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="galNodeGlowLg" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="10" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Background star field */}
            {Array.from({ length: 60 }, (_, i) => ({
              x: (i * 137.508) % W, y: (i * 89.3) % H,
              r: i % 3 === 0 ? 1.2 : 0.7, op: 0.1 + (i % 5) * 0.06
            })).map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" fillOpacity={s.op} />
            ))}

            {/* Orbital zones */}
            {Object.entries(ORBITAL_CENTERS).map(([q, oc]) => {
              const qd = QUADRANTS[q];
              return (
                <g key={q}>
                  <circle cx={CX + oc.dx} cy={CY + oc.dy} r={85}
                    fill={`url(#gal-grad-${q})`} />
                  <circle cx={CX + oc.dx} cy={CY + oc.dy} r={85}
                    fill="none" stroke={qd.color} strokeWidth="0.5" strokeOpacity="0.18"
                    strokeDasharray="6,8" />
                  <text x={CX + oc.dx} y={CY + oc.dy - 92}
                    textAnchor="middle" fill={qd.color} fontSize="8.5" fontWeight="700" fillOpacity="0.45">
                    {qd.icon} {qd.label}
                  </text>
                </g>
              );
            })}

            {/* Center gravity well */}
            <circle cx={CX} cy={CY} r={30} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <circle cx={CX} cy={CY} r={18} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <text x={CX} y={CY + 1} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.3)" fontSize="7.5" fontWeight="700">BCG</text>

            {/* Orbital connection lines */}
            {nodes.map((n, i) => {
              const oc = ORBITAL_CENTERS[n.q];
              if (!oc) return null;
              const q = QUADRANTS[n.q];
              return (
                <line key={`line-${i}`} x1={CX + oc.dx} y1={CY + oc.dy} x2={n.x} y2={n.y}
                  stroke={q.color} strokeWidth="0.6" strokeOpacity="0.12" />
              );
            })}

            {/* Nodes */}
            {nodes.map((n, i) => {
              const q = QUADRANTS[n.q];
              const isSel = selected === n.name;
              const dimmed = selected && !isSel;
              // Gentle float animation
              const floatY = Math.sin((frame + i * 40) * Math.PI / 180) * 2.5;
              const pulseR = n.r + Math.sin((frame + i * 60) * Math.PI / 180) * 1.5;
              return (
                <g key={i} transform={`translate(0, ${floatY})`}
                  onClick={() => setSelected(isSel ? null : n.name)}
                  style={{ cursor: 'pointer', opacity: dimmed ? 0.15 : 1, transition: 'opacity 0.2s' }}>
                  {/* Outer glow */}
                  <circle cx={n.x} cy={n.y} r={pulseR + 10}
                    fill={q.glow} filter="url(#galNodeGlow)" opacity={isSel ? 0.9 : 0.5} />
                  {isSel && <circle cx={n.x} cy={n.y} r={n.r + 14} fill={q.glow} filter="url(#galNodeGlowLg)" opacity="0.6" />}
                  {/* Core node */}
                  <circle cx={n.x} cy={n.y} r={pulseR}
                    fill={`${q.color}22`} stroke={q.color}
                    strokeWidth={isSel ? 2.5 : 1.5}
                    filter={isSel ? 'url(#galNodeGlowLg)' : 'url(#galNodeGlow)'} />
                  {/* Inner fill */}
                  <circle cx={n.x} cy={n.y} r={pulseR * 0.6} fill={`${q.color}40`} />
                  {/* Icon */}
                  <text x={n.x} y={n.y - 2} textAnchor="middle" dominantBaseline="middle"
                    fontSize={n.r > 20 ? '14' : '11'}>{q.icon}</text>
                  {/* Name */}
                  <text x={n.x} y={n.y + n.r + 12} textAnchor="middle"
                    fill={isSel ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)'}
                    fontSize={isSel ? '8.5' : '7.5'} fontWeight={isSel ? '700' : '400'}>
                    {n.name?.slice(0, 18)}{n.name?.length > 18 ? '…' : ''}
                  </text>
                  {/* Metrics on selection */}
                  {isSel && (
                    <text x={n.x} y={n.y + n.r + 22} textAnchor="middle" fill={q.color} fontSize="7" fontWeight="600">
                      ↑{(n.growth * 100).toFixed(0)}% · ◆{(n.share * 100).toFixed(0)}%
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sel ? (
            <div className="glass-panel animate-fade-in" style={{ padding: '1rem', borderLeft: `3px solid ${QUADRANTS[sel.q]?.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{QUADRANTS[sel.q]?.icon} {sel.name}</div>
                  <div style={{ fontSize: '0.67rem', color: QUADRANTS[sel.q]?.color, fontWeight: 700 }}>{QUADRANTS[sel.q]?.label}</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <div style={{ padding: '0.45rem', borderRadius: 7, background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.58rem', color: 'var(--text-tertiary)' }}>Crecimiento</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: sel.growth > 0.2 ? '#10b981' : '#f59e0b' }}>{(sel.growth * 100).toFixed(0)}%</div>
                </div>
                <div style={{ padding: '0.45rem', borderRadius: 7, background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.58rem', color: 'var(--text-tertiary)' }}>Participación</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: sel.share > 0.4 ? '#10b981' : '#f59e0b' }}>{(sel.share * 100).toFixed(0)}%</div>
                </div>
              </div>
              {sel.rationale && <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.4rem' }}>{sel.rationale}</div>}
              {sel.strategic_action && (
                <div style={{ padding: '0.4rem 0.5rem', borderRadius: 7, background: `${QUADRANTS[sel.q]?.color}10`, border: `1px solid ${QUADRANTS[sel.q]?.color}30`, fontSize: '0.68rem', color: QUADRANTS[sel.q]?.color, fontWeight: 600 }}>
                  🎯 {sel.strategic_action}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="glass-panel" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.6rem' }}>Composición Galáctica</div>
                {[['star', stars], ['cow', cows], ['question', questions], ['dog', dogs]].map(([q, count]) => {
                  const qd = QUADRANTS[q];
                  const pct = Math.round((count / units.length) * 100);
                  return (
                    <div key={q} style={{ marginBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', marginBottom: '0.15rem' }}>
                        <span style={{ color: qd.color }}>{qd.icon} {qd.label}</span>
                        <span style={{ color: 'var(--text-tertiary)' }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: qd.color, borderRadius: 2 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              {summary && (
                <div className="glass-panel" style={{ padding: '1rem', borderLeft: '3px solid #6366f1' }}>
                  <div style={{ fontSize: '0.62rem', color: '#6366f1', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>🧠 Visión Estratégica IA</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{summary}</div>
                </div>
              )}
              <div className="glass-panel" style={{ padding: '0.85rem' }}>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>🌌 Lectura Galáctica</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Cada cuadrante forma su propio cluster orbital. El tamaño refleja la masa estratégica (share × growth). Los activos más brillantes (Stars) orbitan en el cuadrante superior izquierdo.
                </div>
                <div style={{ fontSize: '0.65rem', color: balanceScore >= 60 ? '#10b981' : '#f59e0b', marginTop: '0.4rem', fontWeight: 700 }}>
                  {balanceScore >= 60 ? '✅ Galaxia equilibrada — portafolio saludable' : '⚠️ Galaxia desbalanceada — revisar composición'}
                </div>
              </div>
            </>
          )}

          {/* Unit list */}
          {Object.entries(QUADRANTS).filter(([q]) => units.some(u => u.quadrant === q)).map(([q, qd]) => (
            <div key={q} style={{ padding: '0.6rem 0.85rem', borderRadius: 9, background: `${qd.color}06`, border: `1px solid ${qd.color}20` }}>
              <div style={{ fontSize: '0.65rem', color: qd.color, fontWeight: 700, marginBottom: '0.25rem' }}>{qd.icon} {qd.label}</div>
              {units.filter(u => u.quadrant === q).map((u, i) => (
                <div key={i} onClick={() => setSelected(selected === u.name ? null : u.name)} style={{
                  fontSize: '0.68rem', color: 'var(--text-secondary)', padding: '0.18rem 0.3rem', borderRadius: 5,
                  cursor: 'pointer', background: selected === u.name ? `${qd.color}15` : 'transparent', transition: 'all 0.15s',
                }}>
                  {u.name} <span style={{ color: 'var(--text-tertiary)', fontSize: '0.6rem' }}>↑{(u.growth * 100).toFixed(0)}% ◆{(u.share * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
