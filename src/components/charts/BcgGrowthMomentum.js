/**
 * BcgGrowthMomentum — Growth Momentum Dashboard (Fase 2)
 * ========================================================
 * Cada unidad muestra: aceleración, market share momentum,
 * velocity indicators, arrows de dirección estratégica.
 * Ordena por momentum total (growth + share).
 * Visual: terminal Bloomberg de momentum competitivo.
 */
"use client";
import { useState } from 'react';

const QUADRANTS = {
  star:     { color: '#6366f1', icon: '⭐', label: 'Star'          },
  cow:      { color: '#10b981', icon: '🐄', label: 'Cash Cow'      },
  question: { color: '#f59e0b', icon: '❓', label: 'Question Mark'  },
  dog:      { color: '#ff4d6a', icon: '🐕', label: 'Dog'           },
};

const MOMENTUM_ZONES = [
  { min: 0.7,  label: 'ACELERACIÓN FUERTE', color: '#10b981', icon: '🚀', desc: 'Momentum alto — ventana de expansión abierta' },
  { min: 0.5,  label: 'MOMENTUM POSITIVO',  color: '#6366f1', icon: '📈', desc: 'Creciendo — mantener inversión y presión' },
  { min: 0.35, label: 'MOMENTUM NEUTRAL',   color: '#f59e0b', icon: '➡️', desc: 'Sin aceleración clara — revisar estrategia' },
  { min: 0,    label: 'DESACELERACIÓN',     color: '#ff4d6a', icon: '📉', desc: 'Pérdida de momentum — acción correctiva urgente' },
];

function getMomentumZone(score) {
  return MOMENTUM_ZONES.find(z => score >= z.min) || MOMENTUM_ZONES[MOMENTUM_ZONES.length - 1];
}

// Compute momentum score: normalized composite of growth + share
function momentumScore(u) {
  return Math.max(0, Math.min(1, u.growth * 0.6 + u.share * 0.4));
}

// Velocity arrow direction based on quadrant + momentum
function velocityVector(u) {
  const score = momentumScore(u);
  if (u.quadrant === 'star' && score > 0.6) return { dir: '↗', color: '#10b981', label: 'Acelerando' };
  if (u.quadrant === 'cow') return { dir: '→', color: '#6366f1', label: 'Sosteniendo' };
  if (u.quadrant === 'question' && score > 0.5) return { dir: '↗', color: '#f59e0b', label: 'Potencial' };
  if (u.quadrant === 'question') return { dir: '↓', color: '#f59e0b', label: 'En evaluación' };
  if (u.quadrant === 'dog') return { dir: '↘', color: '#ff4d6a', label: 'Declinando' };
  return { dir: '→', color: '#94a3b8', label: 'Estable' };
}

// Sparkline: project 5-quarter trajectory
function generateSparkline(u) {
  const q = u.quadrant;
  const base = momentumScore(u);
  const trends = { star: [0, 0.05, 0.1, 0.08, 0.12], cow: [0, -0.02, 0.01, -0.01, 0], question: [0, 0.08, -0.05, 0.1, -0.03], dog: [0, -0.04, -0.06, -0.05, -0.08] };
  const t = trends[q] || trends.dog;
  return t.map((d, i) => Math.max(0.05, Math.min(0.98, base + d + (Math.random() * 0.03 - 0.015))));
}

