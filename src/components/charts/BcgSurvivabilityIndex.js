/**
 * BcgSurvivabilityIndex — Strategic Survivability Index (Fase 2)
 * ===============================================================
 * Mide la probabilidad de supervivencia futura de cada unidad.
 * Variables derivadas de BCG data:
 *   - growth: tasa de crecimiento del mercado
 *   - share: participación relativa
 *   - quadrant: posición BCG (proxy para caja y ventaja)
 *   - strategic_action: urgencia implícita
 *
 * Conecta BCG con antifragilidad (Taleb) + Adaptive Strategy.
 * Visual: survivability gauge per unit + portfolio resilience heatmap.
 */
"use client";
import { useState } from 'react';

const QUADRANTS = {
  star:     { color: '#6366f1', icon: '⭐', label: 'Star',          survBase: 0.78, survAdj: +0.12 },
  cow:      { color: '#10b981', icon: '🐄', label: 'Cash Cow',      survBase: 0.85, survAdj: -0.05 },
  question: { color: '#f59e0b', icon: '❓', label: 'Question Mark',  survBase: 0.52, survAdj: +0.15 },
  dog:      { color: '#ff4d6a', icon: '🐕', label: 'Dog',           survBase: 0.32, survAdj: -0.08 },
};

const SURV_TIERS = [
  { min: 0.75, label: 'RESILIENTE',     color: '#10b981', icon: '🛡️', desc: 'Posición robusta — soporta shocks del entorno' },
  { min: 0.55, label: 'ESTABLE',        color: '#6366f1', icon: '⚖️', desc: 'Supervivencia probable bajo condiciones normales' },
  { min: 0.38, label: 'VULNERABLE',     color: '#f59e0b', icon: '⚠️', desc: 'Dependiente de condiciones favorables — riesgo medio' },
  { min: 0,    label: 'CRÍTICA',        color: '#ff4d6a', icon: '🔴', desc: 'Supervivencia en riesgo — acción inmediata requerida' },
];

function survTier(score) {
  return SURV_TIERS.find(t => score >= t.min) || SURV_TIERS[SURV_TIERS.length - 1];
}

// Compute survivability for a unit
function computeSurv(u) {
  const q = QUADRANTS[u.quadrant] || QUADRANTS.dog;
  const growthBonus = Math.max(0, u.growth) * 0.2;
  const shareBonus = u.share * 0.15;
  const raw = Math.max(0.05, Math.min(0.98, q.survBase + growthBonus + shareBonus + q.survAdj));
  return raw;
}

// Gauge arc path for survivability circle
function gaugeArc(cx, cy, r, pct, stroke) {
  const angle = pct * 2 * Math.PI * 0.75 - Math.PI * 0.75;
  const startAngle = -Math.PI * 0.75;
  const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(angle), y2 = cy + r * Math.sin(angle);
  const largeArc = pct > 0.5 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

function SurvGauge({ score, color, size = 60 }) {
  const cx = size / 2, cy = size / 2, r = size * 0.38;
  const trackPath = gaugeArc(cx, cy, r, 1, '#ddd');
  const fillPath = gaugeArc(cx, cy, r, score, color);
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }}>
      <path d={trackPath} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={size * 0.08} strokeLinecap="round" />
      <path d={fillPath} fill="none" stroke={color} strokeWidth={size * 0.08} strokeLinecap="round" />
      <text x={cx} y={cy + 2} textAnchor="middle" dominantBaseline="middle" fill={color} fontSize={size * 0.22} fontWeight="900">
        {Math.round(score * 100)}
      </text>
      <text x={cx} y={cy + size * 0.24} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={size * 0.14}>IDX</text>
    </svg>
  );
}

