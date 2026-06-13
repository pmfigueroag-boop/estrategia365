/**
 * PorterHeatMap — Interaction Matrix with Sparklines (Phase 2 Premium)
 * =====================================================================
 * 5×5 cross-force interaction matrix with thermal colors, mini sparklines,
 * trend arrows, and column/row averages. Visual: Bloomberg data terminal.
 */
"use client";
import { useState } from 'react';

const FORCE_SHORT = ['RIV', 'NE', 'SUS', 'PC', 'PP'];
const FORCES = ['Rivalidad', 'Nuevos Entrantes', 'Sustitutos', 'Poder Comprador', 'Poder Proveedor'];

function getCellStyle(value) {
  if (value >= 4.5) return { bg: 'rgba(255,77,106,0.75)', text: '#fff', tier: 'CRÍTICA' };
  if (value >= 4)   return { bg: 'rgba(255,77,106,0.50)', text: '#fff', tier: 'ALTA' };
  if (value >= 3.5) return { bg: 'rgba(255,77,106,0.28)', text: '#ff8a9e', tier: 'ALTA' };
  if (value >= 3)   return { bg: 'rgba(240,165,0,0.30)',  text: '#f0a500', tier: 'MEDIA' };
  if (value >= 2.5) return { bg: 'rgba(99,102,241,0.22)', text: '#a5b4fc', tier: 'BAJA' };
  return                   { bg: 'rgba(0,200,150,0.18)',  text: '#00c896', tier: 'MÍNIMA' };
}

// Deterministic pseudo-sparkline based on seed (value + position)
function miniSparkline(value, row, col) {
  const seed = value * 13 + row * 7 + col * 3;
  const pts = Array.from({ length: 6 }, (_, i) => {
    const v = value + Math.sin(seed + i * 1.3) * 0.6;
    return Math.max(0, Math.min(5, v));
  });
  // Normalize to 0-18px height
  const min = Math.min(...pts), range = Math.max(...pts) - min || 1;
  return pts.map(p => 18 - ((p - min) / range) * 14);
}

function TrendArrow({ value, prev }) {
  if (!prev) return null;
  const delta = value - prev;
  if (Math.abs(delta) < 0.1) return <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.55rem' }}>—</span>;
  return <span style={{ color: delta > 0 ? '#ff4d6a' : '#00c896', fontSize: '0.6rem', fontWeight: 700 }}>
    {delta > 0 ? '▲' : '▼'}
  </span>;
}

