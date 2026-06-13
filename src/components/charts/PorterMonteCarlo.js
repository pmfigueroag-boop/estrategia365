/**
 * PorterMonteCarlo — Competitive Stress Simulation Engine (Phase 3 Premium)
 * ===========================================================================
 * Monte Carlo simulation modeling competitive shocks: new entrant disruption,
 * regulatory change, technology substitution, supply chain disruption.
 * Runs N simulations showing CPS distribution, worst/best case, and sensitivity.
 * Pure client-side stochastic engine — no backend dependency.
 */
"use client";
import { useState, useMemo } from 'react';

const SCENARIOS = [
  { id: 'disruptor', label: '🚀 Nuevo Competidor Disruptivo', icon: '🚀',
    description: 'Startup con modelo de negocio innovador entra al mercado',
    impacts: { rivalry: 25, new_entrants: 35, substitutes: 15, buyer_power: 10, supplier_power: -5 } },
  { id: 'regulation', label: '📜 Cambio Regulatorio Mayor', icon: '📜',
    description: 'Nueva regulación aumenta barreras de entrada y compliance',
    impacts: { rivalry: -10, new_entrants: -25, substitutes: 5, buyer_power: 15, supplier_power: 10 } },
  { id: 'ai_disruption', label: '🤖 Disrupción por IA', icon: '🤖',
    description: 'IA generativa reduce barreras y crea sustitutos automatizados',
    impacts: { rivalry: 20, new_entrants: 30, substitutes: 40, buyer_power: 15, supplier_power: -10 } },
  { id: 'supply_shock', label: '📦 Shock en Cadena de Suministro', icon: '📦',
    description: 'Crisis logística o concentración de proveedores clave',
    impacts: { rivalry: 10, new_entrants: -5, substitutes: 5, buyer_power: -5, supplier_power: 35 } },
  { id: 'price_war', label: '💰 Guerra de Precios', icon: '💰',
    description: 'Competidor principal inicia guerra de precios agresiva',
    impacts: { rivalry: 40, new_entrants: -15, substitutes: 10, buyer_power: 25, supplier_power: 5 } },
];

const FORCE_LABELS = {
  rivalry: 'Rivalidad', new_entrants: 'Nuevos Entrantes',
  substitutes: 'Sustitutos', buyer_power: 'Poder Comprador',
  supplier_power: 'Poder Proveedor',
};

const FORCE_COLORS = {
  rivalry: '#ff4d6a', new_entrants: '#a855f7',
  substitutes: '#f0a500', buyer_power: '#3b82f6',
  supplier_power: '#00c896',
};

function runSimulation(baseCPS, scenario, numSims = 500) {
  const results = [];
  for (let i = 0; i < numSims; i++) {
    const simResult = {};
    let totalCPS = 0;
    Object.keys(baseCPS).forEach(force => {
      const base = baseCPS[force];
      const impact = scenario.impacts[force] || 0;
      // Add gaussian noise (±15 CPS standard deviation)
      const noise = (Math.random() + Math.random() + Math.random() - 1.5) * 15;
      const newCPS = Math.max(0, Math.min(100, base + impact + noise));
      simResult[force] = Math.round(newCPS);
      totalCPS += newCPS;
    });
    simResult.avgCPS = Math.round(totalCPS / Object.keys(baseCPS).length);
    results.push(simResult);
  }
  return results;
}

function getDistribution(values, bins = 20) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const binWidth = (max - min) / bins || 1;
  const dist = Array(bins).fill(0);
  values.forEach(v => {
    const idx = Math.min(bins - 1, Math.floor((v - min) / binWidth));
    dist[idx]++;
  });
  return { dist, min, max, binWidth };
}