export default function BcgSurvivabilityIndex({ units = [] }) {
  const [selected, setSelected] = useState(null);
  const [sortBy, setSortBy] = useState('survivability');
  const [showRisk, setShowRisk] = useState(false);

  if (!units.length) return null;

  const enriched = units.map(u => ({
    ...u,
    surv: computeSurv(u),
    tier: survTier(computeSurv(u)),
    q: QUADRANTS[u.quadrant] || QUADRANTS.dog,
  }));

  const sorted = [...enriched].sort((a, b) => {
    if (sortBy === 'survivability') return b.surv - a.surv;
    if (sortBy === 'risk') return a.surv - b.surv;
    return (a.name || '').localeCompare(b.name || '');
  });

  const sel = selected ? enriched.find(u => u.name === selected) : null;
  const avgSurv = enriched.reduce((s, u) => s + u.surv, 0) / enriched.length;
  const portfolioTier = survTier(avgSurv);
  const criticalCount = enriched.filter(u => u.tier.label === 'CRÍTICA').length;
  const vulnerableCount = enriched.filter(u => u.tier.label === 'VULNERABLE').length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🛡️</div>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>Strategic Survivability Index</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
            Probabilidad de supervivencia estratégica futura · Antifragilidad + Adaptive Strategy · Taleb (2012)
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {criticalCount > 0 && <span style={{ padding: '0.25rem 0.6rem', borderRadius: 6, fontSize: '0.65rem', background: 'rgba(255,77,106,0.15)', color: '#ff4d6a', fontWeight: 700 }}>🔴 {criticalCount} crítica{criticalCount !== 1 ? 's' : ''}</span>}
          {vulnerableCount > 0 && <span style={{ padding: '0.25rem 0.6rem', borderRadius: 6, fontSize: '0.65rem', background: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontWeight: 700 }}>⚠️ {vulnerableCount} vulnerable{vulnerableCount !== 1 ? 's' : ''}</span>}
        </div>
      </div>

      {/* Portfolio survivability gauge */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem' }}>
        <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', gridColumn: '1', borderLeft: `3px solid ${portfolioTier.color}` }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>PORTFOLIO SURVIVABILITY</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.3rem' }}>
            <SurvGauge score={avgSurv} color={portfolioTier.color} size={80} />
          </div>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: portfolioTier.color }}>{portfolioTier.icon} {portfolioTier.label}</div>
        </div>
        {SURV_TIERS.map((tier, i) => {
          const count = enriched.filter(u => u.tier.label === tier.label).length;
          return (
            <div key={i} style={{ padding: '0.85rem', borderRadius: 10, background: `${tier.color}06`, border: `1px solid ${tier.color}22`, textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '0.1rem' }}>{tier.icon}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: tier.color, lineHeight: 1 }}>{count}</div>
              <div style={{ fontSize: '0.58rem', color: tier.color, fontWeight: 700, marginTop: '0.1rem' }}>{tier.label}</div>
              <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>≥{Math.round(tier.min * 100)}%</div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {[{ k: 'survivability', l: '🛡️ Mayor resiliencia' }, { k: 'risk', l: '🔴 Mayor riesgo' }, { k: 'name', l: '🔤 Nombre' }].map(s => (
          <button key={s.k} onClick={() => setSortBy(s.k)} style={{
            padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.65rem', cursor: 'pointer',
            border: `1px solid ${sortBy === s.k ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'}`,
            background: sortBy === s.k ? 'rgba(255,255,255,0.07)' : 'transparent',
            color: sortBy === s.k ? 'var(--text-primary)' : 'var(--text-tertiary)',
          }}>{s.l}</button>
        ))}
      </div>

      {/* Unit cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
        {sorted.map((u, i) => {
          const isSel = selected === u.name;
          return (
            <div key={i} onClick={() => setSelected(isSel ? null : u.name)} style={{
              padding: '1rem', borderRadius: 12, cursor: 'pointer',
              background: isSel ? `${u.tier.color}12` : `${u.tier.color}06`,
              border: `1.5px solid ${isSel ? u.tier.color + '55' : u.tier.color + '22'}`,
              transition: 'all 0.2s', transform: isSel ? 'translateY(-2px)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <SurvGauge score={u.surv} color={u.tier.color} size={58} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                  <div style={{ fontSize: '0.63rem', color: u.q.color, marginBottom: '0.2rem' }}>{u.q.icon} {u.q.label}</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', padding: '0.15rem 0.4rem', borderRadius: 4, background: `${u.tier.color}15`, border: `1px solid ${u.tier.color}30` }}>
                    <span style={{ fontSize: '0.65rem' }}>{u.tier.icon}</span>
                    <span style={{ fontSize: '0.6rem', color: u.tier.color, fontWeight: 700 }}>{u.tier.label}</span>
                  </div>
                </div>
              </div>

              {/* Factor breakdown */}
              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {[
                  { l: 'Crecimiento de mercado', v: Math.min(1, Math.max(0, u.growth + 0.1)), raw: `${(u.growth * 100).toFixed(0)}%` },
                  { l: 'Participación relativa', v: u.share, raw: `${(u.share * 100).toFixed(0)}%` },
                  { l: 'Posición cuadrante', v: u.q.survBase, raw: u.q.label },
                ].map((f, j) => (
                  <div key={j}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--text-tertiary)', marginBottom: '0.1rem' }}>
                      <span>{f.l}</span><span style={{ color: 'var(--text-secondary)' }}>{f.raw}</span>
                    </div>
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${f.v * 100}%`, background: u.tier.color, borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected detail */}
      {sel && (
        <div className="glass-panel animate-fade-in" style={{ padding: '1.25rem', borderLeft: `4px solid ${sel.tier.color}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <SurvGauge score={sel.surv} color={sel.tier.color} size={72} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.15rem' }}>{sel.q.icon} {sel.name}</div>
                <div style={{ fontSize: '0.7rem', color: sel.tier.color, fontWeight: 700 }}>{sel.tier.icon} {sel.tier.label}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>{sel.tier.desc}</div>
              </div>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.5rem' }}>{sel.rationale}</div>
          <div style={{ padding: '0.5rem 0.65rem', borderRadius: 8, background: sel.surv < 0.38 ? 'rgba(255,77,106,0.08)' : 'rgba(16,185,129,0.07)', border: `1px solid ${sel.tier.color}25`, fontSize: '0.7rem', color: sel.tier.color, lineHeight: 1.5 }}>
            {sel.surv < 0.38 ? '🔴 Posición no sostenible sin intervención estratégica inmediata. Priorizar en agenda ejecutiva.' :
             sel.surv < 0.55 ? '⚠️ Supervivencia condicional. El entorno favorable puede no mantenerse. Fortalecer ahora.' :
             sel.surv < 0.75 ? '⚖️ Posición estable pero mejorable. Optimizar para aumentar la resiliencia ante shocks.' :
             '✅ Alta resiliencia estratégica. Mantener y expandir las fuentes de esta fortaleza.'}
          </div>
          {sel.strategic_action && (
            <div style={{ marginTop: '0.4rem', padding: '0.4rem 0.6rem', borderRadius: 7, background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.7rem', color: '#6366f1' }}>
              🎯 {sel.strategic_action}
            </div>
          )}
        </div>
      )}

      <div style={{ padding: '0.65rem 1rem', borderRadius: 8, fontSize: '0.65rem', color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
        🛡️ <strong style={{ color: 'var(--text-secondary)' }}>Antifragility Framework</strong> — Taleb (2012) · El índice combina posición BCG (60%), tasa de crecimiento (25%) y participación de mercado (15%) para estimar la capacidad de supervivencia ante disrupción
      </div>
    </div>
  );
}
