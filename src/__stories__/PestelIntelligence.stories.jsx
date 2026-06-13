/**
 * Estrategia 365 — PESTEL Intelligence Stories (P1: UX Governance)
 * ==================================================================
 * Storybook stories for premium PESTEL visualization components.
 */

import React from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ScatterChart, Scatter, Cell, ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

const FACTORS = ['Político', 'Económico', 'Social', 'Tecnológico', 'Ecológico', 'Legal'];
const FACTOR_COLORS = ['#ef4444', '#f97316', '#eab308', '#06b6d4', '#22c55e', '#8b5cf6'];

// ══════════════════════════════════════════════════════════════
// DATA FIXTURES
// ══════════════════════════════════════════════════════════════

const RADAR_DATA = FACTORS.map((f, i) => ({
  dimension: f, high: Math.floor(Math.random() * 4) + 1,
  medium: Math.floor(Math.random() * 5) + 2, low: Math.floor(Math.random() * 3) + 1,
  total: Math.floor(Math.random() * 8) + 4,
}));

const PRIORITY_MATRIX = [
  { id: 1, title: 'Reforma fiscal', factor: 'P', urgency: 85, impact: 92, quadrant: 'act_now' },
  { id: 2, title: 'Inflación', factor: 'E', urgency: 70, impact: 80, quadrant: 'act_now' },
  { id: 3, title: 'Tendencia digital', factor: 'T', urgency: 30, impact: 85, quadrant: 'plan_ahead' },
  { id: 4, title: 'Regulación ambiental', factor: 'E2', urgency: 40, impact: 40, quadrant: 'watch' },
  { id: 5, title: 'Demografía rural', factor: 'S', urgency: 65, impact: 55, quadrant: 'monitor' },
  { id: 6, title: 'Propiedad intelectual', factor: 'L', urgency: 25, impact: 70, quadrant: 'plan_ahead' },
  { id: 7, title: 'Tipo de cambio', factor: 'E', urgency: 80, impact: 75, quadrant: 'act_now' },
  { id: 8, title: 'IA regulación', factor: 'T', urgency: 55, impact: 90, quadrant: 'act_now' },
];

const HEATMAP_DATA = (() => {
  const data = [];
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      data.push({
        row: FACTORS[i], col: FACTORS[j],
        value: i === j ? +(Math.random() * 2 + 1).toFixed(1) : +(Math.random() * 1.5 + 0.3).toFixed(1),
      });
    }
  }
  return data;
})();

const SEVERITY_DIST = FACTORS.map(f => ({
  factor: f,
  high: Math.floor(Math.random() * 4) + 1,
  medium: Math.floor(Math.random() * 5) + 2,
  low: Math.floor(Math.random() * 3) + 1,
}));

// ══════════════════════════════════════════════════════════════
// STORIES
// ══════════════════════════════════════════════════════════════

/** PESTEL radar showing signal density per factor. */
export const PestelRadar = {
  render: () => (
    <ResponsiveContainer width={500} height={400}>
      <RadarChart data={RADAR_DATA}>
        <PolarGrid stroke="#374151" />
        <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: '#d1d5db' }} />
        <PolarRadiusAxis angle={30} domain={[0, 15]} tick={{ fontSize: 10, fill: '#6b7280' }} />
        <Radar name="Alta" dataKey="high" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
        <Radar name="Media" dataKey="medium" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
        <Radar name="Baja" dataKey="low" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} />
        <Legend />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  ),
};

