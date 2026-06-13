/**
 * Digital Twin Dashboard — Component Tests (Fase 1.5)
 * =====================================================
 * Render tests for the Twin dashboard page component.
 */

import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/twin',
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock recharts (heavy dependency — stub to avoid DOM issues)
vi.mock('recharts', () => ({
  LineChart: ({ children }) => children,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }) => children,
  Area: () => null,
  AreaChart: ({ children }) => children,
}));

// Mock SWR hooks
vi.mock('@/lib/swr-hooks', () => ({
  useTwinHealth: () => ({
    data: {
      completeness: { overall: 72, stakeholders: 100, governance: 80, plans: 50, culture: 40 },
      trend: { direction: 'up', delta: 5.2 },
    },
    isLoading: false,
    mutate: vi.fn(),
  }),
  useTwinSnapshots: () => ({
    data: [
      { id: 1, version: 1, trigger: 'manual', captured_at: '2026-06-01T10:00:00Z', completeness_score: 65 },
      { id: 2, version: 2, trigger: 'auto', captured_at: '2026-06-07T10:00:00Z', completeness_score: 72 },
    ],
    isLoading: false,
    mutate: vi.fn(),
  }),
  useTwinTimeline: () => ({
    data: [
      { id: 1, event_type: 'snapshot_created', occurred_at: '2026-06-07T10:00:00Z', snapshot_version: 2, severity: 'low' },
    ],
    isLoading: false,
  }),
  useTwinMetrics: () => ({
    data: [
      { recorded_at: '2026-06-01T00:00:00Z', value: 65 },
      { recorded_at: '2026-06-07T00:00:00Z', value: 72 },
    ],
  }),
  useMutation: () => ({
    trigger: vi.fn(),
    isSubmitting: false,
  }),
}));

// Import AFTER mocks
import TwinPage from '@/app/twin/page.jsx';

describe('TwinPage — Render', () => {
  test('renders page title', () => {
    render(<TwinPage />);
    expect(screen.getByText(/digital twin/i)).toBeDefined();
  });

  test('renders capture snapshot button', () => {
    render(<TwinPage />);
    const btn = screen.getByRole('button', { name: /capturar snapshot/i });
    expect(btn).toBeDefined();
    expect(btn.disabled).toBe(false);
  });

  test('renders completeness KPI with percentage', () => {
    render(<TwinPage />);
    // Multiple elements may show "72%" (KPI + snapshot entry)
    const matches = screen.getAllByText('72%');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  test('renders maturity tier label', () => {
    render(<TwinPage />);
    expect(screen.getByText('Bueno')).toBeDefined();
  });

  test('renders snapshot count KPI', () => {
    render(<TwinPage />);
    expect(screen.getByText('Snapshots Totales')).toBeDefined();
  });

  test('renders trend direction', () => {
    render(<TwinPage />);
    expect(screen.getByText(/\+5\.2%/)).toBeDefined();
  });

  test('renders dimension progress bars', () => {
    render(<TwinPage />);
    expect(screen.getByText(/stakeholders/i)).toBeDefined();
    expect(screen.getByText(/governance/i)).toBeDefined();
  });

  test('renders snapshot history entries', () => {
    render(<TwinPage />);
    expect(screen.getByText('v1')).toBeDefined();
    expect(screen.getByText('v2')).toBeDefined();
  });

  test('renders timeline events', () => {
    render(<TwinPage />);
    expect(screen.getByText(/snapshot created/i)).toBeDefined();
  });
});
