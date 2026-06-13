/**
 * VrioGenomeStrip — Strategic Asset DNA (Fase 1)
 * ================================================
 * Cada recurso = fila horizontal con 4 segmentos V/R/I/O.
 * Coloreados verde (cumple) / rojo (no cumple).
 * Ordenados por criterios cumplidos (más → menos).
 * Reemplaza la tabla con visualización densa e institucional.
 */
"use client";
import { useState } from 'react';

const DIMS = [
  { key: 'valuable',          label: 'V', full: 'Valioso',           color: '#10b981', desc: 'Explota oportunidades o neutraliza amenazas' },
  { key: 'rare',              label: 'R', full: 'Raro',              color: '#6366f1', desc: 'Pocos competidores lo poseen actualmente' },
  { key: 'costly_to_imitate', label: 'I', full: 'Inimitable',        color: '#f59e0b', desc: 'Difícil o costoso de replicar' },
  { key: 'organized',         label: 'O', full: 'Organizado',        color: '#a855f7', desc: 'La empresa está organizada para explotarlo' },
];

const IMPLICATIONS = {
  sustained_advantage: { label: 'Sostenida',  color: '#10b981', icon: '🏆' },
  unused_advantage:    { label: 'Inexplotada',color: '#a855f7', icon: '🔓' },
  temporary_advantage: { label: 'Temporal',   color: '#6366f1', icon: '⏳' },
  parity:              { label: 'Paridad',    color: '#f59e0b', icon: '⚖️' },
  disadvantage:        { label: 'Desventaja', color: '#ff4d6a', icon: '⚠️' },
};

function criteriaCount(r) {
  return [r.valuable, r.rare, r.costly_to_imitate, r.organized].filter(Boolean).length;
}

