/**
 * Digital Twin SWR Hooks — Unit Tests (Fase 1.5)
 * =================================================
 * Tests for useTwinHealth, useTwinSnapshots, useTwinTimeline, useTwinMetrics.
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { createElement } from 'react';
import { useTwinHealth, useTwinSnapshots, useTwinTimeline, useTwinMetrics } from '@/lib/swr-hooks';

// ── Mock API ─────────────────────────────────────────────────
vi.mock('@/lib/api', () => ({
  default: {
    getTwinHealth: vi.fn().mockResolvedValue({
      completeness: { overall: 72, stakeholders: 100, governance: 80, plans: 50 },
      trend: { direction: 'up', delta: 5.2 },
    }),
    getSnapshots: vi.fn().mockResolvedValue([
      { id: 1, version: 1, trigger: 'manual', captured_at: '2026-06-01T10:00:00Z', completeness_score: 65 },
      { id: 2, version: 2, trigger: 'auto', captured_at: '2026-06-07T10:00:00Z', completeness_score: 72 },
    ]),
    getTwinTimeline: vi.fn().mockResolvedValue([
      { id: 1, event_type: 'snapshot_created', occurred_at: '2026-06-07T10:00:00Z', snapshot_version: 2 },
    ]),
    getTwinMetricSeries: vi.fn().mockResolvedValue([
      { recorded_at: '2026-06-01T00:00:00Z', value: 65 },
      { recorded_at: '2026-06-07T00:00:00Z', value: 72 },
    ]),
  },
}));

// ── Wrapper ──────────────────────────────────────────────────
function wrapper({ children }) {
  return createElement(SWRConfig, {
    value: { dedupingInterval: 0, provider: () => new Map() },
    children,
  });
}

// ── Tests ────────────────────────────────────────────────────

describe('useTwinHealth', () => {
  test('returns health data with completeness and trend', async () => {
    const { result } = renderHook(() => useTwinHealth('1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data.completeness.overall).toBe(72);
    expect(result.current.data.trend.direction).toBe('up');
    expect(result.current.data.trend.delta).toBe(5.2);
  });

  test('returns null data when id is null', () => {
    const { result } = renderHook(() => useTwinHealth(null), { wrapper });
    expect(result.current.data).toBeUndefined();
  });
});

describe('useTwinSnapshots', () => {
  test('returns array of snapshots', async () => {
    const { result } = renderHook(() => useTwinSnapshots('1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data[0].version).toBe(1);
    expect(result.current.data[1].version).toBe(2);
  });
});

describe('useTwinTimeline', () => {
  test('returns array of events', async () => {
    const { result } = renderHook(() => useTwinTimeline('1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].event_type).toBe('snapshot_created');
  });
});

describe('useTwinMetrics', () => {
  test('returns metric series data', async () => {
    const { result } = renderHook(() => useTwinMetrics('1', 'completeness.overall'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data[0].value).toBe(65);
    expect(result.current.data[1].value).toBe(72);
  });

  test('does not fetch when metricKey is null', () => {
    const { result } = renderHook(() => useTwinMetrics('1', null), { wrapper });
    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  test('does not fetch when institutionId is null', () => {
    const { result } = renderHook(() => useTwinMetrics(null, 'completeness.overall'), { wrapper });
    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });
});
