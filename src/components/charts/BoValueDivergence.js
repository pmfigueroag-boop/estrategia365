/**
 * BoValueDivergence — Value Curve Divergence Analysis (Blue Ocean Fase 1)
 * ========================================================================
 * Analiza la separación entre curva de industria y propuesta.
 * Cada factor se clasifica por magnitud y dirección del gap.
 * Identifica las oportunidades de océano azul más fuertes.
 * Visual: divergence bars horizontales ordenadas por impacto.
 * Doctrina: Kim & Mauborgne — "To the extent that your strategy
 * has a distinct shape from the industry, you are creating blue ocean."
 */
"use client";
import { useState } from 'react';

const ERRC_META = {
  eliminate: { color: '#ff4d6a', icon: '❌', label: 'Eliminar' },
  reduce:    { color: '#f59e0b', icon: '⬇️', label: 'Reducir'  },
  raise:     { color: '#6366f1', icon: '⬆️', label: 'Incrementar' },
  create:    { color: '#10b981', icon: '✨', label: 'Crear'    },
};

const GAP_TIERS = [
  { min: 3, label: 'RUPTURA',       color: '#10b981', desc: 'Divergencia extrema — potencial de océano azul confirmado' },
  { min: 2, label: 'DIFERENCIACIÓN', color: '#6366f1', desc: 'Separación significativa — ventaja competitiva clara' },
  { min: 1, label: 'AJUSTE',        color: '#f59e0b', desc: 'Divergencia moderada — diferenciación perceptible' },
  { min: -5, label: 'CONVERGENCIA', color: '#ff4d6a', desc: 'Sin divergencia — compitiendo en océano rojo' },
];

function gapTier(delta) {
  return GAP_TIERS.find(t => Math.abs(delta) >= t.min) || GAP_TIERS[GAP_TIERS.length - 1];
}

