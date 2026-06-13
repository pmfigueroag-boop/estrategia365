/**
 * BoNonCustomerMap — Three Tiers of Non-Customers (Blue Ocean Fase 2)
 * =====================================================================
 * Kim & Mauborgne definen 3 niveles de no-clientes:
 *   Tier 1: "Soon-to-be" — al borde, un pie dentro y otro fuera
 *   Tier 2: "Refusing" — conscientemente eligen no usar la industria
 *   Tier 3: "Unexplored" — nunca han sido considerados como mercado
 *
 * Conecta cada tier con factores ERRC: ¿qué acción captura qué tier?
 * Visual: 3 capas concéntricas con factores mapeados.
 */
"use client";
import { useState } from 'react';

const TIERS = [
  { id: 1, label: 'Tier 1: Al Borde', icon: '🚪', color: '#6366f1',
    desc: 'Clientes que usan la industria minimamente — un pie adentro, otro afuera',
    trigger: 'Los factores de INCREMENTAR y CREAR los atraen al océano azul',
    errcLink: ['raise', 'create'],
    radius: 0.35, fillOpacity: 0.12,
  },
  { id: 2, label: 'Tier 2: Rechazan', icon: '🚫', color: '#f59e0b',
    desc: 'Personas que conscientemente eligen alternativas o NO consumir',
    trigger: 'ELIMINAR las barreras que los repelen y REDUCIR la complejidad',
    errcLink: ['eliminate', 'reduce'],
    radius: 0.62, fillOpacity: 0.07,
  },
  { id: 3, label: 'Tier 3: Inexplorados', icon: '🌍', color: '#10b981',
    desc: 'Nunca han sido considerados como mercado — el océano azul más grande',
    trigger: 'CREAR factores completamente nuevos que hagan relevante la oferta',
    errcLink: ['create'],
    radius: 0.88, fillOpacity: 0.04,
  },
];

const ERRC_META = {
  eliminate: { color: '#ff4d6a', icon: '❌', label: 'Eliminar' },
  reduce:    { color: '#f59e0b', icon: '⬇️', label: 'Reducir'  },
  raise:     { color: '#6366f1', icon: '⬆️', label: 'Incrementar' },
  create:    { color: '#10b981', icon: '✨', label: 'Crear'    },
};

export default function BoNonCustomerMap({ factors = [] }) {
  const [selectedTier, setSelectedTier] = useState(null);

  const W = 400, H = 400, CX = W / 2, CY = H / 2, MAX_R = 175;

  // Map factors to tiers based on ERRC
  const tierFactors = TIERS.map(t => ({
    ...t,
    factors: factors.filter(f => t.errcLink.includes(f.errc_action)),
  }));

  const sel = selectedTier !== null ? tierFactors.find(t => t.id === selectedTier) : null;
  const totalReach = tierFactors.reduce((s, t) => s + t.factors.length, 0);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🌍</div>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>Non-Customer Map — 3 Tiers</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
            Kim & Mauborgne: El océano azul vive en los no-clientes · Click en anillo para explorar
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1rem', alignItems: 'start' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'radial-gradient(ellipse at center, rgba(6,8,28,0.98) 0%, rgba(2,4,16,1) 100%)' }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block', maxWidth: 420, margin: '0 auto' }}>
            <defs>
              <filter id="ncGlow"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>

            {/* Concentric rings (outer to inner) */}
            {[...TIERS].reverse().map(t => {
              const r = t.radius * MAX_R;
              const isSel = selectedTier === t.id;
              return (
                <g key={t.id} onClick={() => setSelectedTier(isSel ? null : t.id)} style={{ cursor: 'pointer' }}>
                  <circle cx={CX} cy={CY} r={r}
                    fill={`${t.color}${Math.round(t.fillOpacity * 255).toString(16).padStart(2, '0')}`}
                    stroke={t.color} strokeWidth={isSel ? 2.5 : 1}
                    strokeOpacity={isSel ? 0.8 : 0.25}
                    filter={isSel ? 'url(#ncGlow)' : undefined}
                    style={{ transition: 'all 0.2s' }} />
                  {/* Label arc */}
                  <text x={CX} y={CY - r + 16} textAnchor="middle"
                    fill={t.color} fontSize="9" fontWeight="700"
                    fillOpacity={isSel ? 0.9 : 0.5}>
                    {t.icon} {t.label}
                  </text>
                </g>
              );
            })}

            {/* Center = current customers */}
            <circle cx={CX} cy={CY} r={MAX_R * 0.18} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
            <text x={CX} y={CY - 4} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8" fontWeight="700">Clientes</text>
            <text x={CX} y={CY + 8} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="7">actuales</text>

            {/* Factor dots positioned in their tier */}
            {tierFactors.map(t => {
              const r = t.radius * MAX_R;
              return t.factors.map((f, i) => {
                const angle = (i / Math.max(1, t.factors.length)) * Math.PI * 1.5 - Math.PI * 0.25;
                const dotR = r * 0.75;
                const x = CX + dotR * Math.cos(angle);
                const y = CY + dotR * Math.sin(angle);
                const errc = ERRC_META[f.errc_action];
                return (
                  <g key={`${t.id}-${i}`}>
                    <circle cx={x} cy={y} r={7} fill={`${errc?.color || t.color}30`} stroke={errc?.color || t.color} strokeWidth="1" />
                    <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="7">{errc?.icon}</text>
                    <text x={x} y={y + 14} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="6.5">
                      {f.name?.slice(0, 12)}
                    </text>
                  </g>
                );
              });
            })}
          </svg>
        </div>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {sel ? (
            <div className="glass-panel animate-fade-in" style={{ padding: '1rem', borderLeft: `3px solid ${sel.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{sel.icon} {sel.label}</div>
                  <div style={{ fontSize: '0.65rem', color: sel.color }}>{sel.factors.length} factores conectados</div>
                </div>
                <button onClick={() => setSelectedTier(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.5rem' }}>{sel.desc}</div>
              <div style={{ padding: '0.4rem 0.55rem', borderRadius: 7, background: `${sel.color}08`, border: `1px solid ${sel.color}25`, fontSize: '0.68rem', color: sel.color, lineHeight: 1.4, marginBottom: '0.5rem' }}>
                🎯 {sel.trigger}
              </div>
              {sel.factors.map((f, i) => {
                const errc = ERRC_META[f.errc_action];
                return (
                  <div key={i} style={{ padding: '0.4rem 0.5rem', borderRadius: 7, background: `${errc?.color}08`, border: `1px solid ${errc?.color}20`, marginBottom: '0.25rem' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-primary)' }}>{errc?.icon} {f.name}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>{f.industry_score}→{f.proposed_score} ({errc?.label})</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              {TIERS.map(t => {
                const tf = tierFactors.find(x => x.id === t.id);
                return (
                  <div key={t.id} onClick={() => setSelectedTier(t.id)} style={{
                    padding: '0.85rem', borderRadius: 10, cursor: 'pointer',
                    background: `${t.color}06`, border: `1px solid ${t.color}22`,
                    transition: 'all 0.15s',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: t.color }}>{t.icon} Tier {t.id}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: t.color }}>{tf?.factors.length || 0}</span>
                    </div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', lineHeight: 1.3 }}>{t.desc}</div>
                  </div>
                );
              })}
            </>
          )}

          <div className="glass-panel" style={{ padding: '0.85rem' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>📚 Non-Customer Theory</div>
            <div style={{ fontSize: '0.67rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              "El mayor potencial del océano azul está en Tier 3 — personas que nunca pensaron en tu mercado. Allí vive la demanda latente más grande." — Kim & Mauborgne
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
