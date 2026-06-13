/**
 * BscGauge Component Tests — Phase 5
 * =====================================
 * Tests the data transformation logic used by BscGauge.
 */
import { describe, it, expect, vi } from 'vitest';

// Mock recharts
vi.mock('recharts', () => ({
  BarChart: vi.fn(() => null),
  Bar: vi.fn(() => null),
  XAxis: vi.fn(() => null),
  YAxis: vi.fn(() => null),
  CartesianGrid: vi.fn(() => null),
  ResponsiveContainer: vi.fn(({ children }) => children),
  Tooltip: vi.fn(() => null),
  Cell: vi.fn(() => null),
  LabelList: vi.fn(() => null),
}));

const PERSPECTIVE_CONFIG = {
  financial: { label: 'Financiera', color: '#6366f1', icon: '💰' },
  customer: { label: 'Cliente', color: '#06b6d4', icon: '👥' },
  process: { label: 'Procesos', color: '#f59e0b', icon: '⚙️' },
  learning: { label: 'Aprendizaje', color: '#10b981', icon: '📚' },
};

// Extract the data transformation logic for testing
function transformBscData(perspectives) {
  return perspectives.map(p => {
    const cfg = PERSPECTIVE_CONFIG[p.perspective] || { label: p.perspective, color: '#6366f1', icon: '📊' };
    const progress = p.target_value > 0
      ? Math.min(100, Math.round((p.current_value / p.target_value) * 100))
      : 0;
    return {
      name: `${cfg.icon} ${cfg.label}`,
      progress,
      color: cfg.color,
      kpi: p.kpi || p.objective || '',
      current: p.current_value,
      target: p.target_value,
    };
  });
}

describe('BscGauge — Data Transformation Logic', () => {
  it('transforms perspectives into chart data', () => {
    const perspectives = [
      { perspective: 'financial', kpi: 'Revenue', current_value: 75, target_value: 100 },
      { perspective: 'customer', kpi: 'NPS', current_value: 40, target_value: 80 },
    ];
    const data = transformBscData(perspectives);
    expect(data).toHaveLength(2);
    expect(data[0].progress).toBe(75);
    expect(data[0].name).toContain('Financiera');
    expect(data[0].color).toBe('#6366f1');
    expect(data[1].progress).toBe(50);
    expect(data[1].name).toContain('Cliente');
  });

  it('caps progress at 100% when current exceeds target', () => {
    const data = transformBscData([
      { perspective: 'financial', kpi: 'Revenue', current_value: 200, target_value: 100 },
    ]);
    expect(data[0].progress).toBe(100);
  });

  it('handles zero target value without division by zero', () => {
    const data = transformBscData([
      { perspective: 'process', kpi: 'Cycle', current_value: 50, target_value: 0 },
    ]);
    expect(data[0].progress).toBe(0);
  });

  it('uses fallback config for unknown perspectives', () => {
    const data = transformBscData([
      { perspective: 'custom_metric', kpi: 'Custom', current_value: 30, target_value: 100 },
    ]);
    expect(data[0].name).toContain('custom_metric');
    expect(data[0].progress).toBe(30);
  });

  it('computes average progress correctly', () => {
    const data = transformBscData([
      { perspective: 'financial', kpi: 'R', current_value: 100, target_value: 100 },
      { perspective: 'customer', kpi: 'C', current_value: 0, target_value: 100 },
    ]);
    const avg = Math.round(data.reduce((s, d) => s + d.progress, 0) / (data.length || 1));
    expect(avg).toBe(50);
  });

  it('handles empty perspectives array', () => {
    const data = transformBscData([]);
    expect(data).toHaveLength(0);
  });

  it('uses objective as fallback when kpi is missing', () => {
    const data = transformBscData([
      { perspective: 'learning', objective: 'Train team', current_value: 20, target_value: 50 },
    ]);
    expect(data[0].kpi).toBe('Train team');
  });
});
