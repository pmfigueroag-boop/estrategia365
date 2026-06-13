/**
 * BcgStrategyBridge — BCG → Strategic Action Pipeline (Fase 1)
 * =============================================================
 * Cierra el loop: cuadrante → prescripción doctrinal → acción ejecutiva.
 * Cada cuadrante genera un playbook específico derivado de Henderson (1970)
 * + frameworks modernos (Christensen disruption, Porter 5F, Teece DC).
 * Muestra unidades reales en cada acción con detalle de rationale + evidence.
 */
"use client";
import { useState } from 'react';

const PLAYBOOKS = {
  star: {
    label: 'Star', icon: '⭐', color: '#6366f1',
    mandate: 'ESCALAR',
    mandateDesc: 'Invertir agresivamente para mantener/aumentar participación en mercado en crecimiento',
    plays: [
      { icon: '🚀', title: 'Expand agresivamente', desc: 'Aumentar capacidad antes que los rivales consoliden posición' },
      { icon: '🛡️', title: 'Defender participación', desc: 'Responder inmediatamente a movimientos competitivos — no ceder terreno' },
      { icon: '💡', title: 'Innovar continuamente', desc: 'El mercado crece — pero también atrae nuevos entrantes. Innovar es la defensa' },
      { icon: '🤝', title: 'Alianzas estratégicas', desc: 'Acelerar escala mediante partnerships antes que la ventana de crecimiento se cierre' },
    ],
    framework: 'Christensen (Innovator\'s Dilemma) — En mercados de alto crecimiento, la inercia es el mayor riesgo',
    urgency: 'ALTA — La ventana de liderazgo es finita',
    cashFlow: 'CONSUME (reinversión agresiva)',
    cfColor: '#f59e0b',
  },
  cow: {
    label: 'Cash Cow', icon: '🐄', color: '#10b981',
    mandate: 'OPTIMIZAR',
    mandateDesc: 'Maximizar generación de caja libre para financiar el portafolio — sin sobreinvertir',
    plays: [
      { icon: '⚙️', title: 'Eficiencia operacional', desc: 'Reducir costos sin erosionar la posición de mercado consolidada' },
      { icon: '💰', title: 'Maximizar caja libre', desc: 'Cada dólar no reinvertido aquí financia el crecimiento en otros cuadrantes' },
      { icon: '🔒', title: 'Proteger cuota', desc: 'Mercado maduro — no perder participación ante rivales que buscan tus clientes' },
      { icon: '📊', title: 'Monitorear señales de decay', desc: 'Identificar cuándo el mercado comienza a contraerse para planificar la salida' },
    ],
    framework: 'Porter (Cost Leadership) — La Cash Cow es el activo más valioso del portafolio y debe protegerse',
    urgency: 'MEDIA — Sostenibilidad a largo plazo, no urgencia inmediata',
    cashFlow: 'GENERA (fuente principal)',
    cfColor: '#10b981',
  },
  question: {
    label: 'Question Mark', icon: '❓', color: '#f59e0b',
    mandate: 'DECIDIR',
    mandateDesc: 'La peor decisión es no decidir. Hay que invertir masivamente o desinvertir — no mantenerse en el medio',
    plays: [
      { icon: '🔍', title: 'Análisis de viabilidad urgente', desc: '¿Puede esta unidad convertirse en Star? Definir el criterio de decisión en 90 días' },
      { icon: '💣', title: 'Inversión masiva o salida', desc: 'La posición ambigua destruye capital. Hay que elegir una dirección clara' },
      { icon: '🎯', title: 'Definir nicho defensible', desc: 'Si no se puede liderar el mercado total, ¿existe un segmento donde sí se puede?' },
      { icon: '⏱️', title: 'Time-box la apuesta', desc: 'Establecer un horizonte de decisión — no sostener indefinidamente sin evidencia' },
    ],
    framework: 'Real Options Theory — El Question Mark tiene opcionalidad valiosa pero que caduca. Actuar antes de que expire',
    urgency: 'CRÍTICA — La ambigüedad destruye más valor que una mala decisión informada',
    cashFlow: 'ABSORBE (inversión sin retorno inmediato)',
    cfColor: '#ff4d6a',
  },
  dog: {
    label: 'Dog', icon: '🐕', color: '#ff4d6a',
    mandate: 'LIBERAR',
    mandateDesc: 'Desinvertir, nichar o dejar morir. El capital atrapado aquí financia el futuro en otra parte',
    plays: [
      { icon: '🏃', title: 'Desinversión ordenada', desc: 'Vender o cerrar antes de que el deterioro erosione el valor de salida' },
      { icon: '🎯', title: 'Nicho defensible', desc: '¿Existe un segmento donde la unidad es rentable? Focalizar ahí o salir' },
      { icon: '🔄', title: 'Reconfigurar assets', desc: 'Los activos físicos/intangibles pueden tener valor en otra unidad del portafolio' },
      { icon: '⛔', title: 'No sobreinvertir', desc: 'La trampa del Dog es seguir invirtiendo esperando recuperación que raramente ocurre' },
    ],
    framework: 'Portfolio Theory (Markowitz) — Mantener un Dog por razones emocionales destruye el retorno total del portafolio',
    urgency: 'ALTA — Cada período de inacción destruye valor que podría financiar Stars',
    cashFlow: 'NEUTRO/NEGATIVO (consume sin retorno)',
    cfColor: '#ff4d6a',
  },
};

