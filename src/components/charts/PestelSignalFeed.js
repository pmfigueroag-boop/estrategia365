/**
 * PestelSignalFeed — Intelligence Signal Stream (Phase 5: Intelligence Platform)
 * =================================================================================
 * Real-time intelligence feed styled like a financial terminal / OSINT dashboard.
 * Each signal is a compact card with factor badge, impact type, trend, and priority.
 */
"use client";
import { useState, useMemo } from 'react';

const FACTOR_CONFIG = {
  P:  { label: 'POL', color: '#ff453a', fullLabel: 'Politico' },
  E:  { label: 'ECO', color: '#ff9f0a', fullLabel: 'Economico' },
  S:  { label: 'SOC', color: '#30d158', fullLabel: 'Social' },
  T:  { label: 'TEC', color: '#5e5ce6', fullLabel: 'Tecnologico' },
  E2: { label: 'ENV', color: '#bf5af2', fullLabel: 'Ecologico' },
  L:  { label: 'LEG', color: '#ff6b35', fullLabel: 'Legal' },
};

const TREND_DISPLAY = {
  declining:  { icon: '\u25BC', color: '#ff453a', label: 'Deterioro', bg: 'rgba(255,69,58,0.12)' },
  stable:     { icon: '\u2014', color: '#8e8e93', label: 'Estable',   bg: 'rgba(142,142,147,0.1)' },
  improving:  { icon: '\u25B2', color: '#30d158', label: 'Mejora',    bg: 'rgba(48,209,88,0.12)' },
};

const TIMEFRAME_BADGES = {
  short:  { label: '0-12m', color: '#ff453a', bg: 'rgba(255,69,58,0.1)' },
  medium: { label: '1-3a',  color: '#ff9f0a', bg: 'rgba(255,159,10,0.1)' },
  long:   { label: '3-5a',  color: '#5e5ce6', bg: 'rgba(94,92,230,0.1)' },
};

