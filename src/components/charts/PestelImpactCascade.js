/**
 * PestelImpactCascade — Causal Impact Flow v2
 * ============================================
 * Sankey-style: Evento → Dimensión primaria → Dimensiones secundarias → Implicación estratégica.
 * Siempre muestra contenido doctrinal incluso sin datos de secondary_factors.
 * Palantir/Bloomberg visual aesthetic.
 */
"use client";
import { useState } from 'react';

const FC = {
  P:  { label: 'Político',    short: 'POL', color: '#ff453a', icon: '🏛️' },
  E:  { label: 'Económico',   short: 'ECO', color: '#ff9f0a', icon: '📈' },
  S:  { label: 'Social',      short: 'SOC', color: '#30d158', icon: '👥' },
  T:  { label: 'Tecnológico', short: 'TEC', color: '#5e5ce6', icon: '⚡' },
  E2: { label: 'Ecológico',   short: 'ENV', color: '#bf5af2', icon: '🌍' },
  L:  { label: 'Legal',       short: 'LEG', color: '#ff6b35', icon: '⚖️' },
};

// Doctrinal fallback cascades if no secondary_factors in data
const DOCTRINAL_CASCADES = [
  {
    trigger: 'Regulación de IA Generativa', primary: 'L', secondaries: ['T', 'E'],
    implication: 'Compliance burden + costo de adaptación tecnológica + presión sobre márgenes',
    score: 88, type: 'threat',
  },
  {
    trigger: 'Subida de Tasas de Interés', primary: 'E', secondaries: ['P', 'S'],
    implication: 'Restricción de crédito + presión política sobre bancos centrales + impacto en consumo',
    score: 76, type: 'threat',
  },
  {
    trigger: 'Adopción Masiva de IA', primary: 'T', secondaries: ['S', 'E', 'L'],
    implication: 'Transformación laboral + desigualdad digital + marcos regulatorios emergentes',
    score: 82, type: 'opportunity',
  },
  {
    trigger: 'Regulación ESG Obligatoria', primary: 'E2', secondaries: ['L', 'E'],
    implication: 'Compliance climático + presión sobre modelos de financiamiento + nuevos costos operativos',
    score: 71, type: 'threat',
  },
  {
    trigger: 'Cambio Generacional del Consumidor', primary: 'S', secondaries: ['T', 'E'],
    implication: 'Digitalización acelerada de canales + repricing de propuesta de valor',
    score: 65, type: 'opportunity',
  },
];

