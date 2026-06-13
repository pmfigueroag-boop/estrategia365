/**
 * SwotInstitutionalCockpit — FODA Intelligence Command Center (Fase 3)
 * ====================================================================
 * Unifica FODA + TOWS + Postura + KPIs en vista ejecutiva de 3 modos:
 * Command (KPI board), Intelligence (factor grid), Scenario (quick sim).
 */
"use client";
import { useState } from 'react';

const Q = {
  strength:    { color: '#10b981', icon: '💪', label: 'Fortalezas',   short: 'F' },
  weakness:    { color: '#ff4d6a', icon: '⚠️', label: 'Debilidades',  short: 'D' },
  opportunity: { color: '#6366f1', icon: '🚀', label: 'Oportunidades',short: 'O' },
  threat:      { color: '#f59e0b', icon: '🔥', label: 'Amenazas',     short: 'A' },
};

const TOWS_META = {
  FO: { label: 'FO Ofensivo',      color: '#10b981', icon: '⚔️' },
  FA: { label: 'FA Defensivo',     color: '#6366f1', icon: '🛡️' },
  DO: { label: 'DO Reorientación', color: '#f59e0b', icon: '🔄' },
  DA: { label: 'DA Supervivencia', color: '#ff4d6a', icon: '🆘' },
};

function getPosture(swot) {
  const strengths    = swot.filter(s => s.quadrant === 'strength');
  const weaknesses   = swot.filter(s => s.quadrant === 'weakness');
  const opportunities= swot.filter(s => s.quadrant === 'opportunity');
  const threats      = swot.filter(s => s.quadrant === 'threat');

  const avgS = strengths.reduce((a, i) => a + (i.impact_score||3), 0) / (strengths.length||1);
  const avgW = weaknesses.reduce((a, i) => a + (i.impact_score||3), 0) / (weaknesses.length||1);
  const avgO = opportunities.reduce((a, i) => a + (i.impact_score||3), 0) / (opportunities.length||1);
  const avgA = threats.reduce((a, i) => a + (i.impact_score||3), 0) / (threats.length||1);

  const internal = avgS - avgW;  // positive = net strength
  const external = avgO - avgA;  // positive = net opportunity

  if (internal > 0.5 && external > 0.5) return { posture: 'OFENSIVA', color: '#10b981', icon: '⚔️', desc: 'Fortalezas sólidas + entorno favorable. Momento de expansión.' };
  if (internal > 0.5 && external <= 0.5) return { posture: 'DEFENSIVA', color: '#6366f1', icon: '🛡️', desc: 'Capacidades sólidas pero entorno adverso. Conservar posición.' };
  if (internal <= 0.5 && external > 0.5) return { posture: 'REORIENTACIÓN', color: '#f59e0b', icon: '🔄', desc: 'Oportunidades disponibles pero limitaciones internas. Transformar.' };
  return { posture: 'SUPERVIVENCIA', color: '#ff4d6a', icon: '🆘', desc: 'Debilidades altas + entorno hostil. Priorizar estabilización.' };
}

function SviGauge({ score, color }) {
  const CX = 55, CY = 55, R = 42;
  const angle = -135 + (score / 100) * 270;
  const rad = angle * Math.PI / 180;
  const nx = CX + (R - 8) * Math.cos(rad);
  const ny = CY + (R - 8) * Math.sin(rad);
  const startRad = -135 * Math.PI / 180;
  const endRad = rad;
  const x1 = CX + R * Math.cos(startRad), y1 = CY + R * Math.sin(startRad);
  const x2 = CX + R * Math.cos(endRad),   y2 = CY + R * Math.sin(endRad);
  const sweep = angle + 135 > 180 ? 1 : 0;
  return (
    <svg viewBox="0 0 110 80" style={{ width: 120, display: 'block' }}>
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
      <path d={`M ${x1} ${y1} A ${R} ${R} 0 ${sweep} 1 ${x2} ${y2}`}
        fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />
      <line x1={CX} y1={CY} x2={nx} y2={ny} stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx={CX} cy={CY} r="3.5" fill={color} />
      <text x={CX} y={CY + 20} textAnchor="middle" fill={color} fontSize="16" fontWeight="900" fontFamily="monospace">{score}</text>
      <text x={CX} y={CY + 30} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7" letterSpacing="1">SFI</text>
    </svg>
  );
}

