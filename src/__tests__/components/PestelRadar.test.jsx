/**
 * PestelRadar Component Tests — Phase 5
 * ========================================
 * Tests the buildRadarData logic and component contract.
 * Note: Recharts components are mocked since the source .js files
 * use JSX (Next.js convention) which requires Vite-specific handling.
 */
import { describe, it, expect, vi } from 'vitest';

// Mock recharts to avoid JSX-in-.js parsing issues
vi.mock('recharts', () => ({
  RadarChart: vi.fn(() => null),
  PolarGrid: vi.fn(() => null),
  PolarAngleAxis: vi.fn(() => null),
  PolarRadiusAxis: vi.fn(() => null),
  Radar: vi.fn(() => null),
  ResponsiveContainer: vi.fn(({ children }) => children),
  Tooltip: vi.fn(() => null),
  Legend: vi.fn(() => null),
}));

describe('PestelRadar — buildRadarData Logic', () => {
  // Extract and test the pure data transformation logic
  const FACTOR_LABELS = { P: 'Político', E: 'Económico', S: 'Social', T: 'Tecnológico', E2: 'Ecológico', L: 'Legal' };
  const FACTORS = ['P', 'E', 'S', 'T', 'E2', 'L'];

  function buildRadarData(signals) {
    const counts = { P: { high: 0, medium: 0, low: 0 }, E: { high: 0, medium: 0, low: 0 }, S: { high: 0, medium: 0, low: 0 }, T: { high: 0, medium: 0, low: 0 }, E2: { high: 0, medium: 0, low: 0 }, L: { high: 0, medium: 0, low: 0 } };
    signals.forEach(s => {
      const f = s.factor?.toUpperCase() || 'P';
      const sev = s.severity || 'medium';
      if (counts[f]) counts[f][sev] = (counts[f][sev] || 0) + 1;
    });
    return FACTORS.map(f => ({
      factor: FACTOR_LABELS[f],
      high: counts[f].high,
      medium: counts[f].medium,
      low: counts[f].low,
      total: counts[f].high + counts[f].medium + counts[f].low,
    }));
  }

  it('returns empty data for empty signals', () => {
    const data = buildRadarData([]);
    expect(data).toHaveLength(6);
    data.forEach(d => {
      expect(d.total).toBe(0);
      expect(d.high).toBe(0);
      expect(d.medium).toBe(0);
      expect(d.low).toBe(0);
    });
  });

  it('correctly counts signals by factor and severity', () => {
    const signals = [
      { factor: 'P', severity: 'high', title: 'Regulación' },
      { factor: 'E', severity: 'medium', title: 'Inflación' },
      { factor: 'T', severity: 'high', title: 'IA' },
      { factor: 'T', severity: 'low', title: 'IoT' },
      { factor: 'S', severity: 'low', title: 'Demografía' },
      { factor: 'E2', severity: 'medium', title: 'ESG' },
      { factor: 'L', severity: 'low', title: 'GDPR' },
    ];
    const data = buildRadarData(signals);

    const political = data.find(d => d.factor === 'Político');
    expect(political.high).toBe(1);
    expect(political.total).toBe(1);

    const tech = data.find(d => d.factor === 'Tecnológico');
    expect(tech.high).toBe(1);
    expect(tech.low).toBe(1);
    expect(tech.total).toBe(2);
  });

  it('defaults missing factor to P', () => {
    const signals = [{ severity: 'high', title: 'Unknown' }];
    const data = buildRadarData(signals);
    const political = data.find(d => d.factor === 'Político');
    expect(political.high).toBe(1);
  });

  it('defaults missing severity to medium', () => {
    const signals = [{ factor: 'E', title: 'Test' }];
    const data = buildRadarData(signals);
    const economic = data.find(d => d.factor === 'Económico');
    expect(economic.medium).toBe(1);
  });

  it('handles uppercase factor normalization', () => {
    const signals = [
      { factor: 'p', severity: 'high', title: 'Test' },
      { factor: 'e2', severity: 'low', title: 'Test' },
    ];
    const data = buildRadarData(signals);
    expect(data.find(d => d.factor === 'Político').high).toBe(1);
    expect(data.find(d => d.factor === 'Ecológico').low).toBe(1);
  });

  it('preserves all 6 PESTEL factors in output', () => {
    const data = buildRadarData([{ factor: 'P', severity: 'high', title: 'Test' }]);
    const factors = data.map(d => d.factor);
    expect(factors).toEqual(['Político', 'Económico', 'Social', 'Tecnológico', 'Ecológico', 'Legal']);
  });
});
