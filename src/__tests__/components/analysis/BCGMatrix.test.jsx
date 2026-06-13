/**
 * BCGMatrix — Henderson Quadrant Classification Logic Tests
 */
import { describe, it, expect } from 'vitest';

function classifyBCG(growth, share, growthThreshold = 0.10, shareThreshold = 0.30) {
  const highGrowth = growth >= growthThreshold;
  const highShare = share >= shareThreshold;
  if (highGrowth && highShare) return 'star';
  if (!highGrowth && highShare) return 'cow';
  if (highGrowth && !highShare) return 'question';
  return 'dog';
}

describe('BCGMatrix — Henderson Classification', () => {
  it('classifies star correctly', () => {
    expect(classifyBCG(0.15, 0.50)).toBe('star');
  });

  it('classifies cash cow correctly', () => {
    expect(classifyBCG(0.05, 0.50)).toBe('cow');
  });

  it('classifies question mark correctly', () => {
    expect(classifyBCG(0.15, 0.10)).toBe('question');
  });

  it('classifies dog correctly', () => {
    expect(classifyBCG(0.03, 0.10)).toBe('dog');
  });

  it('boundary: exact threshold is high', () => {
    expect(classifyBCG(0.10, 0.30)).toBe('star');
  });
});
