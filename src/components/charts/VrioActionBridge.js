/**
 * VrioActionBridge — VRIO → Strategic Action (Fase 1)
 * =====================================================
 * Cierra el loop: implicación VRIO → acción estratégica doctrinal.
 * Sankey visual: recurso → posición → acción → framework.
 * Sin scores. 100% basado en competitive_implication + recommendation.
 */
"use client";
import { useState } from 'react';

const IMPLICATIONS = {
  sustained_advantage: {
    label: 'Ventaja Sostenida', color: '#10b981', icon: '🏆',
    action: 'ESCALAR', actionDesc: 'Amplificar y defender agresivamente',
    playbook: [
      'Construir barreras adicionales alrededor del recurso',
      'Escalar inversión para aumentar el foso competitivo',
      'Convertir en pilar central de la propuesta de valor',
      'Documentar y proteger mediante IP / exclusividad',
    ],
    framework: 'Blue Ocean Strategy — Escala lo que ningún rival puede replicar',
    urgency: 'Alta — Capitalizar ahora antes de erosión',
  },
  unused_advantage: {
    label: 'Ventaja No Explotada', color: '#a855f7', icon: '🔓',
    action: 'REESTRUCTURAR', actionDesc: 'Reorganizar para explotar el potencial latente',
    playbook: [
      'Auditar por qué la organización no explota el recurso',
      'Reasignar responsabilidad ejecutiva directa',
      'Eliminar fricciones organizacionales que bloquean su uso',
      'Definir KPIs de explotación con accountability claro',
    ],
    framework: 'Dynamic Capabilities (Teece) — Las capacidades latentes son el mayor desperdicio estratégico',
    urgency: 'Crítica — Cada día sin explotar es ventaja regalada al mercado',
  },
  temporary_advantage: {
    label: 'Ventaja Temporal', color: '#6366f1', icon: '⏳',
    action: 'PROTEGER', actionDesc: 'Maximizar mientras dura y preparar sustituto',
    playbook: [
      'Estimar horizonte de imitabilidad (6-24 meses típico)',
      'Acelerar generación de valor antes de commoditización',
      'Invertir en el siguiente recurso difícil de imitar',
      'Monitorear señales de entrada de competidores',
    ],
    framework: 'Competitive Dynamics (Chen & Miller) — Las ventajas temporales son escalones hacia ventajas superiores',
    urgency: 'Media — Ventana de oportunidad con tiempo limitado',
  },
  parity: {
    label: 'Paridad Competitiva', color: '#f59e0b', icon: '⚖️',
    action: 'DESARROLLAR', actionDesc: 'Convertir el recurso en fuente de diferenciación',
    playbook: [
      'Identificar qué dimensión VRIO falta (usualmente R o I)',
      'Invertir en rareza: especialización, exclusividad, network effects',
      'Evaluar si eliminar o externalizar (liberar recursos)',
      'Benchmarking: ¿puede convertirse en ventaja en nicho específico?',
    ],
    framework: 'RBV (Barney) — La paridad no sostiene posición si los rivales la poseen igual',
    urgency: 'Baja — Mantener pero no invertir masivamente',
  },
  disadvantage: {
    label: 'Desventaja Competitiva', color: '#ff4d6a', icon: '⚠️',
    action: 'TRANSFORMAR', actionDesc: 'Eliminar, tercerizar o convertir el recurso',
    playbook: [
      'Evaluar si la debilidad es estructural o corregible',
      'Tercerizar si no es capacidad core de la organización',
      'Eliminar si consume recursos sin generar valor',
      'Transformar: ¿puede convertirse mediante alianza o adquisición?',
    ],
    framework: 'Portfolio Strategy — Eliminar capacidades que destruyen ventaja competitiva neta',
    urgency: 'Alta — Cada recurso sin valor consume posición competitiva',
  },
};

