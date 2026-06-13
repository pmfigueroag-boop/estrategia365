'use client';
import { useState, useEffect } from 'react';
import api from '@/core/infrastructure/api';

/**
 * BCGMatrix — Henderson (1970) Portfolio Matrix
 * Extracted from analysis/page.js (Phase 2)
 */

const BCG_STYLES = {
  star: { bg: 'rgba(59,130,246,0.15)', border: 'var(--accent-primary)', icon: '⭐', label: 'Estrella', subtitle: 'Alto crecimiento · Alta participación' },
  cow: { bg: 'rgba(16,185,129,0.15)', border: 'var(--success-color)', icon: '🐄', label: 'Vaca Lechera', subtitle: 'Bajo crecimiento · Alta participación' },
  question: { bg: 'rgba(245,158,11,0.15)', border: 'var(--warning-color)', icon: '❓', label: 'Interrogante', subtitle: 'Alto crecimiento · Baja participación' },
  dog: { bg: 'rgba(239,68,68,0.15)', border: 'var(--danger-color)', icon: '🐕', label: 'Perro', subtitle: 'Bajo crecimiento · Baja participación' },
};

export default function BCGMatrix({ planId, toast }) {
  const [matrix, setMatrix] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (planId) {
      api.getBCG(planId)
        .then(data => setMatrix(data))
        .catch(() => {});
    }
  }, [planId]);

  const handleGenerate = async () => {
    if (!planId) { toast.warning("No hay plan activo."); return; }
    setIsGenerating(true);
    try {
      const data = await api.generateBCG(planId);
      setMatrix(data);
      toast.success("Matriz BCG generada.");
      window.dispatchEvent(new Event('readiness-update'));
    } catch (e) { toast.error(e.message); }
    setIsGenerating(false);
  };

  if (!matrix) {
    return (
      <div className="animate-fade-in">
        <div className="glass-panel" style={{padding:'3rem', textAlign:'center'}}>
          <div style={{fontSize:'3rem', marginBottom:'1rem'}}>📊</div>
          <h2 style={{fontSize:'1.3rem', marginBottom:'0.5rem'}}>Matriz BCG — Portafolio Estratégico</h2>
          <p style={{color:'var(--text-secondary)', fontSize:'0.9rem', maxWidth:520, margin:'0 auto 2rem'}}>
            La IA analizará tus documentos y estados financieros para clasificar líneas de servicio en los 4 cuadrantes BCG (Henderson, 1970).
          </p>
          <button onClick={handleGenerate} disabled={isGenerating} className="btn btn-primary" style={{fontSize:'1rem', padding:'0.75rem 2rem', opacity:isGenerating?0.5:1}}>
            {isGenerating ? '⏳ Analizando...' : '🤖 Generar Matriz BCG'}
          </button>
        </div>
      </div>
    );
  }

  const units = matrix.units || [];
  const quadrantCounts = {
    star: units.filter(u => u.quadrant === 'star').length,
    cow: units.filter(u => u.quadrant === 'cow').length,
    question: units.filter(u => u.quadrant === 'question').length,
    dog: units.filter(u => u.quadrant === 'dog').length,
  };
  const avgGrowth = units.length > 0 ? units.reduce((s, u) => s + u.growth, 0) / units.length : 0;
  const avgShare = units.length > 0 ? units.reduce((s, u) => s + u.share, 0) / units.length : 0;

  return (
    <div className="animate-fade-in">
      {matrix.summary && (
        <div className="glass-panel" style={{padding:'1rem 1.5rem', marginBottom:'1.5rem', borderLeft:'4px solid var(--accent-secondary)', fontSize:'0.85rem'}}>
          <strong style={{color:'var(--accent-secondary)'}}>🧠 Recomendación Estratégica:</strong> {matrix.summary}
        </div>
      )}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
        <h2 style={{fontSize:'1.3rem'}}>Matriz BCG — {units.length} Unidades</h2>
        <button onClick={handleGenerate} disabled={isGenerating} className="btn" style={{fontSize:'0.8rem', opacity:isGenerating?0.5:1}}>
          {isGenerating ? '⏳ Regenerando...' : '🔄 Regenerar'}
        </button>
      </div>

      {/* Portfolio KPIs */}
      <div style={{display:'flex', gap:'0.75rem', marginBottom:'1.5rem', flexWrap:'wrap'}}>
        {Object.entries(BCG_STYLES).map(([key, style]) => (
          <div key={key} className="glass-panel" style={{padding:'0.5rem 1rem', display:'flex', alignItems:'center', gap:'0.5rem', borderLeft:`3px solid ${style.border}`, background:style.bg}}>
            <span>{style.icon}</span>
            <span style={{fontSize:'0.85rem', fontWeight:600}}>{quadrantCounts[key]}</span>
            <span style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>{style.label}</span>
          </div>
        ))}
        <div className="glass-panel" style={{padding:'0.5rem 1rem', display:'flex', alignItems:'center', gap:'0.5rem', borderLeft:'3px solid var(--text-secondary)', marginLeft:'auto'}}>
          <span style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>Crecimiento avg: <strong style={{color:'var(--text-primary)'}}>{(avgGrowth*100).toFixed(0)}%</strong></span>
          <span style={{fontSize:'0.8rem', color:'var(--text-secondary)', marginLeft:'0.5rem'}}>Participación avg: <strong style={{color:'var(--text-primary)'}}>{(avgShare*100).toFixed(0)}%</strong></span>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem'}}>
        {['star', 'cow', 'question', 'dog'].map(qKey => {
          const style = BCG_STYLES[qKey];
          const qUnits = units.filter(u => u.quadrant === qKey);
          return (
            <div key={qKey} className="glass-panel animate-fade-in" style={{padding:'1.5rem', background:style.bg, borderLeft:`4px solid ${style.border}`}}>
              <h3 style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.25rem', fontSize:'1.1rem'}}>
                {style.icon} {style.label}
              </h3>
              <p style={{fontSize:'0.75rem', color:'var(--text-secondary)', marginBottom:'1rem'}}>{style.subtitle}</p>
              {qUnits.map((u, i) => (
                <div key={i} style={{padding:'0.75rem', background:'rgba(0,0,0,0.2)', borderRadius:'8px', marginBottom:'0.5rem'}}>
                  <strong>{u.name}</strong>
                  <div style={{display:'flex', gap:'1rem', fontSize:'0.85rem', color:'var(--text-secondary)', marginTop:'0.25rem'}}>
                    <span>📈 {(u.growth*100).toFixed(0)}%</span>
                    <span>📊 {(u.share*100).toFixed(0)}%</span>
                  </div>
                  {u.rationale && <p style={{fontSize:'0.8rem', color:'var(--text-secondary)', marginTop:'0.4rem', fontStyle:'italic'}}>💡 {u.rationale}</p>}
                  {u.strategic_action && (
                    <p style={{fontSize:'0.78rem', color:'var(--accent-primary)', marginTop:'0.3rem', fontWeight:500}}>
                      🎯 {u.strategic_action}
                    </p>
                  )}
                  {u.evidence && (
                    <p style={{fontSize:'0.72rem', color:'var(--text-secondary)', marginTop:'0.2rem', fontStyle:'italic', opacity:0.8}}>
                      📄 {u.evidence}
                    </p>
                  )}
                </div>
              ))}
              {qUnits.length === 0 && <p style={{color:'var(--text-secondary)', fontSize:'0.85rem', fontStyle:'italic'}}>Sin unidades en este cuadrante</p>}
            </div>
          );
        })}
      </div>

      <div className="glass-panel" style={{padding:'0.75rem 1rem', marginTop:'1rem', fontSize:'0.8rem', color:'var(--text-secondary)', borderLeft:'3px solid var(--accent-secondary)'}}>
        📚 <strong>BCG Matrix (Henderson, 1970):</strong> Clasifica unidades por tasa de crecimiento × participación relativa. Umbrales adaptativos basados en la mediana del portafolio. Cuadrantes validados server-side.
      </div>
    </div>
  );
}
