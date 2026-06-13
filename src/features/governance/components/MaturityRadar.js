'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import RadarChart from '@/features/charts/components/RadarChart';

/**
 * MaturityRadar — AI Maturity Score
 * ====================================
 * 6-dimension radar chart with grade badge.
 */
export default function MaturityRadar({ tenantId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    api.getAIMaturity(tenantId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [tenantId]);

  if (loading) return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>Cargando AI Maturity...</div>;
  if (!data) return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>Sin datos de madurez IA</div>;

  const dimensions = Object.entries(data.dimensions || {}).map(([key, val]) => ({
    label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    value: typeof val === 'object' ? (val.score || 0) : val,
    max: 100,
  }));

  const gradeColors = { A: '#10b981', B: '#22c55e', C: '#f59e0b', D: '#f97316', F: '#ef4444' };
  const gradeColor = gradeColors[data.grade] || '#6366f1';

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>🧠 Madurez IA</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 10,
            background: `${gradeColor}18`, border: `2px solid ${gradeColor}`,
            color: gradeColor, fontWeight: 800, fontSize: '1.2rem',
          }}>
            {data.grade || '—'}
          </span>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: gradeColor }}>{data.overall_score}/100</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Score global</div>
          </div>
        </div>
      </div>

      {dimensions.length >= 3 ? (
        <RadarChart
          dimensions={dimensions}
          size={260}
          color={gradeColor}
          bgColor={`${gradeColor}12`}
        />
      ) : (
        <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
          Se necesitan al menos 3 dimensiones para el radar.
        </p>
      )}

      {/* Recommendations */}
      {data.recommendations && data.recommendations.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: '0.4rem', fontWeight: 600 }}>
            📋 Recomendaciones
          </div>
          {data.recommendations.slice(0, 3).map((rec, i) => (
            <div key={i} style={{
              fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4,
              padding: '0.3rem 0', borderBottom: '1px solid rgba(148,163,184,0.06)',
            }}>
              {i + 1}. {rec}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
