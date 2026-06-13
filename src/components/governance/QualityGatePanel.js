'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import SparkLine from '@/components/charts/SparkLine';

/**
 * QualityGatePanel — Module Quality Scores
 * ============================================
 * Per-module quality scores with 7-day trend sparklines.
 */
export default function QualityGatePanel({ planId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!planId) return;
    api.getTelemetryStats(planId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [planId]);

  if (loading) return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>Cargando Quality Gate...</div>;
  if (!data) return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>Sin datos de calidad</div>;

  const modules = Array.isArray(data.modules) ? data.modules : (Array.isArray(data) ? data : []);

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const avgScore = modules.length > 0
    ? Math.round(modules.reduce((s, m) => s + (m.score || m.quality_score || 0), 0) / modules.length)
    : 0;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>🛡️ Quality Gate</h3>
        <div style={{
          padding: '4px 12px', borderRadius: 8,
          background: `${getScoreColor(avgScore)}15`,
          color: getScoreColor(avgScore),
          fontWeight: 700, fontSize: '0.85rem',
        }}>
          {avgScore}/100
        </div>
      </div>

      {modules.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No hay módulos con datos de calidad.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {modules.map((mod, i) => {
            const score = mod.score || mod.quality_score || 0;
            const trend = mod.trend || mod.history || [];
            const color = getScoreColor(score);
            return (
              <div key={mod.name || i} style={{
                display: 'grid', gridTemplateColumns: '1fr auto auto auto',
                alignItems: 'center', gap: '0.75rem',
                padding: '0.6rem 0.75rem', borderRadius: 8,
                background: 'rgba(15, 23, 42, 0.4)',
                borderLeft: `3px solid ${color}`,
              }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{mod.name || mod.module}</div>
                  {mod.recommendation && <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{mod.recommendation}</div>}
                </div>
                <SparkLine data={trend} width={60} height={20} />
                <span style={{
                  fontWeight: 700, fontSize: '0.85rem', color,
                  fontFamily: 'monospace', minWidth: 32, textAlign: 'right',
                }}>
                  {score}
                </span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 24, height: 24, borderRadius: 6,
                  background: `${color}18`, color, fontWeight: 700, fontSize: '0.75rem',
                }}>
                  {getGrade(score)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
