/**
 * PorterStrategyBridge — Sankey Flow: Force → Diagnosis → Action
 * ==============================================================
 * Institutional-grade causal flow visualization.
 * Connects competitive pressure to strategic doctrine automatically.
 * Visual: animated Sankey-inspired flow with pressure bars, action cards,
 * and a doctrinal recommendation engine. StaaS Engine v2.
 */
"use client";
import { useState } from 'react';

const QUADRANT_CONFIG = {
  critical_threat: {
    label: 'Amenaza Crítica', color: '#ff4d6a', bg: 'rgba(255,77,106,0.08)',
    actions: ['Diferenciación radical', 'Alianzas estratégicas defensivas', 'Rediseño de propuesta de valor'],
    doctrine: 'Blue Ocean / Diferenciación',
    icon: '🔴',
  },
  high_pressure: {
    label: 'Alta Presión', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',
    actions: ['Fortalecer ventajas competitivas', 'Invertir en moats defensivos', 'Optimizar estructura de costos'],
    doctrine: 'Porter Competitive Advantage',
    icon: '🟠',
  },
  emerging_threat: {
    label: 'Amenaza Emergente', color: '#a855f7', bg: 'rgba(168,85,247,0.08)',
    actions: ['Monitorear y preparar contingencia', 'Explorar opciones de diversificación', 'Construir early warning system'],
    doctrine: 'Ansoff / Real Options',
    icon: '🟣',
  },
  manageable: {
    label: 'Manejable', color: '#10b981', bg: 'rgba(16,185,129,0.08)',
    actions: ['Mantener y optimizar', 'Explotación de la posición actual', 'Extraer eficiencias operativas'],
    doctrine: 'Kaizen / Operational Excellence',
    icon: '🟢',
  },
};

const FORCE_META = {
  rivalry:        { label: 'Rivalidad Competitiva',   icon: '⚔️', cta: 'Diferenciarse o liderar costos' },
  new_entrants:   { label: 'Nuevos Entrantes',         icon: '🚪', cta: 'Elevar barreras de entrada' },
  substitutes:    { label: 'Amenaza de Sustitutos',    icon: '🔄', cta: 'Redefinir propuesta de valor' },
  buyer_power:    { label: 'Poder del Comprador',      icon: '🛒', cta: 'Crear switching costs y lock-in' },
  supplier_power: { label: 'Poder del Proveedor',      icon: '📦', cta: 'Diversificar base de suministro' },
};

const STRATEGIC_BRIDGES = {
  rivalry_critical_threat:      { framework: 'Blue Ocean Strategy', move: 'Crear espacio de mercado sin competencia directa' },
  rivalry_high_pressure:        { framework: 'Porter Cost Leadership', move: 'Escala + eficiencia operacional radical' },
  new_entrants_critical_threat: { framework: 'Walled Garden', move: 'IP, regulación, network effects como barrera' },
  new_entrants_manageable:      { framework: 'First Mover Advantage', move: 'Acelerar captura de mercado' },
  substitutes_critical_threat:  { framework: 'Jobs-to-be-Done', move: 'Reimaginar el trabajo que el cliente contrata' },
  buyer_power_critical_threat:  { framework: 'Lock-in Ecosystem', move: 'Integrar plataformas, datos y flujos del cliente' },
  supplier_power_high_pressure: { framework: 'Vertical Integration', move: 'Adquirir o desarrollar capacidades upstream' },
};

