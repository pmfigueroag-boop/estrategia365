/**
 * PorterForces — Industry Assessment Logic Tests
 */
import { describe, it, expect } from 'vitest';

function computeAssessment(forceScores) {
  const avg = Object.values(forceScores).reduce((a, b) => a + b, 0) / Object.keys(forceScores).length;
  const attract = Math.max(1.0, Math.min(5.0, Math.round((5.0 - avg + 1) * 100) / 100));
  let posture, rec;
  if (attract >= 3.5) { posture = 'offensive'; rec = 'Industria atractiva.'; }
  else if (attract >= 2.5) { posture = 'selective'; rec = 'Industria moderada.'; }
  else { posture = 'defensive'; rec = 'Industria hostil.'; }
  return { avg: Math.round(avg * 100) / 100, attract, posture, rec };
}

describe('PorterForces — Industry Assessment', () => {
  it('low pressure yields offensive posture', () => {
    const result = computeAssessment({ rivalry: 1, new_entrants: 2, substitutes: 1, buyer_power: 2, supplier_power: 1 });
    expect(result.posture).toBe('offensive');
  });

  it('high pressure yields defensive posture', () => {
    const result = computeAssessment({ rivalry: 5, new_entrants: 4, substitutes: 5, buyer_power: 4, supplier_power: 5 });
    expect(result.posture).toBe('defensive');
  });

  it('moderate pressure yields selective posture', () => {
    const result = computeAssessment({ rivalry: 3, new_entrants: 3, substitutes: 3, buyer_power: 3, supplier_power: 3 });
    expect(result.posture).toBe('selective');
  });

  it('attractiveness bounded 1-5', () => {
    const result = computeAssessment({ rivalry: 5, new_entrants: 5, substitutes: 5, buyer_power: 5, supplier_power: 5 });
    expect(result.attract).toBeGreaterThanOrEqual(1.0);
    expect(result.attract).toBeLessThanOrEqual(5.0);
  });
});