export default function PestelSignalFeed({ signals = [], onSignalClick }) {
  const [filterFactor, setFilterFactor] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('priority');

  const filtered = useMemo(() => {
    let result = [...signals];
    if (filterFactor !== 'all') result = result.filter(s => (s.factor?.toUpperCase?.() || s.factor) === filterFactor);
    if (filterType !== 'all') result = result.filter(s => s.impact_type === filterType);
    
    result.sort((a, b) => {
      if (sortBy === 'priority') return (b.priority_score || 0) - (a.priority_score || 0);
      if (sortBy === 'probability') return (b.probability || 0) - (a.probability || 0);
      if (sortBy === 'severity') {
        const sev = { high: 3, medium: 2, low: 1 };
        return (sev[b.severity] || 0) - (sev[a.severity] || 0);
      }
      return 0;
    });
    return result;
  }, [signals, filterFactor, filterType, sortBy]);

  if (!signals.length) return null;

  const threatCount = signals.filter(s => s.impact_type === 'threat').length;
  const oppCount = signals.filter(s => s.impact_type === 'opportunity').length;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Signal Intelligence Feed
            <span style={{
              fontSize: '0.65rem', padding: '2px 8px', borderRadius: '10px',
              background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontWeight: 600
            }}>{signals.length} SIGNALS</span>
          </h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', margin: '0.2rem 0 0' }}>
            Clasificacion automatica de senales del entorno estrategico
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '8px', background: 'rgba(255,69,58,0.1)', color: '#ff453a', fontWeight: 600 }}>
            {threatCount} Amenazas
          </span>
          <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '8px', background: 'rgba(48,209,88,0.1)', color: '#30d158', fontWeight: 600 }}>
            {oppCount} Oportunidades
          </span>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filtro:</span>
        
        {/* Factor filter */}
        <select value={filterFactor} onChange={e => setFilterFactor(e.target.value)}
          style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', cursor: 'pointer' }}>
          <option value="all">Todos los factores</option>
          {Object.entries(FACTOR_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.fullLabel}</option>)}
        </select>

        {/* Impact type filter */}
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', cursor: 'pointer' }}>
          <option value="all">Oportunidad + Amenaza</option>
          <option value="threat">Solo Amenazas</option>
          <option value="opportunity">Solo Oportunidades</option>
        </select>

        {/* Sort */}
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', cursor: 'pointer' }}>
          <option value="priority">Prioridad</option>
          <option value="probability">Probabilidad</option>
          <option value="severity">Severidad</option>
        </select>
      </div>

      {/* Signal Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
        {filtered.map((s, i) => {
          const factor = s.factor?.toUpperCase?.() || s.factor || 'P';
          const fc = FACTOR_CONFIG[factor] || FACTOR_CONFIG.P;
          const trend = TREND_DISPLAY[s.trend] || TREND_DISPLAY.stable;
          const tf = TIMEFRAME_BADGES[s.timeframe] || TIMEFRAME_BADGES.medium;
          const isOpp = s.impact_type === 'opportunity';
          const score = s.priority_score || 0;

          return (
            <div key={s.id || i}
              onClick={() => onSignalClick?.(s)}
              style={{
                display: 'flex', gap: '0.75rem', padding: '0.75rem',
                borderRadius: '8px',
                background: `linear-gradient(90deg, ${isOpp ? 'rgba(48,209,88,0.04)' : 'rgba(255,69,58,0.04)'}, transparent)`,
                border: `1px solid ${isOpp ? 'rgba(48,209,88,0.1)' : 'rgba(255,69,58,0.1)'}`,
                borderLeft: `3px solid ${fc.color}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                animationDelay: `${i * 30}ms`,
              }}
              className="animate-fade-in"
              onMouseEnter={e => { e.currentTarget.style.background = `linear-gradient(90deg, ${isOpp ? 'rgba(48,209,88,0.08)' : 'rgba(255,69,58,0.08)'}, transparent)`; e.currentTarget.style.transform = 'translateX(2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = `linear-gradient(90deg, ${isOpp ? 'rgba(48,209,88,0.04)' : 'rgba(255,69,58,0.04)'}, transparent)`; e.currentTarget.style.transform = 'none'; }}
            >
              {/* Factor badge */}
              <div style={{
                width: '36px', height: '36px', borderRadius: '6px', flexShrink: 0,
                background: `${fc.color}15`, border: `1px solid ${fc.color}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.6rem', fontWeight: 800, color: fc.color, fontFamily: 'monospace',
              }}>{fc.label}</div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.title}
                  </span>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 800, fontFamily: 'monospace', marginLeft: '0.5rem', flexShrink: 0,
                    color: score >= 80 ? '#ff453a' : score >= 60 ? '#ff9f0a' : score >= 40 ? '#ffcc00' : '#30d158',
                  }}>{score}</span>
                </div>

                {/* Tags row */}
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Impact type */}
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px',
                    background: isOpp ? 'rgba(48,209,88,0.15)' : 'rgba(255,69,58,0.15)',
                    color: isOpp ? '#30d158' : '#ff453a',
                    textTransform: 'uppercase', letterSpacing: '0.03em',
                  }}>{isOpp ? 'OPP' : 'THR'}</span>

                  {/* Trend */}
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 600, padding: '1px 6px', borderRadius: '4px',
                    background: trend.bg, color: trend.color,
                  }}>{trend.icon} {trend.label}</span>

                  {/* Timeframe */}
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 600, padding: '1px 6px', borderRadius: '4px',
                    background: tf.bg, color: tf.color,
                  }}>{tf.label}</span>

                  {/* Probability */}
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                    P:{s.probability || 50}%
                  </span>

                  {/* Severity */}
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 600, padding: '1px 6px', borderRadius: '4px',
                    background: s.severity === 'high' ? 'rgba(255,69,58,0.1)' : s.severity === 'medium' ? 'rgba(255,159,10,0.1)' : 'rgba(48,209,88,0.1)',
                    color: s.severity === 'high' ? '#ff453a' : s.severity === 'medium' ? '#ff9f0a' : '#30d158',
                    textTransform: 'uppercase',
                  }}>{s.severity}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
