/**
 * BcgCapitalFlowMap — Strategic Capital Flow Sankey (Fase 1)
 * ===========================================================
 * EL insight doctrinal más importante del BCG:
 * Cash Cows → financian → Stars + Question Marks
 * Stars → reinversión → mantener posición
 * Dogs → desinvertir → liberar capital
 * Question Marks → absorben capital → se convierten en Star o Dog
 *
 * Visualización Sankey de flujo de capital entre cuadrantes y unidades.
 * Sin dependencia de revenue real: flujo inferido desde quadrant + posición.
 * Doctrina: Henderson (1970) + Capital Allocation Theory.
 */
"use client";
import { useState } from 'react';

const QUADRANTS = {
  star:     { color: '#6366f1', icon: '⭐', label: 'Star',          role: 'CONSUME + GENERA', desc: 'Alto crecimiento requiere inversión continua pero genera flujo creciente' },
  cow:      { color: '#10b981', icon: '🐄', label: 'Cash Cow',      role: 'GENERADOR NETO',  desc: 'Mercado maduro, alta participación — genera el mayor flujo libre de caja' },
  question: { color: '#f59e0b', icon: '❓', label: 'Question Mark', role: 'ABSORBEDOR',      desc: 'Requiere inversión masiva para convertirse en Star o debe desinvertirse' },
  dog:      { color: '#ff4d6a', icon: '🐕', label: 'Dog',           role: 'DESTRUCTOR',      desc: 'Bajo crecimiento + baja participación — liberar capital mediante desinversión' },
};

// Capital flow magnitude by quadrant pair (doctrinal)
const FLOWS = [
  { from: 'cow',  to: 'star',     weight: 0.9, label: 'Financia expansión',     color: '#10b981' },
  { from: 'cow',  to: 'question', weight: 0.6, label: 'Financia evaluación',    color: '#10b981' },
  { from: 'star', to: 'star',     weight: 0.5, label: 'Reinversión interna',    color: '#6366f1' },
  { from: 'dog',  to: 'cow',      weight: 0.3, label: 'Libera capital residual',color: '#ff4d6a' },
];

// Assign approximate capital weight to a unit
function capitalWeight(u) {
  const weights = { cow: 1.0, star: 0.75, question: 0.4, dog: 0.2 };
  return (weights[u.quadrant] || 0.3) + u.share * 0.3;
}

