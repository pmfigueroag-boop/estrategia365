"use client";
import { useToast } from '@/features/plan/context/ToastContext';
import { usePlanContext } from '@/features/plan/context/PlanContext';
import { useState } from 'react';
import { useBsc, useProgress } from '@/features/shared/hooks/swr-hooks';
import api from '@/core/infrastructure/api';
import BscPerspectives from '@/features/execution/components/BscPerspectives';
import StrategyMap from '@/features/execution/components/StrategyMap';
import BscForm from '@/features/execution/components/BscForm';
import { BscGauge } from '@/features/charts/components';

/**
 * BSCPage — Doctrinal Phase 4 (Diseño / Traducción)
 * ================================================
 * Separado de Ejecución (OKRs) para respetar la distinción
 * entre el Diseño Estratégico de Kaplan & Norton y la Ejecución de Doerr.
 */

const TABS = [
  { id: 'bsc', label: '📊 Balanced Scorecard' },
  { id: 'strategy_map', label: '🗺️ Mapa Estratégico' },
];

export default function BSCPage() {
  const toast = useToast();
  const { planId } = usePlanContext();
  const [activeTab, setActiveTab] = useState('bsc');
  const [showBscForm, setShowBscForm] = useState(false);
  const [isSynthesizingBsc, setIsSynthesizingBsc] = useState(false);

  // SWR hooks
  const { data: bscData = [], isLoading, mutate: mutateBsc } = useBsc(planId);
  // Requerido por el Mapa Estratégico para cruzar con OKRs
  const { data: progressData } = useProgress(planId);

  const refreshBsc = () => mutateBsc();

  const handleCreateBsc = async (data) => {
    try {
      await api.createBsc(planId, data);
      await refreshBsc();
      toast.success('KPI BSC creado');
      setShowBscForm(false);
    } catch (e) { toast.error(e.message); }
  };

  const handleSynthesizeBsc = async () => {
    setIsSynthesizingBsc(true);
    try {
      const data = await api.synthesizeBsc(planId);
      await refreshBsc();
      toast.success(`${data.kpis_created} KPIs BSC generados desde Formulación P2W.`);
    } catch (e) { toast.error(e.message); }
    setIsSynthesizingBsc(false);
  };

  if (!planId) return (
    <div className="animate-fade-in glass-panel empty-state">No hay un plan activo. Ve a <a href="/formulation" className="text-gradient" style={{fontWeight:600}}>Formulación</a> para crear uno.</div>
  );
  if (isLoading) return <div className="animate-fade-in glass-panel empty-state">Cargando datos del BSC...</div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Diseño de Arquitectura Estratégica</h1>
          <p className="page-subtitle">AFI Fase 4: Balanced Scorecard y Traducción Operativa <span className="plan-badge">(Plan #{planId})</span></p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex', gap:'0.5rem', marginBottom:'2rem'}}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : ''}`}
            style={{fontSize:'0.9rem'}}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* BSC Tab */}
      {activeTab === 'bsc' && (
        <div className="animate-fade-in">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
            <h2 style={{fontSize:'1.3rem'}}>Balanced Scorecard — 4 Perspectivas de Kaplan & Norton</h2>
            <div style={{display:'flex', gap:'0.5rem'}}>
              <button onClick={handleSynthesizeBsc} disabled={isSynthesizingBsc} className="btn btn-primary" style={{fontSize:'0.85rem', opacity:isSynthesizingBsc?0.5:1}}>
                {isSynthesizingBsc ? '⏳ Generando BSC...' : '🧠 Sintetizar BSC desde P2W'}
              </button>
              <button onClick={() => setShowBscForm(!showBscForm)} className="btn glass-panel" style={{background:'transparent', fontSize:'0.85rem'}}>➕ Crear KPI</button>
            </div>
          </div>
          {showBscForm && <BscForm onSubmit={handleCreateBsc} onCancel={() => setShowBscForm(false)} />}
          <BscGauge perspectives={bscData} />
          <BscPerspectives bscData={bscData} planId={planId} onRefresh={refreshBsc} toast={toast} />
        </div>
      )}

      {/* Strategy Map Tab */}
      {activeTab === 'strategy_map' && (
        <StrategyMap bscData={bscData} objectives={progressData?.objectives || []} />
      )}
    </div>
  );
}
