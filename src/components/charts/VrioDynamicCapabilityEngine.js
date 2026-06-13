/**
 * VrioDynamicCapabilityEngine — Teece (1997) Dynamic Capabilities (Fase 3)
 * =========================================================================
 * El nivel más doctrinal del VRIO. Basado en David Teece (1997):
 * Sensing — detectar oportunidades/amenazas del entorno
 * Seizing — capturar oportunidades rápidamente
 * Transforming — reconfigurar capacidades ante cambios
 *
 * Mapea recursos VRIO a las 3 dimensiones de capacidades dinámicas.
 * Sin scores: clasificación derivada de competitive_implication + keywords.
 * Visual: 3-panel cockpit con resources en cada dimensión.
 */
"use client";
import { useState } from 'react';

const DC_DIMENSIONS = {
  sensing: {
    label: 'Sensing',
    subtitle: 'Detección de Señales',
    color: '#6366f1',
    icon: '📡',
    teece: 'Capacidad para escanear, crear, interpretar y aprender del entorno competitivo',
    keywords: /mercado|cliente|competidor|inteligencia|dato|analítica|investigaci|monitor|tendencia|sensor|entorno|externa/i,
    preferImplications: ['sustained_advantage', 'unused_advantage'],
    action: 'Invertir en capacidades de inteligencia estratégica y vigilancia del entorno',
  },
  seizing: {
    label: 'Seizing',
    subtitle: 'Captura de Oportunidades',
    color: '#10b981',
    icon: '⚡',
    teece: 'Capacidad para movilizar recursos rápidamente y capturar oportunidades detectadas',
    keywords: /ejecuci|operaci|velocidad|agil|proceso|entrega|producto|innov|tecnolog|escalar|capital|financi/i,
    preferImplications: ['sustained_advantage', 'temporary_advantage'],
    action: 'Acelerar ciclos de decisión y asignación de recursos para capturar ventanas de oportunidad',
  },
  transforming: {
    label: 'Transforming',
    subtitle: 'Reconfiguración Adaptativa',
    color: '#f59e0b',
    icon: '🔄',
    teece: 'Capacidad para reconfigurar y renovar la base de recursos ante cambios del entorno',
    keywords: /cultur|talento|liderazgo|aprendizaje|conocimiento|cambio|adapt|transform|organiz|capacit|alianza|partner/i,
    preferImplications: ['sustained_advantage', 'unused_advantage', 'parity'],
    action: 'Desarrollar rutinas de renovación organizacional y gestión del cambio estratégico',
  },
};

// Assign each resource to a DC dimension
function classifyResource(r) {
  const text = `${r.resource_name} ${r.description || ''} ${r.recommendation || ''}`;
  let best = null;
  let bestScore = -1;

  Object.entries(DC_DIMENSIONS).forEach(([dim, meta]) => {
    const keywordMatch = meta.keywords.test(text) ? 2 : 0;
    const implMatch = meta.preferImplications.includes(r.competitive_implication) ? 1 : 0;
    const score = keywordMatch + implMatch;
    if (score > bestScore) { bestScore = score; best = dim; }
  });

  // Default distribution: sustained/unused → seizing, temp → sensing, rest → transforming
  if (!best || bestScore === 0) {
    if (r.competitive_implication === 'sustained_advantage') return 'seizing';
    if (r.competitive_implication === 'unused_advantage') return 'transforming';
    if (r.competitive_implication === 'temporary_advantage') return 'sensing';
    return 'transforming';
  }
  return best;
}

const IMPLICATIONS = {
  sustained_advantage: { color: '#10b981', icon: '🏆', label: 'Sostenida' },
  unused_advantage:    { color: '#a855f7', icon: '🔓', label: 'No Explotada' },
  temporary_advantage: { color: '#6366f1', icon: '⏳', label: 'Temporal' },
  parity:              { color: '#f59e0b', icon: '⚖️', label: 'Paridad' },
  disadvantage:        { color: '#ff4d6a', icon: '⚠️', label: 'Desventaja' },
};

function criteriaCount(r) {
  return [r.valuable, r.rare, r.costly_to_imitate, r.organized].filter(Boolean).length;
}

