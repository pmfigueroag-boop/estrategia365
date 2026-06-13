'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { usePlanContext } from '@/context/PlanContext';
import { useKernel, useCausal, usePulses, useGraph } from '@/lib/swr-hooks';
import {
  KernelDiagnosis,
  DecisionTable,
  DecisionGraph,
  CausalChains,
  StrategyPulse,
  PortfolioOptimizer,
  CapabilityGaps,
  RiskNodes,
  DecisionApprovalModal,
} from '@/components/strategy';

/**
 * StrategyPage — Thin routing shell for Strategy Decision Core
 * Phase 1: Frontend Decomposition (was 914 lines → now ~200)
 *
 * All view rendering is delegated to extracted domain components.
 * This file manages state, data fetching, and view routing only.
 */

const STATUS_LABEL = { proposed: '📋 Propuesta', approved: '✅ Aprobada', executing: '⚙️ Ejecutando', completed: '🏁 Completada', rejected: '❌ Rechazada' };

export default function StrategyPage() {
  const toast = useToast();
  const { planId } = usePlanContext();

  // SWR hooks
  const { data: kernel, isLoading, mutate: mutateKernel } = useKernel(planId);
  const { data: causalData, mutate: mutateCausal } = useCausal(planId);
  const { data: pulsesRaw = [], mutate: mutatePulses } = usePulses(planId);
  const { data: graphData, mutate: mutateGraph } = useGraph(planId);

  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [activeView, setActiveView] = useState('decisions');
  const [isGeneratingCausal, setIsGeneratingCausal] = useState(false);
  const [isGeneratingPulse, setIsGeneratingPulse] = useState(false);
  const [deployingId, setDeployingId] = useState(null);
  const [isGeneratingGraph, setIsGeneratingGraph] = useState(false);
  const [optimizerResult, setOptimizerResult] = useState(null);
  const [scenarioResult, setScenarioResult] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [approvalDecision, setApprovalDecision] = useState(null);

  const pulseData = pulsesRaw.length ? pulsesRaw[0] : null;
  const pulseHistory = pulsesRaw;

  useEffect(() => {
    if (isGenerating) {
      setLoadingStep(0);
      const interval = setInterval(() => { setLoadingStep(prev => (prev < 5 ? prev + 1 : prev)); }, 2500);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const loadingMessages = [
    "Ingestando Inteligencia Institucional...",
    "Analizando variables macro y micro-entorno (PESTEL, Porter)...",
    "Evaluando fricción competitiva y heurísticas (FODA, VRIO)...",
    "Calculando Expected Strategic Value (ESV)...",
    "Mapeando recursos (CapEx, OpEx) frente a restricciones...",
    "Sintetizando Kernel Estratégico (Diag + Guiding Policy)..."
  ];

  // ── Action Handlers ──────────────────────────────────────
  const handleGenerate = async () => {
    if (!planId) { toast.warning("Selecciona un plan en Formulación primero."); return; }
    setIsGenerating(true);
    try {
      const data = await api.generateKernel(planId);
      mutateKernel(data, false);
      toast.success("Strategy Kernel generado — decisiones priorizadas listas.");
    } catch (e) { toast.error(e.message); }
    setIsGenerating(false);
  };

  const handleStatusChange = async (decisionId, newStatus) => {
    if (newStatus === 'approved') {
      const decision = kernel.decisions.find(d => d.id === decisionId);
      setApprovalDecision(decision);
      return;
    }
    try {
      await api.updateDecisionStatus(decisionId, { status: newStatus, human_validation_note: 'Estado cambiado sin validación estricta' });
      const updated = { ...kernel };
      updated.decisions = updated.decisions.map(d => d.id === decisionId ? { ...d, status: newStatus } : d);
      mutateKernel(updated, false);
      toast.success(`Decisión actualizada: ${STATUS_LABEL[newStatus]}`);
    } catch (e) { toast.error(e.message); }
  };

  const handleGenerateCausal = async () => {
    if (!planId) return;
    setIsGeneratingCausal(true);
    try {
      const data = await api.generateCausal(planId);
      mutateCausal(data, false);
      toast.success(`Mapa causal generado: ${data.chains?.length || 0} cadenas.`);
    } catch (e) { toast.error(e.message); }
    setIsGeneratingCausal(false);
  };

  const handleGeneratePulse = async () => {
    if (!planId) return;
    setIsGeneratingPulse(true);
    try {
      const data = await api.generatePulse(planId);
      mutatePulses(prev => [data, ...(prev || [])], false);
      toast.success(`Pulso estratégico generado: ${data.overall_pulse?.toFixed(0)}% salud.`);
    } catch (e) { toast.error(e.message); }
    setIsGeneratingPulse(false);
  };

  const handleGenerateGraph = async () => {
    if (!planId) return;
    setIsGeneratingGraph(true);
    try {
      const data = await api.generateGraph(planId);
      mutateGraph(data, false);
      toast.success(`Grafo generado: ${data.stats?.total_edges || 0} relaciones.`);
    } catch (e) { toast.error(e.message); }
    setIsGeneratingGraph(false);
  };

  const handleDeploy = async (decisionId, title) => {
    setDeployingId(decisionId);
    try {
      const result = await api.deployDecision(decisionId);
      toast.success(`🚀 "${title}" desplegada como OKR #${result.objective_id} con ${result.key_results} KRs`);
      api.getKernel(planId).then(d => mutateKernel(d, false)).catch(() => {});
    } catch (e) { toast.error(e.message); }
    setDeployingId(null);
  };

  const handleOptimize = async (constraints) => {
    if (!planId) return;
    setIsOptimizing(true);
    try {
      const data = await api.optimizePortfolio(planId, constraints);
      setOptimizerResult(data);
      toast.success(`Portafolio optimizado: ${data.optimal_portfolio?.length || 0} seleccionadas.`);
    } catch (e) { toast.error(e.message); }
    setIsOptimizing(false);
  };

  const handleSimulate = async () => {
    if (!planId) return;
    setIsSimulating(true);
    try {
      const data = await api.simulateScenarios(planId);
      setScenarioResult(data);
      toast.success(`3 escenarios simulados.`);
    } catch (e) { toast.error(e.message); }
    setIsSimulating(false);
  };

  const handleRejectDiscarded = async () => {
    if (!confirm(`¿Rechazar las ${optimizerResult.rejected.length} decisiones descartadas por el modelo?`)) return;
    setIsOptimizing(true);
    try {
      for (const d of optimizerResult.rejected) {
        await api.updateDecisionStatus(d.id, { status: 'rejected', human_validation_note: 'Descartado automáticamente por el Optimizador de Portafolio debido a restricciones de capital/personas.' });
      }
      toast.success('Decisiones descartadas han sido marcadas como Rechazadas.');
      handleGenerate();
    } catch(e) { toast.error(e.message); }
    setIsOptimizing(false);
  };

  // ── Rendering ────────────────────────────────────────────
  if (isLoading) return <div className="animate-fade-in" style={{textAlign:'center',padding:'4rem'}}><p style={{color:'var(--text-secondary)'}}>⏳ Cargando Strategy Kernel...</p></div>;

  // Landing screen — no kernel yet
  if (!kernel) {
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">🧠 Strategy Decision Core</h1>
          <p className="page-subtitle">Motor de decisiones estratégicas institucional — Modelo Rumelt</p>
        </div>
        <div className="glass-panel" style={{padding:'3rem', textAlign:'center'}}>
          <div style={{fontSize:'4rem', marginBottom:'1rem'}}>🎯</div>
          <h2 style={{fontSize:'1.4rem', marginBottom:'0.75rem'}}>¿Qué decisión debo tomar ahora?</h2>
          <p style={{color:'var(--text-secondary)', maxWidth:600, margin:'0 auto 1rem', lineHeight:1.6}}>
            El Strategy Engine analizará toda tu inteligencia institucional — documentos, PESTEL, Porter, SWOT, plan estratégico — y producirá:
          </p>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'1rem', maxWidth:600, margin:'0 auto 2rem'}}>
            <div className="glass-panel" style={{padding:'1rem'}}><span style={{fontSize:'1.5rem'}}>🔍</span><p style={{fontSize:'0.85rem', marginTop:'0.5rem'}}>Diagnóstico del desafío crítico</p></div>
            <div className="glass-panel" style={{padding:'1rem'}}><span style={{fontSize:'1.5rem'}}>🧭</span><p style={{fontSize:'0.85rem', marginTop:'0.5rem'}}>Política guía directriz</p></div>
            <div className="glass-panel" style={{padding:'1rem'}}><span style={{fontSize:'1.5rem'}}>⚡</span><p style={{fontSize:'0.85rem', marginTop:'0.5rem'}}>Decisiones priorizadas</p></div>
          </div>
          {isGenerating ? (
            <div style={{padding:'1.5rem', maxWidth:500, margin:'0 auto', background:'rgba(255,255,255,0.05)', borderRadius:12, border:'1px solid var(--surface-border)'}}>
              <span className="dot-pulse" style={{marginBottom:'1rem'}}></span>
              <p style={{fontSize:'1rem', fontWeight:600, color:'var(--accent-primary)', minHeight:'1.5rem'}}>{loadingMessages[loadingStep]}</p>
              <div style={{height:4, background:'rgba(255,255,255,0.1)', borderRadius:2, marginTop:'1rem', overflow:'hidden'}}>
                <div style={{height:'100%', width:`${((loadingStep + 1)/6)*100}%`, background:'var(--accent-primary)', transition:'width 2s ease-in-out'}}></div>
              </div>
            </div>
          ) : (
            <button onClick={handleGenerate} disabled={isGenerating} className="btn btn-primary" style={{fontSize:'1.1rem', padding:'0.85rem 2.5rem', opacity:isGenerating?0.5:1}}>
              🧠 Generar Strategy Kernel
            </button>
          )}
          {!planId && <p style={{color:'var(--danger-color)', marginTop:'1rem', fontSize:'0.85rem'}}>⚠️ No hay plan seleccionado. Ve a Formulación primero.</p>}
        </div>
      </div>
    );
  }

  // ── View routing ─────────────────────────────────────────
  const decisions = kernel.decisions || [];
  const gaps = kernel.capability_gaps || [];
  const risks = kernel.risk_nodes || [];
  const causalChains = causalData?.chains || [];
  const graphEdges = graphData?.edges || [];
  const optSelected = optimizerResult?.optimal_portfolio || [];

  const VIEWS = [
    { id: 'decisions', label: `⚡ Decisiones (${decisions.length})` },
    { id: 'optimizer', label: `🎯 Optimizar${optSelected.length ? ` (${optSelected.length})` : ''}` },
    { id: 'graph', label: `🗓️ Grafo (${graphEdges.length})` },
    { id: 'causal', label: `🔗 Causal (${causalChains.length})` },
    { id: 'pulse', label: `💓 Pulso ${pulseData ? `(${pulseData.overall_pulse?.toFixed(0)}%)` : ''}` },
    { id: 'gaps', label: `🧩 Brechas (${gaps.length})` },
    { id: 'risks', label: `⚠️ Riesgos (${risks.length})` },
  ];

  return (
    <div className="animate-fade-in">
      {approvalDecision && (
        <DecisionApprovalModal
          decision={approvalDecision}
          onClose={() => setApprovalDecision(null)}
          onSuccess={() => { setApprovalDecision(null); handleGenerate(); toast.success(`Decisión aprobada con firmas institucionales.`); }}
        />
      )}

      {/* Page Header */}
      <div className="page-header">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <h1 className="page-title">🧠 Strategy Decision Core</h1>
            <p className="page-subtitle">Decisiones estratégicas priorizadas — Confianza: {(kernel.confidence_score * 100).toFixed(0)}%</p>
          </div>
          <button onClick={handleGenerate} disabled={isGenerating} className="btn" style={{fontSize:'0.8rem', opacity:isGenerating?0.5:1}}>
            {isGenerating ? '⏳ Regenerando...' : '🔄 Regenerar Kernel'}
          </button>
        </div>
      </div>

      {/* Kernel Core */}
      <KernelDiagnosis kernel={kernel} />

      {/* View Tabs */}
      <div style={{display:'flex', gap:'0.5rem', marginBottom:'1.5rem'}}>
        {VIEWS.map(v => (
          <button key={v.id} onClick={() => setActiveView(v.id)}
            className={`btn ${activeView === v.id ? 'btn-primary' : ''}`}
            style={{fontSize:'0.9rem'}}>
            {v.label}
          </button>
        ))}
      </div>

      {/* View Router */}
      {activeView === 'decisions' && (
        <DecisionTable decisions={decisions} kernel={kernel} onStatusChange={handleStatusChange} onDeploy={handleDeploy} deployingId={deployingId} />
      )}
      {activeView === 'graph' && (
        <DecisionGraph graphData={graphData} edges={graphEdges} onGenerate={handleGenerateGraph} isGenerating={isGeneratingGraph} />
      )}
      {activeView === 'optimizer' && (
        <PortfolioOptimizer planId={planId} optimizerResult={optimizerResult} scenarioResult={scenarioResult} onOptimize={handleOptimize} onSimulate={handleSimulate} onRejectDiscarded={handleRejectDiscarded} isOptimizing={isOptimizing} isSimulating={isSimulating} />
      )}
      {activeView === 'causal' && (
        <CausalChains causalData={causalData} chains={causalChains} onGenerate={handleGenerateCausal} isGenerating={isGeneratingCausal} />
      )}
      {activeView === 'pulse' && (
        <StrategyPulse pulseData={pulseData} pulseHistory={pulseHistory} onGenerate={handleGeneratePulse} isGenerating={isGeneratingPulse} />
      )}
      {activeView === 'gaps' && <CapabilityGaps gaps={gaps} />}
      {activeView === 'risks' && <RiskNodes risks={risks} />}
    </div>
  );
}
