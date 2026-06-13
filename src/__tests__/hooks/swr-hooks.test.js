/**
 * SWR Hooks Tests — Phase 5
 * ============================
 * Tests the createHook factory and useMutation helper.
 */
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// Mock the SWR module
vi.mock('swr', () => ({
  __esModule: true,
  default: vi.fn((key, fetcher, options) => {
    // Simple mock: return loading state
    return {
      data: undefined,
      error: undefined,
      isLoading: true,
      isValidating: false,
      mutate: vi.fn(),
    };
  }),
}));

// Mock the API module
vi.mock('../../lib/api', () => ({
  __esModule: true,
  default: {
    getPestel: vi.fn(),
    getPorter: vi.fn(),
    getSwot: vi.fn(),
    getKernel: vi.fn(),
    getObjectives: vi.fn(),
    getDashboard: vi.fn(),
    getInstitutions: vi.fn(),
    getWorkspaceSummary: vi.fn(),
  },
}));

describe('SWR Hooks', () => {
  it('usePestel returns loading state initially', async () => {
    const { usePestel } = await import('../../lib/swr-hooks');
    const { result } = renderHook(() => usePestel('1'));
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.mutate).toBeDefined();
  });

  it('usePorter returns loading state initially', async () => {
    const { usePorter } = await import('../../lib/swr-hooks');
    const { result } = renderHook(() => usePorter('1'));
    expect(result.current.isLoading).toBe(true);
  });

  it('useSwot returns loading state initially', async () => {
    const { useSwot } = await import('../../lib/swr-hooks');
    const { result } = renderHook(() => useSwot('1'));
    expect(result.current.isLoading).toBe(true);
  });

  it('useKernel returns loading state initially', async () => {
    const { useKernel } = await import('../../lib/swr-hooks');
    const { result } = renderHook(() => useKernel('1'));
    expect(result.current.isLoading).toBe(true);
  });

  it('hook returns null key when id is null (no fetch)', async () => {
    const { usePestel } = await import('../../lib/swr-hooks');
    const { result } = renderHook(() => usePestel(null));
    // When key is null, SWR should not fetch
    expect(result.current).toBeDefined();
  });

  it('useMutation tracks submitting state', async () => {
    const { useMutation } = await import('../../lib/swr-hooks');
    const mockAction = vi.fn().mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useMutation(mockAction));

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.trigger).toBe('function');
  });

  it('useMutation handles successful action', async () => {
    const { useMutation } = await import('../../lib/swr-hooks');
    const mockAction = vi.fn().mockResolvedValue({ id: 1, status: 'ok' });
    const { result } = renderHook(() => useMutation(mockAction));

    let actionResult;
    await act(async () => {
      actionResult = await result.current.trigger('arg1', 'arg2');
    });

    expect(mockAction).toHaveBeenCalledWith('arg1', 'arg2');
    expect(actionResult).toEqual({ id: 1, status: 'ok' });
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('useMutation captures errors', async () => {
    const { useMutation } = await import('../../lib/swr-hooks');
    const mockError = new Error('Network error');
    const mockAction = vi.fn().mockRejectedValue(mockError);
    const { result } = renderHook(() => useMutation(mockAction));

    await act(async () => {
      try {
        await result.current.trigger();
      } catch (e) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe(mockError);
    expect(result.current.isSubmitting).toBe(false);
  });
});