/** Priority matrix — urgency vs impact quadrants. */
export const PestelPriorityMatrix = {
  render: () => {
    const factorIdx = { P: 0, E: 1, S: 2, T: 3, E2: 4, L: 5 };
    return (
      <ResponsiveContainer width={500} height={400}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="urgency" name="Urgencia" domain={[0, 100]} tick={{ fill: '#9ca3af' }} />
          <YAxis dataKey="impact" name="Impacto" domain={[0, 100]} tick={{ fill: '#9ca3af' }} />
          <ReferenceLine x={50} stroke="#374151" strokeDasharray="5 5" />
          <ReferenceLine y={67} stroke="#374151" strokeDasharray="5 5" />
          <Tooltip content={({ payload }) => payload?.[0] ? (
            <div style={{ background: '#1f2937', padding: '8px 12px', borderRadius: '8px', color: '#e5e7eb', fontSize: '0.8rem' }}>
              <div style={{ fontWeight: 700 }}>{payload[0].payload.title}</div>
              <div>Urgencia: {payload[0].payload.urgency}% | Impacto: {payload[0].payload.impact}%</div>
            </div>
          ) : null} />
          <Scatter name="Signals" data={PRIORITY_MATRIX}>
            {PRIORITY_MATRIX.map((s, i) => (
              <Cell key={i} fill={FACTOR_COLORS[factorIdx[s.factor] || 0]} r={8} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    );
  },
};

/** 6×6 cross-factor interaction heat map. */
export const PestelHeatMap = {
  render: () => {
    const getColor = (v) => {
      if (v >= 2.5) return '#dc2626';
      if (v >= 1.5) return '#f59e0b';
      if (v >= 0.8) return '#22c55e';
      return '#3b82f6';
    };
    return (
      <div style={{ display: 'inline-block', fontFamily: 'Inter, sans-serif' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: '2px', fontSize: '0.75rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '6px' }}></th>
              {FACTORS.map(f => <th key={f} style={{ padding: '4px', color: '#9ca3af', fontSize: '0.65rem', writingMode: 'vertical-rl', textAlign: 'left' }}>{f}</th>)}
            </tr>
          </thead>
          <tbody>
            {FACTORS.map(row => (
              <tr key={row}>
                <td style={{ padding: '4px 8px', color: '#d1d5db', fontWeight: 600, fontSize: '0.7rem', whiteSpace: 'nowrap' }}>{row}</td>
                {FACTORS.map(col => {
                  const cell = HEATMAP_DATA.find(c => c.row === row && c.col === col);
                  return (
                    <td key={col} style={{
                      width: 44, height: 44, textAlign: 'center',
                      backgroundColor: getColor(cell?.value || 0), color: '#fff',
                      fontWeight: 700, borderRadius: '4px',
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

/** Stacked bar chart — signal severity distribution by factor. */
export const PestelSeverityDistribution = {
  render: () => (
    <ResponsiveContainer width={500} height={300}>
      <BarChart data={SEVERITY_DIST}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="factor" tick={{ fill: '#d1d5db', fontSize: 11 }} />
        <YAxis tick={{ fill: '#9ca3af' }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="high" stackId="a" fill="#ef4444" name="Alta" radius={[0, 0, 0, 0]} />
        <Bar dataKey="medium" stackId="a" fill="#f59e0b" name="Media" radius={[0, 0, 0, 0]} />
        <Bar dataKey="low" stackId="a" fill="#22c55e" name="Baja" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  ),
};

/** Executive summary card — at-a-glance PESTEL overview. */
export const PestelExecutiveSummary = {
  render: () => {
    const totalSignals = 24;
    const highSeverity = 8;
    const avgImpact = 72;
    return (
      <div style={{
        padding: '28px', maxWidth: '520px', borderRadius: '16px',
        background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
        fontFamily: 'Inter, sans-serif', color: '#e5e7eb',
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1.15rem' }}>PESTEL — Executive Intelligence</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
          <div style={{ textAlign: 'center', padding: '12px', background: '#1f2937', borderRadius: '10px' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#6366f1' }}>{totalSignals}</div>
            <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Señales</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: '#1f2937', borderRadius: '10px' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ef4444' }}>{highSeverity}</div>
            <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Alta Severidad</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: '#1f2937', borderRadius: '10px' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#22c55e' }}>{avgImpact}%</div>
            <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Impacto Promedio</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {FACTORS.map((f, i) => (
            <span key={f} style={{
              padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600,
              backgroundColor: `${FACTOR_COLORS[i]}20`, color: FACTOR_COLORS[i],
            }}>{f}</span>
          ))}
        </div>
      </div>
    );
  },
};

// ── Meta ───────────────────────────────────────────────────

export default {
  title: 'Estrategia 365/PESTEL Intelligence',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Premium PESTEL analysis visualization components: radar, priority matrix, cross-factor heatmap, severity distribution, and executive summary.',
      },
    },
    backgrounds: { default: 'dark', values: [{ name: 'dark', value: '#0f172a' }] },
  },
};
