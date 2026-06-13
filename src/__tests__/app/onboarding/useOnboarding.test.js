// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useOnboarding } from '@/app/onboarding/hooks/useOnboarding';
import service from '@/app/onboarding/services/onboardingService';

// Mock dependencies
vi.mock('@/app/onboarding/services/onboardingService', () => ({
  default: {
    loadFullProgress: vi.fn(),
    saveInstitutionProfile: vi.fn(),
    createPlan: vi.fn(),
    syncProgress: vi.fn(),
    FORM_DEFAULTS: { name: '', sector: 'private', industry: '', size: '' },
    METRICS_DEFAULTS: { strategic_budget: 0, kpis: [] },
  }
}));

vi.mock('@/features/plan/context/ToastContext', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn(), warning: vi.fn() })
}));

vi.mock('@/app/onboarding/hooks/useOnboardingPersistence', () => ({
  useOnboardingPersistence: () => ({})
}));

vi.mock('@/app/onboarding/hooks/useOnboardingAnalytics', () => ({
  useOnboardingAnalytics: () => ({
    trackStart: vi.fn(),
    trackStepCompleted: vi.fn(),
    trackCompleted: vi.fn(),
  })
}));

describe('useOnboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with loading state and calls loadFullProgress', async () => {
    service.loadFullProgress.mockResolvedValue({
      step: 1,
      institutionId: null,
      tier: 'free',
      formValues: service.FORM_DEFAULTS,
    });

    const { result } = renderHook(() => useOnboarding());

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for the effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(service.loadFullProgress).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.step).toBe(1);
  });

  it('resumes from step 4 if loadFullProgress returns step 4', async () => {
    service.loadFullProgress.mockResolvedValue({
      step: 4,
      institutionId: 99,
      tier: 'premium',
      formValues: service.FORM_DEFAULTS,
    });

    const { result } = renderHook(() => useOnboarding());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.step).toBe(4);
    expect(result.current.institutionId).toBe(99);
    expect(result.current.tier).toBe('premium');
  });

  it('goToStep updates step and calls syncProgress', async () => {
    service.loadFullProgress.mockResolvedValue({
      step: 1,
      institutionId: null,
      tier: 'free',
      formValues: service.FORM_DEFAULTS,
    });

    const { result } = renderHook(() => useOnboarding());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    act(() => {
      result.current.goToStep(5);
    });

    expect(result.current.step).toBe(5);
    expect(service.syncProgress).toHaveBeenCalledWith({ current_step: 5 });
  });
});