export default function BoValueDivergence({ factors = [] }) {
  const [selected, setSelected] = useState(null);
  const [sortBy, setSortBy] = useState('impact');

  if (!factors.length) return null;

  const enriched = factors.map(f => {
    const delta = f.proposed_score - f.industry_score;
    return { ...f, delta, absDelta: Math.abs(delta), tier: gapTier(delta), direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat', errc: ERRC_META[f.errc_action] || ERRC_META.raise };
  });

  const sorted = [...enriched].sort((a, b) => {
    if (sortBy === 'impact') return b.absDelta - a.absDelta;
    if (sortBy === 'positive') return b.delta - a.delta;
    if (sortBy === 'negative') return a.delta - b.delta;
    return (a.name || '').localeCompare(b.name || '');
  });

  const totalDivergence = enriched.reduce((s, f) => s + f.absDelta, 0);
  const maxPossible = factors.length * 4;
  const divergencePct = Math.round((totalDivergence / maxPossible) * 100);
  const blueOceanReady = divergencePct >= 45;
  const strongFactors = enriched.filter(f => f.absDelta >= 2).length;
  const weakFactors = enriched.filter(f => f.absDelta === 0).length;

  const sel = selected !== null ? enriched.find(f => f.name === selected) : null;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📐</div>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>Value Curve Divergence Analysis</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
            La divergencia entre curvas define el océano azul · Mayor separación = mayor diferenciación
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '0.5rem 1rem', borderRadius: 10, background: blueOceanReady ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${blueOceanReady ? '#10b981' : '#f59e0b'}33` }}>
          <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>BLUE OCEAN INDEX</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: blueOceanReady ? '#10b981' : '#f59e0b', lineHeight: 1 }}>{divergencePct}%</div>
          <div style={{ fontSize: '0.55rem', color: blueOceanReady ? '#10b981' : '#f59e0b' }}>{blueOceanReady ? '🌊 Océano Azul' : '🔴 Océano Rojo'}</div>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
        {[
          { l: 'Factores totales', v: factors.length, icon: '📊', c: '#6366f1' },
          { l: 'Alta divergencia', v: strongFactors, icon: '🚀', c: '#10b981' },
          { l: 'Sin divergencia', v: weakFactors, icon: '⚠️', c: '#ff4d6a' },
          { l: 'Divergencia total', v: totalDivergence + 'pts', icon: '📐', c: '#f59e0b' },
        ].map((kpi, i) => (
          <div key={i} style={{ padding: '0.7rem 0.6rem', borderRadius: 9, textAlign: 'center', background: `${kpi.c}06`, border: `1px solid ${kpi.c}22` }}>
            <div style={{ fontSize: '1rem' }}>{kpi.icon}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: kpi.c, lineHeight: 1 }}>{kpi.v}</div>
            <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>{kpi.l}</div>
          </div>
        ))}
      </div>

      {/* Sort controls */}
      <div style={{ display: 'flex', gap: '0.35rem' }}>
        {[{ k: 'impact', l: '📐 Mayor impacto' }, { k: 'positive', l: '⬆️ Mayor incremento' }, { k: 'negative', l: '⬇️ Mayor reducción' }, { k: 'name', l: '🔤 Nombre' }].map(s => (
          <button key={s.k} onClick={() => setSortBy(s.k)} style={{
            padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.65rem', cursor: 'pointer',
            border: `1px solid ${sortBy === s.k ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'}`,
            background: sortBy === s.k ? 'rgba(255,255,255,0.07)' : 'transparent',
            color: sortBy === s.k ? 'var(--text-primary)' : 'var(--text-tertiary)',
          }}>{s.l}</button>
        ))}
      </div>

      {/* Divergence bars */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        {sorted.map((f, i) => {
          const isSel = selected === f.name;
          const barColor = f.delta > 0 ? '#10b981' : f.delta < 0 ? '#ff4d6a' : '#94a3b8';
          const barWidth = (f.absDelta / 4) * 100;
          return (
            <div key={i} onClick={() => setSelected(isSel ? null : f.name)} style={{
              display: 'grid', gridTemplateColumns: '140px 1fr 50px 80px 70px',
              gap: '0.6rem', alignItems: 'center',
              padding: '0.55rem 0.5rem', borderRadius: 8, marginBottom: '0.2rem',
              background: isSel ? `${barColor}10` : 'rgba(255,255,255,0.015)',
              border: `1px solid ${isSel ? barColor + '44' : 'rgba(255,255,255,0.04)'}`,
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {/* Factor name */}
              <div>
                <div style={{ fontSize: '0.73rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                <div style={{ fontSize: '0.6rem', color: f.errc.color }}>{f.errc.icon} {f.errc.label}</div>
              </div>

              {/* Divergence bar (centered at 0) */}
              <div style={{ position: 'relative', height: 22 }}>
                <div style={{ position: 'absolute', left: '50%', top: 0, width: 1, height: '100%', background: 'rgba(255,255,255,0.1)' }} />
                <div style={{
                  position: 'absolute',
                  top: 3, height: 16, borderRadius: 4,
                  background: barColor,
                  opacity: 0.75,
                  transition: 'width 0.3s',
                  ...(f.delta >= 0
                    ? { left: '50%', width: `${barWidth / 2}%` }
                    : { right: '50%', width: `${barWidth / 2}%` }
                  ),
                }} />
              </div>

              {/* Delta */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 900, color: barColor }}>
                  {f.delta > 0 ? '+' : ''}{f.delta}
                </div>
              </div>

              {/* Scores */}
              <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.65rem', color: '#ff4d6a', fontWeight: 600 }}>{f.industry_score}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>→</span>
                <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700 }}>{f.proposed_score}</span>
              </div>

              {/* Tier badge */}
              <div style={{ padding: '0.15rem 0.3rem', borderRadius: 5, background: `${f.tier.color}12`, border: `1px solid ${f.tier.color}25`, textAlign: 'center' }}>
                <div style={{ fontSize: '0.55rem', color: f.tier.color, fontWeight: 700, lineHeight: 1.2 }}>{f.tier.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected detail */}
      {sel && (
        <div className="glass-panel animate-fade-in" style={{ padding: '1.25rem', borderLeft: `4px solid ${sel.tier.color}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{sel.errc.icon} {sel.name}</div>
              <div style={{ fontSize: '0.65rem', color: sel.tier.color }}>{sel.tier.label} — delta {sel.delta > 0 ? '+' : ''}{sel.delta}</div>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.45rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.4rem', borderRadius: 7, background: 'rgba(255,77,106,0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>Industria</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ff4d6a' }}>{sel.industry_score}/5</div>
            </div>
            <div style={{ padding: '0.4rem', borderRadius: 7, background: 'rgba(16,185,129,0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>Propuesta</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10b981' }}>{sel.proposed_score}/5</div>
            </div>
            <div style={{ padding: '0.4rem', borderRadius: 7, background: `${sel.tier.color}08`, textAlign: 'center' }}>
              <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>Divergencia</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: sel.tier.color }}>{sel.absDelta}pts</div>
            </div>
          </div>
          {sel.evidence && <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.4rem' }}>📄 {sel.evidence}</div>}
          <div style={{ padding: '0.4rem 0.55rem', borderRadius: 7, background: `${sel.tier.color}08`, border: `1px solid ${sel.tier.color}25`, fontSize: '0.68rem', color: sel.tier.color, lineHeight: 1.4 }}>
            {sel.tier.desc}
          </div>
        </div>
      )}

      <div style={{ padding: '0.65rem 1rem', borderRadius: 8, fontSize: '0.65rem', color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
        📐 <strong style={{ color: 'var(--text-secondary)' }}>Value Curve Divergence</strong> — Kim & Mauborgne: "La forma de tu curva de valor define si estás en océano azul o rojo. Sin divergencia = sin diferenciación."
      </div>
    </div>
  );
}
