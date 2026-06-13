/**
 * BscGauge — Score Computation Logic Tests
 */
import { describe, it, expect } from 'vitest';

function computeGaugeArc(value, max = 100) {
  return Math.min(1, Math.max(0, value / max));
}

function getGaugeColor(pct) {
  if (pct >= 80) return 'green';
  if (pct >= 50) return 'amber';
  return 'red';
}

describe('BscGauge — Score Computation', () => {
  it('computes arc ratio for 75/100', () => {
    expect(computeGaugeArc(75)).toBe(0.75);
  });

  it('clamps to 1.0 for values exceeding max', () => {
    expect(computeGaugeArc(120)).toBe(1);
  });

  it('clamps to 0.0 for negative values', () => {
    expect(computeGaugeArc(-10)).toBe(0);
  });

  it('returns green for >= 80%', () => {
    expect(getGaugeColor(85)).toBe('green');
  });

  it('returns amber for 50-79%', () => {
    expect(getGaugeColor(65)).toBe('amber');
  });

  it('returns red for < 50%', () => {
    expect(getGaugeColor(30)).toBe('red');
  });
});
