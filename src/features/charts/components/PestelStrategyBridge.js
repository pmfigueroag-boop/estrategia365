/**
 * PestelStrategyBridge — Signal → Impact → Strategic Response v2
 * ===============================================================
 * Institutional-grade flow: cada señal PESTEL genera implicación
 * estratégica automática con framework doctrinal (Ansoff, RBV, etc).
 * Expandable rows, KPI banner, urgency classification.
 * Mirrors PorterStrategyBridge aesthetic.
 */
"use client";
import { useState } from 'react';

const FC = {
  P:  { label: 'Político',    short: 'POL', color: '#ff453a', icon: '🏛️' },
  E:  { label: 'Económico',   short: 'ECO', color: '#ff9f0a', icon: '📈' },
  S:  { label: 'Social',      short: 'SOC', color: '#30d158', icon: '👥' },
  T:  { label: 'Tecnológico', short: 'TEC', color: '#5e5ce6', icon: '⚡' },
  E2: { label: 'Ecológico',   short: 'ENV', color: '#bf5af2', icon: '🌍' },
  L:  { label: 'Legal',       short: 'LEG', color: '#ff6b35', icon: '⚖️' },
};

const URGENCY = {
  inmediata:   { label: 'INMEDIATA',   color: '#ff453a', bg: 'rgba(255,69,58,0.1)',   icon: '🔴' },
  planificada: { label: 'PLANIFICADA', color: '#ff9f0a', bg: 'rgba(255,159,10,0.1)',  icon: '🟠' },
  estrategica: { label: 'ESTRATÉGICA', color: '#5e5ce6', bg: 'rgba(94,92,230,0.1)',   icon: '🔵' },
};

// Doctrinal frameworks by factor + type combination
const FRAMEWORK_MAP = {
  T_opportunity:  { name: 'Blue Ocean / Innovation',    move: 'Explotar ventana tecnológica antes que los rivales la capturen' },
  T_threat:       { name: 'Dynamic Capabilities',       move: 'Desarrollar capacidades de absorción y adaptación tecnológica' },
  E_threat:       { name: 'Operational Resilience',     move: 'Diversificar fuentes de ingreso y optimizar estructura de costos' },
  E_opportunity:  { name: 'Market Penetration',         move: 'Acelerar captura de mercado en ventana de crecimiento' },
  P_threat:       { name: 'Political Risk Management',  move: 'Diversificar geografía y construir relaciones institucionales' },
  L_threat:       { name: 'Compliance by Design',       move: 'Integrar gobernanza regulatoria como ventaja competitiva' },
  E2_opportunity: { name: 'ESG Value Creation',         move: 'Liderar transición sostenible como diferenciador de marca' },
  S_opportunity:  { name: 'Jobs-to-be-Done',            move: 'Realinear propuesta de valor con nuevas expectativas sociales' },
};

