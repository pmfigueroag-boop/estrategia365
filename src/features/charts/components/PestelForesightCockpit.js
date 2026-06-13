/**
 * PestelForesightCockpit — Strategic Environmental Intelligence Platform
 * ======================================================================
 * Unified command center. Palantir/Bloomberg aesthetic.
 * 3 view modes: command | signals | matrix
 */
"use client";
import { useState, useEffect } from 'react';

const FC = {
  P:  { label: 'Político',     short: 'POL', color: '#ff453a', icon: '🏛️' },
  E:  { label: 'Económico',    short: 'ECO', color: '#ff9f0a', icon: '📈' },
  S:  { label: 'Social',       short: 'SOC', color: '#30d158', icon: '👥' },
  T:  { label: 'Tecnológico',  short: 'TEC', color: '#5e5ce6', icon: '⚡' },
  E2: { label: 'Ecológico',    short: 'ENV', color: '#bf5af2', icon: '🌍' },
  L:  { label: 'Legal',        short: 'LEG', color: '#ff6b35', icon: '⚖️' },
};

function getSviColor(score) {
  if (score >= 75) return '#ff453a';
  if (score >= 55) return '#ff9f0a';
  if (score >= 35) return '#ffcc00';
  return '#30d158';
}

function getRiskColor(level) {
  const m = { critical: '#ff453a', high: '#ff9f0a', moderate: '#ffcc00', low: '#30d158', none: '#5e5ce6' };
  return m[level] || '#888';
}

