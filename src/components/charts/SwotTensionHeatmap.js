/**
 * SwotTensionHeatmap — Strategic Tension Matrix (Fase 1 Priority)
 * ===============================================================
 * Transforms FODA items into a prioritization grid.
 * Axes: Impact × Urgency. Color: risk level. Size: controllability.
 * Bloomberg terminal aesthetic. Click for detail.
 */
"use client";
import { useState } from 'react';

const Q_CONFIG = {
  strength:    { color: '#10b981', icon: '💪', label: 'Fortaleza' },
  weakness:    { color: '#ff4d6a', icon: '⚠️', label: 'Debilidad' },
  opportunity: { color: '#6366f1', icon: '🚀', label: 'Oportunidad' },
  threat:      { color: '#f59e0b', icon: '🔥', label: 'Amenaza' },
};

// Deterministic urgency from priority + quadrant
function getUrgency(item) {
  const base = item.priority || 3;
  const impact = item.impact_score || 3;
  const score = (impact * 0.6 + base * 0.4);
  if (item.quadrant === 'threat' && score >= 4) return 5;
  if (item.quadrant === 'threat') return Math.min(5, score + 0.5);
  if (item.quadrant === 'opportunity') return Math.min(5, score + 0.3);
  return score;
}

function getControllability(item) {
  if (item.quadrant === 'strength' || item.quadrant === 'weakness') return 4; // internal = more controllable
  return 2.5; // external = less controllable
}

