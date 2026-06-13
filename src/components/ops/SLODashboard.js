'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import GaugeArc from '@/components/charts/GaugeArc';
import SparkLine from '@/components/charts/SparkLine';

/**
 * SLODashboard — Service Level Objectives
 * ==========================================
 * 4 SLO cards with error budget burn-down bars.
 */
export default function SLODashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSLODashboard()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>Cargando SLOs...</div>;
  if (!data) return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>Sin datos de SLOs</div>;

  const slos = Array.isArray(data) ? data : (data.slos || data.objectives || []);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {slos.map((slo, i) => {
          const current = slo.current_value ?? slo.current ?? 0;
          const target = slo.target_value ?? slo.target ?? 99.9;
          const pct = target > 0 ? (current / target) * 100 : 0;
          const budgetRemaining = slo.error_budget_remaining ?? slo.budget_remaining ?? null;
          const isHealthy = pct >= 100;
          const color = isHealthy ? '#10b981' : pct >= 95 ? '#f59e0b' : '#ef4444';
          const history = slo.history || slo.trend || [];

          return (
            <div key={slo.name || i} className="glass-panel animate-fade-in" style={{
              padding: '1.25rem', borderLeft: `3px solid ${color}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{slo.name || `SLO ${i + 1}`}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{slo.description || ''}</div>
                </div>
                <span style={{
                  padding: '2px 8px', borderRadius: 6, fontSize: '0.68rem', fontWeight: 600,
                  background: `${color}15`, color, border: `1px solid ${color}30`,
                }}>
                  {isHealthy ? 'ON TARGET' : 'AT RISK'}
                </span>
              </div>

              {/* Value bar */}
              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>
                  <span>Current: {typeof current === 'number' ? current.toFixed(2) : current}%</span>
                  <span>Target: {target}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(148,163,184,0.1)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    width: `${Math.min(100, pct)}%`,
                    background: `linear-gradient(90deg, ${color}, ${color}aa)`,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>

              {/* Error budget */}
              {budgetRemaining != null && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Error Budget Restante</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: budgetRemaining > 50 ? '#10b981' : budgetRemaining > 20 ? '#f59e0b' : '#ef4444' }}>
                      {budgetRemaining.toFixed(1)}%
                    </div>
                  </div>
                  {history.length > 1 && <SparkLine data={history} width={70} height={22} />}
                </div>
              )}

              {slo.violations != null && (
                <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: '0.4rem' }}>
                  Violaciones: <span style={{ fontWeight: 600, color: slo.violations > 0 ? '#ef4444' : '#10b981' }}>{slo.violations}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {slos.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No hay SLOs configurados.</p>}
    </div>
  );
}
