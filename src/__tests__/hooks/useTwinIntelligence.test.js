/**
 * Unit Tests — Intelligence Hub SWR Hooks (Fase 2)
 * ====================================================
 * Tests for the 4 intelligence-specific SWR hooks.
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';

// Mock SWR before importing hooks
const mockUseSWR = vi.fn();
vi.mock('swr', () => ({
  default: (...args) => mockUseSWR(...args),
}));

vi.mock('@/lib/api', () => ({
  default: {
    getIntelligenceSummary: vi.fn(),
    getIntelligenceFreshness: vi.fn(),
    getIntelligenceGaps: vi.fn(),
    getIntelligenceRecommendations: vi.fn(),
  },
}));

import {
  useIntelligenceSummary,
  useIntelligenceFreshness,
  useIntelligenceGaps,
  useIntelligenceRecommendations,
} from '@/lib/swr-hooks';

describe('Intelligence Hub SWR Hooks', () => {
  beforeEach(() => {
    mockUseSWR.mockReturnValue({
      data: null,
      error: null,
      isLoading: true,
      isValidating: false,
      mutate: vi.fn(),
    });
  });

  describe('useIntelligenceSummary', () => {
    test('returns null key when institutionId is falsy', () => {
      useIntelligenceSummary(null);
      expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function), expect.any(Object));
    });

    test('builds correct key with institutionId', () => {
      useIntelligenceSummary(1);
      expect(mockUseSWR).toHaveBeenCalledWith(
        'intelligence-summary/1/all',
        expect.any(Function),
        expect.any(Object),
      );
    });

    test('builds correct key with institutionId and planId', () => {
      useIntelligenceSummary(1, 42);
      expect(mockUseSWR).toHaveBeenCalledWith(
        'intelligence-summary/1/42',
        expect.any(Function),
        expect.any(Object),
      );
    });

    test('returns data, error, isLoading, mutate', () => {
      const result = useIntelligenceSummary(1);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
      expect(result).toHaveProperty('isLoading');
      expect(result).toHaveProperty('mutate');
    });
  });

  describe('useIntelligenceFreshness', () => {
    test('returns null key when institutionId is falsy', () => {
      useIntelligenceFreshness(null);
      expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function), expect.any(Object));
    });

    test('builds correct key', () => {
      useIntelligenceFreshness(5);
      expect(mockUseSWR).toHaveBeenCalledWith(
        'intelligence-freshness/5',
        expect.any(Function),
        expect.any(Object),
      );
    });
  });

  describe('useIntelligenceGaps', () => {
    test('builds correct key with planId', () => {
      useIntelligenceGaps(1, 10);
      expect(mockUseSWR).toHaveBeenCalledWith(
        'intelligence-gaps/1/10',
        expect.any(Function),
        expect.any(Object),
      );
    });
  });

  describe('useIntelligenceRecommendations', () => {
    test('builds correct key', () => {
      useIntelligenceRecommendations(3, null);
      expect(mockUseSWR).toHaveBeenCalledWith(
        'intelligence-recommendations/3/all',
        expect.any(Function),
        expect.any(Object),
      );
    });
  });
});
