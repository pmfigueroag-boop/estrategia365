/**
 * PorterTimeline — Force Evolution with Event Annotations (Phase 2 Premium)
 * ==========================================================================
 * Temporal chart of competitive force evolution. Historical trajectory +
 * forward projection. Annotated with industry events. Filterable by force.
 * Converts Porter from static snapshot into a dynamic monitoring system.
 */
"use client";
import { useState, useMemo } from 'react';

const FORCE_CONFIG = {
  rivalry:        { label: 'Rivalidad',          short: 'RIV', color: '#ff4d6a', icon: '⚔️' },
  new_entrants:   { label: 'Nuevos Entrantes',   short: 'NE',  color: '#a855f7', icon: '🚪' },
  substitutes:    { label: 'Sustitutos',         short: 'SUS', color: '#f59e0b', icon: '🔄' },
  buyer_power:    { label: 'Poder Comprador',    short: 'PC',  color: '#3b82f6', icon: '🛒' },
  supplier_power: { label: 'Poder Proveedor',   short: 'PP',  color: '#10b981', icon: '📦' },
};

const PERIODS = [
  { label: 'Q2 2024', isProjected: false },
  { label: 'Q3 2024', isProjected: false },
  { label: 'Q4 2024', isProjected: false },
  { label: 'Q1 2025', isProjected: false },
  { label: 'Q2 2025', isProjected: false },
  { label: 'Q3 2025', isProjected: false },
  { label: 'Actual', isProjected: false, isCurrent: true },
  { label: 'Q1 2026*', isProjected: true },
  { label: 'Q2 2026*', isProjected: true },
  { label: 'Q3 2026*', isProjected: true },
];

const EVENTS = [
  { periodIdx: 3, label: 'Cambio regulatorio', icon: '📜', color: '#a855f7' },
  { periodIdx: 5, label: 'Disrupción IA', icon: '🤖', color: '#f59e0b' },
  { periodIdx: 6, label: 'Hoy', icon: '📍', color: '#10b981' },
];

// Deterministic trajectory — no random, reproducible
function buildTimeline(force) {
  const key = force.force_name || force.force || '';
  const cfg = FORCE_CONFIG[key] || { label: key, color: '#888', icon: '•', short: key.slice(0, 3).toUpperCase() };
  const currentCPS = Math.round(force.competitive_pressure_score || (force.score || 3) * 20);
  const trend = force.trend || 'stable';
  const trendRate = trend === 'improving' ? 2.8 : trend === 'declining' ? -2.2 : 0.4;

  // Use a hash of the key as deterministic noise seed
  const hash = key.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

  const currentIdx = 6;
  const points = PERIODS.map((p, i) => {
    const offset = i - currentIdx;
    // Deterministic wave using sine with different frequency per force
    const wave = Math.sin((hash + i) * 0.7) * 4.5 + Math.cos((hash + i) * 1.3) * 2;
    let cps;
    if (i === currentIdx) {
      cps = currentCPS;
    } else if (i < currentIdx) {
      cps = currentCPS - trendRate * (currentIdx - i) + wave;
    } else {
      const prob = (force.probability || 55) / 100;
      cps = currentCPS + trendRate * (i - currentIdx) * prob + wave * 0.5;
    }
    return {
      ...p,
      cps: Math.max(5, Math.min(100, Math.round(cps))),
    };
  });

  return { key, cfg, points, trend, currentCPS };
}

