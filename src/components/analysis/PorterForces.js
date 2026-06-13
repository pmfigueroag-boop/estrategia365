'use client';
import { useState } from 'react';

/**
 * PorterForces — Porter 5 Forces dynamic analysis display
 * Extracted from analysis/page.js (Phase 1: Frontend Decomposition)
 */

const FORCE_LABELS = { rivalry: 'Rivalidad Competitiva', new_entrants: 'Amenaza de Nuevos Entrantes', substitutes: 'Amenaza de Sustitutos', buyer_power: 'Poder del Comprador', supplier_power: 'Poder del Proveedor' };
const PRESSURE_LABELS = {
  1: { text: 'Muy Baja', color: 'var(--success-color)' },
  2: { text: 'Baja', color: 'var(--success-color)' },
  3: { text: 'Moderada', color: 'var(--warning-color)' },
  4: { text: 'Alta', color: 'var(--danger-color)' },
  5: { text: 'Muy Alta', color: 'var(--danger-color)' },
};

export default function PorterForces({ porter, isLoading, onScan }) {
  const [expanded, setExpanded] = useState({});
  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  if (porter.length === 0) {
    return (
      <div className="animate-fade-in">
        <div className="glass-panel" style={{padding:'3rem', textAlign:'center'}}>
          <div style={{fontSize:'3rem', marginBottom:'1rem'}}>⚔️</div>
          <h2 style={{fontSize:'1.3rem', marginBottom:'0.5rem'}}>5 Fuerzas de Porter — Presión Competitiva</h2>
          <p style={{color:'var(--text-secondary)', fontSize:'0.9rem', maxWidth:520, margin:'0 auto 2rem'}}>
            La IA evaluará las 5 fuerzas con sub-determinantes (Porter, Competitive Strategy, 1980) usando datos actualizados vía Google Search.
          </p>
          <button onClick={onScan} disabled={isLoading} className="btn btn-primary" style={{fontSize:'1rem', padding:'0.75rem 2rem', opacity:isLoading?0.5:1}}>
            {isLoading ? '⏳ Analizando...' : '🤖 Analizar con IA'}
          </button>
        </div>
      </div>
    );
  }

  const maxScore = Math.max(...porter.map(f => f.score));
  const dominants = porter.filter(f => f.score === maxScore);
  const isDominant = (force) => dominants.some(d => d.force === force);
  const avgPressure = (porter.reduce((a, f) => a + f.score, 0) / porter.length).toFixed(1);
  const avgColor = avgPressure >= 3.5 ? 'var(--danger-color)' : avgPressure >= 2.5 ? 'var(--warning-color)' : 'var(--success-color)';
  const domColor = PRESSURE_LABELS[maxScore]?.color || 'var(--danger-color)';

  return (
    <div className="animate-fade-in">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
        <h2 style={{fontSize:'1.3rem'}}>5 Fuerzas de Porter <span style={{fontSize:'0.85rem', color:'var(--text-secondary)', fontWeight:'normal'}}>— Presión Competitiva</span></h2>
        <button onClick={onScan} disabled={isLoading} className="btn" style={{fontSize:'0.8rem', opacity:isLoading?0.5:1}}>
          {isLoading ? '⏳ Regenerando...' : '🔄 Regenerar'}
        </button>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.5rem'}}>
        <div className="glass-panel" style={{padding:'1.25rem', borderLeft:`4px solid ${domColor}`}}>
          <p style={{fontSize:'0.75rem', color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'0.25rem'}}>
            {dominants.length > 1 ? `Fuerzas Dominantes (${dominants.length} empatadas)` : 'Fuerza Dominante'}
          </p>
          {dominants.map((d, i) => (
            <p key={d.force} style={{fontSize:'1.05rem', fontWeight:700, marginBottom: i < dominants.length - 1 ? '0.15rem' : 0}}>
              {FORCE_LABELS[d.force]}
            </p>
          ))}
          <p style={{fontSize:'0.85rem', color: domColor, marginTop:'0.25rem'}}>
            Presión {PRESSURE_LABELS[maxScore]?.text} ({maxScore}/5)
          </p>
        </div>
        <div className="glass-panel" style={{padding:'1.25rem', textAlign:'center'}}>
          <p style={{fontSize:'0.75rem', color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'0.25rem'}}>Presión Promedio</p>
          <div style={{fontSize:'2rem', fontWeight:800, color: avgColor}}>{avgPressure}<span style={{fontSize:'1rem', fontWeight:400}}>/5</span></div>
          <div style={{width:'100%', height:6, borderRadius:3, background:'rgba(255,255,255,0.1)', marginTop:'0.5rem', overflow:'hidden'}}>
            <div style={{height:'100%', width:`${(avgPressure/5)*100}%`, background:avgColor, borderRadius:3, transition:'width 0.5s'}} />
          </div>
        </div>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
        {porter.map((f, i) => {
          const pct = (f.score / 5) * 100;
          const pLabel = PRESSURE_LABELS[f.score] || PRESSURE_LABELS[3];
          const isDOM = isDominant(f.force);
          const subs = f.sub_determinants || [];
          const isExpanded = expanded[f.id || i];

          return (
            <div key={f.id||i} className="glass-panel animate-fade-in"
              style={{padding:'1.25rem', borderLeft:`4px solid ${pLabel.color}`, animationDelay:`${i*80}ms`,
                      outline: isDOM ? `2px solid ${pLabel.color}` : 'none'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem'}}>
                <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                  <strong style={{fontSize:'1rem'}}>{FORCE_LABELS[f.force]}</strong>
                  {isDOM && <span style={{fontSize:'0.7rem', padding:'0.15rem 0.4rem', borderRadius:4, background:pLabel.color, color:'#fff', fontWeight:700}}>DOMINANTE</span>}
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                  <span style={{fontSize:'0.8rem', color:pLabel.color, fontWeight:600}}>Presión {pLabel.text}</span>
                  <span style={{color:pLabel.color, fontWeight:700, fontSize:'1.1rem'}}>{f.score}/5</span>
                </div>
              </div>
              <div style={{height:8, borderRadius:4, background:'rgba(255,255,255,0.08)', marginBottom:'0.75rem', overflow:'hidden'}}>
                <div style={{height:'100%', width:`${pct}%`, background:pLabel.color, borderRadius:4, transition:'width 0.5s'}} />
              </div>
              <p style={{color:'var(--text-secondary)', fontSize:'0.9rem', marginBottom:'0.25rem'}}>{f.description}</p>
              <p style={{fontSize:'0.85rem', marginBottom:'0.5rem'}}><strong>Impacto:</strong> {f.impact}</p>

              {subs.length > 0 && (
                <>
                  <button onClick={() => toggleExpand(f.id || i)}
                    style={{background:'none', border:'none', color:'var(--accent-primary)', cursor:'pointer', fontSize:'0.8rem', padding:'0.25rem 0', display:'flex', alignItems:'center', gap:'0.3rem'}}>
                    <span style={{transform: isExpanded ? 'rotate(90deg)' : 'none', transition:'transform 0.2s', display:'inline-block'}}>▶</span>
                    {isExpanded ? 'Ocultar' : 'Ver'} sub-determinantes ({subs.length})
                  </button>
                  {isExpanded && (
                    <div className="animate-fade-in" style={{marginTop:'0.5rem', padding:'0.75rem', background:'rgba(0,0,0,0.15)', borderRadius:8}}>
                      {subs.map((sub, j) => {
                        const subColor = sub.score >= 4 ? 'var(--danger-color)' : sub.score >= 3 ? 'var(--warning-color)' : 'var(--success-color)';
                        return (
                          <div key={j} style={{marginBottom: j < subs.length - 1 ? '0.75rem' : 0, paddingBottom: j < subs.length - 1 ? '0.75rem' : 0, borderBottom: j < subs.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none'}}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.25rem'}}>
                              <span style={{fontSize:'0.85rem', fontWeight:600}}>{sub.name}</span>
                              <span style={{fontSize:'0.8rem', fontWeight:700, color:subColor}}>{sub.score}/5</span>
                            </div>
                            <div style={{height:5, borderRadius:3, background:'rgba(255,255,255,0.08)', marginBottom:'0.35rem', overflow:'hidden'}}>
                              <div style={{height:'100%', width:`${(sub.score/5)*100}%`, background:subColor, borderRadius:3, transition:'width 0.3s'}} />
                            </div>
                            <p style={{fontSize:'0.75rem', color:'var(--text-secondary)', margin:0, lineHeight:1.4}}>{sub.note}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="glass-panel" style={{padding:'0.75rem 1rem', marginTop:'1rem', fontSize:'0.8rem', color:'var(--text-secondary)', borderLeft:'3px solid var(--accent-secondary)'}}>
        📚 <strong>Porter (1980):</strong> Las 5 fuerzas determinan la intensidad competitiva y la rentabilidad de una industria. La presión se evalúa por sub-determinantes; la fuerza dominante (la más alta) define el factor crítico del entorno competitivo.
      </div>
    </div>
  );
}
