'use client';

import { useState } from 'react';
import { useTwinHealth, useTwinSnapshots, useTwinTimeline, useTwinMetrics, useMutation } from '@/lib/swr-hooks';
import api from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

// ── Helpers ─────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function scoreTier(score) {
  if (score >= 80) return { label: 'Excelente', color: 'var(--success-color)' };
  if (score >= 60) return { label: 'Bueno', color: 'var(--accent-primary)' };
  if (score >= 40) return { label: 'En Progreso', color: 'var(--warning-color)' };
  return { label: 'Inicial', color: 'var(--danger-color)' };
}

// ── Main Page ───────────────────────────────────────────────────
export default function TwinPage() {
  const [instId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('current_institution_id') || '1';
    }
    return '1';
  });

  const { data: health, isLoading: healthLoading, mutate: mutateHealth } = useTwinHealth(instId);
  const { data: snapshots, isLoading: snapsLoading, mutate: mutateSnaps } = useTwinSnapshots(instId);
  const { data: timeline, isLoading: timelineLoading } = useTwinTimeline(instId);
  const { data: completenessMetrics } = useTwinMetrics(instId, 'completeness.overall');

  const { trigger: captureSnap, isSubmitting: capturing } = useMutation(
    () => api.captureSnapshot(instId)
  );

  const handleCapture = async () => {
    try {
      await captureSnap();
      mutateHealth();
      mutateSnaps();
    } catch { /* toast would handle */ }
  };

  const tier = health ? scoreTier(health.completeness?.overall ?? 0) : null;

  return (
    <main style={{ padding: '2rem', maxWidth: 'var(--max-content-width)', margin: '0 auto' }}>

      {/* ── Page Header ─────────────────────────────────── */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">
            <span className="text-gradient">Digital Twin</span>
          </h1>
          <p className="page-subtitle">
            Estado organizacional en tiempo real · Snapshots · Métricas · Timeline
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleCapture}
          disabled={capturing}
          id="btn-capture-snapshot"
          style={{ whiteSpace: 'nowrap' }}
        >
          {capturing ? '⏳ Capturando...' : '📸 Capturar Snapshot'}
        </button>
      </div>

      {/* ── Health KPI Row ───────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {healthLoading ? (
          <>
            <div className="glass-panel skeleton-kpi skeleton" />
            <div className="glass-panel skeleton-kpi skeleton" />
            <div className="glass-panel skeleton-kpi skeleton" />
            <div className="glass-panel skeleton-kpi skeleton" />
          </>
        ) : health ? (
          <>
            <div className="glass-panel kpi-widget" style={{ borderTopColor: tier.color }}>
              <div className="kpi-value" style={{ color: tier.color }}>
                {Math.round(health.completeness?.overall ?? 0)}%
              </div>
              <div className="kpi-label">Completitud General</div>
              <div className={`kpi-delta ${health.trend?.direction === 'up' ? 'positive' : health.trend?.direction === 'down' ? 'negative' : ''}`}>
                {health.trend?.direction === 'up' ? '↑' : health.trend?.direction === 'down' ? '↓' : '→'}{' '}
                {health.trend?.delta != null ? `${health.trend.delta > 0 ? '+' : ''}${health.trend.delta.toFixed(1)}%` : 'Sin historial'}
              </div>
            </div>

            <div className="glass-panel kpi-widget" style={{ borderTopColor: 'var(--accent-secondary)' }}>
              <div className="kpi-value">{tier.label}</div>
              <div className="kpi-label">Nivel de Madurez</div>
            </div>

            <div className="glass-panel kpi-widget" style={{ borderTopColor: 'var(--info-color)' }}>
              <div className="kpi-value">{snapshots?.length ?? 0}</div>
              <div className="kpi-label">Snapshots Totales</div>
            </div>

            <div className="glass-panel kpi-widget" style={{ borderTopColor: 'var(--color-hoshin)' }}>
              <div className="kpi-value">
                {Object.keys(health.completeness || {}).filter(k => k !== 'overall').length}
              </div>
              <div className="kpi-label">Dimensiones Rastreadas</div>
            </div>
          </>
        ) : (
          <div className="glass-panel empty-state" style={{ gridColumn: '1 / -1' }}>
            No hay datos de twin disponibles. Captura el primer snapshot para comenzar.
          </div>
        )}
      </div>

      {/* ── Two-Column: Completeness Chart + Dimensions ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>

        {/* Completeness Over Time */}
        <div className="glass-panel card">
          <h2 className="card-header" style={{ fontSize: '1.1rem' }}>📈 Completitud en el Tiempo</h2>
          {completenessMetrics?.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={completenessMetrics.map(m => ({ date: formatDate(m.recorded_at), value: m.value }))}>
                <defs>
                  <linearGradient id="completenessGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-color)', border: '1px solid var(--surface-border)', borderRadius: 8, fontSize: '0.85rem' }}
                  labelStyle={{ color: 'var(--text-secondary)' }}
                />
                <Area type="monotone" dataKey="value" stroke="var(--accent-primary)" fill="url(#completenessGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '2rem', fontSize: '0.95rem' }}>
              Captura múltiples snapshots para ver la tendencia de completitud.
            </div>
          )}
        </div>

        {/* Completeness Dimensions */}
        <div className="glass-panel card">
          <h2 className="card-header" style={{ fontSize: '1.1rem' }}>📊 Dimensiones</h2>
          {health?.completeness ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Object.entries(health.completeness)
                .filter(([k]) => k !== 'overall')
                .sort(([, a], [, b]) => b - a)
                .map(([key, val]) => {
                  const pct = Math.round(val);
                  const t = scoreTier(pct);
                  return (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                        <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                        <span style={{ color: t.color, fontWeight: 600 }}>{pct}%</span>
                      </div>
                      <div className="progress-track sm">
                        <div className="progress-fill" style={{ width: `${pct}%`, background: t.color }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="empty-state" style={{ fontSize: '0.9rem' }}>Sin datos de dimensiones</div>
          )}
        </div>
      </div>

      {/* ── Two-Column: Snapshots + Timeline ─────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Snapshot History */}
        <div className="glass-panel card">
          <h2 className="card-header" style={{ fontSize: '1.1rem' }}>📸 Historial de Snapshots</h2>
          {snapsLoading ? (
            <div className="skeleton skeleton-card" />
          ) : snapshots?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 360, overflowY: 'auto' }}>
              {snapshots.map(snap => (
                <div key={snap.id} className="evidence-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      v{snap.version}
                      <span className="governance-badge valid" style={{ marginLeft: '0.5rem' }}>
                        {snap.trigger || 'manual'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>
                      {formatDate(snap.captured_at)}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: scoreTier(snap.completeness_score ?? 0).color }}>
                    {Math.round(snap.completeness_score ?? 0)}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ fontSize: '0.9rem' }}>
              Sin snapshots. Captura el primero con el botón de arriba.
            </div>
          )}
        </div>

        {/* Event Timeline */}
        <div className="glass-panel card">
          <h2 className="card-header" style={{ fontSize: '1.1rem' }}>📋 Timeline de Cambios</h2>
          {timelineLoading ? (
            <div className="skeleton skeleton-card" />
          ) : timeline?.length > 0 ? (
            <div style={{ paddingLeft: '0.5rem', maxHeight: 360, overflowY: 'auto' }}>
              {timeline.slice(0, 20).map((evt, i) => (
                <div key={evt.id || i} className={`timeline-item ${evt.severity === 'high' ? 'danger' : evt.severity === 'medium' ? 'warning' : 'success'}`}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {evt.event_type?.replace(/_/g, ' ') || 'Evento'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>
                    {formatDate(evt.occurred_at)} · v{evt.snapshot_version ?? '—'}
                  </div>
                  {evt.description && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                      {evt.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ fontSize: '0.9rem' }}>
              Sin eventos registrados aún.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
