'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

/**
 * SOC2Matrix — SOC2 Type II Control Matrix
 * ============================================
 * Grid of controls with status badges.
 */
export default function SOC2Matrix() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSOC2Matrix()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>Cargando SOC2 Matrix...</div>;
  if (!data) return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>Sin datos de controles SOC2</div>;

  const controls = Array.isArray(data) ? data : (data.controls || data.matrix || []);
  const categories = [...new Set(controls.map(c => c.category || c.domain || 'General'))];

  const statusConfig = {
    implemented: { label: 'Implementado', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
    partial: { label: 'Parcial', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
    gap: { label: 'Gap', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
    planned: { label: 'Planificado', color: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
    'not_applicable': { label: 'N/A', color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
  };

  const total = controls.length;
  const implemented = controls.filter(c => (c.status || '').toLowerCase() === 'implemented').length;
  const coverage = total > 0 ? Math.round((implemented / total) * 100) : 0;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>🏛️ SOC2 Type II Control Matrix</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: `conic-gradient(#10b981 ${coverage}%, rgba(148,163,184,0.1) ${coverage}%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: 'var(--card-bg, #0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: '#10b981' }}>
              {coverage}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)' }}>Cobertura</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)' }}>{implemented}/{total} controles</div>
          </div>
        </div>
      </div>

      {/* Status legend */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.68rem', color: cfg.color }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: cfg.color }} />{cfg.label}
          </span>
        ))}
      </div>

      {/* Controls by category */}
      {categories.map(cat => {
        const catControls = controls.filter(c => (c.category || c.domain || 'General') === cat);
        return (
          <div key={cat} style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem', paddingBottom: '0.3rem', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
              {cat} <span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}>({catControls.length})</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.4rem' }}>
              {catControls.map((ctrl, i) => {
                const st = statusConfig[(ctrl.status || 'gap').toLowerCase()] || statusConfig.gap;
                return (
                  <div key={ctrl.id || i} style={{
                    padding: '0.5rem 0.75rem', borderRadius: 6,
                    background: st.bg, borderLeft: `3px solid ${st.color}`,
                    fontSize: '0.78rem',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ctrl.name || ctrl.control_id}</span>
                      <span style={{ fontSize: '0.62rem', fontWeight: 600, color: st.color, padding: '1px 6px', borderRadius: 4, background: `${st.color}15` }}>
                        {st.label}
                      </span>
                    </div>
                    {ctrl.description && <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 2 }}>{ctrl.description}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
