/**
 * PorterBattlefield — Competitive Battlefield Intelligence Board (Phase 2 Premium)
 * ==================================================================================
 * Tactical intelligence board connecting each force to real actors, events, risks,
 * and opportunities extracted from force descriptions. Visual style: intelligence
 * board / geopolitical map / cyber threat visualization.
 */
"use client";
import { useState } from 'react';

const FORCE_CONFIG = {
  rivalry:        { icon: '⚔️', color: '#ff4d6a', label: 'Rivalidad' },
  new_entrants:   { icon: '🚪', color: '#a855f7', label: 'Nuevos Entrantes' },
  substitutes:    { icon: '🔄', color: '#f0a500', label: 'Sustitutos' },
  buyer_power:    { icon: '🛒', color: '#3b82f6', label: 'Poder Comprador' },
  supplier_power: { icon: '📦', color: '#00c896', label: 'Poder Proveedor' },
};

const RISK_LEVELS = {
  critical: { color: '#ff4d6a', label: 'CRITICAL', glow: '0 0 8px #ff4d6a44' },
  high:     { color: '#f0a500', label: 'HIGH', glow: '0 0 6px #f0a50033' },
  moderate: { color: '#6366f1', label: 'MODERATE', glow: 'none' },
  low:      { color: '#00c896', label: 'LOW', glow: 'none' },
};

// Extract intelligence signals from force data
function extractIntelligence(force) {
  const key = force.force_name || force.force || '';
  const config = FORCE_CONFIG[key] || { icon: '•', color: '#888', label: key };
  const cps = force.competitive_pressure_score || (force.score || 3) * 20;
  const risk = cps >= 75 ? 'critical' : cps >= 60 ? 'high' : cps >= 40 ? 'moderate' : 'low';

  // Extract actors and events from sub-determinants
  const subs = force.sub_determinants || [];
  const actors = subs.map(s => ({
    name: s.name || s.label || 'Factor',
    score: s.score || 3,
    type: s.score >= 4 ? 'threat' : s.score <= 2 ? 'opportunity' : 'neutral',
  }));

  // Generate tactical signals from description
  const signals = [];
  const desc = force.description || '';
  const impact = force.impact || '';

  if (desc) signals.push({ type: 'intel', text: desc, icon: '📡' });
  if (impact) signals.push({ type: 'impact', text: impact, icon: '💥' });

  // Trend-based signal
  if (force.trend === 'improving') {
    signals.push({ type: 'alert', text: `Presión en aumento — probabilidad ${force.probability || 50}%`, icon: '🔺' });
  } else if (force.trend === 'declining') {
    signals.push({ type: 'positive', text: `Presión en descenso — oportunidad estratégica`, icon: '📉' });
  }

  return { key, config, cps: Math.round(cps), risk, actors, signals, force };
}

