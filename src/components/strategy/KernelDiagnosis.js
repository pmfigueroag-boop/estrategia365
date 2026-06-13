'use client';

/**
 * KernelDiagnosis — Rumelt Core: Diagnosis + Guiding Policy display
 * Extracted from strategy/page.js (Phase 1: Frontend Decomposition)
 */
export default function KernelDiagnosis({ kernel }) {
  if (!kernel) return null;

  return (
    <>
      {/* Rumelt Core: Diagnosis + Guiding Policy */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', marginBottom:'1.5rem'}}>
        <div className="glass-panel" style={{padding:'1.5rem', borderLeft:'4px solid var(--danger-color)'}}>
          <h3 style={{color:'var(--danger-color)', marginBottom:'0.75rem', fontSize:'1rem'}}>🔍 DIAGNÓSTICO — Desafío Crítico</h3>
          <p style={{lineHeight:1.7, fontSize:'0.95rem'}}>{kernel.diagnosis}</p>
        </div>
        <div className="glass-panel" style={{padding:'1.5rem', borderLeft:'4px solid var(--accent-primary)'}}>
          <h3 style={{color:'var(--accent-primary)', marginBottom:'0.75rem', fontSize:'1rem'}}>🧭 POLÍTICA GUÍA — Enfoque Estratégico</h3>
          <p style={{lineHeight:1.7, fontSize:'0.95rem'}}>{kernel.guiding_policy}</p>
        </div>
      </div>

      {/* Executive Summary */}
      {kernel.summary && (
        <div className="glass-panel" style={{padding:'1rem 1.5rem', marginBottom:'1.5rem', borderLeft:'4px solid var(--accent-secondary)', fontSize:'0.9rem'}}>
          <strong style={{color:'var(--accent-secondary)'}}>📊 Resumen Ejecutivo:</strong> {kernel.summary}
        </div>
      )}
    </>
  );
}
