import React from 'react';
import dynamic from 'next/dynamic';
import FallbackBadge from '@/components/ui/FallbackBadge';
import FODAAnalysis from '@/features/analysis/components/FODAAnalysis';

const SwotTowsFlow = dynamic(() => import('@/features/charts/components/SwotTowsFlow'), { ssr: false });
const SwotTensionHeatmap = dynamic(() => import('@/features/charts/components/SwotTensionHeatmap'), { ssr: false });
const SwotInfluenceNetwork = dynamic(() => import('@/features/charts/components/SwotInfluenceNetwork'), { ssr: false });
const SwotPositioningMatrix = dynamic(() => import('@/features/charts/components/SwotPositioningMatrix'), { ssr: false });
const SwotConstellationMap = dynamic(() => import('@/features/charts/components/SwotConstellationMap'), { ssr: false });
const SwotScenarioSimulator = dynamic(() => import('@/features/charts/components/SwotScenarioSimulator'), { ssr: false });
const SwotInstitutionalCockpit = dynamic(() => import('@/features/charts/components/SwotInstitutionalCockpit'), { ssr: false });

export default function SwotTab({ planId, state, actions }) {
  const { swot, tows, swotView, isLoading, towsLoading } = state;
  const { setSwotView, handleScan, handleScanTows } = actions;

  return (
    <div className="animate-fade-in">
      <FallbackBadge items={swot} />

      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
        {[
          { id: 'cockpit',  label: '🏛️ Cockpit', premium: true },
          { id: 'matrix',  label: '📊 FODA Clásico' },
          { id: 'bridge',  label: '🔗 TOWS Bridge', premium: true },
          { id: 'heatmap', label: '🌡️ Tension Map', premium: true },
          { id: 'network', label: '🕸️ Red de Influencia', premium: true },
          { id: 'matrix2', label: '🎯 Positioning', premium: true },
          { id: 'cosmos',  label: '🌌 Constellation', premium: true },
          { id: 'scenario', label: '🎮 Scenarios', premium: true },
        ].map(v => (
          <button key={v.id} onClick={() => setSwotView(v.id)} style={{
            padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem',
            border: `1px solid ${swotView === v.id ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`,
            background: swotView === v.id ? 'rgba(99,102,241,0.15)' : 'transparent',
            color: swotView === v.id ? '#818cf8' : 'var(--text-secondary)',
            cursor: 'pointer', fontWeight: swotView === v.id ? 700 : 400, transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: '0.35rem',
          }}>
            {v.label}
            {v.premium && <span style={{ fontSize: '0.55rem', padding: '0.1rem 0.3rem', borderRadius: 4, background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}>PREMIUM</span>}
          </button>
        ))}
      </div>

      {swotView === 'matrix' && (
        <FODAAnalysis swot={swot} tows={tows} isLoading={isLoading} towsLoading={towsLoading}
          onScanFoda={() => handleScan('swot')}
          onScanTows={handleScanTows}
        />
      )}
      {swotView === 'cockpit'  && <SwotInstitutionalCockpit swot={swot} tows={tows} isLoading={isLoading} towsLoading={towsLoading} onScanFoda={() => handleScan('swot')} onScanTows={handleScanTows} />}
      {swotView === 'bridge'   && <SwotTowsFlow swot={swot} tows={tows} />}
      {swotView === 'heatmap'  && <SwotTensionHeatmap swot={swot} />}
      {swotView === 'network'  && <SwotInfluenceNetwork swot={swot} />}
      {swotView === 'matrix2'  && <SwotPositioningMatrix swot={swot} />}
      {swotView === 'cosmos'   && <SwotConstellationMap swot={swot} />}
      {swotView === 'scenario' && <SwotScenarioSimulator swot={swot} />}
    </div>
  );
}