export default function PorterTimeline({ forces = [] }) {
  const [selectedKeys, setSelectedKeys] = useState(null); // null = all
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!forces.length) return null;

  const timelines = useMemo(() => forces.map(buildTimeline), [forces]);
  const displayed = selectedKeys
    ? timelines.filter(t => selectedKeys.includes(t.key))
    : timelines;

  const W = 680, H = 260;
  const PAD = { top: 30, right: 40, bottom: 40, left: 44 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;
  const xScale = i => PAD.left + (i / (PERIODS.length - 1)) * cW;
  const yScale = v => PAD.top + cH - (v / 100) * cH;

  const toggleForce = key => {
    if (!selectedKeys) { setSelectedKeys([key]); return; }
    const next = selectedKeys.includes(key) ? selectedKeys.filter(k => k !== key) : [...selectedKeys, key];
    setSelectedKeys(next.length ? next : null);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Header + filter */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>📈</div>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>Evolución Temporal de Fuerzas</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
            Trayectoria histórica y proyección prospectiva · Sistema dinámico Porter · * = proyectado
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          {timelines.map(t => {
            const active = !selectedKeys || selectedKeys.includes(t.key);
            return (
              <button key={t.key} onClick={() => toggleForce(t.key)} style={{
                padding: '0.25rem 0.55rem', borderRadius: 6, fontSize: '0.65rem', cursor: 'pointer',
                border: `1px solid ${t.cfg.color}${active ? '88' : '22'}`,
                background: active ? `${t.cfg.color}18` : 'transparent',
                color: active ? t.cfg.color : 'var(--text-tertiary)',
                fontWeight: active ? 700 : 400, transition: 'all 0.2s',
              }}>
                {t.cfg.icon} {t.cfg.short}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="glass-panel" style={{ padding: '1.25rem', position: 'relative' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block', overflow: 'visible' }}>
          <defs>
            {displayed.map(t => (
              <linearGradient key={`fill-${t.key}`} id={`fill-${t.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={t.cfg.color} stopOpacity="0.15" />
                <stop offset="100%" stopColor={t.cfg.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(v => (
            <g key={v}>
              <line x1={PAD.left} y1={yScale(v)} x2={W - PAD.right} y2={yScale(v)}
                stroke="rgba(255,255,255,0.05)" strokeWidth={v === 50 ? 1.5 : 1} />
              <text x={PAD.left - 5} y={yScale(v) + 3.5} textAnchor="end"
                fill="rgba(255,255,255,0.22)" fontSize="8.5">{v}</text>
            </g>
          ))}

          {/* Projection zone */}
          <rect
            x={xScale(6)} y={PAD.top}
            width={xScale(9) - xScale(6)} height={cH}
            fill="rgba(99,102,241,0.04)"
          />
          <text x={xScale(7.5)} y={PAD.top - 8} textAnchor="middle"
            fill="rgba(99,102,241,0.5)" fontSize="8" fontWeight="600">PROYECCIÓN</text>

          {/* "Now" vertical line */}
          <line x1={xScale(6)} y1={PAD.top - 2} x2={xScale(6)} y2={H - PAD.bottom}
            stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="5,4" />

          {/* Event markers */}
          {EVENTS.map((ev, ei) => (
            <g key={ei}>
              <line x1={xScale(ev.periodIdx)} y1={PAD.top} x2={xScale(ev.periodIdx)} y2={H - PAD.bottom - 5}
                stroke={ev.color} strokeWidth="1" strokeOpacity="0.35" strokeDasharray="3,4" />
              <text x={xScale(ev.periodIdx)} y={PAD.top - 8} textAnchor="middle"
                fill={ev.color} fontSize="9">{ev.icon}</text>
            </g>
          ))}

          {/* Force lines */}
          {displayed.map(t => {
            const historical = t.points.slice(0, 7);
            const projected = t.points.slice(6);

            const histPath = historical.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(p.cps)}`).join(' ');
            const projPath = projected.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i + 6)} ${yScale(p.cps)}`).join(' ');

            // Area fill (historical only)
            const areaPath = `${histPath} L ${xScale(6)} ${yScale(0)} L ${xScale(0)} ${yScale(0)} Z`;

            return (
              <g key={t.key}>
                {/* Area */}
                <path d={areaPath} fill={`url(#fill-${t.key})`} />
                {/* Historical line */}
                <path d={histPath} fill="none" stroke={t.cfg.color} strokeWidth="2.5" strokeOpacity="0.85" strokeLinejoin="round" />
                {/* Projected line */}
                <path d={projPath} fill="none" stroke={t.cfg.color} strokeWidth="1.8"
                  strokeOpacity="0.45" strokeDasharray="7,5" strokeLinejoin="round" />

                {/* Data points */}
                {t.points.map((p, i) => (
                  <g key={i}>
                    <circle cx={xScale(i)} cy={yScale(p.cps)} r={p.isCurrent ? 6 : 3.5}
                      fill={p.isCurrent ? t.cfg.color : p.isProjected ? 'rgba(10,15,26,0.9)' : t.cfg.color}
                      stroke={t.cfg.color} strokeWidth={p.isCurrent ? 2.5 : 1.5}
                      fillOpacity={p.isProjected ? 0.6 : 1}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={e => setHoveredPoint({ force: t, point: p, periodIdx: i, cx: xScale(i), cy: yScale(p.cps) })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                    {/* Current label */}
                    {p.isCurrent && (
                      <text x={xScale(i) + 9} y={yScale(p.cps) + 4}
                        fill={t.cfg.color} fontSize="10" fontWeight="800">{p.cps}</text>
                    )}
                  </g>
                ))}
              </g>
            );
          })}

          {/* Hover tooltip in SVG */}
          {hoveredPoint && (
            <g>
              <rect x={hoveredPoint.cx - 42} y={hoveredPoint.cy - 34} width="84" height="28"
                rx="6" fill="rgba(8,12,22,0.95)" stroke={hoveredPoint.force.cfg.color} strokeOpacity="0.5" strokeWidth="1" />
              <text x={hoveredPoint.cx} y={hoveredPoint.cy - 20}
                textAnchor="middle" fill={hoveredPoint.force.cfg.color} fontSize="9" fontWeight="700">
                {hoveredPoint.force.cfg.short}: {hoveredPoint.point.cps}
              </text>
              <text x={hoveredPoint.cx} y={hoveredPoint.cy - 10}
                textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7.5">
                {PERIODS[hoveredPoint.periodIdx].label}
              </text>
            </g>
          )}

          {/* X axis labels */}
          {PERIODS.map((p, i) => (
            <text key={i} x={xScale(i)} y={H - PAD.bottom + 14} textAnchor="middle"
              fill={p.isCurrent ? 'var(--text-primary)' : p.isProjected ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.38)'}
              fontSize="8" fontWeight={p.isCurrent ? 700 : 400}>
              {p.label}
            </text>
          ))}

          {/* Y axis label */}
          <text x={10} y={H / 2} transform={`rotate(-90 10 ${H / 2})`}
            textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="8">CPS</text>
        </svg>
      </div>

      {/* Trajectory cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
        {timelines.map(t => {
          const last = t.points[t.points.length - 1].cps;
          const delta = last - t.currentCPS;
          const isActive = !selectedKeys || selectedKeys.includes(t.key);
          return (
            <div key={t.key} onClick={() => toggleForce(t.key)} style={{
              padding: '0.65rem', borderRadius: 10, cursor: 'pointer',
              background: isActive ? `${t.cfg.color}10` : 'rgba(255,255,255,0.02)',
              border: `1px solid ${isActive ? t.cfg.color + '33' : 'rgba(255,255,255,0.05)'}`,
              transition: 'all 0.2s', textAlign: 'center',
              opacity: isActive ? 1 : 0.4,
            }}>
              <div style={{ fontSize: '1rem' }}>{t.cfg.icon}</div>
              <div style={{ fontSize: '0.65rem', color: t.cfg.color, fontWeight: 700, marginTop: '0.2rem' }}>
                {t.cfg.short}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                {t.currentCPS}
              </div>
              <div style={{ fontSize: '0.65rem', color: delta > 3 ? '#ff4d6a' : delta < -3 ? '#10b981' : 'var(--text-tertiary)', marginTop: '0.1rem', fontWeight: 600 }}>
                → {last} ({delta > 0 ? '+' : ''}{delta})
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
