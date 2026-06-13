/**
 * PorterPressureMap — Strategic Pressure Gravitational Field (Phase 1 Premium)
 * =============================================================================
 * Bloomberg/Palantir-style visualization showing competitive forces as
 * gravitational fields pressing toward the enterprise core. Size=intensity,
 * color=risk, pulsation=trend. Pure SVG, zero dependencies.
 */
"use client";
import { useState, useEffect } from 'react';

const FORCE_CONFIG = {
  rivalry:        { label: 'Rivalidad',         angle: 270, icon: '⚔️' },
  new_entrants:   { label: 'Nuevos Entrantes',  angle: 342, icon: '🚪' },
  substitutes:    { label: 'Sustitutos',        angle: 54,  icon: '🔄' },
  buyer_power:    { label: 'Poder Comprador',    angle: 126, icon: '🛒' },
  supplier_power: { label: 'Poder Proveedor',    angle: 198, icon: '📦' },
};

const RISK_COLORS = {
  critical: { fill: '#ff4d6a', glow: '#ff4d6a55' },
  high:     { fill: '#f0a500', glow: '#f0a50044' },
  moderate: { fill: '#6366f1', glow: '#6366f133' },
  low:      { fill: '#00c896', glow: '#00c89622' },
};

function getRisk(cps) {
  if (cps >= 75) return 'critical';
  if (cps >= 60) return 'high';
  if (cps >= 40) return 'moderate';
  return 'low';
}

