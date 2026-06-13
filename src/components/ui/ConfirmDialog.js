'use client';

/**
 * ConfirmDialog — Confirmation modal with destructive action styling
 * Phase 1: Base UI Component Library
 *
 * @param {boolean} isOpen - Whether dialog is visible
 * @param {function} onConfirm - Confirm handler
 * @param {function} onCancel - Cancel handler
 * @param {string} title - Dialog title
 * @param {string} message - Body message
 * @param {string} confirmLabel - Confirm button text (default: "Confirmar")
 * @param {boolean} destructive - If true, shows red confirm button
 */
import Modal from './Modal';

export default function ConfirmDialog({
  isOpen, onConfirm, onCancel, title = '¿Estás seguro?',
  message, confirmLabel = 'Confirmar', destructive = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      {message && (
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
          {message}
        </p>
      )}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <button
          className="btn"
          onClick={onCancel}
          style={{ fontSize: '0.85rem' }}
        >
          Cancelar
        </button>
        <button
          className={destructive ? 'btn' : 'btn btn-primary'}
          onClick={onConfirm}
          style={{
            fontSize: '0.85rem',
            ...(destructive ? {
              background: 'rgba(239,68,68,0.15)',
              color: 'var(--danger-color)',
              border: '1px solid rgba(239,68,68,0.3)',
            } : {}),
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
