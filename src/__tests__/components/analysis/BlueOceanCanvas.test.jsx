/**
 * BlueOceanCanvas — ERRC Framework Logic Tests
 */
import { describe, it, expect } from 'vitest';

const ERRC_ACTIONS = ['eliminate', 'reduce', 'raise', 'create'];

function validateCanvas(canvas) {
  const errors = [];
  if (!canvas.factors || canvas.factors.length === 0) errors.push('No factors');
  if (!canvas.actions || canvas.actions.length === 0) errors.push('No actions');
  for (const f of (canvas.factors || [])) {
    if (f.industry_score < 1 || f.industry_score > 5) errors.push(`Factor ${f.name}: industry_score out of range`);
    if (f.proposed_score < 1 || f.proposed_score > 5) errors.push(`Factor ${f.name}: proposed_score out of range`);
  }
  for (const a of (canvas.actions || [])) {
    if (!ERRC_ACTIONS.includes(a.action)) errors.push(`Unknown action: ${a.action}`);
  }
  return { valid: errors.length === 0, errors };
}

describe('BlueOceanCanvas — ERRC Validation', () => {
  const mockCanvas = {
    factors: [
      { name: 'Price', industry_score: 4, proposed_score: 2 },
      { name: 'Quality', industry_score: 3, proposed_score: 5 },
    ],
    actions: [
      { action: 'eliminate', items: ['Overhead'] },
      { action: 'raise', items: ['Quality'] },
    ],
  };

  it('validates a correct canvas', () => {
    const result = validateCanvas(mockCanvas);
    expect(result.valid).toBe(true);
  });

  it('detects missing factors', () => {
    const result = validateCanvas({ factors: [], actions: [{ action: 'raise', items: [] }] });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('No factors');
  });

  it('detects invalid action type', () => {
    const result = validateCanvas({
      factors: [{ name: 'X', industry_score: 3, proposed_score: 3 }],
      actions: [{ action: 'invalid', items: [] }],
    });
    expect(result.errors.some(e => e.includes('Unknown action'))).toBe(true);
  });

  it('detects out-of-range scores', () => {
    const result = validateCanvas({
      factors: [{ name: 'X', industry_score: 6, proposed_score: 3 }],
      actions: [{ action: 'raise', items: [] }],
    });
    expect(result.valid).toBe(false);
  });

  it('all 4 ERRC actions are valid', () => {
    expect(ERRC_ACTIONS).toHaveLength(4);
    expect(ERRC_ACTIONS).toContain('eliminate');
    expect(ERRC_ACTIONS).toContain('create');
  });
});
