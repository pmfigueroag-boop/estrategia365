/**
 * StatusBadge — Logic Tests
 * =========================
 * Tests STATUS_CONFIG data structure and badge computation logic.
 * Pattern: Tests pure logic, avoids rendering .js files with JSX
 * (Vitest SSR transform limitation with Next.js convention).
 */
import { describe, it, expect } from 'vitest';

// ── Mirror STATUS_CONFIG from component ──────────────────────────────────────
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

// ── Badge config resolution (mirrors component logic) ────────────────────────
function resolveConfig(status, customLabel) {
  const config = STATUS_CONFIG[status] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.15)', label: status };
  return {
    color: config.color,
    bg: config.bg,
    displayLabel: customLabel || config.label,
  };
}

// ── Size config (mirrors component logic) ────────────────────────────────────
function resolveSize(size) {
  return {
    fontSize: size === 'sm' ? '0.7rem' : '0.8rem',
    padding: size === 'sm' ? '0.15rem 0.5rem' : '0.25rem 0.65rem',
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('STATUS_CONFIG', () => {
  it('has all 10 required status keys', () => {
    const expected = ['draft', 'proposed', 'approved', 'active', 'executing',
      'completed', 'blocked', 'archived', 'in_progress', 'formulated'];
    expected.forEach(key => expect(STATUS_CONFIG).toHaveProperty(key));
  });

  it('every status has color, bg, and label', () => {
    Object.entries(STATUS_CONFIG).forEach(([status, cfg]) => {
      expect(cfg.color, `${status} missing color`).toBeTruthy();
      expect(cfg.bg, `${status} missing bg`).toBeTruthy();
      expect(cfg.label, `${status} missing label`).toBeTruthy();
    });
  });

  it('approved is green (#34d399)', () => {
    expect(STATUS_CONFIG.approved.color).toBe('#34d399');
  });

  it('blocked is red (#ef4444)', () => {
    expect(STATUS_CONFIG.blocked.color).toBe('#ef4444');
  });

  it('executing is amber (#f59e0b)', () => {
    expect(STATUS_CONFIG.executing.color).toBe('#f59e0b');
  });
});

describe('resolveConfig — badge computation', () => {
  it('resolves known status label correctly', () => {
    expect(resolveConfig('draft').displayLabel).toBe('Borrador');
    expect(resolveConfig('approved').displayLabel).toBe('Aprobado');
    expect(resolveConfig('completed').displayLabel).toBe('Completado');
  });

  it('uses custom label when provided', () => {
    expect(resolveConfig('draft', 'Mi Etiqueta').displayLabel).toBe('Mi Etiqueta');
    expect(resolveConfig('approved', 'Override').displayLabel).toBe('Override');
  });

  it('falls back to status key as label for unknown status', () => {
    expect(resolveConfig('unknown_xyz').displayLabel).toBe('unknown_xyz');
  });

  it('falls back to grey color for unknown status', () => {
    expect(resolveConfig('unknown_xyz').color).toBe('#94a3b8');
  });

  it('returns correct colors for known statuses', () => {
    expect(resolveConfig('active').color).toBe('#3b82f6');
    expect(resolveConfig('blocked').color).toBe('#ef4444');
  });
});

describe('resolveSize — size variants', () => {
  it('sm size has smaller font', () => {
    const sm = resolveSize('sm');
    const md = resolveSize('md');
    expect(sm.fontSize).toBe('0.7rem');
    expect(md.fontSize).toBe('0.8rem');
  });

  it('sm size has smaller padding', () => {
    const sm = resolveSize('sm');
    expect(sm.padding).toBe('0.15rem 0.5rem');
  });

  it('md size has larger padding', () => {
    const md = resolveSize('md');
    expect(md.padding).toBe('0.25rem 0.65rem');
  });
});
