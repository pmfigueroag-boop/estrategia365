import React from 'react';
import dynamic from 'next/dynamic';

const InstitutionalCockpit = dynamic(() => import('@/components/charts/InstitutionalCockpit'), { ssr: false });
const ScenarioStressTest = dynamic(() => import('@/components/charts/ScenarioStressTest'), { ssr: false });

export default function InstitucionalTab({ planId, state, actions }) {
  const { instView } = state;
  const { setInstView } = actions;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', gap: '0.35rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
        {[
          { id: 'cockpit', label: '🏙️ Command Center', premium: true },
          { id: 'stress',  label: '⚡ Stress Test', premium: true },
        ].map(v => (
          <button key={v.id} onClick={() => setInstView(v.id)} style={{
            padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem',
            border: `1px solid ${instView === v.id ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`,
            background: instView === v.id ? 'rgba(99,102,241,0.12)' : 'transparent',
            color: instView === v.id ? '#818cf8' : 'var(--text-secondary)',
            cursor: 'pointer', fontWeight: instView === v.id ? 700 : 400, transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: '0.35rem',
          }}>
            {v.label}
            {v.premium && <span style={{ fontSize: '0.55rem', padding: '0.1rem 0.3rem', borderRadius: 4, background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>PREMIUM</span>}
          </button>
        ))}
      </div>
      {instView === 'cockpit' && <InstitutionalCockpit planId={planId} />}
      {instView === 'stress'  && <ScenarioStressTest planId={planId} />}
    </div>
  );
}
