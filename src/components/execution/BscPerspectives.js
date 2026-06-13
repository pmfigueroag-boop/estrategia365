'use client';
import api from '@/lib/api';

/**
 * BscPerspectives — BSC 4-Perspective Grid with KPI sliders
 * Kaplan & Norton (1992)
 * Extracted from execution/page.js (Phase 2)
 */

const BSC_META = {
  financial: { icon: '💰', label: 'Financiera', color: 'var(--success-color)' },
  customer: { icon: '👥', label: 'Cliente', color: 'var(--accent-primary)' },
  process: { icon: '⚙️', label: 'Procesos Internos', color: 'var(--warning-color)' },
  learning: { icon: '🧠', label: 'Aprendizaje & Crecimiento', color: 'var(--accent-secondary)' },
};

export default function BscPerspectives({ bscData, planId, onRefresh, toast }) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem'}}>
      {Object.entries(BSC_META).map(([key, meta]) => {
        const items = bscData.filter(b => b.perspective === key);
        return (
          <div key={key} className="glass-panel animate-fade-in" style={{padding:'1.5rem', borderTop:`3px solid ${meta.color}`}}>
            <h3 style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1rem'}}>
              {meta.icon} {meta.label}
              <span style={{fontSize:'0.7rem', color:'var(--text-secondary)', fontWeight:400, marginLeft:'auto'}}>{items.length} KPIs</span>
            </h3>
            {items.length > 0 ? items.map((item) => {
              const pct = item.target_value > 0 ? Math.min((item.current_value / item.target_value) * 100, 100) : 0;
              return (
                <div key={item.id} style={{padding:'0.75rem', background:'rgba(0,0,0,0.2)', borderRadius:'8px', marginBottom:'0.5rem'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.25rem'}}>
                    <strong style={{fontSize:'0.9rem', flex:1}}>{item.objective}</strong>
                    <button onClick={async () => {
                      await api.deleteBsc(item.id);
                      onRefresh();
                      toast.success('KPI eliminado.');
                    }} style={{background:'none', border:'none', cursor:'pointer', fontSize:'0.7rem', color:'var(--danger-color)', opacity:0.6, padding:'0.2rem'}}>🗑️</button>
                  </div>
                  <p style={{fontSize:'0.8rem', color:'var(--text-secondary)', marginBottom:'0.4rem'}}>KPI: {item.kpi}</p>
                  <div style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
                    <input
                      type="range"
                      min={0}
                      max={item.target_value}
                      step={item.target_value > 10 ? 1 : 0.1}
                      value={item.current_value}
                      onChange={async (e) => {
                        const val = parseFloat(e.target.value);
                        await api.updateBsc(item.id, { current_value: val });
                        onRefresh();
                      }}
                      style={{flex:1, accentColor: meta.color, cursor:'pointer'}}
                    />
                    <span style={{fontSize:'0.8rem', fontWeight:700, color: pct >= 100 ? 'var(--success-color)' : meta.color, minWidth:70, textAlign:'right'}}>
                      {item.current_value}/{item.target_value} {item.unit}
                    </span>
                  </div>
                  <div className="progress-track sm" style={{marginTop:'0.4rem'}}>
                    <div className="progress-fill" style={{width:`${pct}%`, background:meta.color, transition:'width 0.3s'}}></div>
                  </div>
                </div>
              );
            }) : (
              <p style={{color:'var(--text-secondary)', fontSize:'0.85rem', padding:'1rem 0'}}>Sin objetivos en esta perspectiva.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
