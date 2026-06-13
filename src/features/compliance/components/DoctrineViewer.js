'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

/**
 * DoctrineViewer — 7 Doctrinas Engine
 * =======================================
 * Displays the doctrine rules and anti-patterns.
 */
export default function DoctrineViewer() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    api.getDoctrineRules()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (i) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }));

  if (loading) return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>Cargando doctrinas...</div>;
  if (!data) return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>Sin datos doctrinales</div>;

  const doctrines = Array.isArray(data) ? data : (data.doctrines || data.rules || []);

  const statusIcons = { pass: '✅', warning: '⚠️', fail: '❌', unknown: '❓' };
  const statusColors = { pass: '#10b981', warning: '#f59e0b', fail: '#ef4444', unknown: '#94a3b8' };

  const passing = doctrines.filter(d => (d.status || '').toLowerCase() === 'pass').length;
  const total = doctrines.length;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>📖 Doctrine Engine</h3>
        <span style={{
          padding: '3px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600,
          background: passing === total ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
          color: passing === total ? '#10b981' : '#f59e0b',
        }}>
          {passing}/{total} doctrinas cumplidas
        </span>
      </div>

      {doctrines.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No hay doctrinas configuradas.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {doctrines.map((doc, i) => {
            const isOpen = !!expanded[i];
            const status = (doc.status || 'unknown').toLowerCase();
            const sColor = statusColors[status] || statusColors.unknown;
            const sIcon = statusIcons[status] || statusIcons.unknown;
            const rules = doc.rules || doc.criteria || [];
            const antiPatterns = doc.anti_patterns || doc.antipatterns || [];

            return (
              <div key={doc.name || i} style={{
                borderRadius: 8, overflow: 'hidden',
                border: `1px solid ${isOpen ? sColor + '30' : 'rgba(148,163,184,0.08)'}`,
                transition: 'border-color 0.2s',
              }}>
                <div
                  onClick={() => toggle(i)}
                  style={{
                    padding: '0.75rem 1rem', cursor: 'pointer',
                    background: isOpen ? `${sColor}08` : 'rgba(15,23,42,0.4)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{sIcon}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {doc.name || doc.title || `Doctrina ${i + 1}`}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                </div>

                {isOpen && (
                  <div style={{ padding: '0.75rem 1rem', background: 'rgba(15,23,42,0.2)' }}>
                    {doc.description && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                        {doc.description}
                      </p>
                    )}

                    {rules.length > 0 && (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 600, marginBottom: '0.3rem' }}>✅ Reglas</div>
                        {rules.map((rule, ri) => (
                          <div key={ri} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '0.2rem 0', paddingLeft: '0.75rem', borderLeft: '2px solid rgba(16,185,129,0.2)' }}>
                            {typeof rule === 'string' ? rule : (rule.description || rule.name || JSON.stringify(rule))}
                          </div>
                        ))}
                      </div>
                    )}

                    {antiPatterns.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.68rem', color: '#ef4444', fontWeight: 600, marginBottom: '0.3rem' }}>🚫 Anti-Patterns</div>
                        {antiPatterns.map((ap, ai) => (
                          <div key={ai} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '0.2rem 0', paddingLeft: '0.75rem', borderLeft: '2px solid rgba(239,68,68,0.2)' }}>
                            {typeof ap === 'string' ? ap : (ap.description || ap.name || JSON.stringify(ap))}
                          </div>
                        ))}
                      </div>
                    )}

                    {doc.evidence && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.68rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                        📎 {doc.evidence}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