export default function VrioActionBridge({ resources = [] }) {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  if (!resources.length) return null;

  const grouped = {};
  Object.keys(IMPLICATIONS).forEach(k => { grouped[k] = []; });
  resources.forEach(r => {
    const key = r.competitive_implication || 'parity';
    if (grouped[key]) grouped[key].push(r);
  });

  const filtered = filter === 'all' ? resources : resources.filter(r => r.competitive_implication === filter);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔗</div>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>VRIO → Strategy Action Bridge</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', paddingLeft: '2.4rem' }}>
            VRIO sin acción no sirve · Cada posición competitiva genera un playbook doctrinal específico
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          <button onClick={() => setFilter('all')} style={{ padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.65rem', cursor: 'pointer', border: `1px solid ${filter === 'all' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'}`, background: filter === 'all' ? 'rgba(255,255,255,0.07)' : 'transparent', color: filter === 'all' ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>Todos</button>
          {Object.entries(IMPLICATIONS).map(([k, v]) => (
            <button key={k} onClick={() => setFilter(k)} style={{ padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.65rem', cursor: 'pointer', border: `1px solid ${filter === k ? v.color + '66' : 'rgba(255,255,255,0.08)'}`, background: filter === k ? `${v.color}15` : 'transparent', color: filter === k ? v.color : 'var(--text-tertiary)' }}>
              {v.icon}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
        {Object.entries(IMPLICATIONS).map(([k, impl]) => {
          const count = grouped[k]?.length || 0;
          return (
            <div key={k} onClick={() => setFilter(filter === k ? 'all' : k)} style={{
              padding: '0.75rem 0.5rem', borderRadius: 10, textAlign: 'center', cursor: 'pointer',
              background: filter === k ? `${impl.color}15` : `${impl.color}08`,
              border: `1px solid ${filter === k ? impl.color + '55' : impl.color + '22'}`,
              transition: 'all 0.2s',
            }}>
              <div style={{ fontSize: '1rem', marginBottom: '0.1rem' }}>{impl.icon}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: impl.color, lineHeight: 1 }}>{count}</div>
              <div style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)', marginTop: '0.15rem', lineHeight: 1.2 }}>{impl.action}</div>
            </div>
          );
        })}
      </div>

      {/* Action flows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {Object.entries(IMPLICATIONS).map(([implKey, impl]) => {
          const items = grouped[implKey] || [];
          if (!items.length) return null;
          if (filter !== 'all' && filter !== implKey) return null;
          return (
            <div key={implKey} className="glass-panel" style={{ padding: '1.25rem', borderLeft: `4px solid ${impl.color}` }}>
              {/* Section header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{impl.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: impl.color }}>{impl.label}</span>
                    <span style={{ fontSize: '0.6rem', padding: '0.15rem 0.4rem', borderRadius: 4, background: `${impl.color}20`, color: impl.color, fontWeight: 700 }}>→ {impl.action}</span>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>({items.length} recurso{items.length !== 1 ? 's' : ''})</span>
                  </div>
                  <div style={{ fontSize: '0.67rem', color: 'var(--text-tertiary)' }}>{impl.actionDesc}</div>
                </div>
              </div>

              {/* Three-column flow */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px 1fr 20px 1fr', gap: '0.5rem', alignItems: 'start', marginBottom: '1rem' }}>
                {/* Resources */}
                <div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Recursos</div>
                  {items.map((r, i) => (
                    <div key={i} onClick={() => setSelected(selected === (r.id || r.resource_name) ? null : (r.id || r.resource_name))} style={{
                      padding: '0.4rem 0.6rem', borderRadius: 7, marginBottom: '0.25rem', cursor: 'pointer',
                      background: selected === (r.id || r.resource_name) ? `${impl.color}18` : `${impl.color}08`,
                      border: `1px solid ${selected === (r.id || r.resource_name) ? impl.color + '55' : impl.color + '20'}`,
                      transition: 'all 0.15s',
                    }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)' }}>{r.resource_name}</div>
                      <div style={{ display: 'flex', gap: '3px', marginTop: '0.2rem' }}>
                        {[r.valuable, r.rare, r.costly_to_imitate, r.organized].map((v, j) => (
                          <div key={j} style={{ width: 8, height: 8, borderRadius: 2, background: v ? ['#10b981','#6366f1','#f59e0b','#a855f7'][j] : 'rgba(255,77,106,0.3)' }} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: impl.color, fontSize: '1rem' }}>→</div>

                {/* Playbook */}
                <div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Playbook</div>
                  {impl.playbook.slice(0, 3).map((play, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.3rem', padding: '0.35rem 0.5rem', borderRadius: 7, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize: '0.65rem', color: impl.color, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                      <span style={{ fontSize: '0.67rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{play}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: impl.color, fontSize: '1rem' }}>→</div>

                {/* Framework + urgency */}
                <div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Marco Doctrinal</div>
                  <div style={{ padding: '0.6rem', borderRadius: 8, background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '0.4rem' }}>
                    <div style={{ fontSize: '0.68rem', color: '#6366f1', lineHeight: 1.4 }}>📘 {impl.framework}</div>
                  </div>
                  <div style={{ padding: '0.45rem 0.6rem', borderRadius: 7, background: `${impl.color}08`, border: `1px solid ${impl.color}25` }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginBottom: '0.1rem' }}>Urgencia</div>
                    <div style={{ fontSize: '0.68rem', color: impl.color, fontWeight: 700 }}>{impl.urgency}</div>
                  </div>
                </div>
              </div>

              {/* Selected resource recommendation */}
              {selected && items.find(r => (r.id || r.resource_name) === selected) && (() => {
                const selR = items.find(r => (r.id || r.resource_name) === selected);
                return (
                  <div style={{ padding: '0.75rem', borderRadius: 9, background: `${impl.color}08`, border: `1px solid ${impl.color}33`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: impl.color, fontWeight: 700, marginBottom: '0.2rem' }}>📋 Recomendación IA para "{selR.resource_name}"</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{selR.recommendation}</div>
                    </div>
                    <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', flexShrink: 0 }}>✕</button>
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>

      <div style={{ padding: '0.65rem 1rem', borderRadius: 8, fontSize: '0.65rem', color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
        🏛️ <strong style={{ color: 'var(--text-secondary)' }}>VRIO→Strategy StaaS Engine</strong> — Barney (1991) · Teece Dynamic Capabilities · Chen & Miller Competitive Dynamics · Porter RBV
      </div>
    </div>
  );
}
