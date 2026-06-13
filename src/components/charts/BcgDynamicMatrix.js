/**
 * BcgDynamicMatrix — Dynamic BCG Bubble Matrix (Fase 1)
 * ======================================================
 * Reemplaza los 4 cuadrantes estáticos con un scatter plot interactivo.
 * Ejes: Market Share (X) × Growth Rate (Y).
 * Burbujas posicionadas en coordenadas reales (unit.share, unit.growth).
 * Tamaño de burbuja = posición estratégica (stars más grandes).
 * Click para detalle. Crosshair de mediana dinámico.
 * Doctrina: Henderson (1970) BCG Portfolio Theory.
 */
"use client";
import { useState, useEffect } from 'react';

const QUADRANTS = {
  star:     { color: '#6366f1', icon: '⭐', label: 'Star',           bg: 'rgba(99,102,241,0.08)',   action: 'Escalar agresivamente' },
  cow:      { color: '#10b981', icon: '🐄', label: 'Cash Cow',       bg: 'rgba(16,185,129,0.08)',   action: 'Optimizar flujo de caja' },
  question: { color: '#f59e0b', icon: '❓', label: 'Question Mark',  bg: 'rgba(245,158,11,0.08)',   action: 'Decidir: invertir o desinvertir' },
  dog:      { color: '#ff4d6a', icon: '🐕', label: 'Dog',            bg: 'rgba(255,77,106,0.08)',   action: 'Desinvertir o restructurar' },
};

// Normalize unit position to SVG coordinates
function toSvg(share, growth, W, H, pad) {
  // share: 0→1 maps to X: pad→W-pad (left=low, right=high)
  // growth: maps to Y: H-pad→pad (bottom=low, top=high)
  // Clamp growth to reasonable range (-0.2 → 0.6)
  const gMin = -0.15, gMax = 0.55;
  const x = pad + share * (W - 2 * pad);
  const y = H - pad - ((growth - gMin) / (gMax - gMin)) * (H - 2 * pad);
  return { x: Math.max(pad, Math.min(W - pad, x)), y: Math.max(pad, Math.min(H - pad, y)) };
}

function nodeRadius(u) {
  const base = { star: 18, cow: 18, question: 14, dog: 12 };
  return base[u.quadrant] || 14;
}

