/**
 * ToastContext — Logic Tests
 * ===========================
 * Tests the toast message handling, type resolution, icon mapping,
 * and timing logic without rendering JSX components.
 * Pattern: pure logic testing (no component render).
 */
import { describe, it, expect, vi } from 'vitest';

// ── Mirror ICONS mapping from ToastContext.js ─────────────────────────────────
const ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

// ── Mirror toast type shortcut creation logic ─────────────────────────────────
function createToastShortcuts(addToast) {
  return {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error', 6000),
    warning: (msg) => addToast(msg, 'warning', 5000),
    info: (msg) => addToast(msg, 'info'),
  };
}

// ── Mirror toast state management logic ─────────────────────────────────────
function addToastToState(prev, id, message, type) {
  return [...prev, { id, message, type, exiting: false }];
}

function markExiting(prev, id) {
  return prev.map(t => t.id === id ? { ...t, exiting: true } : t);
}

function removeFromState(prev, id) {
  return prev.filter(t => t.id !== id);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ICONS mapping', () => {
  it('has icon for all 4 toast types', () => {
    expect(ICONS.success).toBe('✓');
    expect(ICONS.error).toBe('✕');
    expect(ICONS.warning).toBe('⚠');
    expect(ICONS.info).toBe('ℹ');
  });

  it('has exactly 4 types', () => {
    expect(Object.keys(ICONS)).toHaveLength(4);
  });
});

describe('createToastShortcuts', () => {
  it('success shortcut calls addToast with success type', () => {
    const addToast = vi.fn();
    const toast = createToastShortcuts(addToast);
    toast.success('Plan guardado');
    expect(addToast).toHaveBeenCalledWith('Plan guardado', 'success');
  });

  it('error shortcut calls addToast with 6000ms duration', () => {
    const addToast = vi.fn();
    const toast = createToastShortcuts(addToast);
    toast.error('Error crítico');
    expect(addToast).toHaveBeenCalledWith('Error crítico', 'error', 6000);
  });

  it('warning shortcut calls addToast with 5000ms duration', () => {
    const addToast = vi.fn();
    const toast = createToastShortcuts(addToast);
    toast.warning('Advertencia');
    expect(addToast).toHaveBeenCalledWith('Advertencia', 'warning', 5000);
  });

  it('info shortcut calls addToast with info type', () => {
    const addToast = vi.fn();
    const toast = createToastShortcuts(addToast);
    toast.info('Información');
    expect(addToast).toHaveBeenCalledWith('Información', 'info');
  });

  it('produces all 4 shortcut methods', () => {
    const toast = createToastShortcuts(vi.fn());
    expect(typeof toast.success).toBe('function');
    expect(typeof toast.error).toBe('function');
    expect(typeof toast.warning).toBe('function');
    expect(typeof toast.info).toBe('function');
  });
});

describe('toast state management', () => {
  it('addToastToState adds toast with correct shape', () => {
    const result = addToastToState([], 1, 'Hola', 'info');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ id: 1, message: 'Hola', type: 'info', exiting: false });
  });

  it('addToastToState preserves existing toasts', () => {
    const existing = [{ id: 1, message: 'A', type: 'success', exiting: false }];
    const result = addToastToState(existing, 2, 'B', 'error');
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
  });

  it('markExiting sets exiting=true for matching id', () => {
    const toasts = [
      { id: 1, message: 'A', exiting: false },
      { id: 2, message: 'B', exiting: false },
    ];
    const result = markExiting(toasts, 1);
    expect(result[0].exiting).toBe(true);
    expect(result[1].exiting).toBe(false);
  });

  it('markExiting does not affect other toasts', () => {
    const toasts = [
      { id: 1, exiting: false },
      { id: 2, exiting: false },
      { id: 3, exiting: false },
    ];
    const result = markExiting(toasts, 2);
    expect(result[0].exiting).toBe(false);
    expect(result[1].exiting).toBe(true);
    expect(result[2].exiting).toBe(false);
  });

  it('removeFromState removes toast with matching id', () => {
    const toasts = [
      { id: 1, message: 'A' },
      { id: 2, message: 'B' },
    ];
    const result = removeFromState(toasts, 1);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('removeFromState is a no-op for non-existent id', () => {
    const toasts = [{ id: 1, message: 'A' }];
    const result = removeFromState(toasts, 99);
    expect(result).toHaveLength(1);
  });

  it('removeFromState on empty array returns empty array', () => {
    expect(removeFromState([], 1)).toHaveLength(0);
  });
});
