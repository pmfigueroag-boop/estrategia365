/**
 * BscGauge — Balanced Scorecard Progress Bars (Phase 4)
 * ======================================================
 */
"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell, LabelList } from 'recharts';

const PERSPECTIVE_CONFIG = {
  financial: { label: 'Financiera', color: '#6366f1', icon: '💰' },
  customer: { label: 'Cliente', color: '#06b6d4', icon: '👥' },
  process: { label: 'Procesos', color: '#f59e0b', icon: '⚙️' },
  learning: { label: 'Aprendizaje', color: '#10b981', icon: '📚' },
};

export default function BscGauge({ perspectives = [] }) {
  if (!perspectives.length) return null;

  const data = perspectives.map(p => {
    const cfg = PERSPECTIVE_CONFIG[p.perspective] || { label: p.perspective, color: '#6366f1', icon: '📊' };
    const progress = p.target_value > 0
      ? Math.min(100, Math.round((p.current_value / p.target_value) * 100))
      : 0;
    return {
      name: `${cfg.icon} ${cfg.label}`,
      progress,
      color: cfg.color,
      kpi: p.kpi || p.objective || '',
      current: p.current_value,
      target: p.target_value,
    };
  });

  const avgProgress = Math.round(data.reduce((s, d) => s + d.progress, 0) / (data.length || 1));

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>📊 Progreso BSC</h3>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: avgProgress >= 70 ? '#10b981' : avgProgress >= 40 ? '#f59e0b' : '#ef4444' }}>
          Promedio: {avgProgress}%
        </span>
      </div>
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 60)}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} tickFormatter={v => `${v}%`} />
          <YAxis type="category" dataKey="name" width={120} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: 'rgba(10,15,26,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
            formatter={(val, _, entry) => [`${val}% (${entry.payload.current}/${entry.payload.target})`, 'Progreso']}
          />
          <Bar dataKey="progress" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} fillOpacity={0.8} />
            ))}
            <LabelList dataKey="progress" position="right" formatter={v => `${v}%`} style={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
