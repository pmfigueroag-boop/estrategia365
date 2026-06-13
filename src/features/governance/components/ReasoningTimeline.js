'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

/**
 * ReasoningTimeline — Chain-of-Thought Viewer
 * ================================================
 * Expandable timeline of AI reasoning decisions.
 */
export default function ReasoningTimeline({ planId }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    if (!planId) return;
    api.getReasoningHistory(planId, 20)
      .then(d => setEntries(Array.isArray(d) ? d : (d.entries || d.history || [])))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [planId]);

  const toggle = (i) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }));

  if (loading) return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>Cargando cadena de razonamiento...</div>;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>🔗 Cadena de Razonamiento (CoT)</h3>

      {entries.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          No hay decisiones de razonamiento registradas para este plan.
        </p>
      ) : (
        <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
          {/* Timeline line */}
          <div style={{
            position: 'absolute', left: 8, top: 6, bottom: 6,
            width: 2, background: 'rgba(99, 102, 241, 0.2)', borderRadius: 1,
          }} />

          {entries.map((entry, i) => {
            const isOpen = !!expanded[i];
            const confidence = entry.confidence || entry.confidence_score || null;
            const confColor = confidence != null
              ? (confidence >= 0.8 ? '#10b981' : confidence >= 0.5 ? '#f59e0b' : '#ef4444')
              : '#6366f1';

            return (
              <div key={i} style={{ position: 'relative', marginBottom: '0.75rem' }}>
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute', left: -18, top: 8,
                  width: 10, height: 10, borderRadius: '50%',
                  background: confColor, border: '2px solid rgba(15,23,42,0.8)',
                }} />

                <div
                  onClick={() => toggle(i)}
                  style={{
                    padding: '0.75rem', borderRadius: 8, cursor: 'pointer',
                    background: isOpen ? 'rgba(99, 102, 241, 0.06)' : 'rgba(15, 23, 42, 0.4)',
                    border: `1px solid ${isOpen ? 'rgba(99, 102, 241, 0.2)' : 'transparent'}`,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {entry.operation || entry.action || entry.type || `Paso ${i + 1}`}
                      </span>
                      {confidence != null && (
                        <span style={{
                          padding: '1px 6px', borderRadius: 4,
                          fontSize: '0.65rem', fontWeight: 600,
                          background: `${confColor}18`, color: confColor,
                        }}>
                          {(confidence * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                        {entry.timestamp || entry.created_at ? new Date(entry.timestamp || entry.created_at).toLocaleString() : ''}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                    </div>
                  </div>

                  {/* Summary (always visible) */}
                  {entry.summary && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.3rem', lineHeight: 1.4 }}>
                      {entry.summary.length > 120 && !isOpen ? `${entry.summary.slice(0, 120)}…` : entry.summary}
                    </div>
                  )}

                  {/* Expanded detail */}
                  {isOpen && (
                    <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(148,163,184,0.1)' }}>
                      {entry.reasoning && (
                        <div style={{ marginBottom: '0.4rem' }}>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '0.2rem' }}>Razonamiento</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, fontFamily: 'monospace' }}>
                            {entry.reasoning}
                          </div>
                        </div>
                      )}
                      {entry.steps && Array.isArray(entry.steps) && (
                        <div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '0.2rem' }}>Pasos ({entry.steps.length})</div>
                          {entry.steps.map((step, si) => (
                            <div key={si} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '0.2rem 0', borderBottom: '1px solid rgba(148,163,184,0.05)' }}>
                              {si + 1}. {typeof step === 'string' ? step : step.description || step.text || JSON.stringify(step)}
                            </div>
                          ))}
                        </div>
                      )}
                      {entry.model && (
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: '0.3rem' }}>
                          Modelo: <span style={{ fontFamily: 'monospace' }}>{entry.model}</span>
                          {entry.tokens && ` · ${entry.tokens} tokens`}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