export default function PestelImpactCascade({ priorityMatrix }) {
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState('flow'); // flow | list

  // Build cascades from real data, fallback to doctrinal
  let cascades = [];
  if (priorityMatrix?.length) {
    priorityMatrix.forEach(s => {
      const sf = (s.secondary_factors || []).map(f => f.trim()).filter(f => FC[f] && f !== s.factor);
      if (sf.length > 0) {
        cascades.push({
          trigger: s.title || 'Señal detectada',
          primary: s.factor,
          secondaries: sf,
          implication: s.description || 'Revisar implicaciones estratégicas',
          score: s.priority_score || 50,
          type: s.impact_type === 'opportunity' ? 'opportunity' : 'threat',
        });
      }
    });
  }
  if (!cascades.length) cascades = DOCTRINAL_CASCADES;

  const sorted = [...cascades].sort((a, b) => b.score - a.score);
  const sel = selected !== null ? sorted[selected] : null;

  const W = 580, H = 220;
  const NODE_W = 62, NODE_H = 38;
  const factors = Object.keys(FC);
  const factorY = (key) => {
    const idx = factors.indexOf(key);
    return 20 + idx * ((H - 40) / (factors.length - 1));
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Header */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(94,92,230,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🌊</div>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>Impact Cascade — Propagación Causal</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
            Cada evento PESTEL activa una cadena causal cross-dimensional · {cascades.length} cascadas detectadas
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          {['flow', 'list'].map(m => (
            <button key={m} onClick={() => setView(m)} style={{
              padding: '0.25rem 0.6rem', borderRadius: 6, fontSize: '0.65rem', cursor: 'pointer',
              border: `1px solid ${view === m ? '#6366f1' : 'rgba(255,255,255,0.08)'}`,
              background: view === m ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: view === m ? '#6366f1' : 'var(--text-tertiary)', fontWeight: view === m ? 700 : 400,
            }}>
              {m === 'flow' ? '🌊 Flujo' : '📋 Lista'}
            </button>
          ))}
        </div>
      </div>

      {/* Flow view */}
      {view === 'flow' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '1rem', alignItems: 'start' }}>
          <div className="glass-panel" style={{ padding: '1rem' }}>
            {/* Cascade selector pills */}
            <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {sorted.map((c, i) => (
                <button key={i} onClick={() => setSelected(selected === i ? null : i)} style={{
                  padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.62rem', cursor: 'pointer',
                  border: `1px solid ${selected === i ? FC[c.primary]?.color + '77' : 'rgba(255,255,255,0.08)'}`,
                  background: selected === i ? `${FC[c.primary]?.color}18` : 'transparent',
                  color: selected === i ? FC[c.primary]?.color : 'var(--text-tertiary)', fontWeight: selected === i ? 700 : 400,
                  transition: 'all 0.2s',
                }}>
                  {FC[c.primary]?.icon} {c.trigger.length > 25 ? c.trigger.slice(0, 25) + '…' : c.trigger}
                </button>
              ))}
            </div>

            {/* SVG Flow */}
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
              <defs>
                <marker id="cascArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255,255,255,0.3)" />
                </marker>
              </defs>

              {/* Left: Trigger event box */}
              {sel && (
                <g>
                  <rect x={5} y={H / 2 - 28} width={100} height={56} rx={8}
                    fill={`${FC[sel.primary]?.color}18`} stroke={FC[sel.primary]?.color} strokeWidth="1.5" />
                  <text x={55} y={H / 2 - 10} textAnchor="middle" fill={FC[sel.primary]?.color} fontSize="8.5" fontWeight="800">
                    {sel.trigger.length > 14 ? sel.trigger.slice(0, 14) + '…' : sel.trigger}
                  </text>
                  <text x={55} y={H / 2 + 5} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7">Score: {sel.score}</text>
                  <text x={55} y={H / 2 + 18} textAnchor="middle" fill={FC[sel.primary]?.color} fontSize="7" fontWeight="700">
                    {sel.type === 'opportunity' ? '✅ OPP' : '⚠️ THR'}
                  </text>
                </g>
              )}

              {/* Factor nodes — center column */}
              {factors.map(key => {
                const f = FC[key];
                const y = factorY(key);
                const isPrimary = sel?.primary === key;
                const isSecondary = sel?.secondaries?.includes(key);
                const dim = sel && !isPrimary && !isSecondary;
                return (
                  <g key={key} style={{ opacity: dim ? 0.2 : 1, transition: 'opacity 0.2s' }}>
                    <rect x={160} y={y - NODE_H / 2} width={NODE_W} height={NODE_H} rx={7}
                      fill={isPrimary ? `${f.color}25` : isSecondary ? `${f.color}12` : 'rgba(255,255,255,0.04)'}
                      stroke={f.color} strokeWidth={isPrimary ? 2 : 1}
                      strokeOpacity={isPrimary ? 0.9 : isSecondary ? 0.5 : 0.15} />
                    <text x={160 + NODE_W / 2} y={y - 4} textAnchor="middle" fill={f.color} fontSize="9" fontWeight="800">{f.short}</text>
                    <text x={160 + NODE_W / 2} y={y + 10} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7">{f.icon}</text>
                  </g>
                );
              })}

              {/* Right: Implication box */}
              {sel && (
                <g>
                  <rect x={W - 140} y={20} width={130} height={H - 40} rx={8}
                    fill="rgba(99,102,241,0.06)" stroke="rgba(99,102,241,0.25)" strokeWidth="1" />
                  <text x={W - 75} y={45} textAnchor="middle" fill="#6366f1" fontSize="8" fontWeight="700">IMPLICACIÓN</text>
                  {sel.implication.match(/.{1,22}(\s|$)/g)?.slice(0, 6).map((line, i) => (
                    <text key={i} x={W - 75} y={62 + i * 13} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7.5">{line.trim()}</text>
                  ))}
                </g>
              )}

              {/* Edges: trigger → primary */}
              {sel && (
                <path d={`M 106 ${H / 2} C 130 ${H / 2}, 140 ${factorY(sel.primary)}, 159 ${factorY(sel.primary)}`}
                  fill="none" stroke={FC[sel.primary]?.color} strokeWidth="2.5" strokeOpacity="0.7"
                  markerEnd="url(#cascArr)" />
              )}

              {/* Edges: primary → secondaries */}
              {sel?.secondaries?.map((sec, i) => {
                const fromY = factorY(sel.primary);
                const toY = factorY(sec);
                return (
                  <path key={i}
                    d={`M ${160 + NODE_W} ${fromY} C ${260} ${fromY}, ${270} ${toY}, ${280} ${toY}`}
                    fill="none" stroke={FC[sec]?.color || '#888'} strokeWidth="1.8" strokeOpacity="0.55"
                    strokeDasharray="5,3" markerEnd="url(#cascArr)" />
                );
              })}

              {/* Edges: secondaries → implication */}
              {sel?.secondaries?.map((sec, i) => {
                const fromY = factorY(sec);
                return (
                  <path key={i}
                    d={`M 282 ${fromY} C 330 ${fromY}, 350 ${H / 2}, ${W - 141} ${H / 2}`}
                    fill="none" stroke="rgba(99,102,241,0.35)" strokeWidth="1.2" strokeDasharray="4,3" />
                );
              })}

              {/* Default state hint */}
              {!sel && (
                <text x={W / 2} y={H / 2} textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="12">
                  Selecciona una cascada para visualizar el flujo causal
                </text>
              )}
            </svg>
          </div>

          {/* Side detail */}
          {sel ? (
            <div className="glass-panel animate-fade-in" style={{ padding: '1rem', borderLeft: `3px solid ${FC[sel.primary]?.color}` }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: FC[sel.primary]?.color, marginBottom: '0.4rem' }}>
                {FC[sel.primary]?.icon} {sel.trigger}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem', display: 'flex', gap: '0.75rem' }}>
                <span>Score: <strong style={{ color: sel.score >= 75 ? '#ff453a' : '#ff9f0a' }}>{sel.score}</strong></span>
                <span style={{ color: sel.type === 'opportunity' ? '#30d158' : '#ff453a', fontWeight: 700 }}>
                  {sel.type === 'opportunity' ? '✅ OPORTUNIDAD' : '⚠️ AMENAZA'}
                </span>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Dimensión primaria
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '1rem' }}>{FC[sel.primary]?.icon}</span>
                <span style={{ fontSize: '0.8rem', color: FC[sel.primary]?.color, fontWeight: 700 }}>{FC[sel.primary]?.label}</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Dimensiones secundarias ({sel.secondaries.length})
              </div>
              {sel.secondaries.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem', padding: '0.3rem 0.4rem', borderRadius: 6, background: `${FC[s]?.color}10` }}>
                  <span style={{ fontSize: '0.85rem' }}>{FC[s]?.icon}</span>
                  <span style={{ fontSize: '0.72rem', color: FC[s]?.color, fontWeight: 600 }}>{FC[s]?.label}</span>
                </div>
              ))}
              <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.6, padding: '0.6rem', borderRadius: 8, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <span style={{ color: '#6366f1', fontWeight: 700 }}>📌 Implicación: </span>
                {sel.implication}
              </div>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                Resumen de Cascadas
              </div>
              {sorted.slice(0, 5).map((c, i) => (
                <div key={i} onClick={() => setSelected(i)} style={{
                  padding: '0.5rem 0.6rem', borderRadius: 8, marginBottom: '0.35rem', cursor: 'pointer',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${FC[c.primary]?.color}10`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: FC[c.primary]?.color }}>
                      {FC[c.primary]?.icon} {c.primary} → {c.secondaries.join(', ')}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: c.score >= 75 ? '#ff453a' : '#ff9f0a', fontWeight: 700 }}>{c.score}</span>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>
                    {c.trigger.length > 40 ? c.trigger.slice(0, 40) + '…' : c.trigger}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {sorted.map((c, i) => {
              const primaryCfg = FC[c.primary];
              return (
                <div key={i} style={{
                  padding: '0.85rem 1rem', borderRadius: 10,
                  background: 'rgba(255,255,255,0.02)', border: `1px solid ${primaryCfg?.color}22`,
                  borderLeft: `3px solid ${primaryCfg?.color}`,
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'start', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                        {primaryCfg?.icon} {c.trigger}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.62rem', color: primaryCfg?.color, fontWeight: 700 }}>{primaryCfg?.label}</span>
                        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem' }}>→</span>
                        {c.secondaries.map(s => (
                          <span key={s} style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem', borderRadius: 4, background: `${FC[s]?.color}15`, color: FC[s]?.color, fontWeight: 700 }}>
                            {FC[s]?.icon} {FC[s]?.short}
                          </span>
                        ))}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>{c.implication}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: c.score >= 75 ? '#ff453a' : c.score >= 55 ? '#ff9f0a' : '#30d158', fontFamily: 'monospace' }}>{c.score}</div>
                      <div style={{ fontSize: '0.55rem', padding: '0.1rem 0.35rem', borderRadius: 4, fontWeight: 700, background: c.type === 'opportunity' ? 'rgba(48,209,88,0.15)' : 'rgba(255,69,58,0.15)', color: c.type === 'opportunity' ? '#30d158' : '#ff453a' }}>
                        {c.type === 'opportunity' ? 'OPP' : 'THR'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
