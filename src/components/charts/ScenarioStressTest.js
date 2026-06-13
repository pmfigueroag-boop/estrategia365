/**
 * ScenarioStressTest — Transversal Scenario Stress Test
 * =====================================================
 * Simula shocks macro que impactan todos los módulos simultáneamente.
 * Cada escenario tiene un perfil de impacto por módulo.
 *
 * Scenarios:
 * 1. Recesión Global — comprime BCG shares, debilita FODA, PESTEL E crítico
 * 2. Disrupción Tecnológica — erosiona VRIO, abre Blue Ocean, Porter +
 * 3. Cambio Regulatorio — PESTEL P/L explota, Porter barrieras +
 * 4. Competidor Agresivo — Porter ++, BCG shares -, FODA amenazas +
 * 5. Expansión de Mercado — BCG growth +, Blue Ocean oportunidad, FODA +
 *
 * Visual: impact matrix + ripple visualization + recommended actions.
 */
"use client";
import { useState } from 'react';

const MODULES = {
  porter:    { label: 'Porter 5F',  icon: '⚔️', color: '#6366f1' },
  pestel:    { label: 'PESTEL',     icon: '🌍', color: '#10b981' },
  foda:      { label: 'FODA',       icon: '🎯', color: '#f59e0b' },
  vrio:      { label: 'VRIO',       icon: '💎', color: '#8b5cf6' },
  bcg:       { label: 'BCG',        icon: '📊', color: '#ec4899' },
  blueocean: { label: 'Blue Ocean', icon: '🌊', color: '#06b6d4' },
};

const SCENARIOS = [
  { id: 'recession', label: '📉 Recesión Global', desc: 'Contracción del PIB, caída de demanda, restricción de crédito',
    impacts: { porter: -15, pestel: -35, foda: -25, vrio: -10, bcg: -30, blueocean: +10 },
    ripple: 'La recesión comprime shares BCG, debilita FODA (amenazas +), pero abre oportunidades Blue Ocean por competidores debilitados',
    actions: ['Proteger Cash Cows', 'Desinvertir Dogs rápidamente', 'Invertir selectivamente en Blue Ocean', 'Fortalecer recursos VRIO defensivos'],
  },
  { id: 'disruption', label: '💥 Disrupción Tecnológica', desc: 'Nueva tecnología transforma el mercado fundamentalmente',
    impacts: { porter: -20, pestel: -10, foda: -15, vrio: -40, bcg: -20, blueocean: +35 },
    ripple: 'Erosiona ventajas VRIO existentes, pero maximiza la opcionalidad Blue Ocean. Las Stars BCG pueden quedar obsoletas si no se adaptan',
    actions: ['Auditar recursos VRIO bajo amenaza de obsolescencia', 'Acelerar factores de CREAR en Blue Ocean', 'Reclasificar unidades BCG afectadas', 'Monitorear nuevos entrantes (Porter)'],
  },
  { id: 'regulatory', label: '⚖️ Cambio Regulatorio', desc: 'Nueva legislación impone barreras, costos o restricciones',
    impacts: { porter: +15, pestel: -40, foda: -20, vrio: +10, bcg: -10, blueocean: -5 },
    ripple: 'PESTEL Legal/Político explota. Porter: barreras de entrada suben (positivo para incumbents). VRIO compliance se vuelve recurso valioso',
    actions: ['Priorizar análisis PESTEL Legal', 'Capitalizar barreras Porter como ventaja', 'Convertir compliance en recurso VRIO', 'Ajustar FODA: nueva amenaza + nueva fortaleza'],
  },
  { id: 'competitor', label: '🏴‍☠️ Competidor Agresivo', desc: 'Nuevo jugador bien financiado entra con precios bajos',
    impacts: { porter: -35, pestel: 0, foda: -25, vrio: -15, bcg: -25, blueocean: +20 },
    ripple: 'Intensidad Porter sube dramáticamente. BCG shares se comprimen. VRIO testa la imitabilidad real. Blue Ocean ofrece escape de océano rojo',
    actions: ['Activar defensas VRIO de imitabilidad', 'Proteger Stars BCG con inversión', 'Acelerar estrategia Blue Ocean', 'Reforzar FODA: mapear nuevas amenazas'],
  },
  { id: 'expansion', label: '🚀 Expansión de Mercado', desc: 'Boom económico, apertura de nuevos mercados, demanda creciente',
    impacts: { porter: +5, pestel: +20, foda: +25, vrio: +15, bcg: +30, blueocean: +25 },
    ripple: 'Escenario positivo generalizado. BCG growth sube para todas las unidades. Blue Ocean tiene ventana de creación. VRIO puede escalar',
    actions: ['Escalar Stars BCG agresivamente', 'Convertir Question Marks a Stars', 'Expandir factores CREAR en Blue Ocean', 'Fortalecer fortalezas FODA existentes'],
  },
];