export default function VrioGenomeStrip({ resources = [] }) {
  const [selected, setSelected] = useState(null);
  const [sortBy, setSortBy] = useState('criteria'); // criteria | name | implication

  if (!resources.length) return null;

  const sorted = [...resources].sort((a, b) => {
    if (sortBy === 'criteria') return criteriaCount(b) - criteriaCount(a);
    if (sortBy === 'name') return (a.resource_name || '').localeCompare(b.resource_name || '');
    const order = { sustained_advantage: 0, unused_advantage: 1, temporary_advantage: 2, parity: 3, disadvantage: 4 };
    return (order[a.competitive_implication] || 3) - (order[b.competitive_implication] || 3);
  });

  const sel = selected ? sorted.find(r => (r.id || r.resource_name) === selected) : null;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🧬</div>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>Strategic Capability Genome</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
            Huella genética competitiva · Patrón V/R/I/O por recurso · {resources.length} capacidades analizadas
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          {[{ k: 'criteria', l: '# Criterios' }, { k: 'implication', l: 'Implicación' }, { k: 'name', l: 'Nombre' }].map(s => (
            <button key={s.k} onClick={() => setSortBy(s.k)} style={{
              padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.65rem', cursor: 'pointer',
              border: `1px solid ${sortBy === s.k ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'}`,
              background: sortBy === s.k ? 'rgba(255,255,255,0.07)' : 'transparent',
              color: sortBy === s.k ? 'var(--text-primary)' : 'var(--text-tertiary)',
            }}>{s.l}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1rem', alignItems: 'start' }}>
        {/* Genome grid */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          {/* Legend row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4,36px) 110px', gap: '0.4rem', marginBottom: '0.75rem', alignItems: 'center' }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>Recurso / Capacidad</div>
            {DIMS.map(d => (
              <div key={d.key} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 800, color: d.color }}>{d.label}</div>
            ))}
            <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>Implicación</div>
          </div>

          {sorted.map((r, i) => {
            const count = criteriaCount(r);
            const impl = IMPLICATIONS[r.competitive_implication] || IMPLICATIONS.parity;
            const isSel = selected === (r.id || r.resource_name);
            return (
              <div key={i} onClick={() => setSelected(isSel ? null : (r.id || r.resource_name))} style={{
                display: 'grid', gridTemplateColumns: '1fr repeat(4,36px) 110px',
                gap: '0.4rem', alignItems: 'center',
                padding: '0.5rem 0.5rem', borderRadius: 8, marginBottom: '0.25rem',
                background: isSel ? `${impl.color}10` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isSel ? impl.color + '44' : 'rgba(255,255,255,0.05)'}`,
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                {/* Name + bar */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                    {r.resource_name}
                  </div>
                  {/* Strength bar */}
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[0,1,2,3].map(j => (
                      <div key={j} style={{ height: 3, flex: 1, borderRadius: 2, background: j < count ? impl.color : 'rgba(255,255,255,0.07)' }} />
                    ))}
                  </div>
                </div>

                {/* VRIO booleans */}
                {DIMS.map(d => {
                  const val = r[d.key];
                  return (
                    <div key={d.key} style={{
                      width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
                      background: val ? `${d.color}20` : 'rgba(255,77,106,0.08)',
                      border: `1.5px solid ${val ? d.color + '55' : 'rgba(255,77,106,0.25)'}`,
                      fontSize: '0.78rem', fontWeight: 800,
                      color: val ? d.color : '#ff4d6a',
                    }}>
                      {val ? '✓' : '✗'}
                    </div>
                  );
                })}

                {/* Implication badge */}
                <div style={{ padding: '0.2rem 0.4rem', borderRadius: 6, background: `${impl.color}15`, border: `1px solid ${impl.color}33`, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700, color: impl.color }}>{impl.icon} {impl.label}</div>
                </div>
              </div>
            );
          })}

          {/* Legend */}
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
            {DIMS.map(d => (
              <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.62rem', color: 'var(--text-tertiary)' }}>
                <div style={{ width: 20, height: 20, borderRadius: 4, background: `${d.color}20`, border: `1px solid ${d.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: d.color, fontWeight: 800, fontSize: '0.7rem' }}>{d.label}</div>
                {d.full}: {d.desc.slice(0,30)}
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sel ? (
            <div className="glass-panel animate-fade-in" style={{ padding: '1rem', borderLeft: `3px solid ${IMPLICATIONS[sel.competitive_implication]?.color || '#888'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{sel.resource_name}</div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>✕</button>
              </div>
              {/* Full VRIO breakdown */}
              {DIMS.map(d => {
                const val = sel[d.key];
                return (
                  <div key={d.key} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem', padding: '0.4rem 0.5rem', borderRadius: 7, background: val ? `${d.color}08` : 'rgba(255,77,106,0.05)' }}>
                    <div style={{ width: 22, height: 22, borderRadius: 5, background: val ? `${d.color}25` : 'rgba(255,77,106,0.15)', border: `1.5px solid ${val ? d.color + '66' : '#ff4d6a44'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: val ? d.color : '#ff4d6a', fontSize: '0.8rem', fontWeight: 800 }}>{d.label}</div>
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: val ? d.color : '#ff4d6a' }}>{d.full}: {val ? '✓ Cumple' : '✗ No cumple'}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', lineHeight: 1.3 }}>{d.desc}</div>
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop: '0.5rem', padding: '0.5rem', borderRadius: 7, background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                📌 {sel.recommendation}
              </div>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.6rem' }}>Distribución Genómica</div>
              {Object.entries(IMPLICATIONS).map(([k, impl]) => {
                const count = resources.filter(r => r.competitive_implication === k).length;
                const pct = Math.round((count / resources.length) * 100);
                return (
                  <div key={k} style={{ marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', marginBottom: '0.15rem' }}>
                      <span style={{ color: impl.color }}>{impl.icon} {impl.label}</span>
                      <span style={{ color: 'var(--text-tertiary)' }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: impl.color, borderRadius: 2 }} />
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop: '0.75rem', fontSize: '0.65rem', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                Cada fila es la "huella genética" competitiva del recurso. El patrón completo ✓✓✓✓ indica ventaja sostenida.
              </div>
            </div>
          )}
          {/* VRIO dimension guide */}
          <div className="glass-panel" style={{ padding: '0.85rem' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Barney (1991)</div>
            {DIMS.map(d => (
              <div key={d.key} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: d.color, width: 14 }}>{d.label}</span>
                <span style={{ fontSize: '0.67rem', color: 'var(--text-tertiary)', lineHeight: 1.3 }}>{d.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
