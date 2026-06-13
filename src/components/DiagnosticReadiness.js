"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';

const MODULE_ICONS = {
  pestel: '🌍', porter: '⚔️', swot: '🎯', tows: '🔀', vrio: '🔑', bcg: '📊', blue_ocean: '🌊',
};

const ALERT_STYLES = {
  error: { bg: 'rgba(239,68,68,0.1)', border: 'var(--danger-color)', icon: '🔴' },
  warning: { bg: 'rgba(245,158,11,0.1)', border: 'var(--warning-color)', icon: '🟡' },
  info: { bg: 'rgba(59,130,246,0.1)', border: 'var(--accent-primary)', icon: '🔵' },
  success: { bg: 'rgba(16,185,129,0.1)', border: 'var(--success-color)', icon: '🟢' },
};

export default function DiagnosticReadiness({ planId, compact = false }) {
  const [readiness, setReadiness] = useState(null);

  useEffect(() => {
    if (!planId) return;

    const fetchReadiness = () => {
      api.getReadiness(planId).then(setReadiness).catch(() => {});
    };

    // Initial fetch
    fetchReadiness();

    // Poll every 15s for header sync
    const interval = setInterval(fetchReadiness, 15000);

    // Listen for immediate updates from analysis page
    const handleUpdate = () => fetchReadiness();
    window.addEventListener('readiness-update', handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('readiness-update', handleUpdate);
    };
  }, [planId]);

  if (!readiness) return null;

  const { modules = {}, score = 0, completed = 0, total = 6, alerts = [] } = readiness;
  const scoreColor = score === 100 ? 'var(--success-color)' : score >= 50 ? 'var(--warning-color)' : 'var(--danger-color)';

  // Compact mode: just the score bar (for Header)
  if (compact) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        background: 'rgba(255,255,255,0.03)', borderRadius: 8,
        padding: '0.25rem 0.6rem', fontSize: '0.75rem',
      }}>
        <span style={{ color: scoreColor, fontWeight: 700 }}>{score}%</span>
        <div style={{ width: 60, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${score}%`, background: scoreColor, borderRadius: 2, transition: 'width 0.5s' }} />
        </div>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>Dx</span>
      </div>
    );
  }

  // Full mode: modules + alerts (for Analysis/Formulation pages)
  return (
    <div className="glass-panel animate-fade-in" style={{
      padding: '1rem 1.25rem', marginBottom: '1.5rem',
      borderLeft: `4px solid ${scoreColor}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: scoreColor }}>{score}%</span>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Readiness Diagnóstico</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{completed}/{total} módulos completados</p>
          </div>
        </div>
        <div style={{ width: 120, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${score}%`, background: scoreColor, borderRadius: 3, transition: 'width 0.5s' }} />
        </div>
      </div>

      {/* Module pills */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: alerts.length > 0 ? '0.75rem' : 0 }}>
        {Object.entries(modules).map(([key, mod]) => (
          <div key={key} style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.75rem',
            background: mod.ready ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.08)',
            color: mod.ready ? 'var(--success-color)' : 'var(--text-secondary)',
            border: `1px solid ${mod.ready ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.06)'}`,
            fontWeight: mod.ready ? 600 : 400,
          }}>
            <span style={{ fontSize: '0.8rem' }}>{MODULE_ICONS[key]}</span>
            {mod.label}
            <span style={{ fontSize: '0.7rem' }}>{mod.ready ? '✓' : `${mod.count}/${mod.target}`}</span>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {alerts.map((alert, i) => {
        const style = ALERT_STYLES[alert.level] || ALERT_STYLES.info;
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.4rem 0.6rem', borderRadius: 6, fontSize: '0.8rem',
            background: style.bg, marginTop: i === 0 ? 0 : '0.3rem',
            color: 'var(--text-primary)',
          }}>
            <span>{style.icon}</span>
            {alert.message}
          </div>
        );
      })}
    </div>
  );
}
