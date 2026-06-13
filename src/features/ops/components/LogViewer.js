'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

/**
 * LogViewer — Structured Log Tail
 * ==================================
 * Filterable structured log viewer with auto-refresh.
 */
const LEVELS = ['all', 'ERROR', 'WARN', 'INFO', 'DEBUG'];
const LEVEL_COLORS = { ERROR: '#ef4444', WARN: '#f59e0b', INFO: '#6366f1', DEBUG: '#94a3b8' };

export default function LogViewer() {
  const [logs, setLogs] = useState([]);
  const [level, setLevel] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchLogs = useCallback(() => {
    setLoading(true);
    api.getStructuredLogs(level, 100)
      .then(d => setLogs(Array.isArray(d) ? d : (d.logs || d.entries || [])))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [level]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchLogs]);

  const filtered = search
    ? logs.filter(l => JSON.stringify(l).toLowerCase().includes(search.toLowerCase()))
    : logs;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>📋 Structured Logs</h3>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
            <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)}
              style={{ width: 14, height: 14, accentColor: '#6366f1' }} />
            Auto-refresh
          </label>
          <button onClick={fetchLogs} className="btn" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>🔄</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        {LEVELS.map(l => (
          <button key={l} onClick={() => setLevel(l)}
            style={{
              padding: '3px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 500,
              border: `1px solid ${level === l ? (LEVEL_COLORS[l] || '#6366f1') + '55' : 'rgba(148,163,184,0.15)'}`,
              background: level === l ? (LEVEL_COLORS[l] || '#6366f1') + '15' : 'transparent',
              color: level === l ? (LEVEL_COLORS[l] || '#6366f1') : 'var(--text-secondary)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
            {l}
          </button>
        ))}
        <input
          type="text" placeholder="Buscar..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem',
            border: '1px solid rgba(148,163,184,0.15)',
            background: 'rgba(15,23,42,0.4)', color: 'var(--text-primary)',
            outline: 'none', flex: 1, minWidth: 120,
          }}
        />
      </div>

      {/* Log entries */}
      <div style={{ maxHeight: 420, overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.72rem' }}>
        {loading && logs.length === 0 && <p style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-tertiary)' }}>Cargando logs...</p>}
        {filtered.length === 0 && !loading && <p style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-tertiary)' }}>No hay logs disponibles.</p>}
        {filtered.map((log, i) => {
          const logLevel = log.level || log.severity || 'INFO';
          const lColor = LEVEL_COLORS[logLevel] || '#94a3b8';
          return (
            <div key={i} style={{
              padding: '0.3rem 0.5rem', borderBottom: '1px solid rgba(148,163,184,0.06)',
              display: 'grid', gridTemplateColumns: '55px 45px 1fr', gap: '0.5rem',
              alignItems: 'start',
            }}>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.65rem' }}>
                {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '—'}
              </span>
              <span style={{ color: lColor, fontWeight: 600, fontSize: '0.68rem' }}>{logLevel}</span>
              <span style={{ color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                {log.message || log.msg || JSON.stringify(log)}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', color: 'var(--text-tertiary)', textAlign: 'right' }}>
        Mostrando {filtered.length} de {logs.length} entradas
        {autoRefresh && <span style={{ marginLeft: '0.5rem', color: '#10b981' }}>● live</span>}
      </div>
    </div>
  );
}
