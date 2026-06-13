import React from 'react';
import dynamic from 'next/dynamic';
import FallbackBadge from '@/components/FallbackBadge';
import PorterForces from '@/features/analysis/components/PorterForces';

const PorterRadar = dynamic(() => import('@/features/charts/components/PorterRadar'), { ssr: false });
const PorterHeatMap = dynamic(() => import('@/features/charts/components/PorterHeatMap'), { ssr: false });
const PorterExecutiveSummary = dynamic(() => import('@/features/charts/components/PorterExecutiveSummary'), { ssr: false });
const PorterAttractivenessMatrix = dynamic(() => import('@/features/charts/components/PorterAttractivenessMatrix'), { ssr: false });
const PorterPressureMap = dynamic(() => import('@/features/charts/components/PorterPressureMap'), { ssr: false });
const PorterConfidenceOverlay = dynamic(() => import('@/features/charts/components/PorterConfidenceOverlay'), { ssr: false });
const PorterStrategyBridge = dynamic(() => import('@/features/charts/components/PorterStrategyBridge'), { ssr: false });
const PorterForceNetwork = dynamic(() => import('@/features/charts/components/PorterForceNetwork'), { ssr: false });
const PorterBattlefield = dynamic(() => import('@/features/charts/components/PorterBattlefield'), { ssr: false });
const PorterIndustryDNA = dynamic(() => import('@/features/charts/components/PorterIndustryDNA'), { ssr: false });
const PorterMonteCarlo = dynamic(() => import('@/features/charts/components/PorterMonteCarlo'), { ssr: false });
const PorterOnePager = dynamic(() => import('@/features/charts/components/PorterOnePager'), { ssr: false });
const PorterTimeline = dynamic(() => import('@/features/charts/components/PorterTimeline'), { ssr: false });
const PorterBlueOceanOverlay = dynamic(() => import('@/features/charts/components/PorterBlueOceanOverlay'), { ssr: false });
const PorterWarRoom = dynamic(() => import('@/features/charts/components/PorterWarRoom'), { ssr: false });
const PorterBscBridge = dynamic(() => import('@/features/charts/components/PorterBscBridge'), { ssr: false });
const PorterIntelligenceCockpit = dynamic(() => import('@/features/charts/components/PorterIntelligenceCockpit'), { ssr: false });

export default function PorterTab({ planId, state, actions }) {
  const { porterForces, porterData, porterDeepAnalysis, porterView, isLoading } = state;
  const { setPorterView, handleScan } = actions;

  return (
    <div className="animate-fade-in">
      <FallbackBadge items={porterForces} />
      <PorterRadar forces={porterForces} />
      <PorterForces porter={porterForces} isLoading={isLoading} onScan={async () => { await handleScan('porter'); }} />

      {porterForces.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem', marginBottom: '0.5rem' }}>
          <button onClick={() => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
            window.open(`${baseUrl}/v1/analysis/${planId}/porter/export?token=${token}`, '_blank');
          }}
            className="btn" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            📥 Exportar CSV
          </button>
        </div>
      )}

      {porterForces.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { id: 'cockpit', label: '🎯 Cockpit', premium: true },
              { id: 'forces', label: '⚔️ Fuerzas' },
              { id: 'executive', label: '📊 Ejecutivo' },
              { id: 'pressure', label: '🌐 Presión' },
              { id: 'heatmap', label: '🔥 Heat Map' },
              { id: 'matrix', label: '🎯 Matriz' },
              { id: 'confidence', label: '🧠 Confianza' },
              { id: 'bridge', label: '🔗 Estrategia' },
              { id: 'network', label: '🕸️ Red Causal' },
              { id: 'battlefield', label: '🎖️ Batalla' },
              { id: 'dna', label: '🧬 ADN' },
              { id: 'montecarlo', label: '🎲 Stress Test' },
              { id: 'onepager', label: '📝 One-Pager' },
              { id: 'timeline', label: '📈 Timeline' },
              { id: 'blueocean', label: '🌊 Blue Ocean' },
              { id: 'warroom', label: '🎯 War Room' },
              { id: 'bscbridge', label: '📊 BSC Bridge' },
            ].map(v => (
              <button key={v.id} onClick={() => setPorterView(v.id)}
                style={{
                  padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s',
                  borderColor: porterView === v.id ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                  background: porterView === v.id ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: porterView === v.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: porterView === v.id ? 700 : 400
                }}>
                {v.label}
              </button>
            ))}
          </div>
          
          {porterView === 'executive' && porterDeepAnalysis && (
            <PorterExecutiveSummary
              executiveSummary={porterDeepAnalysis.executive_summary}
              riskDistribution={porterDeepAnalysis.risk_distribution}
              topActions={porterDeepAnalysis.top_actions}
            />
          )}
          {porterView === 'pressure' && (
            <PorterPressureMap forces={porterForces} industryAssessment={porterData?.industry_assessment} />
          )}
          {porterView === 'heatmap' && porterDeepAnalysis && (
            <PorterHeatMap heatMap={porterDeepAnalysis.heat_map} />
          )}
          {porterView === 'matrix' && porterDeepAnalysis && (
            <PorterAttractivenessMatrix attractivenessMatrix={porterDeepAnalysis.attractiveness_matrix} />
          )}
          {porterView === 'confidence' && (
            <PorterConfidenceOverlay forces={porterForces} />
          )}
          {porterView === 'bridge' && porterDeepAnalysis && (
            <PorterStrategyBridge
              topActions={porterDeepAnalysis.top_actions}
              attractivenessMatrix={porterDeepAnalysis.attractiveness_matrix}
            />
          )}
          {porterView === 'network' && porterDeepAnalysis && (
            <PorterForceNetwork heatMap={porterDeepAnalysis.heat_map} forces={porterForces} />
          )}
          {porterView === 'battlefield' && (
            <PorterBattlefield forces={porterForces} />
          )}
          {porterView === 'dna' && (
            <PorterIndustryDNA forces={porterForces} industryAssessment={porterData?.industry_assessment} />
          )}
          {porterView === 'montecarlo' && (
            <PorterMonteCarlo forces={porterForces} />
          )}
          {porterView === 'onepager' && (
            <PorterOnePager
              forces={porterForces}
              executiveSummary={porterDeepAnalysis?.executive_summary}
              topActions={porterDeepAnalysis?.top_actions || []}
              industryAssessment={porterData?.industry_assessment}
            />
          )}
          {porterView === 'timeline' && (
            <PorterTimeline forces={porterForces} />
          )}
          {porterView === 'blueocean' && (
            <PorterBlueOceanOverlay forces={porterForces} />
          )}
          {porterView === 'warroom' && (
            <PorterWarRoom forces={porterForces} />
          )}
          {porterView === 'bscbridge' && (
            <PorterBscBridge forces={porterForces} />
          )}
          {porterView === 'cockpit' && (
            <PorterIntelligenceCockpit
              forces={porterForces}
              porterDeep={porterDeepAnalysis}
              industryAssessment={porterData?.industry_assessment}
            />
          )}
        </div>
      )}
    </div>
  );
}
