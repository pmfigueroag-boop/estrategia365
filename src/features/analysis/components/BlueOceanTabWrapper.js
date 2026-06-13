'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import BlueOceanCanvas from './BlueOceanCanvas';
import dynamic from 'next/dynamic';

const BoStrategyCanvas = dynamic(() => import('@/features/charts/components/BoStrategyCanvas'), { ssr: false });
const BoErrcGrid = dynamic(() => import('@/features/charts/components/BoErrcGrid'), { ssr: false });
const BoValueDivergence = dynamic(() => import('@/features/charts/components/BoValueDivergence'), { ssr: false });
const BoCompetitorRadar = dynamic(() => import('@/features/charts/components/BoCompetitorRadar'), { ssr: false });
const BoStrategicDNA = dynamic(() => import('@/features/charts/components/BoStrategicDNA'), { ssr: false });
const BoNonCustomerMap = dynamic(() => import('@/features/charts/components/BoNonCustomerMap'), { ssr: false });
const BoSimulator = dynamic(() => import('@/features/charts/components/BoSimulator'), { ssr: false });
const BoCockpit = dynamic(() => import('@/features/charts/components/BoCockpit'), { ssr: false });

const BO_TABS = [
  { id: 'cockpit',     label: '🏙️ Cockpit',            premium: true },
  { id: 'canvas',      label: '🌊 Strategy Canvas',   premium: true },
  { id: 'errc',        label: '🎯 ERRC Grid',         premium: true },
  { id: 'divergence',  label: '📐 Divergencia',       premium: true },
  { id: 'radar',       label: '🎯 Radar',             premium: true },
  { id: 'dna',         label: '🧬 Strategic DNA',      premium: true },
  { id: 'noncustomer', label: '🌍 Non-Customers',     premium: true },
  { id: 'simulator',   label: '🧪 Simulator',          premium: true },
  { id: 'classic',     label: '📋 Clásico' },
];

export default function BlueOceanTabWrapper({ planId, toast }) {
  const [data, setData] = useState(null);
  const [factors, setFactors] = useState([]);
  const [boView, setBoView] = useState('cockpit');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (planId) {
      api.getBlueOcean(planId)
        .then(d => { setData(d); setFactors(d.factors || []); })
        .catch(() => {});
    }
  }, [planId]);

  const handleGenerate = async () => {
    if (!planId) { toast.warning('No hay plan activo.'); return; }
    setIsGenerating(true);
    try {
      const d = await api.generateBlueOcean(planId);
      setData(d);
      setFactors(d.factors || []);
      toast.success('Blue Ocean Canvas generado.');
      window.dispatchEvent(new Event('readiness-update'));
    } catch (e) { toast.error(e.message); }
    setIsGenerating(false);
  };

  const updateProposed = (idx, val) => {
    setFactors(prev => prev.map((f, i) => i === idx ? { ...f, proposed_score: val } : f));
  };

  if (!data) {
    return (
      <div className="animate-fade-in">
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌊</div>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Blue Ocean Intelligence Suite</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 520, margin: '0 auto 2rem' }}>
            La IA analizará tus documentos, PESTEL y Porter para generar factores competitivos y proponer una curva de valor de océano azul (Kim & Mauborgne, 2005).
          </p>
          <button onClick={handleGenerate} disabled={isGenerating} className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 2rem', opacity: isGenerating ? 0.5 : 1 }}>
            {isGenerating ? '⏳ Analizando...' : '🤖 Generar Canvas'}
          </button>
        </div>
      </div>
    );
  }

  const actions = data.actions || [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: '0.35rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {BO_TABS.map(v => (
            <button key={v.id} onClick={() => setBoView(v.id)} style={{
              padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem',
              border: `1px solid ${boView === v.id ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`,
              background: boView === v.id ? 'rgba(99,102,241,0.12)' : 'transparent',
              color: boView === v.id ? '#818cf8' : 'var(--text-secondary)',
              cursor: 'pointer', fontWeight: boView === v.id ? 700 : 400, transition: 'all 0.2s',
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

      {boView === 'cockpit'     && <BoCockpit factors={factors} actions={actions} summary={data.rationale} />}
      {boView === 'canvas'      && <BoStrategyCanvas factors={factors} onUpdate={updateProposed} summary={data.rationale} />}
      {boView === 'errc'        && <BoErrcGrid factors={factors} actions={actions} />}
      {boView === 'divergence'  && <BoValueDivergence factors={factors} />}
      {boView === 'radar'       && <BoCompetitorRadar factors={factors} />}
      {boView === 'dna'         && <BoStrategicDNA factors={factors} />}
      {boView === 'noncustomer' && <BoNonCustomerMap factors={factors} />}
      {boView === 'simulator'   && <BoSimulator factors={factors} />}
      {boView === 'classic'     && <BlueOceanCanvas planId={planId} toast={toast} />}
    </div>
  );
}
