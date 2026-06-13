/**
 * BcgInstitutionalCockpit — BCG Command Center (Fase 3)
 * ======================================================
 * El nivel máximo. Unifica todo el portafolio en una sola pantalla:
 * - Portfolio Balance Score
 * - Capital Allocation Posture
 * - Survivability Overview
 * - Momentum Leaders
 * - Optionality Summary
 * - AI Strategic Recommendation
 * - Priority Action Queue
 *
 * Diseño: Bloomberg Terminal × McKinsey Board Deck.
 * Una sola pantalla. Board-ready. Sin clics extra.
 */
"use client";
import { useState } from 'react';

const QUADRANTS = {
  star:     { color: '#6366f1', icon: '⭐', label: 'Star',           capRole: 'GENERA + CONSUME', cashFlow: 'neutral', mandate: 'ESCALAR' },
  cow:      { color: '#10b981', icon: '🐄', label: 'Cash Cow',       capRole: 'GENERADOR NETO',   cashFlow: 'positive', mandate: 'OPTIMIZAR' },
  question: { color: '#f59e0b', icon: '❓', label: 'Question Mark',   capRole: 'ABSORBEDOR',       cashFlow: 'negative', mandate: 'DECIDIR' },
  dog:      { color: '#ff4d6a', icon: '🐕', label: 'Dog',            capRole: 'DESTRUCTOR',       cashFlow: 'drain', mandate: 'LIBERAR' },
};

function momentumScore(u) { return Math.min(1, Math.max(0, u.growth * 0.6 + u.share * 0.4)); }
function survScore(u) {
  const base = { star: 0.78, cow: 0.85, question: 0.52, dog: 0.32 };
  return Math.min(0.97, Math.max(0.05, (base[u.quadrant] || 0.5) + u.share * 0.12 + Math.max(0, u.growth) * 0.15));
}
function optScore(u) {
  const base = { star: 0.65, cow: 0.28, question: 0.88, dog: 0.18 };
  return Math.min(0.97, Math.max(0.05, (base[u.quadrant] || 0.3) + Math.max(0, u.growth) * 0.2));
}

// Assess portfolio health
function portfolioPosture(units) {
  const stars = units.filter(u => u.quadrant === 'star').length;
  const cows = units.filter(u => u.quadrant === 'cow').length;
  const dogs = units.filter(u => u.quadrant === 'dog').length;
  const questions = units.filter(u => u.quadrant === 'question').length;
  const total = units.length;

  if (stars === 0 && cows === 0) return { label: 'PORTAFOLIO EN CRISIS', color: '#ff4d6a', icon: '🔴', score: 20 };
  if (dogs > (stars + cows)) return { label: 'PORTAFOLIO DÉBIL', color: '#f59e0b', icon: '⚠️', score: 42 };
  if (cows >= 1 && stars >= 1) return { label: 'PORTAFOLIO SALUDABLE', color: '#10b981', icon: '✅', score: 78 };
  if (cows >= 1) return { label: 'PORTAFOLIO ESTABLE', color: '#6366f1', icon: '⚖️', score: 62 };
  return { label: 'PORTAFOLIO EN TRANSICIÓN', color: '#f59e0b', icon: '⏳', score: 51 };
}

// Generate priority action queue
function priorityActions(units) {
  const actions = [];
  const dogs = units.filter(u => u.quadrant === 'dog');
  const questions = units.filter(u => u.quadrant === 'question');
  const cows = units.filter(u => u.quadrant === 'cow');
  const stars = units.filter(u => u.quadrant === 'star');

  if (dogs.length > 0) actions.push({ priority: 'P1', color: '#ff4d6a', icon: '🏃', action: `Desinvertir: ${dogs.slice(0,2).map(u=>u.name).join(', ')}`, quadrant: 'dog' });
  if (questions.length > 1) actions.push({ priority: 'P1', color: '#f59e0b', icon: '⚡', action: `Decidir en 90 días: ${questions[0]?.name}`, quadrant: 'question' });
  if (cows.length > 0 && stars.length > 0) actions.push({ priority: 'P2', color: '#10b981', icon: '💰', action: `Redirigir caja de ${cows[0]?.name} → ${stars[0]?.name}`, quadrant: 'cow' });
  if (stars.length > 0) actions.push({ priority: 'P2', color: '#6366f1', icon: '🚀', action: `Escalar ${stars.slice(0,2).map(u=>u.name).join(', ')}`, quadrant: 'star' });
  if (questions.length > 0) actions.push({ priority: 'P3', color: '#f59e0b', icon: '🔍', action: `Evaluar conversión: ${questions.slice(-1)[0]?.name}`, quadrant: 'question' });
  return actions.slice(0, 5);
}

