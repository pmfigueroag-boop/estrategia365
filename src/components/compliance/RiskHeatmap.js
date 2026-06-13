'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

/**
 * RiskHeatmap — Risk Register with RPN Matrix
 * ================================================
 * 5×5 probability/impact heatmap with risk count badges.
 */
const IMPACT_LABELS = ['Insignificante', 'Menor', 'Moderado', 'Mayor', 'Catastrófico'];
const PROB_LABELS = ['Raro', 'Improbable', 'Posible', 'Probable', 'Casi Seguro'];

function getCellColor(prob, impact) {
  const rpn = prob * impact;
  if (rpn >= 15) return { bg: 'rgba(239,68,68,0.3)', border: '#ef4444' };
  if (rpn >= 8) return { bg: 'rgba(245,158,11,0.2)', border: '#f59e0b' };
  if (rpn >= 4) return { bg: 'rgba(99,102,241,0.12)', border: '#6366f1' };
  return { bg: 'rgba(16,185,129,0.08)', border: '#10b981' };
}

export default function RiskHeatmap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRisks, setSelectedRisks] = useState(null);

  useEffect(() => {
    api.getRiskRegister()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>Cargando riesgos...</div>;
  if (!data) return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>Sin datos de riesgos</div>;

  const risks = Array.isArray(data) ? data : (data.risks || data.register || []);

  // Build matrix: matrix[prob][impact] = [risk, ...]
  const matrix = {};
  for (let p = 1; p <= 5; p++) {
    matrix[p] = {};
    for (let i = 1; i <= 5; i++) matrix[p][i] = [];
  }
  risks.forEach(r => {
    const p = Math.min(5, Math.max(1, r.probability || r.likelihood || 1));
    const i = Math.min(5, Math.max(1, r.impact || r.severity || 1));
    matrix[p][i].push(r);
  });

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>🔥 Risk Register — RPN Heatmap</h3>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{risks.length} riesgos identificados</span>
      </div>

      {/* Heatmap grid */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '90px repeat(5, 1fr)', gap: 3, minWidth: 500 }}>
          {/* Header row */}
          <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 600, textAlign: 'right', paddingRight: 8, alignSelf: 'end' }}>
            PROB ↓ / IMP →
          </div>
          {IMPACT_LABELS.map((label, i) => (
            <div key={i} style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: '0.25rem', fontWeight: 500 }}>
              {label}
            </div>
          ))}

          {/* Matrix rows (probability 5 → 1, top to bottom) */}
          {[5, 4, 3, 2, 1].map(prob => (
            <>
              <div key={`label-${prob}`} style={{
                fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 500,
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8,
              }}>
                {PROB_LABELS[prob - 1]}
              </div>
              {[1, 2, 3, 4, 5].map(impact => {
                const cell = matrix[prob][impact];
                const colors = getCellColor(prob, impact);
                return (
                  <div
                    key={`${prob}-${impact}`}
                    onClick={() => cell.length > 0 && setSelectedRisks(cell)}
                    style={{
                      background: colors.bg, borderRadius: 6,
                      border: `1px solid ${colors.border}22`,
                      padding: '0.5rem', textAlign: 'center',
                      minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: cell.length > 0 ? 'pointer' : 'default',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                    }}
                    onMouseOver={e => { if (cell.length > 0) e.target.style.transform = 'scale(1.05)'; }}
                    onMouseOut={e => { e.target.style.transform = 'scale(1)'; }}
                  >
                    {cell.length > 0 && (
                      <span style={{
                        fontWeight: 700, fontSize: '0.85rem', color: colors.border,
                        background: `${colors.border}20`, width: 26, height: 26, borderRadius: 6,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {cell.length}
                      </span>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      {/* Selected risks detail */}
      {selectedRisks && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: 8, background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(148,163,184,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {selectedRisks.length} riesgo(s) seleccionados
            </span>
            <button onClick={() => setSelectedRisks(null)} style={{
              background: 'none', border: 'none', color: 'var(--text-tertiary)',
              cursor: 'pointer', fontSize: '1rem',
            }}>✕</button>
          </div>
          {selectedRisks.map((r, i) => (
            <div key={i} style={{
              padding: '0.4rem 0', borderBottom: '1px solid rgba(148,163,184,0.06)',
              fontSize: '0.78rem',
            }}>
              <strong style={{ color: 'var(--text-primary)' }}>{r.name || r.title || `Riesgo ${i + 1}`}</strong>
              {r.description && <span style={{ color: 'var(--text-secondary)', marginLeft: 8 }}>— {r.description}</span>}
              <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                RPN: {(r.probability || 1) * (r.impact || 1)} · Mitigación: {r.mitigation || '—'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
