/**
 * PestelPriorityMatrix — Quadrant Classification Logic Tests
 */
import { describe, it, expect } from 'vitest';

function classifyQuadrant(urgency, impact) {
  if (urgency >= 50 && impact >= 67) return 'act_now';
  if (urgency < 50 && impact >= 67) return 'plan_ahead';
  if (urgency >= 50 && impact < 67) return 'monitor';
  return 'watch';
}

describe('PestelPriorityMatrix — Quadrant Classification', () => {
  it('classifies high urgency + high impact as act_now', () => {
    expect(classifyQuadrant(75, 90)).toBe('act_now');
  });

  it('classifies low urgency + high impact as plan_ahead', () => {
    expect(classifyQuadrant(30, 80)).toBe('plan_ahead');
  });

  it('classifies high urgency + low impact as monitor', () => {
    expect(classifyQuadrant(60, 50)).toBe('monitor');
  });

  it('classifies low urgency + low impact as watch', () => {
    expect(classifyQuadrant(20, 30)).toBe('watch');
  });

  it('handles boundary at urgency=50 impact=67 as act_now', () => {
    expect(classifyQuadrant(50, 67)).toBe('act_now');
  });
});
