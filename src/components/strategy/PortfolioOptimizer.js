'use client';
import { useState } from 'react';
import { CATEGORY_META } from './DecisionTable';

/**
 * PortfolioOptimizer — Portfolio optimization controls + scenario simulation
 * Extracted from strategy/page.js (Phase 1: Frontend Decomposition)
 */
export default function PortfolioOptimizer({
  planId, optimizerResult, scenarioResult, onOptimize, onSimulate, onRejectDiscarded,
  isOptimizing, isSimulating,
}) {
  const [budgetConstraint, setBudgetConstraint] = useState('');
  const [peopleConstraint, setPeopleConstraint] = useState('');

  const handleOptimize = async () => {
    const constraints = {};
    if (budgetConstraint) constraints.max_budget = parseFloat(budgetConstraint);
    if (peopleConstraint) constraints.max_people = parseInt(peopleConstraint);
    onOptimize(constraints);
  };

  return (
    <div className="animate-fade-in">
      {/* Constraint Inputs + Action */}
      <div className="glass-panel" style={{padding:'1.5rem', marginBottom:'1.5rem', borderLeft:'4px solid #f59e0b'}}>
        <div style={{display:'flex', alignItems:'center', gap:'1.5rem', flexWrap:'wrap'}}>
          <div style={{fontWeight:700, fontSize:'1.1rem'}}>🎯 Portfolio Optimizer</div>
          <div style={{display:'flex', gap:'1rem', alignItems:'center', fontSize:'0.85rem'}}>
            <label style={{display:'flex', alignItems:'center', gap:'0.25rem'}}>
              💰 Budget Max (M):
              <input type="number" value={budgetConstraint} onChange={e => setBudgetConstraint(e.target.value)}
                placeholder="auto" style={{width:70, padding:'0.3rem 0.5rem', borderRadius:4, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.05)', color:'var(--text-primary)', fontSize:'0.85rem'}} />
            </label>
            <label style={{display:'flex', alignItems:'center', gap:'0.25rem'}}>
              👥 Personas Max:
              <input type="number" value={peopleConstraint} onChange={e => setPeopleConstraint(e.target.value)}
                placeholder="auto" style={{width:60, padding:'0.3rem 0.5rem', borderRadius:4, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.05)', color:'var(--text-primary)', fontSize:'0.85rem'}} />
            </label>
          </div>
          <div style={{display:'flex', gap:'0.5rem', marginLeft:'auto'}}>
            <button onClick={handleOptimize} disabled={isOptimizing} className="btn btn-primary" style={{fontSize:'0.85rem', opacity:isOptimizing?0.5:1}}>
              {isOptimizing ? '⏳ Optimizando...' : '🎯 Optimizar Portafolio'}
            </button>
            <button onClick={onSimulate} disabled={isSimulating} className="btn" style={{fontSize:'0.85rem', opacity:isSimulating?0.5:1}}>
              {isSimulating ? '⏳...' : '📊 Simular Escenarios'}
            </button>
          </div>
        </div>
      </div>

      {/* Optimizer Results */}
      {optimizerResult && (
        <>
          {/* Metrics Banner */}
          <div className="glass-panel" style={{padding:'1rem 1.5rem', marginBottom:'1.5rem', display:'flex', gap:'2rem', alignItems:'center', flexWrap:'wrap', borderLeft:'4px solid var(--success-color)'}}>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'1.5rem', fontWeight:700, color:'var(--success-color)'}}>{optimizerResult.metrics?.total_esv}</div>
              <div style={{fontSize:'0.7rem', color:'var(--text-secondary)'}}>ESV Total</div>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'1.3rem', fontWeight:700}}>{optimizerResult.metrics?.total_budget}M</div>
              <div style={{fontSize:'0.7rem', color:'var(--text-secondary)'}}>Budget ({(optimizerResult.metrics?.budget_utilization * 100).toFixed(0)}%)</div>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'1.3rem', fontWeight:700}}>{optimizerResult.metrics?.total_people}</div>
              <div style={{fontSize:'0.7rem', color:'var(--text-secondary)'}}>Personas ({(optimizerResult.metrics?.people_utilization * 100).toFixed(0)}%)</div>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'1.3rem', fontWeight:700}}>{optimizerResult.metrics?.max_duration_months}m</div>
              <div style={{fontSize:'0.7rem', color:'var(--text-secondary)'}}>Duración</div>
            </div>
            <div style={{textAlign:'center', fontSize:'0.8rem', color:'var(--text-secondary)', marginLeft:'auto'}}>
              <div>💰 Holgura: <strong>{optimizerResult.headroom?.budget_remaining}M</strong></div>
              <div>👥 Holgura: <strong>{optimizerResult.headroom?.people_remaining}</strong></div>
            </div>
          </div>

          {/* Utilization Bars */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.5rem'}}>
            <div className="glass-panel" style={{padding:'1rem'}}>
              <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', marginBottom:'0.5rem'}}>💰 Utilización Budget (max: {optimizerResult.constraints_used?.max_budget}M)</div>
              <div style={{height:8, background:'rgba(255,255,255,0.08)', borderRadius:4, overflow:'hidden'}}>
                <div style={{height:'100%', width:`${Math.min(optimizerResult.metrics?.budget_utilization * 100, 100)}%`, background: optimizerResult.metrics?.budget_utilization > 0.9 ? '#ef4444' : '#10b981', borderRadius:4, transition:'width 0.5s'}} />
              </div>
            </div>
            <div className="glass-panel" style={{padding:'1rem'}}>
              <div style={{fontSize:'0.8rem', color:'var(--text-secondary)', marginBottom:'0.5rem'}}>👥 Utilización Personas (max: {optimizerResult.constraints_used?.max_people})</div>
              <div style={{height:8, background:'rgba(255,255,255,0.08)', borderRadius:4, overflow:'hidden'}}>
                <div style={{height:'100%', width:`${Math.min(optimizerResult.metrics?.people_utilization * 100, 100)}%`, background: optimizerResult.metrics?.people_utilization > 0.9 ? '#ef4444' : '#3b82f6', borderRadius:4, transition:'width 0.5s'}} />
              </div>
            </div>
          </div>

          {/* Selected Decisions */}
          <h3 style={{marginBottom:'0.75rem', fontSize:'1rem', color:'var(--success-color)'}}>✅ Portafolio Óptimo ({optimizerResult.optimal_portfolio?.length})</h3>
          {optimizerResult.optimal_portfolio?.map((d) => {
            const cat = CATEGORY_META[d.category] || CATEGORY_META.growth;
            return (
              <div key={d.id} className="glass-panel" style={{padding:'1rem', marginBottom:'0.5rem', borderLeft:`4px solid ${cat.color}`, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
                  <span style={{fontSize:'1.2rem', fontWeight:700, color:'var(--text-secondary)'}}>#{d.priority_rank}</span>
                  <span>{cat.icon} {d.title}</span>
                </div>
                <div style={{display:'flex', gap:'1.5rem', fontSize:'0.85rem', color:'var(--text-secondary)'}}>
                  <span>ESV: <strong style={{color:'var(--success-color)'}}>{d.esv}</strong></span>
                  <span>💰 {d.estimated_budget}M</span>
                  <span>👥 {d.estimated_team}</span>
                  <span>📅 {d.estimated_months}m</span>
                </div>
              </div>
            );
          })}

          {/* Rejected Decisions */}
          {optimizerResult.rejected?.length > 0 && (
            <>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'1.5rem', marginBottom:'0.75rem'}}>
                <h3 style={{fontSize:'1rem', color:'var(--danger-color)'}}>❌ Descartadas ({optimizerResult.rejected?.length})</h3>
                <button onClick={onRejectDiscarded} className="btn" style={{fontSize:'0.75rem', padding:'0.4rem 0.75rem', border:'1px solid var(--danger-color)', color:'var(--danger-color)'}}>
                  🗑️ Rechazar Descartadas
                </button>
              </div>
              {optimizerResult.rejected?.map((d) => (
                <div key={d.id} className="glass-panel" style={{padding:'0.75rem 1rem', marginBottom:'0.5rem', borderLeft:'4px solid var(--danger-color)', opacity:0.7, display:'flex', justifyContent:'space-between'}}>
                  <span>{d.title}</span>
                  <span style={{fontSize:'0.85rem', color:'var(--text-secondary)'}}>ESV: {d.esv} | 💰 {d.estimated_budget}M | 👥 {d.estimated_team}</span>
                </div>
              ))}
            </>
          )}
        </>
      )}

      {/* Scenario Results */}
      {scenarioResult && (
        <div style={{marginTop:'2rem'}}>
          <h3 style={{marginBottom:'1rem', fontSize:'1rem'}}>📊 Análisis de Escenarios (Determinístico)</h3>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'1rem'}}>
            {scenarioResult.scenarios?.map((s, i) => {
              const colors = ['#10b981', '#3b82f6', '#ef4444'];
              return (
                <div key={i} className="glass-panel" style={{padding:'1.25rem', borderTop:`3px solid ${colors[i]}`}}>
                  <div style={{fontSize:'1rem', fontWeight:700, color:colors[i], marginBottom:'0.75rem'}}>{s.scenario}</div>
                  <div style={{display:'flex', gap:'1.5rem', marginBottom:'1rem'}}>
                    <div>
                      <div style={{fontSize:'1.3rem', fontWeight:700}}>{s.total_esv}</div>
                      <div style={{fontSize:'0.7rem', color:'var(--text-secondary)'}}>ESV Total</div>
                    </div>
                    <div>
                      <div style={{fontSize:'1.3rem', fontWeight:700, color:'var(--danger-color)'}}>{s.total_risk_exposure?.toFixed(1)}M</div>
                      <div style={{fontSize:'0.7rem', color:'var(--text-secondary)'}}>Riesgo Total</div>
                    </div>
                  </div>
                  {s.decisions?.map((d, j) => (
                    <div key={j} style={{fontSize:'0.8rem', display:'flex', justifyContent:'space-between', padding:'0.25rem 0', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                      <span style={{maxWidth:'60%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{d.title}</span>
                      <span style={{color: d.esv >= d.original_esv ? '#10b981' : '#ef4444'}}>{d.esv}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!optimizerResult && !scenarioResult && (
        <div className="glass-panel" style={{padding:'3rem', textAlign:'center'}}>
          <div style={{fontSize:'3rem', marginBottom:'1rem'}}>🎯</div>
          <h3 style={{marginBottom:'0.5rem'}}>Portfolio Optimizer</h3>
          <p style={{color:'var(--text-secondary)', maxWidth:500, margin:'0 auto 1rem', fontSize:'0.9rem'}}>
            Selecciona el subconjunto óptimo de decisiones que maximiza el ESV total bajo tus restricciones de presupuesto y equipo.
          </p>
          <p style={{color:'var(--text-secondary)', fontSize:'0.8rem'}}>Define restricciones arriba y presiona Optimizar.</p>
        </div>
      )}
    </div>
  );
}
