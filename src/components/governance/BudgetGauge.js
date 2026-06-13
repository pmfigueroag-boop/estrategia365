'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import GaugeArc from '@/components/charts/GaugeArc';

/**
 * BudgetGauge — AI Budget Widget
 * =================================
 * Traffic-light gauge showing AI usage budget.
 * GREEN (< 60%) → YELLOW (60-85%) → RED (> 85%)
 */
export default function BudgetGauge({ tenantId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    api.getAIBudget(tenantId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [tenantId]);

  if (loading) return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>Cargando presupuesto IA...</div>;
  if (!data) return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>Sin datos de presupuesto</div>;

  const budget = data.budget || {};
  const usage = data.usage || {};

  const stateColors = { GREEN: '#10b981', YELLOW: '#f59e0b', RED: '#ef4444' };
  const stateLabels = { GREEN: 'Saludable', YELLOW: 'Precaución', RED: 'Crítico' };
  const color = stateColors[budget.state] || '#6366f1';

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>🔋 Presupuesto IA</h3>
          <span style={{
            display: 'inline-block', padding: '2px 10px', borderRadius: 6,
            fontSize: '0.72rem', fontWeight: 600,
            background: `${color}18`, color, border: `1px solid ${color}33`,
          }}>
            {stateLabels[budget.state] || budget.state}
          </span>
        </div>
        <GaugeArc
          value={budget.utilization_pct || 0}
          max={100}
          size={120}
          label="Utilización"
          colorOverride={color}
        />
      </div>

      {/* Usage breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
        <div style={{ background: 'rgba(99, 102, 241, 0.06)', borderRadius: 8, padding: '0.75rem' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>Llamadas AI</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {budget.current_calls ?? '—'}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400 }}> / {budget.max_calls ?? '∞'}</span>
          </div>
        </div>
        <div style={{ background: 'rgba(16, 185, 129, 0.06)', borderRadius: 8, padding: '0.75rem' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>Costo Total</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            ${(usage.total_cost_usd || 0).toFixed(2)}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
            Proyectado: ${(usage.projected_monthly_cost || 0).toFixed(2)}/mes
          </div>
        </div>
      </div>

      {/* Provider breakdown */}
      {usage.by_provider && Object.keys(usage.by_provider).length > 0 && (
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: '0.4rem' }}>Por Proveedor</div>
          {Object.entries(usage.by_provider).map(([provider, info]) => (
            <div key={provider} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.35rem 0', borderBottom: '1px solid rgba(148,163,184,0.08)',
              fontSize: '0.8rem',
            }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{provider}</span>
              <span style={{ color: 'var(--text-tertiary)', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                {typeof info === 'object' ? `${info.calls || 0} calls · $${(info.cost || 0).toFixed(2)}` : info}
              </span>
            </div>
          ))}
        </div>
      )}

      {budget.message && (
        <p style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          💡 {budget.message}
        </p>
      )}
    </div>
  );
}
