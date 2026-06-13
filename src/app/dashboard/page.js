"use client";
import { useToast } from '@/features/plan/context/ToastContext';
import { usePlanContext } from '@/features/plan/context/PlanContext';
import { useState } from 'react';
import { useDashboard } from '@/lib/swr-hooks';
import api from '@/lib/api';
import { ObjectivesPie, PestelSeverityBar } from '@/features/charts/components';

function MonteCarloPanel({ planId }) {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const runSimulation = async () => {
    setIsLoading(true);
    try {
      const result = await api.runMonteCarlo(planId, 1000);
      setData(result);
      toast.success("Simulación Monte Carlo completada (1000 iteraciones).");
    } catch (e) {
      toast.error(e.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="glass-panel" style={{padding:'1.25rem', borderLeft:'4px solid var(--accent-secondary)'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
        <h3 style={{fontSize:'1rem'}}>🎲 Riesgo Estocástico (Monte Carlo)</h3>
        <button onClick={runSimulation} disabled={isLoading} className="btn btn-primary" style={{fontSize:'0.75rem', padding:'0.4rem 0.75rem'}}>
          {isLoading ? 'Simulando...' : 'Ejecutar Simulación'}
        </button>
      </div>
      {!data ? (
        <p style={{fontSize:'0.85rem', color:'var(--text-secondary)'}}>Ejecuta el simulador para proyectar la varianza y el Value-at-Risk (VaR_95) del portafolio estratégico.</p>
      ) : (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
          <div>
            <p style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>Retorno Esperado (ESV)</p>
            <p style={{fontSize:'1.5rem', fontWeight:700, color:'var(--success-color)'}}>{data.portfolio.mean}</p>
          </div>
          <div>
            <p style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>Value-at-Risk (95%)</p>
            <p style={{fontSize:'1.5rem', fontWeight:700, color:'var(--danger-color)'}}>{data.portfolio.VaR_95}</p>
          </div>
          <div style={{gridColumn:'1 / -1'}}>
            <p style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>Varianza (Desviación Std): {data.portfolio.std}</p>
            <p style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>Clasificación: <strong style={{color: data.risk_assessment === 'HIGH_VARIANCE' ? 'var(--danger-color)' : 'var(--warning-color)'}}>{data.risk_assessment}</strong></p>
          </div>
        </div>
      )}
    </div>
  );
}

function BayesianPanel({ planId, initialConfidence }) {
  const toast = useToast();
  const [confidence, setConfidence] = useState(initialConfidence);
  const [isLoading, setIsLoading] = useState(false);

  const runUpdate = async () => {
    setIsLoading(true);
    try {
      const result = await api.runBayesianUpdate(planId);
      setConfidence(result.new_confidence);
      toast.success(`Confianza recalibrada por empirismo: ${(result.new_confidence * 100).toFixed(0)}%`);
    } catch (e) {
      toast.error(e.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="glass-panel" style={{padding:'1.25rem', borderLeft:'4px solid var(--accent-primary)'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
        <h3 style={{fontSize:'1rem'}}>📈 Actualización Bayesiana</h3>
        <button onClick={runUpdate} disabled={isLoading} className="btn" style={{fontSize:'0.75rem', padding:'0.4rem 0.75rem', background:'rgba(255,255,255,0.1)', border:'1px solid var(--surface-border)'}}>
          {isLoading ? 'Recalibrando...' : 'Recalibrar con Evidencia'}
        </button>
      </div>
      <div style={{textAlign:'center', marginTop:'1rem'}}>
        <p style={{fontSize:'0.8rem', color:'var(--text-secondary)', marginBottom:'0.5rem'}}>Confianza Empírica del Kernel</p>
        <p style={{fontSize:'2rem', fontWeight:800}} className="text-gradient">
          {(confidence * 100).toFixed(0)}%
        </p>
        <p style={{fontSize:'0.8rem', color:'var(--text-secondary)', marginTop:'0.5rem'}}>
          El prior de la IA se ajusta según la probabilidad condicional de la ejecución (OKRs).
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const toast = useToast();
  const { planId } = usePlanContext();

  // SWR with auto-refresh every 30s for live dashboard
  const { data: dashboard, isLoading } = useDashboard(planId);

  if (!planId) return (
    <div className="animate-fade-in glass-panel empty-state">No hay un plan activo. Ve a <a href="/formulation" className="text-gradient" style={{fontWeight:600}}>Formulación</a>.</div>
  );
  if (isLoading) return <div className="animate-fade-in glass-panel empty-state">Cargando dashboard...</div>;
  if (!dashboard) return <div className="animate-fade-in glass-panel empty-state">Error cargando el dashboard.</div>;

  const d = dashboard;
  const pulseColor = (v) => v >= 70 ? 'var(--success-color)' : v >= 40 ? 'var(--warning-color)' : 'var(--danger-color)';

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Command Center</h1>
        <p className="page-subtitle">Dashboard Ejecutivo — Vista 360° del Plan Estratégico <span className="plan-badge">(Plan #{d.plan_id})</span></p>
      </div>

      {/* V3: Audit Chain Warning */}
      {d.audit_chain_valid === false && (
        <div className="glass-panel" style={{padding:'1.5rem', marginBottom:'2rem', borderLeft:'6px solid #b91c1c', backgroundColor:'#fef2f2'}}>
          <h2 style={{color:'#b91c1c', fontWeight:800, fontSize:'1.2rem', marginBottom:'0.5rem'}}>🚨 CADENA DE AUDITORÍA COMPROMETIDA</h2>
          <p style={{color:'#991b1b', fontSize:'0.9rem'}}>{d.audit_chain_errors || "Se ha detectado manipulación en el historial criptográfico de eventos."}</p>
        </div>
      )}

      {/* V4: Integrity Warnings */}
      {d.integrity_warnings && d.integrity_warnings.length > 0 && (
        <div className="glass-panel" style={{padding:'1.5rem', marginBottom:'2rem', borderLeft:'4px solid #ea580c', backgroundColor:'#fff7ed'}}>
          <h3 style={{color:'#c2410c', fontWeight:700, fontSize:'1rem', marginBottom:'0.75rem'}}>⚠️ Advertencias de Integridad Estratégica</h3>
          <ul style={{listStyleType:'disc', paddingLeft:'1.5rem', color:'#9a3412', fontSize:'0.9rem'}}>
            {d.integrity_warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      {/* Mission Banner */}
      <div className="glass-panel" style={{padding:'1.5rem 2rem', marginBottom:'2rem', borderLeft:'4px solid var(--accent-primary)'}}>
        <p style={{fontSize:'0.8rem', color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'0.25rem'}}>Misión Estratégica</p>
        <p style={{fontSize:'1.1rem', lineHeight:1.5}}>{d.mission}</p>
      </div>

      {/* =========================================== */}
      {/* STRATEGY CORE — V2.0-V3.0 HERO SECTION     */}
      {/* =========================================== */}
      {d.has_kernel && (
        <div style={{marginBottom:'2rem'}}>
          {/* Pulse Health Row */}
          <div style={{display:'grid', gridTemplateColumns: d.has_pulse ? 'auto repeat(4, 1fr)' : '1fr', gap:'1rem', marginBottom:'1rem'}}>
            {d.has_pulse && (
              <>
                {/* Main Pulse Gauge */}
                <div className="glass-panel" style={{padding:'1.5rem 2rem', textAlign:'center', borderLeft:'4px solid ' + pulseColor(d.pulse_overall), minWidth:160}}>
                  <div style={{fontSize:'0.7rem', color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'0.5rem'}}>PULSO ESTRATÉGICO</div>
                  <div style={{fontSize:'2.5rem', fontWeight:800, color:pulseColor(d.pulse_overall)}}>{d.pulse_overall.toFixed(0)}%</div>
                  <div style={{fontSize:'0.75rem', color:pulseColor(d.pulse_overall), fontWeight:600, marginTop:'0.25rem'}}>
                    Fase: {d.pulse_phase.toUpperCase()}
                  </div>
                  <div style={{display:'flex', gap:'0.25rem', justifyContent:'center', marginTop:'0.5rem'}}>
                    {['sense','analyze','decide','execute','learn'].map(p => (
                      <div key={p} style={{width:6, height:6, borderRadius:'50%', background: p === d.pulse_phase ? pulseColor(d.pulse_overall) : 'rgba(255,255,255,0.1)'}} />
                    ))}
                  </div>
                </div>
                {/* Sub-gauges */}
                {[
                  {label:'Ejecución', val:d.pulse_execution_health, icon:'⚙️'},
                  {label:'Alineación', val:d.pulse_alignment, icon:'🎯'},
                  {label:'Adaptabilidad', val:d.pulse_adaptability, icon:'🧠'},
                  {label:'Drift Alerts', val:d.pulse_drift_count, icon:'🚨', isCount:true},
                ].map((g, i) => (
                  <div key={i} className="glass-panel" style={{padding:'1rem', textAlign:'center'}}>
                    <div style={{fontSize:'1.3rem'}}>{g.icon}</div>
                    {g.isCount ? (
                      <div style={{fontSize:'1.5rem', fontWeight:700, color: g.val > 0 ? 'var(--warning-color)' : 'var(--success-color)'}}>{g.val}</div>
                    ) : (
                      <>
                        <div style={{fontSize:'1.5rem', fontWeight:700, color:pulseColor(g.val)}}>{g.val?.toFixed(0)}%</div>
                        <div style={{height:3, background:'rgba(255,255,255,0.08)', borderRadius:2, marginTop:'0.4rem', overflow:'hidden'}}>
                          <div style={{height:'100%', width:`${g.val}%`, background:pulseColor(g.val), borderRadius:2, transition:'width 0.5s ease'}} />
                        </div>
                      </>
                    )}
                    <div style={{fontSize:'0.7rem', color:'var(--text-secondary)', marginTop:'0.25rem'}}>{g.label}</div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Kernel + Decision Pipeline */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
            {/* Kernel Diagnosis */}
            <div className="glass-panel" style={{padding:'1.25rem', borderLeft:'4px solid var(--accent-secondary)'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem'}}>
                <h3 style={{fontSize:'1rem'}}>🧠 Diagnóstico Estratégico</h3>
                <span style={{fontSize:'0.75rem', padding:'0.15rem 0.5rem', borderRadius:4, background:'rgba(139,92,246,0.15)', color:'var(--accent-secondary)'}}>
                  Confianza: {(d.kernel_confidence * 100).toFixed(0)}%
                </span>
              </div>
              <p style={{fontSize:'0.9rem', color:'var(--text-secondary)', lineHeight:1.6}}>{d.kernel_diagnosis}</p>
            </div>

            {/* Decision Pipeline */}
            <div className="glass-panel" style={{padding:'1.25rem'}}>
              <h3 style={{fontSize:'1rem', marginBottom:'0.75rem'}}>⚡ Pipeline de Decisiones</h3>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem'}}>
                <span style={{fontSize:'0.85rem', color:'var(--text-secondary)'}}>{d.total_decisions} decisiones</span>
                <span style={{fontSize:'0.85rem', fontWeight:600, color: d.decisions_approved_pct >= 50 ? 'var(--success-color)' : 'var(--warning-color)'}}>
                  {d.decisions_approved_pct.toFixed(0)}% activadas
                </span>
              </div>
              <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
                {Object.entries(d.decisions_by_status || {}).map(([status, count]) => {
                  const cols = {proposed:'#6b7280', approved:'#3b82f6', executing:'#f59e0b', completed:'#10b981', rejected:'#ef4444'};
                  const labels = {proposed:'Propuestas', approved:'Aprobadas', executing:'En ejecución', completed:'Completadas', rejected:'Rechazadas'};
                  return (
                    <div key={status} style={{padding:'0.4rem 0.7rem', borderRadius:6, background:`${cols[status] || '#6b7280'}15`, border:`1px solid ${cols[status] || '#6b7280'}33`, fontSize:'0.8rem'}}>
                      <span style={{fontWeight:700, color:cols[status]}}>{count}</span> <span style={{color:'var(--text-secondary)'}}>{labels[status] || status}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{display:'flex', gap:'1rem', marginTop:'0.75rem', fontSize:'0.8rem', color:'var(--text-secondary)'}}>
                <span>🧩 {d.capability_gaps_count} brechas</span>
                <span>⚠️ {d.risk_nodes_count} riesgos</span>
                <span>🔗 {d.causal_chains_count} cadenas causales</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No kernel banner */}
      {!d.has_kernel && (
        <div className="glass-panel" style={{padding:'1.5rem', marginBottom:'2rem', textAlign:'center', borderLeft:'4px solid var(--warning-color)'}}>
          <p style={{fontSize:'0.9rem', color:'var(--warning-color)'}}>
            🧠 No se ha generado el Strategy Kernel. <a href="/strategy" style={{color:'var(--accent-primary)', fontWeight:600}}>Ir a Strategy Core →</a>
          </p>
        </div>
      )}

      {/* V4 Advanced Panels */}
      {d.has_kernel && (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', marginBottom:'2rem'}}>
          <MonteCarloPanel planId={d.plan_id} />
          <BayesianPanel planId={d.plan_id} initialConfidence={d.kernel_confidence} />
        </div>
      )}

      {/* KPI Cards Row 1 */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'1rem', marginBottom:'2rem'}}>
        <div className="glass-panel animate-fade-in" style={{padding:'1.25rem', textAlign:'center', borderTop:'3px solid var(--accent-primary)'}}>
          <p style={{fontSize:'2rem', fontWeight:700}} className="text-gradient">{d.total_objectives}</p>
          <p style={{color:'var(--text-secondary)', fontSize:'0.8rem'}}>Objetivos</p>
        </div>
        <div className="glass-panel animate-fade-in delay-100" style={{padding:'1.25rem', textAlign:'center', borderTop:'3px solid var(--success-color)'}}>
          <p style={{fontSize:'2rem', fontWeight:700, color:'var(--success-color)'}}>{d.avg_kr_progress.toFixed(0)}%</p>
          <p style={{color:'var(--text-secondary)', fontSize:'0.8rem'}}>Progreso OKR</p>
        </div>
        <div className="glass-panel animate-fade-in delay-200" style={{padding:'1.25rem', textAlign:'center', borderTop:'3px solid var(--warning-color)'}}>
          <p style={{fontSize:'2rem', fontWeight:700, color:'var(--warning-color)'}}>{d.pestel_signal_count}</p>
          <p style={{color:'var(--text-secondary)', fontSize:'0.8rem'}}>Señales PESTEL</p>
        </div>
        {d.red_team_attacks > 0 ? (
          <div className="glass-panel animate-fade-in delay-300" style={{padding:'1.25rem', textAlign:'center', borderTop:'3px solid #dc2626'}}>
            <p style={{fontSize:'2rem', fontWeight:700, color:'#dc2626'}}>{d.red_team_critical_vulnerabilities}</p>
            <p style={{color:'var(--text-secondary)', fontSize:'0.8rem'}}>Vulnerabilidades Red Team ({d.red_team_attacks} ataques)</p>
          </div>
        ) : (
          <div className="glass-panel animate-fade-in delay-300" style={{padding:'1.25rem', textAlign:'center', borderTop:'3px solid var(--danger-color)'}}>
            <p style={{fontSize:'2rem', fontWeight:700, color:'var(--danger-color)'}}>{d.porter_avg_score.toFixed(1)}/5</p>
            <p style={{color:'var(--text-secondary)', fontSize:'0.8rem'}}>Intensidad Porter</p>
          </div>
        )}
      </div>

      {/* Second Row: SWOT + BSC + 7S */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1.5rem', marginBottom:'2rem'}}>
        {/* SWOT Summary */}
        <div className="glass-panel animate-fade-in" style={{padding:'1.5rem'}}>
          <h3 style={{marginBottom:'1rem', fontSize:'1.1rem'}}>🎯 FODA</h3>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem'}}>
            {[
              {q:'strength', label:'Fortalezas', color:'var(--success-color)', icon:'💪'},
              {q:'weakness', label:'Debilidades', color:'var(--danger-color)', icon:'⚠️'},
              {q:'opportunity', label:'Oportunidades', color:'var(--accent-primary)', icon:'🚀'},
              {q:'threat', label:'Amenazas', color:'var(--warning-color)', icon:'🔥'},
            ].map(item => (
              <div key={item.q} style={{padding:'0.75rem', background:'rgba(0,0,0,0.2)', borderRadius:'8px', borderLeft:`3px solid ${item.color}`}}>
                <div style={{fontSize:'1.2rem', fontWeight:700, color:item.color}}>{d.swot_counts[item.q] || 0}</div>
                <div style={{fontSize:'0.75rem', color:'var(--text-secondary)'}}>{item.icon} {item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* BSC Summary */}
        <div className="glass-panel animate-fade-in delay-100" style={{padding:'1.5rem'}}>
          <h3 style={{marginBottom:'1rem', fontSize:'1.1rem'}}>📊 Balanced Scorecard</h3>
          <div style={{textAlign:'center', marginBottom:'1rem'}}>
            <p style={{fontSize:'2rem', fontWeight:700}} className="text-gradient">{d.bsc_avg_progress.toFixed(0)}%</p>
            <p style={{color:'var(--text-secondary)', fontSize:'0.8rem'}}>{d.bsc_perspectives_count} KPIs registrados</p>
          </div>
          <div className="progress-track">
            <div className="progress-fill gradient" style={{width:`${d.bsc_avg_progress}%`}}></div>
          </div>
        </div>

        {/* 7S Summary */}
        <div className="glass-panel animate-fade-in delay-200" style={{padding:'1.5rem'}}>
          <h3 style={{marginBottom:'1rem', fontSize:'1.1rem'}}>🔄 McKinsey 7S</h3>
          <div style={{textAlign:'center', marginBottom:'1rem'}}>
            <p style={{fontSize:'2rem', fontWeight:700, color: d.seven_s_avg_score >= 4 ? 'var(--success-color)' : d.seven_s_avg_score >= 3 ? 'var(--warning-color)' : 'var(--danger-color)'}}>
              {d.seven_s_avg_score.toFixed(1)}/5
            </p>
            <p style={{color:'var(--text-secondary)', fontSize:'0.8rem'}}>{d.seven_s_completed ? '7/7 evaluadas' : 'Pendiente'}</p>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{width:`${(d.seven_s_avg_score/5)*100}%`, background: d.seven_s_avg_score >= 4 ? 'var(--success-color)' : 'var(--warning-color)'}}></div>
          </div>
        </div>
      </div>

      {/* Objectives by Status — Chart + Cards */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', marginBottom:'2rem'}}>
        <ObjectivesPie objectives={Object.entries(d.objectives_by_status).flatMap(([status, count]) => Array(count).fill({ status }))} />
        <PestelSeverityBar signals={d.top_risks || []} />
      </div>
      <div className="glass-panel" style={{padding:'1.5rem', marginBottom:'2rem'}}>
        <h3 style={{marginBottom:'1rem', fontSize:'1.1rem'}}>📋 Objetivos por Estado</h3>
        <div style={{display:'flex', gap:'1rem'}}>
          {Object.entries(d.objectives_by_status).map(([status, count]) => {
            const colors = { formulated: 'var(--text-secondary)', in_progress: 'var(--accent-primary)', completed: 'var(--success-color)', blocked: 'var(--danger-color)' };
            return (
              <div key={status} style={{flex:1, padding:'1rem', background:'rgba(0,0,0,0.2)', borderRadius:'8px', textAlign:'center', borderTop:`3px solid ${colors[status] || 'var(--surface-border)'}`}}>
                <p style={{fontSize:'1.5rem', fontWeight:700, color:colors[status]}}>{count}</p>
                <p style={{fontSize:'0.75rem', color:'var(--text-secondary)', textTransform:'uppercase'}}>{status}</p>
              </div>
            );
          })}
          {Object.keys(d.objectives_by_status).length === 0 && <p style={{color:'var(--text-secondary)', padding:'1rem'}}>Sin objetivos registrados.</p>}
        </div>
      </div>

      {/* Risk Alerts */}
      {d.top_risks.length > 0 && (
        <div className="glass-panel card-bordered danger" style={{padding:'1.5rem'}}>
          <h3 style={{marginBottom:'1rem', fontSize:'1.1rem'}}>🚨 Alertas de Alta Severidad</h3>
          {d.top_risks.map((r, i) => (
            <div key={r.id || i} style={{padding:'0.5rem 0', borderBottom:'1px solid var(--surface-border)', fontSize:'0.9rem'}}>
              <strong style={{color:'var(--danger-color)'}}>[{r.factor}]</strong> {r.title} — {r.strategic_impact}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