export default function PorterPressureMap({ forces = [], industryAssessment }) {
  const [hovered, setHovered] = useState(null);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => (p + 1) % 60), 50);
    return () => clearInterval(interval);
  }, []);

  if (!forces.length) return null;

  const W = 600, H = 500, CX = W / 2, CY = H / 2;
  const ORBIT_R = 160;

  // Calculate positions
  const forceNodes = forces.map(f => {
    const key = f.force_name || f.force || 'unknown';
    const config = FORCE_CONFIG[key] || { label: key, angle: 0, icon: '•' };
    const cps = f.competitive_pressure_score || (f.score || 3) * 20;
    const risk = getRisk(cps);
    const colors = RISK_COLORS[risk];
    const rad = (config.angle * Math.PI) / 180;

    // Higher CPS = closer to center (more pressure)
    const distance = ORBIT_R * (1 - (cps / 200)); // 0→160, 100→80
    const x = CX + Math.cos(rad) * distance;
    const y = CY + Math.sin(rad) * distance;

    // Size based on CPS
    const radius = 22 + (cps / 100) * 20; // 22-42px

    // Pulsation for improving trends
    const trend = f.trend || 'stable';
    const pulseScale = trend === 'improving'
      ? 1 + Math.sin(pulse * 0.15) * 0.12
      : trend === 'declining'
        ? 1 - Math.sin(pulse * 0.08) * 0.05
        : 1;

    return {
      key, ...config, cps: Math.round(cps), risk, colors, x, y,
      radius: radius * pulseScale, baseRadius: radius,
      score: f.score || 3, trend, probability: f.probability || 50,
      source: f.source || 'unknown',
    };
  });

  const posture = industryAssessment?.posture || 'selective';
  const coreColor = posture === 'defensive' ? '#ff4d6a' : posture === 'offensive' ? '#00c896' : '#f0a500';

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>🌐 Mapa de Presión Estratégica</h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Campo gravitacional competitivo • Proximidad = presión</span>
        </div>
        <div style={{
          padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600,
          background: `${coreColor}22`, color: coreColor, border: `1px solid ${coreColor}44`,
        }}>
          Postura {posture === 'defensive' ? '🛡️ Defensiva' : posture === 'offensive' ? '⚔️ Ofensiva' : '⚖️ Selectiva'}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: '620px', margin: '0 auto', display: 'block' }}>
        <defs>
          {forceNodes.map(n => (
            <radialGradient key={`grad-${n.key}`} id={`grad-${n.key}`}>
              <stop offset="0%" stopColor={n.colors.fill} stopOpacity="0.4" />
              <stop offset="60%" stopColor={n.colors.fill} stopOpacity="0.1" />
              <stop offset="100%" stopColor={n.colors.fill} stopOpacity="0" />
            </radialGradient>
          ))}
          <radialGradient id="core-glow">
            <stop offset="0%" stopColor={coreColor} stopOpacity="0.3" />
            <stop offset="50%" stopColor={coreColor} stopOpacity="0.08" />
            <stop offset="100%" stopColor={coreColor} stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Orbit rings */}
        {[0.4, 0.6, 0.8, 1.0].map((r, i) => (
          <circle key={i} cx={CX} cy={CY} r={ORBIT_R * r}
                  fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"
                  strokeDasharray={i === 3 ? "none" : "3,6"} />
        ))}

        {/* Core glow */}
        <circle cx={CX} cy={CY} r={50} fill="url(#core-glow)" />

        {/* Pressure lines from forces to center */}
        {forceNodes.map(n => (
          <line key={`line-${n.key}`} x1={n.x} y1={n.y} x2={CX} y2={CY}
                stroke={n.colors.fill} strokeWidth={n.cps >= 60 ? 2 : 1}
                strokeOpacity={0.2} strokeDasharray={n.trend === 'improving' ? '6,3' : '3,6'} />
        ))}

        {/* Force gravitational fields */}
        {forceNodes.map(n => (
          <circle key={`field-${n.key}`} cx={n.x} cy={n.y}
                  r={n.radius * 2.2} fill={`url(#grad-${n.key})`} />
        ))}

        {/* Force nodes */}
        {forceNodes.map(n => {
          const isHovered = hovered === n.key;
          return (
            <g key={n.key}
               onMouseEnter={() => setHovered(n.key)}
               onMouseLeave={() => setHovered(null)}
               style={{ cursor: 'pointer' }}>
              {/* Outer ring */}
              <circle cx={n.x} cy={n.y} r={n.radius + (isHovered ? 6 : 2)}
                      fill="none" stroke={n.colors.fill}
                      strokeWidth={isHovered ? 2 : 1} strokeOpacity={isHovered ? 0.8 : 0.3}
                      filter={isHovered ? "url(#glow)" : undefined} />
              {/* Node */}
              <circle cx={n.x} cy={n.y} r={n.radius}
                      fill={`${n.colors.fill}${isHovered ? '44' : '22'}`}
                      stroke={n.colors.fill} strokeWidth={2}
                      style={{ transition: 'all 0.2s' }} />
              {/* Icon */}
              <text x={n.x} y={n.y - 5} textAnchor="middle" fontSize="16">{n.icon}</text>
              {/* CPS Score */}
              <text x={n.x} y={n.y + 12} textAnchor="middle"
                    fill={n.colors.fill} fontSize="11" fontWeight="800">{n.cps}</text>
              {/* Label */}
              <text x={n.x} y={n.y + n.radius + 16} textAnchor="middle"
                    fill="var(--text-secondary)" fontSize="9" fontWeight="600">{n.label}</text>
              {/* Trend indicator */}
              {n.trend === 'improving' && (
                <text x={n.x + n.radius + 4} y={n.y - n.radius + 4}
                      fill="#ff4d6a" fontSize="10">▲</text>
              )}
              {n.trend === 'declining' && (
                <text x={n.x + n.radius + 4} y={n.y - n.radius + 4}
                      fill="#00c896" fontSize="10">▼</text>
              )}
            </g>
          );
        })}

        {/* Enterprise core */}
        <circle cx={CX} cy={CY} r={28} fill={`${coreColor}15`}
                stroke={coreColor} strokeWidth={2} />
        <text x={CX} y={CY - 4} textAnchor="middle" fill={coreColor} fontSize="14">🏢</text>
        <text x={CX} y={CY + 12} textAnchor="middle" fill={coreColor} fontSize="8" fontWeight="700">EMPRESA</text>
      </svg>

      {/* Hover detail */}
      {hovered && (() => {
        const n = forceNodes.find(f => f.key === hovered);
        if (!n) return null;
        return (
          <div style={{
            padding: '0.75rem', borderRadius: '8px', marginTop: '0.5rem',
            background: `${n.colors.fill}08`, borderLeft: `3px solid ${n.colors.fill}`,
            transition: 'all 0.2s',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{n.icon} {n.label}</span>
              <span style={{ color: n.colors.fill, fontWeight: 800, fontSize: '1.1rem' }}>CPS {n.cps}</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              <span>Score: {n.score}/5</span>
              <span>Prob: {n.probability}%</span>
              <span>Trend: {n.trend === 'improving' ? '📈' : n.trend === 'declining' ? '📉' : '➡️'} {n.trend}</span>
              <span>Fuente: {n.source}</span>
            </div>
          </div>
        );
      })()}

      {/* Legend */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.75rem',
        fontSize: '0.7rem', color: 'var(--text-tertiary)',
      }}>
        <span>○ Tamaño = intensidad</span>
        <span>↔ Proximidad = presión</span>
        <span>▲ Intensificando</span>
        <span>- - - Tendencia activa</span>
      </div>
    </div>
  );
}
