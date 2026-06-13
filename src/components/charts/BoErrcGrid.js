/**
 * BoErrcGrid — ERRC Action Grid (Blue Ocean Fase 1)
 * ===================================================
 * Eliminate-Reduce-Raise-Create grid visual premium.
 * Cada factor se mapea a su acción ERRC con justificación,
 * impacto visual del delta (industry → proposed), y conectividad
 * con la curva de valor.
 * Doctrina: Kim & Mauborgne (2005) Four Actions Framework.
 */
"use client";
import { useState } from 'react';

const ERRC = {
  eliminate: {
    label: 'ELIMINAR', icon: '❌', color: '#ff4d6a',
    desc: 'Factores que la industria da por sentado pero no generan valor real',
    doctrine: 'Eliminar lo que el cliente no valora reduce costo y complejidad',
    gradient: 'linear-gradient(135deg, rgba(255,77,106,0.08), rgba(255,77,106,0.02))',
  },
  reduce: {
    label: 'REDUCIR', icon: '⬇️', color: '#f59e0b',
    desc: 'Factores sobreinvertidos — bajar por debajo del estándar de la industria',
    doctrine: 'Reducir la sobreinversión en factores commodity libera recursos',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02))',
  },
  raise: {
    label: 'INCREMENTAR', icon: '⬆️', color: '#6366f1',
    desc: 'Factores a elevar significativamente por encima de la industria',
    doctrine: 'Incrementar factores valorados crea diferenciación perceptible',
    gradient: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.02))',
  },
  create: {
    label: 'CREAR', icon: '✨', color: '#10b981',
    desc: 'Factores completamente nuevos que la industria nunca ha ofrecido',
    doctrine: 'Crear nuevos factores abre espacio de mercado no contestado',
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02))',
  },
};

const ERRC_ORDER = ['eliminate', 'reduce', 'raise', 'create'];

function DeltaBar({ from, to, color }) {
  const pctFrom = (from / 5) * 100;
  const pctTo = (to / 5) * 100;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      <span style={{ fontSize: '0.65rem', color: '#ff4d6a', fontWeight: 600, width: 16, textAlign: 'center' }}>{from}</span>
      <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pctFrom}%`, background: '#ff4d6a', opacity: 0.3, borderRadius: 3 }} />
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pctTo}%`, background: color, borderRadius: 3, transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: '0.65rem', color, fontWeight: 700, width: 16, textAlign: 'center' }}>{to}</span>
    </div>
  );
}

export default function BoErrcGrid({ factors = [], actions = [] }) {
  const [expanded, setExpanded] = useState(null);

  if (!factors.length && !actions.length) return null;

  // Map factors by their errc_action
  const factorsByErrc = {};
  ERRC_ORDER.forEach(k => { factorsByErrc[k] = []; });
  factors.forEach(f => {
    if (f.errc_action && factorsByErrc[f.errc_action]) {
      factorsByErrc[f.errc_action].push(f);
    }
  });

  // Also use the actions array for items without factor mapping
  const actionItems = {};
  actions.forEach(a => { actionItems[a.action] = a.items || []; });

  const totalFactors = factors.length;
  const divergenceScore = factors.length > 0
    ? Math.round((factors.reduce((s, f) => s + Math.abs(f.proposed_score - f.industry_score), 0) / (totalFactors * 4)) * 100)
    : 0;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎯</div>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>ERRC Action Grid</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
            Eliminate · Reduce · Raise · Create — Las 4 acciones que definen el océano azul
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '0.45rem 0.85rem', borderRadius: 9, background: divergenceScore >= 40 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${divergenceScore >= 40 ? '#10b981' : '#f59e0b'}33` }}>
          <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>DIVERGENCIA</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: divergenceScore >= 40 ? '#10b981' : '#f59e0b', lineHeight: 1 }}>{divergenceScore}%</div>
        </div>
      </div>

      {/* 2×2 Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {ERRC_ORDER.map(key => {
          const errc = ERRC[key];
          const mappedFactors = factorsByErrc[key];
          const items = actionItems[key] || [];
          const isExp = expanded === key;

          return (
            <div key={key} onClick={() => setExpanded(isExp ? null : key)} style={{
              padding: '1.25rem', borderRadius: 12, cursor: 'pointer',
              background: errc.gradient,
              border: `1.5px solid ${isExp ? errc.color + '55' : errc.color + '22'}`,
              transition: 'all 0.2s', transform: isExp ? 'translateY(-2px)' : 'none',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                <div>
                  <div style={{ fontSize: '1.2rem', marginBottom: '0.1rem' }}>{errc.icon}</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: errc.color }}>{errc.label}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: errc.color, lineHeight: 1 }}>{mappedFactors.length + items.length}</div>
                  <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>factores</div>
                </div>
              </div>

              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.7rem' }}>
                {errc.desc}
              </div>

              {/* Factor cards */}
              {mappedFactors.map((f, i) => (
                <div key={i} style={{ padding: '0.5rem 0.6rem', borderRadius: 8, background: 'rgba(0,0,0,0.15)', marginBottom: '0.35rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{f.name}</div>
                  <DeltaBar from={f.industry_score} to={f.proposed_score} color={errc.color} />
                  {isExp && f.evidence && (
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', marginTop: '0.25rem', lineHeight: 1.3, fontStyle: 'italic' }}>📄 {f.evidence}</div>
                  )}
                </div>
              ))}

              {/* Action items without factor data */}
              {items.filter(item => !mappedFactors.some(f => f.name === item)).map((item, i) => (
                <div key={`a-${i}`} style={{ padding: '0.35rem 0.5rem', borderRadius: 6, background: 'rgba(0,0,0,0.1)', marginBottom: '0.25rem', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                  • {item}
                </div>
              ))}

              {mappedFactors.length === 0 && items.length === 0 && (
                <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Sin factores en esta categoría</div>
              )}

              {/* Doctrine note on expanded */}
              {isExp && (
                <div style={{ marginTop: '0.5rem', padding: '0.4rem 0.5rem', borderRadius: 7, background: `${errc.color}08`, border: `1px solid ${errc.color}25`, fontSize: '0.62rem', color: errc.color, lineHeight: 1.4 }}>
                  📘 {errc.doctrine}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ padding: '0.65rem 1rem', borderRadius: 8, fontSize: '0.65rem', color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
        🏛️ <strong style={{ color: 'var(--text-secondary)' }}>Four Actions Framework</strong> — Kim & Mauborgne (2005) · El ERRC Grid define la lógica de creación de océano azul · Las barras muestran el delta industria→propuesta
      </div>
    </div>
  );
}
