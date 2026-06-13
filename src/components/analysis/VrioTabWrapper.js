'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import VRIOAnalysis from './VRIOAnalysis';
import dynamic from 'next/dynamic';

const VrioFortressMap = dynamic(() => import('@/components/charts/VrioFortressMap'), { ssr: false });
const VrioGenomeStrip = dynamic(() => import('@/components/charts/VrioGenomeStrip'), { ssr: false });
const VrioActionBridge = dynamic(() => import('@/components/charts/VrioActionBridge'), { ssr: false });
const VrioStrategicFunnel = dynamic(() => import('@/components/charts/VrioStrategicFunnel'), { ssr: false });
const VrioAdvantagePyramid = dynamic(() => import('@/components/charts/VrioAdvantagePyramid'), { ssr: false });
const VrioDependencyGraph = dynamic(() => import('@/components/charts/VrioDependencyGraph'), { ssr: false });
const VrioLifecycleTimeline = dynamic(() => import('@/components/charts/VrioLifecycleTimeline'), { ssr: false });
const VrioDynamicCapabilityEngine = dynamic(() => import('@/components/charts/VrioDynamicCapabilityEngine'), { ssr: false });

const VRIO_TABS = [
  { id: 'dc',       label: '🔬 Dynamic Capabilities', premium: true },
  { id: 'fortress', label: '🏰 Fortress',             premium: true },
  { id: 'genome',   label: '🧬 Genome',               premium: true },
  { id: 'bridge',   label: '🔗 Action Bridge',        premium: true },
  { id: 'funnel',   label: '🔽 Funnel',               premium: true },
  { id: 'pyramid',  label: '🔺 Pyramid',              premium: true },
  { id: 'deps',     label: '🕸️ Dependencies',        premium: true },
  { id: 'lifecycle',label: '📉 Lifecycle',            premium: true },
  { id: 'table',    label: '📋 Tabla Clásica' },
];

export default function VrioTabWrapper({ planId, toast }) {
  const [resources, setResources] = useState([]);
  const [vrioView, setVrioView] = useState('dc');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (planId) api.getVrio(planId).then(setResources).catch(() => {});
  }, [planId]);

  const handleGenerate = async () => {
    if (!planId) { toast.warning('No hay plan activo.'); return; }
    setIsGenerating(true);
    try {
      const data = await api.generateVrio(planId);
      setResources(data);
      toast.success('Análisis VRIO generado.');
      window.dispatchEvent(new Event('readiness-update'));
    } catch (e) { toast.error(e.message); }
    setIsGenerating(false);
  };

  if (!resources.length) {
    return (
      <div className="animate-fade-in">
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔑</div>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>VRIO — Recursos y Capacidades</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 520, margin: '0 auto 2rem' }}>
            La IA evaluará los recursos internos de tu organización usando el framework VRIO (Barney, 1991) para identificar fuentes de ventaja competitiva sostenible.
          </p>
          <button onClick={handleGenerate} disabled={isGenerating} className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 2rem', opacity: isGenerating ? 0.5 : 1 }}>
            {isGenerating ? '⏳ Analizando...' : '🤖 Generar Análisis VRIO'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: '0.35rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {VRIO_TABS.map(v => (
            <button key={v.id} onClick={() => setVrioView(v.id)} style={{
              padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem',
              border: `1px solid ${vrioView === v.id ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.1)'}`,
              background: vrioView === v.id ? 'rgba(16,185,129,0.12)' : 'transparent',
              color: vrioView === v.id ? '#34d399' : 'var(--text-secondary)',
              cursor: 'pointer', fontWeight: vrioView === v.id ? 700 : 400, transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '0.35rem',
            }}>
              {v.label}
              {v.premium && <span style={{ fontSize: '0.55rem', padding: '0.1rem 0.3rem', borderRadius: 4, background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>PREMIUM</span>}
            </button>
          ))}
        </div>
        <button onClick={handleGenerate} disabled={isGenerating} className="btn" style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem', opacity: isGenerating ? 0.5 : 1 }}>
          {isGenerating ? '⏳ Regenerando...' : '🔄 Regenerar'}
        </button>
      </div>

      {vrioView === 'dc'       && <VrioDynamicCapabilityEngine resources={resources} />}
      {vrioView === 'fortress' && <VrioFortressMap resources={resources} />}
      {vrioView === 'genome'   && <VrioGenomeStrip resources={resources} />}
      {vrioView === 'bridge'   && <VrioActionBridge resources={resources} />}
      {vrioView === 'funnel'   && <VrioStrategicFunnel resources={resources} />}
      {vrioView === 'pyramid'  && <VrioAdvantagePyramid resources={resources} />}
      {vrioView === 'deps'     && <VrioDependencyGraph resources={resources} />}
      {vrioView === 'lifecycle'&& <VrioLifecycleTimeline resources={resources} />}
      {vrioView === 'table'    && <VRIOAnalysis planId={planId} toast={toast} />}
    </div>
  );
}
