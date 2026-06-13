"use client";
import { useToast } from '@/features/plan/context/ToastContext';
import { usePlanContext } from '@/features/plan/context/PlanContext';
import { useState } from 'react';
import { useProgress } from '@/features/shared/hooks/swr-hooks';
import api from '@/core/infrastructure/api';
import ObjectiveCard from '@/features/execution/components/ObjectiveCard';
import OkrForm from '@/features/execution/components/OkrForm';

/**
 * ExecutionPage — Thin Routing Shell (Phase 2)
 * ================================================
 * AFI Fase 6: Ejecución, monitoreo y alineación operativa pura (Doerr).
 * BSC y Hoshin han sido movidos a sus respectivas fases doctrinales.
 */

export default function ExecutionPage() {
  const toast = useToast();
  const { planId } = usePlanContext();
  const [showOkrForm, setShowOkrForm] = useState(false);
  const [isSynthesizingOkrs, setIsSynthesizingOkrs] = useState(false);

  // SWR hooks
  const { data: progressData, isLoading, mutate: mutateProgress } = useProgress(planId);

  const refreshProgress = () => mutateProgress();

  const handleCreateObjective = async (data) => {
    try {
      await api.createObjective(planId, data);
      await refreshProgress();
      toast.success('Objetivo creado');
      setShowOkrForm(false);
    } catch (e) { toast.error(e.message); }
  };

  const handleSynthesizeOkrs = async () => {
    setIsSynthesizingOkrs(true);
    try {
      const data = await api.synthesizeOkrs(planId);
      await refreshProgress();
      toast.success(`${data.objectives_created} OKRs generados desde Formulación + Kernel.`);
    } catch (e) { toast.error(e.message); }
    setIsSynthesizingOkrs(false);
  };

  if (!planId) return (
    <div className="animate-fade-in glass-panel empty-state">No hay un plan activo. Ve a <a href="/formulation" className="text-gradient" style={{fontWeight:600}}>Formulación</a> para crear uno.</div>
  );
  if (isLoading) return <div className="animate-fade-in glass-panel empty-state">Cargando datos de ejecución...</div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Ejecución Ágil de OKRs</h1>
          <p className="page-subtitle">AFI Fase 6: Ejecución pura y resultados clave <span className="plan-badge">(Plan #{planId})</span></p>
        </div>
      </div>

      <div className="animate-fade-in">
        <div style={{display:'flex', justifyContent:'flex-end', gap:'0.5rem', marginBottom:'1rem'}}>
          <button onClick={handleSynthesizeOkrs} disabled={isSynthesizingOkrs} className="btn btn-primary" style={{fontSize:'0.85rem', opacity:isSynthesizingOkrs?0.5:1}}>
            {isSynthesizingOkrs ? '⏳ Generando OKRs...' : '🧠 Sintetizar OKRs desde Formulación'}
          </button>
          <button onClick={() => setShowOkrForm(!showOkrForm)} className="btn glass-panel" style={{background:'transparent', fontSize:'0.85rem'}}>
            ➕ Crear Manual
          </button>
        </div>
        
        {showOkrForm && <OkrForm onSubmit={handleCreateObjective} onCancel={() => setShowOkrForm(false)} />}
        
        {progressData && (
          <div className="glass-panel" style={{padding:'2rem', marginBottom:'2rem', textAlign:'center'}}>
            <p style={{color:'var(--text-secondary)', fontSize:'0.85rem'}}>Progreso Global</p>
            <div style={{fontSize:'3rem', fontWeight:700}} className="text-gradient">{progressData.overall_progress}%</div>
            <div className="progress-track" style={{maxWidth:'400px', margin:'1rem auto'}}>
              <div className="progress-fill gradient" style={{width:`${progressData.overall_progress}%`}}></div>
            </div>
            <p style={{color:'var(--text-secondary)', fontSize:'0.85rem'}}>{progressData.total_objectives} objetivos · {progressData.total_key_results} key results</p>
          </div>
        )}
        
        <div className="flex-col gap-4">
          {(progressData?.objectives || []).map((obj, i) => (
            <ObjectiveCard key={obj.id} obj={obj} planId={planId} index={i} onRefresh={refreshProgress} toast={toast} />
          ))}
        </div>
      </div>
    </div>
  );
}
