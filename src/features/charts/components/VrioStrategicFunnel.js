/**
 * VrioStrategicFunnel — VRIO Gate Filter Visualization (Fase 2)
 * ==============================================================
 * La representación más fiel a Barney (1991).
 * Los recursos entran al funnel por V y se filtran en cada gate:
 * Todos → V → V+R → V+R+I → V+R+I+O (Ventaja Sostenida).
 * Cada gate muestra cuántos recursos "sobreviven".
 * SVG Sankey-inspired con barras de flujo.
 */
"use client";
import { useState } from 'react';

const GATES = [
  { key: 'all',               label: 'Todos los Recursos', color: '#94a3b8', icon: '📦', desc: 'Total de recursos y capacidades identificadas' },
  { key: 'valuable',          label: '¿Es Valioso?',       color: '#10b981', icon: 'V',  desc: 'Explotan oportunidades o neutralizan amenazas del entorno' },
  { key: 'rare',              label: '¿Es Raro?',          color: '#6366f1', icon: 'R',  desc: 'Pocos competidores actuales o potenciales lo poseen' },
  { key: 'costly_to_imitate', label: '¿Es Inimitable?',    color: '#f59e0b', icon: 'I',  desc: 'Difícil o costoso de replicar por condiciones históricas, ambigüedad o complejidad social' },
  { key: 'organized',         label: '¿Organizado?',       color: '#a855f7', icon: 'O',  desc: 'La empresa tiene sistemas y procesos para explotarlo plenamente' },
];

const OUTCOMES = {
  0: { label: 'Desventaja',         color: '#ff4d6a', icon: '⚠️' },
  1: { label: 'Paridad',            color: '#f59e0b', icon: '⚖️' },
  2: { label: 'Ventaja Temporal',   color: '#6366f1', icon: '⏳' },
  3: { label: 'No Explotada',       color: '#a855f7', icon: '🔓' },
  4: { label: 'Ventaja Sostenida',  color: '#10b981', icon: '🏆' },
};

function criteriaCount(r) {
  return [r.valuable, r.rare, r.costly_to_imitate, r.organized].filter(Boolean).length;
}

