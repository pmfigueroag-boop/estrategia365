/**
 * PorterIntelligenceCockpit — Master Intelligence Dashboard (Phase 3)
 * ====================================================================
 * Aggregates all Porter intelligence into a single command center.
 * Filterable, drill-down, multi-view. Palantir/McKinsey AI aesthetic.
 */
"use client";
import { useState, useEffect } from 'react';

const FORCE_CONFIG = {
  rivalry:        { label: 'Rivalidad',        short: 'RIV', color: '#ff4d6a', icon: '⚔️' },
  new_entrants:   { label: 'Nuevos Entrantes', short: 'NE',  color: '#a855f7', icon: '🚪' },
  substitutes:    { label: 'Sustitutos',       short: 'SUS', color: '#f59e0b', icon: '🔄' },
  buyer_power:    { label: 'Poder Comprador',  short: 'PC',  color: '#3b82f6', icon: '🛒' },
  supplier_power: { label: 'Poder Proveedor',  short: 'PP',  color: '#10b981', icon: '📦' },
};

const SOURCE_Q = {
  'Gemini AI': 85, 'Manual': 95, 'Stochastic Fallback': 42,
};

function getRisk(cps) {
  if (cps >= 75) return { label: 'CRÍTICA', color: '#ff4d6a', icon: '🔴', bg: 'rgba(255,77,106,0.1)' };
  if (cps >= 60) return { label: 'ALTA',    color: '#f59e0b', icon: '🟠', bg: 'rgba(245,158,11,0.1)' };
  if (cps >= 40) return { label: 'MEDIA',   color: '#6366f1', icon: '🟡', bg: 'rgba(99,102,241,0.1)' };
  return              { label: 'BAJA',    color: '#10b981', icon: '🟢', bg: 'rgba(16,185,129,0.1)' };
}

