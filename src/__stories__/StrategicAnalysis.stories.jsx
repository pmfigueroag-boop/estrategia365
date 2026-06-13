/**
 * Estrategia 365 — Strategic Analysis Stories (P1: UX Governance)
 * ================================================================
 * Storybook stories for BCG Matrix, Blue Ocean Canvas, FODA/SWOT,
 * BSC Gauge, and Strategy Map components.
 */

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ScatterChart, Scatter, Cell, ReferenceLine,
  PieChart, Pie,
  ResponsiveContainer,
} from 'recharts';

// ══════════════════════════════════════════════════════════════
// BCG MATRIX
// ══════════════════════════════════════════════════════════════

const BCG_UNITS = [
  { name: 'Producto A', quadrant: 'star', growth: 0.18, share: 0.55, x: 55, y: 18 },
  { name: 'Producto B', quadrant: 'cow', growth: 0.04, share: 0.65, x: 65, y: 4 },
  { name: 'Producto C', quadrant: 'question', growth: 0.22, share: 0.12, x: 12, y: 22 },
  { name: 'Producto D', quadrant: 'dog', growth: 0.02, share: 0.08, x: 8, y: 2 },
  { name: 'Producto E', quadrant: 'star', growth: 0.15, share: 0.45, x: 45, y: 15 },
];

const QUADRANT_COLORS = { star: '#f59e0b', cow: '#22c55e', question: '#6366f1', dog: '#6b7280' };

export const BCGMatrix = {
  render: () => (
    <ResponsiveContainer width={500} height={400}>
      <ScatterChart>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="x" name="Market Share %" domain={[0, 80]} tick={{ fill: '#9ca3af' }} label={{ value: 'Market Share %', position: 'bottom', fill: '#6b7280' }} />
        <YAxis dataKey="y" name="Growth %" domain={[0, 30]} tick={{ fill: '#9ca3af' }} label={{ value: 'Growth %', angle: -90, position: 'left', fill: '#6b7280' }} />
        <ReferenceLine x={30} stroke="#374151" strokeDasharray="5 5" label={{ value: 'Share Threshold', fill: '#4b5563', fontSize: 10 }} />
        <ReferenceLine y={10} stroke="#374151" strokeDasharray="5 5" label={{ value: 'Growth Threshold', fill: '#4b5563', fontSize: 10 }} />
        <Tooltip content={({ payload }) => payload?.[0] ? (
          <div style={{ background: '#1f2937', padding: '8px 12px', borderRadius: '8px', color: '#e5e7eb', fontSize: '0.8rem' }}>
            <div style={{ fontWeight: 700 }}>{payload[0].payload.name}</div>
            <div>Growth: {(payload[0].payload.growth * 100).toFixed(0)}% | Share: {(payload[0].payload.share * 100).toFixed(0)}%</div>
            <div style={{ color: QUADRANT_COLORS[payload[0].payload.quadrant], fontWeight: 600 }}>{payload[0].payload.quadrant.toUpperCase()}</div>
          </div>
        ) : null} />
        <Scatter name="Units" data={BCG_UNITS}>
          {BCG_UNITS.map((u, i) => <Cell key={i} fill={QUADRANT_COLORS[u.quadrant]} r={12} />)}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  ),
};

/** BCG portfolio summary legend. */
export const BCGPortfolioSummary = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontFamily: 'Inter, sans-serif' }}>
      {['star', 'cow', 'question', 'dog'].map(q => {
        const labels = { star: '⭐ Stars', cow: '🐄 Cash Cows', question: '❓ Question Marks', dog: '🐕 Dogs' };
        const count = BCG_UNITS.filter(u => u.quadrant === q).length;
        return (
          <div key={q} style={{
            padding: '16px 24px', borderRadius: '12px', minWidth: '120px',
            background: `${QUADRANT_COLORS[q]}15`, border: `1px solid ${QUADRANT_COLORS[q]}40`,
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: QUADRANT_COLORS[q] }}>{count}</div>
            <div style={{ fontSize: '0.8rem', color: '#d1d5db' }}>{labels[q]}</div>
          </div>
        );
      })}
    </div>
  ),
};

// ══════════════════════════════════════════════════════════════
// BLUE OCEAN CANVAS
// ══════════════════════════════════════════════════════════════

const BLUE_OCEAN_FACTORS = [
  { name: 'Precio', industry: 4, proposed: 2 },
  { name: 'Calidad', industry: 3, proposed: 5 },
  { name: 'Velocidad', industry: 2, proposed: 4 },
  { name: 'Cobertura', industry: 3, proposed: 3 },
  { name: 'Servicio', industry: 2, proposed: 5 },
  { name: 'Innovación', industry: 1, proposed: 4 },
];