// Hexagonal radar SVG
function HexRadar({ riskDistribution }) {
  const CX = 100, CY = 100, R = 72;
  const factors = Object.keys(FC);
  const angles = factors.map((_, i) => -90 + i * 60);
  const polar = (r, deg) => ({
    x: CX + r * Math.cos(deg * Math.PI / 180),
    y: CY + r * Math.sin(deg * Math.PI / 180),
  });

  const scores = factors.map(k => {
    const d = riskDistribution?.find(r => r.factor === k);
    return Math.min(100, d?.avg_priority || 0);
  });

  const dataPoints = factors.map((k, i) => {
    const p = polar((scores[i] / 100) * R, angles[i]);
    return `${p.x},${p.y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 200 200" style={{ width: '100%', maxWidth: 200 }}>
      <defs>
        <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.05" />
        </radialGradient>
      </defs>
      {/* Grid rings */}
      {[0.33, 0.66, 1].map((p, i) => (
        <polygon key={i} points={angles.map(a => {
          const pt = polar(R * p, a);
          return `${pt.x},${pt.y}`;
        }).join(' ')}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      ))}
      {/* Axes */}
      {angles.map((a, i) => {
        const p = polar(R, a);
        return <line key={i} x1={CX} y1={CY} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />;
      })}
      {/* Data polygon */}
      <polygon points={dataPoints} fill="url(#radarFill)" stroke="#6366f1" strokeWidth="1.5" strokeOpacity="0.7" />
      {/* Factor dots + labels */}
      {factors.map((k, i) => {
        const cfg = FC[k];
        const lp = polar(R + 18, angles[i]);
        const dp = polar((scores[i] / 100) * R, angles[i]);
        return (
          <g key={k}>
            <circle cx={dp.x} cy={dp.y} r="3" fill={cfg.color} />
            <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle"
              fill={cfg.color} fontSize="8" fontWeight="800" fontFamily="monospace">
              {cfg.short}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function PestelForesightCockpit({ deepAnalysis, svi, driftData, earlyWarnings }) {
  const [view, setView] = useState('command');
  const [clock, setClock] = useState(new Date());
  const [selectedFactor, setSelectedFactor] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!deepAnalysis) return (
    <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📡</div>
      <p style={{ fontSize: '0.85rem' }}>Ejecuta el análisis profundo PESTEL para activar el Foresight Cockpit.</p>
    </div>
  );

  const es = deepAnalysis.executive_summary || {};
  const rd = deepAnalysis.risk_distribution || [];
  const cm = deepAnalysis.confidence_metrics || {};
  const sviData = deepAnalysis.svi || svi || { score: 0, level: 'stable' };
  const topActions = deepAnalysis.top_actions || [];
  const warningCount = earlyWarnings?.total_warnings || 0;
  const sviColor = getSviColor(sviData.score);

  const factorRows = Object.keys(FC).map(k => {
    const d = rd.find(r => r.factor === k) || {};
    return { key: k, cfg: FC[k], score: Math.round(d.avg_priority || 0), risk: d.risk_level || 'none', count: d.count || 0, trend: d.dominant_trend || 'stable' };
  }).sort((a, b) => b.score - a.score);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Command bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0.7rem 1.25rem', borderRadius: 12,
        background: 'linear-gradient(135deg, rgba(5,8,20,0.98), rgba(10,14,30,0.95))',
        border: `1px solid ${warningCount > 0 ? 'rgba(255,69,58,0.2)' : 'rgba(99,102,241,0.15)'}`,
        flexWrap: 'wrap', gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: warningCount > 0 ? '#ff453a' : '#30d158',
            boxShadow: `0 0 8px ${warningCount > 0 ? '#ff453a' : '#30d158'}`,
          }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: warningCount > 0 ? '#ff453a' : '#30d158' }}>
            PESTEL INTELLIGENCE COCKPIT — {warningCount > 0 ? `${warningCount} ALERTAS` : 'CLEAR'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          {['command', 'signals', 'matrix'].map(m => (
            <button key={m} onClick={() => setView(m)} style={{
              padding: '0.2rem 0.55rem', borderRadius: 6, fontSize: '0.65rem', cursor: 'pointer',
              border: `1px solid ${view === m ? '#6366f1' : 'rgba(255,255,255,0.08)'}`,
              background: view === m ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: view === m ? '#6366f1' : 'var(--text-tertiary)', fontWeight: view === m ? 700 : 400,
            }}>
              {m === 'command' ? '🎛️ Comando' : m === 'signals' ? '📡 Señales' : '⬛ Matriz'}
            </button>
          ))}
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)' }}>
          {clock.toLocaleTimeString('es-ES')}
        </div>
      </div>

      {/* ── Command View ── */}
      {view === 'command' && (
        <>
          {/* KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            {[
              { label: 'SVI Score', value: sviData.score, sub: (sviData.level || 'stable').toUpperCase(), color: sviColor, icon: '🌡️' },
              { label: 'AI Confidence', value: `${cm.avg_confidence || 70}%`, sub: `${cm.low_confidence_count || 0} baja conf`, color: (cm.avg_confidence || 70) >= 75 ? '#30d158' : '#ff9f0a', icon: '🧠' },
              { label: 'Balance', value: `${es.opportunities_count || 0}/${es.threats_count || 0}`, sub: 'opp / amenazas', color: (es.opportunities_count || 0) > (es.threats_count || 0) ? '#30d158' : '#ff453a', icon: '⚖️' },
              { label: 'Alertas', value: warningCount, sub: warningCount > 0 ? 'requieren atención' : 'entorno claro', color: warningCount > 0 ? '#ff453a' : '#30d158', icon: '⚠️' },
            ].map((kpi, i) => (
              <div key={i} style={{
                padding: '1rem', borderRadius: 12, textAlign: 'center',
                background: `${kpi.color}08`, border: `1px solid ${kpi.color}25`,
              }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{kpi.icon}</div>
                <div style={{ fontSize: '1.7rem', fontWeight: 900, color: kpi.color, lineHeight: 1, fontFamily: 'monospace' }}>{kpi.value}</div>
                <div style={{ fontSize: '0.6rem', color: kpi.color, marginTop: '0.2rem', fontWeight: 600 }}>{kpi.sub}</div>
                <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* Radar + Factor panel */}
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1rem' }}>
            <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                Environmental Radar
              </div>
              <HexRadar riskDistribution={rd} />
              <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginTop: '0.4rem', textAlign: 'center' }}>
                Score por dimensión PESTEL
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                Panel de Factores — Click para detalle
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {factorRows.map(f => {
                  const isSelected = selectedFactor === f.key;
                  const riskColor = getRiskColor(f.risk);
                  return (
                    <div key={f.key} onClick={() => setSelectedFactor(isSelected ? null : f.key)} style={{
                      padding: '0.6rem 0.85rem', borderRadius: 9, cursor: 'pointer',
                      background: isSelected ? `${f.cfg.color}12` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isSelected ? f.cfg.color + '44' : 'rgba(255,255,255,0.05)'}`,
                      transition: 'all 0.2s',
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '28px 100px 1fr 48px 56px 40px', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1rem' }}>{f.cfg.icon}</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: f.cfg.color }}>{f.cfg.label}</span>
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${f.score}%`, background: `linear-gradient(90deg, ${f.cfg.color}66, ${f.cfg.color})`, borderRadius: 3 }} />
                        </div>
                        <span style={{ fontWeight: 800, color: riskColor, fontSize: '0.9rem', textAlign: 'right', fontFamily: 'monospace' }}>{f.score}</span>
                        <span style={{ fontSize: '0.55rem', padding: '0.15rem 0.35rem', borderRadius: 4, fontWeight: 700, textAlign: 'center', background: `${riskColor}18`, color: riskColor, border: `1px solid ${riskColor}33` }}>
                          {f.risk.toUpperCase().slice(0, 4)}
                        </span>
                        <span style={{ fontSize: '0.8rem', textAlign: 'center' }}>
                          {f.trend === 'improving' ? '📈' : f.trend === 'declining' ? '📉' : '➡️'}
                        </span>
                      </div>
                      {isSelected && (
                        <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: `1px solid ${f.cfg.color}22`, display: 'flex', gap: '1rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          <span>{f.count} señales</span>
                          <span style={{ color: f.cfg.color }}>Tendencia: {f.trend}</span>
                          <span>Riesgo: {f.risk}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Drift */}
          {driftData?.has_history && (
            <div style={{
              padding: '0.75rem 1.25rem', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: driftData.drift_level === 'high' ? 'rgba(255,69,58,0.06)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${driftData.drift_level === 'high' ? 'rgba(255,69,58,0.2)' : 'rgba(255,255,255,0.05)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1rem' }}>🌊</span>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Environmental Drift Monitor</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{driftData.total_snapshots} snapshots · cambio relativo al baseline</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: driftData.drift_level === 'high' ? '#ff453a' : '#ff9f0a', fontFamily: 'monospace' }}>
                  {driftData.drift_score}
                </div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>
                  {driftData.drift_level?.toUpperCase()}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Signals View ── */}
      {view === 'signals' && (
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
            Signal Intelligence Feed — Top Acciones por Prioridad
          </div>
          {topActions.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem', padding: '2rem' }}>Sin señales disponibles</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {topActions.slice(0, 12).map((a, i) => {
                const cfg = FC[a.factor] || { color: '#888', icon: '•', label: a.factor };
                const isOpp = a.type === 'opportunity';
                return (
                  <div key={i} style={{
                    padding: '0.75rem 1rem', borderRadius: 10,
                    background: isOpp ? 'rgba(48,209,88,0.04)' : 'rgba(255,69,58,0.04)',
                    border: `1px solid ${isOpp ? 'rgba(48,209,88,0.15)' : 'rgba(255,69,58,0.12)'}`,
                    display: 'grid', gridTemplateColumns: '36px 1fr auto', gap: '0.75rem', alignItems: 'center',
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.1rem' }}>{cfg.icon}</div>
                      <div style={{ fontSize: '0.5rem', color: cfg.color, fontWeight: 700 }}>{cfg.short || a.factor}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                        {a.signal_title || a.action?.slice(0, 60)}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
                        {a.action?.slice(0, 100)}{a.action?.length > 100 ? '…' : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: a.priority_score >= 80 ? '#ff453a' : a.priority_score >= 60 ? '#ff9f0a' : '#30d158', fontFamily: 'monospace' }}>
                        {a.priority_score}
                      </div>
                      <div style={{ fontSize: '0.55rem', padding: '0.1rem 0.4rem', borderRadius: 4, fontWeight: 700, background: isOpp ? 'rgba(48,209,88,0.15)' : 'rgba(255,69,58,0.15)', color: isOpp ? '#30d158' : '#ff453a' }}>
                        {isOpp ? 'OPP' : 'THR'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Matrix View ── */}
      {view === 'matrix' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
            Matriz de Exposición Ambiental
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {factorRows.map(f => {
              const riskColor = getRiskColor(f.risk);
              return (
                <div key={f.key} style={{
                  padding: '1rem', borderRadius: 12, textAlign: 'center',
                  background: `${f.cfg.color}08`, border: `1px solid ${f.cfg.color}25`,
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{f.cfg.icon}</div>
                  <div style={{ fontSize: '0.7rem', color: f.cfg.color, fontWeight: 700, marginBottom: '0.2rem' }}>{f.cfg.label}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: riskColor, lineHeight: 1, fontFamily: 'monospace' }}>{f.score}</div>
                  <div style={{ fontSize: '0.55rem', color: riskColor, fontWeight: 700, marginTop: '0.2rem' }}>{f.risk.toUpperCase()}</div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginTop: '0.5rem', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${f.score}%`, background: riskColor, borderRadius: 2 }} />
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.3rem' }}>
                    {f.count} señales · {f.trend === 'improving' ? '📈' : f.trend === 'declining' ? '📉' : '➡️'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: '0.5rem 1rem', borderRadius: 8, fontSize: '0.62rem', color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between' }}>
        <span>📡 PESTEL Foresight Cockpit · {Object.keys(FC).length} dimensiones</span>
        <span>Estrategia 365 Environmental Intelligence Engine</span>
      </div>
    </div>
  );
}
