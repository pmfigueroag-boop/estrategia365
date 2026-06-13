/**
 * BoCockpit — Blue Ocean Institutional Cockpit (Fase 3)
 * ======================================================
 * Unifica toda la inteligencia Blue Ocean en una pantalla:
 * - Blue Ocean Index (divergence score)
 * - ERRC Composition
 * - Focus / Divergence / Tagline assessment
 * - Top opportunities
 * - Non-customer reach estimate
 * - Priority actions
 * Board-ready single view.
 */
"use client";
import { useState } from 'react';

const ERRC_META = {
  eliminate: { color: '#ff4d6a', icon: '❌', label: 'Eliminar' },
  reduce:    { color: '#f59e0b', icon: '⬇️', label: 'Reducir'  },
  raise:     { color: '#6366f1', icon: '⬆️', label: 'Incrementar' },
  create:    { color: '#10b981', icon: '✨', label: 'Crear'    },
};

function assessStrategy(factors) {
  const total = factors.length;
  if (!total) return { label: 'SIN DATOS', color: '#94a3b8', score: 0 };
  const creates = factors.filter(f => f.errc_action === 'create').length;
  const eliminates = factors.filter(f => f.errc_action === 'eliminate').length;
  const avgDiv = factors.reduce((s, f) => s + Math.abs(f.proposed_score - f.industry_score), 0) / total;
  const focusPct = factors.filter(f => Math.abs(f.proposed_score - f.industry_score) >= 2).length / total;

  if (avgDiv >= 2.5 && creates >= 2 && focusPct >= 0.4) return { label: 'OCÉANO AZUL CONFIRMADO', color: '#10b981', icon: '🌊', score: 88 };
  if (avgDiv >= 1.5 && (creates >= 1 || eliminates >= 1)) return { label: 'DIVERGENCIA ACTIVA', color: '#6366f1', icon: '📐', score: 68 };
  if (avgDiv >= 1) return { label: 'DIFERENCIACIÓN PARCIAL', color: '#f59e0b', icon: '⚠️', score: 48 };
  return { label: 'OCÉANO ROJO', color: '#ff4d6a', icon: '🔴', score: 28 };
}

function generateActions(factors) {
  const actions = [];
  const low = factors.filter(f => f.errc_action === 'create' && f.proposed_score < 4);
  const high = factors.filter(f => f.errc_action === 'eliminate' && f.proposed_score > 2);
  const noDiv = factors.filter(f => Math.abs(f.proposed_score - f.industry_score) === 0);

  if (low.length > 0) actions.push({ p: 'P1', color: '#10b981', icon: '✨', text: `Potenciar factor creativo: "${low[0].name}" (actualmente ${low[0].proposed_score}/5)` });
  if (high.length > 0) actions.push({ p: 'P1', color: '#ff4d6a', icon: '❌', text: `Completar eliminación: "${high[0].name}" aún en ${high[0].proposed_score}/5` });
  if (noDiv.length > 0) actions.push({ p: 'P2', color: '#f59e0b', icon: '⚠️', text: `Sin divergencia: "${noDiv[0].name}" — definir acción ERRC` });
  const topOpp = [...factors].sort((a, b) => (b.proposed_score - b.industry_score) - (a.proposed_score - a.industry_score))[0];
  if (topOpp) actions.push({ p: 'P2', color: '#6366f1', icon: '🚀', text: `Capitalizar ventaja máxima: "${topOpp.name}" (+${topOpp.proposed_score - topOpp.industry_score})` });
  return actions.slice(0, 5);
}

