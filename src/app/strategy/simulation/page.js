'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useToast } from '@/features/plan/context/ToastContext';
import { usePlanContext } from '@/features/plan/context/PlanContext';

export default function SimulationPage() {
  const toast = useToast();
  const { planId } = usePlanContext();
  const [activeView, setActiveView] = useState('montecarlo');
  const [isLoading, setIsLoading] = useState(true);

  // Monte Carlo
  const [mcData, setMcData] = useState(null);
  const [mcRunning, setMcRunning] = useState(false);

  // Bayesian
  const [bayesData, setBayesData] = useState(null);
  const [bayesRunning, setBayesRunning] = useState(false);

  // Bad Strategy
  const [badStrategy, setBadStrategy] = useState(null);
  const [bsRunning, setBsRunning] = useState(false);

  // Porter Strategy
  const [porterStrategy, setPorterStrategy] = useState(null);
  const [psRunning, setPsRunning] = useState(false);

  // ESV Benchmarks
  const [esvComp, setEsvComp] = useState(null);

  // Causal Validation
  const [causalVal, setCausalVal] = useState(null);

  // Wargaming
  const [wargameSessions, setWargameSessions] = useState([]);
  const [scenario, setScenario] = useState('');
  const [wgRunning, setWgRunning] = useState(false);
  const [wgResult, setWgResult] = useState(null);

  useEffect(() => {
    if (!planId) { setIsLoading(false); return; }
    Promise.all([
      api.getEsvComparison(planId).catch(() => null),
      api.getCausalValidation(planId).catch(() => null),
      api.getWargameSessions(planId).catch(() => []),
    ]).then(([esv, cv, wg]) => {
      setEsvComp(esv);
      setCausalVal(cv);
      setWargameSessions(wg || []);
      setIsLoading(false);
    });
  }, [planId]);

  if (!planId) return <div className="animate-fade-in glass-panel empty-state">No hay plan activo. Ve a <a href="/formulation" className="text-gradient" style={{ fontWeight: 600 }}>Formulación</a>.</div>;
  if (isLoading) return <div className="animate-fade-in glass-panel empty-state">Cargando laboratorio de simulación...</div>;

  const VIEWS = [
    { id: 'montecarlo', label: '🎲 Monte Carlo' },
    { id: 'bayesian', label: '📈 Bayesiano' },
    { id: 'rumelt', label: '🔍 Bad Strategy' },
    { id: 'porter', label: '⚔️ Porter Strategy' },
    { id: 'benchmarks', label: '📊 ESV Benchmarks' },
    { id: 'causal', label: '🔗 Causal Validation' },
    { id: 'wargaming', label: '🎮 Wargaming' },
  ];

  const runMC = async () => {
    setMcRunning(true);
    try {
      const d = await api.runMonteCarlo(planId, 1000);
      setMcData(d);
      toast.success('Simulación Monte Carlo completada.');
    } catch (e) { toast.error(e.message); }
    setMcRunning(false);
  };

  const runBayes = async () => {
    setBayesRunning(true);
    try {
      const d = await api.runBayesianUpdate(planId);
      setBayesData(d);
      toast.success(`Confianza actualizada: ${d.posterior?.toFixed(1)}%`);
    } catch (e) { toast.error(e.message); }
    setBayesRunning(false);
  };

  const runBadStrategy = async () => {
    setBsRunning(true);
    try {
      const d = await api.getBadStrategyDetector(planId);
      setBadStrategy(d);
      toast.success(`Análisis Rumelt completado: ${d.verdict}`);
    } catch (e) { toast.error(e.message); }
    setBsRunning(false);
  };

  const runPorterStrat = async () => {
    setPsRunning(true);
    try {
      const d = await api.getPorterStrategy(planId);
      setPorterStrategy(d);
      toast.success(`Estrategia Porter: ${d.verdict}`);
    } catch (e) { toast.error(e.message); }
    setPsRunning(false);
  };

  const runWargame = async () => {
    if (!scenario.trim()) { toast.warning('Ingresa un escenario.'); return; }
    setWgRunning(true);
    try {
      const d = await api.simulate(planId, scenario);
      setWgResult(d);
      toast.success('Simulación completada.');
    } catch (e) { toast.error(e.message); }
    setWgRunning(false);
  };

  const SEVERITY_COLOR = { high: 'var(--danger-color)', medium: 'var(--warning-color)', low: 'var(--text-tertiary)' };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🎲 Laboratorio de Simulación</h1>
        <p className="page-subtitle">Análisis avanzado — Monte Carlo · Bayesiano · Rumelt · Porter · Wargaming <span className="plan-badge">(Plan #{planId})</span></p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {VIEWS.map(v => (
          <button key={v.id} onClick={() => setActiveView(v.id)} className={`btn ${activeView === v.id ? 'btn-primary' : ''}`} style={{ fontSize: '0.85rem' }}>
            {v.label}
          </button>
        ))}
      </div>

      {/* Monte Carlo */}
      {activeView === 'montecarlo' && (
        <div className="animate-fade-in">
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--color-simulation)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>🎲 Simulación Monte Carlo (1000 iteraciones)</h3>
              <button onClick={runMC} disabled={mcRunning} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                {mcRunning ? '⏳ Simulando...' : 'Ejecutar Simulación'}
              </button>
            </div>
            {!mcData ? (
              <p style={{ color: 'var(--text-secondary)' }}>Ejecuta el simulador para proyectar la varianza y el Value-at-Risk del portafolio estratégico.</p>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                  {[
                    { label: 'ESV Medio', value: mcData.portfolio.mean, color: 'var(--success-color)' },
                    { label: 'Mediana (P50)', value: mcData.portfolio.p50_median, color: 'var(--accent-primary)' },
                    { label: 'VaR (95%)', value: mcData.portfolio.VaR_95, color: 'var(--danger-color)' },
                    { label: 'Desv. Std', value: mcData.portfolio.std, color: 'var(--warning-color)' },
                  ].map((m, i) => (
                    <div key={i} className="glass-panel kpi-widget" style={{ borderTopColor: m.color }}>
                      <div className="kpi-value" style={{ color: m.color }}>{m.value}</div>
                      <div className="kpi-label">{m.label}</div>
                    </div>
                  ))}
                </div>
                <div className="evidence-block">
                  <div className="evidence-label">Clasificación de Riesgo</div>
                  <strong style={{ color: mcData.risk_assessment === 'HIGH_VARIANCE' ? 'var(--danger-color)' : mcData.risk_assessment === 'MODERATE' ? 'var(--warning-color)' : 'var(--success-color)' }}>
                    {mcData.risk_assessment}
                  </strong>
                  <span style={{ marginLeft: '1rem', color: 'var(--text-secondary)' }}>P5: {mcData.portfolio.p5} — P95: {mcData.portfolio.p95}</span>
                </div>
                {mcData.decision_stats && Object.keys(mcData.decision_stats).length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>Distribución por Decisión</h4>
                    {Object.entries(mcData.decision_stats).map(([title, stats]) => (
                      <div key={title} className="glass-panel" style={{ padding: '0.6rem 1rem', marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ maxWidth: '50%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>μ={stats.mean} · σ={stats.std} · [P5={stats.p5}, P95={stats.p95}]</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Bayesian */}
      {activeView === 'bayesian' && (
        <div className="animate-fade-in glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>📈 Actualización Bayesiana de Confianza</h3>
            <button onClick={runBayes} disabled={bayesRunning} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              {bayesRunning ? '⏳ Recalibrando...' : 'Recalibrar con Evidencia'}
            </button>
          </div>
          {!bayesData ? (
            <p style={{ color: 'var(--text-secondary)' }}>Recalibra la confianza del Kernel usando inferencia bayesiana sobre el progreso de los OKRs.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div className="glass-panel kpi-widget" style={{ borderTopColor: 'var(--text-secondary)' }}>
                <div className="kpi-value">{bayesData.prior?.toFixed(1)}%</div>
                <div className="kpi-label">Prior (IA)</div>
              </div>
              <div className="glass-panel kpi-widget" style={{ borderTopColor: 'var(--success-color)' }}>
                <div className="kpi-value" style={{ color: 'var(--success-color)' }}>{bayesData.posterior?.toFixed(1)}%</div>
                <div className="kpi-label">Posterior (Empírico)</div>
              </div>
              <div className="glass-panel kpi-widget" style={{ borderTopColor: bayesData.delta >= 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>
                <div className="kpi-value" style={{ color: bayesData.delta >= 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>
                  {bayesData.delta >= 0 ? '+' : ''}{bayesData.delta?.toFixed(1)}%
                </div>
                <div className="kpi-label">Delta</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bad Strategy Detector */}
      {activeView === 'rumelt' && (
        <div className="animate-fade-in glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--danger-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>🔍 Bad Strategy Detector (Rumelt, 2011)</h3>
            <button onClick={runBadStrategy} disabled={bsRunning} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              {bsRunning ? '⏳ Analizando...' : 'Ejecutar Diagnóstico'}
            </button>
          </div>
          {!badStrategy ? (
            <p style={{ color: 'var(--text-secondary)' }}>Detecta los 4 síntomas de mala estrategia según Rumelt: Fluff, Evadir el Desafío, Metas como Estrategia, Objetivos Malos.</p>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div className="glass-panel kpi-widget" style={{ borderTopColor: badStrategy.bad_strategy_score >= 50 ? 'var(--danger-color)' : badStrategy.bad_strategy_score >= 25 ? 'var(--warning-color)' : 'var(--success-color)', minWidth: 140 }}>
                  <div className="kpi-value" style={{ color: badStrategy.bad_strategy_score >= 50 ? 'var(--danger-color)' : badStrategy.bad_strategy_score >= 25 ? 'var(--warning-color)' : 'var(--success-color)' }}>
                    {badStrategy.bad_strategy_score}
                  </div>
                  <div className="kpi-label">Bad Strategy Score</div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: badStrategy.verdict === 'BAD_STRATEGY' ? 'var(--danger-color)' : badStrategy.verdict === 'WEAK_STRATEGY' ? 'var(--warning-color)' : 'var(--success-color)' }}>
                    {badStrategy.verdict}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>{badStrategy.detail}</p>
                </div>
              </div>
              {badStrategy.symptoms_detected?.map((s, i) => (
                <div key={i} className="glass-panel" style={{ padding: '1rem', marginBottom: '0.5rem', borderLeft: `3px solid ${SEVERITY_COLOR[s.severity]}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <strong style={{ fontSize: '0.9rem' }}>{s.symptom}</strong>
                    <span className={`governance-badge ${s.severity === 'high' ? 'invalid' : 'pending'}`}>{s.severity.toUpperCase()}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{s.detail}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginTop: '0.3rem' }}>💡 {s.recommendation}</p>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Porter Strategy */}
      {activeView === 'porter' && (
        <div className="animate-fade-in glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>⚔️ Porter Generic Strategy Selector</h3>
            <button onClick={runPorterStrat} disabled={psRunning} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              {psRunning ? '⏳...' : 'Analizar Estrategia Porter'}
            </button>
          </div>
          {!porterStrategy ? (
            <p style={{ color: 'var(--text-secondary)' }}>Analiza las 5 fuerzas y el Kernel para recomendar Cost Leadership, Differentiation, o Focus.</p>
          ) : (
            <>
              <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '1rem', color: porterStrategy.verdict === 'STUCK_IN_MIDDLE' ? 'var(--danger-color)' : 'var(--success-color)' }}>
                {porterStrategy.verdict === 'STUCK_IN_MIDDLE' ? '⚠️ STUCK IN THE MIDDLE' : `✅ ${porterStrategy.recommended_strategy?.replace('_', ' ').toUpperCase()}`}
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{porterStrategy.detail}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {Object.entries(porterStrategy.strategy_scores || {}).map(([key, score]) => (
                  <div key={key} className="glass-panel kpi-widget" style={{ borderTopColor: key === porterStrategy.recommended_strategy ? 'var(--success-color)' : 'var(--surface-border)' }}>
                    <div className="kpi-value" style={{ color: key === porterStrategy.recommended_strategy ? 'var(--success-color)' : 'var(--text-secondary)' }}>{score}</div>
                    <div className="kpi-label">{key.replace('_', ' ')}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ESV Benchmarks */}
      {activeView === 'benchmarks' && (
        <div className="animate-fade-in glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--warning-color)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>📊 ESV Benchmark Comparison</h3>
          {!esvComp || esvComp.verdict === 'NO_DATA' ? (
            <p style={{ color: 'var(--text-secondary)' }}>No hay datos ESV suficientes para comparar con benchmarks industriales.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="glass-panel kpi-widget"><div className="kpi-value">{esvComp.plan_avg_esv}</div><div className="kpi-label">Tu Plan ESV</div></div>
              <div className="glass-panel kpi-widget"><div className="kpi-value" style={{ color: 'var(--accent-primary)' }}>{esvComp.benchmark_avg_esv}</div><div className="kpi-label">Benchmark ({esvComp.industry})</div></div>
              <div className="glass-panel kpi-widget" style={{ borderTopColor: esvComp.delta >= 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>
                <div className="kpi-value" style={{ color: esvComp.delta >= 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>{esvComp.delta >= 0 ? '+' : ''}{esvComp.delta}</div>
                <div className="kpi-label">Delta</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Causal Validation */}
      {activeView === 'causal' && (
        <div className="animate-fade-in glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--info-color)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>🔗 Validación de Cadenas Causales</h3>
          {!causalVal ? (
            <p style={{ color: 'var(--text-secondary)' }}>No hay datos de validación causal disponibles.</p>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div className="glass-panel kpi-widget"><div className="kpi-value">{causalVal.total_chains}</div><div className="kpi-label">Total</div></div>
                <div className="glass-panel kpi-widget" style={{ borderTopColor: 'var(--success-color)' }}><div className="kpi-value" style={{ color: 'var(--success-color)' }}>{causalVal.validated}</div><div className="kpi-label">Validadas</div></div>
                <div className="glass-panel kpi-widget" style={{ borderTopColor: 'var(--danger-color)' }}><div className="kpi-value" style={{ color: 'var(--danger-color)' }}>{causalVal.broken}</div><div className="kpi-label">Rotas</div></div>
                <div className="glass-panel kpi-widget"><div className="kpi-value" style={{ color: causalVal.validation_score >= 70 ? 'var(--success-color)' : 'var(--warning-color)' }}>{causalVal.validation_score}%</div><div className="kpi-label">Score</div></div>
              </div>
              <div className={`governance-badge ${causalVal.verdict === 'VALID' ? 'valid' : causalVal.verdict === 'PARTIAL' ? 'pending' : 'invalid'}`} style={{ fontSize: '0.85rem' }}>
                {causalVal.verdict}
              </div>
            </>
          )}
        </div>
      )}

      {/* Wargaming */}
      {activeView === 'wargaming' && (
        <div className="animate-fade-in">
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid #dc2626' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>🎮 Wargaming — Simulación Competitiva</h3>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Escenario de amenaza</label>
                <input
                  type="text" value={scenario} onChange={e => setScenario(e.target.value)}
                  placeholder="Ej: Un competidor lanza un producto 30% más barato..."
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                />
              </div>
              <button onClick={runWargame} disabled={wgRunning} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                {wgRunning ? '⏳...' : '🎮 Simular'}
              </button>
              <button onClick={async () => { try { const d = await api.runDevilsAdvocate(planId); setWgResult(d); toast.success("Devil's Advocate completado."); } catch (e) { toast.error(e.message); } }} className="btn" style={{ fontSize: '0.85rem', background: 'rgba(220,38,38,0.15)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.3)' }}>
                😈 Devil&apos;s Advocate
              </button>
            </div>
          </div>
          {wgResult && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.75rem' }}>Resultado de Simulación</h4>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {typeof wgResult === 'string' ? wgResult : JSON.stringify(wgResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
