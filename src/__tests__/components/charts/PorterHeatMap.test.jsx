/**
 * PorterHeatMap — Cross-Force Interaction Logic Tests
 */
import { describe, it, expect } from 'vitest';

const FORCE_ORDER = ['rivalry', 'new_entrants', 'substitutes', 'buyer_power', 'supplier_power'];

function buildHeatMap(forceScores) {
  const map = [];
  for (let i = 0; i < FORCE_ORDER.length; i++) {
    for (let j = 0; j < FORCE_ORDER.length; j++) {
      const s1 = forceScores[FORCE_ORDER[i]] || 3;
      const s2 = forceScores[FORCE_ORDER[j]] || 3;
      const value = i === j ? s1 : Math.round(((s1 + s2) / 2) * 10) / 10;
      map.push({ row: FORCE_ORDER[i], col: FORCE_ORDER[j], value });
    }
  }
  return map;
}

describe('PorterHeatMap — Cross-Force Interactions', () => {
  const scores = { rivalry: 4, new_entrants: 3, substitutes: 2, buyer_power: 5, supplier_power: 3 };

  it('generates 25 cells (5×5 matrix)', () => {
    const map = buildHeatMap(scores);
    expect(map).toHaveLength(25);
  });

  it('diagonal cells use force own score', () => {
    const map = buildHeatMap(scores);
    const diagonal = map.filter(c => c.row === c.col);
    expect(diagonal.find(c => c.row === 'rivalry').value).toBe(4);
  });

  it('off-diagonal cells are averaged', () => {
    const map = buildHeatMap(scores);
    const cell = map.find(c => c.row === 'rivalry' && c.col === 'new_entrants');
    expect(cell.value).toBe(3.5);
  });

  it('matrix is symmetric', () => {
    const map = buildHeatMap(scores);
    const ab = map.find(c => c.row === 'rivalry' && c.col === 'buyer_power');
    const ba = map.find(c => c.row === 'buyer_power' && c.col === 'rivalry');
    expect(ab.value).toBe(ba.value);
  });
});