export default function BoCockpit({ factors = [], actions = [], summary }) {
  const [expanded, setExpanded] = useState(null);

  if (!factors.length) return null;

  const strat = assessStrategy(factors);
  const priorityActions = generateActions(factors);
  const totalDiv = factors.reduce((s, f) => s + Math.abs(f.proposed_score - f.industry_score), 0);
  const maxDiv = factors.length * 4;
  const divPct = Math.round((totalDiv / maxDiv) * 100);
  const focusPct = Math.round((factors.filter(f => Math.abs(f.proposed_score - f.industry_score) >= 2).length / factors.length) * 100);
  const topDiverging = [...factors].sort((a, b) => Math.abs(b.proposed_score - b.industry_score) - Math.abs(a.proposed_score - a.industry_score)).slice(0, 3);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Master header */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', borderLeft: `4px solid ${strat.color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.1rem' }}>
            <span style={{ fontSize: '1.2rem' }}>{strat.icon}</span>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: strat.color }}>{strat.label}</span>
            <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: 4, background: `${strat.color}15`, border: `1px solid ${strat.color}33`, color: strat.color, fontWeight: 700 }}>SCORE {strat.score}/100</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2rem' }}>
            {factors.length} factores competitivos · Blue Ocean Command Center · Kim & Mauborgne (2005)
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[['Divergencia', divPct, '📐', '#10b981'], ['Focus', focusPct, '🎯', '#6366f1'], ['Factores', factors.length, '📊', '#f59e0b']].map(([l, v, icon, c]) => (
            <div key={l} style={{ textAlign: 'center', padding: '0.4rem 0.65rem', borderRadius: 8, background: `${c}08`, border: `1px solid ${c}25` }}>
              <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>{icon} {l}</div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: c }}>{typeof v === 'number' && l !== 'Factores' ? v + '%' : v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ERRC composition grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
        {Object.entries(ERRC_META).map(([k, m]) => {
          const items = factors.filter(f => f.errc_action === k);
          const isExp = expanded === k;
          return (
            <div key={k} onClick={() => setExpanded(isExp ? null : k)} style={{
              padding: '1rem', borderRadius: 11, cursor: 'pointer',
              background: isExp ? `${m.color}12` : `${m.color}06`,
              border: `1.5px solid ${isExp ? m.color + '55' : m.color + '25'}`,
              transition: 'all 0.2s', transform: isExp ? 'translateY(-2px)' : 'none',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                <div>
                  <div style={{ fontSize: '1.1rem' }}>{m.icon}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: m.color, marginTop: '0.1rem' }}>{m.label}</div>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: m.color, lineHeight: 1 }}>{items.length}</div>
              </div>
              {items.slice(0, 2).map((f, i) => (
                <div key={i} style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', marginBottom: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  • {f.name} ({f.industry_score}→{f.proposed_score})
                </div>
              ))}
              {items.length > 2 && <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>+{items.length - 2} más</div>}
            </div>
          );
        })}
      </div>

      {/* Expanded ERRC detail */}
      {expanded && (() => {
        const m = ERRC_META[expanded];
        const items = factors.filter(f => f.errc_action === expanded);
        return (
          <div className="glass-panel animate-fade-in" style={{ padding: '1.25rem', borderLeft: `4px solid ${m.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: m.color }}>{m.icon} {m.label} — {items.length} factores</span>
              <button onClick={() => setExpanded(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
              {items.map((f, i) => (
                <div key={i} style={{ padding: '0.65rem', borderRadius: 8, background: `${m.color}08`, border: `1px solid ${m.color}22` }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, marginBottom: '0.15rem' }}>{f.name}</div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)' }}>Industria: {f.industry_score} → Propuesta: {f.proposed_score}</div>
                  {f.evidence && <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginTop: '0.15rem', fontStyle: 'italic' }}>📄 {f.evidence?.slice(0, 60)}</div>}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {/* Priority actions */}
        <div className="glass-panel" style={{ padding: '1.1rem' }}>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.65rem' }}>🎯 Acciones Prioritarias</div>
          {priorityActions.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.4rem', padding: '0.4rem 0.5rem', borderRadius: 8, background: `${a.color}07`, border: `1px solid ${a.color}20` }}>
              <span style={{ padding: '0.1rem 0.3rem', borderRadius: 4, background: `${a.color}20`, fontSize: '0.58rem', fontWeight: 800, color: a.color, flexShrink: 0 }}>{a.p}</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{a.icon} {a.text}</span>
            </div>
          ))}
        </div>

        {/* Intelligence signals */}
        <div className="glass-panel" style={{ padding: '1.1rem' }}>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.65rem' }}>🧠 Señales de Inteligencia</div>
          <div style={{ padding: '0.5rem 0.6rem', borderRadius: 8, background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '0.4rem' }}>
            <div style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: 700, marginBottom: '0.1rem' }}>📐 TOP DIVERGENCIA</div>
            {topDiverging.map((f, i) => (
              <div key={i} style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                {f.name} — Δ{f.proposed_score > f.industry_score ? '+' : ''}{f.proposed_score - f.industry_score}
              </div>
            ))}
          </div>
          {summary && (
            <div style={{ padding: '0.5rem 0.6rem', borderRadius: 8, background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <div style={{ fontSize: '0.62rem', color: '#6366f1', fontWeight: 700, marginBottom: '0.1rem' }}>🤖 VISIÓN IA</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{summary?.slice(0, 150)}…</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '0.65rem 1rem', borderRadius: 8, fontSize: '0.65rem', color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
        🏛️ <strong style={{ color: 'var(--text-secondary)' }}>Blue Ocean Cockpit</strong> — Kim & Mauborgne (2005) · Focus + Divergence + Compelling Tagline = Blue Ocean Strategy
      </div>
    </div>
  );
}
