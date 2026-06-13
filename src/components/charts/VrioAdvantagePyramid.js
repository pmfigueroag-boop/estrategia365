/**
 * VrioAdvantagePyramid — Sustainable Advantage Pyramid (Fase 2)
 * =============================================================
 * 5-level pyramid: base = 0 criteria (Desventaja), cima = 4 (Sostenida).
 * Resources appear as nodes at their pyramid level.
 * Visual immediatamente legible para un board:
 * "cuántos recursos protegen el núcleo estratégico"
 */
"use client";
import { useState } from 'react';

const LEVELS = [
  { count: 4, label: 'Ventaja\nSostenida',  color: '#10b981', icon: '🏆', bg: 'rgba(16,185,129,0.15)', implication: 'sustained_advantage',  barney: 'Fuente de renta económica superior y duradera' },
  { count: 3, label: 'No\nExplotada',       color: '#a855f7', icon: '🔓', bg: 'rgba(168,85,247,0.10)', implication: 'unused_advantage',     barney: 'Potencial sin aprovechar — riesgo de pérdida sin acción' },
  { count: 2, label: 'Ventaja\nTemporal',   color: '#6366f1', icon: '⏳', bg: 'rgba(99,102,241,0.10)', implication: 'temporary_advantage',  barney: 'Genera retornos mientras el mercado no replica' },
  { count: 1, label: 'Paridad\nCompetitiva',color: '#f59e0b', icon: '⚖️', bg: 'rgba(245,158,11,0.08)', implication: 'parity',              barney: 'Necesario para sobrevivir, insuficiente para liderar' },
  { count: 0, label: 'Desventaja\nCompetitiva', color: '#ff4d6a', icon: '⚠️', bg: 'rgba(255,77,106,0.08)', implication: 'disadvantage',  barney: 'Erosiona posición — acción correctiva urgente' },
];

function criteriaCount(r) {
  return [r.valuable, r.rare, r.costly_to_imitate, r.organized].filter(Boolean).length;
}

