import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import DashboardPage from '@/app/dashboard/page';
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
    runMonteCarlo: vi.fn(),
    runBayesianUpdate: vi.fn(),
  }
}));

// Mock child components
vi.mock('@/components/charts', () => ({
  ObjectivesPie: () => <div data-testid="mock-objectives-pie" />,
  PestelSeverityBar: () => <div data-testid="mock-pestel-severity-bar" />,
}));

const MOCK_DASHBOARD_DATA = {
  plan_id: 'plan-123',
  mission: 'Mock Mission',
  has_kernel: true,
  has_pulse: true,
  audit_chain_valid: true,
  kernel_confidence: 0.85,
  kernel_diagnosis: 'Mock diagnosis',
  pulse_overall: 80,
  pulse_phase: 'execute',
  pulse_execution_health: 75,
  pulse_alignment: 85,
  pulse_adaptability: 90,
  pulse_drift_count: 0,
  total_decisions: 10,
  decisions_approved_pct: 60,
  capability_gaps_count: 2,
  risk_nodes_count: 1,
  causal_chains_count: 5,
  total_objectives: 15,
  avg_kr_progress: 55,
  pestel_signal_count: 8,
  red_team_attacks: 0,
  porter_avg_score: 3.5,
  swot_counts: { strength: 3, weakness: 2, opportunity: 4, threat: 1 },
  bsc_avg_progress: 60,
  bsc_perspectives_count: 12,
  seven_s_avg_score: 4.2,
  seven_s_completed: true,
  objectives_by_status: { in_progress: 10, completed: 5 },
  top_risks: [
    { id: 1, factor: 'ECON', title: 'Inflación', strategic_impact: 'Alto' }
  ]
};

describe('DashboardPage', () => {
  const mockToast = { success: vi.fn(), error: vi.fn(), warning: vi.fn() };
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    useToast.mockReturnValue(mockToast);
    usePlanContext.mockReturnValue({
      planId: 'plan-123',
    });
    
    // Default SWR mocks
    swrHooks.useDashboard.mockReturnValue({
      data: MOCK_DASHBOARD_DATA,
      isLoading: false,
    });
  });

  it('renders empty state if no plan is active', () => {
    usePlanContext.mockReturnValue({ planId: null });
    render(<DashboardPage />);
    expect(screen.getByText(/No hay un plan activo/i)).toBeInTheDocument();
  });

  it('renders loading state', () => {
    swrHooks.useDashboard.mockReturnValue({
      data: null,
      isLoading: true,
    });
    render(<DashboardPage />);
    expect(screen.getByText(/Cargando dashboard/i)).toBeInTheDocument();
  });

  it('renders main dashboard with mission and pulse', () => {
    render(<DashboardPage />);
    
    expect(screen.getByRole('heading', { name: /Command Center/i })).toBeInTheDocument();
    expect(screen.getByText('Mock Mission')).toBeInTheDocument();
    
    // Pulse
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('Fase: EXECUTE')).toBeInTheDocument();
  });

  it('renders audit chain error if audit_chain_valid is false', () => {
    swrHooks.useDashboard.mockReturnValue({
      data: { ...MOCK_DASHBOARD_DATA, audit_chain_valid: false, audit_chain_errors: 'Cryptographic hash mismatch' },
      isLoading: false,
    });
    render(<DashboardPage />);
    
    expect(screen.getByText('🚨 CADENA DE AUDITORÍA COMPROMETIDA')).toBeInTheDocument();
    expect(screen.getByText('Cryptographic hash mismatch')).toBeInTheDocument();
  });

  it('simulates Monte Carlo stochastic risk', async () => {
    api.runMonteCarlo.mockResolvedValue({
      portfolio: { mean: '+15.2%', VaR_95: '-5.1%', std: '2.3%' },
      risk_assessment: 'LOW_VARIANCE'
    });
    
    render(<DashboardPage />);
    
    // Click run
    const runBtn = screen.getByRole('button', { name: /Ejecutar Simulación/i });
    fireEvent.click(runBtn);
    
    expect(screen.getByRole('button', { name: /Simulando/i })).toBeInTheDocument();
    
    await waitFor(() => {
      expect(api.runMonteCarlo).toHaveBeenCalledWith('plan-123', 1000);
      expect(mockToast.success).toHaveBeenCalledWith('Simulación Monte Carlo completada (1000 iteraciones).');
      // Assert DOM
      expect(screen.getByText('+15.2%')).toBeInTheDocument();
      expect(screen.getByText('-5.1%')).toBeInTheDocument();
    });
  });

  it('recalibrates Bayesian Confidence', async () => {
    api.runBayesianUpdate.mockResolvedValue({ new_confidence: 0.92 });
    
    render(<DashboardPage />);
    
    // Check initial confidence
    expect(screen.getAllByText('85%').length).toBeGreaterThan(0); // initial is 0.85
    
    // Click recalibrate
    const recalcBtn = screen.getByRole('button', { name: /Recalibrar con Evidencia/i });
    fireEvent.click(recalcBtn);
    
    expect(screen.getByRole('button', { name: /Recalibrando/i })).toBeInTheDocument();
    
    await waitFor(() => {
      expect(api.runBayesianUpdate).toHaveBeenCalledWith('plan-123');
      expect(mockToast.success).toHaveBeenCalledWith('Confianza recalibrada por empirismo: 92%');
      // UI should update to 92%
      expect(screen.getByText('92%')).toBeInTheDocument();
    });
  });
});
