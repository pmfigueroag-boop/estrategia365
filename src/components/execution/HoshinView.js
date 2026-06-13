'use client';

/**
 * HoshinView — Hoshin Kanri X-Matrix Table + Summary Cards
 * Extracted from execution/page.js (Phase 2)
 */
export default function HoshinView({ objectives }) {
  return (
    <div className="animate-fade-in">
      <h2 style={{fontSize:'1.3rem', marginBottom:'0.5rem'}}>Hoshin Kanri — X-Matrix de Despliegue</h2>
      <p style={{color:'var(--text-secondary)', fontSize:'0.9rem', marginBottom:'1.5rem'}}>Alineación en cascada: Objetivos Estratégicos → Tácticas → Métricas → Responsables</p>
      
      <div className="glass-panel" style={{padding:'2rem', overflowX:'auto'}}>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:'0.85rem'}}>
          <thead>
            <tr style={{borderBottom:'2px solid var(--surface-border)'}}>
              <th style={{padding:'0.75rem', textAlign:'left', color:'var(--accent-primary)'}}>Objetivo Estratégico</th>
              <th style={{padding:'0.75rem', textAlign:'left', color:'var(--accent-secondary)'}}>Táctica / Iniciativa</th>
              <th style={{padding:'0.75rem', textAlign:'center', color:'var(--warning-color)'}}>Métrica</th>
              <th style={{padding:'0.75rem', textAlign:'center', color:'var(--success-color)'}}>Progreso</th>
              <th style={{padding:'0.75rem', textAlign:'left'}}>Responsable</th>
            </tr>
          </thead>
          <tbody>
            {objectives.length > 0 ? objectives.map((obj) => (
              <tr key={obj.id} style={{borderBottom:'1px solid var(--surface-border)'}}>
                <td style={{padding:'0.75rem', fontWeight:600}}>{obj.title}</td>
                <td style={{padding:'0.75rem', color:'var(--text-secondary)'}}>Iniciativa OKR #{obj.id}</td>
                <td style={{padding:'0.75rem', textAlign:'center'}}>{obj.key_results_count} KRs</td>
                <td style={{padding:'0.75rem', textAlign:'center'}}>
                  <span style={{color:obj.progress >= 70 ? 'var(--success-color)' : obj.progress >= 40 ? 'var(--warning-color)' : 'var(--danger-color)', fontWeight:700}}>{obj.progress}%</span>
                </td>
                <td style={{padding:'0.75rem'}}>{obj.responsible_squad}</td>
              </tr>
            )) : (
              <tr><td colSpan={5} style={{padding:'2rem', textAlign:'center', color:'var(--text-secondary)'}}>Crea objetivos en la pestaña OKRs para verlos reflejados aquí.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {objectives.length > 0 && (
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'1rem', marginTop:'1.5rem'}}>
          <div className="glass-panel" style={{padding:'1.25rem', textAlign:'center', borderTop:'3px solid var(--accent-primary)'}}>
            <p style={{fontSize:'2rem', fontWeight:700}} className="text-gradient">{objectives.length}</p>
            <p style={{color:'var(--text-secondary)', fontSize:'0.85rem'}}>Objetivos Desplegados</p>
          </div>
          <div className="glass-panel" style={{padding:'1.25rem', textAlign:'center', borderTop:'3px solid var(--success-color)'}}>
            <p style={{fontSize:'2rem', fontWeight:700, color:'var(--success-color)'}}>{objectives.filter(o=>o.status==='completed').length}</p>
            <p style={{color:'var(--text-secondary)', fontSize:'0.85rem'}}>Completados</p>
          </div>
          <div className="glass-panel" style={{padding:'1.25rem', textAlign:'center', borderTop:'3px solid var(--danger-color)'}}>
            <p style={{fontSize:'2rem', fontWeight:700, color:'var(--danger-color)'}}>{objectives.filter(o=>o.status==='blocked').length}</p>
            <p style={{color:'var(--text-secondary)', fontSize:'0.85rem'}}>Bloqueados</p>
          </div>
        </div>
      )}
    </div>
  );
}