export default function PorterBattlefield({ forces = [] }) {
  const [expandedForce, setExpandedForce] = useState(null);

  if (!forces.length) return null;

  const intel = forces.map(extractIntelligence);

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>
            🎖️ Mapa de Batalla Competitivo
          </h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
            Intelligence Board — actores, eventos, riesgos y oportunidades por fuerza
          </span>
        </div>
        <div style={{
          display: 'flex', gap: '0.5rem', fontSize: '0.65rem',
        }}>
          {['critical', 'high', 'moderate', 'low'].map(level => {
            const count = intel.filter(i => i.risk === level).length;
            const cfg = RISK_LEVELS[level];
            return (
              <span key={level} style={{
                padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 600,
                background: `${cfg.color}15`, color: cfg.color,
                border: `1px solid ${cfg.color}33`,
              }}>
                {count} {cfg.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Battlefield grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {intel.sort((a, b) => b.cps - a.cps).map((item, i) => {
          const isExpanded = expandedForce === item.key;
          const riskCfg = RISK_LEVELS[item.risk];
          return (
            <div key={i}
                 onClick={() => setExpandedForce(isExpanded ? null : item.key)}
                 style={{
                   borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s',
                   background: isExpanded ? `${item.config.color}08` : 'rgba(255,255,255,0.02)',
                   border: `1px solid ${isExpanded ? item.config.color + '44' : 'rgba(255,255,255,0.05)'}`,
                   boxShadow: isExpanded ? riskCfg.glow : 'none',
                 }}>
              {/* Header row */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'auto 1fr auto auto auto',
                alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
              }}>
                {/* Force icon + label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.4rem' }}>{item.config.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.config.label}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                      {item.actors.length} sub-determinantes
                    </div>
                  </div>
                </div>

                {/* CPS bar */}
                <div>
                  <div style={{
                    height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)',
                    overflow: 'hidden', position: 'relative',
                  }}>
                    <div style={{
                      height: '100%', width: `${item.cps}%`, borderRadius: '3px',
                      background: `linear-gradient(90deg, ${item.config.color}88, ${item.config.color})`,
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>

                {/* CPS score */}
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: item.config.color, minWidth: '3rem', textAlign: 'right' }}>
                  {item.cps}
                </span>

                {/* Risk badge */}
                <span style={{
                  fontSize: '0.6rem', padding: '0.15rem 0.4rem', borderRadius: '4px',
                  background: `${riskCfg.color}22`, color: riskCfg.color,
                  fontWeight: 700, letterSpacing: '0.05em',
                }}>
                  {riskCfg.label}
                </span>

                {/* Expand */}
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                  ▼
                </span>
              </div>

              {/* Expanded intel panel */}
              {isExpanded && (
                <div style={{
                  padding: '0 1rem 1rem 1rem',
                  borderTop: `1px solid ${item.config.color}22`,
                  animation: 'fadeIn 0.3s ease',
                }}>
                  {/* Actors grid */}
                  {item.actors.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <div style={{ fontSize: '0.7rem', color: item.config.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                        🎯 Sub-determinantes
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {item.actors.map((actor, j) => (
                          <span key={j} style={{
                            padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem',
                            background: actor.type === 'threat' ? '#ff4d6a15' : actor.type === 'opportunity' ? '#00c89615' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${actor.type === 'threat' ? '#ff4d6a33' : actor.type === 'opportunity' ? '#00c89633' : 'rgba(255,255,255,0.08)'}`,
                            color: actor.type === 'threat' ? '#ff4d6a' : actor.type === 'opportunity' ? '#00c896' : 'var(--text-secondary)',
                          }}>
                            {actor.type === 'threat' ? '⚠️' : actor.type === 'opportunity' ? '✅' : '○'} {actor.name} ({actor.score}/5)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Intelligence signals */}
                  {item.signals.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <div style={{ fontSize: '0.7rem', color: item.config.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                        📡 Señales de Inteligencia
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        {item.signals.map((sig, j) => (
                          <div key={j} style={{
                            padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem',
                            background: sig.type === 'alert' ? '#ff4d6a08' : sig.type === 'positive' ? '#00c89608' : 'rgba(255,255,255,0.02)',
                            borderLeft: `2px solid ${sig.type === 'alert' ? '#ff4d6a' : sig.type === 'positive' ? '#00c896' : 'var(--text-tertiary)'}`,
                            color: 'var(--text-secondary)', lineHeight: 1.5,
                          }}>
                            {sig.icon} {sig.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '1rem', padding: '0.5rem 0.75rem', fontSize: '0.7rem',
        color: 'var(--text-tertiary)', borderLeft: '3px solid var(--accent-secondary)',
        background: 'rgba(255,255,255,0.02)', borderRadius: '0 6px 6px 0',
      }}>
        🎖️ Click en cada fuerza para desplegar la inteligencia competitiva completa.
        Los sub-determinantes se clasifican como ⚠️ amenaza (≥4) o ✅ oportunidad (≤2).
      </div>
    </div>
  );
}