export default function BcgCapitalFlowMap({ units = [] }) {
  const [selected, setSelected] = useState(null);
  const [flowHover, setFlowHover] = useState(null);

  if (!units.length) return null;

  const byQ = { star: [], cow: [], question: [], dog: [] };
  units.forEach(u => { if (byQ[u.quadrant]) byQ[u.quadrant].push(u); });

  // Total capital per quadrant
  const qCapital = {};
  Object.keys(byQ).forEach(q => {
    qCapital[q] = byQ[q].reduce((s, u) => s + capitalWeight(u), 0);
  });

  const totalCapital = Object.values(qCapital).reduce((s, v) => s + v, 0);
  const maxQ = Math.max(...Object.values(qCapital));

  // SVG layout: quadrant columns left to right: dog → cow → star → question
  const W = 560, H = 340, COL_W = 110, COL_GAP = (W - 4 * COL_W) / 5;
  const colX = (i) => COL_GAP + i * (COL_W + COL_GAP);
  const ORDER = ['cow', 'star', 'question', 'dog'];

  // Bars
  const maxBarH = 200;
  const barData = ORDER.map((q, i) => {
    const cap = qCapital[q] || 0;
    const barH = Math.max(20, (cap / maxQ) * maxBarH);
    const x = colX(i) + COL_W / 2;
    const y = H - 60 - barH;
    return { q, cap, barH, x, y, cx: colX(i), cy: y, cw: COL_W };
  });

  const barMap = Object.fromEntries(barData.map(b => [b.q, b]));

  // Doctrinal flow arrows between bars
  const docFlows = [
    { from: 'cow', to: 'star', pct: 0.55, color: '#10b981', label: '→ Escala Stars' },
    { from: 'cow', to: 'question', pct: 0.25, color: '#f59e0b', label: '→ Evalúa QM' },
    { from: 'dog', to: 'cow', pct: 0.15, color: '#ff4d6a', label: '← Libera capital' },
    { from: 'question', to: 'star', pct: 0.3, color: '#a855f7', label: '→ Conversión exitosa' },
  ].filter(f => byQ[f.from]?.length > 0 && byQ[f.to]?.length > 0);

  const sel = selected ? units.find(u => u.name === selected) : null;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="glass-panel" style={{ padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💸</div>
          <span style={{ fontSize: '1rem', fontWeight: 700 }}>Strategic Capital Flow Map</span>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
          El BCG es esencialmente un sistema de asignación de capital — no de clasificación · Henderson (1970) Capital Allocation Theory
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1rem', alignItems: 'start' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(2,4,16,0.97), rgba(6,8,24,0.95))' }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
            <defs>
              {ORDER.map(q => (
                <marker key={q} id={`arr-bcg-${q}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={QUADRANTS[q].color} fillOpacity="0.7" />
                </marker>
              ))}
              <filter id="bcgFlowGlow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>

            {/* Flow arrows between quadrants */}
            {docFlows.map((f, i) => {
              const fromBar = barMap[f.from];
              const toBar = barMap[f.to];
              if (!fromBar || !toBar) return null;
              const isHov = flowHover === i;
              const fromX = fromBar.cx + (toBar.cx > fromBar.cx ? COL_W : 0);
              const toX = toBar.cx + (toBar.cx > fromBar.cx ? 0 : COL_W);
              const midY = Math.min(fromBar.y, toBar.y) - 30;
              const path = `M ${fromX} ${fromBar.y + fromBar.barH / 2} Q ${(fromX + toX) / 2} ${midY} ${toX} ${toBar.y + toBar.barH / 2}`;
              return (
                <g key={i} onMouseEnter={() => setFlowHover(i)} onMouseLeave={() => setFlowHover(null)} style={{ cursor: 'pointer' }}>
                  <path d={path} fill="none" stroke={f.color} strokeWidth={isHov ? f.pct * 16 + 4 : f.pct * 8 + 2}
                    strokeOpacity={isHov ? 0.85 : 0.35}
                    markerEnd={`url(#arr-bcg-${f.to})`}
                    filter={isHov ? 'url(#bcgFlowGlow)' : undefined}
                    style={{ transition: 'all 0.2s' }} />
                  {isHov && (
                    <text x={(fromX + toX) / 2} y={midY - 12} textAnchor="middle" fill={f.color} fontSize="9" fontWeight="700">{f.label}</text>
                  )}
                </g>
              );
            })}

            {/* Quadrant bars */}
            {barData.map((b, i) => {
              const q = QUADRANTS[b.q];
              const capPct = Math.round((b.cap / totalCapital) * 100);
              return (
                <g key={i}>
                  {/* Bar */}
                  <rect x={b.cx} y={b.y} width={COL_W} height={b.barH} rx="6"
                    fill={`${q.color}20`} stroke={q.color} strokeWidth="1.5" />
                  {/* Fill animation */}
                  <rect x={b.cx + 2} y={b.y + 2} width={COL_W - 4} height={b.barH - 4} rx="4"
                    fill={`${q.color}15`} />
                  {/* Icon */}
                  <text x={b.cx + COL_W / 2} y={b.y + b.barH / 2 - 6} textAnchor="middle" fontSize="16">{q.icon}</text>
                  {/* Label */}
                  <text x={b.cx + COL_W / 2} y={b.y + b.barH / 2 + 12} textAnchor="middle" fill={q.color} fontSize="8.5" fontWeight="800">{q.label}</text>
                  {/* Capital % */}
                  <text x={b.cx + COL_W / 2} y={b.y - 10} textAnchor="middle" fill={q.color} fontSize="10" fontWeight="900">{capPct}%</text>
                  <text x={b.cx + COL_W / 2} y={b.y - 20} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7.5">del capital</text>
                  {/* Role badge */}
                  <text x={b.cx + COL_W / 2} y={H - 30} textAnchor="middle" fill={q.color} fontSize="7" fontWeight="700" fillOpacity="0.7">
                    {QUADRANTS[b.q].role}
                  </text>
                  {/* Units count */}
                  <text x={b.cx + COL_W / 2} y={H - 15} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7">
                    {byQ[b.q].length} unidad{byQ[b.q].length !== 1 ? 'es' : ''}
                  </text>
                </g>
              );
            })}

            {/* Legend */}
            <text x={W / 2} y={14} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="8">
              Alto = mayor capital estratégico · Flechas = flujo doctrinal de caja
            </text>
          </svg>
        </div>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {flowHover !== null && docFlows[flowHover] ? (
            <div className="glass-panel animate-fade-in" style={{ padding: '1rem', borderLeft: `3px solid ${docFlows[flowHover]?.color}` }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem' }}>Flujo Estratégico</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <span style={{ color: QUADRANTS[docFlows[flowHover].from]?.color, fontWeight: 700, fontSize: '0.8rem' }}>{QUADRANTS[docFlows[flowHover].from]?.icon} {QUADRANTS[docFlows[flowHover].from]?.label}</span>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>→</span>
                <span style={{ color: QUADRANTS[docFlows[flowHover].to]?.color, fontWeight: 700, fontSize: '0.8rem' }}>{QUADRANTS[docFlows[flowHover].to]?.icon} {QUADRANTS[docFlows[flowHover].to]?.label}</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{docFlows[flowHover]?.label}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.3rem' }}>Intensidad: {Math.round(docFlows[flowHover].pct * 100)}% del flujo disponible</div>
            </div>
          ) : (
            <>
              <div className="glass-panel" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.6rem' }}>Roles de Capital</div>
                {ORDER.map(q => {
                  const qd = QUADRANTS[q];
                  const count = byQ[q].length;
                  const cap = Math.round((qCapital[q] / totalCapital) * 100);
                  return (
                    <div key={q} style={{ marginBottom: '0.6rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '0.72rem', color: qd.color, fontWeight: 700 }}>{qd.icon} {qd.label}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{cap}% · {count} und.</span>
                      </div>
                      <div style={{ fontSize: '0.63rem', color: 'var(--text-tertiary)', lineHeight: 1.3, marginBottom: '0.2rem' }}>{qd.desc}</div>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${cap}%`, background: qd.color, borderRadius: 2 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="glass-panel" style={{ padding: '0.85rem' }}>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>📐 Regla de Asignación</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Las Cash Cows financian el crecimiento de Stars. Los Question Marks necesitan decisión rápida. Los Dogs deben liberar capital para reinvertir donde el retorno es mayor.
                </div>
              </div>
            </>
          )}

          {/* Units by quadrant */}
          {Object.entries(byQ).filter(([, v]) => v.length > 0).map(([q, items]) => {
            const qd = QUADRANTS[q];
            return (
              <div key={q} style={{ padding: '0.65rem 0.85rem', borderRadius: 9, background: `${qd.color}06`, border: `1px solid ${qd.color}22` }}>
                <div style={{ fontSize: '0.65rem', color: qd.color, fontWeight: 700, marginBottom: '0.3rem' }}>{qd.icon} {qd.label}</div>
                {items.map((u, i) => (
                  <div key={i} onClick={() => setSelected(selected === u.name ? null : u.name)} style={{
                    fontSize: '0.68rem', color: 'var(--text-secondary)', padding: '0.2rem 0.3rem', borderRadius: 5,
                    cursor: 'pointer', background: selected === u.name ? `${qd.color}15` : 'transparent',
                    transition: 'all 0.15s',
                  }}>
                    {u.name} <span style={{ color: 'var(--text-tertiary)', fontSize: '0.6rem' }}>↑{(u.growth * 100).toFixed(0)}% ◆{(u.share * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
