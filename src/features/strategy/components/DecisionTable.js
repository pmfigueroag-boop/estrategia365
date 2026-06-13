'use client';

/**
 * DecisionTable — Strategic decisions list with ESV, scores, and actions
 * Extracted from strategy/page.js (Phase 1: Frontend Decomposition)
 */

const CATEGORY_META = {
  growth: { icon: '🚀', label: 'Crecimiento', color: '#10b981' },
  defense: { icon: '🛡️', label: 'Defensa', color: '#f59e0b' },
  transformation: { icon: '🔄', label: 'Transformación', color: '#8b5cf6' },
  efficiency: { icon: '⚡', label: 'Eficiencia', color: '#3b82f6' },
  capability: { icon: '🧠', label: 'Capacidad', color: '#ec4899' },
};

const HORIZON_LABEL = { short: '0-6 meses', medium: '6-18 meses', long: '18+ meses' };
const STATUS_FLOW = ['proposed', 'approved', 'executing', 'completed'];
const STATUS_LABEL = { proposed: '📋 Propuesta', approved: '✅ Aprobada', executing: '⚙️ Ejecutando', completed: '🏁 Completada', rejected: '❌ Rechazada' };

export default function DecisionTable({
  decisions = [], kernel, onStatusChange, onDeploy, deployingId,
}) {
  return (
    <div className="animate-fade-in">
      {/* Resource Summary Banner */}
      {kernel?.resource_summary && (
        <div className="glass-panel" style={{padding:'1rem 1.5rem', marginBottom:'1.5rem', display:'flex', gap:'2rem', alignItems:'center', borderLeft:'4px solid var(--accent-primary)'}}>
          <div style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>
            <div style={{fontSize:'1.1rem', fontWeight:700, color:'var(--text-primary)'}}>📊 Portafolio Estratégico</div>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:'1.2rem', fontWeight:700, color:'var(--accent-primary)'}}>{kernel.resource_summary.total_budget_required?.toFixed(1)}M</div>
            <div style={{fontSize:'0.7rem', color:'var(--text-secondary)'}}>Budget Total</div>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:'1.2rem', fontWeight:700, color:'var(--info-color)'}}>{kernel.resource_summary.total_people_required}</div>
            <div style={{fontSize:'0.7rem', color:'var(--text-secondary)'}}>Personas</div>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:'1.2rem', fontWeight:700, color:'var(--success-color)'}}>{kernel.resource_summary.avg_esv?.toFixed(2)}</div>
            <div style={{fontSize:'0.7rem', color:'var(--text-secondary)'}}>ESV Promedio</div>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:'1.2rem', fontWeight:700}}>{kernel.resource_summary.decision_count}</div>
            <div style={{fontSize:'0.7rem', color:'var(--text-secondary)'}}>Decisiones</div>
          </div>
        </div>
      )}

      {/* Decision Cards */}
      {decisions.map((d) => {
        const cat = CATEGORY_META[d.category] || CATEGORY_META.growth;
        return (
          <div key={d.id} className="glass-panel" style={{padding:'1.5rem', marginBottom:'1rem', borderLeft:`4px solid ${cat.color}`}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.75rem'}}>
              <div style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
                <span style={{fontSize:'1.5rem', fontWeight:700, color:'var(--text-secondary)'}}>#{d.priority_rank}</span>
                <div>
                  <h3 style={{fontSize:'1.05rem', marginBottom:'0.25rem'}}>{cat.icon} {d.title}</h3>
                  <div style={{display:'flex', gap:'0.75rem', fontSize:'0.75rem'}}>
                    <span style={{padding:'0.15rem 0.5rem', borderRadius:4, background:`${cat.color}22`, color:cat.color}}>{cat.label}</span>
                    <span style={{color:'var(--text-secondary)'}}>{HORIZON_LABEL[d.time_horizon] || d.time_horizon}</span>
                    <span style={{padding:'0.15rem 0.5rem', borderRadius:4, background:'rgba(255,255,255,0.06)'}}>{STATUS_LABEL[d.status]}</span>
                  </div>
                </div>
              </div>
              <div style={{textAlign:'right', minWidth:130, padding:'0.5rem', background:'rgba(0,0,0,0.2)', borderRadius:8, border:'1px solid rgba(255,255,255,0.05)'}}>
                <div style={{fontSize:'0.65rem', color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'0.25rem'}}>Expected Value (ESV)</div>
                <div style={{fontSize:'1.8rem', fontWeight:800, color: d.esv > 0 ? 'var(--success-color)' : 'var(--danger-color)'}}>{d.esv?.toFixed(2)}</div>
                <div style={{fontSize:'0.65rem', color:'var(--text-secondary)', marginTop:'0.15rem'}}>comp: {d.composite_score?.toFixed(1)}</div>
              </div>
            </div>
            <p style={{fontSize:'0.95rem', marginBottom:'1rem', lineHeight:1.6}}>{d.description}</p>

            {/* Justification + Expected Outcome */}
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem'}}>
              <div style={{padding:'0.75rem', background:'rgba(255,255,255,0.03)', borderRadius:6}}>
                <span style={{fontSize:'0.75rem', fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase'}}>💡 Justificación Estratégica:</span>
                <p style={{fontSize:'0.85rem', marginTop:'0.4rem', color:'var(--text-primary)'}}>{d.justification}</p>
              </div>
              <div style={{padding:'0.75rem', background:'rgba(255,255,255,0.03)', borderRadius:6}}>
                <span style={{fontSize:'0.75rem', fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase'}}>🎯 Resultado Esperado:</span>
                <p style={{fontSize:'0.85rem', marginTop:'0.4rem', color:'var(--text-primary)'}}>{d.expected_outcome}</p>
              </div>
            </div>

            {/* Score Bars */}
            <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'1rem', marginBottom:'1rem'}}>
              {[
                { label: 'Impacto', value: d.impact_score, color: 'var(--success-color)' },
                { label: 'Factibilidad', value: d.feasibility_score, color: 'var(--accent-primary)' },
                { label: 'Riesgo', value: d.risk_score, color: 'var(--danger-color)' },
                { label: 'Alineación', value: d.alignment_score, color: 'var(--info-color)' }
              ].map(score => (
                <div key={score.label}>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.75rem', marginBottom:'0.25rem'}}>
                    <span style={{color:'var(--text-secondary)'}}>{score.label}</span>
                    <strong style={{color:score.color}}>{score.value}/10</strong>
                  </div>
                  <div style={{height:4, background:'rgba(255,255,255,0.1)', borderRadius:2, overflow:'hidden'}}>
                    <div style={{height:'100%', width:`${(score.value/10)*100}%`, background:score.color, borderRadius:2}}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Traceability */}
            <div style={{fontSize:'0.75rem', color:'var(--text-secondary)', borderTop:'1px dashed rgba(255,255,255,0.1)', paddingTop:'0.75rem', display:'flex', gap:'0.5rem', alignItems:'center'}}>
              <span>🔗 Trazabilidad Analítica:</span>
              <span style={{padding:'0.15rem 0.4rem', background:'rgba(255,255,255,0.05)', borderRadius:4}}>Basado en {kernel?.causal_chains_count || 3} heurísticas del modelo Causal V2.5</span>
              <span style={{padding:'0.15rem 0.4rem', background:'rgba(255,255,255,0.05)', borderRadius:4}}>Responde a brechas PESTEL/FODA</span>
            </div>

            {/* Resource Bar */}
            <div style={{display:'flex', gap:'1.5rem', fontSize:'0.8rem', color:'var(--text-secondary)', marginBottom:'0.75rem', padding:'0.5rem 0.75rem', background:'rgba(255,255,255,0.03)', borderRadius:6}}>
              <span>💰 <strong>{d.estimated_budget?.toFixed(1) || 0}M</strong></span>
              <span>👥 <strong>{d.estimated_team || 0}</strong> personas</span>
              <span>📅 <strong>{d.estimated_months || 0}</strong> meses</span>
              <span>📉 Downside: <strong style={{color:'var(--danger-color)'}}>{d.downside_exposure?.toFixed(1) || 0}M</strong></span>
            </div>

            {/* Status Actions */}
            <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}>
              {STATUS_FLOW.filter(s => s !== d.status).map(s => (
                <button key={s} onClick={() => onStatusChange(d.id, s)} className="btn" style={{fontSize:'0.75rem', padding:'0.35rem 0.75rem'}}>
                  {STATUS_LABEL[s]}
                </button>
              ))}
              {d.status !== 'completed' && d.status !== 'rejected' && (
                <button
                  onClick={() => onDeploy(d.id, d.title)}
                  disabled={deployingId === d.id}
                  className="btn btn-primary"
                  style={{fontSize:'0.75rem', padding:'0.35rem 0.75rem', marginLeft:'auto', opacity: deployingId === d.id ? 0.5 : 1}}
                >
                  {deployingId === d.id ? '⏳ Desplegando...' : '🚀 Desplegar como OKR'}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { CATEGORY_META, HORIZON_LABEL, STATUS_FLOW, STATUS_LABEL };
