/**
 * BoCompetitorRadar — Competitive Radar (Blue Ocean Fase 2)
 * ==========================================================
 * Radar chart comparando nuestra propuesta vs la industria
 * en todos los factores competitivos simultáneamente.
 * Permite ver la "forma" de la estrategia al instante.
 * Doctrina: Kim & Mauborgne — "Focus, Divergence, Compelling Tagline"
 */
"use client";
import { useState } from 'react';

const ERRC_META = {
  eliminate: { color: '#ff4d6a', icon: '❌', label: 'Eliminar' },
  reduce:    { color: '#f59e0b', icon: '⬇️', label: 'Reducir'  },
  raise:     { color: '#6366f1', icon: '⬆️', label: 'Incrementar' },
  create:    { color: '#10b981', icon: '✨', label: 'Crear'    },
};

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function radarPath(cx, cy, maxR, scores, maxScore) {
  const n = scores.length;
  return scores.map((s, i) => {
    const angle = (i / n) * 360;
    const r = (s / maxScore) * maxR;
    const p = polarToCartesian(cx, cy, r, angle);
    return `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
  }).join(' ') + ' Z';
}

export default function BoCompetitorRadar({ factors = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [showIndustry, setShowIndustry] = useState(true);
  const [showProposal, setShowProposal] = useState(true);

  if (!factors.length) return null;

  const CX = 200, CY = 200, R = 155, W = 400, H = 400;
  const n = factors.length;
  const maxScore = 5;
  const rings = [1, 2, 3, 4, 5];

  const industryScores = factors.map(f => f.industry_score);
  const proposedScores = factors.map(f => f.proposed_score);
  const industryPath = radarPath(CX, CY, R, industryScores, maxScore);
  const proposedPath = radarPath(CX, CY, R, proposedScores, maxScore);

  const focusScore = Math.round((factors.filter(f => Math.abs(f.proposed_score - f.industry_score) >= 2).length / n) * 100);
  const divergenceScore = Math.round((factors.reduce((s, f) => s + Math.abs(f.proposed_score - f.industry_score), 0) / (n * 4)) * 100);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎯</div>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>Competitive Radar</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
            Forma de la estrategia: industria (rojo) vs propuesta (verde) · Focus + Divergence = Blue Ocean
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[['Focus', focusScore, '#6366f1'], ['Divergencia', divergenceScore, '#10b981']].map(([l, v, c]) => (
            <div key={l} style={{ textAlign: 'center', padding: '0.4rem 0.7rem', borderRadius: 8, background: `${c}08`, border: `1px solid ${c}25` }}>
              <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>{l}</div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: c }}>{v}%</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '1rem', alignItems: 'start' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(2,4,16,0.97), rgba(6,8,24,0.95))' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            {[['Industria', '#ff4d6a', showIndustry, setShowIndustry], ['Propuesta', '#10b981', showProposal, setShowProposal]].map(([l, c, v, set]) => (
              <label key={l} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: c, cursor: 'pointer' }}>
                <input type="checkbox" checked={v} onChange={e => set(e.target.checked)} style={{ accentColor: c }} /> {l}
              </label>
            ))}
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 420, display: 'block', margin: '0 auto' }}>
            <defs>
              <filter id="radarGlow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>

            {/* Rings */}
            {rings.map(r => (
              <polygon key={r}
                points={Array.from({ length: n }, (_, i) => {
                  const p = polarToCartesian(CX, CY, (r / maxScore) * R, (i / n) * 360);
                  return `${p.x},${p.y}`;
                }).join(' ')}
                fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            ))}
            {/* Ring labels */}
            {rings.map(r => (
              <text key={`rl-${r}`} x={CX + 4} y={CY - (r / maxScore) * R + 1} fill="rgba(255,255,255,0.15)" fontSize="8">{r}</text>
            ))}

            {/* Spokes */}
            {factors.map((_, i) => {
              const p = polarToCartesian(CX, CY, R + 5, (i / n) * 360);
              return <line key={i} x1={CX} y1={CY} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
            })}

            {/* Industry area */}
            {showIndustry && <path d={industryPath} fill="rgba(255,77,106,0.08)" stroke="#ff4d6a" strokeWidth="1.5" strokeOpacity="0.7" />}
            {/* Proposed area */}
            {showProposal && <path d={proposedPath} fill="rgba(16,185,129,0.12)" stroke="#10b981" strokeWidth="2" filter="url(#radarGlow)" />}

            {/* Factor labels & dots */}
            {factors.map((f, i) => {
              const angle = (i / n) * 360;
              const labelR = R + 22;
              const lp = polarToCartesian(CX, CY, labelR, angle);
              const ip = polarToCartesian(CX, CY, (f.industry_score / maxScore) * R, angle);
              const pp = polarToCartesian(CX, CY, (f.proposed_score / maxScore) * R, angle);
              const isHov = hoveredIdx === i;
              const errc = ERRC_META[f.errc_action];
              return (
                <g key={i}
                  onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}
                  style={{ cursor: 'pointer' }}>
                  {showIndustry && <circle cx={ip.x} cy={ip.y} r={isHov ? 5 : 3.5} fill="#ff4d6a" />}
                  {showProposal && <circle cx={pp.x} cy={pp.y} r={isHov ? 6 : 4.5} fill={errc?.color || '#10b981'} stroke="white" strokeWidth={isHov ? 1.5 : 0} />}
                  <text x={lp.x} y={lp.y}
                    textAnchor={angle > 90 && angle < 270 ? 'end' : 'start'}
                    dominantBaseline="middle"
                    fill={isHov ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)'}
                    fontSize={isHov ? '8.5' : '7.5'} fontWeight={isHov ? '700' : '400'}>
                    {f.name?.slice(0, 14)}{f.name?.length > 14 ? '…' : ''}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {hoveredIdx !== null && factors[hoveredIdx] ? (() => {
            const f = factors[hoveredIdx];
            const errc = ERRC_META[f.errc_action];
            const delta = f.proposed_score - f.industry_score;
            return (
              <div className="glass-panel animate-fade-in" style={{ padding: '1rem', borderLeft: `3px solid ${errc?.color || '#6366f1'}` }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>{f.name}</div>
                <div style={{ fontSize: '0.65rem', color: errc?.color, marginBottom: '0.4rem' }}>{errc?.icon} {errc?.label}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.35rem', marginBottom: '0.4rem' }}>
                  {[['Industria', f.industry_score, '#ff4d6a'], ['Propuesta', f.proposed_score, '#10b981'], ['Delta', (delta > 0 ? '+' : '') + delta, delta > 0 ? '#10b981' : '#ff4d6a']].map(([l, v, c]) => (
                    <div key={l} style={{ padding: '0.35rem', borderRadius: 6, background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>{l}</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: c }}>{v}</div>
                    </div>
                  ))}
                </div>
                {f.evidence && <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>📄 {f.evidence}</div>}
              </div>
            );
          })() : (
            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Composición ERRC</div>
              {Object.entries(ERRC_META).map(([k, m]) => {
                const count = factors.filter(f => f.errc_action === k).length;
                return (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.7rem', color: m.color }}>{m.icon} {m.label}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: m.color }}>{count}</span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="glass-panel" style={{ padding: '0.85rem' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>📚 3 Características del Blue Ocean</div>
            {[['Focus', 'La curva no intenta competir en todo', focusScore >= 40 ? '#10b981' : '#f59e0b'],
              ['Divergence', 'La forma difiere claramente de la industria', divergenceScore >= 40 ? '#10b981' : '#f59e0b'],
              ['Tagline', 'Se puede comunicar en una frase', '#6366f1']
            ].map(([t, d, c]) => (
              <div key={t} style={{ marginBottom: '0.3rem', padding: '0.35rem 0.5rem', borderRadius: 6, background: `${c}06` }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: c }}>{t}</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
