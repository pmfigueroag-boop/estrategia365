'use client';
import { useState, useEffect } from 'react';
import api from '@/core/infrastructure/api';
import BCGMatrix from './BCGMatrix';
import dynamic from 'next/dynamic';

const BcgDynamicMatrix = dynamic(() => import('@/features/charts/components/BcgDynamicMatrix'), { ssr: false });
const BcgCapitalFlowMap = dynamic(() => import('@/features/charts/components/BcgCapitalFlowMap'), { ssr: false });
const BcgStrategyBridge = dynamic(() => import('@/features/charts/components/BcgStrategyBridge'), { ssr: false });
const BcgPortfolioGalaxy = dynamic(() => import('@/features/charts/components/BcgPortfolioGalaxy'), { ssr: false });
const BcgGrowthMomentum = dynamic(() => import('@/features/charts/components/BcgGrowthMomentum'), { ssr: false });
const BcgSurvivabilityIndex = dynamic(() => import('@/features/charts/components/BcgSurvivabilityIndex'), { ssr: false });
const BcgSimulationEngine = dynamic(() => import('@/features/charts/components/BcgSimulationEngine'), { ssr: false });
const BcgStrategicOptionality = dynamic(() => import('@/features/charts/components/BcgStrategicOptionality'), { ssr: false });
const BcgInstitutionalCockpit = dynamic(() => import('@/features/charts/components/BcgInstitutionalCockpit'), { ssr: false });

const BCG_TABS = [
  { id: 'cockpit',     label: '🏙️ Cockpit',            premium: true },
  { id: 'galaxy',      label: '🌌 Galaxy',              premium: true },
  { id: 'momentum',    label: '⚡ Momentum',            premium: true },
  { id: 'survivability', label: '🛡️ Survivability',       premium: true },
  { id: 'optionality', label: '🎯 Optionality',         premium: true },
  { id: 'simulation',  label: '🧪 Simulation',          premium: true },
  { id: 'matrix',      label: '📡 Dynamic Matrix',      premium: true },
  { id: 'flow',        label: '💸 Capital Flow',         premium: true },
  { id: 'bridge',      label: '🔗 Strategy Bridge',      premium: true },
  { id: 'classic',     label: '📋 Clásico' },
];

export default function BcgTabWrapper({ planId, toast }) {
  const [data, setData] = useState(null);
  const [bcgView, setBcgView] = useState('cockpit');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (planId) api.getBCG(planId).then(setData).catch(() => {});
  }, [planId]);

  const handleGenerate = async () => {
    if (!planId) { toast.warning('No hay plan activo.'); return; }
    setIsGenerating(true);
    try {
      const d = await api.generateBCG(planId);
      setData(d);
      toast.success('Matriz BCG generada.');
      window.dispatchEvent(new Event('readiness-update'));
    } catch (e) { toast.error(e.message); }
    setIsGenerating(false);
  };

  if (!data) {
    return (
      <div className="animate-fade-in">
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>BCG Portfolio Intelligence</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 520, margin: '0 auto 2rem' }}>
            La IA clasificará las unidades de negocio por tasa de crecimiento × participación de mercado (Henderson, 1970) y generará el portafolio de inteligencia estratégica completo.
          </p>
          <button onClick={handleGenerate} disabled={isGenerating} className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 2rem', opacity: isGenerating ? 0.5 : 1 }}>
            {isGenerating ? '⏳ Analizando...' : '🤖 Generar Análisis BCG'}
          </button>
        </div>
      </div>
    );
  }

  const units = data.units || [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: '0.35rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {BCG_TABS.map(v => (
            <button key={v.id} onClick={() => setBcgView(v.id)} style={{
              padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem',
              border: `1px solid ${bcgView === v.id ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`,
              background: bcgView === v.id ? 'rgba(99,102,241,0.12)' : 'transparent',
              color: bcgView === v.id ? '#818cf8' : 'var(--text-secondary)',
              cursor: 'pointer', fontWeight: bcgView === v.id ? 700 : 400, transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '0.35rem',
            }}>
              {v.label}
              {v.premium && <span style={{ fontSize: '0.55rem', padding: '0.1rem 0.3rem', borderRadius: 4, background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>PREMIUM</span>}
            </button>
          ))}
        </div>
        <button onClick={handleGenerate} disabled={isGenerating} className="btn" style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem', opacity: isGenerating ? 0.5 : 1 }}>
          {isGenerating ? '⏳ Regenerando...' : '🔄 Regenerar'}
        </button>
      </div>

      {bcgView === 'cockpit'       && <BcgInstitutionalCockpit units={units} summary={data.summary} />}
      {bcgView === 'galaxy'         && <BcgPortfolioGalaxy units={units} summary={data.summary} />}
      {bcgView === 'momentum'       && <BcgGrowthMomentum units={units} />}
      {bcgView === 'survivability'  && <BcgSurvivabilityIndex units={units} />}
      {bcgView === 'optionality'    && <BcgStrategicOptionality units={units} />}
      {bcgView === 'simulation'     && <BcgSimulationEngine units={units} />}
      {bcgView === 'matrix'         && <BcgDynamicMatrix units={units} summary={data.summary} />}
      {bcgView === 'flow'           && <BcgCapitalFlowMap units={units} />}
      {bcgView === 'bridge'         && <BcgStrategyBridge units={units} />}
      {bcgView === 'classic'        && <BCGMatrix planId={planId} toast={toast} />}
    </div>
  );
}
