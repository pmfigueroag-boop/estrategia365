'use client';
import { useState } from 'react';
import api from '@/lib/api';

/**
 * ObjectiveCard — OKR objective with expandable Key Results
 * Extracted from execution/page.js (Phase 2)
 */

const STATUS_COLORS = { formulated: 'var(--text-secondary)', in_progress: 'var(--accent-primary)', completed: 'var(--success-color)', blocked: 'var(--danger-color)' };
const STATUS_LABELS = { formulated: '📋 Formulado', in_progress: '⚙️ En Progreso', completed: '✅ Completado', blocked: '🚫 Bloqueado' };

export default function ObjectiveCard({ obj, planId, index, onRefresh, toast }) {
  const [expanded, setExpanded] = useState(false);
  const [krs, setKrs] = useState([]);
  const [status, setStatus] = useState(obj.status);
  const [isLoadingKrs, setIsLoadingKrs] = useState(false);

  const loadKrs = async () => {
    setIsLoadingKrs(true);
    try {
      const objectives = await api.getObjectives(planId);
      const thisObj = objectives.find(o => o.id === obj.id);
      setKrs(thisObj?.key_results || []);
    } catch (e) { console.error(e); }
    setIsLoadingKrs(false);
  };

  const toggleExpand = () => {
    if (!expanded && krs.length === 0) loadKrs();
    setExpanded(!expanded);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.updateObjective(obj.id, { status: newStatus });
      setStatus(newStatus);
      onRefresh();
      toast.success(`Estado actualizado: ${STATUS_LABELS[newStatus]}`);
    } catch (e) { toast.error(e.message); }
  };

  const handleKrUpdate = async (krId, newValue) => {
    try {
      await api.updateKeyResult(krId, { current_value: parseFloat(newValue) });
      await loadKrs();
      onRefresh();
    } catch (e) { toast.error(e.message); }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${obj.title}"?`)) return;
    try {
      await api.deleteObjective(obj.id);
      onRefresh();
      toast.success('Objetivo eliminado.');
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{
      padding:'1.25rem', borderLeft:`4px solid ${STATUS_COLORS[status]}`,
      animationDelay:`${index*60}ms`, transition:'all 0.2s',
    }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer'}} onClick={toggleExpand}>
        <div style={{flex:1}}>
          <h3 style={{fontSize:'1rem', display:'flex', alignItems:'center', gap:'0.5rem'}}>
            <span style={{transition:'transform 0.2s', display:'inline-block', transform: expanded ? 'rotate(90deg)' : 'none'}}>▶</span>
            {obj.title}
          </h3>
          <p style={{fontSize:'0.85rem', color:'var(--text-secondary)', marginLeft:'1.5rem'}}>Squad: {obj.responsible_squad} · {obj.key_results_count} KRs</p>
          {obj.collision_flag === 1 && (
            <div style={{marginLeft:'1.5rem', marginTop:'0.5rem', padding:'0.4rem', backgroundColor:'#fff7ed', borderLeft:'3px solid #f97316', fontSize:'0.8rem', color:'#c2410c', fontWeight:600}}>
              ⚠️ Alerta de Colisión: Este OKR presenta antonimia estratégica o conflicto de recursos con otro objetivo.
            </div>
          )}
        </div>
        <div style={{textAlign:'right', flexShrink:0}}>
          <span style={{fontSize:'1.3rem', fontWeight:700, color:STATUS_COLORS[status]}}>{obj.progress}%</span>
          <div style={{fontSize:'0.75rem', color:STATUS_COLORS[status], textTransform:'uppercase'}}>{(status || '').replace('_', ' ')}</div>
        </div>
      </div>
      <div className="progress-track sm" style={{marginTop:'0.75rem'}}>
        <div className="progress-fill gradient" style={{width:`${obj.progress}%`, transition:'width 0.5s'}}></div>
      </div>

      {/* Expanded Section */}
      {expanded && (
        <div className="animate-fade-in" style={{marginTop:'1rem', paddingTop:'1rem', borderTop:'1px solid rgba(255,255,255,0.06)'}}>
          {/* Status + Actions */}
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
            <div style={{display:'flex', gap:'0.4rem', flexWrap:'wrap'}}>
              {['formulated', 'in_progress', 'completed', 'blocked'].map(s => (
                <button key={s} onClick={(e) => { e.stopPropagation(); handleStatusChange(s); }}
                  style={{
                    fontSize:'0.7rem', padding:'0.25rem 0.6rem', borderRadius:6, cursor:'pointer',
                    background: s === status ? `${STATUS_COLORS[s]}25` : 'transparent',
                    color: s === status ? STATUS_COLORS[s] : 'var(--text-secondary)',
                    border: `1px solid ${s === status ? STATUS_COLORS[s] : 'rgba(255,255,255,0.08)'}`,
                  }}>
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
            <button onClick={handleDelete} style={{fontSize:'0.75rem', color:'var(--danger-color)', background:'none', border:'none', cursor:'pointer', opacity:0.7}}>
              🗑️ Eliminar
            </button>
          </div>

          {/* Key Results */}
          {isLoadingKrs ? (
            <p style={{color:'var(--text-secondary)', fontSize:'0.85rem'}}>Cargando Key Results...</p>
          ) : krs.length > 0 ? (
            <div style={{display:'flex', flexDirection:'column', gap:'0.75rem'}}>
              <p style={{fontSize:'0.8rem', fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.05em'}}>Key Results</p>
              {krs.map(kr => {
                const pct = kr.target_value > 0 ? Math.min((kr.current_value / kr.target_value) * 100, 100) : 0;
                return (
                  <div key={kr.id} style={{padding:'0.75rem', background:'rgba(0,0,0,0.2)', borderRadius:8}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.4rem'}}>
                      <span style={{fontSize:'0.85rem', fontWeight:500}}>{kr.title}</span>
                      <span style={{fontSize:'0.8rem', fontWeight:600, color: pct >= 100 ? 'var(--success-color)' : pct >= 50 ? 'var(--warning-color)' : 'var(--text-secondary)'}}>
                        {kr.current_value} / {kr.target_value} {kr.unit}
                      </span>
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
                      <input
                        type="range"
                        min={0}
                        max={kr.target_value}
                        step={kr.target_value > 10 ? 1 : 0.1}
                        value={kr.current_value}
                        onChange={e => handleKrUpdate(kr.id, e.target.value)}
                        onClick={e => e.stopPropagation()}
                        style={{flex:1, accentColor: pct >= 100 ? 'var(--success-color)' : 'var(--accent-primary)', cursor:'pointer'}}
                      />
                      <span style={{fontSize:'0.8rem', fontWeight:700, color: pct >= 100 ? 'var(--success-color)' : 'var(--accent-primary)', minWidth:40, textAlign:'right'}}>
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                    {kr.deadline && <p style={{fontSize:'0.7rem', color:'var(--text-secondary)', marginTop:'0.3rem'}}>📅 Meta: {kr.deadline}</p>}
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{color:'var(--text-secondary)', fontSize:'0.85rem', fontStyle:'italic'}}>Sin Key Results definidos.</p>
          )}
        </div>
      )}
    </div>
  );
}
