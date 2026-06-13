'use client';
/**
 * SaveStatusIndicator — Visual autosave feedback
 * Shows saving/saved/error status with subtle animations.
 */

const STATUS_CONFIG = {
  idle: { text: '', icon: '', className: 'opacity-0' },
  saving: {
    text: 'Guardando...',
    icon: '⏳',
    className: 'text-yellow-400/70 animate-pulse',
  },
  saved: {
    text: 'Guardado',
    icon: '✓',
    className: 'text-emerald-400/70',
  },
  error: {
    text: 'Error al guardar',
    icon: '⚠',
    className: 'text-red-400/70',
  },
};

export default function SaveStatusIndicator({ status, lastSavedAt }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.idle;

  return (
    <div
      className={`save-status-indicator ${config.className}`}
      role="status"
      aria-live="polite"
    >
      {status !== 'idle' && (
        <>
          <span className="save-status-icon">{config.icon}</span>
          <span className="save-status-text">{config.text}</span>
        </>
      )}
      {status === 'idle' && lastSavedAt && (
        <span className="save-status-time text-gray-500/50 text-[10px]">
          Último guardado: {lastSavedAt.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
