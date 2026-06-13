'use client';

/**
 * CapabilityGaps — Capability gap analysis display
 * Extracted from strategy/page.js (Phase 1: Frontend Decomposition)
 */

const GAP_COLORS = { critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#6b7280' };

export default function CapabilityGaps({ gaps = [] }) {
  if (!gaps.length) return (
    <div className="glass-panel" style={{padding:'2rem', textAlign:'center', color:'var(--text-secondary)'}}>
      No se identificaron brechas de capacidad.
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
        {gaps.map((g, i) => (
          <div key={i} className="glass-panel" style={{padding:'1.25rem', borderLeft:`4px solid ${GAP_COLORS[g.gap_severity] || GAP_COLORS.medium}`}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem'}}>
              <h4 style={{fontSize:'1rem'}}>🧩 {g.capability}</h4>
              <span style={{fontSize:'0.75rem', padding:'0.15rem 0.5rem', borderRadius:4, background:`${GAP_COLORS[g.gap_severity]}22`, color:GAP_COLORS[g.gap_severity], fontWeight:600}}>{g.gap_severity.toUpperCase()}</span>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:'0.5rem', alignItems:'center', marginBottom:'0.5rem'}}>
              <div style={{padding:'0.5rem', background:'rgba(239,68,68,0.1)', borderRadius:8, fontSize:'0.8rem'}}>
                <span style={{color:'var(--danger-color)', fontWeight:600}}>Estado Actual</span><br/>{g.current_state}
              </div>
              <span style={{fontSize:'1.2rem'}}>→</span>
              <div style={{padding:'0.5rem', background:'rgba(16,185,129,0.1)', borderRadius:8, fontSize:'0.8rem'}}>
                <span style={{color:'var(--success-color)', fontWeight:600}}>Estado Requerido</span><br/>{g.required_state}
              </div>
            </div>
            {g.related_decision && <p style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>🔗 Decisión relacionada: {g.related_decision}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