const IMPACT_TIERS = [
  { min: 20, label: 'BENEFICIO ALTO', color: '#10b981', icon: '🟢' },
  { min: 5,  label: 'BENEFICIO LEVE', color: '#6366f1', icon: '🔵' },
  { min: -5, label: 'NEUTRAL',        color: '#94a3b8', icon: '⚪' },
  { min: -20,label: 'IMPACTO LEVE',   color: '#f59e0b', icon: '🟡' },
  { min: -100, label: 'IMPACTO ALTO', color: '#ff4d6a', icon: '🔴' },
];

function impactTier(val) { return IMPACT_TIERS.find(t => val >= t.min) || IMPACT_TIERS[IMPACT_TIERS.length - 1]; }

export default function ScenarioStressTest({ planId }) {
  const [scenarioId, setScenarioId] = useState(null);

  const scenario = SCENARIOS.find(s => s.id === scenarioId);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,77,106,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚡</div>
            <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>Scenario Stress Test — Transversal</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.8rem' }}>
            Simula shocks macro y observa el impacto en cada módulo estratégico · 6 módulos × 5 escenarios
          </div>
        </div>
      </div>

      {/* Scenario buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.6rem' }}>
        {SCENARIOS.map(s => {
          const isSel = scenarioId === s.id;
          const netImpact = Object.values(s.impacts).reduce((sum, v) => sum + v, 0);
          const tier = impactTier(netImpact / 6);
          return (
            <div key={s.id} onClick={() => setScenarioId(isSel ? null : s.id)} style={{
              padding: '1rem', borderRadius: 11, cursor: 'pointer',
              background: isSel ? `${tier.color}12` : 'rgba(255,255,255,0.02)',
              border: `1.5px solid ${isSel ? tier.color + '55' : 'rgba(255,255,255,0.08)'}`,
              transition: 'all 0.2s', transform: isSel ? 'translateY(-2px)' : 'none',
            }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>{s.label}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', lineHeight: 1.4, marginBottom: '0.3rem' }}>{s.desc}</div>
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                {Object.entries(s.impacts).map(([k, v]) => {
                  const m = MODULES[k];
                  const t = impactTier(v);
                  return (
                    <span key={k} style={{ padding: '0.1rem 0.25rem', borderRadius: 3, fontSize: '0.55rem', background: `${t.color}15`, color: t.color, fontWeight: 600 }}>
                      {m.icon}{v > 0 ? '+' : ''}{v}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Impact analysis */}
      {scenario && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Impact matrix */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Impacto por Módulo — {scenario.label}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {Object.entries(MODULES).map(([k, m]) => {
                const impact = scenario.impacts[k] || 0;
                const tier = impactTier(impact);
                const barWidth = Math.abs(impact);
                return (
                  <div key={k} style={{ padding: '0.7rem 0.5rem', borderRadius: 10, background: `${tier.color}08`, border: `1px solid ${tier.color}22`, textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>{m.icon}</div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: m.color, marginBottom: '0.2rem' }}>{m.label}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: tier.color, lineHeight: 1 }}>
                      {impact > 0 ? '+' : ''}{impact}
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, margin: '0.3rem auto 0', width: '80%', overflow: 'hidden', position: 'relative' }}>
                      {impact >= 0 ? (
                        <div style={{ height: '100%', width: `${Math.min(barWidth * 2.5, 100)}%`, background: tier.color, borderRadius: 2 }} />
                      ) : (
                        <div style={{ height: '100%', width: `${Math.min(barWidth * 2.5, 100)}%`, background: tier.color, borderRadius: 2, marginLeft: 'auto' }} />
                      )}
                    </div>
                    <div style={{ fontSize: '0.55rem', color: tier.color, marginTop: '0.2rem', fontWeight: 600 }}>{tier.icon} {tier.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Ripple description */}
            <div style={{ padding: '0.75rem 1rem', borderRadius: 9, background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.62rem', color: '#f59e0b', fontWeight: 700, marginBottom: '0.2rem' }}>🌊 EFECTO CASCADA</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{scenario.ripple}</div>
            </div>
          </div>

          {/* Recommended actions */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.65rem' }}>🎯 Acciones Recomendadas</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {scenario.actions.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', padding: '0.5rem 0.6rem', borderRadius: 8, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <span style={{ padding: '0.1rem 0.3rem', borderRadius: 4, background: 'rgba(99,102,241,0.2)', fontSize: '0.58rem', fontWeight: 800, color: '#6366f1', flexShrink: 0 }}>P{i + 1}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{a}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cross-module heatmap */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.65rem' }}>📊 Escenarios × Módulos — Heatmap Comparativo</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.65rem' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '0.4rem', textAlign: 'left', color: 'var(--text-tertiary)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Escenario</th>
                    {Object.entries(MODULES).map(([k, m]) => (
                      <th key={k} style={{ padding: '0.4rem', textAlign: 'center', color: m.color, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{m.icon}</th>
                    ))}
                    <th style={{ padding: '0.4rem', textAlign: 'center', color: 'var(--text-tertiary)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>NET</th>
                  </tr>
                </thead>
                <tbody>
                  {SCENARIOS.map(s => {
                    const net = Object.values(s.impacts).reduce((sum, v) => sum + v, 0);
                    const isActive = s.id === scenarioId;
                    return (
                      <tr key={s.id} onClick={() => setScenarioId(s.id)} style={{
                        cursor: 'pointer', background: isActive ? 'rgba(99,102,241,0.08)' : 'transparent',
                        transition: 'background 0.15s',
                      }}>
                        <td style={{ padding: '0.4rem', fontWeight: isActive ? 700 : 400, color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{s.label}</td>
                        {Object.keys(MODULES).map(k => {
                          const v = s.impacts[k];
                          const t = impactTier(v);
                          return (
                            <td key={k} style={{ padding: '0.35rem', textAlign: 'center' }}>
                              <span style={{ padding: '0.15rem 0.35rem', borderRadius: 4, background: `${t.color}18`, color: t.color, fontWeight: 700, fontSize: '0.62rem' }}>
                                {v > 0 ? '+' : ''}{v}
                              </span>
                            </td>
                          );
                        })}
                        <td style={{ padding: '0.35rem', textAlign: 'center', fontWeight: 800, color: impactTier(net / 6).color, fontSize: '0.68rem' }}>
                          {net > 0 ? '+' : ''}{net}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!scenario && (
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚡</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Selecciona un escenario para simular el impacto transversal</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Cada escenario afecta los 6 módulos simultáneamente — cascada de efectos estratégicos</div>
        </div>
      )}

      <div style={{ padding: '0.65rem 1rem', borderRadius: 8, fontSize: '0.65rem', color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
        ⚡ <strong style={{ color: 'var(--text-secondary)' }}>Transversal Stress Test</strong> — Scenario Planning (Schwartz, 1991) · Cada shock ripple a través de Porter → PESTEL → FODA → VRIO → BCG → Blue Ocean
      </div>
    </div>
  );
}
