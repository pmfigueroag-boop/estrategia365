/**
 * DashboardCharts — Executive Dashboard Visualizations (Phase 4)
 * ================================================================
 * Composite chart set for the main dashboard:
 * - Objectives by status (PieChart)
 * - KR progress distribution (BarChart)
 * - PESTEL severity breakdown (BarChart)
 */
"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const STATUS_COLORS = {
  formulated: '#6366f1',
  in_progress: '#f59e0b',
  completed: '#10b981',
  blocked: '#ef4444',
};

const STATUS_LABELS = {
  formulated: 'Formulado',
  in_progress: 'En Progreso',
  completed: 'Completado',
  blocked: 'Bloqueado',
};

export function ObjectivesPie({ objectives = [] }) {
  if (!objectives.length) return null;

  const statusCounts = {};
  objectives.forEach(o => {
    const s = o.status || 'formulated';
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });

  const data = Object.entries(statusCounts).map(([status, count]) => ({
    name: STATUS_LABELS[status] || status,
    value: count,
    color: STATUS_COLORS[status] || '#6366f1',
  }));

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>🎯 Objetivos por Estado</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={{ stroke: 'var(--text-tertiary)' }}>
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip contentStyle={{ background: 'rgba(10,15,26,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.85rem' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PestelSeverityBar({ signals = [] }) {
  if (!signals.length) return null;

  const severityCounts = { high: 0, medium: 0, low: 0 };
  signals.forEach(s => { severityCounts[s.severity] = (severityCounts[s.severity] || 0) + 1; });

  const data = [
    { name: 'Alta', count: severityCounts.high, fill: '#ef4444' },
    { name: 'Media', count: severityCounts.medium, fill: '#f59e0b' },
    { name: 'Baja', count: severityCounts.low, fill: '#10b981' },
  ];

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>🌍 Señales PESTEL por Severidad</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} />
          <Tooltip contentStyle={{ background: 'rgba(10,15,26,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.85rem' }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
            {data.map((entry, i) => <Cell key={i} fill={entry.fill} fillOpacity={0.8} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ProgressSummary({ progress }) {
  if (!progress) return null;

  const data = [
    { name: 'Objetivos', value: progress.total_objectives || 0, color: '#6366f1' },
    { name: 'Completados', value: progress.completed || 0, color: '#10b981' },
    { name: 'En Progreso', value: progress.in_progress || 0, color: '#f59e0b' },
    { name: 'Bloqueados', value: progress.blocked || 0, color: '#ef4444' },
  ];

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>📈 Progreso de Ejecución</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {data.map((d, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: d.color }}>{d.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{d.name}</div>
          </div>
        ))}
      </div>
      {progress.avg_kr_progress != null && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Key Results Promedio</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6366f1' }}>{Math.round(progress.avg_kr_progress)}%</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, progress.avg_kr_progress)}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #818cf8)', borderRadius: '3px', transition: 'width 0.6s ease' }} />
          </div>
        </div>
      )}
    </div>
  );
}
