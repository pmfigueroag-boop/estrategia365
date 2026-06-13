import React from 'react';
import { render, screen } from '@testing-library/react';
import IntelligenceHubPage from '@/app/intelligence/page';
import { useIntelligenceSummary, useIntelligenceGaps, useIntelligenceRecommendations } from '@/lib/swr-hooks';

// Mock the SWR hooks
vi.mock('@/lib/swr-hooks', () => ({
  useIntelligenceSummary: vi.fn(),
  useIntelligenceGaps: vi.fn(),
  useIntelligenceRecommendations: vi.fn(),
}));

describe('IntelligenceHubPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    useIntelligenceSummary.mockReturnValue({ isLoading: true });
    useIntelligenceGaps.mockReturnValue({ isLoading: true });
    useIntelligenceRecommendations.mockReturnValue({ isLoading: true });

    render(<IntelligenceHubPage />);
    expect(screen.getByText('Cargando recomendaciones...')).toBeInTheDocument();
    expect(screen.getByText('Analizando brechas...')).toBeInTheDocument();
  });

  it('renders data correctly', () => {
    useIntelligenceSummary.mockReturnValue({
      data: {
        coverage: { pct: 85 },
        analyses: {
          pestel: { freshness: 'fresh', count: 12, age_days: 2 }
        },
        twin_health: {
          current_completeness: { overall: 90 },
          total_snapshots: 5,
          total_events: 100
        }
      },
      isLoading: false
    });
    useIntelligenceGaps.mockReturnValue({
      data: {
        gaps: [
          { analysis: 'porter', severity: 'high', reason: 'Falta escaneo de competidores', action: 'run_scan' }
        ]
      },
      isLoading: false
    });
    useIntelligenceRecommendations.mockReturnValue({
      data: {
        recommendations: [
          { analysis: 'swot', priority: 'critical', recommendation: 'Actualizar debilidades', trigger: 'twin_change' }
        ]
      },
      isLoading: false
    });

    render(<IntelligenceHubPage />);
    
    // Check Header
    expect(screen.getByText('Intelligence Hub')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();

    // Check Coverage Matrix
    expect(screen.getByText('PESTEL')).toBeInTheDocument();
    expect(screen.getByText('Fresco')).toBeInTheDocument();

    // Check Recommendations
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
    expect(screen.getByText('Actualizar debilidades')).toBeInTheDocument();
    expect(screen.getByText('🔗 Twin')).toBeInTheDocument();

    // Check Gaps
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('Falta escaneo de competidores')).toBeInTheDocument();
    expect(screen.getByText('▶ Ejecutar escaneo')).toBeInTheDocument();

    // Check Twin Health
    expect(screen.getByText('🏥 Salud del Digital Twin')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
  });

  it('renders empty states when no gaps or recommendations', () => {
    useIntelligenceSummary.mockReturnValue({ data: {}, isLoading: false });
    useIntelligenceGaps.mockReturnValue({ data: { gaps: [] }, isLoading: false });
    useIntelligenceRecommendations.mockReturnValue({ data: { recommendations: [] }, isLoading: false });

    render(<IntelligenceHubPage />);
    
    expect(screen.getByText('No hay brechas de inteligencia — todos los análisis están al día')).toBeInTheDocument();
    expect(screen.getByText('Cobertura completa — sin brechas detectadas')).toBeInTheDocument();
  });
});