export default function VrioStrategicFunnel({ resources = [] }) {
  const [selected, setSelected] = useState(null); // gate key
  const [hoveredResource, setHoveredResource] = useState(null);

  if (!resources.length) return null;

  // Count resources surviving each gate cumulatively
  const gateData = GATES.map((gate, idx) => {
    if (gate.key === 'all') return { ...gate, survivors: resources, count: resources.length, lost: 0 };
    const survivors = resources.filter(r => {
      const checks = [r.valuable, r.rare, r.costly_to_imitate, r.organized].slice(0, idx);
      return checks.every(Boolean);
    });
    const prev = idx > 0 ? resources.filter(r => {
      const checks = [r.valuable, r.rare, r.costly_to_imitate, r.organized].slice(0, idx - 1);
      return checks.every(Boolean);
    }).length : resources.length;
    return { ...gate, survivors, count: survivors.length, lost: prev - survivors.length };
  });

  const finalSustained = gateData[gateData.length - 1].survivors.filter(r =>
    r.valuable && r.rare && r.costly_to_imitate && r.organized
  );

  const maxCount = resources.length;
  const selGate = selected ? gateData.find(g => g.key === selected) : null;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="glass-panel" style={{ padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔽</div>
          <span style={{ fontSize: '1rem', fontWeight: 700 }}>VRIO Strategic Funnel — Filtro de Dominancia</span>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
          Representación más fiel a Barney (1991) · Solo los recursos que pasan los 4 filtros generan ventaja sostenida · Click en gate para ver recursos
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1rem', alignItems: 'start' }}>
        {/* Funnel SVG */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          {gateData.map((gate, i) => {
            const width = (gate.count / maxCount) * 100;
            const prevWidth = i > 0 ? (gateData[i-1].count / maxCount) * 100 : 100;
            const isLast = i === GATES.length - 1;
            const isSel = selected === gate.key;
            return (
              <div key={gate.key} style={{ marginBottom: i < gateData.length - 1 ? '0.15rem' : 0 }}>
                {/* Gate label */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: `${gate.color}20`, border: `1.5px solid ${gate.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: i === 0 ? '0.75rem' : '0.78rem', fontWeight: 800, color: gate.color }}>
                      {gate.icon}
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{gate.label}</span>
                  </div>
                  <div style={{ display: 'flex', align: 'center', gap: '0.75rem' }}>
                    {gate.lost > 0 && (
                      <span style={{ fontSize: '0.65rem', color: '#ff4d6a' }}>−{gate.lost} excluidos</span>
                    )}
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: gate.color }}>{gate.count}</span>
                  </div>
                </div>

                {/* Funnel bar */}
                <div onClick={() => setSelected(isSel ? null : gate.key)} style={{
                  position: 'relative', height: isLast ? 52 : 40,
                  cursor: 'pointer', marginBottom: '0.1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {/* Trapezoid shape using clip-path */}
                  <div style={{
                    width: `${Math.max(width, 8)}%`,
                    height: '100%',
                    background: isSel ? `${gate.color}30` : `${gate.color}15`,
                    border: `1.5px solid ${isSel ? gate.color : gate.color + '44'}`,
                    borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    <div style={{ height: '100%', width: `${(gate.count / maxCount) * 100}%`, position: 'absolute', left: 0, top: 0, background: `${gate.color}25`, borderRadius: '6px 0 0 6px' }} />
                    <span style={{ position: 'relative', fontSize: '0.72rem', fontWeight: 700, color: gate.color }}>
                      {gate.count} / {maxCount} recursos
                    </span>
                  </div>
                  {/* Full-width background track */}
                  <div style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)', zIndex: -1 }} />
                </div>

                {/* Connector arrow */}
                {i < gateData.length - 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', marginBottom: '0.1rem' }}>↓</div>
                )}
              </div>
            );
          })}

          {/* Outcome badges */}
          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Posiciones Competitivas</div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {resources.map((r, i) => {
                const count = criteriaCount(r);
                const outcome = OUTCOMES[count];
                return (
                  <div key={i} onMouseEnter={() => setHoveredResource(r)} onMouseLeave={() => setHoveredResource(null)} style={{
                    padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.65rem', fontWeight: 600,
                    background: `${outcome.color}15`, border: `1px solid ${outcome.color}33`, color: outcome.color,
                    cursor: 'default',
                  }}>
                    {outcome.icon} {r.resource_name?.slice(0, 15)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {hoveredResource ? (
            <div className="glass-panel animate-fade-in" style={{ padding: '1rem', borderLeft: `3px solid ${OUTCOMES[criteriaCount(hoveredResource)]?.color}` }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem' }}>{hoveredResource.resource_name}</div>
              <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.4rem' }}>
                {[{ k: 'valuable', l: 'V', c: '#10b981' }, { k: 'rare', l: 'R', c: '#6366f1' }, { k: 'costly_to_imitate', l: 'I', c: '#f59e0b' }, { k: 'organized', l: 'O', c: '#a855f7' }].map(d => (
                  <div key={d.k} style={{ width: 26, height: 26, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: hoveredResource[d.k] ? `${d.c}20` : 'rgba(255,77,106,0.1)', border: `1.5px solid ${hoveredResource[d.k] ? d.c + '55' : '#ff4d6a33'}`, fontSize: '0.75rem', fontWeight: 800, color: hoveredResource[d.k] ? d.c : '#ff4d6a' }}>
                    {d.l}
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 0.4rem', fontSize: '0.65rem', color: OUTCOMES[criteriaCount(hoveredResource)]?.color, fontWeight: 700 }}>
                  {OUTCOMES[criteriaCount(hoveredResource)]?.icon} {OUTCOMES[criteriaCount(hoveredResource)]?.label}
                </div>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{hoveredResource.description}</div>
            </div>
          ) : selGate ? (
            <div className="glass-panel animate-fade-in" style={{ padding: '1rem', borderLeft: `3px solid ${selGate.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: selGate.color }}>{selGate.label}</div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.5 }}>{selGate.desc}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                {selGate.count} recursos en este nivel:
              </div>
              {selGate.survivors?.map((r, i) => (
                <div key={i} style={{ padding: '0.4rem 0.5rem', borderRadius: 7, marginBottom: '0.25rem', background: `${selGate.color}08`, border: `1px solid ${selGate.color}22` }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600 }}>{r.resource_name}</div>
                  <div style={{ fontSize: '0.63rem', color: 'var(--text-tertiary)' }}>{r.description?.slice(0, 55)}…</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.6rem' }}>Doctrina del Funnel</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                Barney (1991) propone que la ventaja competitiva sostenida requiere superar los <strong>4 filtros secuenciales</strong>. La mayoría de los recursos se eliminan antes de llegar al núcleo.
              </div>
              {GATES.slice(1).map((g, i) => (
                <div key={g.key} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.35rem' }}>
                  <div style={{ width: 20, height: 20, borderRadius: 4, background: `${g.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: g.color, flexShrink: 0 }}>{g.icon}</div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>{g.desc}</span>
                </div>
              ))}
              <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', color: '#10b981', fontWeight: 700 }}>
                🏆 {finalSustained.length} de {maxCount} recursos generan ventaja sostenida ({Math.round((finalSustained.length / maxCount) * 100)}%)
              </div>
            </div>
          )}

          {/* Funnel stats */}
          <div className="glass-panel" style={{ padding: '0.85rem' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Tasa de Conversión por Gate</div>
            {GATES.slice(1).map((gate, i) => {
              const prev = gateData[i].count;
              const curr = gateData[i + 1].count;
              const rate = prev > 0 ? Math.round((curr / prev) * 100) : 0;
              return (
                <div key={gate.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.65rem', color: gate.color, fontWeight: 700 }}>{gate.icon} {gate.label.replace('¿Es ', '').replace('?', '')}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: rate >= 75 ? '#10b981' : rate >= 50 ? '#f59e0b' : '#ff4d6a' }}>{rate}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
