'use client';

/**
 * DecisionGraph — Dependency/conflict graph between strategic decisions
 * Extracted from strategy/page.js (Phase 1: Frontend Decomposition)
 */

const EDGE_META = {
  depends_on: { icon: '🔗', label: 'Depende de', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  enables: { icon: '⚡', label: 'Habilita a', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  conflicts_with: { icon: '⚔️', label: 'Conflicto con', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

export default function DecisionGraph({ graphData, edges = [], onGenerate, isGenerating }) {
  if (!edges.length) {
    return (
      <div className="glass-panel" style={{padding:'3rem', textAlign:'center'}}>
        <div style={{fontSize:'3rem', marginBottom:'1rem'}}>🕸️</div>
        <h3 style={{marginBottom:'0.5rem'}}>Grafo de Decisiones</h3>
        <p style={{color:'var(--text-secondary)', maxWidth:500, margin:'0 auto 1.5rem', fontSize:'0.9rem'}}>
          Analiza dependencias, conflictos y habilitaciones entre las decisiones estratégicas.
        </p>
        <button onClick={onGenerate} disabled={isGenerating} className="btn btn-primary" style={{fontSize:'1rem', padding:'0.75rem 2rem', opacity:isGenerating?0.5:1}}>
          {isGenerating ? '⏳ Analizando relaciones...' : '🕸️ Generar Grafo de Decisiones'}
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Stats Banner */}
      <div className="glass-panel" style={{padding:'1rem 1.5rem', marginBottom:'1.5rem', display:'flex', gap:'2rem', alignItems:'center', borderLeft:'4px solid #8b5cf6'}}>
        <div style={{fontSize:'1.1rem', fontWeight:700}}>🕸️ Decision Graph</div>
        <div style={{display:'flex', gap:'1.5rem', fontSize:'0.85rem'}}>
          <span>🔗 <strong style={{color:'#3b82f6'}}>{graphData?.stats?.depends_on || 0}</strong> dependencias</span>
          <span>⚡ <strong style={{color:'#10b981'}}>{graphData?.stats?.enables || 0}</strong> habilitaciones</span>
          <span>⚔️ <strong style={{color:'#ef4444'}}>{graphData?.stats?.conflicts_with || 0}</strong> conflictos</span>
        </div>
        <button onClick={onGenerate} disabled={isGenerating} className="btn" style={{fontSize:'0.75rem', marginLeft:'auto', opacity:isGenerating?0.5:1}}>
          {isGenerating ? '⏳...' : '🔄 Regenerar'}
        </button>
      </div>

      {/* Graph Summary */}
      {graphData?.graph_summary && (
        <div className="glass-panel" style={{padding:'1rem 1.5rem', marginBottom:'1.5rem', borderLeft:'4px solid var(--accent-secondary)', fontSize:'0.9rem'}}>
          <strong style={{color:'var(--accent-secondary)'}}>🧠 Topología:</strong> {graphData.graph_summary}
        </div>
      )}

      {/* Edge Cards */}
      {edges.map((e, i) => {
        const meta = EDGE_META[e.edge_type] || EDGE_META.enables;
        return (
          <div key={e.id || i} className="glass-panel" style={{padding:'1.25rem', marginBottom:'0.75rem', borderLeft:`4px solid ${meta.color}`}}>
            <div style={{display:'flex', alignItems:'center', gap:'1rem', marginBottom:'0.75rem'}}>
              <div style={{flex:1, padding:'0.5rem 0.75rem', background:'rgba(255,255,255,0.04)', borderRadius:6, fontSize:'0.9rem', fontWeight:600}}>
                {e.from_title}
              </div>
              <div style={{display:'flex', flexDirection:'column', alignItems:'center', minWidth:100}}>
                <span style={{fontSize:'0.7rem', color:meta.color, fontWeight:600}}>{meta.icon} {meta.label}</span>
                <div style={{width:'100%', height:2, background:`linear-gradient(to right, ${meta.color}, ${meta.color}88)`, margin:'0.25rem 0', position:'relative'}}>
                  <div style={{position:'absolute', right:-4, top:-3, width:0, height:0, borderLeft:`8px solid ${meta.color}`, borderTop:'4px solid transparent', borderBottom:'4px solid transparent'}}/>
                </div>
                <span style={{fontSize:'0.7rem', color:'var(--text-secondary)'}}>fuerza: {(e.strength * 100).toFixed(0)}%</span>
              </div>
              <div style={{flex:1, padding:'0.5rem 0.75rem', background:meta.bg, borderRadius:6, fontSize:'0.9rem', fontWeight:600, color:meta.color}}>
                {e.to_title}
              </div>
            </div>
            <p style={{fontSize:'0.85rem', color:'var(--text-secondary)', lineHeight:1.5, paddingLeft:'0.5rem', borderLeft:`2px solid ${meta.color}33`}}>
              {e.rationale}
            </p>
          </div>
        );
      })}
    </>
  );
}
