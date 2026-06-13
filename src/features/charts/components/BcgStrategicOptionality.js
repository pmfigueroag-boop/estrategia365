/**
 * BcgStrategicOptionality — Strategic Optionality Map (Fase 3)
 * =============================================================
 * Real Options Theory aplicado al portafolio BCG.
 * Las unidades no solo tienen valor presente — tienen opcionalidad futura.
 *
 * Framework:
 * - Question Marks: ALTA opcionalidad (upside enorme si se convierten en Star)
 * - Stars: MEDIA-ALTA (pueden dominar o caer — volatilidad = opcionalidad)
 * - Cash Cows: BAJA (mercado maduro, menos sorpresas)
 * - Dogs: MUY BAJA (opcionalidad residual — solo nicho/activos)
 *
 * Visual: scatter (opcionalidad × valor actual) con bubble sizing = riesgo.
 * Conecta BCG con Teoría de Opciones Reales (Dixit & Pindyck, 1994).
 */
"use client";
import { useState } from 'react';

const QUADRANTS = {
  star:     { color: '#6366f1', icon: '⭐', label: 'Star',          optBase: 0.65, valueBase: 0.78 },
  cow:      { color: '#10b981', icon: '🐄', label: 'Cash Cow',      optBase: 0.28, valueBase: 0.88 },
  question: { color: '#f59e0b', icon: '❓', label: 'Question Mark',  optBase: 0.88, valueBase: 0.35 },
  dog:      { color: '#ff4d6a', icon: '🐕', label: 'Dog',           optBase: 0.18, valueBase: 0.22 },
};

const OPT_ZONES = [
  { label: 'Opciones de Plataforma', x: 0.6, y: 0.65, desc: 'Alto valor + alta opcionalidad — el cuadrante ideal', color: '#10b981' },
  { label: 'Opciones de Crecimiento', x: 0.15, y: 0.75, desc: 'Baja posición actual pero alto potencial futuro', color: '#f59e0b' },
  { label: 'Activos Premium', x: 0.65, y: 0.25, desc: 'Alto valor presente, opciones de crecimiento limitadas', color: '#6366f1' },
  { label: 'Opciones Residuales', x: 0.1, y: 0.15, desc: 'Bajo valor y poca opcionalidad — evaluar desinversión', color: '#ff4d6a' },
];

const OPTION_TYPES = {
  expansion: { label: 'Opción de Expansión', icon: '🚀', desc: 'Derecho (no obligación) de invertir más y escalar' },
  deferral:  { label: 'Opción de Espera',    icon: '⏳', desc: 'Valor de esperar información antes de comprometer capital' },
  abandonment: { label: 'Opción de Salida',  icon: '🚪', desc: 'Valor de poder desinvertir y recuperar capital' },
  switch:    { label: 'Opción de Cambio',    icon: '🔄', desc: 'Flexibilidad para redirigir el activo a otro mercado' },
};

function computeOptionality(u) {
  const q = QUADRANTS[u.quadrant] || QUADRANTS.dog;
  const growthBonus = Math.max(0, u.growth) * 0.35;
  const shareVariance = (1 - u.share) * 0.15; // low share = high upside optionality
  return Math.max(0.05, Math.min(0.97, q.optBase + growthBonus + shareVariance));
}

function computeCurrentValue(u) {
  const q = QUADRANTS[u.quadrant] || QUADRANTS.dog;
  return Math.max(0.08, Math.min(0.96, q.valueBase + u.share * 0.15 + Math.max(0, u.growth) * 0.1));
}

function getOptionTypes(u) {
  const types = [];
  if (u.quadrant === 'question' || u.quadrant === 'star') types.push('expansion');
  if (u.quadrant === 'question') types.push('deferral');
  if (u.quadrant === 'dog') types.push('abandonment');
  if (u.quadrant === 'star' || u.quadrant === 'cow') types.push('switch');
  return types;
}

function toSvgCoord(optionality, value, W, H, pad) {
  return {
    x: pad + optionality * (W - 2 * pad),
    y: H - pad - value * (H - 2 * pad),
  };
}

