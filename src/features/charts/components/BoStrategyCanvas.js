/**
 * BoStrategyCanvas — Interactive Strategy Canvas (Blue Ocean Fase 1)
 * ==================================================================
 * Reemplaza las barras horizontales con el Strategy Canvas real:
 * curva de valor SVG de la industria vs la propuesta,
 * factores en eje X, score (1-5) en eje Y.
 * Click para editar proposed_score en tiempo real.
 * Doctrina: Kim & Mauborgne (2005) Blue Ocean Strategy.
 */
"use client";
import { useState } from 'react';

const ERRC_META = {
  eliminate: { color: '#ff4d6a', icon: '❌', label: 'Eliminar' },
  reduce:    { color: '#f59e0b', icon: '⬇️', label: 'Reducir'  },
  raise:     { color: '#6366f1', icon: '⬆️', label: 'Incrementar' },
  create:    { color: '#10b981', icon: '✨', label: 'Crear'    },
};

function pointsToPath(points) {
  if (!points.length) return '';
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
}

export default function BoStrategyCanvas({ factors = [], onUpdate, summary }) {
  const [hoveredFactor, setHoveredFactor] = useState(null);
  const [selectedFactor, setSelectedFactor] = useState(null);

  if (!factors.length) return null;

  const W = 640, H = 300, PAD_L = 20, PAD_R = 20, PAD_T = 30, PAD_B = 48;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const stepX = chartW / (factors.length - 1 || 1);
  const scoreToY = (s) => PAD_T + chartH - ((s - 1) / 4) * chartH;
  const idxToX = (i) => PAD_L + i * stepX;

  const industryPts = factors.map((f, i) => ({ x: idxToX(i), y: scoreToY(f.industry_score) }));
  const proposedPts = factors.map((f, i) => ({ x: idxToX(i), y: scoreToY(f.proposed_score) }));

  const industryPath = pointsToPath(industryPts);
  const proposedPath = pointsToPath(proposedPts);
  const proposedAreaPath = proposedPts.length
    ? `${proposedPath} L ${proposedPts[proposedPts.length-1].x} ${PAD_T + chartH} L ${PAD_L} ${PAD_T + chartH} Z`
    : '';

  const sel = selectedFactor !== null ? factors[selectedFactor] : null;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🌊</div>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>Strategy Canvas — Curva de Valor</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
            Industria actual vs propuesta de océano azul · Kim & Mauborgne (2005) · Click en factor para ajustar
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {[['Industria', '#ff4d6a'], ['Propuesta', '#10b981']].map(([l, c]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem' }}>
              <div style={{ width: 24, height: 3, background: c, borderRadius: 2 }} />
              <span style={{ color: c }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '1rem', alignItems: 'start' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(2,4,16,0.97), rgba(6,8,24,0.95))' }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
            <defs>
              <filter id="boGlow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              <linearGradient id="boProposedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Y-axis grid */}
            {[1,2,3,4,5].map(v => {
              const y = scoreToY(v);
              return (
                <g key={v}>
                  <line x1={PAD_L} y1={y} x2={W-PAD_R} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <text x={PAD_L-4} y={y} textAnchor="end" dominantBaseline="middle" fill="rgba(255,255,255,0.2)" fontSize="9">{v}</text>
                </g>
              );
            })}

            {/* Proposed area fill */}
            {proposedAreaPath && <path d={proposedAreaPath} fill="url(#boProposedGrad)" />}

            {/* Lines */}
            <path d={industryPath} fill="none" stroke="#ff4d6a" strokeWidth="2" strokeLinejoin="round" strokeOpacity="0.8" />
            <path d={proposedPath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" filter="url(#boGlow)" />

            {/* Factor points */}
            {factors.map((f, i) => {
              const ix = idxToX(i), iy = scoreToY(f.industry_score);
              const px = idxToX(i), py = scoreToY(f.proposed_score);
              const isHov = hoveredFactor === i;
              const isSel = selectedFactor === i;
              const errcColor = ERRC_META[f.errc_action]?.color || '#6366f1';
              return (
                <g key={i}
                  onClick={() => setSelectedFactor(isSel ? null : i)}
                  onMouseEnter={() => setHoveredFactor(i)}
                  onMouseLeave={() => setHoveredFactor(null)}
                  style={{ cursor: 'pointer' }}>
                  {/* Delta line */}
                  <line x1={px} y1={iy} x2={px} y2={py} stroke={errcColor} strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3,2" />
                  {/* Industry dot */}
                  <circle cx={ix} cy={iy} r={isHov || isSel ? 5 : 4} fill="#ff4d6a" strokeWidth={isSel ? 2 : 0} stroke="white" />
                  {/* Proposed dot */}
                  <circle cx={px} cy={py} r={isHov || isSel ? 7 : 5} fill={errcColor} strokeWidth={isSel ? 2.5 : 0} stroke="white"
                    filter={isHov || isSel ? 'url(#boGlow)' : undefined} />
                  {/* ERRC icon */}
                  <text x={px} y={py} textAnchor="middle" dominantBaseline="middle" fontSize="8">
                    {ERRC_META[f.errc_action]?.icon || '•'}
                  </text>
                  {/* Factor label at bottom */}
                  <text x={idxToX(i)} y={H - PAD_B + 14}
                    textAnchor={i === 0 ? 'start' : i === factors.length-1 ? 'end' : 'middle'}
                    fill={isSel || isHov ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.28)'}
                    fontSize="8" fontWeight={isSel ? '700' : '400'}
                    transform={`rotate(-35, ${idxToX(i)}, ${H - PAD_B + 14})`}>
                    {f.name?.slice(0, 16)}
                  </text>
                </g>
              );
            })}

            {/* Y axis label */}
            <text x={7} y={H/2} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="8" fontWeight="600" transform={`rotate(-90, 7, ${H/2})`}>Score (1→5)</text>
          </svg>
        </div>

        {/* Detail panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {sel ? (
            <div className="glass-panel animate-fade-in" style={{ padding: '1rem', borderLeft: `3px solid ${ERRC_META[sel.errc_action]?.color || '#6366f1'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{sel.name}</div>
                  <div style={{ fontSize: '0.65rem', color: ERRC_META[sel.errc_action]?.color }}>{ERRC_META[sel.errc_action]?.icon} {ERRC_META[sel.errc_action]?.label}</div>
                </div>
                <button onClick={() => setSelectedFactor(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem', marginBottom: '0.5rem' }}>
                <div style={{ padding: '0.4rem', borderRadius: 7, background: 'rgba(255,77,106,0.08)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.58rem', color: 'var(--text-tertiary)' }}>Industria</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ff4d6a' }}>{sel.industry_score}/5</div>
                </div>
                <div style={{ padding: '0.4rem', borderRadius: 7, background: 'rgba(16,185,129,0.08)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.58rem', color: 'var(--text-tertiary)' }}>Propuesta</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10b981' }}>{sel.proposed_score}/5</div>
                </div>
              </div>
              {onUpdate && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginBottom: '0.2rem' }}>Ajustar propuesta:</div>
                  <input type="range" min="1" max="5" step="1" value={sel.proposed_score}
                    onChange={e => onUpdate(selectedFactor, parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: ERRC_META[sel.errc_action]?.color || '#10b981' }} />
                </div>
              )}
              {sel.evidence && (
                <div style={{ padding: '0.4rem 0.5rem', borderRadius: 7, background: 'rgba(255,255,255,0.03)', fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  📄 {sel.evidence}
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Resumen ERRC</div>
              {Object.entries(ERRC_META).map(([k, m]) => {
                const count = factors.filter(f => f.errc_action === k).length;
                return (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.7rem', color: m.color }}>{m.icon} {m.label}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: m.color }}>{count} factores</span>
                  </div>
                );
              })}
            </div>
          )}
          {summary && (
            <div className="glass-panel" style={{ padding: '1rem', borderLeft: '3px solid #6366f1' }}>
              <div style={{ fontSize: '0.62rem', color: '#6366f1', fontWeight: 700, marginBottom: '0.25rem' }}>🧠 Lógica Estratégica IA</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{summary}</div>
            </div>
          )}
          <div className="glass-panel" style={{ padding: '0.85rem' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>📚 Kim & Mauborgne (2005)</div>
            <div style={{ fontSize: '0.67rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              La divergencia entre las curvas señala el océano azul potencial. Mayor separación = mayor diferenciación estratégica.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