export default function VrioDynamicCapabilityEngine({ resources = [] }) {
  const [selected, setSelected] = useState(null);
  const [activeDim, setActiveDim] = useState(null);

  if (!resources.length) return null;

  const classified = resources.map(r => ({ ...r, dc: classifyResource(r), dcMeta: DC_DIMENSIONS[classifyResource(r)] }));
  const byDim = { sensing: [], seizing: [], transforming: [] };
  classified.forEach(r => { if (byDim[r.dc]) byDim[r.dc].push(r); });

  const sel = selected ? classified.find(r => (r.id || r.resource_name) === selected) : null;

  // DC maturity: % of resources with sustained advantage in each dimension
  const dcMaturity = (dim) => {
    const items = byDim[dim];
    if (!items.length) return 0;
    const sustained = items.filter(r => r.competitive_implication === 'sustained_advantage').length;
    return Math.round((sustained / items.length) * 100);
  };

  const overallDCScore = Math.round(
    (dcMaturity('sensing') + dcMaturity('seizing') + dcMaturity('transforming')) / 3
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔬</div>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>Dynamic Capability Engine — Teece (1997)</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
            Más allá del VRIO estático: ¿puede la organización renovar sus ventajas ante cambios del entorno?
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '0.6rem 1rem', borderRadius: 10, background: overallDCScore >= 60 ? 'rgba(16,185,129,0.1)' : overallDCScore >= 35 ? 'rgba(245,158,11,0.1)' : 'rgba(255,77,106,0.1)', border: `1px solid ${overallDCScore >= 60 ? '#10b981' : overallDCScore >= 35 ? '#f59e0b' : '#ff4d6a'}33` }}>
          <div style={{ fontSize: '0.58rem', color: 'var(--text-tertiary)', marginBottom: '0.1rem' }}>DC SCORE</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: overallDCScore >= 60 ? '#10b981' : overallDCScore >= 35 ? '#f59e0b' : '#ff4d6a', lineHeight: 1 }}>{overallDCScore}%</div>
          <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>madurez adaptativa</div>
        </div>
      </div>

      {/* Teece Triangle */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        {Object.entries(DC_DIMENSIONS).map(([dim, meta]) => {
          const items = byDim[dim];
          const maturity = dcMaturity(dim);
          const isActive = activeDim === dim;
          return (
            <div key={dim} onClick={() => setActiveDim(isActive ? null : dim)} style={{
              padding: '1.25rem', borderRadius: 12, cursor: 'pointer',
              background: isActive ? `${meta.color}12` : `${meta.color}06`,
              border: `1.5px solid ${isActive ? meta.color + '55' : meta.color + '25'}`,
              transition: 'all 0.2s', transform: isActive ? 'translateY(-2px)' : 'none',
            }}>
              {/* Dimension header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>{meta.icon}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: meta.color }}>{meta.label}</span>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>{meta.subtitle}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: meta.color, lineHeight: 1 }}>{maturity}%</div>
                  <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>madurez</div>
                </div>
              </div>

              {/* Maturity bar */}
              <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden', marginBottom: '0.75rem' }}>
                <div style={{ height: '100%', width: `${maturity}%`, background: meta.color, borderRadius: 2, transition: 'width 0.4s' }} />
              </div>

              {/* Teece doctrine */}
              <div style={{ fontSize: '0.67rem', color: 'var(--text-tertiary)', lineHeight: 1.4, marginBottom: '0.75rem' }}>
                {meta.teece}
              </div>

              {/* Resources in this dimension */}
              <div style={{ fontSize: '0.6rem', color: meta.color, fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                {items.length} capacidad{items.length !== 1 ? 'es' : ''}
              </div>
              {items.slice(0, 3).map((r, i) => {
                const impl = IMPLICATIONS[r.competitive_implication] || IMPLICATIONS.parity;
                return (
                  <div key={i} onClick={e => { e.stopPropagation(); setSelected(selected === (r.id || r.resource_name) ? null : (r.id || r.resource_name)); }} style={{
                    padding: '0.3rem 0.45rem', borderRadius: 6, marginBottom: '0.2rem', cursor: 'pointer',
                    background: selected === (r.id || r.resource_name) ? `${impl.color}20` : `${meta.color}08`,
                    border: `1px solid ${selected === (r.id || r.resource_name) ? impl.color + '55' : meta.color + '20'}`,
                    transition: 'all 0.15s',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {(r.resource_name || '').slice(0, 22)}{(r.resource_name || '').length > 22 ? '…' : ''}
                      </span>
                      <span style={{ fontSize: '0.6rem', color: impl.color }}>{impl.icon}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '2px', marginTop: '0.2rem' }}>
                      {[r.valuable, r.rare, r.costly_to_imitate, r.organized].map((v, j) => (
                        <div key={j} style={{ width: 7, height: 7, borderRadius: 2, background: v ? ['#10b981','#6366f1','#f59e0b','#a855f7'][j] : 'rgba(255,77,106,0.3)' }} />
                      ))}
                    </div>
                  </div>
                );
              })}
              {items.length > 3 && <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>+{items.length - 3} más</div>}
            </div>
          );
        })}
      </div>

      {/* Strategy recommendations by dimension */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        {Object.entries(DC_DIMENSIONS).map(([dim, meta]) => {
          const maturity = dcMaturity(dim);
          const urgent = maturity < 30;
          return (
            <div key={dim} style={{ padding: '0.85rem', borderRadius: 10, background: urgent ? `${meta.color}08` : 'rgba(255,255,255,0.02)', border: `1px solid ${urgent ? meta.color + '30' : 'rgba(255,255,255,0.05)'}` }}>
              <div style={{ fontSize: '0.65rem', color: meta.color, fontWeight: 700, marginBottom: '0.3rem' }}>
                {meta.icon} {meta.label} — {urgent ? '⚠️ Prioridad Alta' : maturity >= 60 ? '✅ Maduro' : '🟡 En desarrollo'}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {meta.action}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected resource panel */}
      {sel && (
        <div className="glass-panel animate-fade-in" style={{ padding: '1.25rem', borderLeft: `4px solid ${DC_DIMENSIONS[sel.dc]?.color}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{sel.resource_name}</div>
              <div style={{ fontSize: '0.7rem', color: DC_DIMENSIONS[sel.dc]?.color }}>
                {DC_DIMENSIONS[sel.dc]?.icon} Capacidad de {DC_DIMENSIONS[sel.dc]?.label} · {(IMPLICATIONS[sel.competitive_implication] || IMPLICATIONS.parity).icon} {(IMPLICATIONS[sel.competitive_implication] || IMPLICATIONS.parity).label}
              </div>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.6rem' }}>
            <div style={{ padding: '0.6rem', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginBottom: '0.2rem' }}>VRIO Profile</div>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                {[{ k: 'valuable', l: 'V', c: '#10b981' }, { k: 'rare', l: 'R', c: '#6366f1' }, { k: 'costly_to_imitate', l: 'I', c: '#f59e0b' }, { k: 'organized', l: 'O', c: '#a855f7' }].map(d => (
                  <div key={d.k} style={{ width: 24, height: 24, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: sel[d.k] ? `${d.c}20` : 'rgba(255,77,106,0.1)', border: `1px solid ${sel[d.k] ? d.c + '44' : '#ff4d6a30'}`, fontSize: '0.72rem', fontWeight: 800, color: sel[d.k] ? d.c : '#ff4d6a' }}>
                    {d.l}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '0.6rem', borderRadius: 8, background: `${DC_DIMENSIONS[sel.dc]?.color}08`, border: `1px solid ${DC_DIMENSIONS[sel.dc]?.color}22` }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginBottom: '0.2rem' }}>Contribución DC</div>
              <div style={{ fontSize: '0.72rem', color: DC_DIMENSIONS[sel.dc]?.color, fontWeight: 700 }}>
                {DC_DIMENSIONS[sel.dc]?.label} — {DC_DIMENSIONS[sel.dc]?.subtitle}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.5rem' }}>{sel.description}</div>
          {sel.recommendation && (
            <div style={{ padding: '0.5rem 0.65rem', borderRadius: 8, background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.7rem', color: '#6366f1', lineHeight: 1.4 }}>
              📌 {sel.recommendation}
            </div>
          )}
        </div>
      )}

      {/* Active dimension expanded view */}
      {activeDim && byDim[activeDim].length > 3 && (
        <div className="glass-panel animate-fade-in" style={{ padding: '1.25rem', borderTop: `3px solid ${DC_DIMENSIONS[activeDim]?.color}` }}>
          <div style={{ fontSize: '0.72rem', color: DC_DIMENSIONS[activeDim]?.color, fontWeight: 700, marginBottom: '0.75rem' }}>
            {DC_DIMENSIONS[activeDim]?.icon} Todos los recursos de {DC_DIMENSIONS[activeDim]?.label} ({byDim[activeDim].length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {byDim[activeDim].slice(3).map((r, i) => {
              const impl = IMPLICATIONS[r.competitive_implication] || IMPLICATIONS.parity;
              return (
                <div key={i} style={{ padding: '0.4rem 0.6rem', borderRadius: 8, background: `${impl.color}08`, border: `1px solid ${impl.color}22`, fontSize: '0.72rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.resource_name}</span>
                  <span style={{ marginLeft: '0.4rem', color: impl.color, fontSize: '0.65rem' }}>{impl.icon} {impl.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ padding: '0.65rem 1rem', borderRadius: 8, fontSize: '0.65rem', color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
        🔬 <strong style={{ color: 'var(--text-secondary)' }}>Teece, Pisano & Shuen (1997)</strong> — Dynamic Capabilities & Strategic Management · VRIO estático + DC dinámico = ventaja competitiva duradera
      </div>
    </div>
  );
}
