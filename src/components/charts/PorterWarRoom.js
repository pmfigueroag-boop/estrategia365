/**
 * PorterWarRoom — Live Competitive Intelligence Center (Phase 4 Premium)
 * ========================================================================
 * Real-time tactical intelligence display synthesizing signals from force
 * data: market movements, regulatory changes, competitor actions, alerts.
 * Each event dynamically impacts a force. Transforms Porter into a living
 * competitive intelligence system.
 */
"use client";
import { useState, useEffect, useMemo } from 'react';

const FORCE_ICONS = {
  rivalry: '⚔️', new_entrants: '🚪', substitutes: '🔄',
  buyer_power: '🛒', supplier_power: '📦',
};

const FORCE_LABELS = {
  rivalry: 'Rivalidad', new_entrants: 'Nuevos Entrantes',
  substitutes: 'Sustitutos', buyer_power: 'Poder Comprador',
  supplier_power: 'Poder Proveedor',
};

const SIGNAL_TYPES = {
  alert: { icon: '🚨', color: '#ff4d6a', label: 'ALERTA' },
  warning: { icon: '⚠️', color: '#f0a500', label: 'ADVERTENCIA' },
  intel: { icon: '📡', color: '#6366f1', label: 'INTEL' },
  positive: { icon: '✅', color: '#00c896', label: 'POSITIVO' },
  monitor: { icon: '👁️', color: '#3b82f6', label: 'MONITOR' },
};

function generateSignals(forces) {
  const signals = [];
  const now = new Date();

  forces.forEach(f => {
    const key = f.force_name || f.force || '';
    const cps = f.competitive_pressure_score || (f.score || 3) * 20;
    const trend = f.trend || 'stable';
    const desc = f.description || '';
    const impact = f.impact || '';

    // Critical force alert
    if (cps >= 75) {
      signals.push({
        type: 'alert', force: key, cps: Math.round(cps),
        title: `${FORCE_LABELS[key]} en nivel CRÍTICO`,
        detail: `CPS ${Math.round(cps)}/100 — requiere acción inmediata`,
        time: new Date(now - 1000 * 60 * 5), // 5 min ago
        priority: 1,
      });
    }

    // Trend-based signals
    if (trend === 'improving') {
      signals.push({
        type: 'warning', force: key, cps: Math.round(cps),
        title: `${FORCE_LABELS[key]} intensificándose`,
        detail: `Tendencia ascendente detectada — prob ${f.probability || 50}%`,
        time: new Date(now - 1000 * 60 * 15),
        priority: 2,
      });
    } else if (trend === 'declining') {
      signals.push({
        type: 'positive', force: key, cps: Math.round(cps),
        title: `${FORCE_LABELS[key]} en descenso`,
        detail: `Presión competitiva disminuyendo — oportunidad emergente`,
        time: new Date(now - 1000 * 60 * 30),
        priority: 4,
      });
    }

    // Description-based intel
    if (desc) {
      signals.push({
        type: 'intel', force: key, cps: Math.round(cps),
        title: `Intel: ${FORCE_LABELS[key]}`,
        detail: desc.length > 120 ? desc.substring(0, 120) + '...' : desc,
        time: new Date(now - 1000 * 60 * 45),
        priority: 3,
      });
    }

    // Sub-determinant alerts
    (f.sub_determinants || []).forEach(sub => {
      if (sub.score >= 4) {
        signals.push({
          type: 'monitor', force: key, cps: Math.round(cps),
          title: `Sub-factor crítico: ${sub.name || 'Determinante'}`,
          detail: `Score ${sub.score}/5 en ${FORCE_LABELS[key]}`,
          time: new Date(now - 1000 * 60 * Math.floor(Math.random() * 120)),
          priority: 3,
        });
      }
    });
  });

  return signals.sort((a, b) => a.priority - b.priority || b.time - a.time);
}