export const BlueOceanCanvas = {
  render: () => (
    <ResponsiveContainer width={550} height={350}>
      <BarChart data={BLUE_OCEAN_FACTORS}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="name" tick={{ fill: '#d1d5db', fontSize: 11 }} />
        <YAxis domain={[0, 5]} tick={{ fill: '#9ca3af' }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="industry" fill="#6b7280" name="Industria" radius={[4, 4, 0, 0]} />
        <Bar dataKey="proposed" fill="#06b6d4" name="Propuesta" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  ),
};

/** ERRC actions framework card. */
export const BlueOceanERRC = {
  render: () => {
    const actions = [
      { action: 'ELIMINATE', items: ['Overhead costs', 'Manual processes'], color: '#ef4444' },
      { action: 'REDUCE', items: ['Price complexity', 'Delivery time'], color: '#f59e0b' },
      { action: 'RAISE', items: ['Quality', 'Customer service', 'Speed'], color: '#22c55e' },
      { action: 'CREATE', items: ['AI-driven insights', 'Real-time monitoring'], color: '#6366f1' },
    ];
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxWidth: '500px', fontFamily: 'Inter, sans-serif' }}>
        {actions.map(a => (
          <div key={a.action} style={{
            padding: '16px', borderRadius: '12px',
            background: `${a.color}10`, border: `1px solid ${a.color}30`,
          }}>
            <div style={{ fontWeight: 700, color: a.color, fontSize: '0.85rem', marginBottom: '8px' }}>{a.action}</div>
            {a.items.map(item => (
              <div key={item} style={{ fontSize: '0.8rem', color: '#d1d5db', marginBottom: '4px' }}>• {item}</div>
            ))}
          </div>
        ))}
      </div>
    );
  },
};

// ══════════════════════════════════════════════════════════════
// FODA (SWOT)
// ══════════════════════════════════════════════════════════════

export const FODAQuadrant = {
  render: () => {
    const quadrants = [
      { label: 'Fortalezas', color: '#22c55e', items: ['Marca reconocida', 'Capital humano', 'Infraestructura'] },
      { label: 'Debilidades', color: '#ef4444', items: ['Deuda técnica', 'Baja cobertura rural', 'Dependencia TI'] },
      { label: 'Oportunidades', color: '#6366f1', items: ['Mercado LATAM', 'Digitalización', 'Alianzas'] },
      { label: 'Amenazas', color: '#f59e0b', items: ['Competencia global', 'Regulación', 'Ciberataques'] },
    ];
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxWidth: '520px', fontFamily: 'Inter, sans-serif' }}>
        {quadrants.map(q => (
          <div key={q.label} style={{
            padding: '16px', borderRadius: '12px', minHeight: '120px',
            background: `${q.color}08`, border: `1px solid ${q.color}25`,
          }}>
            <div style={{ fontWeight: 700, color: q.color, fontSize: '0.9rem', marginBottom: '10px' }}>{q.label}</div>
            {q.items.map(item => (
              <div key={item} style={{ fontSize: '0.8rem', color: '#d1d5db', marginBottom: '4px', paddingLeft: '8px', borderLeft: `2px solid ${q.color}40` }}>{item}</div>
            ))}
          </div>
        ))}
      </div>
    );
  },
};

// ══════════════════════════════════════════════════════════════
// BSC GAUGE
// ══════════════════════════════════════════════════════════════

export const BscGaugeDashboard = {
  render: () => {
    const perspectives = [
      { name: 'Financiera', progress: 78, color: '#22c55e' },
      { name: 'Clientes', progress: 65, color: '#06b6d4' },
      { name: 'Procesos', progress: 82, color: '#8b5cf6' },
      { name: 'Aprendizaje', progress: 55, color: '#f59e0b' },
    ];
    return (
      <div style={{ display: 'flex', gap: '20px', fontFamily: 'Inter, sans-serif' }}>
        {perspectives.map(p => (
          <div key={p.name} style={{ textAlign: 'center', width: '110px' }}>
            <div style={{
              width: '90px', height: '90px', borderRadius: '50%', margin: '0 auto',
              background: `conic-gradient(${p.color} ${p.progress * 3.6}deg, #1f2937 ${p.progress * 3.6}deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: '68px', height: '68px', borderRadius: '50%', backgroundColor: '#111827',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '1.1rem', color: p.color,
              }}>
                {p.progress}%
              </div>
            </div>
            <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#9ca3af' }}>{p.name}</div>
          </div>
        ))}
      </div>
    );
  },
};

// ── Meta ───────────────────────────────────────────────────

export default {
  title: 'Estrategia 365/Strategic Analysis',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Strategic analysis visualization components: BCG Matrix, Blue Ocean Canvas with ERRC, FODA quadrant, and BSC gauge dashboard.',
      },
    },
    backgrounds: { default: 'dark', values: [{ name: 'dark', value: '#0f172a' }] },
  },
};
