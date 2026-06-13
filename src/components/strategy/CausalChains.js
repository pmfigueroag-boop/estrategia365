'use client';

/**
 * CausalChains — Causal map visualization connecting analysis to decisions
 * Extracted from strategy/page.js (Phase 1: Frontend Decomposition)
 */

const SOURCE_META = {
  pestel: { icon: '🌍', color: '#8b5cf6', label: 'PESTEL' },
  porter: { icon: '⚔️', color: '#3b82f6', label: 'Porter' },
  swot: { icon: '📊', color: '#10b981', label: 'FODA' },
  bcg: { icon: '📈', color: '#f59e0b', label: 'BCG' },
  blue_ocean: { icon: '🌊', color: '#06b6d4', label: 'Blue Ocean' },
};
const CHAIN_TYPE_LABEL = { reinforcing: '🔄 Refuerzo', balancing: '⚖️ Balance', delayed: '⏳ Retardado' };

export default function CausalChains({ causalData, chains = [], onGenerate, isGenerating }) {
  if (!chains.length) {
    return (
      <div className="glass-panel" style={{padding:'3rem', textAlign:'center'}}>
        <div style={{fontSize:'3rem', marginBottom:'1rem'}}>🔗</div>
        <h3 style={{marginBottom:'0.5rem'}}>Mapa Causal Estratégico</h3>
        <p style={{color:'var(--text-secondary)', maxWidth:500, margin:'0 auto 1.5rem', fontSize:'0.9rem'}}>
          Conecta los hallazgos de PESTEL, Porter y SWOT con las decisiones estratégicas a través de cadenas causales.
        </p>
        <button onClick={onGenerate} disabled={isGenerating} className="btn btn-primary" style={{opacity:isGenerating?0.5:1}}>
          {isGenerating ? '⏳ Generando mapa causal...' : '🔗 Generar Mapa Causal'}
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Synthesis */}
      {causalData?.synthesis && (
        <div className="glass-panel" style={{padding:'1rem 1.5rem', marginBottom:'1.5rem', borderLeft:'4px solid var(--accent-secondary)', fontSize:'0.9rem'}}>
          <strong style={{color:'var(--accent-secondary)'}}>🧬 Síntesis Sistémica:</strong> {causalData.synthesis}
        </div>
      )}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
        <h3>Cadenas Causales ({chains.length})</h3>
        <button onClick={onGenerate} disabled={isGenerating} className="btn" style={{fontSize:'0.8rem', opacity:isGenerating?0.5:1}}>
          {isGenerating ? '⏳...' : '🔄 Regenerar'}
        </button>
      </div>
      {chains.map((c, i) => {
        const src = SOURCE_META[c.source_type] || SOURCE_META.pestel;
        const strength = Math.round((c.chain_strength || 0.5) * 100);
        return (
          <div key={i} className="glass-panel" style={{padding:'1.25rem', marginBottom:'0.75rem', borderLeft:`4px solid ${src.color}`}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem'}}>
              <div style={{display:'flex', gap:'0.5rem', alignItems:'center', fontSize:'0.8rem'}}>
                <span style={{padding:'0.15rem 0.5rem', borderRadius:4, background:`${src.color}22`, color:src.color, fontWeight:600}}>{src.icon} {src.label}</span>
                <span style={{padding:'0.15rem 0.5rem', borderRadius:4, background:'rgba(255,255,255,0.06)'}}>{CHAIN_TYPE_LABEL[c.chain_type] || c.chain_type}</span>
              </div>
              <div style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>
                Fuerza: <strong style={{color: strength > 70 ? 'var(--success-color)' : 'var(--warning-color)'}}>{strength}%</strong>
              </div>
            </div>
            {/* Causal Flow */}
            <div style={{display:'flex', alignItems:'center', gap:'0.5rem', flexWrap:'wrap', fontSize:'0.85rem'}}>
              <span style={{padding:'0.4rem 0.7rem', background:`${src.color}15`, borderRadius:8, border:`1px solid ${src.color}40`}}>
                {src.icon} {c.source_finding}
              </span>
              <span style={{color:'var(--text-secondary)'}}>→</span>
              <span style={{padding:'0.4rem 0.7rem', background:'rgba(245,158,11,0.1)', borderRadius:8, border:'1px solid rgba(245,158,11,0.3)'}}>
                ⚡ {c.intermediate_effect}
              </span>
              <span style={{color:'var(--text-secondary)'}}>→</span>
              <span style={{padding:'0.4rem 0.7rem', background:'rgba(59,130,246,0.1)', borderRadius:8, border:'1px solid rgba(59,130,246,0.3)'}}>
                🎯 {c.strategic_imperative}
              </span>
              {c.linked_decision_title && (
                <>
                  <span style={{color:'var(--text-secondary)'}}>→</span>
                  <span style={{padding:'0.4rem 0.7rem', background:'rgba(16,185,129,0.1)', borderRadius:8, border:'1px solid rgba(16,185,129,0.3)', fontWeight:600}}>
                    ✅ {c.linked_decision_title}
                  </span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