function SparklineSVG({ data, color, W = 90, H = 30 }) {
  const min = Math.min(...data), max = Math.max(...data, min + 0.01);
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / (max - min)) * H * 0.85 - H * 0.075;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const areaPoints = `0,${H} ${points} ${W},${H}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: W, height: H, display: 'block' }}>
      <polygon points={areaPoints} fill={`${color}18`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * W;
        const y = H - ((v - min) / (max - min)) * H * 0.85 - H * 0.075;
        return <circle key={i} cx={x} cy={y} r={i === data.length - 1 ? 2.5 : 1.5} fill={color} />;
      })}
    </svg>
  );
}

export default function BcgGrowthMomentum({ units = [] }) {
  const [selected, setSelected] = useState(null);
  const [sortBy, setSortBy] = useState('momentum');
  const [filterQ, setFilterQ] = useState('all');

  if (!units.length) return null;

  const enriched = units.map(u => ({
    ...u,
    momentum: momentumScore(u),
    zone: getMomentumZone(momentumScore(u)),
    velocity: velocityVector(u),
    sparkline: generateSparkline(u),
  }));

  const filtered = filterQ === 'all' ? enriched : enriched.filter(u => u.quadrant === filterQ);
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'momentum') return b.momentum - a.momentum;
    if (sortBy === 'growth') return b.growth - a.growth;
    if (sortBy === 'share') return b.share - a.share;
    return (a.name || '').localeCompare(b.name || '');
  });

  const sel = selected ? enriched.find(u => u.name === selected) : null;
  const avgMomentum = enriched.reduce((s, u) => s + u.momentum, 0) / enriched.length;
  const topMomentum = enriched.sort((a, b) => b.momentum - a.momentum).slice(0, 3);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚡</div>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>Growth Momentum Dashboard</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
            Velocidad e inercia estratégica por unidad · Aceleración, dirección y momentum competitivo proyectado
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {[{ k: 'all', l: 'Todos' }, ...Object.entries(QUADRANTS).map(([k, v]) => ({ k, l: v.icon }))].map(s => (
            <button key={s.k} onClick={() => setFilterQ(s.k)} style={{
              padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.7rem', cursor: 'pointer',
              border: `1px solid ${filterQ === s.k ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
              background: filterQ === s.k ? 'rgba(255,255,255,0.07)' : 'transparent',
              color: filterQ === s.k ? 'var(--text-primary)' : 'var(--text-tertiary)',
            }}>{s.l}</button>
          ))}
          <div style={{ width: 1, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
          {[{ k: 'momentum', l: '⚡ Momentum' }, { k: 'growth', l: '↑ Growth' }, { k: 'share', l: '◆ Share' }].map(s => (
            <button key={s.k} onClick={() => setSortBy(s.k)} style={{
              padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.65rem', cursor: 'pointer',
              border: `1px solid ${sortBy === s.k ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
              background: sortBy === s.k ? 'rgba(99,102,241,0.1)' : 'transparent',
              color: sortBy === s.k ? '#818cf8' : 'var(--text-tertiary)',
            }}>{s.l}</button>
          ))}
        </div>
      </div>

      {/* Momentum KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
        {MOMENTUM_ZONES.map((zone, i) => {
          const count = enriched.filter(u => getMomentumZone(u.momentum).label === zone.label).length;
          return (
            <div key={i} style={{ padding: '0.7rem 0.6rem', borderRadius: 9, textAlign: 'center', background: `${zone.color}08`, border: `1px solid ${zone.color}22` }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.1rem' }}>{zone.icon}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: zone.color, lineHeight: 1 }}>{count}</div>
              <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)', marginTop: '0.1rem', lineHeight: 1.2 }}>{zone.label}</div>
            </div>
          );
        })}
      </div>

      {/* Unit cards */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px 100px 90px 80px 60px', gap: '0.5rem', marginBottom: '0.6rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {['Unidad / Cuadrante', 'Crecimiento', 'Share', 'Momentum', 'Tendencia Q+1-5', 'Zona', 'Vector'].map((h, i) => (
            <div key={i} style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', textAlign: i > 1 ? 'center' : 'left' }}>{h}</div>
          ))}
        </div>

        {sorted.map((u, i) => {
          const q = QUADRANTS[u.quadrant];
          const isSel = selected === u.name;
          return (
            <div key={i} onClick={() => setSelected(isSel ? null : u.name)} style={{
              display: 'grid', gridTemplateColumns: '1fr 70px 70px 100px 90px 80px 60px',
              gap: '0.5rem', alignItems: 'center',
              padding: '0.6rem 0.5rem', borderRadius: 8, marginBottom: '0.25rem',
              background: isSel ? `${q.color}10` : 'rgba(255,255,255,0.02)',
              border: `1px solid ${isSel ? q.color + '44' : 'rgba(255,255,255,0.05)'}`,
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {/* Name */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                <div style={{ fontSize: '0.62rem', color: q.color }}>{q.icon} {q.label}</div>
              </div>
              {/* Growth */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: u.growth > 0.25 ? '#10b981' : u.growth > 0.1 ? '#f59e0b' : '#ff4d6a' }}>
                  {(u.growth * 100).toFixed(0)}%
                </div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, marginTop: '0.15rem' }}>
                  <div style={{ height: '100%', width: `${Math.min(u.growth * 200, 100)}%`, background: u.growth > 0.25 ? '#10b981' : '#f59e0b', borderRadius: 2 }} />
                </div>
              </div>
              {/* Share */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: u.share > 0.4 ? '#10b981' : u.share > 0.2 ? '#f59e0b' : '#ff4d6a' }}>
                  {(u.share * 100).toFixed(0)}%
                </div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, marginTop: '0.15rem' }}>
                  <div style={{ height: '100%', width: `${u.share * 100}%`, background: u.share > 0.4 ? '#10b981' : '#f59e0b', borderRadius: 2 }} />
                </div>
              </div>
              {/* Momentum bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--text-tertiary)', marginBottom: '0.2rem' }}>
                  <span>{u.zone.icon}</span>
                  <span style={{ color: u.zone.color, fontWeight: 700 }}>{(u.momentum * 100).toFixed(0)}%</span>
                </div>
                <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${u.momentum * 100}%`, background: u.zone.color, borderRadius: 3, transition: 'width 0.4s' }} />
                </div>
              </div>
              {/* Sparkline */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <SparklineSVG data={u.sparkline} color={u.zone.color} />
              </div>
              {/* Zone */}
              <div style={{ textAlign: 'center', padding: '0.15rem 0.25rem', borderRadius: 5, background: `${u.zone.color}12`, border: `1px solid ${u.zone.color}25` }}>
                <div style={{ fontSize: '0.58rem', color: u.zone.color, fontWeight: 700, lineHeight: 1.2 }}>{u.zone.label.split(' ')[0]}</div>
              </div>
              {/* Velocity vector */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', color: u.velocity.color, lineHeight: 1 }}>{u.velocity.dir}</div>
                <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>{u.velocity.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected detail */}
      {sel && (
        <div className="glass-panel animate-fade-in" style={{ padding: '1.25rem', borderLeft: `4px solid ${sel.zone.color}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{QUADRANTS[sel.quadrant]?.icon} {sel.name}</div>
              <div style={{ fontSize: '0.7rem', color: sel.zone.color }}>{sel.zone.icon} {sel.zone.label} · {sel.velocity.dir} {sel.velocity.label}</div>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.4rem' }}>{sel.rationale}</div>
          <div style={{ padding: '0.4rem 0.6rem', borderRadius: 7, background: `${sel.zone.color}08`, border: `1px solid ${sel.zone.color}25`, fontSize: '0.7rem', color: sel.zone.color, lineHeight: 1.4 }}>
            📊 {sel.zone.desc} — Momentum actual: {(sel.momentum * 100).toFixed(0)}% · Promedio portafolio: {(avgMomentum * 100).toFixed(0)}%
          </div>
          {sel.strategic_action && (
            <div style={{ marginTop: '0.4rem', padding: '0.4rem 0.6rem', borderRadius: 7, background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.7rem', color: '#6366f1', lineHeight: 1.4 }}>
              🎯 {sel.strategic_action}
            </div>
          )}
        </div>
      )}

      <div style={{ padding: '0.65rem 1rem', borderRadius: 8, fontSize: '0.65rem', color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
        ⚡ Momentum = crecimiento (60%) × participación (40%) normalizado. Las sparklines representan proyección tendencial Q1-Q5 basada en dinámicas del cuadrante.
      </div>
    </div>
  );
}
