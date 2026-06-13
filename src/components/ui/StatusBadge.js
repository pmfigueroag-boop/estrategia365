'use client';

/**
 * StatusBadge — Visual status indicator chip
 * Phase 1: Base UI Component Library
 *
 * @param {string} status - Status key (draft, proposed, approved, executing, completed, blocked, archived)
 * @param {string} size - 'sm' | 'md'
 */

const STATUS_CONFIG = {
  draft:     { color: '#94a3b8', bg: 'rgba(148,163,184,0.15)', label: 'Borrador' },
  proposed:  { color: '#a78bfa', bg: 'rgba(167,139,250,0.15)', label: 'Propuesto' },
  approved:  { color: '#34d399', bg: 'rgba(52,211,153,0.15)',  label: 'Aprobado' },
  active:    { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)',  label: 'Activo' },
  executing: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  label: 'Ejecutando' },
  completed: { color: '#10b981', bg: 'rgba(16,185,129,0.15)',  label: 'Completado' },
  blocked:   { color: '#ef4444', bg: 'rgba(239,68,68,0.15)',   label: 'Bloqueado' },
  archived:  { color: '#64748b', bg: 'rgba(100,116,139,0.15)', label: 'Archivado' },
  in_progress: { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', label: 'En Progreso' },
  formulated: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', label: 'Formulado' },
};

export default function StatusBadge({ status, size = 'sm', label: customLabel }) {
  const config = STATUS_CONFIG[status] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.15)', label: status };
  const displayLabel = customLabel || config.label;
  const fontSize = size === 'sm' ? '0.7rem' : '0.8rem';
  const padding = size === 'sm' ? '0.15rem 0.5rem' : '0.25rem 0.65rem';

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      fontSize, fontWeight: 600, padding, borderRadius: 10,
      color: config.color, background: config.bg,
      border: `1px solid ${config.color}30`,
      textTransform: 'capitalize', whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: config.color, flexShrink: 0,
      }} />
      {displayLabel}
    </span>
  );
}

export { STATUS_CONFIG };