export default function BcgStrategyBridge({ units = [] }) {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  if (!units.length) return null;

  const byQ = { star: [], cow: [], question: [], dog: [] };
  units.forEach(u => { if (byQ[u.quadrant]) byQ[u.quadrant].push(u); });

  const sel = selected ? units.find(u => u.name === selected) : null;

  const totalUnits = units.length;
  const actionCounts = {
    ESCALAR: byQ.star.length,
    OPTIMIZAR: byQ.cow.length,
    DECIDIR: byQ.question.length,
    LIBERAR: byQ.dog.length,
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔗</div>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>BCG → Strategy Action Bridge</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
            BCG sin acción es diagnóstico sin prescripción · Cada cuadrante genera un playbook doctrinal específico
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          <button onClick={() => setFilter('all')} style={{ padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.65rem', cursor: 'pointer', border: `1px solid ${filter === 'all' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'}`, background: filter === 'all' ? 'rgba(255,255,255,0.07)' : 'transparent', color: filter === 'all' ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>Todos</button>
          {['star','cow','question','dog'].map(q => (
            <button key={q} onClick={() => setFilter(q)} style={{ padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.65rem', cursor: 'pointer', border: `1px solid ${filter === q ? PLAYBOOKS[q].color + '66' : 'rgba(255,255,255,0.08)'}`, background: filter === q ? `${PLAYBOOKS[q].color}15` : 'transparent', color: filter === q ? PLAYBOOKS[q].color : 'var(--text-tertiary)' }}>
              {PLAYBOOKS[q].icon}
            </button>
          ))}
        </div>
      </div>

      {/* Action mandate banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
        {['star','cow','question','dog'].map(q => {
          const pb = PLAYBOOKS[q];
          const count = byQ[q].length;
          return (
            <div key={q} onClick={() => setFilter(filter === q ? 'all' : q)} style={{
              padding: '0.85rem 0.6rem', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
              background: filter === q ? `${pb.color}15` : `${pb.color}06`,
              border: `1px solid ${filter === q ? pb.color + '55' : pb.color + '22'}`,
              transition: 'all 0.2s', transform: filter === q ? 'translateY(-2px)' : 'none',
            }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.1rem' }}>{pb.icon}</div>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, color: pb.color, marginBottom: '0.15rem' }}>{pb.mandate}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: pb.color, lineHeight: 1 }}>{count}</div>
              <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>{pb.label}</div>
            </div>
          );
        })}
      </div>

      {/* Playbooks */}
      {['star','cow','question','dog'].map(q => {
        const pb = PLAYBOOKS[q];
        const items = byQ[q];
        if (!items.length) return null;
        if (filter !== 'all' && filter !== q) return null;
        return (
          <div key={q} className="glass-panel" style={{ padding: '1.25rem', borderLeft: `4px solid ${pb.color}` }}>
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.2rem' }}>{pb.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: pb.color }}>{pb.label}</span>
                  <span style={{ fontSize: '0.6rem', padding: '0.15rem 0.4rem', borderRadius: 4, background: `${pb.color}20`, color: pb.color, fontWeight: 700 }}>→ {pb.mandate}</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>({items.length} unidad{items.length !== 1 ? 'es' : ''})</span>
                </div>
                <div style={{ fontSize: '0.67rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>{pb.mandateDesc}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '0.58rem', color: pb.cfColor, fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: 4, background: `${pb.cfColor}12`, border: `1px solid ${pb.cfColor}30` }}>{pb.cashFlow}</div>
              </div>
            </div>

            {/* 3-column: Units | Plays | Framework */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 24px 1fr 24px 1fr', gap: '0.5rem', alignItems: 'start', marginBottom: '0.75rem' }}>
              {/* Units */}
              <div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Unidades</div>
                {items.map((u, i) => (
                  <div key={i} onClick={() => setSelected(selected === u.name ? null : u.name)} style={{
                    padding: '0.4rem 0.5rem', borderRadius: 7, marginBottom: '0.25rem', cursor: 'pointer',
                    background: selected === u.name ? `${pb.color}18` : `${pb.color}08`,
                    border: `1px solid ${selected === u.name ? pb.color + '55' : pb.color + '20'}`,
                    transition: 'all 0.15s',
                  }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>
                      ↑{(u.growth * 100).toFixed(0)}% · ◆{(u.share * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: pb.color, fontSize: '1rem' }}>→</div>

              {/* Plays */}
              <div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Playbook</div>
                {pb.plays.slice(0, 3).map((play, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.3rem', padding: '0.35rem 0.5rem', borderRadius: 7, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '0.75rem', flexShrink: 0 }}>{play.icon}</span>
                    <div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: pb.color }}>{play.title}</div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', lineHeight: 1.3 }}>{play.desc.slice(0, 55)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: pb.color, fontSize: '1rem' }}>→</div>

              {/* Framework + urgency */}
              <div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Marco Doctrinal</div>
                <div style={{ padding: '0.5rem', borderRadius: 8, background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '0.4rem' }}>
                  <div style={{ fontSize: '0.67rem', color: '#6366f1', lineHeight: 1.4 }}>📘 {pb.framework}</div>
                </div>
                <div style={{ padding: '0.4rem 0.55rem', borderRadius: 7, background: `${pb.color}08`, border: `1px solid ${pb.color}25` }}>
                  <div style={{ fontSize: '0.58rem', color: 'var(--text-tertiary)', marginBottom: '0.1rem' }}>Urgencia</div>
                  <div style={{ fontSize: '0.68rem', color: pb.color, fontWeight: 700 }}>{pb.urgency}</div>
                </div>
              </div>
            </div>

            {/* Selected unit recommendation */}
            {selected && items.find(u => u.name === selected) && (() => {
              const selU = items.find(u => u.name === selected);
              return (
                <div style={{ padding: '0.75rem', borderRadius: 9, background: `${pb.color}08`, border: `1px solid ${pb.color}33`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.65rem', color: pb.color, fontWeight: 700, marginBottom: '0.2rem' }}>📋 Análisis IA: "{selU.name}"</div>
                    {selU.rationale && <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.25rem' }}>{selU.rationale}</div>}
                    {selU.strategic_action && <div style={{ fontSize: '0.7rem', color: pb.color, fontWeight: 600 }}>🎯 {selU.strategic_action}</div>}
                  </div>
                  <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', flexShrink: 0 }}>✕</button>
                </div>
              );
            })()}
          </div>
        );
      })}

      <div style={{ padding: '0.65rem 1rem', borderRadius: 8, fontSize: '0.65rem', color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
        🏛️ <strong style={{ color: 'var(--text-secondary)' }}>BCG → StaaS Engine</strong> — Henderson (1970) · Christensen · Porter Cost Leadership · Real Options Theory · Markowitz Portfolio Theory
      </div>
    </div>
  );
}
