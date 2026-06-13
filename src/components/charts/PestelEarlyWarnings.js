/**
 * PestelEarlyWarnings — Early Warning System (Phase 5.2)
 * ========================================================
 * Alert cards styled like a security operations center dashboard.
 * Surfaces critical short-term signals requiring immediate action.
 */
"use client";

const URGENCY_CONFIG = {
  critical: { color: '#ff2d55', bg: 'rgba(255,45,85,0.08)', border: 'rgba(255,45,85,0.2)', icon: '\u26a0', label: 'CRITICO' },
  high:     { color: '#ff9500', bg: 'rgba(255,149,0,0.08)', border: 'rgba(255,149,0,0.2)', icon: '\u26a1', label: 'ALTO' },
  elevated: { color: '#ffcc00', bg: 'rgba(255,204,0,0.08)', border: 'rgba(255,204,0,0.2)', icon: '\u25b2', label: 'ELEVADO' },
};

const FACTOR_COLORS = { P: '#ff453a', E: '#ff9f0a', S: '#30d158', T: '#5e5ce6', E2: '#bf5af2', L: '#ff6b35' };

export default function PestelEarlyWarnings({ warnings }) {
  if (!warnings || !warnings.warnings || warnings.warnings.length === 0) {
    return (
      <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>Early Warning System</h3>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{'\u2705'}</div>
          <p style={{ fontSize: '0.85rem', color: '#30d158', fontWeight: 600 }}>Sin alertas activas</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            No se detectan senales criticas de corto plazo
          </p>
        </div>
      </div>
    );
  }

  const alertLevel = warnings.alert_level;
  const alertConfig = URGENCY_CONFIG[alertLevel] || URGENCY_CONFIG.elevated;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>Early Warning System</h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', margin: '0.2rem 0 0' }}>
            Senales criticas de corto plazo que requieren atencion
          </p>
        </div>
        <div style={{
          padding: '6px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800,
          background: alertConfig.bg, border: `1px solid ${alertConfig.border}`, color: alertConfig.color,
          display: 'flex', alignItems: 'center', gap: '6px',
          animation: alertLevel === 'critical' ? 'pulse 1.5s infinite' : 'none',
        }}>
          <span style={{ fontSize: '1rem' }}>{alertConfig.icon}</span>
          ALERT LEVEL: {alertConfig.label}
          <span style={{ fontWeight: 400 }}>({warnings.total_warnings})</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {warnings.warnings.map((w, i) => {
          const uc = URGENCY_CONFIG[w.urgency] || URGENCY_CONFIG.elevated;
          const fc = FACTOR_COLORS[w.factor] || '#888';
          const isOppWindow = w.alert_type === 'opportunity_window';

          return (
            <div key={w.signal_id || i} className="animate-fade-in" style={{
              display: 'flex', gap: '0.75rem', padding: '0.75rem',
              borderRadius: '8px',
              background: uc.bg,
              border: `1px solid ${uc.border}`,
              borderLeft: `3px solid ${uc.color}`,
              animationDelay: `${i * 60}ms`,
            }}>
              {/* Urgency indicator */}
              <div style={{
                width: '40px', height: '40px', borderRadius: '8px', flexShrink: 0,
                background: `${uc.color}15`, border: `1px solid ${uc.color}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column',
              }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 800, color: uc.color, fontFamily: 'monospace' }}>{w.priority_score}</span>
                <span style={{ fontSize: '0.55rem', color: uc.color, fontWeight: 600 }}>{uc.label}</span>
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{w.title}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 4px', lineHeight: 1.3 }}>
                  {w.strategic_impact?.slice(0, 120)}{w.strategic_impact?.length > 120 ? '...' : ''}
                </p>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: `${fc}15`, color: fc, border: `1px solid ${fc}33` }}>
                    {w.factor_label}
                  </span>
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px',
                    background: isOppWindow ? 'rgba(48,209,88,0.15)' : 'rgba(255,69,58,0.15)',
                    color: isOppWindow ? '#30d158' : '#ff453a',
                  }}>
                    {isOppWindow ? 'WINDOW CLOSING' : 'THREAT ALERT'}
                  </span>
                  <span style={{ fontSize: '0.6rem', fontWeight: 600, padding: '1px 6px', borderRadius: '4px', background: 'rgba(255,69,58,0.1)', color: '#ff453a' }}>
                    0-12m
                  </span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                    P:{w.probability}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
