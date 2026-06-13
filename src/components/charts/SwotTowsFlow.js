/**
 * SwotTowsFlow — SWOT-to-TOWS Sankey Bridge (Fase 1 Priority)
 * =============================================================
 * Visualiza el flujo causal FODA → TOWS.
 * Fortalezas + Oportunidades → FO (Ofensivo)
 * Fortalezas + Amenazas     → FA (Defensivo)
 * Debilidades + Oportunidades → DO (Reorientación)
 * Debilidades + Amenazas     → DA (Supervivencia)
 * Click en estrategia TOWS para ver los factores que la generan.
 */
"use client";
import { useState } from 'react';

const Q = {
  strength:    { label: 'Fortaleza',    short: 'F', color: '#10b981', icon: '💪', col: 0 },
  weakness:    { label: 'Debilidad',    short: 'D', color: '#ff4d6a', icon: '⚠️', col: 0 },
  opportunity: { label: 'Oportunidad', short: 'O', color: '#6366f1', icon: '🚀', col: 1 },
  threat:      { label: 'Amenaza',      short: 'A', color: '#f59e0b', icon: '🔥', col: 1 },
};

const CROSS = {
  FO: { label: 'FO — Ofensivo',       color: '#10b981', bg: 'rgba(16,185,129,0.08)', icon: '⚔️', desc: 'Maximizar F + Capturar O' },
  FA: { label: 'FA — Defensivo',      color: '#6366f1', bg: 'rgba(99,102,241,0.08)', icon: '🛡️', desc: 'Usar F para frenar A' },
  DO: { label: 'DO — Reorientación',  color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', icon: '🔄', desc: 'Convertir D en F via O' },
  DA: { label: 'DA — Supervivencia',  color: '#ff4d6a', bg: 'rgba(255,77,106,0.08)', icon: '🆘', desc: 'Minimizar D + esquivar A' },
};

export default function SwotTowsFlow({ swot = [], tows = [] }) {
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [hoveredFactor, setHoveredFactor] = useState(null);

  if (!swot.length) return null;

  const byQ = { strength: [], weakness: [], opportunity: [], threat: [] };
  swot.forEach(s => { if (byQ[s.quadrant]) byQ[s.quadrant].push(s); });
  Object.keys(byQ).forEach(k => byQ[k].sort((a, b) => (b.impact_score || 3) - (a.impact_score || 3)));

  const byType = { FO: [], FA: [], DO: [], DA: [] };
  tows.forEach(t => { if (byType[t.cross_type]) byType[t.cross_type].push(t); });

  const selStrat = selectedStrategy ? tows.find(t => t.id === selectedStrategy || `${t.cross_type}-${tows.indexOf(t)}` === selectedStrategy) : null;

  // Summary counts
  const criticalThreats = byQ.threat.filter(t => (t.impact_score || 3) >= 4).length;
  const topStrengths = byQ.strength.filter(s => (s.impact_score || 3) >= 4).length;
  const hasTows = tows.length > 0;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* KPI Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
        {[
          { label: 'Fortalezas', value: byQ.strength.length, color: '#10b981', icon: '💪', sub: `${topStrengths} críticas` },
          { label: 'Debilidades', value: byQ.weakness.length, color: '#ff4d6a', icon: '⚠️', sub: 'a resolver' },
          { label: 'Oportunidades', value: byQ.opportunity.length, color: '#6366f1', icon: '🚀', sub: 'identificadas' },
          { label: 'Amenazas', value: byQ.threat.length, color: '#f59e0b', icon: '🔥', sub: `${criticalThreats} críticas` },
        ].map((kpi, i) => (
          <div key={i} style={{ padding: '0.85rem', borderRadius: 12, textAlign: 'center', background: `${kpi.color}08`, border: `1px solid ${kpi.color}25` }}>
            <div style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>{kpi.icon}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>{kpi.label}</div>
            <div style={{ fontSize: '0.58rem', color: kpi.color, marginTop: '0.1rem' }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* SWOT → TOWS Flow */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔗</div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700 }}>FODA → TOWS Bridge</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
              Flujo causal: factores internos × externos → estrategias doctrinales · Weihrich (1982) · Click para detalle
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr', gap: '0', alignItems: 'stretch', minHeight: 380 }}>

          {/* Left col: SWOT factors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {['strength', 'weakness', 'opportunity', 'threat'].map(qKey => {
              const meta = Q[qKey];
              const items = byQ[qKey].slice(0, 4);
              return (
                <div key={qKey}>
                  <div style={{ fontSize: '0.6rem', color: meta.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {meta.icon} {meta.label} ({byQ[qKey].length})
                  </div>
                  {items.map((item, i) => {
                    const isHov = hoveredFactor === `${qKey}-${i}`;
                    return (
                      <div key={i}
                        onMouseEnter={() => setHoveredFactor(`${qKey}-${i}`)}
                        onMouseLeave={() => setHoveredFactor(null)}
                        style={{
                          padding: '0.45rem 0.65rem', borderRadius: 8, marginBottom: '0.25rem',
                          background: isHov ? `${meta.color}12` : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${isHov ? meta.color + '44' : meta.color + '18'}`,
                          borderLeft: `3px solid ${meta.color}`,
                          transition: 'all 0.2s', cursor: 'default',
                        }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.4rem' }}>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4, flex: 1 }}>
                            {item.description?.length > 60 ? item.description.slice(0, 60) + '…' : item.description}
                          </div>
                          <span style={{
                            fontSize: '0.6rem', fontWeight: 700, color: (item.impact_score || 3) >= 4 ? '#ff4d6a' : (item.impact_score || 3) >= 3 ? '#f59e0b' : '#10b981',
                            whiteSpace: 'nowrap', flexShrink: 0,
                          }}>{item.impact_score || 3}/5</span>
                        </div>
                        <div style={{ height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 1, marginTop: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${((item.impact_score || 3) / 5) * 100}%`, background: meta.color, borderRadius: 1 }} />
                        </div>
                      </div>
                    );
                  })}
                  {byQ[qKey].length > 4 && (
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', padding: '0.2rem 0.5rem' }}>
                      +{byQ[qKey].length - 4} más…
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Center: SVG arrows */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <svg width="60" height="100%" viewBox="0 0 60 380" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
              {/* F+O → FO */}
              <path d="M 0 40 C 30 40, 30 40, 60 40" fill="none" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="4,3" />
              <path d="M 0 200 C 30 200, 30 40, 60 40" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="4,3" />
              {/* F+A → FA */}
              <path d="M 0 40 C 30 40, 30 130, 60 130" fill="none" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="4,3" />
              <path d="M 0 295 C 30 295, 30 130, 60 130" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="4,3" />
              {/* D+O → DO */}
              <path d="M 0 120 C 30 120, 30 215, 60 215" fill="none" stroke="#ff4d6a" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="4,3" />
              <path d="M 0 200 C 30 200, 30 215, 60 215" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="4,3" />
              {/* D+A → DA */}
              <path d="M 0 120 C 30 120, 30 320, 60 320" fill="none" stroke="#ff4d6a" strokeWidth="1.2" strokeOpacity="0.4" strokeDasharray="4,3" />
              <path d="M 0 295 C 30 295, 30 320, 60 320" fill="none" stroke="#f59e0b" strokeWidth="1.2" strokeOpacity="0.3" strokeDasharray="4,3" />
              {/* Center label */}
              <text x="30" y="190" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="8" fontWeight="700" transform="rotate(-90 30 190)">CRUCE</text>
            </svg>
          </div>

          {/* Right col: TOWS quadrants */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {['FO', 'FA', 'DO', 'DA'].map(ct => {
              const meta = CROSS[ct];
              const strategies = byType[ct];
              return (
                <div key={ct} style={{
                  padding: '0.75rem', borderRadius: 10,
                  background: meta.bg, border: `1px solid ${meta.color}33`,
                  borderLeft: `3px solid ${meta.color}`, flex: 1,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.9rem' }}>{meta.icon}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: meta.color }}>{meta.label}</span>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>({strategies.length})</span>
                  </div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', marginBottom: '0.4rem' }}>{meta.desc}</div>
                  {hasTows ? (
                    strategies.slice(0, 2).map((s, i) => {
                      const sId = s.id || `${ct}-${i}`;
                      const isSel = selectedStrategy === sId;
                      return (
                        <div key={i} onClick={() => setSelectedStrategy(isSel ? null : sId)} style={{
                          padding: '0.4rem 0.5rem', borderRadius: 7, marginBottom: '0.25rem',
                          background: isSel ? `${meta.color}18` : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${isSel ? meta.color + '55' : 'rgba(255,255,255,0.06)'}`,
                          cursor: 'pointer', transition: 'all 0.2s',
                        }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                            {s.strategy?.length > 70 ? s.strategy.slice(0, 70) + '…' : s.strategy}
                          </div>
                          {s.internal_factors && (
                            <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>
                              🏠 {s.internal_factors?.length > 35 ? s.internal_factors.slice(0, 35) + '…' : s.internal_factors}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                      Genera TOWS para ver estrategias {ct}
                    </div>
                  )}
                  {strategies.length > 2 && (
                    <div style={{ fontSize: '0.6rem', color: meta.color, marginTop: '0.15rem' }}>
                      +{strategies.length - 2} estrategias más
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Strategy detail */}
      {selStrat && (
        <div className="glass-panel animate-fade-in" style={{ padding: '1.25rem', borderLeft: `4px solid ${CROSS[selStrat.cross_type]?.color}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.2rem' }}>{CROSS[selStrat.cross_type]?.icon}</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: CROSS[selStrat.cross_type]?.color }}>
              {CROSS[selStrat.cross_type]?.label}
            </span>
            <button onClick={() => setSelectedStrategy(null)} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
            {selStrat.strategy}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.72rem' }}>
            {selStrat.internal_factors && (
              <div style={{ padding: '0.6rem', borderRadius: 8, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div style={{ color: '#10b981', fontWeight: 700, marginBottom: '0.25rem' }}>🏠 Factores Internos</div>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>{selStrat.internal_factors}</div>
              </div>
            )}
            {selStrat.external_factors && (
              <div style={{ padding: '0.6rem', borderRadius: 8, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <div style={{ color: '#6366f1', fontWeight: 700, marginBottom: '0.25rem' }}>🌐 Factores Externos</div>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>{selStrat.external_factors}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: '0.65rem 1rem', borderRadius: 8, fontSize: '0.65rem', color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
        🏛️ <strong style={{ color: 'var(--text-secondary)' }}>Weihrich (1982) TOWS Matrix</strong> — FO: estrategias ofensivas · FA: estrategias defensivas · DO: reorientación · DA: supervivencia
      </div>
    </div>
  );
}
