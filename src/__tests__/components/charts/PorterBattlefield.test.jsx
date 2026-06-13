/**
 * PorterBattlefield — CPS Risk Level Classification Tests
 */
import { describe, it, expect } from 'vitest';

function classifyRisk(cps) {
  if (cps >= 75) return 'critical';
  if (cps >= 60) return 'high';
  if (cps >= 40) return 'moderate';
  return 'low';
}

function computeCPS(score, trend = 'stable', probability = 50) {
  const trendMultiplier = { declining: 0.8, stable: 1.0, improving: 1.2 }[trend] || 1.0;
  return Math.round(score / 5 * 100 * trendMultiplier * (probability / 100));
}

describe('PorterBattlefield — Risk Classification', () => {
  it('classifies CPS >= 75 as critical', () => {
    expect(classifyRisk(80)).toBe('critical');
  });

  it('classifies CPS 60-74 as high', () => {
    expect(classifyRisk(65)).toBe('high');
  });

  it('classifies CPS 40-59 as moderate', () => {
    expect(classifyRisk(45)).toBe('moderate');
  });

  it('classifies CPS < 40 as low', () => {
    expect(classifyRisk(20)).toBe('low');
  });

  it('computes CPS from score/trend/probability', () => {
    const cps = computeCPS(4, 'improving', 80);
    expect(cps).toBeGreaterThan(50);
  });

  it('declining trend reduces CPS', () => {
    const stable = computeCPS(3, 'stable', 50);
    const declining = computeCPS(3, 'declining', 50);
    expect(declining).toBeLessThan(stable);
  });
});
