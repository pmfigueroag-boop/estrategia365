'use client';
import { useState, useEffect } from 'react';
import api from '@/core/infrastructure/api';

/**
 * BlueOceanCanvas — Kim & Mauborgne (2005) Strategy Canvas + ERRC Grid
 * Extracted from analysis/page.js (Phase 2)
 */

const ACTION_META = {
  eliminate: { label: 'Eliminar', icon: '❌', color: 'var(--danger-color)' },
  reduce: { label: 'Reducir', icon: '⬇️', color: 'var(--warning-color)' },
  raise: { label: 'Incrementar', icon: '⬆️', color: 'var(--accent-primary)' },
  create: { label: 'Crear', icon: '✨', color: 'var(--success-color)' },
};

export default function BlueOceanCanvas({ planId, toast }) {
  const [canvas, setCanvas] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [factors, setFactors] = useState([]);

  useEffect(() => {
    if (planId) {
      api.getBlueOcean(planId)
        .then(data => { setCanvas(data); setFactors(data.factors || []); })
        .catch(() => {});
    }
  }, [planId]);

  const handleGenerate = async () => {
    if (!planId) { toast.warning("No hay plan activo."); return; }
    setIsGenerating(true);
    try {
      const data = await api.generateBlueOcean(planId);
      setCanvas(data);
      setFactors(data.factors || []);
      toast.success("Blue Ocean Canvas generado.");
      window.dispatchEvent(new Event('readiness-update'));
    } catch (e) { toast.error(e.message); }
    setIsGenerating(false);
  };

  const updateProposed = (idx, val) => {
    setFactors(prev => prev.map((f, i) => i === idx ? { ...f, proposed_score: parseInt(val) } : f));
  };

  if (!canvas) {
    return (
      <div className="animate-fade-in">
        <div className="glass-panel" style={{padding:'3rem', textAlign:'center'}}>
          <div style={{fontSize:'3rem', marginBottom:'1rem'}}>🌊</div>
          <h2 style={{fontSize:'1.3rem', marginBottom:'0.5rem'}}>Strategy Canvas — Blue Ocean</h2>
          <p style={{color:'var(--text-secondary)', fontSize:'0.9rem', marginBottom:'2rem', maxWidth:500, margin:'0 auto 2rem'}}>
            La IA analizará tus documentos, PESTEL y Porter para generar factores competitivos y proponer una nueva curva de valor (Kim & Mauborgne, 2005).
          </p>
          <button onClick={handleGenerate} disabled={isGenerating} className="btn btn-primary" style={{fontSize:'1rem', padding:'0.75rem 2rem', opacity:isGenerating?0.5:1}}>
            {isGenerating ? '⏳ Analizando...' : '🤖 Generar Canvas'}
          </button>
        </div>
      </div>
    );
  }

  const actions = canvas.actions || [];

  return (
    <div className="animate-fade-in">
      {canvas.rationale && (
        <div className="glass-panel" style={{padding:'1rem 1.5rem', marginBottom:'1.5rem', borderLeft:'4px solid var(--accent-secondary)', fontSize:'0.85rem'}}>
          <strong style={{color:'var(--accent-secondary)'}}>🧠 Lógica Estratégica:</strong> {canvas.rationale}
        </div>
      )}
      <div className="glass-panel card" style={{marginBottom:'1.5rem'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
          <h2 style={{fontSize:'1.3rem'}}>Strategy Canvas — Curva de Valor</h2>
          <button onClick={handleGenerate} disabled={isGenerating} className="btn" style={{fontSize:'0.8rem', opacity:isGenerating?0.5:1}}>
            {isGenerating ? '⏳ Regenerando...' : '🔄 Regenerar'}
          </button>
        </div>
        <div style={{display:'flex', gap:'1rem', justifyContent:'center', marginBottom:'1rem', fontSize:'0.85rem'}}>
          <span style={{display:'flex', alignItems:'center', gap:'0.5rem'}}><span style={{width:12, height:12, borderRadius:2, background:'var(--danger-color)', display:'inline-block'}}></span> Industria Actual</span>
          <span style={{display:'flex', alignItems:'center', gap:'0.5rem'}}><span style={{width:12, height:12, borderRadius:2, background:'var(--accent-primary)', display:'inline-block'}}></span> Nuestra Propuesta</span>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:'0.75rem'}}>
          {factors.map((f, i) => {
            const delta = f.proposed_score - f.industry_score;
            const deltaColor = delta > 0 ? 'var(--success-color)' : delta < 0 ? 'var(--danger-color)' : 'var(--text-secondary)';
            return (
              <div key={i} style={{display:'grid', gridTemplateColumns:'180px 1fr 30px 1fr 60px', gap:'0.5rem', alignItems:'center'}}>
                <span style={{fontSize:'0.85rem', fontWeight:500, textAlign:'right'}} title={f.evidence || ''}>{f.name}</span>
                <div style={{height:10, borderRadius:5, background:'rgba(239,68,68,0.12)', overflow:'hidden'}}>
                  <div style={{height:'100%', width:`${(f.industry_score/5)*100}%`, background:'var(--danger-color)', borderRadius:5, transition:'width 0.5s'}}></div>
                </div>
                <span style={{fontSize:'0.75rem', color:'var(--text-secondary)', textAlign:'center'}}>{f.industry_score}</span>
                <div style={{position:'relative', height:10, borderRadius:5, background:'rgba(59,130,246,0.12)', overflow:'hidden'}}>
                  <div style={{height:'100%', width:`${(f.proposed_score/5)*100}%`, background:'var(--accent-primary)', borderRadius:5, transition:'width 0.3s'}}></div>
                  <input type="range" min="1" max="5" value={f.proposed_score} onChange={e => updateProposed(i, e.target.value)}
                    style={{position:'absolute', top:-6, left:0, width:'100%', height:22, opacity:0, cursor:'pointer'}}/>
                </div>
                <span style={{fontSize:'0.75rem', fontWeight:600, color:deltaColor, textAlign:'center'}}>
                  {f.proposed_score} {delta > 0 ? `↑${delta}` : delta < 0 ? `↓${Math.abs(delta)}` : '='}
                </span>
              </div>
            );
          })}
        </div>
        <p style={{fontSize:'0.75rem', color:'var(--text-secondary)', marginTop:'1rem', textAlign:'center'}}>
          💡 Desliza sobre las barras azules para ajustar tu propuesta — pasa el cursor sobre cada factor para ver la evidencia
        </p>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'1rem'}}>
        {['eliminate', 'reduce', 'raise', 'create'].map(actionKey => {
          const meta = ACTION_META[actionKey];
          const actionData = actions.find(a => a.action === actionKey);
          const items = actionData ? actionData.items : [];
          return (
            <div key={actionKey} className="glass-panel animate-fade-in" style={{padding:'1.25rem', borderTop:`3px solid ${meta.color}`}}>
              <h4 style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.75rem'}}>{meta.icon} {meta.label}</h4>
              {items.map((item, j) => <p key={j} style={{fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:'0.4rem'}}>• {item}</p>)}
              {items.length === 0 && <p style={{fontSize:'0.8rem', color:'var(--text-secondary)', fontStyle:'italic'}}>Sin datos</p>}
            </div>
          );
        })}
      </div>

      <div className="glass-panel" style={{padding:'0.75rem 1rem', marginTop:'1rem', fontSize:'0.8rem', color:'var(--text-secondary)', borderLeft:'3px solid var(--accent-secondary)'}}>
        📚 <strong>Blue Ocean Strategy (Kim & Mauborgne, 2005):</strong> Framework ERRC — Eliminar, Reducir, Incrementar, Crear factores competitivos para abrir espacios de mercado no contestados. Scores validados server-side (1-5).
      </div>
    </div>
  );
}