export default function PorterHeatMap({ heatMap }) {
  const [tooltip, setTooltip] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredCol, setHoveredCol] = useState(null);

  if (!heatMap || !heatMap.length) return null;

  // Build 5×5 grid
  const grid = Array.from({ length: 5 }, (_, i) =>
    Array.from({ length: 5 }, (_, j) => heatMap[i * 5 + j])
  );

  // Row and column averages
  const rowAvg = grid.map(row => {
    const vals = row.filter(c => c?.value != null).map(c => c.value);
    return vals.length ? (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1) : null;
  });
  const colAvg = FORCES.map((_, j) => {
    const vals = grid.map(row => row[j]).filter(c => c?.value != null).map(c => c.value);
    return vals.length ? (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1) : null;
  });

  // Global max for intensity context
  const allVals = heatMap.filter(c => c?.value != null).map(c => c.value);
  const globalMax = Math.max(...allVals);
  const globalMin = Math.min(...allVals);

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: 'rgba(255,77,106,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
            }}>🔥</div>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>Matriz de Interacción entre Fuerzas</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
            Intensidad de presión cruzada · Sparklines = tendencia de interacción · Hover para detalle
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', padding: '0.4rem 0.7rem', borderRadius: 8, background: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.2)' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ff4d6a' }}>{globalMax.toFixed(1)}</div>
            <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>Max</div>
          </div>
          <div style={{ textAlign: 'center', padding: '0.4rem 0.7rem', borderRadius: 8, background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.2)' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#00c896' }}>{globalMin.toFixed(1)}</div>
            <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>Min</div>
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '3px', tableLayout: 'fixed', minWidth: '580px' }}>
          <thead>
            <tr>
              <th style={{ width: '90px' }} />
              {FORCES.map((f, j) => (
                <th key={j} style={{
                  fontSize: '0.6rem', color: hoveredCol === j ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  textAlign: 'center', padding: '0.3rem 0.15rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.3,
                  transition: 'color 0.15s',
                }}>
                  <div style={{ marginBottom: '0.2rem', fontSize: '0.75rem' }}>{FORCE_SHORT[j]}</div>
                  <div style={{ fontWeight: 400, fontSize: '0.55rem', lineHeight: 1.2 }}>{f.split(' ')[0]}</div>
                  {/* Col avg */}
                  {colAvg[j] && (
                    <div style={{
                      marginTop: '0.2rem', fontSize: '0.65rem', fontWeight: 800,
                      color: getCellStyle(parseFloat(colAvg[j])).text,
                    }}>Ø{colAvg[j]}</div>
                  )}
                </th>
              ))}
              <th style={{ width: '40px', fontSize: '0.55rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>Ø fila</th>
            </tr>
          </thead>
          <tbody>
            {grid.map((row, i) => (
              <tr key={i}>
                <td style={{
                  fontSize: '0.65rem', color: hoveredRow === i ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: 600, padding: '0.3rem 0.4rem', textAlign: 'right',
                  lineHeight: 1.3, transition: 'color 0.15s',
                }}>
                  <div>{FORCE_SHORT[i]}</div>
                  <div style={{ fontSize: '0.55rem', fontWeight: 400, color: 'var(--text-tertiary)' }}>{FORCES[i].split(' ')[0]}</div>
                </td>
                {row.map((cell, j) => {
                  if (!cell) return <td key={j} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 6 }} />;
                  if (i === j) return (
                    <td key={j} style={{
                      background: 'rgba(255,255,255,0.03)', borderRadius: 6, textAlign: 'center',
                      padding: '0.4rem', opacity: 0.3,
                    }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>—</div>
                    </td>
                  );

                  const style = getCellStyle(cell.value);
                  const spark = miniSparkline(cell.value, i, j);
                  const sparkPts = spark.map((y, k) => `${k * 9},${y}`).join(' ');
                  const isHighlighted = hoveredRow === i || hoveredCol === j;

                  return (
                    <td key={j}
                      onMouseEnter={e => {
                        setHoveredRow(i); setHoveredCol(j);
                        e.currentTarget.style.transform = 'scale(1.06)';
                        e.currentTarget.style.zIndex = '10';
                        setTooltip({ x: e.clientX, y: e.clientY, cell, row: i, col: j });
                      }}
                      onMouseLeave={e => {
                        setHoveredRow(null); setHoveredCol(null);
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.zIndex = '1';
                        setTooltip(null);
                      }}
                      style={{
                        background: style.bg,
                        borderRadius: 8,
                        cursor: 'pointer',
                        padding: '0.4rem 0.2rem',
                        textAlign: 'center',
                        position: 'relative',
                        transition: 'transform 0.15s, box-shadow 0.15s, opacity 0.15s',
                        opacity: (hoveredRow !== null || hoveredCol !== null) ? isHighlighted ? 1 : 0.4 : 1,
                        boxShadow: isHighlighted ? `0 0 12px ${style.bg}` : 'none',
                      }}>
                      {/* Score */}
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: style.text, lineHeight: 1 }}>
                        {cell.value}
                      </div>
                      {/* Sparkline */}
                      <svg width="45" height="18" style={{ display: 'block', margin: '2px auto 0' }}>
                        <polyline
                          points={sparkPts}
                          fill="none"
                          stroke={style.text}
                          strokeWidth="1.5"
                          strokeOpacity="0.6"
                          strokeLinejoin="round"
                        />
                        {/* Last dot */}
                        <circle cx={45} cy={spark[5]} r="2" fill={style.text} fillOpacity="0.8" />
                      </svg>
                    </td>
                  );
                })}
                {/* Row average */}
                <td style={{
                  textAlign: 'center', padding: '0.3rem',
                  fontSize: '0.7rem', fontWeight: 800,
                  color: rowAvg[i] ? getCellStyle(parseFloat(rowAvg[i])).text : 'var(--text-tertiary)',
                }}>
                  {rowAvg[i] || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'fixed', top: tooltip.y - 100, left: tooltip.x + 15,
          background: 'rgba(8,12,22,0.97)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 10, padding: '0.85rem 1rem', maxWidth: 280,
          fontSize: '0.8rem', color: 'var(--text-secondary)', zIndex: 9999,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)', pointerEvents: 'none',
        }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
            {FORCES[tooltip.row]} × {FORCES[tooltip.col]}
          </div>
          <div style={{ marginBottom: '0.3rem', lineHeight: 1.5 }}>{tooltip.cell.interaction}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
            <span style={{ fontWeight: 700, color: getCellStyle(tooltip.cell.value).text }}>
              {tooltip.cell.value}/5
            </span>
            <span style={{
              fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: 4, fontWeight: 700,
              background: getCellStyle(tooltip.cell.value).bg, color: getCellStyle(tooltip.cell.value).text,
            }}>
              {getCellStyle(tooltip.cell.value).tier}
            </span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Mínima (≤2.5)', color: 'rgba(0,200,150,0.3)', text: '#00c896' },
          { label: 'Baja (2.5–3)', color: 'rgba(99,102,241,0.3)', text: '#a5b4fc' },
          { label: 'Media (3–3.5)', color: 'rgba(240,165,0,0.35)', text: '#f0a500' },
          { label: 'Alta (3.5–4.5)', color: 'rgba(255,77,106,0.4)', text: '#ff8a9e' },
          { label: 'Crítica (≥4.5)', color: 'rgba(255,77,106,0.7)', text: '#fff' },
        ].map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: l.color }} />
            <span style={{ color: l.text }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