export default function BcgInstitutionalCockpit({ units = [], summary }) {
  const [expanded, setExpanded] = useState(null);

  if (!units.length) return null;

  const enriched = units.map(u => ({ ...u, q: QUADRANTS[u.quadrant], momentum: momentumScore(u), surv: survScore(u), opt: optScore(u) }));
  const byQ = { star: enriched.filter(u => u.quadrant === 'star'), cow: enriched.filter(u => u.quadrant === 'cow'), question: enriched.filter(u => u.quadrant === 'question'), dog: enriched.filter(u => u.quadrant === 'dog') };
  const posture = portfolioPosture(units);
  const actions = priorityActions(units);
  const avgMomentum = enriched.reduce((s, u) => s + u.momentum, 0) / enriched.length;
  const avgSurv = enriched.reduce((s, u) => s + u.surv, 0) / enriched.length;
  const avgOpt = enriched.reduce((s, u) => s + u.opt, 0) / enriched.length;
  const topMomentum = [...enriched].sort((a, b) => b.momentum - a.momentum)[0];
  const topRisk = [...enriched].sort((a, b) => a.surv - b.surv)[0];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Master header */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', borderLeft: `4px solid ${posture.color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.1rem' }}>
            <span style={{ fontSize: '1.2rem' }}>{posture.icon}</span>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: posture.color }}>{posture.label}</span>
            <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: 4, background: `${posture.color}15`, border: `1px solid ${posture.color}33`, color: posture.color, fontWeight: 700 }}>SCORE {posture.score}/100</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2rem' }}>
            {units.length} unidades · BCG Institutional Command Center · Henderson (1970)
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[['Momentum', avgMomentum, '⚡', '#6366f1'], ['Resiliencia', avgSurv, '🛡️', '#10b981'], ['Opcionalidad', avgOpt, '🎯', '#f59e0b']].map(([l, v, icon, c]) => (
            <div key={l} style={{ textAlign: 'center', padding: '0.4rem 0.7rem', borderRadius: 8, background: `${c}08`, border: `1px solid ${c}25` }}>
              <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>{icon} {l}</div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: c }}>{Math.round(v * 100)}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main cockpit grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.6rem' }}>
        {Object.entries(QUADRANTS).map(([q, qd]) => {
          const items = byQ[q];
          return (
            <div key={q} onClick={() => setExpanded(expanded === q ? null : q)} style={{
              padding: '1rem', borderRadius: 11, cursor: 'pointer',
              background: expanded === q ? `${qd.color}12` : `${qd.color}06`,
              border: `1.5px solid ${expanded === q ? qd.color + '55' : qd.color + '25'}`,
              transition: 'all 0.2s', transform: expanded === q ? 'translateY(-2px)' : 'none',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '1.1rem' }}>{qd.icon}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: qd.color, marginTop: '0.1rem' }}>{qd.label}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: qd.color, lineHeight: 1 }}>{items.length}</div>
                  <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>unidades</div>
                </div>
              </div>
              <div style={{ padding: '0.3rem 0.4rem', borderRadius: 5, background: `${qd.color}12`, marginBottom: '0.4rem' }}>
                <div style={{ fontSize: '0.58rem', color: qd.color, fontWeight: 700 }}>→ {qd.mandate}</div>
                <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>{qd.capRole}</div>
              </div>
              {/* KPI bars for this quadrant */}
              {[['Momentum', items.length > 0 ? items.reduce((s,u)=>s+u.momentum,0)/items.length : 0],
                ['Surv.', items.length > 0 ? items.reduce((s,u)=>s+u.surv,0)/items.length : 0]].map(([l, v]) => (
                <div key={l} style={{ marginBottom: '0.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: 'var(--text-tertiary)', marginBottom: '0.1rem' }}>
                    <span>{l}</span><span style={{ color: qd.color }}>{Math.round(v*100)}%</span>
                  </div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${v*100}%`, background: qd.color, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Expanded quadrant detail */}
      {expanded && (
        <div className="glass-panel animate-fade-in" style={{ padding: '1.25rem', borderLeft: `4px solid ${QUADRANTS[expanded]?.color}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: QUADRANTS[expanded]?.color }}>{QUADRANTS[expanded]?.icon} {QUADRANTS[expanded]?.label} — {byQ[expanded]?.length} unidades</span>
            <button onClick={() => setExpanded(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
            {byQ[expanded]?.map((u, i) => (
              <div key={i} style={{ padding: '0.65rem', borderRadius: 8, background: `${QUADRANTS[expanded]?.color}08`, border: `1px solid ${QUADRANTS[expanded]?.color}22` }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>{u.name}</div>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)' }}>↑{(u.growth*100).toFixed(0)}%</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)' }}>◆{(u.share*100).toFixed(0)}%</span>
                </div>
                {u.strategic_action && <div style={{ fontSize: '0.65rem', color: QUADRANTS[expanded]?.color, lineHeight: 1.3 }}>🎯 {u.strategic_action}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {/* Priority action queue */}
        <div className="glass-panel" style={{ padding: '1.1rem' }}>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.65rem' }}>🎯 Cola de Acciones Prioritarias</div>
          {actions.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', marginBottom: '0.45rem', padding: '0.45rem 0.55rem', borderRadius: 8, background: `${a.color}07`, border: `1px solid ${a.color}20` }}>
              <div style={{ padding: '0.1rem 0.35rem', borderRadius: 4, background: `${a.color}20`, border: `1px solid ${a.color}33`, fontSize: '0.58rem', fontWeight: 800, color: a.color, flexShrink: 0, marginTop: '0.05rem' }}>{a.priority}</div>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-primary)' }}>{a.icon} {a.action}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Intelligence alerts */}
        <div className="glass-panel" style={{ padding: '1.1rem' }}>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.65rem' }}>🧠 Señales de Inteligencia</div>
          {topMomentum && (
            <div style={{ padding: '0.5rem 0.6rem', borderRadius: 8, background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '0.4rem' }}>
              <div style={{ fontSize: '0.62rem', color: '#6366f1', fontWeight: 700, marginBottom: '0.1rem' }}>⚡ MAYOR MOMENTUM</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{topMomentum.name} — {Math.round(topMomentum.momentum * 100)}% score</div>
            </div>
          )}
          {topRisk && (
            <div style={{ padding: '0.5rem 0.6rem', borderRadius: 8, background: 'rgba(255,77,106,0.07)', border: '1px solid rgba(255,77,106,0.2)', marginBottom: '0.4rem' }}>
              <div style={{ fontSize: '0.62rem', color: '#ff4d6a', fontWeight: 700, marginBottom: '0.1rem' }}>🔴 MAYOR RIESGO DE SUPERVIVENCIA</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{topRisk.name} — {Math.round(topRisk.surv * 100)}% resiliencia</div>
            </div>
          )}
          {summary && (
            <div style={{ padding: '0.5rem 0.6rem', borderRadius: 8, background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: 700, marginBottom: '0.1rem' }}>🤖 VISIÓN IA</div>
              <div style={{ fontSize: '0.67rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{summary?.slice(0, 120)}…</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '0.65rem 1rem', borderRadius: 8, fontSize: '0.65rem', color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
        🏛️ <strong style={{ color: 'var(--text-secondary)' }}>BCG Institutional Cockpit</strong> — Henderson (1970) · Unifica Portfolio Balance, Capital Allocation, Momentum Intelligence, Survivability & Optionality en una sola vista ejecutiva
      </div>
    </div>
  );
}