export default function BcgStrategicOptionality({ units = [] }) {
  const [selected, setSelected] = useState(null);

  if (!units.length) return null;

  const W = 500, H = 420, PAD = 52;

  const enriched = units.map(u => ({
    ...u,
    optionality: computeOptionality(u),
    currentValue: computeCurrentValue(u),
    optionTypes: getOptionTypes(u),
    q: QUADRANTS[u.quadrant] || QUADRANTS.dog,
    riskRadius: 10 + (1 - computeCurrentValue(u)) * 12 + computeOptionality(u) * 8,
  }));

  const sel = selected ? enriched.find(u => u.name === selected) : null;
  const highOptionality = enriched.filter(u => u.optionality >= 0.65);
  const portfolioOptionality = enriched.reduce((s, u) => s + u.optionality, 0) / enriched.length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎯</div>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>Strategic Optionality Map</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
            Real Options Theory — cada unidad tiene valor presente + opcionalidad futura · Dixit & Pindyck (1994) · Click en burbuja
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '0.5rem 1rem', borderRadius: 10, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
          <div style={{ fontSize: '0.58rem', color: 'var(--text-tertiary)', marginBottom: '0.1rem' }}>PORTFOLIO OPTIONALITY</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>{Math.round(portfolioOptionality * 100)}%</div>
          <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>{highOptionality.length} unidades de alto potencial</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1rem', alignItems: 'start' }}>
        <div className="glass-panel" style={{ padding: '0.75rem', background: 'linear-gradient(135deg, rgba(2,4,16,0.97), rgba(6,8,24,0.95))' }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
            <defs>
              <filter id="optGlow"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              {/* Zone gradients */}
              <radialGradient id="zoneGrad1" cx="75%" cy="25%" r="40%"><stop offset="0%" stopColor="rgba(16,185,129,0.08)" /><stop offset="100%" stopColor="rgba(16,185,129,0)" /></radialGradient>
              <radialGradient id="zoneGrad2" cx="15%" cy="25%" r="35%"><stop offset="0%" stopColor="rgba(245,158,11,0.07)" /><stop offset="100%" stopColor="rgba(245,158,11,0)" /></radialGradient>
              <radialGradient id="zoneGrad3" cx="75%" cy="75%" r="35%"><stop offset="0%" stopColor="rgba(99,102,241,0.07)" /><stop offset="100%" stopColor="rgba(99,102,241,0)" /></radialGradient>
              <radialGradient id="zoneGrad4" cx="15%" cy="75%" r="30%"><stop offset="0%" stopColor="rgba(255,77,106,0.06)" /><stop offset="100%" stopColor="rgba(255,77,106,0)" /></radialGradient>
            </defs>

            {/* Zone backgrounds */}
            <rect x={PAD} y={PAD} width={W-2*PAD} height={H-2*PAD} fill="url(#zoneGrad1)" />
            <rect x={PAD} y={PAD} width={W-2*PAD} height={H-2*PAD} fill="url(#zoneGrad2)" />
            <rect x={PAD} y={PAD} width={W-2*PAD} height={H-2*PAD} fill="url(#zoneGrad3)" />
            <rect x={PAD} y={PAD} width={W-2*PAD} height={H-2*PAD} fill="url(#zoneGrad4)" />

            {/* Grid */}
            {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
              <g key={i}>
                <line x1={PAD + v*(W-2*PAD)} y1={PAD} x2={PAD + v*(W-2*PAD)} y2={H-PAD} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <line x1={PAD} y1={H-PAD - v*(H-2*PAD)} x2={W-PAD} y2={H-PAD - v*(H-2*PAD)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <text x={PAD + v*(W-2*PAD)} y={H-PAD+12} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="8">{(v*100).toFixed(0)}%</text>
                <text x={PAD-6} y={H-PAD - v*(H-2*PAD)+1} textAnchor="end" dominantBaseline="middle" fill="rgba(255,255,255,0.2)" fontSize="8">{(v*100).toFixed(0)}%</text>
              </g>
            ))}

            {/* Axes */}
            <line x1={PAD} y1={PAD} x2={PAD} y2={H-PAD} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
            <line x1={PAD} y1={H-PAD} x2={W-PAD} y2={H-PAD} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

            {/* Zone labels */}
            {OPT_ZONES.map((z, i) => {
              const pos = toSvgCoord(z.x, z.y, W, H, PAD);
              return (
                <text key={i} x={pos.x} y={pos.y} textAnchor="middle" fill={z.color} fontSize="8.5" fontWeight="700" fillOpacity="0.35">{z.label}</text>
              );
            })}

            {/* Diagonal guide line (NPV = Optionality) */}
            <line x1={PAD} y1={H-PAD} x2={W-PAD} y2={PAD} stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray="8,6" />
            <text x={W-PAD-30} y={PAD+20} fill="rgba(255,255,255,0.12)" fontSize="8">Paridad V=O</text>

            {/* Bubbles */}
            {enriched.map((u, i) => {
              const pos = toSvgCoord(u.optionality, u.currentValue, W, H, PAD);
              const isSel = selected === u.name;
              const dimmed = selected && !isSel;
              return (
                <g key={i} onClick={() => setSelected(isSel ? null : u.name)}
                  style={{ cursor: 'pointer', opacity: dimmed ? 0.12 : 1, transition: 'opacity 0.2s' }}>
                  {/* Risk halo */}
                  <circle cx={pos.x} cy={pos.y} r={u.riskRadius + 8} fill={`${u.q.color}08`} />
                  {isSel && <circle cx={pos.x} cy={pos.y} r={u.riskRadius + 14} fill="none" stroke={u.q.color} strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="4,3" />}
                  {/* Main bubble */}
                  <circle cx={pos.x} cy={pos.y} r={u.riskRadius}
                    fill={`${u.q.color}22`} stroke={u.q.color} strokeWidth={isSel ? 2.5 : 1.5}
                    filter={isSel ? 'url(#optGlow)' : undefined} />
                  <circle cx={pos.x} cy={pos.y} r={u.riskRadius * 0.55} fill={`${u.q.color}35`} />
                  {/* Icon */}
                  <text x={pos.x} y={pos.y+1} textAnchor="middle" dominantBaseline="middle" fontSize={u.riskRadius > 18 ? '14' : '11'}>{u.q.icon}</text>
                  {/* Name */}
                  <text x={pos.x} y={pos.y + u.riskRadius + 12} textAnchor="middle"
                    fill={isSel ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.22)'}
                    fontSize={isSel ? '8' : '7'} fontWeight={isSel ? '700' : '400'}>
                    {u.name?.slice(0, 16)}{u.name?.length > 16 ? '…' : ''}
                  </text>
                </g>
              );
            })}

            {/* Axis labels */}
            <text x={W/2} y={H-5} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontWeight="600">Opcionalidad Futura →</text>
            <text x={12} y={H/2} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontWeight="600" transform={`rotate(-90, 12, ${H/2})`}>Valor Presente →</text>
          </svg>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '0.2rem' }}>
            Tamaño = riesgo relativo · Posición derecha-arriba = mayor valor total (presente + futuro)
          </div>
        </div>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sel ? (
            <div className="glass-panel animate-fade-in" style={{ padding: '1rem', borderLeft: `3px solid ${sel.q.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{sel.q.icon} {sel.name}</div>
                  <div style={{ fontSize: '0.65rem', color: sel.q.color }}>{sel.q.label}</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem', marginBottom: '0.6rem' }}>
                <div style={{ padding: '0.45rem', borderRadius: 7, background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.58rem', color: 'var(--text-tertiary)' }}>Valor Presente</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: sel.q.color }}>{Math.round(sel.currentValue * 100)}%</div>
                </div>
                <div style={{ padding: '0.45rem', borderRadius: 7, background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.58rem', color: 'var(--text-tertiary)' }}>Opcionalidad</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#f59e0b' }}>{Math.round(sel.optionality * 100)}%</div>
                </div>
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>Opciones Disponibles</div>
              {sel.optionTypes.map(ot => {
                const opt = OPTION_TYPES[ot];
                return (
                  <div key={ot} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.3rem', padding: '0.35rem 0.45rem', borderRadius: 7, background: `${sel.q.color}08`, border: `1px solid ${sel.q.color}20` }}>
                    <span style={{ fontSize: '0.8rem' }}>{opt.icon}</span>
                    <div>
                      <div style={{ fontSize: '0.67rem', fontWeight: 700, color: sel.q.color }}>{opt.label}</div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', lineHeight: 1.3 }}>{opt.desc}</div>
                    </div>
                  </div>
                );
              })}
              {sel.strategic_action && (
                <div style={{ marginTop: '0.4rem', padding: '0.4rem 0.5rem', borderRadius: 7, background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.68rem', color: '#6366f1', lineHeight: 1.4 }}>
                  🎯 {sel.strategic_action}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="glass-panel" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Top Opcionalidad</div>
                {[...enriched].sort((a, b) => b.optionality - a.optionality).slice(0, 4).map((u, i) => (
                  <div key={i} onClick={() => setSelected(u.name)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', cursor: 'pointer', padding: '0.3rem 0.4rem', borderRadius: 6, transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ color: u.q.color, fontSize: '0.8rem' }}>{u.q.icon}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{u.name}</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f59e0b' }}>{Math.round(u.optionality * 100)}%</span>
                  </div>
                ))}
              </div>
              <div className="glass-panel" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Tipos de Opciones</div>
                {Object.entries(OPTION_TYPES).map(([k, o]) => (
                  <div key={k} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.75rem' }}>{o.icon}</span>
                    <div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{o.label}</div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', lineHeight: 1.3 }}>{o.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="glass-panel" style={{ padding: '0.85rem' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>📚 Real Options Theory</div>
            <div style={{ fontSize: '0.67rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Los Question Marks tienen alta opcionalidad porque representan el derecho (no la obligación) de convertirse en Stars. Esta "opción de conversión" tiene valor aunque el activo actual no lo muestre. Valorar correctamente la opcionalidad evita desinversiones prematuras.
            </div>
            <div style={{ fontSize: '0.6rem', color: '#f59e0b', marginTop: '0.3rem' }}>Dixit & Pindyck (1994) · McGrath Real Options</div>
          </div>
        </div>
      </div>
    </div>
  );
}
