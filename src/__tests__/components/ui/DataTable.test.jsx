/**
 * DataTable — Sort Logic Tests
 * ==============================
 * Tests sorting algorithm, column resolution, and display logic.
 * Pattern: pure logic testing (no component render).
 */
import { describe, it, expect } from 'vitest';

// ── Mirror sorting logic from DataTable ───────────────────────────────────────

function applySortToData(data, sortKey, sortDir, columns) {
  if (!sortKey) return data;
  const col = columns.find(c => c.key === sortKey);
  if (!col?.sortable) return data;
  return [...data].sort((a, b) => {
    const va = a[sortKey], vb = b[sortKey];
    const cmp = typeof va === 'number'
      ? va - vb
      : String(va || '').localeCompare(String(vb || ''));
    return sortDir === 'asc' ? cmp : -cmp;
  });
}

function resolveDisplayValue(row, col) {
  if (col.render) return col.render(row[col.key], row);
  return row[col.key] ?? '—';
}

function toggleSortDir(currentKey, clickedKey, currentDir) {
  if (currentKey === clickedKey) {
    return currentDir === 'asc' ? 'desc' : 'asc';
  }
  return 'asc';
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const COLUMNS = [
  { key: 'name', label: 'Nombre', sortable: true },
  { key: 'score', label: 'Score', sortable: true },
  { key: 'status', label: 'Estado' }, // NOT sortable
];

const DATA = [
  { id: 1, name: 'Objetivo Alpha', score: 8.5, status: 'active' },
  { id: 2, name: 'Objetivo Gamma', score: 9.2, status: 'completed' },
  { id: 3, name: 'Objetivo Beta', score: 5.0, status: 'draft' },
];

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('applySortToData — sorting algorithm', () => {
  it('sorts strings ascending correctly', () => {
    const sorted = applySortToData(DATA, 'name', 'asc', COLUMNS);
    expect(sorted[0].name).toBe('Objetivo Alpha');
    expect(sorted[1].name).toBe('Objetivo Beta');
    expect(sorted[2].name).toBe('Objetivo Gamma');
  });

  it('sorts strings descending correctly', () => {
    const sorted = applySortToData(DATA, 'name', 'desc', COLUMNS);
    expect(sorted[0].name).toBe('Objetivo Gamma');
    expect(sorted[2].name).toBe('Objetivo Alpha');
  });

  it('sorts numbers ascending correctly', () => {
    const sorted = applySortToData(DATA, 'score', 'asc', COLUMNS);
    expect(sorted[0].score).toBe(5.0);
    expect(sorted[2].score).toBe(9.2);
  });

  it('sorts numbers descending correctly', () => {
    const sorted = applySortToData(DATA, 'score', 'desc', COLUMNS);
    expect(sorted[0].score).toBe(9.2);
    expect(sorted[2].score).toBe(5.0);
  });

  it('returns original order when sortKey is null', () => {
    const result = applySortToData(DATA, null, 'asc', COLUMNS);
    expect(result).toEqual(DATA);
  });

  it('returns original order when column is not sortable', () => {
    const result = applySortToData(DATA, 'status', 'asc', COLUMNS);
    expect(result).toEqual(DATA);
  });

  it('does not mutate original data', () => {
    const original = [...DATA];
    applySortToData(DATA, 'name', 'asc', COLUMNS);
    expect(DATA).toEqual(original);
  });

  it('handles null values by treating them as empty string', () => {
    const dataWithNull = [
      { id: 1, name: null, score: 5 },
      { id: 2, name: 'Alpha', score: 9 },
    ];
    const sorted = applySortToData(dataWithNull, 'name', 'asc', COLUMNS);
    // null → '' sorts before 'Alpha'
    expect(sorted[0].name).toBeNull();
  });
});

describe('resolveDisplayValue — cell rendering', () => {
  const col = { key: 'name', label: 'Nombre', sortable: true };

  it('returns cell value for basic column', () => {
    expect(resolveDisplayValue({ name: 'Alpha' }, col)).toBe('Alpha');
  });

  it('returns "—" for null values', () => {
    expect(resolveDisplayValue({ name: null }, col)).toBe('—');
  });

  it('returns "—" for undefined values', () => {
    expect(resolveDisplayValue({}, col)).toBe('—');
  });

  it('uses custom render function when provided', () => {
    const renderCol = { key: 'score', render: (val) => `${val}★` };
    expect(resolveDisplayValue({ score: 8.5 }, renderCol)).toBe('8.5★');
  });

  it('passes row as second arg to render', () => {
    const renderCol = { key: 'score', render: (val, row) => `${row.name}: ${val}` };
    expect(resolveDisplayValue({ name: 'Alpha', score: 9 }, renderCol)).toBe('Alpha: 9');
  });
});

describe('toggleSortDir — direction toggling', () => {
  it('toggles asc → desc on same column', () => {
    expect(toggleSortDir('name', 'name', 'asc')).toBe('desc');
  });

  it('toggles desc → asc on same column', () => {
    expect(toggleSortDir('name', 'name', 'desc')).toBe('asc');
  });

  it('resets to asc when switching to different column', () => {
    expect(toggleSortDir('name', 'score', 'desc')).toBe('asc');
  });

  it('returns asc for new column (null current key)', () => {
    expect(toggleSortDir(null, 'name', 'asc')).toBe('asc');
  });
});
