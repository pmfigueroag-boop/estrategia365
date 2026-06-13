/**
 * BoStrategicDNA — Strategic Fingerprint (Blue Ocean Fase 2)
 * ============================================================
 * Patrón único de la estrategia Blue Ocean de la organización.
 * Cada factor es un "gen" con su score propuesto y acción ERRC.
 * Visual: strip genómico horizontal coloreado por ERRC, ordenado
 * por magnitud de divergencia.
 * Doctrina: Kim & Mauborgne — La curva de valor es la identidad
 * estratégica de la organización.
 */
"use client";
import { useState } from 'react';

const ERRC_META = {
  eliminate: { color: '#ff4d6a', icon: '❌', label: 'Eliminar', bg: 'rgba(255,77,106,0.15)' },
  reduce:    { color: '#f59e0b', icon: '⬇️', label: 'Reducir',  bg: 'rgba(245,158,11,0.15)' },
  raise:     { color: '#6366f1', icon: '⬆️', label: 'Incrementar', bg: 'rgba(99,102,241,0.15)' },
  create:    { color: '#10b981', icon: '✨', label: 'Crear',    bg: 'rgba(16,185,129,0.15)' },
};

export default function BoStrategicDNA({ factors = [] }) {
  const [selected, setSelected] = useState(null);

  if (!factors.length) return null;

  const enriched = factors.map(f => ({
    ...f,
    delta: f.proposed_score - f.industry_score,
    absDelta: Math.abs(f.proposed_score - f.industry_score),
    errc: ERRC_META[f.errc_action] || ERRC_META.raise,
  }));

  // Sort by ERRC order then by delta magnitude
  const errcOrder = ['create', 'raise', 'reduce', 'eliminate'];
  const sorted = [...enriched].sort((a, b) => {
    const oa = errcOrder.indexOf(a.errc_action), ob = errcOrder.indexOf(b.errc_action);
    if (oa !== ob) return oa - ob;
    return b.absDelta - a.absDelta;
  });

  const sel = selected !== null ? sorted.find(f => f.name === selected) : null;
  const totalGenes = factors.length;
  const createCount = factors.filter(f => f.errc_action === 'create').length;
  const eliminateCount = factors.filter(f => f.errc_action === 'eliminate').length;
  const uniquenessScore = Math.round(((createCount + eliminateCount) / totalGenes) * 100);

  // Gene strip dimensions
  const W = 640, H = 80;
  const geneW = Math.max(12, (W - 20) / totalGenes - 2);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🧬</div>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>Strategic DNA Fingerprint</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
            Huella genética de la estrategia Blue Ocean — cada gen es un factor, su color es la acción ERRC
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '0.4rem 0.75rem', borderRadius: 9, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>UNIQUENESS</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>{uniquenessScore}%</div>
        </div>
      </div>

      {/* Gene strip */}
      <div className="glass-panel" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(2,4,16,0.97), rgba(6,8,24,0.95))' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
          <defs>
            <filter id="dnaGlow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          {sorted.map((f, i) => {
            const x = 10 + i * (geneW + 2);
            const isSel = selected === f.name;
            const barH = (f.proposed_score / 5) * (H - 20);
            const industryH = (f.industry_score / 5) * (H - 20);
            return (
              <g key={i} onClick={() => setSelected(isSel ? null : f.name)}
                style={{ cursor: 'pointer' }}>
                {/* Industry ghost bar */}
                <rect x={x} y={H - 10 - industryH} width={geneW} height={industryH}
                  fill="rgba(255,77,106,0.08)" stroke="rgba(255,77,106,0.15)" strokeWidth="0.5" rx="2" />
                {/* Proposed bar */}
                <rect x={x} y={H - 10 - barH} width={geneW} height={barH}
                  fill={`${f.errc.color}${isSel ? '55' : '30'}`}
                  stroke={f.errc.color} strokeWidth={isSel ? 2 : 1}
                  rx="2"
                  filter={isSel ? 'url(#dnaGlow)' : undefined}
                  style={{ transition: 'all 0.15s' }} />
                {/* ERRC icon */}
                <text x={x + geneW / 2} y={H - 10 - barH - 5} textAnchor="middle" fontSize="7">
                  {f.errc.icon}
                </text>
                {/* Score label */}
                {(isSel || geneW > 20) && (
                  <text x={x + geneW / 2} y={H - 10 - barH + 12} textAnchor="middle"
                    fill={f.errc.color} fontSize="7" fontWeight="700">{f.proposed_score}</text>
                )}
              </g>
            );
          })}
          {/* Baseline */}
          <line x1={8} y1={H - 10} x2={W - 8} y2={H - 10} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px', marginTop: '0.3rem' }}>
          <span style={{ fontSize: '0.6rem', color: '#10b981' }}>✨ Crear</span>
          <span style={{ fontSize: '0.6rem', color: '#6366f1' }}>⬆️ Incrementar</span>
          <span style={{ fontSize: '0.6rem', color: '#f59e0b' }}>⬇️ Reducir</span>
          <span style={{ fontSize: '0.6rem', color: '#ff4d6a' }}>❌ Eliminar</span>
        </div>
      </div>

      {/* Detail + factor list */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {sel ? (
          <div className="glass-panel animate-fade-in" style={{ padding: '1rem', borderLeft: `3px solid ${sel.errc.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{sel.name}</div>
                <div style={{ fontSize: '0.65rem', color: sel.errc.color }}>{sel.errc.icon} {sel.errc.label}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.35rem', marginBottom: '0.4rem' }}>
              {[['Industria', sel.industry_score, '#ff4d6a'], ['Propuesta', sel.proposed_score, '#10b981'], ['Δ', (sel.delta > 0 ? '+' : '') + sel.delta, sel.delta > 0 ? '#10b981' : '#ff4d6a']].map(([l, v, c]) => (
                <div key={l} style={{ padding: '0.35rem', borderRadius: 6, background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>{l}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: c }}>{v}</div>
                </div>
              ))}
            </div>
            {sel.evidence && <div style={{ fontSize: '0.67rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>📄 {sel.evidence}</div>}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Lectura del ADN</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.4rem' }}>
              Cada barra vertical es un "gen" estratégico. La altura = score propuesto (1-5). El color indica la acción ERRC. Las barras fantasma (rojas tenues) muestran la industria.
            </div>
            <div style={{ fontSize: '0.65rem', color: uniquenessScore >= 40 ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
              {uniquenessScore >= 40 ? '🧬 ADN estratégico diferenciado — identidad única' : '⚠️ ADN convergente — necesita más genes de creación/eliminación'}
            </div>
          </div>
        )}

        <div className="glass-panel" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Genes Estratégicos ({totalGenes})</div>
          <div style={{ maxHeight: 180, overflowY: 'auto' }}>
            {sorted.map((f, i) => (
              <div key={i} onClick={() => setSelected(selected === f.name ? null : f.name)} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.25rem 0.4rem', borderRadius: 5, marginBottom: '0.15rem', cursor: 'pointer',
                background: selected === f.name ? `${f.errc.color}15` : 'transparent',
                transition: 'all 0.15s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <div style={{ width: 6, height: 6, borderRadius: 2, background: f.errc.color }} />
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{f.name}</span>
                </div>
                <span style={{ fontSize: '0.62rem', fontWeight: 700, color: f.errc.color }}>{f.proposed_score}/5</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
