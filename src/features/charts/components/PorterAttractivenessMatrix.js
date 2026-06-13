/**
 * PorterAttractivenessMatrix — Industry Attractiveness Scatter (Sprint 3)
 * ========================================================================
 * SVG scatter plot: X=Score (threat level), Y=Trend direction.
 * 4 quadrants: Critical Threat, High Pressure, Emerging Threat, Manageable.
 * Ref: Porter, M.E. (2008). The Five Competitive Forces That Shape Strategy.
 */
"use client";
import { useState } from 'react';

const QUADRANT_CONFIG = {
  critical_threat:  { label: 'Amenaza Crítica',   color: '#ff4d6a', bg: 'rgba(255,77,106,0.08)' },
  high_pressure:    { label: 'Alta Presión',      color: '#f0a500', bg: 'rgba(240,165,0,0.06)' },
  emerging_threat:  { label: 'Amenaza Emergente',  color: '#a855f7', bg: 'rgba(168,85,247,0.06)' },
  manageable:       { label: 'Manejable',          color: '#00c896', bg: 'rgba(0,200,150,0.06)' },
};

const FORCE_ICONS = {
  rivalry: '⚔️', new_entrants: '🚪', substitutes: '🔄',
  buyer_power: '🛒', supplier_power: '📦',
};