export default function PorterStrategyBridge({ topActions = [], attractivenessMatrix = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [expandedIdx, setExpandedIdx] = useState(null);

  if (!topActions.length) return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔗</div>
      <p style={{ fontSize: '0.85rem' }}>Ejecuta el análisis profundo de Porter para activar el Strategy Bridge.</p>
    </div>
  );

  const flowData = topActions.map(action => {
    const matrix = attractivenessMatrix.find(m => m.force === action.force);
    const qKey = action.quadrant || 'manageable';
    const qConfig = QUADRANT_CONFIG[qKey] || QUADRANT_CONFIG.manageable;
    const forceMeta = FORCE_META[action.force] || { label: action.label || action.force, icon: '•', cta: '' };
    const bridgeKey = `${action.force}_${qKey}`;
    const bridge = STRATEGIC_BRIDGES[bridgeKey] || null;
    const cps = matrix?.score ? matrix.score * 20 : action.cps || 50;
    return { ...action, qConfig, qKey, forceMeta, bridge, cps: Math.round(cps), matrix };
  });

  // Summary counts
  const counts = Object.fromEntries(
    Object.keys(QUADRANT_CONFIG).map(k => [k, flowData.filter(d => d.qKey === k).length])
  );
  const criticalCount = counts.critical_threat + counts.high_pressure;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
        {Object.entries(QUADRANT_CONFIG).map(([key, cfg]) => (
          <div key={key} style={{
            padding: '1rem', borderRadius: '12px', textAlign: 'center',
            background: counts[key] > 0 ? cfg.bg : 'rgba(255,255,255,0.02)',
            border: `1px solid ${counts[key] > 0 ? cfg.color + '33' : 'rgba(255,255,255,0.05)'}`,
            transition: 'all 0.3s',
          }}>
            <div style={{ fontSize: '0.65rem', color: cfg.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
              {cfg.icon} {cfg.label}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: counts[key] > 0 ? cfg.color : 'var(--text-tertiary)', lineHeight: 1 }}>
              {counts[key]}
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>fuerza{counts[key] !== 1 ? 's' : ''}</div>
          </div>
        ))}
      </div>

      {/* Alert banner */}
      {criticalCount > 0 && (
        <div style={{
          padding: '0.75rem 1.25rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.25)',
        }}>
          <span style={{ fontSize: '1.2rem' }}>⚠️</span>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#ff4d6a', fontWeight: 700 }}>
              {criticalCount} fuerza{criticalCount !== 1 ? 's' : ''} en zona de presión elevada
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginLeft: '0.5rem' }}>
              — requieren acción estratégica inmediata
            </span>
          </div>
        </div>
      )}

      {/* Main Flow */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
          }}>🔗</div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700 }}>Puente Análisis → Estrategia</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
              Flujo causal institucional · Cada fuerza genera doctrina estratégica automática · StaaS Engine
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {flowData.map((item, i) => {
            const isHovered = hoveredIdx === i;
            const isExpanded = expandedIdx === i;
            return (
              <div key={i}
                onClick={() => setExpandedIdx(isExpanded ? null : i)}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  borderRadius: '12px', overflow: 'hidden', cursor: 'pointer',
                  border: `1px solid ${isHovered || isExpanded ? item.qConfig.color + '44' : 'rgba(255,255,255,0.05)'}`,
                  background: isHovered || isExpanded ? item.qConfig.bg : 'rgba(255,255,255,0.02)',
                  transition: 'all 0.25s',
                }}>

                {/* Main row */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '2fr 24px 1.2fr 24px 2fr 24px 1.5fr',
                  alignItems: 'center', gap: '0.5rem', padding: '0.9rem 1.1rem',
                }}>
                  {/* Force */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.3rem' }}>{item.forceMeta.icon}</span>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {item.forceMeta.label}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>
                        CPS {item.cps}%
                      </div>
                      {/* Pressure bar */}
                      <div style={{ height: 3, width: 80, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${item.cps}%`,
                          background: `linear-gradient(90deg, ${item.qConfig.color}88, ${item.qConfig.color})`,
                          borderRadius: 2, transition: 'width 0.6s ease',
                        }} />
                      </div>
                    </div>
                  </div>

                  {/* Arrow 1 */}
                  <div style={{ color: item.qConfig.color, fontSize: '1rem', textAlign: 'center' }}>→</div>

                  {/* Quadrant */}
                  <div style={{
                    padding: '0.4rem 0.7rem', borderRadius: '8px', textAlign: 'center',
                    background: `${item.qConfig.color}15`, border: `1px dashed ${item.qConfig.color}55`,
                  }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: item.qConfig.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {item.qConfig.icon} {item.qConfig.label}
                    </div>
                    {item.matrix && (
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>
                        Score {item.matrix.score}/5 · P{item.matrix.probability || '—'}%
                      </div>
                    )}
                  </div>

                  {/* Arrow 2 */}
                  <div style={{ color: item.qConfig.color, fontSize: '1rem', textAlign: 'center' }}>⟶</div>

                  {/* Action */}
                  <div style={{ borderLeft: `3px solid ${item.qConfig.color}`, paddingLeft: '0.75rem' }}>
                    <div style={{ fontSize: '0.6rem', color: item.qConfig.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
                      Acción Estratégica
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {item.recommendation || item.forceMeta.cta}
                    </div>
                  </div>

                  {/* Arrow 3 */}
                  <div style={{ color: item.qConfig.color, fontSize: '0.85rem', textAlign: 'center', opacity: 0.5 }}>⟶</div>

                  {/* Framework */}
                  {item.bridge ? (
                    <div style={{
                      padding: '0.4rem 0.6rem', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                    }}>
                      <div style={{ fontSize: '0.6rem', color: 'var(--accent-secondary)', fontWeight: 700, marginBottom: '0.15rem' }}>
                        📘 {item.bridge.framework}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', lineHeight: 1.3 }}>
                        {item.bridge.move}
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '0.4rem 0.6rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{item.qConfig.doctrine}</div>
                    </div>
                  )}
                </div>

                {/* Expanded row */}
                {isExpanded && (
                  <div style={{
                    padding: '0 1.1rem 1rem', borderTop: `1px solid ${item.qConfig.color}22`,
                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '0.25rem',
                    paddingTop: '0.75rem',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginBottom: '0.4rem', fontWeight: 700, textTransform: 'uppercase' }}>
                        Acciones Doctrinales
                      </div>
                      {item.qConfig.actions.map((a, ai) => (
                        <div key={ai} style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', padding: '0.25rem 0', display: 'flex', gap: '0.4rem' }}>
                          <span style={{ color: item.qConfig.color }}>▸</span> {a}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginBottom: '0.4rem', fontWeight: 700, textTransform: 'uppercase' }}>
                        Movida Estratégica
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {item.bridge?.move || item.forceMeta.cta}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: item.qConfig.color, marginTop: '0.4rem', fontWeight: 600 }}>
                        Marco: {item.bridge?.framework || item.qConfig.doctrine}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginBottom: '0.4rem', fontWeight: 700, textTransform: 'uppercase' }}>
                        Tendencia
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>
                          {item.trend === 'improving' ? '📈' : item.trend === 'declining' ? '📉' : '➡️'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          {item.trend === 'improving' ? 'Mejorando' : item.trend === 'declining' ? 'Deteriorando' : 'Estable'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Doctrinal footer */}
      <div style={{
        padding: '0.75rem 1.25rem', borderRadius: '10px', fontSize: '0.72rem',
        color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.5rem',
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
      }}>
        <span style={{ color: 'var(--accent-secondary)', fontSize: '0.9rem' }}>🏛️</span>
        <span>
          <strong style={{ color: 'var(--text-secondary)' }}>StaaS Strategy Engine</strong> — 
          Este flujo conecta <strong>análisis competitivo → formulación estratégica doctrinal</strong> en tiempo real.
          Frameworks: Porter · Blue Ocean · Ansoff · BCG · Rumelt.
          Haz click en cualquier fila para ver las acciones específicas recomendadas.
        </span>
      </div>
    </div>
  );
}
