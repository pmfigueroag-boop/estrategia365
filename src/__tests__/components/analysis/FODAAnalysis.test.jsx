/**
 * FODAAnalysis — SWOT Quadrant Logic Tests
 */
import { describe, it, expect } from 'vitest';

const REQUIRED_QUADRANTS = new Set(['strength', 'weakness', 'opportunity', 'threat']);
const QUADRANT_LABELS = { strength: 'Fortalezas', weakness: 'Debilidades', opportunity: 'Oportunidades', threat: 'Amenazas' };

function getQuadrantCoverage(items) {
  const present = new Set(items.map(i => i.quadrant));
  const missing = [...REQUIRED_QUADRANTS].filter(q => !present.has(q));
  return { present: [...present], missing, complete: missing.length === 0 };
}

describe('FODAAnalysis — Quadrant Logic', () => {
  it('detects complete quadrant coverage', () => {
    const items = [
      { quadrant: 'strength' }, { quadrant: 'weakness' },
      { quadrant: 'opportunity' }, { quadrant: 'threat' },
    ];
    const coverage = getQuadrantCoverage(items);
    expect(coverage.complete).toBe(true);
    expect(coverage.missing).toHaveLength(0);
  });

  it('detects missing quadrants', () => {
    const items = [{ quadrant: 'strength' }, { quadrant: 'weakness' }];
    const coverage = getQuadrantCoverage(items);
    expect(coverage.complete).toBe(false);
    expect(coverage.missing).toContain('opportunity');
    expect(coverage.missing).toContain('threat');
  });

  it('maps Spanish labels', () => {
    expect(QUADRANT_LABELS.strength).toBe('Fortalezas');
    expect(QUADRANT_LABELS.threat).toBe('Amenazas');
  });

  it('handles empty items', () => {
    const coverage = getQuadrantCoverage([]);
    expect(coverage.missing).toHaveLength(4);
  });
});
