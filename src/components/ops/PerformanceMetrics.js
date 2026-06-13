'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

/**
 * PerformanceMetrics — Latency & Throughput
 * ============================================
 * Latency percentiles (P50/P95/P99) and request rate.
 */
export default function PerformanceMetrics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPerformanceMetrics()
      .then(raw => {
        // Parse Prometheus text format if needed
        if (typeof raw === 'string') {
          setData(parsePrometheus(raw));
        } else {
          setData(raw);
        }
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>Cargando métricas...</div>;
  if (!data) return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>Sin datos de rendimiento</div>;

  const metrics = [
    { label: 'P50 Latency', value: data.p50 ?? data.latency_p50 ?? '—', unit: 'ms', color: '#10b981' },
    { label: 'P95 Latency', value: data.p95 ?? data.latency_p95 ?? '—', unit: 'ms', color: '#f59e0b' },
    { label: 'P99 Latency', value: data.p99 ?? data.latency_p99 ?? '—', unit: 'ms', color: '#ef4444' },
    { label: 'Request Rate', value: data.request_rate ?? data.rps ?? '—', unit: 'req/s', color: '#6366f1' },
    { label: 'Success Rate', value: data.success_rate ?? '—', unit: '%', color: '#10b981' },
    { label: 'Active Conns', value: data.active_connections ?? data.connections ?? '—', unit: '', color: '#8b5cf6' },
  ];

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>⚡ Performance Metrics</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
        {metrics.map((m, i) => (
          <div key={i} style={{
            textAlign: 'center', padding: '1rem', borderRadius: 10,
            background: 'rgba(15, 23, 42, 0.4)',
            border: `1px solid ${m.color}15`,
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: m.color }}>
              {typeof m.value === 'number' ? m.value.toFixed(1) : m.value}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
              {m.unit && <span style={{ color: m.color, fontWeight: 600 }}>{m.unit}</span>}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 4, fontWeight: 500 }}>
              {m.label}
            </div>
          </div>
        ))}
      </div>

      {/* Latency visualization bar */}
      {data.p50 != null && data.p99 != null && (
        <div style={{ marginTop: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: '0.4rem', fontWeight: 600 }}>Distribución de Latencia</div>
          <div style={{ height: 8, borderRadius: 4, background: 'rgba(148,163,184,0.08)', overflow: 'hidden', position: 'relative' }}>
            <div style={{
              position: 'absolute', left: 0, height: '100%', borderRadius: 4,
              width: `${Math.min(100, (data.p50 / (data.p99 * 1.2)) * 100)}%`,
              background: 'linear-gradient(90deg, #10b981, #f59e0b)',
              transition: 'width 0.6s ease',
            }} />
            <div style={{
              position: 'absolute', left: 0, height: '100%', borderRadius: 4,
              width: `${Math.min(100, (data.p95 / (data.p99 * 1.2)) * 100)}%`,
              background: 'linear-gradient(90deg, transparent 70%, #f59e0b33)',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--text-tertiary)', marginTop: 3 }}>
            <span>0ms</span>
            <span style={{ color: '#10b981' }}>P50: {data.p50?.toFixed(0)}ms</span>
            <span style={{ color: '#f59e0b' }}>P95: {data.p95?.toFixed(0)}ms</span>
            <span style={{ color: '#ef4444' }}>P99: {data.p99?.toFixed(0)}ms</span>
          </div>
        </div>
      )}
    </div>
  );
}

function parsePrometheus(text) {
  const metrics = {};
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.startsWith('#') || !line.trim()) continue;
    const match = line.match(/^(\w+)(?:\{.*?\})?\s+(.+)$/);
    if (match) {
      metrics[match[1]] = parseFloat(match[2]);
    }
  }
  return metrics;
}
