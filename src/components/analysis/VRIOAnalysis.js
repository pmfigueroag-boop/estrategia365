'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

/**
 * VRIOAnalysis — Barney (1991) VRIO Framework
 * Extracted from analysis/page.js (Phase 2)
 */

const VRIO_IMPLICATION = {
  sustained_advantage: { label: 'Ventaja Sostenida', color: 'var(--success-color)', icon: '🏆', bg: 'rgba(16,185,129,0.15)' },
  unused_advantage: { label: 'Ventaja No Explotada', color: '#a855f7', icon: '🔓', bg: 'rgba(168,85,247,0.15)' },
  temporary_advantage: { label: 'Ventaja Temporal', color: 'var(--accent-primary)', icon: '⏳', bg: 'rgba(59,130,246,0.15)' },
  parity: { label: 'Paridad Competitiva', color: 'var(--warning-color)', icon: '⚖️', bg: 'rgba(245,158,11,0.15)' },
  disadvantage: { label: 'Desventaja', color: 'var(--danger-color)', icon: '⚠️', bg: 'rgba(239,68,68,0.15)' },
};

export default function VRIOAnalysis({ planId, toast }) {
  const [resources, setResources] = useState([]);
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

  if (resources.length === 0) {
    return (
      <div className="animate-fade-in">
        <div className="glass-panel" style={{padding:'3rem', textAlign:'center'}}>
          <div style={{fontSize:'3rem', marginBottom:'1rem'}}>🔑</div>
          <h2 style={{fontSize:'1.3rem', marginBottom:'0.5rem'}}>Análisis VRIO — Recursos y Capacidades</h2>
          <p style={{color:'var(--text-secondary)', fontSize:'0.9rem', maxWidth:520, margin:'0 auto 2rem'}}>
            La IA evaluará los recursos internos de tu organización usando el framework VRIO (Barney, 1991) para identificar fuentes de ventaja competitiva sostenible.
          </p>
          <button onClick={handleGenerate} disabled={isGenerating} className="btn btn-primary" style={{fontSize:'1rem', padding:'0.75rem 2rem', opacity:isGenerating?0.5:1}}>
            {isGenerating ? '⏳ Analizando...' : '🤖 Generar Análisis VRIO'}
          </button>
        </div>
      </div>
    );
  }

  const counts = {
    sustained: resources.filter(r => r.competitive_implication === 'sustained_advantage').length,
    unused: resources.filter(r => r.competitive_implication === 'unused_advantage').length,
    temporary: resources.filter(r => r.competitive_implication === 'temporary_advantage').length,
    parity: resources.filter(r => r.competitive_implication === 'parity').length,
    disadvantage: resources.filter(r => r.competitive_implication === 'disadvantage').length,
  };

  const VrioBadge = ({ value }) => (
    <span style={{display:'inline-block', width:24, height:24, borderRadius:'50%', lineHeight:'24px', fontSize:'0.8rem', textAlign:'center',
      background: value ? 'var(--success-color)' : 'rgba(239,68,68,0.3)',
      color: value ? '#fff' : 'var(--danger-color)', fontWeight:700}}>
      {value ? '✓' : '✗'}
    </span>
  );

  return (
    <div className="animate-fade-in">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
        <h2 style={{fontSize:'1.3rem'}}>Análisis VRIO — {resources.length} Recursos</h2>
        <button onClick={handleGenerate} disabled={isGenerating} className="btn" style={{fontSize:'0.8rem', opacity:isGenerating?0.5:1}}>
          {isGenerating ? '⏳ Regenerando...' : '🔄 Regenerar'}
        </button>
      </div>

      {/* Summary badges */}
      <div style={{display:'flex', gap:'0.75rem', marginBottom:'1.5rem', flexWrap:'wrap'}}>
        {Object.entries(VRIO_IMPLICATION).map(([key, meta]) => {
          const count = counts[key.replace('_advantage', '')] ?? counts[key] ?? 0;
          return (
            <div key={key} className="glass-panel" style={{padding:'0.5rem 1rem', display:'flex', alignItems:'center', gap:'0.5rem', borderLeft:`3px solid ${meta.color}`, background:meta.bg}}>
              <span>{meta.icon}</span>
              <span style={{fontSize:'0.85rem', fontWeight:600}}>{count}</span>
              <span style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>{meta.label}</span>
            </div>
          );
        })}
      </div>

      {/* VRIO Table */}
      <div className="glass-panel" style={{padding:'1.5rem', overflowX:'auto'}}>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:'0.9rem'}}>
          <thead>
            <tr style={{borderBottom:'2px solid rgba(255,255,255,0.1)'}}>
              <th style={{textAlign:'left', padding:'0.75rem 0.5rem', fontWeight:600}}>Recurso</th>
              <th style={{textAlign:'center', padding:'0.75rem 0.25rem', fontWeight:600, width:40}}>V</th>
              <th style={{textAlign:'center', padding:'0.75rem 0.25rem', fontWeight:600, width:40}}>R</th>
              <th style={{textAlign:'center', padding:'0.75rem 0.25rem', fontWeight:600, width:40}}>I</th>
              <th style={{textAlign:'center', padding:'0.75rem 0.25rem', fontWeight:600, width:40}}>O</th>
              <th style={{textAlign:'left', padding:'0.75rem 0.5rem', fontWeight:600}}>Implicación</th>
              <th style={{textAlign:'left', padding:'0.75rem 0.5rem', fontWeight:600}}>Recomendación</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((r, i) => {
              const impl = VRIO_IMPLICATION[r.competitive_implication] || VRIO_IMPLICATION.parity;
              return (
                <tr key={r.id || i} style={{borderBottom:'1px solid rgba(255,255,255,0.05)', animationDelay:`${i*60}ms`}} className="animate-fade-in">
                  <td style={{padding:'0.75rem 0.5rem'}}>
                    <strong>{r.resource_name}</strong>
                    <p style={{fontSize:'0.8rem', color:'var(--text-secondary)', marginTop:'0.15rem'}}>{r.description}</p>
                  </td>
                  <td style={{textAlign:'center', padding:'0.5rem 0.25rem'}}><VrioBadge value={r.valuable} /></td>
                  <td style={{textAlign:'center', padding:'0.5rem 0.25rem'}}><VrioBadge value={r.rare} /></td>
                  <td style={{textAlign:'center', padding:'0.5rem 0.25rem'}}><VrioBadge value={r.costly_to_imitate} /></td>
                  <td style={{textAlign:'center', padding:'0.5rem 0.25rem'}}><VrioBadge value={r.organized} /></td>
                  <td style={{padding:'0.75rem 0.5rem'}}>
                    <span style={{padding:'0.2rem 0.6rem', borderRadius:12, fontSize:'0.8rem', fontWeight:600, background:impl.bg, color:impl.color, whiteSpace:'nowrap'}}>
                      {impl.icon} {impl.label}
                    </span>
                  </td>
                  <td style={{padding:'0.75rem 0.5rem', fontSize:'0.85rem', color:'var(--text-secondary)', maxWidth:200}}>
                    {r.recommendation}
                    {r.evidence && (
                      <p style={{fontSize:'0.72rem', color:'var(--accent-primary)', marginTop:'0.3rem', fontStyle:'italic'}}>
                        📄 {r.evidence}
                      </p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="glass-panel" style={{padding:'0.75rem 1rem', marginTop:'1rem', fontSize:'0.8rem', color:'var(--text-secondary)', borderLeft:'3px solid var(--accent-secondary)'}}>
        📚 <strong>VRIO (Barney, 1991):</strong> V=Valioso, R=Raro, I=Costoso de Imitar, O=Organizado para Explotar. Solo los recursos V+R+I+O generan ventaja competitiva sostenida.
      </div>
    </div>
  );
}
