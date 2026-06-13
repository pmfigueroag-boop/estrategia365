/**
 * PestelRadar — Strategic Environment Radar (Phase 5: Intelligence Platform)
 * =============================================================================
 * Premium SVG radar visualization with Palantir/Bloomberg aesthetic.
 * Displays per-factor intensity, trend arrows, and pulse animations
 * for critical factors. Replaces the basic Recharts radar.
 *
 * Data source: risk_distribution from pestel_deep_analysis API
 */
"use client";
import { useState, useEffect } from 'react';

const FACTORS = [
  { key: 'P',  label: 'Político',    shortLabel: 'POL', angle: -90 },
  { key: 'E',  label: 'Económico',   shortLabel: 'ECO', angle: -30 },
  { key: 'S',  label: 'Social',      shortLabel: 'SOC', angle: 30 },
  { key: 'T',  label: 'Tecnológico', shortLabel: 'TEC', angle: 90 },
  { key: 'E2', label: 'Ecológico',   shortLabel: 'ENV', angle: 150 },
  { key: 'L',  label: 'Legal',       shortLabel: 'LEG', angle: 210 },
];

const RISK_COLORS = {
  critical: { fill: '#ff2d55', glow: 'rgba(255,45,85,0.4)', stroke: '#ff2d55' },
  high:     { fill: '#ff9500', glow: 'rgba(255,149,0,0.3)',  stroke: '#ff9500' },
  moderate: { fill: '#ffcc00', glow: 'rgba(255,204,0,0.25)', stroke: '#ffcc00' },
  low:      { fill: '#30d158', glow: 'rgba(48,209,88,0.2)',  stroke: '#30d158' },
  none:     { fill: '#48484a', glow: 'rgba(72,72,74,0.1)',   stroke: '#48484a' },
};

const TREND_ARROWS = {
  declining:  { symbol: '▼', color: '#ff453a', label: 'Deterioro' },
  stable:     { symbol: '—', color: '#8e8e93', label: 'Estable' },
  improving:  { symbol: '▲', color: '#30d158', label: 'Mejora' },
};

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function buildPolygonPoints(cx, cy, radius, values) {
  return FACTORS.map((f, i) => {
    const val = values[f.key] || 0;
    const r = (val / 100) * radius;
    const p = polarToCartesian(cx, cy, r, f.angle);
    return `${p.x},${p.y}`;
  }).join(' ');
}