export default function PestelStrategyBridge({ topActions = [] }) {
  const [expanded, setExpanded] = useState(null);

  if (!topActions.length) return (
    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔗</div>
      <p style={{ fontSize: '0.85rem' }}>Ejecuta el análisis profundo PESTEL para activar el Strategy Bridge.</p>
    </div>
  );

  const opportunities = topActions.filter(a => a.type === 'opportunity');
  const threats = topActions.filter(a => a.type === 'threat');
  const byUrgency = Object.fromEntries(Object.keys(URGENCY).map(k => [k, topActions.filter(a => a.urgency === k).length]));

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* KPI Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
        {[
          { label: 'Oportunidades', value: opportunities.length, color: '#30d158', icon: '✅' },
          { label: 'Amenazas',      value: threats.length,       color: '#ff453a', icon: '⚠️' },
          ...Object.entries(URGENCY).map(([k, u]) => ({ label: u.label, value: byUrgency[k] || 0, color: u.color, icon: u.icon })),
        ].slice(0, 4).map((kpi, i) => (
          <div key={i} style={{
            padding: '0.9rem', borderRadius: 12, textAlign: 'center',
            background: `${kpi.color}08`, border: `1px solid ${kpi.color}25`,
          }}>
            <div style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{kpi.icon}</div>
            <div style={{ fontSize: '1.7rem', fontWeight: 900, color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Main flow */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔗</div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700 }}>PESTEL → Strategy Bridge</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
              Señal → Impacto → Respuesta estratégica doctrinal · StaaS Engine · Click para expandir
            </div>
          </div>
        </div>

        {/* Opportunities */}
        {opportunities.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.65rem', color: '#30d158', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem', paddingLeft: '0.5rem', borderLeft: '3px solid #30d158' }}>
              ✅ Ventanas de Oportunidad ({opportunities.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {opportunities.map((a, i) => <BridgeRow key={i} action={a} idx={`opp-${i}`} expanded={expanded} setExpanded={setExpanded} />)}
            </div>
          </div>
        )}

        {/* Threats */}
        {threats.length > 0 && (
          <div>
            <div style={{ fontSize: '0.65rem', color: '#ff453a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem', paddingLeft: '0.5rem', borderLeft: '3px solid #ff453a' }}>
              ⚠️ Amenazas Estratégicas ({threats.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {threats.map((a, i) => <BridgeRow key={i} action={a} idx={`thr-${i}`} expanded={expanded} setExpanded={setExpanded} />)}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '0.65rem 1rem', borderRadius: 8, fontSize: '0.65rem', color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
        🏛️ <strong style={{ color: 'var(--text-secondary)' }}>StaaS Strategy Engine</strong> — Frameworks: Porter · Blue Ocean · Dynamic Capabilities · Ansoff · RBV · ESG. Urgencia determinada por score de prioridad + tendencia.
      </div>
    </div>
  );
}

function BridgeRow({ action: a, idx, expanded, setExpanded }) {
  const isExpanded = expanded === idx;
  const cfg = FC[a.factor] || { label: a.factor, color: '#888', icon: '•', short: a.factor };
  const urg = URGENCY[a.urgency] || URGENCY.planificada;
  const isOpp = a.type === 'opportunity';
  const impactColor = isOpp ? '#30d158' : '#ff453a';
  const fwKey = `${a.factor}_${a.type}`;
  const fw = FRAMEWORK_MAP[fwKey] || { name: 'Strategic Response', move: a.action || 'Revisar implicaciones estratégicas' };

  return (
    <div onClick={() => setExpanded(isExpanded ? null : idx)} style={{
      borderRadius: 11, overflow: 'hidden', cursor: 'pointer',
      border: `1px solid ${isExpanded ? cfg.color + '44' : 'rgba(255,255,255,0.05)'}`,
      background: isExpanded ? `${cfg.color}08` : 'rgba(255,255,255,0.02)',
      transition: 'all 0.2s',
    }}>
      {/* Main row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '190px 20px 130px 20px 1fr 20px 160px',
        alignItems: 'center', gap: '0.4rem', padding: '0.85rem 1rem',
      }}>
        {/* Signal */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>{cfg.icon}</span>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>
              {a.signal_title?.length > 28 ? a.signal_title.slice(0, 28) + '…' : a.signal_title || cfg.label}
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>
              {cfg.label} · Score {a.priority_score}
            </div>
            <div style={{ height: 3, width: 72, background: 'rgba(255,255,255,0.07)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${a.priority_score}%`, background: `linear-gradient(90deg, ${cfg.color}77, ${cfg.color})`, borderRadius: 2 }} />
            </div>
          </div>
        </div>
        <div style={{ color: cfg.color, fontSize: '0.9rem', textAlign: 'center' }}>→</div>

        {/* Impact */}
        <div style={{ padding: '0.35rem 0.55rem', borderRadius: 8, textAlign: 'center', background: `${impactColor}12`, border: `1px dashed ${impactColor}44` }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 800, color: impactColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isOpp ? '✅ OPORTUNIDAD' : '⚠️ AMENAZA'}
          </div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>
            {urg.icon} {urg.label}
          </div>
        </div>
        <div style={{ color: impactColor, fontSize: '0.85rem', textAlign: 'center' }}>⟶</div>

        {/* Action */}
        <div style={{ borderLeft: `3px solid ${impactColor}`, paddingLeft: '0.65rem' }}>
          <div style={{ fontSize: '0.6rem', color: impactColor, fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.15rem' }}>Respuesta</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {a.action?.length > 65 ? a.action.slice(0, 65) + '…' : a.action}
          </div>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.85rem', textAlign: 'center' }}>⟶</div>

        {/* Framework */}
        <div style={{ padding: '0.35rem 0.5rem', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: '0.6rem', color: '#6366f1', fontWeight: 700, marginBottom: '0.1rem' }}>📘 {fw.name}</div>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', lineHeight: 1.3 }}>{fw.move.slice(0, 50)}{fw.move.length > 50 ? '…' : ''}</div>
        </div>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div style={{
          padding: '0 1rem 0.9rem', borderTop: `1px solid ${cfg.color}20`,
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', paddingTop: '0.75rem',
        }}>
          <div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>Marco Estratégico</div>
            <div style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 700 }}>{fw.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.5 }}>{fw.move}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>Urgencia</div>
            <div style={{ fontSize: '0.72rem', color: urg.color, fontWeight: 700 }}>{urg.icon} {urg.label}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {a.urgency === 'inmediata' ? 'Acción requerida en próximas semanas' : a.urgency === 'planificada' ? 'Incorporar en plan anual' : 'Integrar en visión a 3+ años'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>Respuesta completa</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{a.action}</div>
          </div>
        </div>
      )}
    </div>
  );
}
