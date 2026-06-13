'use client';

/**
 * StrategyMap — Kaplan & Norton BSC cause-effect visualization
 * Extracted from execution/page.js (Phase 2)
 */

const PERSPECTIVE_META = {
  learning: { icon: '🧠', label: 'Aprendizaje y Crecimiento', color: 'var(--accent-secondary)', bg: 'rgba(168,85,247,0.1)' },
  process: { icon: '⚙️', label: 'Procesos Internos', color: 'var(--warning-color)', bg: 'rgba(245,158,11,0.1)' },
  customer: { icon: '👥', label: 'Cliente', color: 'var(--accent-primary)', bg: 'rgba(59,130,246,0.1)' },
  financial: { icon: '💰', label: 'Financiera', color: 'var(--success-color)', bg: 'rgba(16,185,129,0.1)' },
};

const PERSPECTIVES = ['financial', 'customer', 'process', 'learning'];

function classifyObjective(title, pKey) {
  const t = (title || '').toLowerCase();
  if (pKey === 'financial') return t.includes('ingreso') || t.includes('costo') || t.includes('presupuesto') || t.includes('financ') || t.includes('revenue');
  if (pKey === 'customer') return t.includes('cliente') || t.includes('satisfac') || t.includes('usuario') || t.includes('mercado') || t.includes('nps');
  if (pKey === 'process') return t.includes('proceso') || t.includes('eficiencia') || t.includes('operaci') || t.includes('calidad') || t.includes('tiempo');
  if (pKey === 'learning') return t.includes('capacit') || t.includes('tecnolog') || t.includes('cultura') || t.includes('equipo') || t.includes('talent');
  return false;
}

export default function StrategyMap({ bscData, objectives }) {
  const hasBscData = bscData && bscData.length > 0;
  const hasObjectives = objectives && objectives.length > 0;

  if (!hasBscData && !hasObjectives) {
    return (
      <div className="animate-fade-in">
        <div className="glass-panel" style={{padding:'3rem', textAlign:'center'}}>
          <div style={{fontSize:'3rem', marginBottom:'1rem'}}>🗺️</div>
          <h2 style={{fontSize:'1.3rem', marginBottom:'0.5rem'}}>Mapa Estratégico</h2>
          <p style={{color:'var(--text-secondary)', fontSize:'0.9rem', maxWidth:520, margin:'0 auto'}}>
            Crea objetivos BSC y OKRs para visualizar el mapa estratégico con las cadenas causa-efecto entre perspectivas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
        <h2 style={{fontSize:'1.3rem'}}>Mapa Estratégico — Kaplan & Norton</h2>
      </div>

      <div className="glass-panel" style={{padding:'0.75rem 1rem', marginBottom:'1.5rem', fontSize:'0.8rem', color:'var(--text-secondary)', borderLeft:'3px solid var(--accent-secondary)'}}>
        📚 Las perspectivas se leen de arriba hacia abajo: los resultados financieros dependen del cliente, que depende de procesos, que depende del aprendizaje.
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:'1.5rem'}}>
        {PERSPECTIVES.map((pKey, pIdx) => {
          const meta = PERSPECTIVE_META[pKey];
          const pBsc = bscData.filter(b => b.perspective === pKey);
          const pOkrs = objectives.filter(o => classifyObjective(o.title, pKey));
          const allItems = [
            ...pBsc.map(b => ({ type: 'bsc', text: b.objective, kpi: b.kpi, progress: b.target_value > 0 ? Math.round((b.current_value / b.target_value) * 100) : 0 })),
            ...pOkrs.map(o => ({ type: 'okr', text: o.title, status: o.status })),
          ];

          return (
            <div key={pKey} className="animate-fade-in" style={{animationDelay: `${pIdx * 100}ms`}}>
              {pIdx > 0 && (
                <div style={{textAlign:'center', margin:'0 0 0.5rem 0', color:'var(--text-secondary)', fontSize:'1.2rem'}}>⬆️</div>
              )}
              <div style={{display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.75rem'}}>
                <div style={{width:36, height:36, borderRadius:'50%', background:meta.bg, border:`2px solid ${meta.color}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem'}}>
                  {meta.icon}
                </div>
                <div>
                  <h3 style={{fontSize:'1rem', fontWeight:600}}>{meta.label}</h3>
                  <span style={{fontSize:'0.75rem', color:'var(--text-secondary)'}}>{allItems.length} objetivo{allItems.length !== 1 ? 's' : ''}</span>
                </div>
                <div style={{flex:1, height:2, background:`linear-gradient(to right, ${meta.color}, transparent)`, marginLeft:'0.5rem'}}></div>
              </div>
              <div style={{display:'flex', gap:'0.75rem', flexWrap:'wrap', paddingLeft:'1rem', borderLeft:`2px solid ${meta.color}22`, marginLeft:18}}>
                {allItems.map((item, i) => (
                  <div key={i} className="glass-panel" style={{padding:'0.75rem 1rem', flex:'1 1 200px', maxWidth:320, borderTop:`3px solid ${meta.color}`, background:meta.bg}}>
                    <p style={{fontSize:'0.85rem', fontWeight:500, marginBottom:'0.25rem'}}>{item.text}</p>
                    {item.type === 'bsc' && item.kpi && (
                      <div style={{marginTop:'0.4rem'}}>
                        <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'var(--text-secondary)', marginBottom:'0.2rem'}}>
                          <span>{item.kpi}</span>
                          <span style={{fontWeight:600, color:meta.color}}>{item.progress}%</span>
                        </div>
                        <div style={{height:4, borderRadius:2, background:'rgba(255,255,255,0.1)', overflow:'hidden'}}>
                          <div style={{height:'100%', width:`${Math.min(item.progress, 100)}%`, background:meta.color, borderRadius:2, transition:'width 0.5s'}}></div>
                        </div>
                      </div>
                    )}
                    {item.type === 'okr' && (
                      <span style={{fontSize:'0.75rem', color: item.status === 'completed' ? 'var(--success-color)' : item.status === 'blocked' ? 'var(--danger-color)' : 'var(--text-secondary)'}}>
                        OKR • {item.status}
                      </span>
                    )}
                  </div>
                ))}
                {allItems.length === 0 && (
                  <p style={{fontSize:'0.85rem', color:'var(--text-secondary)', fontStyle:'italic', padding:'0.5rem 0'}}>Sin objetivos en esta perspectiva</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
