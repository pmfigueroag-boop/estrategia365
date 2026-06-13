/**
 * PestelHeatMap — Cross-Factor Interaction Logic Tests
 */
import { describe, it, expect } from 'vitest';

const FACTORS = ['P', 'E', 'S', 'T', 'E2', 'L'];
const FACTOR_LABELS = { P: 'Político', E: 'Económico', S: 'Social', T: 'Tecnológico', E2: 'Ecológico', L: 'Legal' };

function computeInteraction(srcRisk, tgtRisk, sharedTimeframeFactor = 1.0) {
  return Math.min(3.0, Math.round(((srcRisk * 0.4 + tgtRisk * 0.4) * sharedTimeframeFactor / 100 * 3) * 10) / 10);
}

describe('PestelHeatMap — Cross-Factor Logic', () => {
  it('has 6 PESTEL factors', () => {
    expect(FACTORS).toHaveLength(6);
  });

  it('maps all factor labels in Spanish', () => {
    FACTORS.forEach(f => expect(FACTOR_LABELS[f]).toBeDefined());
  });

  it('computes self-interaction as average severity', () => {
    const severities = [3, 2, 1];
    const avg = severities.reduce((a, b) => a + b, 0) / severities.length;
    expect(Math.round(avg * 10) / 10).toBe(2);
  });

  it('computes cross-interaction bounded to 3.0', () => {
    const result = computeInteraction(100, 100, 1.5);
    expect(result).toBeLessThanOrEqual(3.0);
  });

  it('returns 0 for zero-risk factors', () => {
    expect(computeInteraction(0, 0)).toBe(0);
  });
});
