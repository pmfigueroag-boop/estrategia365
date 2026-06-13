'use client';

/**
 * RiskNodes — Strategic risk map display
 * Extracted from strategy/page.js (Phase 1: Frontend Decomposition)
 */
export default function RiskNodes({ risks = [] }) {
  if (!risks.length) return (
    <div className="glass-panel" style={{padding:'2rem', textAlign:'center', color:'var(--text-secondary)'}}>
      No se identificaron nodos de riesgo.
    </div>
  );

  return (
    <div className="animate-fade-in">
      {risks.map((r, i) => (
        <div key={i} className="glass-panel" style={{padding:'1.25rem', marginBottom:'1rem', borderLeft:'4px solid var(--warning-color)'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem'}}>
            <h4 style={{fontSize:'1rem'}}>⚠️ {r.risk}</h4>
            <div style={{display:'flex', gap:'1rem', fontSize:'0.8rem'}}>
              <span>Probabilidad: <strong style={{color: r.probability > 0.6 ? 'var(--danger-color)' : 'var(--warning-color)'}}>{(r.probability * 100).toFixed(0)}%</strong></span>
              <span>Severidad: <strong style={{color: r.severity > 0.6 ? 'var(--danger-color)' : 'var(--warning-color)'}}>{(r.severity * 100).toFixed(0)}%</strong></span>
            </div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.75rem', fontSize:'0.85rem', flexWrap:'wrap'}}>
            <span style={{padding:'0.3rem 0.6rem', background:'rgba(245,158,11,0.1)', borderRadius:6}}>🔥 {r.trigger}</span>
            <span>→</span>
            <span style={{padding:'0.3rem 0.6rem', background:'rgba(239,68,68,0.1)', borderRadius:6}}>💥 {r.risk}</span>
            <span>→</span>
            <span style={{padding:'0.3rem 0.6rem', background:'rgba(239,68,68,0.2)', borderRadius:6}}>📉 {r.consequence}</span>
          </div>
          <div style={{padding:'0.75rem', background:'rgba(16,185,129,0.08)', borderRadius:8, fontSize:'0.85rem'}}>
            <strong style={{color:'var(--success-color)'}}>🛡️ Mitigación:</strong> {r.mitigation}
          </div>
          {r.source_analysis && <p style={{fontSize:'0.75rem', color:'var(--text-secondary)', marginTop:'0.5rem'}}>Fuente: {r.source_analysis}</p>}
        </div>
      ))}
    </div>
  );
}