export default function SwotInstitutionalCockpit({ swot = [], tows = [], onScanFoda, onScanTows, isLoading, towsLoading }) {
  const [view, setView] = useState('command');

  if (!swot.length) return (
    <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏛️</div>
      <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>FODA Intelligence Cockpit</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '1.5rem' }}>
        Genera el análisis FODA para activar el cockpit institucional
      </div>
      <button onClick={onScanFoda} disabled={isLoading} className="btn btn-primary" style={{ opacity: isLoading ? 0.5 : 1 }}>
        {isLoading ? '⏳ Generando...' : '🤖 Generar FODA con IA'}
      </button>
    </div>
  );

  const posture = getPosture(swot);
  const byQ = { strength: [], weakness: [], opportunity: [], threat: [] };
  swot.forEach(s => { if (byQ[s.quadrant]) byQ[s.quadrant].push(s); });
  const byTows = { FO: [], FA: [], DO: [], DA: [] };
  tows.forEach(t => { if (byTows[t.cross_type]) byTows[t.cross_type].push(t); });

  const criticalThreats = byQ.threat.filter(t => (t.impact_score||3) >= 4).length;
  const topOpps = byQ.opportunity.filter(o => (o.impact_score||3) >= 4).length;
  const sfi = Math.round(
    ((byQ.strength.reduce((a,i)=>a+(i.impact_score||3),0)/(byQ.strength.length||1)) * 20) -
    ((byQ.weakness.reduce((a,i)=>a+(i.impact_score||3),0)/(byQ.weakness.length||1)) * 10) +
    ((byQ.opportunity.reduce((a,i)=>a+(i.impact_score||3),0)/(byQ.opportunity.length||1)) * 15) -
    ((byQ.threat.reduce((a,i)=>a+(i.impact_score||3),0)/(byQ.threat.length||1)) * 15)
    + 50
  );

  const VIEWS = [
    { id: 'command',      label: '🎛️ Command' },
    { id: 'intelligence', label: '🔍 Intel' },
    { id: 'tows',         label: '🔗 TOWS' },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Command bar */}
      <div style={{
        padding: '0.75rem 1.25rem', borderRadius: 12,
        background: 'rgba(8,12,22,0.95)', border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `${posture.color}18`, border: `1px solid ${posture.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>{posture.icon}</div>
          <div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>FODA INTELLIGENCE COCKPIT</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: posture.color }}>Postura: {posture.posture}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {VIEWS.map(v => (
            <button key={v.id} onClick={() => setView(v.id)} style={{
              padding: '0.3rem 0.7rem', borderRadius: 8, fontSize: '0.72rem', cursor: 'pointer',
              border: `1px solid ${view === v.id ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.07)'}`,
              background: view === v.id ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: view === v.id ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: view === v.id ? 700 : 400,
            }}>{v.label}</button>
          ))}
        </div>
      </div>

      {/* ── COMMAND VIEW ── */}
      {view === 'command' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* KPI Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.6rem' }}>
            {[
              { label: 'Fortalezas', value: byQ.strength.length, color: '#10b981', icon: '💪' },
              { label: 'Debilidades', value: byQ.weakness.length, color: '#ff4d6a', icon: '⚠️' },
              { label: 'Oportunidades', value: byQ.opportunity.length, color: '#6366f1', icon: '🚀' },
              { label: 'Amenazas', value: byQ.threat.length, color: '#f59e0b', icon: '🔥' },
              { label: 'Críticas ↑', value: criticalThreats, color: '#ff4d6a', icon: '🔴' },
              { label: 'Top Opps', value: topOpps, color: '#10b981', icon: '✅' },
            ].map((k, i) => (
              <div key={i} style={{ padding: '0.75rem 0.5rem', borderRadius: 10, textAlign: 'center', background: `${k.color}08`, border: `1px solid ${k.color}22` }}>
                <div style={{ fontSize: '0.95rem', marginBottom: '0.1rem' }}>{k.icon}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: k.color, lineHeight: 1 }}>{k.value}</div>
                <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Posture + SFI */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: `4px solid ${posture.color}` }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Postura Estratégica</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.8rem' }}>{posture.icon}</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: posture.color }}>{posture.posture}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{posture.desc}</div>
            </div>
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Strategic Fitness Index (SFI)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <SviGauge score={Math.max(10, Math.min(95, sfi))} color={sfi >= 60 ? '#10b981' : sfi >= 40 ? '#f59e0b' : '#ff4d6a'} />
                <div>
                  <div style={{ fontSize: '0.72rem', color: sfi >= 60 ? '#10b981' : sfi >= 40 ? '#f59e0b' : '#ff4d6a', fontWeight: 700 }}>
                    {sfi >= 60 ? 'Posición sólida' : sfi >= 40 ? 'Posición moderada' : 'Posición frágil'}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', lineHeight: 1.5, marginTop: '0.25rem' }}>
                    Índice compuesto de aptitud estratégica sobre fortalezas netas y balance F/D × O/A.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top items per quadrant */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.75rem' }}>
            {Object.entries(Q).map(([q, cfg]) => {
              const top = byQ[q].sort((a,b) => (b.impact_score||3)-(a.impact_score||3)).slice(0,3);
              return (
                <div key={q} className="glass-panel" style={{ padding: '1rem', borderTop: `3px solid ${cfg.color}` }}>
                  <div style={{ fontSize: '0.72rem', color: cfg.color, fontWeight: 700, marginBottom: '0.5rem' }}>{cfg.icon} {cfg.label} ({byQ[q].length})</div>
                  {top.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.35rem', padding: '0.35rem 0.5rem', borderRadius: 7, background: `${cfg.color}08` }}>
                      <span style={{ fontSize: '0.6rem', fontWeight: 800, color: cfg.color, marginTop: '0.1rem' }}>#{i+1}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.4, flex: 1 }}>
                        {item.description?.length > 70 ? item.description.slice(0,70)+'…' : item.description}
                      </span>
                      <span style={{ fontSize: '0.62rem', fontWeight: 700, color: cfg.color, whiteSpace: 'nowrap' }}>{item.impact_score||3}/5</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── INTEL VIEW ── */}
      {view === 'intelligence' && (
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>
            Factor Intelligence — Todos los elementos FODA ordenados por impacto
          </div>
          {['strength','opportunity','weakness','threat'].map(q => {
            const cfg = Q[q];
            const items = byQ[q].sort((a,b) => (b.impact_score||3)-(a.impact_score||3));
            if (!items.length) return null;
            return (
              <div key={q} style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.7rem', color: cfg.color, fontWeight: 700, marginBottom: '0.5rem', borderLeft: `3px solid ${cfg.color}`, paddingLeft: '0.5rem' }}>
                  {cfg.icon} {cfg.label} ({items.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {items.map((item, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1fr 100px 44px', gap: '0.5rem', alignItems: 'center', padding: '0.5rem 0.75rem', borderRadius: 8, background: `${cfg.color}06`, border: `1px solid ${cfg.color}18` }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-tertiary)', textAlign: 'center' }}>#{i+1}</span>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>{item.description}</div>
                        {item.source_signal && <div style={{ fontSize: '0.62rem', color: '#6366f1', marginTop: '0.15rem' }}>📌 {item.source_signal}</div>}
                      </div>
                      <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${((item.impact_score||3)/5)*100}%`, background: cfg.color, borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: cfg.color, textAlign: 'right' }}>{item.impact_score||3}/5</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TOWS VIEW ── */}
      {view === 'tows' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tows.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔗</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Genera la Matriz TOWS para ver las estrategias cruzadas</div>
              <button onClick={onScanTows} disabled={towsLoading} className="btn btn-primary" style={{ opacity: towsLoading ? 0.5 : 1 }}>
                {towsLoading ? '⏳ Generando TOWS…' : '⚡ Generar TOWS'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {['FO','FA','DO','DA'].map(ct => {
                const meta = TOWS_META[ct];
                const strats = byTows[ct];
                return (
                  <div key={ct} className="glass-panel" style={{ padding: '1rem', borderLeft: `4px solid ${meta.color}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '1rem' }}>{meta.icon}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: meta.color }}>{meta.label}</span>
                      <span style={{ fontSize: '0.6rem', marginLeft: 'auto', color: 'var(--text-tertiary)' }}>({strats.length})</span>
                    </div>
                    {strats.map((s, i) => (
                      <div key={i} style={{ padding: '0.5rem', borderRadius: 7, marginBottom: '0.35rem', background: `${meta.color}08`, border: `1px solid ${meta.color}20` }}>
                        <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{s.strategy}</div>
                        {s.internal_factors && <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>🏠 {s.internal_factors?.slice(0,50)}</div>}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