export default function PorterMonteCarlo({ forces = [] }) {
  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0]);
  const [numSims] = useState(500);

  if (!forces.length) return null;

  // Extract base CPS
  const baseCPS = {};
  forces.forEach(f => {
    const key = f.force_name || f.force || '';
    baseCPS[key] = f.competitive_pressure_score || (f.score || 3) * 20;
  });
  const baseAvg = Math.round(Object.values(baseCPS).reduce((s, v) => s + v, 0) / Object.keys(baseCPS).length);

  // Run simulation
  const simResults = useMemo(() => runSimulation(baseCPS, selectedScenario, numSims),
    [selectedScenario, JSON.stringify(baseCPS)]);

  const avgValues = simResults.map(r => r.avgCPS);
  const simAvg = Math.round(avgValues.reduce((s, v) => s + v, 0) / avgValues.length);
  const simMin = Math.min(...avgValues);
  const simMax = Math.max(...avgValues);
  const p5 = avgValues.sort((a, b) => a - b)[Math.floor(numSims * 0.05)];
  const p95 = avgValues.sort((a, b) => a - b)[Math.floor(numSims * 0.95)];
  const delta = simAvg - baseAvg;

  // Distribution for histogram
  const { dist, min: hMin, binWidth } = getDistribution(avgValues);
  const maxBin = Math.max(...dist);

  // Per-force impact
  const forceImpacts = Object.keys(baseCPS).map(force => {
    const forceValues = simResults.map(r => r[force]);
    const avg = Math.round(forceValues.reduce((s, v) => s + v, 0) / forceValues.length);
    return { force, base: Math.round(baseCPS[force]), simAvg: avg, delta: avg - Math.round(baseCPS[force]) };
  }).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  const W = 520, H = 160;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>
          🎲 Simulación Monte Carlo de Estrés Competitivo
        </h3>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
          {numSims} simulaciones estocásticas • Distribución de impacto por escenario
        </span>
      </div>

      {/* Scenario selector */}
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {SCENARIOS.map(s => (
          <button key={s.id} onClick={() => setSelectedScenario(s)}
            style={{
              padding: '0.35rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem',
              cursor: 'pointer', transition: 'all 0.2s', border: '1px solid',
              borderColor: selectedScenario.id === s.id ? '#6366f1' : 'rgba(255,255,255,0.08)',
              background: selectedScenario.id === s.id ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: selectedScenario.id === s.id ? '#6366f1' : 'var(--text-tertiary)',
              fontWeight: selectedScenario.id === s.id ? 700 : 400,
            }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Scenario description */}
      <div style={{
        padding: '0.6rem 0.75rem', borderRadius: '8px', marginBottom: '1.25rem',
        background: 'rgba(99,102,241,0.06)', borderLeft: '3px solid #6366f1',
        fontSize: '0.8rem', color: 'var(--text-secondary)',
      }}>
        {selectedScenario.icon} <strong>{selectedScenario.label}:</strong> {selectedScenario.description}
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        {/* Histogram */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Distribución CPS Promedio (n={numSims})
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%' }}>
            {/* Bars */}
            {dist.map((count, i) => {
              const barW = (W - 40) / dist.length - 1;
              const barH = (count / maxBin) * (H - 40);
              const x = 30 + i * ((W - 40) / dist.length);
              const binCenter = hMin + (i + 0.5) * binWidth;
              const isBase = Math.abs(binCenter - baseAvg) < binWidth;
              const color = binCenter >= 75 ? '#ff4d6a' : binCenter >= 60 ? '#f0a500' : binCenter >= 40 ? '#6366f1' : '#00c896';
              return (
                <g key={i}>
                  <rect x={x} y={H - 25 - barH} width={barW} height={barH}
                        fill={color} fillOpacity={0.6} rx="1" />
                  {isBase && (
                    <line x1={x + barW / 2} y1={5} x2={x + barW / 2} y2={H - 25}
                          stroke="white" strokeWidth="1" strokeDasharray="3,3" strokeOpacity="0.5" />
                  )}
                </g>
              );
            })}
            {/* X axis */}
            <line x1="30" y1={H - 25} x2={W - 10} y2={H - 25} stroke="rgba(255,255,255,0.15)" />
            <text x="30" y={H - 8} fill="var(--text-tertiary)" fontSize="8">{Math.round(hMin)}</text>
            <text x={W - 10} y={H - 8} fill="var(--text-tertiary)" fontSize="8" textAnchor="end">
              {Math.round(hMin + dist.length * binWidth)}
            </text>
            <text x={W / 2} y={H - 2} fill="var(--text-tertiary)" fontSize="8" textAnchor="middle">CPS Promedio</text>
            {/* Base line label */}
            <text x="25" y="12" fill="rgba(255,255,255,0.4)" fontSize="7">Base: {baseAvg}</text>
          </svg>
        </div>

        {/* KPIs */}
        <div style={{ minWidth: '180px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Resultados
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {[
              { label: 'CPS Base', value: baseAvg, color: 'var(--text-primary)' },
              { label: 'CPS Simulado Ø', value: simAvg, color: delta > 0 ? '#ff4d6a' : '#00c896' },
              { label: 'Δ Impacto', value: `${delta > 0 ? '+' : ''}${delta}`, color: delta > 0 ? '#ff4d6a' : '#00c896' },
              { label: 'Peor caso (P5)', value: p5, color: '#ff4d6a' },
              { label: 'Mejor caso (P95)', value: p95, color: '#00c896' },
              { label: 'Rango', value: `${simMin}–${simMax}`, color: 'var(--text-tertiary)' },
            ].map((kpi, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.35rem 0.5rem', borderRadius: '6px', background: 'rgba(255,255,255,0.02)',
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{kpi.label}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: kpi.color }}>{kpi.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Per-force sensitivity */}
      <div style={{ marginTop: '1rem' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          Sensibilidad por Fuerza
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {forceImpacts.map((fi, i) => {
            const color = FORCE_COLORS[fi.force] || '#888';
            const deltaColor = fi.delta > 0 ? '#ff4d6a' : '#00c896';
            return (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '140px 1fr 60px 60px',
                alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.5rem',
                borderRadius: '6px', background: 'rgba(255,255,255,0.02)',
              }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color }}>{FORCE_LABELS[fi.force]}</span>
                <div style={{ height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', position: 'relative' }}>
                  {/* Base */}
                  <div style={{
                    position: 'absolute', height: '100%', width: `${fi.base}%`,
                    background: `${color}66`, borderRadius: '3px',
                  }} />
                  {/* Sim overlay */}
                  <div style={{
                    position: 'absolute', height: '100%', width: `${fi.simAvg}%`,
                    background: `${color}`, borderRadius: '3px', opacity: 0.4,
                  }} />
                </div>
                <span style={{ fontSize: '0.75rem', textAlign: 'right', color: 'var(--text-secondary)' }}>
                  {fi.base} → {fi.simAvg}
                </span>
                <span style={{ fontSize: '0.75rem', textAlign: 'right', fontWeight: 700, color: deltaColor }}>
                  {fi.delta > 0 ? '+' : ''}{fi.delta}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '1rem', padding: '0.5rem 0.75rem', fontSize: '0.7rem',
        color: 'var(--text-tertiary)', borderLeft: '3px solid var(--accent-secondary)',
        background: 'rgba(255,255,255,0.02)', borderRadius: '0 6px 6px 0',
      }}>
        🎲 Simulación estocástica con {numSims} iteraciones, ruido gaussiano σ=15 CPS.
        P5/P95 = percentiles 5/95 de la distribución. Basado en Porter (1980, 2008).
      </div>
    </div>
  );
}