export default function PorterAttractivenessMatrix({ attractivenessMatrix }) {
  const [hoveredForce, setHoveredForce] = useState(null);

  if (!attractivenessMatrix || !attractivenessMatrix.length) return null;

  const W = 520, H = 380, PAD = { top: 40, right: 30, bottom: 50, left: 55 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  // X: score 1-5, Y: trend_numeric -1 to 1
  const xScale = (score) => PAD.left + ((score - 1) / 4) * chartW;
  const yScale = (trend) => PAD.top + ((1 - trend) / 2) * chartH; // Inverted: improving at top

  // Quadrant boundaries
  const midX = xScale(3.5);
  const midY = yScale(0.5);

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
      <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        🎯 Matriz de Atractividad Industrial — Score vs Tendencia
      </h3>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        {/* SVG Chart */}
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: '540px', height: 'auto' }}>
          {/* Quadrant backgrounds */}
          <rect x={midX} y={PAD.top} width={W - PAD.right - midX} height={midY - PAD.top}
                fill={QUADRANT_CONFIG.critical_threat.bg} rx="4" />
          <rect x={PAD.left} y={PAD.top} width={midX - PAD.left} height={midY - PAD.top}
                fill={QUADRANT_CONFIG.emerging_threat.bg} rx="4" />
          <rect x={midX} y={midY} width={W - PAD.right - midX} height={H - PAD.bottom - midY}
                fill={QUADRANT_CONFIG.high_pressure.bg} rx="4" />
          <rect x={PAD.left} y={midY} width={midX - PAD.left} height={H - PAD.bottom - midY}
                fill={QUADRANT_CONFIG.manageable.bg} rx="4" />

          {/* Quadrant labels */}
          <text x={midX + (W - PAD.right - midX) / 2} y={PAD.top + 18} textAnchor="middle"
                fill={QUADRANT_CONFIG.critical_threat.color} fontSize="9" fontWeight="700" opacity="0.8">AMENAZA CRÍTICA</text>
          <text x={PAD.left + (midX - PAD.left) / 2} y={PAD.top + 18} textAnchor="middle"
                fill={QUADRANT_CONFIG.emerging_threat.color} fontSize="9" fontWeight="700" opacity="0.8">AMENAZA EMERGENTE</text>
          <text x={midX + (W - PAD.right - midX) / 2} y={H - PAD.bottom - 8} textAnchor="middle"
                fill={QUADRANT_CONFIG.high_pressure.color} fontSize="9" fontWeight="700" opacity="0.8">ALTA PRESIÓN</text>
          <text x={PAD.left + (midX - PAD.left) / 2} y={H - PAD.bottom - 8} textAnchor="middle"
                fill={QUADRANT_CONFIG.manageable.color} fontSize="9" fontWeight="700" opacity="0.8">MANEJABLE</text>

          {/* Grid lines */}
          <line x1={midX} y1={PAD.top} x2={midX} y2={H - PAD.bottom}
                stroke="rgba(255,255,255,0.15)" strokeDasharray="4,4" />
          <line x1={PAD.left} y1={midY} x2={W - PAD.right} y2={midY}
                stroke="rgba(255,255,255,0.15)" strokeDasharray="4,4" />

          {/* Axes */}
          <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom}
                stroke="rgba(255,255,255,0.2)" />
          <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={H - PAD.bottom}
                stroke="rgba(255,255,255,0.2)" />

          {/* X axis labels */}
          {[1, 2, 3, 4, 5].map(v => (
            <text key={v} x={xScale(v)} y={H - PAD.bottom + 18} textAnchor="middle"
                  fill="var(--text-tertiary)" fontSize="10">{v}</text>
          ))}
          <text x={W / 2} y={H - 8} textAnchor="middle" fill="var(--text-tertiary)" fontSize="10">
            Score de Presión →
          </text>

          {/* Y axis labels */}
          <text x={PAD.left - 8} y={yScale(1)} textAnchor="end" dominantBaseline="middle"
                fill="var(--text-tertiary)" fontSize="9">📈 Intensificando</text>
          <text x={PAD.left - 8} y={yScale(0)} textAnchor="end" dominantBaseline="middle"
                fill="var(--text-tertiary)" fontSize="9">➡️ Estable</text>
          <text x={PAD.left - 8} y={yScale(-1)} textAnchor="end" dominantBaseline="middle"
                fill="var(--text-tertiary)" fontSize="9">📉 Disminuyendo</text>

          {/* Data points */}
          {attractivenessMatrix.map((item, i) => {
            const cx = xScale(item.score);
            const cy = yScale(item.trend_numeric);
            const qConf = QUADRANT_CONFIG[item.quadrant] || QUADRANT_CONFIG.manageable;
            const isHovered = hoveredForce === item.force;
            const radius = Math.max(16, Math.min(28, item.probability / 3.5));

            return (
              <g key={i}
                 onMouseEnter={() => setHoveredForce(item.force)}
                 onMouseLeave={() => setHoveredForce(null)}
                 style={{ cursor: 'pointer' }}>
                {/* Glow */}
                {isHovered && (
                  <circle cx={cx} cy={cy} r={radius + 8}
                          fill={qConf.color} opacity="0.15" />
                )}
                {/* Bubble */}
                <circle cx={cx} cy={cy} r={radius}
                        fill={`${qConf.color}33`} stroke={qConf.color}
                        strokeWidth={isHovered ? 2.5 : 1.5}
                        style={{ transition: 'all 0.2s ease' }} />
                {/* Label */}
                <text x={cx} y={cy - 2} textAnchor="middle" dominantBaseline="middle"
                      fill="var(--text-primary)" fontSize="13">
                  {FORCE_ICONS[item.force] || '•'}
                </text>
                <text x={cx} y={cy + 12} textAnchor="middle"
                      fill={qConf.color} fontSize="8" fontWeight="600">
                  {item.competitive_pressure_score}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend + Details */}
        <div style={{ flex: '1', minWidth: '200px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            Clasificación por Fuerza
          </div>
          {attractivenessMatrix.map((item, i) => {
            const qConf = QUADRANT_CONFIG[item.quadrant] || QUADRANT_CONFIG.manageable;
            const isHovered = hoveredForce === item.force;
            return (
              <div key={i}
                   onMouseEnter={() => setHoveredForce(item.force)}
                   onMouseLeave={() => setHoveredForce(null)}
                   style={{
                     padding: '0.6rem 0.75rem', marginBottom: '0.5rem',
                     borderRadius: '8px', borderLeft: `3px solid ${qConf.color}`,
                     background: isHovered ? `${qConf.color}15` : 'rgba(255,255,255,0.02)',
                     transition: 'all 0.2s', cursor: 'pointer',
                   }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {FORCE_ICONS[item.force]} {item.label}
                  </span>
                  <span style={{
                    fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px',
                    background: `${qConf.color}22`, color: qConf.color, fontWeight: 600,
                  }}>{qConf.label}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.3rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  <span>Score: {item.score}/5</span>
                  <span>Prob: {item.probability}%</span>
                  <span style={{ color: qConf.color, fontWeight: 600 }}>CPS: {item.competitive_pressure_score}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '1rem', padding: '0.6rem 0.75rem', fontSize: '0.75rem',
        color: 'var(--text-tertiary)', borderLeft: '3px solid var(--accent-secondary)',
        background: 'rgba(255,255,255,0.02)', borderRadius: '0 6px 6px 0',
      }}>
        📐 El tamaño del círculo refleja la probabilidad de intensificación. CPS = Competitive Pressure Score (ponderado: score 50% + probabilidad 25% + tendencia 25%).
      </div>
    </div>
  );
}
