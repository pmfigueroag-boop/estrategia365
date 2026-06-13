import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import AlignmentPage from '@/app/alignment/page';
import { usePlanContext } from '@/features/plan/context/PlanContext';
import { useToast } from '@/features/plan/context/ToastContext';
import * as swrHooks from '@/features/shared/hooks/swr-hooks';
import api from '@/core/infrastructure/api';

// Mocks
vi.mock('@/features/plan/context/PlanContext');
vi.mock('@/features/plan/context/ToastContext');
vi.mock('@/features/shared/hooks/swr-hooks');
vi.mock('@/core/infrastructure/api', () => ({
  default: {
    diagnoseSevenS: vi.fn(),
  }
}));

// Mock the Recharts Radar component to avoid measuring/layout issues in jsdom
vi.mock('@/features/charts/components', () => ({
  SevenSRadar: () => <div data-testid="radar-mock" />
}));

describe('AlignmentPage', () => {
  const mockToast = { success: vi.fn(), error: vi.fn(), warning: vi.fn() };
  const mockMutate = vi.fn();
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    useToast.mockReturnValue(mockToast);
    usePlanContext.mockReturnValue({
      planId: 'plan-123',
    });
    
    // Default SWR mock
    swrHooks.useSevenS.mockReturnValue({
      data: [],
      mutate: mockMutate,
      isLoading: false,
    });
  });

  it('renders empty state if no plan is active', () => {
    usePlanContext.mockReturnValue({ planId: null });
    render(<AlignmentPage />);
    expect(screen.getByText(/No hay un plan activo/i)).toBeInTheDocument();
  });

  it('renders initial state without diagnostics', () => {
    render(<AlignmentPage />);
    expect(screen.getByRole('heading', { name: /Alineación Organizacional/i })).toBeInTheDocument();
    expect(screen.getByText(/Presiona "Diagnosticar con IA"/i)).toBeInTheDocument();
    // Radar should not be there
    expect(screen.queryByTestId('radar-mock')).not.toBeInTheDocument();
  });

  it('renders diagnostics data when available', () => {
    const mockDiagnostics = [
      { dimension: 'strategy', score: 4, notes: 'Estrategia clara', gap_analysis: 'Brecha leve en skills' },
      { dimension: 'structure', score: 3, notes: 'Estructura algo rígida' },
      { dimension: 'systems', score: 5, notes: 'Sistemas óptimos' },
      { dimension: 'shared_values', score: 2, notes: 'Cultura en transición' },
      { dimension: 'style', score: 4, notes: 'Buen liderazgo' },
      { dimension: 'staff', score: 3, notes: 'Falta personal clave' },
      { dimension: 'skills', score: 2, notes: 'Necesidad de capacitación' },
    ];
    swrHooks.useSevenS.mockReturnValue({
      data: mockDiagnostics,
      mutate: mockMutate,
      isLoading: false,
    });

    render(<AlignmentPage />);
    
    // Radar should be rendered
    expect(screen.getByTestId('radar-mock')).toBeInTheDocument();
    
    // Check Average Score: (4+3+5+2+4+3+2) / 7 = 23 / 7 = 3.285 -> "3.3"
    expect(screen.getByText('3.3/5')).toBeInTheDocument();
    
    // Check individual score values and labels
    expect(screen.getByText('Estrategia clara')).toBeInTheDocument();
    expect(screen.getByText('Brecha leve en skills')).toBeInTheDocument(); // Gap analysis
  });

  it('calls diagnoseSevenS API and mutates data on click', async () => {
    // Initial empty state
    swrHooks.useSevenS.mockReturnValue({
      data: [],
      mutate: mockMutate,
    });

    const mockResponse = [{ dimension: 'strategy', score: 5, gap_analysis: 'Mocked gap' }];
    api.diagnoseSevenS.mockResolvedValue(mockResponse);

    render(<AlignmentPage />);

    const diagnoseBtn = screen.getByRole('button', { name: /Diagnosticar con IA/i });
    fireEvent.click(diagnoseBtn);

    // Should show loading text immediately
    expect(screen.getByRole('button', { name: /Diagnosticando/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(api.diagnoseSevenS).toHaveBeenCalledWith('plan-123');
      expect(mockMutate).toHaveBeenCalledWith(mockResponse, false);
      expect(mockToast.success).toHaveBeenCalledWith(expect.stringContaining('Diagnóstico 7S completado'));
    });
  });

  it('shows error toast if diagnoseSevenS API fails', async () => {
    swrHooks.useSevenS.mockReturnValue({
      data: [],
      mutate: mockMutate,
    });

    api.diagnoseSevenS.mockRejectedValue(new Error('Network error'));

    render(<AlignmentPage />);

    const diagnoseBtn = screen.getByRole('button', { name: /Diagnosticar con IA/i });
    fireEvent.click(diagnoseBtn);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Network error');
    });
  });
});
