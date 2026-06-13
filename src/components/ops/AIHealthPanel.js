'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

/**
 * AIHealthPanel — AI Provider Health & Drift
 * =============================================
 * Aggregated AI health from drift report endpoint.
 */
export default function AIHealthPanel({ planId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!planId) return;
    api.getDriftReport(planId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [planId]);

  if (loading) return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>Cargando AI Health...</div>;
  if (!data) return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>Sin datos de salud IA</div>;

  const alerts = data.alerts || data.drift_alerts || [];
  const providers = data.providers || data.provider_status || [];
  const overallHealth = data.overall_health || data.health_score || data.status || 'unknown';

  const healthColors = { healthy: '#10b981', degraded: '#f59e0b', critical: '#ef4444', unknown: '#6366f1' };
  const healthColor = healthColors[overallHealth] || healthColors.unknown;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>🤖 AI Health Monitor</h3>
        <span style={{
          padding: '3px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600,
          background: `${healthColor}15`, color: healthColor, border: `1px solid ${healthColor}30`,
          textTransform: 'uppercase',
        }}>
          {overallHealth}
        </span>
      </div>

      {/* Provider status */}
      {Array.isArray(providers) && providers.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: '0.4rem', fontWeight: 600 }}>Proveedores</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem' }}>
            {providers.map((p, i) => {
              const pStatus = p.status || 'unknown';
              const pColor = healthColors[pStatus] || '#94a3b8';
              return (
                <div key={p.name || i} style={{
                  padding: '0.6rem', borderRadius: 8,
                  background: 'rgba(15, 23, 42, 0.4)',
                  borderLeft: `3px solid ${pColor}`,
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name || p.provider}</div>
                  <div style={{ fontSize: '0.68rem', color: pColor, fontWeight: 500, marginTop: 2 }}>● {pStatus}</div>
                  {p.latency_ms != null && <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 2 }}>Latencia: {p.latency_ms}ms</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Drift alerts */}
      {alerts.length > 0 ? (
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: '0.4rem', fontWeight: 600 }}>⚠️ Alertas de Drift ({alerts.length})</div>
          {alerts.map((alert, i) => (
            <div key={i} style={{
              padding: '0.5rem 0.75rem', marginBottom: '0.4rem', borderRadius: 6,
              background: 'rgba(245, 158, 11, 0.06)',
              border: '1px solid rgba(245, 158, 11, 0.15)',
              fontSize: '0.78rem', color: 'var(--text-secondary)',
            }}>
              <strong style={{ color: '#f59e0b' }}>{alert.module || alert.type || 'Drift'}:</strong>{' '}
              {alert.message || alert.description || JSON.stringify(alert)}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '0.75rem', borderRadius: 8, background: 'rgba(16,185,129,0.06)', textAlign: 'center', fontSize: '0.82rem', color: '#10b981' }}>
          ✅ Sin alertas de drift — Todos los modelos estables
        </div>
      )}

      {/* Model metrics */}
      {data.metrics && typeof data.metrics === 'object' && (
        <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          {Object.entries(data.metrics).slice(0, 6).map(([key, val]) => (
            <div key={key} style={{ textAlign: 'center', padding: '0.5rem', borderRadius: 6, background: 'rgba(99,102,241,0.05)' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{typeof val === 'number' ? val.toFixed(1) : val}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)' }}>{key.replace(/_/g, ' ')}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
