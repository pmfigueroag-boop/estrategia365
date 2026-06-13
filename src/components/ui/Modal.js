'use client';
import { useEffect, useRef } from 'react';

/**
 * Modal — Dialog component with overlay
 * Phase 1: Base UI Component Library
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Close handler
 * @param {string} title - Modal title
 * @param {React.ReactNode} children - Modal content
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl'
 * @param {boolean} closeOnOverlay - Close when clicking overlay (default: true)
 */
export default function Modal({ isOpen, onClose, title, children, size = 'md', closeOnOverlay = true }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widths = { sm: 400, md: 560, lg: 720, xl: 900 };
  const maxW = widths[size] || 560;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(10, 26, 47, 0.7)', backdropFilter: 'blur(12px)',
        animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onClick={() => { if (closeOnOverlay) onClose(); }}
    >
      <div
        ref={ref}
        onClick={(e) => e.stopPropagation()}
        className="glass-panel"
        style={{
          width: '90vw', maxWidth: maxW, maxHeight: '85vh',
          overflow: 'auto', padding: '1.75rem',
          animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid var(--surface-border)',
          boxShadow: 'var(--shadow-level-3)',
          borderRadius: '16px',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '1.5rem', paddingBottom: '0.75rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'transparent', border: 'none',
              color: 'var(--text-secondary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            ✕
          </button>
        </div>
        {/* Content */}
        {children}
      </div>
    </div>
  );
}
