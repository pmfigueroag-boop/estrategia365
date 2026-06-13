/**
 * Estrategia 365 — Porter Intelligence Stories (P1: UX Governance)
 * ==================================================================
 * Storybook stories for all 16 premium Porter visualization components.
 * Uses inline data to avoid importing JSX-in-.js source files.
 */

import React from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ScatterChart, Scatter, Cell,
  ResponsiveContainer,
} from 'recharts';

const COLORS = {
  primary: '#6366f1', secondary: '#8b5cf6',
  danger: '#ef4444', warning: '#f59e0b', success: '#22c55e', info: '#06b6d4',
  forces: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'],
};

// ══════════════════════════════════════════════════════════════
// DATA FIXTURES
// ══════════════════════════════════════════════════════════════

const FORCES = [
  { force: 'Rivalidad', score: 4, cps: 75 },
  { force: 'Nuevos Entrantes', score: 3, cps: 55 },
  { force: 'Sustitutos', score: 2, cps: 35 },
  { force: 'Poder Comprador', score: 5, cps: 90 },
  { force: 'Poder Proveedor', score: 3, cps: 50 },
];

const HEATMAP_5x5 = (() => {
  const names = FORCES.map(f => f.force);
  const cells = [];
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const val = i === j ? FORCES[i].score : Math.round((FORCES[i].score + FORCES[j].score) / 2 * 10) / 10;
      cells.push({ row: names[i], col: names[j], value: val });
    }
  }
  return cells;
})();

const TIMELINE = [
  { period: 'Q1 2025', rivalry: 3.2, entrants: 2.8, substitutes: 1.5, buyers: 4.1, suppliers: 2.9 },
  { period: 'Q2 2025', rivalry: 3.5, entrants: 2.9, substitutes: 1.7, buyers: 4.3, suppliers: 3.0 },
  { period: 'Q3 2025', rivalry: 3.8, entrants: 3.1, substitutes: 2.0, buyers: 4.5, suppliers: 3.2 },
  { period: 'Q4 2025', rivalry: 4.0, entrants: 3.0, substitutes: 2.2, buyers: 4.8, suppliers: 3.1 },
  { period: 'Q1 2026', rivalry: 4.2, entrants: 3.2, substitutes: 2.5, buyers: 5.0, suppliers: 3.4 },
];

const MONTE_CARLO = Array.from({ length: 50 }, (_, i) => ({
  simulation: i + 1,
  avg_cps: 40 + Math.random() * 40,
  industry_attractiveness: 1.5 + Math.random() * 3.5,
}));

const BSC_BRIDGE = [
  { perspective: 'Financiera', impact: 85, connected_forces: 3 },
  { perspective: 'Clientes', impact: 72, connected_forces: 4 },
  { perspective: 'Procesos', impact: 68, connected_forces: 5 },
  { perspective: 'Aprendizaje', impact: 55, connected_forces: 2 },
];

// ══════════════════════════════════════════════════════════════
// STORIES
// ══════════════════════════════════════════════════════════════

/** Radar overview of all 5 competitive forces. */
export const PorterRadar = {
  render: () => (
    <ResponsiveContainer width={500} height={400}>
      <RadarChart data={FORCES}>
        <PolarGrid stroke="#374151" />
        <PolarAngleAxis dataKey="force" tick={{ fontSize: 11, fill: '#9ca3af' }} />
        <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 10 }} />
        <Radar name="Intensidad" dataKey="score" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.25} />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  ),
};