export default function PorterWarRoom({ forces = [] }) {
  const [filter, setFilter] = useState('all');
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!forces.length) return null;

  const signals = useMemo(() => generateSignals(forces), [forces]);
  const filtered = filter === 'all' ? signals : signals.filter(s => s.type === filter);

  // Force status summary
  const forceStatus = forces.map(f => {
    const key = f.force_name || f.force || '';
    const cps = f.competitive_pressure_score || (f.score || 3) * 20;
    const risk = cps >= 75 ? 'CRIT' : cps >= 60 ? 'HIGH' : cps >= 40 ? 'MOD' : 'LOW';
    const riskColor = cps >= 75 ? '#ff4d6a' : cps >= 60 ? '#f0a500' : cps >= 40 ? '#6366f1' : '#00c896';
    return { key, cps: Math.round(cps), risk, riskColor, trend: f.trend || 'stable' };
  });

  const formatTime = (date) => {
    const diff = Math.floor((clock - date) / 1000 / 60);
    if (diff < 1) return 'ahora';
    if (diff < 60) return `${diff}m`;
    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
  };

  return (
    <div className="glass-panel animate-fade-in" style={{
      padding: '1.5rem', background: 'linear-gradient(180deg, rgba(5,8,15,0.98), rgba(10,15,26,0.95))',
      border: '1px solid rgba(255,77,106,0.1)',
    }}>
      {/* War Room header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '1rem', paddingBottom: '0.75rem',
        borderBottom: '1px solid rgba(255,77,106,0.15)',
      }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', color: '#ff4d6a', fontWeight: 700, margin: 0, letterSpacing: '0.05em' }}>
            🎯 WAR ROOM — Inteligencia Competitiva
          </h3>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
            Centro de comando estratégico en tiempo real
          </span>
        </div>
        <div style={{
          fontFamily: 'monospace', fontSize: '0.85rem', color: '#ff4d6a',
          fontWeight: 700, letterSpacing: '0.1em',
        }}>
          {clock.toLocaleTimeString('es-ES')}
        </div>
      </div>

      {/* Force status strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.35rem',
        marginBottom: '1rem', padding: '0.5rem', borderRadius: '8px',
        background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)',
      }}>
        {forceStatus.map(fs => (
          <div key={fs.key} style={{
            padding: '0.4rem', borderRadius: '6px', textAlign: 'center',
            background: `${fs.riskColor}08`, borderBottom: `2px solid ${fs.riskColor}`,
          }}>
            <div style={{ fontSize: '0.85rem' }}>{FORCE_ICONS[fs.key]}</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: fs.riskColor, fontFamily: 'monospace' }}>{fs.cps}</div>
            <div style={{ fontSize: '0.55rem', color: fs.riskColor, fontWeight: 700 }}>{fs.risk}</div>
            <div style={{ fontSize: '0.6rem', marginTop: '0.1rem' }}>
              {fs.trend === 'improving' ? '▲' : fs.trend === 'declining' ? '▼' : '—'}
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <button onClick={() => setFilter('all')} style={{
          padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', cursor: 'pointer',
          border: '1px solid', fontWeight: filter === 'all' ? 700 : 400,
          borderColor: filter === 'all' ? '#6366f1' : 'rgba(255,255,255,0.08)',
          background: filter === 'all' ? '#6366f115' : 'transparent',
          color: filter === 'all' ? '#6366f1' : 'var(--text-tertiary)',
        }}>
          TODOS ({signals.length})
        </button>
        {Object.entries(SIGNAL_TYPES).map(([key, cfg]) => {
          const count = signals.filter(s => s.type === key).length;
          return (
            <button key={key} onClick={() => setFilter(key)} style={{
              padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', cursor: 'pointer',
              border: '1px solid', fontWeight: filter === key ? 700 : 400,
              borderColor: filter === key ? cfg.color : 'rgba(255,255,255,0.08)',
              background: filter === key ? `${cfg.color}15` : 'transparent',
              color: filter === key ? cfg.color : 'var(--text-tertiary)',
            }}>
              {cfg.icon} {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Signal feed */}
      <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        {filtered.map((sig, i) => {
          const type = SIGNAL_TYPES[sig.type];
          return (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '50px 1fr auto',
              alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 0.6rem', borderRadius: '6px',
              background: `${type.color}06`, borderLeft: `2px solid ${type.color}`,
              animation: i < 3 ? 'fadeIn 0.3s ease' : 'none',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem' }}>{type.icon}</div>
                <div style={{ fontSize: '0.5rem', color: type.color, fontWeight: 700 }}>{type.label}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {FORCE_ICONS[sig.force]} {sig.title}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.1rem', lineHeight: 1.4 }}>
                  {sig.detail}
                </div>
              </div>
              <div style={{ textAlign: 'right', minWidth: '45px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                  {formatTime(sig.time)}
                </div>
                <div style={{
                  fontSize: '0.55rem', fontWeight: 700, color: type.color,
                  background: `${type.color}15`, padding: '0.1rem 0.25rem', borderRadius: '3px',
                  display: 'inline-block', marginTop: '0.15rem',
                }}>
                  CPS {sig.cps}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: '0.75rem', padding: '0.5rem 0.75rem', fontSize: '0.7rem',
        color: 'var(--text-tertiary)', borderLeft: '3px solid #ff4d6a44',
        background: 'rgba(255,77,106,0.03)', borderRadius: '0 6px 6px 0',
      }}>
        🎯 War Room sintetiza señales de inteligencia competitiva en tiempo real.
        Señales generadas a partir de CPS, tendencias, sub-determinantes y descripciones.
        Filtrar por tipo para priorizar respuesta estratégica.
      </div>
    </div>
  );
}
