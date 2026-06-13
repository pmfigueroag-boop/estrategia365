import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SimulationPage from '../../../../app/strategy/simulation/page';
import api from '@/lib/api';
import { usePlanContext } from '@/context/PlanContext';
import { useToast } from '@/context/ToastContext';

vi.mock('@/lib/api', () => ({
  default: {
    getEsvComparison: vi.fn(),
    getCausalValidation: vi.fn(),
    getWargameSessions: vi.fn(),
    runMonteCarlo: vi.fn(),
    simulate: vi.fn(),
    runDevilsAdvocate: vi.fn(),
  }
}));

vi.mock('@/context/PlanContext', () => ({
  usePlanContext: vi.fn()
}));

vi.mock('@/context/ToastContext', () => ({
  useToast: vi.fn()
}));

describe('Wargaming & Simulation Engine Dashboard', () => {
  const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useToast.mockReturnValue(mockToast);
    
    // Default mock implementation
    api.getEsvComparison.mockResolvedValue({ verdict: 'NO_DATA' });
    api.getCausalValidation.mockResolvedValue({ total_chains: 5, validated: 4, broken: 1, validation_score: 80, verdict: 'VALID' });
    api.getWargameSessions.mockResolvedValue([{ id: 'sess-1', scenario: 'test' }]);
  });

  it('should show empty state if no active plan', () => {
    usePlanContext.mockReturnValue({ planId: null });
    render(<SimulationPage />);
    expect(screen.getByText(/No hay plan activo/i)).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    usePlanContext.mockReturnValue({ planId: 'plan-123' });
    // Let promises hang to check loading state
    let resolveWg;
    api.getWargameSessions.mockReturnValue(new Promise(resolve => { resolveWg = resolve; }));
    
    render(<SimulationPage />);
    expect(screen.getByText(/Cargando laboratorio de simulación/i)).toBeInTheDocument();
    
    resolveWg([]); // cleanup
  });

  it('should render Wargaming Simulation Dashboard and navigate tabs', async () => {
    usePlanContext.mockReturnValue({ planId: 'plan-123' });
    render(<SimulationPage />);

    // Wait for hydration
    await waitFor(() => {
      expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument();
    });

    // Default view is Monte Carlo
    expect(screen.getByText(/Simulación Monte Carlo/i)).toBeInTheDocument();

    // Switch to Wargaming tab
    fireEvent.click(screen.getByRole('button', { name: /Wargaming/i }));
    
    // Verify Wargaming view
    expect(screen.getByText(/Wargaming — Simulación Competitiva/i)).toBeInTheDocument();
  });

  it('should trigger Wargame Run on button click', async () => {
    usePlanContext.mockReturnValue({ planId: 'plan-123' });
    api.simulate.mockResolvedValue({ result: 'Competitor loses market share.' });

    render(<SimulationPage />);

    await waitFor(() => {
      expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument();
    });

    // Switch to Wargaming tab
    fireEvent.click(screen.getByRole('button', { name: /Wargaming/i }));

    // Input scenario
    const input = screen.getByPlaceholderText(/Un competidor lanza un producto/i);
    fireEvent.change(input, { target: { value: 'New competitor entry' } });

    // Click Simular
    fireEvent.click(screen.getByRole('button', { name: /🎮 Simular/i }));

    await waitFor(() => {
      expect(api.simulate).toHaveBeenCalledWith('plan-123', 'New competitor entry');
    });

    // Verify result is rendered
    await waitFor(() => {
      expect(screen.getByText(/Competitor loses market share/i)).toBeInTheDocument();
    });
    
    expect(mockToast.success).toHaveBeenCalledWith('Simulación completada.');
  });

  it('should trigger Devils Advocate on button click', async () => {
    usePlanContext.mockReturnValue({ planId: 'plan-123' });
    api.runDevilsAdvocate.mockResolvedValue({ flaws: ['Price too high'] });

    render(<SimulationPage />);

    await waitFor(() => {
      expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Wargaming/i }));

    fireEvent.click(screen.getByRole('button', { name: /Devil's Advocate/i }));

    await waitFor(() => {
      expect(api.runDevilsAdvocate).toHaveBeenCalledWith('plan-123');
    });

    await waitFor(() => {
      expect(screen.getByText(/Price too high/i)).toBeInTheDocument();
    });
  });
});
