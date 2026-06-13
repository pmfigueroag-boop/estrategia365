'use client';

/**
 * LoadingSpinner — Consistent loading indicator
 * Phase 1: Base UI Component Library
 *
 * @param {string} message - Loading message
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
export default function LoadingSpinner({ message = 'Cargando...', size = 'md' }) {
  const dims = { sm: 20, md: 32, lg: 48 };
  const d = dims[size] || 32;
  const fontSize = size === 'sm' ? '0.75rem' : size === 'lg' ? '1rem' : '0.85rem';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: '0.75rem', padding: '2rem',
    }}>
      <div style={{
        width: d, height: d, borderRadius: '50%',
        border: '3px solid rgba(255,255,255,0.08)',
        borderTopColor: 'var(--accent-primary)',
        animation: 'spin 0.8s linear infinite',
      }} />
      {message && (
        <span style={{ fontSize, color: 'var(--text-secondary)' }}>{message}</span>
      )}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
