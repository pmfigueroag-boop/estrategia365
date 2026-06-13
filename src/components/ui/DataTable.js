'use client';
import { useState } from 'react';

/**
 * DataTable — Reusable sortable data table
 * Phase 1: Base UI Component Library
 *
 * @param {Array} columns - [{ key, label, render?, sortable?, width? }]
 * @param {Array} data - Array of row objects
 * @param {function} onRowClick - Optional row click handler (receives row)
 * @param {string} emptyMessage - Message when no data
 */
export default function DataTable({ columns = [], data = [], onRowClick, emptyMessage = 'Sin datos' }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (!columns.find(c => c.key === key)?.sortable) return;
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const va = a[sortKey], vb = b[sortKey];
        const cmp = typeof va === 'number' ? va - vb : String(va || '').localeCompare(String(vb || ''));
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : data;

  if (!data.length) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                style={{
                  textAlign: 'left', padding: '0.6rem 0.75rem',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.75rem',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                  cursor: col.sortable ? 'pointer' : 'default',
                  width: col.width || 'auto', whiteSpace: 'nowrap',
                  userSelect: 'none',
                }}
              >
                {col.label}
                {col.sortable && sortKey === col.key && (
                  <span style={{ marginLeft: 4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={row.id || i}
              onClick={() => onRowClick?.(row)}
              style={{
                cursor: onRowClick ? 'pointer' : 'default',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (onRowClick) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              {columns.map(col => (
                <td key={col.key} style={{
                  padding: '0.6rem 0.75rem',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  color: 'var(--text-primary)',
                }}>
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