/** Competitive Pressure Score (CPS) bar chart per force. */
export const PorterPressureMap = {
  render: () => (
    <ResponsiveContainer width={500} height={300}>
      <BarChart data={FORCES} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis type="number" domain={[0, 100]} tick={{ fill: '#9ca3af' }} />
        <YAxis dataKey="force" type="category" width={130} tick={{ fontSize: 11, fill: '#d1d5db' }} />
        <Tooltip />
        <Bar dataKey="cps" radius={[0, 6, 6, 0]}>
          {FORCES.map((_, i) => (
            <Cell key={i} fill={COLORS.forces[i]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  ),
};

/** 5×5 cross-force interaction heat map. */
export const PorterHeatMap = {
  render: () => {
    const names = [...new Set(HEATMAP_5x5.map(c => c.row))];
    const getColor = (v) => {
      if (v >= 4) return '#dc2626';
      if (v >= 3) return '#f59e0b';
      if (v >= 2) return '#22c55e';
      return '#3b82f6';
    };
    return (
      <div style={{ display: 'inline-block', fontFamily: 'Inter, sans-serif' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '6px 8px' }}></th>
              {names.map(n => <th key={n} style={{ padding: '6px 4px', color: '#9ca3af', fontSize: '0.7rem', writingMode: 'vertical-rl' }}>{n}</th>)}
            </tr>
          </thead>
          <tbody>
            {names.map(row => (
              <tr key={row}>
                <td style={{ padding: '4px 8px', color: '#d1d5db', fontWeight: 600, fontSize: '0.75rem' }}>{row}</td>
                {names.map(col => {
                  const cell = HEATMAP_5x5.find(c => c.row === row && c.col === col);
                  return (
                    <td key={col} style={{
                      width: 48, height: 48, textAlign: 'center',
                      backgroundColor: getColor(cell?.value || 0),
                      color: '#fff', fontWeight: 700, borderRadius: '4px', margin: '1px',
                    }}>
                      {cell?.value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
};

/** Temporal evolution of competitive forces over quarters. */
export const PorterTimeline = {
  render: () => (
    <ResponsiveContainer width={600} height={350}>
      <LineChart data={TIMELINE}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="period" tick={{ fill: '#9ca3af', fontSize: 11 }} />
        <YAxis domain={[0, 5]} tick={{ fill: '#9ca3af' }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="rivalry" stroke="#ef4444" strokeWidth={2} name="Rivalidad" />
        <Line type="monotone" dataKey="entrants" stroke="#f97316" strokeWidth={2} name="Entrantes" />
        <Line type="monotone" dataKey="substitutes" stroke="#eab308" strokeWidth={2} name="Sustitutos" />
        <Line type="monotone" dataKey="buyers" stroke="#22c55e" strokeWidth={2} name="Compradores" />
        <Line type="monotone" dataKey="suppliers" stroke="#3b82f6" strokeWidth={2} name="Proveedores" />
      </LineChart>
    </ResponsiveContainer>
  ),
};

/** Monte Carlo scatter — simulated industry scenarios. */
export const PorterMonteCarlo = {
  render: () => (
    <ResponsiveContainer width={500} height={350}>
      <ScatterChart>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="avg_cps" name="CPS Promedio" domain={[30, 90]} tick={{ fill: '#9ca3af' }} />
        <YAxis dataKey="industry_attractiveness" name="Atractivo" domain={[1, 5]} tick={{ fill: '#9ca3af' }} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Scatter name="Simulaciones" data={MONTE_CARLO} fill={COLORS.primary} fillOpacity={0.6} />
      </ScatterChart>
    </ResponsiveContainer>
  ),
};

/** Porter → BSC bridge — impact per BSC perspective. */
export const PorterBscBridge = {
  render: () => (
    <ResponsiveContainer width={500} height={300}>
      <BarChart data={BSC_BRIDGE}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="perspective" tick={{ fill: '#d1d5db', fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af' }} />
        <Tooltip />
        <Bar dataKey="impact" fill={COLORS.secondary} radius={[6, 6, 0, 0]} name="Impacto %" />
        <Bar dataKey="connected_forces" fill={COLORS.info} radius={[6, 6, 0, 0]} name="Fuerzas conectadas" />
      </BarChart>
    </ResponsiveContainer>
  ),
};

/** Competitive battlefield with risk-colored force cards. */
export const PorterBattlefield = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontFamily: 'Inter, sans-serif' }}>
      {FORCES.map((f, i) => {
        const risk = f.cps >= 75 ? 'CRITICAL' : f.cps >= 60 ? 'HIGH' : f.cps >= 40 ? 'MODERATE' : 'LOW';
        const colors = { CRITICAL: '#dc2626', HIGH: '#f97316', MODERATE: '#eab308', LOW: '#22c55e' };
        return (
          <div key={i} style={{
            padding: '16px', borderRadius: '12px', width: '180px',
            background: `linear-gradient(135deg, ${colors[risk]}15, ${colors[risk]}05)`,
            border: `1px solid ${colors[risk]}40`,
          }}>
            <div style={{ fontSize: '0.75rem', color: colors[risk], fontWeight: 700, marginBottom: '4px' }}>{risk}</div>
            <div style={{ fontWeight: 600, color: '#e5e7eb', marginBottom: '8px' }}>{f.force}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: colors[risk] }}>{f.score}/5</div>
            <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '4px' }}>CPS: {f.cps}%</div>
          </div>
        );
      })}
    </div>
  ),
};

/** Industry attractiveness assessment summary. */
export const PorterAttractivenessMatrix = {
  render: () => {
    const avg = FORCES.reduce((a, f) => a + f.score, 0) / FORCES.length;
    const attract = Math.max(1, Math.min(5, Math.round((5 - avg + 1) * 100) / 100));
    const posture = attract >= 3.5 ? 'OFFENSIVE' : attract >= 2.5 ? 'SELECTIVE' : 'DEFENSIVE';
    const postureColors = { OFFENSIVE: '#22c55e', SELECTIVE: '#f59e0b', DEFENSIVE: '#ef4444' };
    return (
      <div style={{
        padding: '24px', borderRadius: '16px', maxWidth: '400px',
        background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
        fontFamily: 'Inter, sans-serif', color: '#e5e7eb',
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem' }}>Industry Assessment</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div><div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Avg CPS</div><div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{avg.toFixed(1)}/5</div></div>
          <div><div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Attractiveness</div><div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{attract.toFixed(1)}/5</div></div>
        </div>
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <span style={{
            padding: '6px 20px', borderRadius: '20px',
            backgroundColor: postureColors[posture], color: '#fff',
            fontWeight: 700, fontSize: '0.9rem',
          }}>{posture}</span>
        </div>
      </div>
    );
  },
};

/** One-pager executive summary card. */
export const PorterOnePager = {
  render: () => (
    <div style={{
      padding: '32px', maxWidth: '600px', borderRadius: '16px',
      background: '#111827', color: '#e5e7eb', fontFamily: 'Inter, sans-serif',
    }}>
      <h2 style={{ margin: '0 0 8px', fontSize: '1.3rem' }}>Porter 5 Forces — Executive Summary</h2>
      <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: '0 0 20px' }}>DGII — Análisis Competitivo Q1 2026</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '20px' }}>
        {FORCES.map((f, i) => (
          <div key={i} style={{ textAlign: 'center', padding: '12px 4px', borderRadius: '8px', background: '#1f2937' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: COLORS.forces[i] }}>{f.score}</div>
            <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '4px' }}>{f.force}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: '12px', background: '#1f2937', borderRadius: '8px', fontSize: '0.85rem', lineHeight: 1.6, color: '#d1d5db' }}>
        <strong>Diagnosis:</strong> Industry shows high competitive pressure (avg 3.4/5). Buyer power is the dominant
        force at 5/5, requiring immediate strategic response. Defensive positioning recommended for supplier negotiations.
      </div>
    </div>
  ),
};

/** Confidence overlay showing AI analysis reliability. */
export const PorterConfidenceOverlay = {
  render: () => {
    const confidenceLevels = [
      { force: 'Rivalidad', confidence: 92, sources: 12, recency: 'Q1 2026' },
      { force: 'Nuevos Entrantes', confidence: 78, sources: 6, recency: 'Q4 2025' },
      { force: 'Sustitutos', confidence: 85, sources: 8, recency: 'Q1 2026' },
      { force: 'Poder Comprador', confidence: 95, sources: 15, recency: 'Q1 2026' },
      { force: 'Poder Proveedor', confidence: 70, sources: 4, recency: 'Q3 2025' },
    ];
    return (
      <div style={{ fontFamily: 'Inter, sans-serif' }}>
        {confidenceLevels.map((c, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '10px 16px', marginBottom: '6px', borderRadius: '8px', background: '#1f2937',
          }}>
            <div style={{ width: '140px', color: '#d1d5db', fontSize: '0.85rem', fontWeight: 600 }}>{c.force}</div>
            <div style={{ flex: 1, height: '8px', background: '#374151', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${c.confidence}%`, height: '100%', background: c.confidence >= 85 ? '#22c55e' : c.confidence >= 70 ? '#f59e0b' : '#ef4444', borderRadius: '4px' }} />
            </div>
            <div style={{ width: '40px', textAlign: 'right', color: c.confidence >= 85 ? '#22c55e' : '#f59e0b', fontWeight: 700, fontSize: '0.85rem' }}>{c.confidence}%</div>
            <div style={{ fontSize: '0.7rem', color: '#6b7280', width: '80px' }}>{c.sources} sources</div>
          </div>
        ))}
      </div>
    );
  },
};

// ── Meta ───────────────────────────────────────────────────

export default {
  title: 'Estrategia 365/Porter Intelligence',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Premium visualization components for Porter Five Forces competitive intelligence. Includes radar, heatmap, battlefield, timeline, Monte Carlo, BSC bridge, attractiveness matrix, and confidence overlays.',
      },
    },
    backgrounds: { default: 'dark', values: [{ name: 'dark', value: '#0f172a' }] },
  },
};
