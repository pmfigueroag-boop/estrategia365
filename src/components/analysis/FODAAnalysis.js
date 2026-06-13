'use client';
import { useState } from 'react';

/**
 * FODAAnalysis — Weihrich (1982) SWOT/FODA + TOWS Matrix
 * Extracted from analysis/page.js (Phase 2)
 */

const SWOT_LABELS = {
  strength: { label: 'Fortalezas', color: 'var(--success-color)', icon: '💪' },
  weakness: { label: 'Debilidades', color: 'var(--danger-color)', icon: '⚠️' },
  opportunity: { label: 'Oportunidades', color: 'var(--accent-primary)', icon: '🚀' },
  threat: { label: 'Amenazas', color: 'var(--warning-color)', icon: '🔥' },
};

const IMPACT_COLORS = {
  1: { text: 'Bajo', color: 'var(--success-color)' },
  2: { text: 'Menor', color: 'var(--success-color)' },
  3: { text: 'Moderado', color: 'var(--warning-color)' },
  4: { text: 'Alto', color: 'var(--danger-color)' },
  5: { text: 'Crítico', color: 'var(--danger-color)' },
};

const TOWS_META = {
  FO: { label: 'Fortalezas × Oportunidades', desc: 'Estrategias Ofensivas', color: 'var(--success-color)', icon: '🚀' },
  FA: { label: 'Fortalezas × Amenazas', desc: 'Estrategias Defensivas', color: 'var(--accent-primary)', icon: '🛡️' },
  DO: { label: 'Debilidades × Oportunidades', desc: 'Reorientación', color: 'var(--warning-color)', icon: '🔄' },
  DA: { label: 'Debilidades × Amenazas', desc: 'Supervivencia', color: 'var(--danger-color)', icon: '⚠️' },
};

