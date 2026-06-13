'use client';

/**
 * EmptyState — Consistent empty state display
 * Phase 1: Base UI Component Library
 *
 * @param {string} icon - Emoji icon
 * @param {string} title - Heading text
 * @param {string} description - Body text
 * @param {string} actionLabel - Optional button label
 * @param {function} onAction - Optional button click handler
 */
export default function EmptyState({ icon = '📭', title, description, actionLabel, onAction }) {
  return (
    <div className="glass-panel" style={{
      padding: '3rem 2rem', textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
    }}>
      <div style={{ fontSize: '2.5rem' }}>{icon}</div>
      {title && <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>{title}</h3>}
      {description && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 400, lineHeight: 1.5, margin: 0 }}>
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button className="btn btn-primary" onClick={onAction} style={{ marginTop: '0.5rem' }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
