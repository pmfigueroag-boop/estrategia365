"use client";
import { usePlanContext } from '@/features/plan/context/PlanContext';
import { useToast } from '@/features/plan/context/ToastContext';
import DiagnosticReadiness from '@/components/DiagnosticReadiness';

import PestelTab from '@/features/analysis/components/tabs/PestelTab';
import PorterTab from '@/features/analysis/components/tabs/PorterTab';
import SwotTab from '@/features/analysis/components/tabs/SwotTab';
import InstitucionalTab from '@/features/analysis/components/tabs/InstitucionalTab';

import VrioTabWrapper from '@/features/analysis/components/VrioTabWrapper';
import BcgTabWrapper from '@/features/analysis/components/BcgTabWrapper';
import BlueOceanTabWrapper from '@/features/analysis/components/BlueOceanTabWrapper';

import { useAnalysis } from './hooks/useAnalysis';

/**
 * AnalysisPage — SWR + PlanContext (Phase 4)
 * =============================================
 * AFI Phase 1: Strategic environment diagnosis.
 * All rendering delegated to domain components.
 * Data fetching via SWR hooks. Plan state via PlanContext.
 */

const TABS = [
  { id: 'institucional', label: '🏙️ Institucional', desc: 'Command Center' },
  { id: 'pestel', label: '🌍 PESTEL', desc: 'Macroentorno' },
  { id: 'porter', label: '⚔️ Porter 5F', desc: '5 Fuerzas' },
  { id: 'swot', label: '🎯 FODA', desc: 'Cruce Estratégico' },
  { id: 'vrio', label: '🔑 VRIO', desc: 'Recursos Internos' },
  { id: 'bcg', label: '📊 BCG Matrix', desc: 'Portafolio' },
  { id: 'ocean', label: '🌊 Blue Ocean', desc: 'Curva de Valor' },
];

export default function AnalysisPage() {
  const toast = useToast();
  const { planId } = usePlanContext();
  
  // Custom hook to manage all Analysis state
  const { state, actions } = useAnalysis(planId, toast);
  const { activeTab, readinessKey } = state;

  if (!planId) return (
    <div className="animate-fade-in glass-panel empty-state">No hay un plan activo. Ve a <a href="/formulation" className="text-gradient" style={{ fontWeight: 600 }}>Formulación</a> para crear uno.</div>
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Análisis Estratégico</h1>
          <p className="page-subtitle">AFI Fase 1: Diagnóstico del entorno externo e interno <span className="plan-badge">(Plan #{planId})</span></p>
        </div>
      </div>

      <DiagnosticReadiness key={readinessKey} planId={planId} />

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => actions.setActiveTab(tab.id)}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : ''}`}
            style={{ fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'pestel' && <PestelTab planId={planId} toast={toast} state={state} actions={actions} />}
      {activeTab === 'porter' && <PorterTab planId={planId} toast={toast} state={state} actions={actions} />}
      {activeTab === 'swot' && <SwotTab planId={planId} toast={toast} state={state} actions={actions} />}
      {activeTab === 'institucional' && <InstitucionalTab planId={planId} toast={toast} state={state} actions={actions} />}
      
      {activeTab === 'vrio' && <VrioTabWrapper planId={planId} toast={toast} />}
      {activeTab === 'bcg' && <BcgTabWrapper planId={planId} toast={toast} />}
      {activeTab === 'ocean' && <BlueOceanTabWrapper planId={planId} toast={toast} />}
    </div>
  );
}
