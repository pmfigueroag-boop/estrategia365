'use client';

/**
 * StrategyPulse — Adaptive strategy loop: health gauges, drift alerts, adaptations, lessons
 * Extracted from strategy/page.js (Phase 1: Frontend Decomposition)
 */
export default function StrategyPulse({ pulseData, pulseHistory = [], onGenerate, isGenerating }) {
  if (!pulseData || Object.keys(pulseData).length === 0) {
    return (
      <div className="glass-panel" style={{padding:'3rem', textAlign:'center'}}>
        <div style={{fontSize:'3rem', marginBottom:'1rem'}}>💓</div>
        <h3 style={{marginBottom:'0.5rem'}}>Pulso Estratégico Adaptativo</h3>
        <p style={{color:'var(--text-secondary)', maxWidth:500, margin:'0 auto 1.5rem', fontSize:'0.9rem'}}>
          Evalúa la salud de la ejecución, detecta desviaciones estratégicas y recomienda adaptaciones.
          Implementa el loop: Sense → Analyze → Decide → Execute → Learn
        </p>
        <button onClick={onGenerate} disabled={isGenerating} className="btn btn-primary" style={{opacity:isGenerating?0.5:1}}>
          {isGenerating ? '⏳ Sensando estado estratégico...' : '💓 Generar Pulso Estratégico'}
        </button>
      </div>
    );
  }

  const typeColors = {pivot:'#ef4444', accelerate:'#10b981', pause:'#f59e0b', abandon:'#6b7280', reinforce:'#3b82f6'};
  const typeLabels = {pivot:'🔀 Pivotar', accelerate:'🚀 Acelerar', pause:'⏸️ Pausar', abandon:'❌ Abandonar', reinforce:'💪 Reforzar'};

  return (
    <>
      {/* Health Gauges */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'1rem', marginBottom:'1.5rem'}}>
        {[{label: 'Pulso General', val: pulseData.overall_pulse, icon: '💓'},
          {label: 'Salud Ejecución', val: pulseData.execution_health, icon: '⚙️'},
          {label: 'Alineación', val: pulseData.strategic_alignment, icon: '🎯'},
          {label: 'Adaptabilidad', val: pulseData.adaptability_score, icon: '🧠'}
        ].map((g, i) => {
          const color = g.val >= 70 ? 'var(--success-color)' : g.val >= 40 ? 'var(--warning-color)' : 'var(--danger-color)';
          return (
            <div key={i} className="glass-panel" style={{padding:'1.25rem', textAlign:'center'}}>
              <div style={{fontSize:'1.5rem'}}>{g.icon}</div>
              <div style={{fontSize:'2rem', fontWeight:700, color}}>{g.val?.toFixed(0)}%</div>
              <div style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>{g.label}</div>
              <div style={{height:4, background:'rgba(255,255,255,0.1)', borderRadius:2, marginTop:'0.5rem', overflow:'hidden'}}>
                <div style={{height:'100%', width:`${g.val}%`, background:color, borderRadius:2, transition:'width 0.5s ease'}} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Loop Phase + Brief */}
      <div style={{display:'grid', gridTemplateColumns:'auto 1fr', gap:'1rem', marginBottom:'1.5rem'}}>
        <div className="glass-panel" style={{padding:'1.25rem', textAlign:'center', minWidth:150}}>
          <div style={{fontSize:'0.75rem', color:'var(--text-secondary)', marginBottom:'0.5rem'}}>FASE DEL LOOP</div>
          <div style={{fontSize:'1.3rem', fontWeight:700, color:'var(--accent-primary)', textTransform:'uppercase'}}>{pulseData.phase}</div>
          <div style={{display:'flex', gap:'0.3rem', justifyContent:'center', marginTop:'0.75rem'}}>
            {['sense','analyze','decide','execute','learn'].map(p => (
              <div key={p} style={{width:8, height:8, borderRadius:'50%', background: p === pulseData.phase ? 'var(--accent-primary)' : 'rgba(255,255,255,0.15)'}} />
            ))}
          </div>
        </div>
        <div className="glass-panel" style={{padding:'1.25rem', borderLeft:'4px solid var(--accent-secondary)'}}>
          <div style={{fontSize:'0.8rem', color:'var(--accent-secondary)', fontWeight:600, marginBottom:'0.5rem'}}>📝 Resumen Ejecutivo</div>
          <p style={{fontSize:'0.95rem', lineHeight:1.7}}>{pulseData.executive_brief}</p>
        </div>
      </div>

      {/* Drift Alerts */}
      {pulseData.drift_alerts?.length > 0 && (
        <div style={{marginBottom:'1.5rem'}}>
          <h3 style={{marginBottom:'0.75rem'}}>🚨 Alertas de Desviación ({pulseData.drift_alerts.length})</h3>
          {pulseData.drift_alerts.map((d, i) => {
            const sevColor = d.severity === 'critical' ? 'var(--danger-color)' : d.severity === 'warning' ? 'var(--warning-color)' : 'var(--accent-primary)';
            return (
              <div key={i} className="glass-panel" style={{padding:'1rem', marginBottom:'0.5rem', borderLeft:`4px solid ${sevColor}`}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem'}}>
                  <strong style={{fontSize:'0.95rem'}}>{d.area}</strong>
                  <span style={{fontSize:'0.75rem', padding:'0.1rem 0.5rem', borderRadius:4, background:`${sevColor}22`, color:sevColor, fontWeight:600}}>{d.severity.toUpperCase()}</span>
                </div>
                <div style={{display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:'0.5rem', alignItems:'center', fontSize:'0.85rem', marginBottom:'0.5rem'}}>
                  <span style={{padding:'0.3rem', background:'rgba(59,130,246,0.08)', borderRadius:4}}>🎯 Esperado: {d.expected}</span>
                  <span>≠</span>
                  <span style={{padding:'0.3rem', background:'rgba(239,68,68,0.08)', borderRadius:4}}>📍 Real: {d.actual}</span>
                </div>
                <p style={{fontSize:'0.85rem', color:'var(--text-secondary)'}}>💡 {d.recommendation}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Adaptations */}
      {pulseData.adaptations?.length > 0 && (
        <div style={{marginBottom:'1.5rem'}}>
          <h3 style={{marginBottom:'0.75rem'}}>🔄 Adaptaciones Recomendadas ({pulseData.adaptations.length})</h3>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem'}}>
            {pulseData.adaptations.map((a, i) => {
              const tc = typeColors[a.type] || '#3b82f6';
              return (
                <div key={i} className="glass-panel" style={{padding:'1rem', borderLeft:`4px solid ${tc}`}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem'}}>
                    <h4 style={{fontSize:'0.95rem'}}>{a.title}</h4>
                    <div style={{display:'flex', gap:'0.5rem', fontSize:'0.7rem'}}>
                      <span style={{padding:'0.1rem 0.4rem', borderRadius:3, background:`${tc}22`, color:tc}}>{typeLabels[a.type] || a.type}</span>
                      <span style={{padding:'0.1rem 0.4rem', borderRadius:3, background:'rgba(255,255,255,0.06)'}}>{a.urgency}</span>
                    </div>
                  </div>
                  <p style={{fontSize:'0.85rem', color:'var(--text-secondary)'}}>{a.description}</p>
                  {a.linked_decision && <p style={{fontSize:'0.8rem', marginTop:'0.25rem'}}>🔗 {a.linked_decision}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lessons Learned */}
      {pulseData.lessons_learned?.length > 0 && (
        <div style={{marginBottom:'1.5rem'}}>
          <h3 style={{marginBottom:'0.75rem'}}>💡 Lecciones Aprendidas ({pulseData.lessons_learned.length})</h3>
          {pulseData.lessons_learned.map((l, i) => (
            <div key={i} className="glass-panel" style={{padding:'1rem', marginBottom:'0.5rem', borderLeft:'4px solid var(--accent-secondary)'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <p style={{fontSize:'0.9rem'}}>{l.insight}</p>
                <div style={{display:'flex', gap:'0.5rem', fontSize:'0.7rem', flexShrink:0, marginLeft:'1rem'}}>
                  <span style={{padding:'0.1rem 0.4rem', borderRadius:3, background:'rgba(139,92,246,0.15)', color:'var(--accent-secondary)'}}>{l.category}</span>
                  {l.actionable && <span style={{padding:'0.1rem 0.4rem', borderRadius:3, background:'rgba(16,185,129,0.15)', color:'var(--success-color)'}}>Accionable</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Regenerate + History */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <button onClick={onGenerate} disabled={isGenerating} className="btn btn-primary" style={{opacity:isGenerating?0.5:1}}>
          {isGenerating ? '⏳ Sensando...' : '💓 Nuevo Pulso'}
        </button>
        {pulseHistory.length > 1 && (
          <span style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>Historial: {pulseHistory.length} pulsos registrados</span>
        )}
      </div>
    </>
  );
}