export default function PestelRadar({ riskDistribution, signals = [] }) {
  const [sweepAngle, setSweepAngle] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => { if (active) setMounted(true); });
    return () => { active = false; };
  }, []);

  // Sweep animation
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setSweepAngle(prev => (prev + 1.5) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [mounted]);

  // Build factor data from riskDistribution or raw signals
  const factorData = {};
  if (riskDistribution && riskDistribution.length > 0) {
    riskDistribution.forEach(r => {
      factorData[r.factor] = {
        score: r.avg_priority || 0,
        count: r.count || 0,
        trend: r.dominant_trend || 'stable',
        riskLevel: r.risk_level || 'none',
        probability: r.avg_probability || 0,
      };
    });
  } else if (signals.length > 0) {
    // Fallback: compute from raw signals
    const groups = {};
    signals.forEach(s => {
      const f = s.factor?.toUpperCase?.() || s.factor || 'P';
      if (!groups[f]) groups[f] = [];
      groups[f].push(s);
    });
    Object.entries(groups).forEach(([f, sigs]) => {
      const avg = sigs.reduce((a, s) => a + (s.priority_score || 50), 0) / sigs.length;
      factorData[f] = {
        score: Math.round(avg),
        count: sigs.length,
        trend: 'stable',
        riskLevel: avg >= 80 ? 'critical' : avg >= 60 ? 'high' : avg >= 40 ? 'moderate' : 'low',
        probability: Math.round(sigs.reduce((a, s) => a + (s.probability || 50), 0) / sigs.length),
      };
    });
  }

  if (Object.keys(factorData).length === 0) return null;

  const CX = 200, CY = 200, R = 150;
  const values = {};
  FACTORS.forEach(f => { values[f.key] = factorData[f.key]?.score || 0; });

  const sweepPoint = polarToCartesian(CX, CY, R + 20, sweepAngle - 90);

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>Strategic Environment Radar</h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', margin: '0.25rem 0 0' }}>
            Intensidad de presion ambiental por dimension PESTEL
          </p>
        </div>
        <div style={{
          padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600,
          background: 'rgba(48,209,88,0.1)', border: '1px solid rgba(48,209,88,0.3)', color: '#30d158',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#30d158', animation: 'pulse 2s infinite' }}></span>
          LIVE
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* SVG Radar */}
        <svg viewBox="0 0 400 400" style={{ width: '100%', maxWidth: '380px', height: 'auto' }}>
          <defs>
            <radialGradient id="radarBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(99,102,241,0.08)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <linearGradient id="sweepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(99,102,241,0)" />
              <stop offset="100%" stopColor="rgba(99,102,241,0.6)" />
            </linearGradient>
          </defs>

          {/* Background */}
          <circle cx={CX} cy={CY} r={R + 20} fill="url(#radarBg)" />

          {/* Concentric rings */}
          {[0.25, 0.5, 0.75, 1.0].map((pct, i) => (
            <circle key={i} cx={CX} cy={CY} r={R * pct}
              fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"
              strokeDasharray={i === 3 ? "none" : "2,4"} />
          ))}

          {/* Ring labels */}
          {[25, 50, 75, 100].map((val, i) => (
            <text key={val} x={CX + 4} y={CY - R * ((i + 1) / 4) + 4}
              fill="rgba(255,255,255,0.15)" fontSize="8" fontFamily="monospace">{val}</text>
          ))}

          {/* Axis lines */}
          {FACTORS.map(f => {
            const p = polarToCartesian(CX, CY, R, f.angle);
            return <line key={f.key} x1={CX} y1={CY} x2={p.x} y2={p.y}
              stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />;
          })}

          {/* Sweep line */}
          <line x1={CX} y1={CY} x2={sweepPoint.x} y2={sweepPoint.y}
            stroke="url(#sweepGrad)" strokeWidth="1.5" opacity="0.6" />
          <circle cx={sweepPoint.x} cy={sweepPoint.y} r="2" fill="rgba(99,102,241,0.8)" />

          {/* Data polygon */}
          <polygon
            points={buildPolygonPoints(CX, CY, R, values)}
            fill="rgba(99,102,241,0.12)"
            stroke="rgba(99,102,241,0.6)"
            strokeWidth="1.5"
            filter="url(#glow)"
            style={{ transition: 'all 0.5s ease' }}
          />

          {/* Data points and labels */}
          {FACTORS.map(f => {
            const data = factorData[f.key] || { score: 0, riskLevel: 'none', trend: 'stable' };
            const val = data.score;
            const pointR = (val / 100) * R;
            const point = polarToCartesian(CX, CY, pointR, f.angle);
            const labelPos = polarToCartesian(CX, CY, R + 40, f.angle);
            const rc = RISK_COLORS[data.riskLevel] || RISK_COLORS.none;
            const trend = TREND_ARROWS[data.trend] || TREND_ARROWS.stable;
            const isCritical = data.riskLevel === 'critical';

            return (
              <g key={f.key}>
                {/* Pulse ring for critical factors */}
                {isCritical && (
                  <circle cx={point.x} cy={point.y} r="12"
                    fill="none" stroke={rc.stroke} strokeWidth="0.5" opacity="0.4">
                    <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Data point */}
                <circle cx={point.x} cy={point.y} r={isCritical ? 6 : 5}
                  fill={rc.fill} stroke={rc.stroke} strokeWidth="1.5"
                  filter="url(#glow)" style={{ cursor: 'pointer' }}>
                  <title>{`${f.label}: ${val}/100 | ${trend.label} | ${data.count} senales`}</title>
                </circle>

                {/* Score text on point */}
                <text x={point.x} y={point.y + 3} textAnchor="middle"
                  fill="white" fontSize="7" fontWeight="800" fontFamily="monospace"
                  style={{ pointerEvents: 'none' }}>
                  {val}
                </text>

                {/* Factor label */}
                <text x={labelPos.x} y={labelPos.y - 6} textAnchor="middle"
                  fill="var(--text-secondary,#aaa)" fontSize="9" fontWeight="700" fontFamily="monospace">
                  {f.shortLabel}
                </text>
                <text x={labelPos.x} y={labelPos.y + 6} textAnchor="middle"
                  fill={trend.color} fontSize="9" fontWeight="700">
                  {trend.symbol} {val}
                </text>
              </g>
            );
          })}

          {/* Center label */}
          <text x={CX} y={CY - 4} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7" fontFamily="monospace" letterSpacing="2">PESTEL</text>
          <text x={CX} y={CY + 6} textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="6" fontFamily="monospace">RADAR</text>
        </svg>

        {/* Factor Detail Panel */}
        <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {FACTORS.map(f => {
            const data = factorData[f.key] || { score: 0, riskLevel: 'none', trend: 'stable', count: 0, probability: 0 };
            const rc = RISK_COLORS[data.riskLevel] || RISK_COLORS.none;
            const trend = TREND_ARROWS[data.trend] || TREND_ARROWS.stable;
            return (
              <div key={f.key} style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.5rem 0.75rem', borderRadius: '8px',
                background: `linear-gradient(90deg, ${rc.glow}, transparent)`,
                border: `1px solid ${rc.stroke}22`,
                transition: 'all 0.2s ease',
              }}>
                <span style={{
                  width: '32px', height: '32px', borderRadius: '6px',
                  background: `${rc.fill}20`, border: `1px solid ${rc.fill}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 800, color: rc.fill, fontFamily: 'monospace',
                }}>{f.shortLabel}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{f.label}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: rc.fill, fontFamily: 'monospace' }}>{data.score}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2px', alignItems: 'center' }}>
                    <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: '2px', width: `${data.score}%`,
                        background: `linear-gradient(90deg, ${rc.fill}88, ${rc.fill})`,
                        transition: 'width 0.8s ease',
                      }} />
                    </div>
                    <span style={{ fontSize: '0.65rem', color: trend.color, fontWeight: 700 }}>{trend.symbol}</span>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>{data.count}sig</span>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>{data.probability}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