export default function VrioAdvantagePyramid({ resources = [] }) {
  const [selected, setSelected] = useState(null);
  const [hoveredLevel, setHoveredLevel] = useState(null);

  if (!resources.length) return null;

  const byLevel = LEVELS.map(l => ({
    ...l,
    resources: resources.filter(r => criteriaCount(r) === l.count),
  }));

  const maxInLevel = Math.max(...byLevel.map(l => l.resources.length), 1);
  const totalSustained = byLevel[0].resources.length;
  const pyramidHealth = Math.round((totalSustained / resources.length) * 100);

  const sel = selected ? resources.find(r => (r.id || r.resource_name) === selected) : null;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔺</div>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>Sustainable Advantage Pyramid</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
            La cima es el núcleo estratégico · Solo recursos con 4/4 criterios generan ventaja sostenible
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '0.5rem 1rem', borderRadius: 10, background: pyramidHealth >= 30 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${pyramidHealth >= 30 ? '#10b981' : '#f59e0b'}33` }}>
          <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)', marginBottom: '0.1rem' }}>PYRAMID APEX</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: pyramidHealth >= 30 ? '#10b981' : '#f59e0b', lineHeight: 1 }}>{totalSustained}/{resources.length}</div>
          <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>sostenidas</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1rem', alignItems: 'start' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          {byLevel.map((level, i) => {
            const isTop = i === 0;
            // Pyramid: top is narrowest visually, bottom widest
            // Level 0 (sustained) = apex = narrow; Level 4 (disadvantage) = base = wide
            const maxWidth = 30 + (i / (LEVELS.length - 1)) * 65; // 30% → 95%
            const minWidth = Math.max(10, (level.resources.length / maxInLevel) * maxWidth);
            const displayWidth = Math.max(minWidth, level.resources.length > 0 ? 20 : 8);
            const isHov = hoveredLevel === i;

            return (
              <div key={i}
                onMouseEnter={() => setHoveredLevel(i)}
                onMouseLeave={() => setHoveredLevel(null)}
                style={{ marginBottom: '0.3rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Pyramid layer */}
                <div onClick={() => setHoveredLevel(isHov ? null : i)} style={{
                  width: `${maxWidth}%`, minHeight: isTop ? 64 : 52,
                  background: isHov ? level.bg.replace('0.', '0.2') : level.bg,
                  border: `1.5px solid ${isHov ? level.color : level.color + '44'}`,
                  borderRadius: isTop ? '10px 10px 6px 6px' : i === LEVELS.length - 1 ? '4px 4px 10px 10px' : '4px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem', cursor: 'pointer', transition: 'all 0.2s',
                  position: 'relative', overflow: 'hidden',
                }}>
                  {/* Fill bar */}
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: level.resources.length > 0 ? `${(level.resources.length / maxInLevel) * 100}%` : '0%',
                    background: `${level.color}15`, transition: 'width 0.4s ease',
                  }} />

                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: isTop ? '1.2rem' : '1rem' }}>{level.icon}</span>
                    <div>
                      <div style={{ fontSize: isTop ? '0.82rem' : '0.75rem', fontWeight: 700, color: level.color }}>
                        {level.label.replace('\n', ' ')}
                      </div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>
                        {level.count}/4 criterios VRIO
                      </div>
                    </div>
                  </div>

                  {/* Resource pills */}
                  <div style={{ position: 'relative', display: 'flex', gap: '0.25rem', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '55%' }}>
                    {level.resources.slice(0, 4).map((r, j) => (
                      <div key={j} onClick={e => { e.stopPropagation(); setSelected(selected === (r.id || r.resource_name) ? null : (r.id || r.resource_name)); }} style={{
                        padding: '0.15rem 0.4rem', borderRadius: 5, fontSize: '0.6rem', fontWeight: 600,
                        background: `${level.color}25`, border: `1px solid ${level.color}55`, color: level.color,
                        cursor: 'pointer', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {r.resource_name?.slice(0, 14)}
                      </div>
                    ))}
                    {level.resources.length > 4 && (
                      <div style={{ padding: '0.15rem 0.4rem', borderRadius: 5, fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>
                        +{level.resources.length - 4}
                      </div>
                    )}
                    {level.resources.length === 0 && (
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>ninguno</span>
                    )}
                  </div>
                </div>

                {/* Count badge + connector */}
                {i < LEVELS.length - 1 && (
                  <div style={{ height: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', position: 'relative' }}>
                    <div style={{ height: '100%', width: 1, background: 'rgba(255,255,255,0.1)', position: 'absolute' }} />
                    <div style={{ background: 'rgba(8,12,22,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '0 4px', fontSize: '0.58rem', color: 'var(--text-tertiary)', position: 'relative' }}>
                      ↑ {level.resources.length}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Base label */}
          <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.62rem', color: 'var(--text-tertiary)' }}>
            Base de la pirámide → Cima estratégica · {resources.length} recursos analizados
          </div>
        </div>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sel ? (
            <div className="glass-panel animate-fade-in" style={{ padding: '1rem', borderLeft: `3px solid ${LEVELS[4 - criteriaCount(sel)]?.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{sel.resource_name}</span>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                {[{ k: 'valuable', l: 'V', c: '#10b981' }, { k: 'rare', l: 'R', c: '#6366f1' }, { k: 'costly_to_imitate', l: 'I', c: '#f59e0b' }, { k: 'organized', l: 'O', c: '#a855f7' }].map(d => (
                  <div key={d.k} style={{ width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: sel[d.k] ? `${d.c}20` : 'rgba(255,77,106,0.1)', border: `1.5px solid ${sel[d.k] ? d.c + '55' : '#ff4d6a33'}`, fontSize: '0.78rem', fontWeight: 800, color: sel[d.k] ? d.c : '#ff4d6a' }}>
                    {d.l}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.4rem' }}>{sel.description}</div>
              <div style={{ fontSize: '0.68rem', color: '#6366f1', lineHeight: 1.4, padding: '0.4rem 0.5rem', borderRadius: 7, background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)' }}>
                📌 {sel.recommendation}
              </div>
            </div>
          ) : hoveredLevel !== null ? (
            <div className="glass-panel animate-fade-in" style={{ padding: '1rem', borderLeft: `3px solid ${LEVELS[hoveredLevel]?.color}` }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: LEVELS[hoveredLevel]?.color, marginBottom: '0.35rem' }}>
                {LEVELS[hoveredLevel]?.icon} {LEVELS[hoveredLevel]?.label.replace('\n', ' ')}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                {LEVELS[hoveredLevel]?.barney}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                {byLevel[hoveredLevel]?.resources.length} recursos en este nivel:
              </div>
              {byLevel[hoveredLevel]?.resources.map((r, i) => (
                <div key={i} style={{ padding: '0.35rem 0.5rem', borderRadius: 6, marginBottom: '0.2rem', background: `${LEVELS[hoveredLevel]?.color}08`, border: `1px solid ${LEVELS[hoveredLevel]?.color}22`, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {r.resource_name}
                </div>
              ))}
              {byLevel[hoveredLevel]?.resources.length === 0 && (
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Sin recursos en este nivel</div>
              )}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.6rem' }}>Doctrina de la Pirámide</div>
              {LEVELS.map((l, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.45rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: l.bg, border: `1px solid ${l.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.75rem' }}>{l.icon}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: l.color }}>{l.label.replace('\n', ' ')}</div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', lineHeight: 1.3 }}>{l.barney}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="glass-panel" style={{ padding: '0.85rem' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Distribución</div>
            {byLevel.map((l, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.65rem', color: l.color }}>{l.icon} {l.label.replace('\n', ' ')}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>{l.resources.length}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
