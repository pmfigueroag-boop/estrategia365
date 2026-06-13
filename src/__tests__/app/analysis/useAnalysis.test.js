import { renderHook, act } from '@testing-library/react';
import { useAnalysis } from '@/app/analysis/hooks/useAnalysis';
import api from '@/lib/api';
import * as swrHooks from '@/lib/swr-hooks';

vi.mock('@/lib/api');
vi.mock('@/lib/swr-hooks', () => ({
  usePestel: vi.fn(),
  usePestelDeepAnalysis: vi.fn(),
  usePestelDrift: vi.fn(),
  usePestelEarlyWarnings: vi.fn(),
  usePorter: vi.fn(),
  usePorterDeepAnalysis: vi.fn(),
  useSwot: vi.fn(),
  useTows: vi.fn(),
}));

describe('useAnalysis Hook', () => {
  const planId = 'test-plan-123';
  const mockToast = { success: vi.fn(), error: vi.fn(), warning: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mocks for SWR
    swrHooks.usePestel.mockReturnValue({ data: [], mutate: vi.fn() });
    swrHooks.usePestelDeepAnalysis.mockReturnValue({ data: null, mutate: vi.fn() });
    swrHooks.usePestelDrift.mockReturnValue({ data: null });
    swrHooks.usePestelEarlyWarnings.mockReturnValue({ data: null });
    
    swrHooks.usePorter.mockReturnValue({ data: { forces: [] }, mutate: vi.fn() });
    swrHooks.usePorterDeepAnalysis.mockReturnValue({ data: null, mutate: vi.fn() });
    
    swrHooks.useSwot.mockReturnValue({ data: [], mutate: vi.fn() });
    swrHooks.useTows.mockReturnValue({ data: [], mutate: vi.fn() });
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useAnalysis(planId, mockToast));
    
    expect(result.current.state.activeTab).toBe('institucional');
    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.planId).toBe(planId);
  });

  it('allows changing active tab', () => {
    const { result } = renderHook(() => useAnalysis(planId, mockToast));
    
    act(() => {
      result.current.actions.setActiveTab('pestel');
    });
    
    expect(result.current.state.activeTab).toBe('pestel');
  });

  it('handles scan pestel via API and calls mutates', async () => {
    const mutatePestel = vi.fn();
    const mutatePestelDeep = vi.fn();
    swrHooks.usePestel.mockReturnValue({ data: [], mutate: mutatePestel });
    swrHooks.usePestelDeepAnalysis.mockReturnValue({ data: null, mutate: mutatePestelDeep });
    
    api.scanPestel.mockResolvedValue([{ id: 1, factor: 'P' }]);

    const { result } = renderHook(() => useAnalysis(planId, mockToast));
    
    await act(async () => {
      await result.current.actions.handleScan('pestel');
    });

    expect(api.scanPestel).toHaveBeenCalledWith(planId);
    expect(mutatePestel).toHaveBeenCalledWith([{ id: 1, factor: 'P' }], false);
    expect(mutatePestelDeep).toHaveBeenCalled();
    expect(mockToast.success).toHaveBeenCalledWith('PESTEL actualizado');
  });

  it('handles scan failures gracefully', async () => {
    api.scanPorter.mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useAnalysis(planId, mockToast));
    
    await act(async () => {
      await result.current.actions.handleScan('porter');
    });

    expect(mockToast.error).toHaveBeenCalledWith('Network Error');
    expect(result.current.state.isLoading).toBe(false);
  });
});
