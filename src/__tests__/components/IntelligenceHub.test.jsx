/**
 * Component Tests — Intelligence Hub Page (Fase 2)
 * ====================================================
 * Render and behavior tests for the Intelligence Hub dashboard.
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import IntelligenceHubPage from '@/app/intelligence/page';

// Mock hooks
vi.mock('@/features/shared/hooks/swr-hooks', () => ({
  useIntelligenceSummary: vi.fn(),
  useIntelligenceGaps: vi.fn(),
  useIntelligenceRecommendations: vi.fn(),
}));

import {
  useIntelligenceSummary,
  useIntelligenceGaps,
  useIntelligenceRecommendations,
} from '@/features/shared/hooks/swr-hooks';

describe('IntelligenceHubPage', () => {
  beforeEach(() => {
    // Default: loading state
    useIntelligenceSummary.mockReturnValue({ data: null, isLoading: true });
    useIntelligenceGaps.mockReturnValue({ data: null, isLoading: true });
    useIntelligenceRecommendations.mockReturnValue({ data: null, isLoading: true });
  });

  test('renders the page title', () => {
    render(<IntelligenceHubPage />);
    expect(screen.getByText('Intelligence Hub')).toBeDefined();
  });

  test('renders the subtitle', () => {
    render(<IntelligenceHubPage />);
    expect(screen.getByText(/inteligencia estratégica contextualizada/i)).toBeDefined();
  });

  test('renders the coverage matrix section', () => {
    render(<IntelligenceHubPage />);
    expect(screen.getByText(/Matriz de Cobertura/i)).toBeDefined();
  });

  test('renders all 7 analysis cards', () => {
    useIntelligenceSummary.mockReturnValue({
      data: {
        analyses: {
          pestel: { count: 30, has_data: true, freshness: 'fresh' },
          porter: { count: 5, has_data: true, freshness: 'aging' },
          swot: { count: 12, has_data: true, freshness: 'fresh' },
          tows: { count: 0, has_data: false, freshness: 'never_run' },
          vrio: { count: 5, has_data: true, freshness: 'fresh' },
          bcg: { count: 4, has_data: true, freshness: 'stale' },
          blue_ocean: { count: 0, has_data: false, freshness: 'never_run' },
        },
        coverage: { total: 7, covered: 5, pct: 71 },
      },
      isLoading: false,
    });
    useIntelligenceGaps.mockReturnValue({ data: { gaps: [] }, isLoading: false });
    useIntelligenceRecommendations.mockReturnValue({ data: { recommendations: [] }, isLoading: false });

    render(<IntelligenceHubPage />);

    expect(screen.getByText('PESTEL')).toBeDefined();
    expect(screen.getByText('Porter 5F')).toBeDefined();
    expect(screen.getByText('FODA')).toBeDefined();
    expect(screen.getByText('TOWS')).toBeDefined();
    expect(screen.getByText('VRIO')).toBeDefined();
    expect(screen.getByText('BCG Matrix')).toBeDefined();
    expect(screen.getByText('Blue Ocean')).toBeDefined();
  });

  test('renders coverage percentage in header badge', () => {
    useIntelligenceSummary.mockReturnValue({
      data: {
        analyses: {},
        coverage: { total: 7, covered: 5, pct: 71 },
      },
      isLoading: false,
    });
    useIntelligenceGaps.mockReturnValue({ data: { gaps: [] }, isLoading: false });
    useIntelligenceRecommendations.mockReturnValue({ data: { recommendations: [] }, isLoading: false });

    render(<IntelligenceHubPage />);
    expect(screen.getByText('71%')).toBeDefined();
  });

  test('renders empty state when no gaps', () => {
    useIntelligenceSummary.mockReturnValue({ data: { analyses: {}, coverage: { pct: 100 } }, isLoading: false });
    useIntelligenceGaps.mockReturnValue({ data: { gaps: [] }, isLoading: false });
    useIntelligenceRecommendations.mockReturnValue({ data: { recommendations: [] }, isLoading: false });

    render(<IntelligenceHubPage />);
    expect(screen.getByText(/sin brechas detectadas/i)).toBeDefined();
  });

  test('renders recommendations when present', () => {
    useIntelligenceSummary.mockReturnValue({ data: { analyses: {}, coverage: { pct: 50 } }, isLoading: false });
    useIntelligenceGaps.mockReturnValue({ data: { gaps: [] }, isLoading: false });
    useIntelligenceRecommendations.mockReturnValue({
      data: {
        recommendations: [
          {
            priority: 'critical',
            analysis: 'pestel',
            recommendation: 'PESTEL nunca ejecutado',
            trigger: 'gap_analysis',
          },
        ],
      },
      isLoading: false,
    });

    render(<IntelligenceHubPage />);
    expect(screen.getByText(/PESTEL nunca ejecutado/)).toBeDefined();
    expect(screen.getByText('CRITICAL')).toBeDefined();
  });



  test('renders loading state for recommendations', () => {
    useIntelligenceSummary.mockReturnValue({ data: null, isLoading: true });
    useIntelligenceGaps.mockReturnValue({ data: null, isLoading: true });
    useIntelligenceRecommendations.mockReturnValue({ data: null, isLoading: true });

    render(<IntelligenceHubPage />);
    expect(screen.getByText(/Cargando recomendaciones/i)).toBeDefined();
  });
});