export default function PorterIntelligenceCockpit({ forces = [], porterDeep, industryAssessment }) {
  const [activeForce, setActiveForce] = useState(null);
  const [clock, setClock] = useState(new Date());
  const [viewMode, setViewMode] = useState('overview'); // overview | detail | matrix

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!forces.length) return (
    <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎯</div>
      <p>Ejecuta el análisis Porter para activar el Intelligence Cockpit.</p>
    </div>
  );

  const forceData = forces.map(f => {
    const key = f.force_name || f.force || '';
    const cfg = FORCE_CONFIG[key] || { label: key, short: key.slice(0,3), color: '#888', icon: '•' };
    const cps = Math.round(f.competitive_pressure_score || (f.score || 3) * 20);
    const risk = getRisk(cps);
    const confidence = Math.round((SOURCE_Q[f.source] || 50) * 0.4 + Math.min(100, (f.sub_determinants?.length || 0) * 25) * 0.35 + 75 * 0.25);
    return { key, cfg, cps, risk, confidence, trend: f.trend || 'stable', score: f.score || 3, description: f.description || '', probability: f.probability || 50, sub_determinants: f.sub_determinants || [], source: f.source || 'unknown' };
  }).sort((a, b) => b.cps - a.cps);

  const avgCPS = Math.round(forceData.reduce((s, d) => s + d.cps, 0) / forceData.length);
  const avgConf = Math.round(forceData.reduce((s, d) => s + d.confidence, 0) / forceData.length);
  const globalRisk = getRisk(avgCPS);
  const threats = forceData.filter(d => d.cps >= 60);
  const opportunities = forceData.filter(d => d.cps < 40);
  const posture = industryAssessment?.posture || porterDeep?.executive_summary?.verdict?.posture || 'selective';
  const selected = activeForce ? forceData.find(d => d.key === activeForce) : null;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Top Command Bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0.75rem 1.25rem', borderRadius: 12,
        background: 'linear-gradient(135deg, rgba(5,8,20,0.98), rgba(10,14,30,0.95))',
        border: '1px solid rgba(255,77,106,0.15)',
        flexWrap: 'wrap', gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: '#10b981' }}>
            PORTER INTELLIGENCE COCKPIT — LIVE
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {['overview', 'detail', 'matrix'].map(m => (
            <button key={m} onClick={() => setViewMode(m)} style={{
              padding: '0.25rem 0.6rem', borderRadius: 6, fontSize: '0.65rem', cursor: 'pointer',
              border: `1px solid ${viewMode === m ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
              background: viewMode === m ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: viewMode === m ? '#6366f1' : 'var(--text-tertiary)', fontWeight: viewMode === m ? 700 : 400,
            }}>
              {m === 'overview' ? '🗺️ Overview' : m === 'detail' ? '🔍 Detail' : '⬛ Matrix'}
            </button>
          ))}
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}>
          {clock.toLocaleTimeString('es-ES')}
        </div>
      </div>

      {/* Global KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
        {[
          { label: 'Presión Promedio', value: `${avgCPS}`, sub: globalRisk.label, color: globalRisk.color, icon: globalRisk.icon },
          { label: 'Confianza IA', value: `${avgConf}%`, sub: avgConf >= 70 ? 'Fiable' : 'Moderada', color: avgConf >= 70 ? '#10b981' : '#f59e0b', icon: '🧠' },
          { label: 'Amenazas Altas', value: threats.length, sub: `de ${forceData.length} fuerzas`, color: threats.length > 0 ? '#ff4d6a' : '#10b981', icon: '⚠️' },
          { label: 'Postura', value: posture === 'defensive' ? 'Defensiva' : posture === 'offensive' ? 'Ofensiva' : 'Selectiva', sub: 'estratégica', color: '#6366f1', icon: posture === 'defensive' ? '🛡️' : posture === 'offensive' ? '⚔️' : '⚖️' },
        ].map((kpi, i) => (
          <div key={i} style={{
            padding: '1rem', borderRadius: 12, textAlign: 'center',
            background: `${kpi.color}08`, border: `1px solid ${kpi.color}25`,
          }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{kpi.icon}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
            <div style={{ fontSize: '0.65rem', color: kpi.color, fontWeight: 600, marginTop: '0.2rem' }}>{kpi.sub}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Force Radar Bars */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
          Panel de Fuerzas Competitivas — Click para detalle
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {forceData.map(d => {
            const isActive = activeForce === d.key;
            return (
              <div key={d.key} onClick={() => { setActiveForce(isActive ? null : d.key); setViewMode('detail'); }}
                style={{
                  padding: '0.8rem 1rem', borderRadius: 10, cursor: 'pointer',
                  background: isActive ? `${d.cfg.color}10` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isActive ? d.cfg.color + '44' : 'rgba(255,255,255,0.05)'}`,
                  transition: 'all 0.2s',
                }}>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 60px 70px 60px', alignItems: 'center', gap: '0.75rem' }}>
                  {/* Label */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>{d.cfg.icon}</span>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{d.cfg.label}</div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>Score {d.score}/5</div>
                    </div>
                  </div>
                  {/* Bar */}
                  <div style={{ position: 'relative', height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${d.cps}%`,
                      background: `linear-gradient(90deg, ${d.cfg.color}66, ${d.cfg.color})`,
                      borderRadius: 4, transition: 'width 0.6s ease',
                    }} />
                    {/* Confidence overlay */}
                    <div style={{
                      position: 'absolute', top: 0, height: '100%',
                      width: `${d.confidence}%`, borderRadius: 4,
                      background: `repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 4px)`,
                    }} />
                  </div>
                  {/* CPS */}
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: d.risk.color, textAlign: 'right' }}>{d.cps}</div>
                  {/* Risk badge */}
                  <div style={{
                    padding: '0.15rem 0.4rem', borderRadius: 6, fontSize: '0.55rem', fontWeight: 800,
                    textAlign: 'center', background: d.risk.bg, color: d.risk.color, border: `1px solid ${d.risk.color}33`,
                  }}>{d.risk.icon} {d.risk.label}</div>
                  {/* Trend */}
                  <div style={{ textAlign: 'center', fontSize: '0.8rem' }}>
                    {d.trend === 'improving' ? '📈' : d.trend === 'declining' ? '📉' : '➡️'}
                  </div>
                </div>
                {/* Confidence bar */}
                <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', width: 60 }}>Confianza</span>
                  <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.04)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${d.confidence}%`, background: d.confidence >= 70 ? '#10b981' : '#f59e0b', borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: '0.6rem', color: d.confidence >= 70 ? '#10b981' : '#f59e0b', fontWeight: 700, width: 30 }}>{d.confidence}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      {viewMode === 'detail' && selected && (
        <div className="glass-panel animate-fade-in" style={{
          padding: '1.5rem', borderLeft: `4px solid ${selected.cfg.color}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{selected.cfg.icon}</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{selected.cfg.label}</span>
                <span style={{ padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700, background: selected.risk.bg, color: selected.risk.color }}>
                  {selected.risk.icon} {selected.risk.label}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: 500, lineHeight: 1.6 }}>
                {selected.description || `Fuerza competitiva con CPS ${selected.cps}/100.`}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, color: selected.cfg.color, lineHeight: 1 }}>{selected.cps}</div>
              <div style={{ fontSize: '0.65rem', color: selected.cfg.color }}>CPS</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
            {[
              { label: 'Score', value: `${selected.score}/5` },
              { label: 'Probabilidad', value: `${selected.probability}%` },
              { label: 'Confianza', value: `${selected.confidence}%` },
              { label: 'Fuente', value: selected.source || '—' },
            ].map((kpi, i) => (
              <div key={i} style={{ padding: '0.6rem', borderRadius: 8, background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: selected.cfg.color }}>{kpi.value}</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>{kpi.label}</div>
              </div>
            ))}
          </div>

          {selected.sub_determinants.length > 0 && (
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Sub-determinantes ({selected.sub_determinants.length})
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                {selected.sub_determinants.map((sub, i) => (
                  <div key={i} style={{
                    padding: '0.5rem 0.75rem', borderRadius: 8, fontSize: '0.75rem',
                    background: 'rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{sub.name}</span>
                    <span style={{ fontWeight: 700, color: sub.score >= 4 ? '#ff4d6a' : sub.score >= 3 ? '#f59e0b' : '#10b981' }}>{sub.score}/5</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Matrix view */}
      {viewMode === 'matrix' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>
            Matriz de Atractivo del Sector
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.6rem' }}>
            {forceData.map(d => (
              <div key={d.key} style={{
                padding: '1rem', borderRadius: 12, textAlign: 'center',
                background: d.risk.bg, border: `1px solid ${d.risk.color}33`,
              }}>
                <div style={{ fontSize: '1.4rem' }}>{d.cfg.icon}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: d.risk.color, margin: '0.25rem 0' }}>{d.cps}</div>
                <div style={{ fontSize: '0.65rem', color: d.cfg.color, fontWeight: 700 }}>{d.cfg.short}</div>
                <div style={{ fontSize: '0.55rem', color: d.risk.color, marginTop: '0.2rem' }}>{d.risk.label}</div>
                <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {d.trend === 'improving' ? '📈' : d.trend === 'declining' ? '📉' : '➡️'}
                </div>
              </div>
            ))}
          </div>

          {/* Threats & Opportunities */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ padding: '1rem', borderRadius: 10, background: 'rgba(255,77,106,0.05)', border: '1px solid rgba(255,77,106,0.15)' }}>
              <div style={{ fontSize: '0.65rem', color: '#ff4d6a', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>⚠️ Amenazas ({threats.length})</div>
              {threats.length ? threats.map((t, i) => (
                <div key={i} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '0.25rem 0', borderBottom: i < threats.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t.cfg.icon} {t.cfg.label}</span>
                  <span style={{ color: t.risk.color, fontWeight: 700 }}>{t.cps}</span>
                </div>
              )) : <div style={{ fontSize: '0.75rem', color: '#10b981' }}>✅ Sin amenazas críticas</div>}
            </div>
            <div style={{ padding: '1rem', borderRadius: 10, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <div style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>✅ Oportunidades ({opportunities.length})</div>
              {opportunities.length ? opportunities.map((o, i) => (
                <div key={i} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '0.25rem 0', borderBottom: i < opportunities.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{o.cfg.icon} {o.cfg.label}</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>{o.cps}</span>
                </div>
              )) : <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Todas las fuerzas ≥40 CPS</div>}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: '0.65rem 1rem', borderRadius: 8, fontSize: '0.65rem', color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between' }}>
        <span>🎯 Porter Intelligence Cockpit · {forces.length} fuerzas · {new Date().toLocaleDateString('es-ES')}</span>
        <span>Estrategia 365 StaaS Engine · Porter (1980, 2008)</span>
      </div>
    </div>
  );
}
