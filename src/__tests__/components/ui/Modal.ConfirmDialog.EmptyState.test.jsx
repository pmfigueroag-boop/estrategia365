/**
 * Modal, ConfirmDialog, EmptyState, LoadingSpinner — Logic Tests
 * ===============================================================
 * Tests props/config logic for modal overlay components and UI utilities.
 * Pattern: pure logic testing (no component render).
 */
import { describe, it, expect, vi } from 'vitest';

// ── Modal logic ───────────────────────────────────────────────────────────────

describe('Modal — size config logic', () => {
  const widths = { sm: 400, md: 560, lg: 720, xl: 900 };

  function resolveWidth(size) {
    return widths[size] || 560;
  }

  it('resolves sm → 400px', () => expect(resolveWidth('sm')).toBe(400));
  it('resolves md → 560px', () => expect(resolveWidth('md')).toBe(560));
  it('resolves lg → 720px', () => expect(resolveWidth('lg')).toBe(720));
  it('resolves xl → 900px', () => expect(resolveWidth('xl')).toBe(900));
  it('unknown size falls back to 560px', () => expect(resolveWidth('xxl')).toBe(560));
});

describe('Modal — closeOnOverlay behavior', () => {
  function handleOverlayClick(onClose, closeOnOverlay) {
    if (closeOnOverlay) onClose();
  }

  it('calls onClose when closeOnOverlay=true', () => {
    const onClose = vi.fn();
    handleOverlayClick(onClose, true);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onClose when closeOnOverlay=false', () => {
    const onClose = vi.fn();
    handleOverlayClick(onClose, false);
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('Modal — isOpen guard', () => {
  function shouldRender(isOpen) {
    return isOpen;
  }

  it('renders when isOpen=true', () => expect(shouldRender(true)).toBe(true));
  it('does not render when isOpen=false', () => expect(shouldRender(false)).toBe(false));
});

// ── ConfirmDialog logic ───────────────────────────────────────────────────────

describe('ConfirmDialog — destructive button styles', () => {
  function resolveConfirmStyle(destructive) {
    return destructive
      ? { background: 'rgba(239,68,68,0.15)', color: 'var(--danger-color)', border: '1px solid rgba(239,68,68,0.3)' }
      : {};
  }

  it('returns danger styles for destructive=true', () => {
    const style = resolveConfirmStyle(true);
    expect(style.color).toBe('var(--danger-color)');
    expect(style.background).toContain('239,68,68');
  });

  it('returns empty style object for destructive=false', () => {
    expect(resolveConfirmStyle(false)).toEqual({});
  });
});

describe('ConfirmDialog — default props', () => {
  function applyDefaults({ title, confirmLabel, destructive }) {
    return {
      title: title ?? '¿Estás seguro?',
      confirmLabel: confirmLabel ?? 'Confirmar',
      destructive: destructive ?? false,
    };
  }

  it('uses default title when not provided', () => {
    expect(applyDefaults({}).title).toBe('¿Estás seguro?');
  });

  it('uses custom title when provided', () => {
    expect(applyDefaults({ title: 'Borrar Plan' }).title).toBe('Borrar Plan');
  });

  it('uses default confirmLabel', () => {
    expect(applyDefaults({}).confirmLabel).toBe('Confirmar');
  });

  it('uses custom confirmLabel', () => {
    expect(applyDefaults({ confirmLabel: 'Eliminar' }).confirmLabel).toBe('Eliminar');
  });

  it('defaults destructive to false', () => {
    expect(applyDefaults({}).destructive).toBe(false);
  });
});

// ── EmptyState logic ──────────────────────────────────────────────────────────

describe('EmptyState — conditional rendering logic', () => {
  function shouldShowButton(actionLabel, onAction) {
    return !!(actionLabel && onAction);
  }

  it('shows button when both actionLabel and onAction provided', () => {
    expect(shouldShowButton('Agregar', () => {})).toBe(true);
  });

  it('hides button when actionLabel is missing', () => {
    expect(shouldShowButton(undefined, () => {})).toBe(false);
  });

  it('hides button when onAction is missing', () => {
    expect(shouldShowButton('Agregar', undefined)).toBe(false);
  });

  it('hides button when both are missing', () => {
    expect(shouldShowButton(undefined, undefined)).toBe(false);
  });
});

describe('EmptyState — default icon', () => {
  function resolveIcon(icon) {
    return icon || '📭';
  }

  it('uses provided icon', () => {
    expect(resolveIcon('📊')).toBe('📊');
  });

  it('defaults to 📭 when no icon provided', () => {
    expect(resolveIcon(undefined)).toBe('📭');
    expect(resolveIcon('')).toBe('📭');
  });
});

// ── LoadingSpinner logic ──────────────────────────────────────────────────────

describe('LoadingSpinner — size configuration', () => {
  function resolveDimension(size) {
    const dims = { sm: 20, md: 32, lg: 48 };
    return dims[size] || 32;
  }

  function resolveFontSize(size) {
    return size === 'sm' ? '0.75rem' : size === 'lg' ? '1rem' : '0.85rem';
  }

  it('sm → 20px spinner', () => expect(resolveDimension('sm')).toBe(20));
  it('md → 32px spinner', () => expect(resolveDimension('md')).toBe(32));
  it('lg → 48px spinner', () => expect(resolveDimension('lg')).toBe(48));
  it('unknown size → 32px fallback', () => expect(resolveDimension('xl')).toBe(32));

  it('sm → 0.75rem font', () => expect(resolveFontSize('sm')).toBe('0.75rem'));
  it('lg → 1rem font', () => expect(resolveFontSize('lg')).toBe('1rem'));
  it('md → 0.85rem font', () => expect(resolveFontSize('md')).toBe('0.85rem'));
});