function getRiskLevel(impact, urgency) {
  const score = (impact + urgency) / 2;
  if (score >= 4.2) return { label: 'CRÍTICO', color: '#ff4d6a', bg: 'rgba(255,77,106,0.15)' };
  if (score >= 3.5) return { label: 'ALTO',    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' };
  if (score >= 2.5) return { label: 'MEDIO',   color: '#6366f1', bg: 'rgba(99,102,241,0.10)' };
  return              { label: 'BAJO',    color: '#10b981', bg: 'rgba(16,185,129,0.08)' };
}

export default function SwotTensionHeatmap({ swot = [] }) {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  if (!swot.length) return null;

  const enriched = swot.map(item => ({
    ...item,
    urgency: getUrgency(item),
    controllability: getControllability(item),
    impact: item.impact_score || 3,
    risk: getRiskLevel(item.impact_score || 3, getUrgency(item)),
    cfg: Q_CONFIG[item.quadrant] || Q_CONFIG.strength,
  }));

  const filtered = filter === 'all' ? enriched : enriched.filter(i => i.quadrant === filter);
  const sorted = [...filtered].sort((a, b) => {
    const scoreA = a.impact + a.urgency;
    const scoreB = b.impact + b.urgency;
    return scoreB - scoreA;
  });

  const criticalCount = enriched.filter(i => i.risk.label === 'CRÍTICO').length;
  const avgImpact = (enriched.reduce((s, i) => s + i.impact, 0) / enriched.length).toFixed(1);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Header */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,77,106,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🌡️</div>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>Strategic Tension Heatmap</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
            Impacto × Urgencia por factor FODA · Priorización ejecutiva inmediata · {criticalCount} factores críticos
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: '🔢 Todos' },
            { key: 'strength', label: '💪 F' },
            { key: 'weakness', label: '⚠️ D' },
            { key: 'opportunity', label: '🚀 O' },
            { key: 'threat', label: '🔥 A' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.65rem', cursor: 'pointer',
              border: `1px solid ${filter === f.key ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
              background: filter === f.key ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: filter === f.key ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: filter === f.key ? 700 : 400,
            }}>{f.label}</button>
          ))}
        </div>
      </div>

      {/* Grid: Impact (Y) × Urgency (X) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1rem', alignItems: 'start' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px repeat(5, 1fr)', gap: '0.3rem', marginBottom: '0.4rem' }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', textAlign: 'right', paddingRight: '0.5rem' }}>
              Urgencia →
            </div>
            {[1, 2, 3, 4, 5].map(u => (
              <div key={u} style={{ textAlign: 'center', fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{u}</div>
            ))}
          </div>

          {/* Rows by impact level */}
          {[5, 4, 3, 2, 1].map(impactLevel => {
            const rowItems = sorted.filter(i => Math.round(i.impact) === impactLevel);
            return (
              <div key={impactLevel} style={{ display: 'grid', gridTemplateColumns: '180px repeat(5, 1fr)', gap: '0.3rem', marginBottom: '0.3rem', alignItems: 'start' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '0.5rem', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)' }}>Impacto {impactLevel}</span>
                </div>
                {[1, 2, 3, 4, 5].map(urgencyLevel => {
                  const cellItems = rowItems.filter(i => Math.round(i.urgency) === urgencyLevel);
                  const isHotZone = impactLevel >= 4 && urgencyLevel >= 4;
                  const isWarmZone = impactLevel >= 3 && urgencyLevel >= 3 && !isHotZone;
                  return (
                    <div key={urgencyLevel} style={{
                      minHeight: 52, borderRadius: 8, padding: '0.3rem',
                      background: isHotZone ? 'rgba(255,77,106,0.07)' : isWarmZone ? 'rgba(245,158,11,0.05)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isHotZone ? 'rgba(255,77,106,0.2)' : isWarmZone ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)'}`,
                      display: 'flex', flexDirection: 'column', gap: '0.2rem',
                    }}>
                      {cellItems.map((item, i) => {
                        const isSelected = selected === (item.id || item.description);
                        return (
                          <div key={i} onClick={() => setSelected(isSelected ? null : (item.id || item.description))} style={{
                            padding: '0.2rem 0.3rem', borderRadius: 5, cursor: 'pointer',
                            background: isSelected ? `${item.cfg.color}25` : `${item.cfg.color}10`,
                            border: `1px solid ${item.cfg.color}${isSelected ? '66' : '33'}`,
                            transition: 'all 0.15s',
                          }}>
                            <div style={{ fontSize: '0.55rem', color: item.cfg.color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                              <span>{item.cfg.icon}</span>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 48 }}>
                                {item.description?.slice(0, 12)}…
                              </span>
                            </div>
                            <div style={{ height: 2, background: `${item.cfg.color}30`, borderRadius: 1, marginTop: 2, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${(item.controllability / 5) * 100}%`, background: item.cfg.color, borderRadius: 1 }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Zone legend */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Zona Crítica (Act. inmediata)', bg: 'rgba(255,77,106,0.1)', border: 'rgba(255,77,106,0.3)', color: '#ff4d6a' },
              { label: 'Zona Caliente (Planificar)', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', color: '#f59e0b' },
              { label: 'Zona Estable (Monitorear)', bg: 'rgba(255,255,255,0.02)', border: 'rgba(255,255,255,0.08)', color: 'var(--text-tertiary)' },
            ].map((z, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.62rem', color: z.color }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: z.bg, border: `1px solid ${z.border}` }} />
                {z.label}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Priority list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Global KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {[
              { label: 'Críticos', value: criticalCount, color: '#ff4d6a' },
              { label: 'Impacto Ø', value: avgImpact, color: '#6366f1' },
            ].map((k, i) => (
              <div key={i} style={{ padding: '0.65rem', borderRadius: 10, textAlign: 'center', background: `${k.color}08`, border: `1px solid ${k.color}22` }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: k.color }}>{k.value}</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Priority list */}
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.6rem' }}>
              🎯 Top Prioridades
            </div>
            {sorted.slice(0, 8).map((item, i) => {
              const isSelected = selected === (item.id || item.description);
              return (
                <div key={i} onClick={() => setSelected(isSelected ? null : (item.id || item.description))} style={{
                  padding: '0.5rem 0.65rem', borderRadius: 8, marginBottom: '0.3rem', cursor: 'pointer',
                  background: isSelected ? `${item.cfg.color}10` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isSelected ? item.cfg.color + '44' : 'rgba(255,255,255,0.04)'}`,
                  transition: 'all 0.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-tertiary)', width: 16 }}>#{i + 1}</span>
                    <span style={{ fontSize: '0.65rem', color: item.cfg.color, fontWeight: 700 }}>{item.cfg.icon} {item.cfg.label}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.55rem', padding: '0.1rem 0.3rem', borderRadius: 4, background: item.risk.bg, color: item.risk.color, fontWeight: 700 }}>
                      {item.risk.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                    {item.description?.length > 65 ? item.description.slice(0, 65) + '…' : item.description}
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.3rem' }}>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>Imp: <strong style={{ color: item.cfg.color }}>{item.impact}</strong></span>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>Urg: <strong style={{ color: item.cfg.color }}>{item.urgency.toFixed(1)}</strong></span>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>Control: <strong>{item.controllability}/5</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