export default function BcgDynamicMatrix({ units = [], summary }) {
  const [selected, setSelected] = useState(null);
  const [hover, setHover] = useState(null);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulse(p => (p + 1) % 100), 55);
    return () => clearInterval(t);
  }, []);

  if (!units.length) return null;

  const W = 520, H = 420, PAD = 52;
  const avgShare = units.reduce((s, u) => s + u.share, 0) / units.length;
  const avgGrowth = units.reduce((s, u) => s + u.growth, 0) / units.length;
  const midX = PAD + avgShare * (W - 2 * PAD);
  const gMin = -0.15, gMax = 0.55;
  const midY = H - PAD - ((avgGrowth - gMin) / (gMax - gMin)) * (H - 2 * PAD);

  const sel = selected ? units.find(u => u.name === selected) : null;

  // Y-axis ticks
  const yTicks = [-0.1, 0, 0.1, 0.2, 0.3, 0.4, 0.5];
  // X-axis ticks
  const xTicks = [0, 0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📡</div>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>Dynamic BCG Portfolio Matrix</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
            Coordenadas reales de crecimiento × participación · El cuadrante emerge del dato, no del label · Click en unidad
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {Object.entries(QUADRANTS).map(([k, q]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: q.color }} />
              <span style={{ color: q.color }}>{q.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1rem', alignItems: 'start' }}>
        {/* SVG Matrix */}
        <div className="glass-panel" style={{ padding: '1rem', background: 'linear-gradient(135deg, rgba(2,4,16,0.97), rgba(6,8,24,0.95))' }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
            <defs>
              <filter id="bcgGlow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              {/* Quadrant backgrounds */}
              <clipPath id="bcgClip"><rect x={PAD} y={PAD} width={W - 2*PAD} height={H - 2*PAD} /></clipPath>
            </defs>

            {/* Quadrant zones */}
            <rect x={PAD} y={PAD} width={midX - PAD} height={midY - PAD} fill="rgba(245,158,11,0.04)" clipPath="url(#bcgClip)" />
            <rect x={midX} y={PAD} width={W - PAD - midX} height={midY - PAD} fill="rgba(99,102,241,0.05)" clipPath="url(#bcgClip)" />
            <rect x={PAD} y={midY} width={midX - PAD} height={H - PAD - midY} fill="rgba(255,77,106,0.04)" clipPath="url(#bcgClip)" />
            <rect x={midX} y={midY} width={W - PAD - midX} height={H - PAD - midY} fill="rgba(16,185,129,0.05)" clipPath="url(#bcgClip)" />

            {/* Grid lines */}
            {yTicks.map((v, i) => {
              const y = H - PAD - ((v - gMin) / (gMax - gMin)) * (H - 2 * PAD);
              return (
                <g key={i}>
                  <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <text x={PAD - 6} y={y + 1} textAnchor="end" fill="rgba(255,255,255,0.25)" fontSize="8" dominantBaseline="middle">{(v * 100).toFixed(0)}%</text>
                </g>
              );
            })}
            {xTicks.map((v, i) => {
              const x = PAD + v * (W - 2 * PAD);
              return (
                <g key={i}>
                  <line x1={x} y1={PAD} x2={x} y2={H - PAD} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <text x={x} y={H - PAD + 12} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="8">{(v * 100).toFixed(0)}%</text>
                </g>
              );
            })}

            {/* Axes */}
            <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
            <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

            {/* Median crosshair */}
            <line x1={midX} y1={PAD} x2={midX} y2={H - PAD} stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="6,4" />
            <line x1={PAD} y1={midY} x2={W - PAD} y2={midY} stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="6,4" />

            {/* Quadrant labels */}
            <text x={PAD + 8} y={PAD + 16} fill={QUADRANTS.question.color} fontSize="10" fontWeight="700" fillOpacity="0.5">❓ QUESTION</text>
            <text x={midX + 8} y={PAD + 16} fill={QUADRANTS.star.color} fontSize="10" fontWeight="700" fillOpacity="0.5">⭐ STAR</text>
            <text x={PAD + 8} y={H - PAD - 8} fill={QUADRANTS.dog.color} fontSize="10" fontWeight="700" fillOpacity="0.5">🐕 DOG</text>
            <text x={midX + 8} y={H - PAD - 8} fill={QUADRANTS.cow.color} fontSize="10" fontWeight="700" fillOpacity="0.5">🐄 CASH COW</text>

            {/* Axis labels */}
            <text x={W / 2} y={H - 4} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontWeight="600">Participación Relativa de Mercado →</text>
            <text x={12} y={H / 2} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontWeight="600" transform={`rotate(-90, 12, ${H / 2})`}>Tasa de Crecimiento →</text>

            {/* Bubble nodes */}
            {units.map((u, i) => {
              const pos = toSvg(u.share, u.growth, W, H, PAD);
              const q = QUADRANTS[u.quadrant] || QUADRANTS.dog;
              const r = nodeRadius(u);
              const isSel = selected === u.name;
              const isHov = hover === u.name;
              const dimmed = selected && !isSel;
              const pr = r + 10 + (pulse % 50) * (isSel ? 0.3 : 0);
              return (
                <g key={i}
                  onClick={() => setSelected(isSel ? null : u.name)}
                  onMouseEnter={() => setHover(u.name)}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: 'pointer', opacity: dimmed ? 0.15 : 1, transition: 'opacity 0.2s' }}>
                  {(isSel) && <circle cx={pos.x} cy={pos.y} r={pr} fill="none" stroke={q.color} strokeWidth="1" strokeOpacity={Math.max(0, 0.4 - (pulse % 50) * 0.008)} />}
                  <circle cx={pos.x} cy={pos.y} r={r + 6} fill={`${q.color}10`} />
                  <circle cx={pos.x} cy={pos.y} r={r}
                    fill={`${q.color}25`} stroke={q.color} strokeWidth={isSel ? 2.5 : 1.5}
                    filter={(isSel || isHov) ? 'url(#bcgGlow)' : undefined} />
                  <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle"
                    fill={q.color} fontSize={r > 15 ? '11' : '9'} fontWeight="800">{q.icon}</text>
                  {(isSel || isHov) && (
                    <text x={pos.x} y={pos.y + r + 12} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="8" fontWeight="600">
                      {u.name?.slice(0, 20)}
                    </text>
                  )}
                  {!isSel && !isHov && (
                    <text x={pos.x} y={pos.y + r + 11} textAnchor="middle" fill="rgba(255,255,255,0.22)" fontSize="7">
                      {u.name?.slice(0, 14)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>← Baja participación</span>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>Alta participación →</span>
          </div>
        </div>

        {/* Detail panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sel ? (
            <div className="glass-panel animate-fade-in" style={{ padding: '1rem', borderLeft: `3px solid ${QUADRANTS[sel.quadrant]?.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{QUADRANTS[sel.quadrant]?.icon} {sel.name}</div>
                  <div style={{ fontSize: '0.67rem', color: QUADRANTS[sel.quadrant]?.color, fontWeight: 700 }}>{QUADRANTS[sel.quadrant]?.label}</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: 8, background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginBottom: '0.15rem' }}>Crecimiento</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: sel.growth > avgGrowth ? '#10b981' : '#f59e0b' }}>{(sel.growth * 100).toFixed(0)}%</div>
                </div>
                <div style={{ padding: '0.5rem', borderRadius: 8, background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginBottom: '0.15rem' }}>Participación</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: sel.share > avgShare ? '#10b981' : '#f59e0b' }}>{(sel.share * 100).toFixed(0)}%</div>
                </div>
              </div>
              {sel.rationale && <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.4rem' }}>{sel.rationale}</div>}
              {sel.strategic_action && (
                <div style={{ padding: '0.4rem 0.6rem', borderRadius: 7, background: `${QUADRANTS[sel.quadrant]?.color}10`, border: `1px solid ${QUADRANTS[sel.quadrant]?.color}30`, fontSize: '0.7rem', color: QUADRANTS[sel.quadrant]?.color, fontWeight: 600 }}>
                  🎯 {sel.strategic_action}
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.6rem' }}>Distribución del Portafolio</div>
              {Object.entries(QUADRANTS).map(([k, q]) => {
                const count = units.filter(u => u.quadrant === k).length;
                const pct = Math.round((count / units.length) * 100);
                return (
                  <div key={k} style={{ marginBottom: '0.45rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', marginBottom: '0.15rem' }}>
                      <span style={{ color: q.color }}>{q.icon} {q.label}</span>
                      <span style={{ color: 'var(--text-tertiary)' }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: q.color, borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop: '0.6rem', padding: '0.4rem 0.5rem', borderRadius: 7, background: 'rgba(255,255,255,0.03)', fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                Mediana portafolio: crecimiento {(avgGrowth * 100).toFixed(0)}% · participación {(avgShare * 100).toFixed(0)}%
              </div>
            </div>
          )}
          {summary && (
            <div className="glass-panel" style={{ padding: '1rem', borderLeft: '3px solid #6366f1' }}>
              <div style={{ fontSize: '0.62rem', color: '#6366f1', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>🧠 Recomendación IA</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{summary}</div>
            </div>
          )}
          <div className="glass-panel" style={{ padding: '0.85rem' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>📚 Henderson (1970)</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Las líneas de intersección representan la mediana del portafolio. Cada burbuja refleja la posición real de la unidad — no el cuadrante asignado por la IA.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
