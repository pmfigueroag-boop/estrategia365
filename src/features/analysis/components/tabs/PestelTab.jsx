import React from 'react';
import FallbackBadge, { FallbackItemTag } from '@/components/FallbackBadge';
import ManualPestelForm from '@/features/analysis/components/ManualPestelForm';
import { 
  PestelRadar, PestelHeatMap, PestelPriorityMatrix, PestelExecutiveSummary, 
  PestelSignalDetail, PestelSignalFeed, PestelStrategyBridge, PestelVolatilityGauge, 
  PestelEarlyWarnings, PestelCorrelationGraph, PestelExposureDashboard, 
  PestelScenarioMatrix, PestelImpactCascade, PestelConfidenceOverlay, PestelForesightCockpit 
} from '@/features/charts/components';
import api from '@/lib/api';

const SEVERITY_COLORS = { high: 'var(--danger-color)', medium: 'var(--warning-color)', low: 'var(--success-color)' };
const FACTOR_LABELS = { P: 'Político', E: 'Económico', S: 'Social', T: 'Tecnológico', E2: 'Ecológico', L: 'Legal' };

export default function PestelTab({ 
  planId, toast, state, actions 
}) {
  const { 
    pestel, pestelDeepAnalysis, pestelDriftData, pestelEarlyWarnings, 
    pestelView, selectedSignal, showAddForm, isLoading 
  } = state;
  const { 
    setPestelView, setSelectedSignal, setShowAddForm, handleScan, handleManualAdd 
  } = actions;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.3rem' }}>Radar PESTEL <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>— {pestel.length} señales</span></h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {pestel.length > 0 && (
            <button onClick={() => { api.exportPestelCsv(planId).then(() => toast.success('CSV exportado')).catch(e => toast.error(e.message)); }} className="btn glass-panel" style={{ background: 'transparent', fontSize: '0.85rem' }}>
              📥 CSV
            </button>
          )}
          <button onClick={() => setShowAddForm(showAddForm === 'pestel' ? null : 'pestel')} className="btn glass-panel" style={{ background: 'transparent', fontSize: '0.85rem' }}>
            ➕ Manual
          </button>
          <button onClick={() => handleScan('pestel')} disabled={isLoading} className="btn btn-primary" style={{ fontSize: '0.85rem', opacity: isLoading ? 0.5 : 1 }}>
            {isLoading ? '⏳ Escaneando...' : '🔄 Escanear con IA'}
          </button>
        </div>
      </div>

      <FallbackBadge items={pestel} />
      <PestelRadar riskDistribution={pestelDeepAnalysis?.risk_distribution} signals={pestel} />

      {showAddForm === 'pestel' && (
        <ManualPestelForm onSubmit={(data) => handleManualAdd('pestel', data)} onCancel={() => setShowAddForm(null)} />
      )}
      
      <div className="flex-col gap-4">
        {[...pestel].sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0)).map((s, i) => (
          <div key={s.id || i} className="glass-panel animate-fade-in" style={{ padding: '1rem', borderLeft: `4px solid ${SEVERITY_COLORS[s.severity]}`, animationDelay: `${i * 60}ms`, cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }} onClick={() => setSelectedSignal(s)} onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = `0 0 20px ${SEVERITY_COLORS[s.severity]}22`; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
            <div className="flex justify-between" style={{ marginBottom: '0.25rem' }}>
              <strong>{FACTOR_LABELS[s.factor] || s.factor}<FallbackItemTag source={s.source} /></strong>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {s.priority_score != null && <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(139,92,246,0.2)', color: '#a78bfa', fontWeight: 600 }}>⚡ {s.priority_score}</span>}
                <span style={{ color: SEVERITY_COLORS[s.severity], fontSize: '0.85rem', fontWeight: 600 }}>{s.severity}</span>
              </div>
            </div>
            <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{s.title}</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{s.description}</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}><strong>Impacto:</strong> {s.strategic_impact}</p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {s.trend && <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: s.trend === 'declining' ? 'rgba(239,68,68,0.15)' : s.trend === 'improving' ? 'rgba(34,197,94,0.15)' : 'rgba(250,204,21,0.15)', color: s.trend === 'declining' ? '#f87171' : s.trend === 'improving' ? '#4ade80' : '#facc15' }}>{s.trend === 'declining' ? '📉 Empeorando' : s.trend === 'improving' ? '📈 Mejorando' : '➡️ Estable'}</span>}
              {s.probability != null && (
                <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Prob:</span>
                  <span style={{ width: '60px', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)', display: 'inline-block', position: 'relative', overflow: 'hidden' }}>
                    <span style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${s.probability}%`, borderRadius: '3px', background: s.probability >= 70 ? '#f87171' : s.probability >= 40 ? '#facc15' : '#4ade80' }}></span>
                  </span>
                  <span style={{ fontWeight: 600, color: s.probability >= 70 ? '#f87171' : s.probability >= 40 ? '#facc15' : '#4ade80' }}>{s.probability}%</span>
                </span>
              )}
              {s.timeframe && <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>🕐 {s.timeframe === 'short' ? 'Corto plazo' : s.timeframe === 'medium' ? 'Mediano plazo' : 'Largo plazo'}</span>}
            </div>
          </div>
        ))}
        {pestel.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>Presiona "Escanear con IA" para generar el análisis.</p>}
      </div>

      {selectedSignal && <PestelSignalDetail signal={selectedSignal} onClose={() => setSelectedSignal(null)} />}

      {pestel.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { id: 'cockpit', label: '📡 Cockpit' },
              { id: 'signals', label: '📰 Signals' },
              { id: 'executive', label: '📊 Ejecutivo' },
              { id: 'heatmap', label: '🔥 Heat Map' },
              { id: 'matrix', label: '🎯 Matriz' },
              { id: 'scenario', label: '🎲 Escenarios' },
              { id: 'bridge', label: '🔗 Bridge' },
              { id: 'cascade', label: '🌊 Cascade' },
              { id: 'svi', label: '🌡 SVI' },
              { id: 'warnings', label: '⚠️ Alertas' },
              { id: 'correlation', label: '🕸️ Red Causal' },
              { id: 'exposure', label: '🛡️ Exposicion' },
              { id: 'confidence', label: '🧠 Confianza' },
            ].map(v => (
              <button key={v.id} onClick={() => setPestelView(v.id)}
                className={`btn ${pestelView === v.id ? 'btn-primary' : 'glass-panel'}`}
                style={{ fontSize: '0.75rem', padding: '5px 10px', background: pestelView !== v.id ? 'transparent' : undefined }}>
                {v.label}
              </button>
            ))}
          </div>

          {pestelView === 'cockpit' && pestelDeepAnalysis && (
            <PestelForesightCockpit deepAnalysis={pestelDeepAnalysis} svi={pestelDeepAnalysis.svi} driftData={pestelDriftData} earlyWarnings={pestelEarlyWarnings} />
          )}
          {pestelView === 'signals' && (
            <PestelSignalFeed signals={pestel} onSignalClick={setSelectedSignal} />
          )}
          {pestelView === 'executive' && pestelDeepAnalysis && (
            <PestelExecutiveSummary
              executiveSummary={pestelDeepAnalysis.executive_summary}
              riskDistribution={pestelDeepAnalysis.risk_distribution}
              topActions={pestelDeepAnalysis.top_actions}
            />
          )}
          {pestelView === 'heatmap' && pestelDeepAnalysis && (
            <PestelHeatMap heatMap={pestelDeepAnalysis.heat_map} />
          )}
          {pestelView === 'matrix' && pestelDeepAnalysis && (
            <PestelPriorityMatrix priorityMatrix={pestelDeepAnalysis.priority_matrix} />
          )}
          {pestelView === 'scenario' && pestelDeepAnalysis && (
            <PestelScenarioMatrix priorityMatrix={pestelDeepAnalysis.priority_matrix} />
          )}
          {pestelView === 'bridge' && pestelDeepAnalysis && (
            <PestelStrategyBridge topActions={pestelDeepAnalysis.top_actions} />
          )}
          {pestelView === 'cascade' && pestelDeepAnalysis && (
            <PestelImpactCascade priorityMatrix={pestelDeepAnalysis.priority_matrix} />
          )}
          {pestelView === 'svi' && pestelDeepAnalysis && (
            <PestelVolatilityGauge svi={pestelDeepAnalysis.svi} driftData={pestelDriftData} />
          )}
          {pestelView === 'warnings' && (
            <PestelEarlyWarnings warnings={pestelEarlyWarnings} />
          )}
          {pestelView === 'correlation' && pestelDeepAnalysis && (
            <PestelCorrelationGraph heatMap={pestelDeepAnalysis.heat_map} riskDistribution={pestelDeepAnalysis.risk_distribution} />
          )}
          {pestelView === 'exposure' && pestelDeepAnalysis && (
            <PestelExposureDashboard riskDistribution={pestelDeepAnalysis.risk_distribution} />
          )}
          {pestelView === 'confidence' && pestelDeepAnalysis && (
            <PestelConfidenceOverlay confidenceMetrics={pestelDeepAnalysis.confidence_metrics} priorityMatrix={pestelDeepAnalysis.priority_matrix} />
          )}
        </div>
      )}
    </div>
  );
}