export default function FODAAnalysis({ swot, tows, isLoading, towsLoading, onScanFoda, onScanTows }) {
  const [expandedEvidence, setExpandedEvidence] = useState({});
  const toggleEvidence = (id) => setExpandedEvidence(prev => ({ ...prev, [id]: !prev[id] }));

  if (swot.length === 0) {
    return (
      <div className="animate-fade-in">
        <div className="glass-panel" style={{padding:'3rem', textAlign:'center'}}>
          <div style={{fontSize:'3rem', marginBottom:'1rem'}}>🎯</div>
          <h2 style={{fontSize:'1.3rem', marginBottom:'0.5rem'}}>Análisis FODA — Weihrich (1982)</h2>
          <p style={{color:'var(--text-secondary)', fontSize:'0.9rem', maxWidth:520, margin:'0 auto 1rem'}}>
            La IA generará un FODA con evidencia trazable cruzando PESTEL, Porter y documentos institucionales, enriquecido con Google Search.
          </p>
          <p style={{color:'var(--text-secondary)', fontSize:'0.8rem', maxWidth:480, margin:'0 auto 2rem'}}>
            Ejecuta primero PESTEL y Porter 5F para obtener un cruce completo.
          </p>
          <button onClick={onScanFoda} disabled={isLoading} className="btn btn-primary" style={{fontSize:'1rem', padding:'0.75rem 2rem', opacity:isLoading?0.5:1}}>
            {isLoading ? '⏳ Generando...' : '🤖 Generar FODA con IA'}
          </button>
        </div>
      </div>
    );
  }

  const avgImpact = (swot.reduce((a, s) => a + (s.impact_score || 3), 0) / swot.length).toFixed(1);
  const avgColor = avgImpact >= 3.5 ? 'var(--danger-color)' : avgImpact >= 2.5 ? 'var(--warning-color)' : 'var(--success-color)';
  const hasEvidence = swot.some(s => s.evidence && s.evidence.length > 0);

  return (
    <div className="animate-fade-in">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
        <h2 style={{fontSize:'1.3rem'}}>Análisis FODA <span style={{fontSize:'0.85rem', color:'var(--text-secondary)', fontWeight:'normal'}}>— Weihrich (1982)</span></h2>
        <button onClick={onScanFoda} disabled={isLoading} className="btn" style={{fontSize:'0.8rem', opacity:isLoading?0.5:1}}>
          {isLoading ? '⏳ Regenerando...' : '🔄 Regenerar'}
        </button>
      </div>

      {/* Summary */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem', marginBottom:'1.5rem'}}>
        <div className="glass-panel" style={{padding:'1rem', textAlign:'center'}}>
          <p style={{fontSize:'0.7rem', color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'0.25rem'}}>Total Items</p>
          <div style={{fontSize:'1.8rem', fontWeight:800}} className="text-gradient">{swot.length}</div>
        </div>
        <div className="glass-panel" style={{padding:'1rem', textAlign:'center'}}>
          <p style={{fontSize:'0.7rem', color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'0.25rem'}}>Impacto Promedio</p>
          <div style={{fontSize:'1.8rem', fontWeight:800, color:avgColor}}>{avgImpact}<span style={{fontSize:'0.9rem', fontWeight:400}}>/5</span></div>
        </div>
        <div className="glass-panel" style={{padding:'1rem', textAlign:'center'}}>
          <p style={{fontSize:'0.7rem', color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'0.25rem'}}>Trazabilidad</p>
          <div style={{fontSize:'1.8rem', fontWeight:800, color: hasEvidence ? 'var(--success-color)' : 'var(--warning-color)'}}>
            {hasEvidence ? '✓' : '—'}
          </div>
        </div>
      </div>

      {/* FODA Grid 2×2 */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.5rem'}}>
        {['strength', 'weakness', 'opportunity', 'threat'].map(q => {
          const items = swot.filter(i => i.quadrant === q).sort((a,b) => a.priority - b.priority);
          const meta = SWOT_LABELS[q];
          return (
            <div key={q} className="glass-panel animate-fade-in" style={{padding:'1.25rem', borderTop:`3px solid ${meta.color}`}}>
              <h3 style={{marginBottom:'0.75rem', display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'1rem'}}>
                {meta.icon} {meta.label}
                <span style={{fontSize:'0.75rem', color:'var(--text-secondary)', fontWeight:400}}>({items.length})</span>
              </h3>
              <div style={{display:'flex', flexDirection:'column', gap:'0.75rem'}}>
                {items.map((item, i) => {
                  const impact = IMPACT_COLORS[item.impact_score] || IMPACT_COLORS[3];
                  const eKey = `${q}-${item.id || i}`;
                  const showEv = expandedEvidence[eKey];
                  return (
                    <div key={item.id||i} style={{padding:'0.75rem', background:'rgba(0,0,0,0.15)', borderRadius:8, borderLeft:`3px solid ${meta.color}`}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'0.5rem', marginBottom:'0.4rem'}}>
                        <p style={{fontSize:'0.88rem', lineHeight:1.4, margin:0, flex:1}}>{item.description}</p>
                        <span style={{fontSize:'0.7rem', padding:'0.15rem 0.4rem', borderRadius:4, background:impact.color, color:'#fff', fontWeight:700, whiteSpace:'nowrap'}}>
                          {item.impact_score}/5
                        </span>
                      </div>
                      <div style={{height:4, borderRadius:2, background:'rgba(255,255,255,0.08)', marginBottom:'0.35rem', overflow:'hidden'}}>
                        <div style={{height:'100%', width:`${(item.impact_score/5)*100}%`, background:impact.color, borderRadius:2, transition:'width 0.3s'}} />
                      </div>
                      {item.source_signal && (
                        <div style={{fontSize:'0.7rem', color:'var(--accent-primary)', marginBottom:'0.25rem'}}>
                          📌 {item.source_signal}
                        </div>
                      )}
                      {item.evidence && (
                        <>
                          <button onClick={() => toggleEvidence(eKey)}
                            style={{background:'none', border:'none', color:'var(--accent-secondary)', cursor:'pointer', fontSize:'0.72rem', padding:0, display:'flex', alignItems:'center', gap:'0.2rem'}}>
                            <span style={{transform: showEv ? 'rotate(90deg)' : 'none', transition:'transform 0.2s', display:'inline-block'}}>▶</span>
                            {showEv ? 'Ocultar' : 'Ver'} evidencia
                          </button>
                          {showEv && (
                            <p className="animate-fade-in" style={{fontSize:'0.75rem', color:'var(--text-secondary)', margin:'0.25rem 0 0', lineHeight:1.4, fontStyle:'italic'}}>
                              📄 {item.evidence}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
                {items.length === 0 && <p style={{color:'var(--text-secondary)', fontSize:'0.8rem', textAlign:'center'}}>Sin datos</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* TOWS Matrix */}
      <div style={{marginBottom:'1rem'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
          <h3 style={{fontSize:'1.15rem'}}>Matriz TOWS <span style={{fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:'normal'}}>— Cruce Estratégico</span></h3>
          <button onClick={onScanTows} disabled={towsLoading || swot.length === 0} className="btn btn-primary" style={{fontSize:'0.8rem', opacity:(towsLoading||swot.length===0)?0.5:1}}>
            {towsLoading ? '⏳ Generando...' : '⚡ Generar TOWS'}
          </button>
        </div>

        {tows.length > 0 ? (
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
            {['FO', 'FA', 'DO', 'DA'].map(ct => {
              const strategies = tows.filter(t => t.cross_type === ct).sort((a,b) => a.priority - b.priority);
              const meta = TOWS_META[ct];
              return (
                <div key={ct} className="glass-panel animate-fade-in" style={{padding:'1.25rem', borderLeft:`4px solid ${meta.color}`}}>
                  <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.5rem'}}>
                    <span style={{fontSize:'1.1rem'}}>{meta.icon}</span>
                    <div>
                      <span style={{fontSize:'0.7rem', padding:'0.1rem 0.35rem', borderRadius:3, background:meta.color, color:'#fff', fontWeight:700}}>{ct}</span>
                      <span style={{fontSize:'0.8rem', color:'var(--text-secondary)', marginLeft:'0.5rem'}}>{meta.desc}</span>
                    </div>
                  </div>
                  <p style={{fontSize:'0.7rem', color:'var(--text-secondary)', marginBottom:'0.75rem'}}>{meta.label}</p>
                  {strategies.map((s, i) => (
                    <div key={s.id||i} style={{padding:'0.6rem', background:'rgba(0,0,0,0.15)', borderRadius:6, marginBottom: i < strategies.length - 1 ? '0.5rem' : 0}}>
                      <p style={{fontSize:'0.85rem', lineHeight:1.4, margin:0, marginBottom:'0.3rem'}}>{s.strategy}</p>
                      <div style={{display:'flex', gap:'0.75rem', fontSize:'0.7rem', color:'var(--text-secondary)'}}>
                        {s.internal_factors && <span>🏠 {s.internal_factors}</span>}
                        {s.external_factors && <span>🌐 {s.external_factors}</span>}
                      </div>
                    </div>
                  ))}
                  {strategies.length === 0 && <p style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>Genera TOWS para ver estrategias.</p>}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel" style={{padding:'2rem', textAlign:'center'}}>
            <p style={{color:'var(--text-secondary)', fontSize:'0.9rem'}}>
              Presiona "Generar TOWS" para crear la matriz de cruces estratégicos FO/FA/DO/DA a partir del FODA.
            </p>
          </div>
        )}
      </div>

      {/* Academic citation */}
      <div className="glass-panel" style={{padding:'0.75rem 1rem', fontSize:'0.8rem', color:'var(--text-secondary)', borderLeft:'3px solid var(--accent-secondary)'}}>
        📚 <strong>Weihrich (1982):</strong> La Matriz TOWS cruza factores internos (F/D) con externos (O/A) para generar estrategias accionables. Las estrategias FO son ofensivas, FA defensivas, DO de reorientación y DA de supervivencia.
        {swot[0]?.source?.includes('Google Search') && <span style={{marginLeft:'0.5rem'}}>| 🔍 Datos enriquecidos con Google Search.</span>}
      </div>
    </div>
  );
}
