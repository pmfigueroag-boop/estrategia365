import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import StrategyPage from '@/app/strategy/page';
import { usePlanContext } from '@/context/PlanContext';
import { useToast } from '@/context/ToastContext';
import * as swrHooks from '@/lib/swr-hooks';
import api from '@/lib/api';

// Mocks
vi.mock('@/context/PlanContext');
vi.mock('@/context/ToastContext');
vi.mock('@/lib/swr-hooks');
vi.mock('@/lib/api', () => ({
  default: {
    generateKernel: vi.fn(),
    updateDecisionStatus: vi.fn(),
    generateCausal: vi.fn(),
    generatePulse: vi.fn(),
    generateGraph: vi.fn(),
    optimizePortfolio: vi.fn(),
  }
}));

// Mock child components to isolate the routing shell logic
vi.mock('@/components/strategy', () => ({
  KernelDiagnosis: () => <div data-testid="mock-kernel-diagnosis">KernelDiagnosis</div>,
  DecisionTable: ({ onStatusChange }) => (
    <div data-testid="mock-decision-table">
      DecisionTable
      <button onClick={() => onStatusChange(1, 'rejected')}>Mock Reject Decision</button>
    </div>
  ),
  DecisionGraph: () => <div data-testid="mock-decision-graph">DecisionGraph</div>,
  CausalChains: () => <div data-testid="mock-causal-chains">CausalChains</div>,
  StrategyPulse: () => <div data-testid="mock-strategy-pulse">StrategyPulse</div>,
  PortfolioOptimizer: () => <div data-testid="mock-portfolio-optimizer">PortfolioOptimizer</div>,
  CapabilityGaps: () => <div data-testid="mock-capability-gaps">CapabilityGaps</div>,
  RiskNodes: () => <div data-testid="mock-risk-nodes">RiskNodes</div>,
  DecisionApprovalModal: () => <div data-testid="mock-approval-modal">DecisionApprovalModal</div>,
}));

const MOCK_KERNEL_DATA = {
  id: 1,
  confidence_score: 0.85,
  decisions: [{ id: 1, title: 'Decision 1', status: 'proposed' }],
  capability_gaps: [{ id: 1 }],
  risk_nodes: [{ id: 1 }],
};

describe('StrategyPage', () => {
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
    swrHooks.useKernel.mockReturnValue({ data: MOCK_KERNEL_DATA, isLoading: false, mutate: vi.fn() });
    swrHooks.useCausal.mockReturnValue({ data: { chains: [{ id: 1 }] }, mutate: vi.fn() });
    swrHooks.usePulses.mockReturnValue({ data: [{ overall_pulse: 80 }], mutate: vi.fn() });
    swrHooks.useGraph.mockReturnValue({ data: { edges: [{ source: 1, target: 2 }] }, mutate: vi.fn() });
  });

  it('renders landing screen if no kernel exists', () => {
    swrHooks.useKernel.mockReturnValue({ data: null, isLoading: false, mutate: vi.fn() });
    render(<StrategyPage />);
    expect(screen.getByText('🧠 Strategy Decision Core')).toBeInTheDocument();
    expect(screen.getByText(/¿Qué decisión debo tomar ahora\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generar Strategy Kernel/i })).toBeInTheDocument();
  });

  it('simulates kernel generation', async () => {
    swrHooks.useKernel.mockReturnValue({ data: null, isLoading: false, mutate: vi.fn() });
    api.generateKernel.mockResolvedValue({ id: 999 });
    
    render(<StrategyPage />);
    const genBtn = screen.getByRole('button', { name: /Generar Strategy Kernel/i });
    fireEvent.click(genBtn);
    
    await waitFor(() => {
      expect(api.generateKernel).toHaveBeenCalledWith('plan-123');
      expect(mockToast.success).toHaveBeenCalledWith(expect.stringContaining('Strategy Kernel generado'));
    });
  });

  it('renders main view with tabs if kernel exists', () => {
    render(<StrategyPage />);
    // Check header
    expect(screen.getByText('Decisiones estratégicas priorizadas — Confianza: 85%')).toBeInTheDocument();
    // Check Kernel component
    expect(screen.getByTestId('mock-kernel-diagnosis')).toBeInTheDocument();
    
    // Check tabs render counts
    expect(screen.getByRole('button', { name: /Decisiones \(1\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Optimizar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Grafo \(1\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Causal \(1\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pulso \(80%\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Brechas \(1\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Riesgos \(1\)/i })).toBeInTheDocument();
  });

  it('navigates between views (tabs)', () => {
    render(<StrategyPage />);
    
    // Default view is decisions
    expect(screen.getByTestId('mock-decision-table')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-portfolio-optimizer')).not.toBeInTheDocument();
    
    // Click optimizer tab
    fireEvent.click(screen.getByRole('button', { name: /Optimizar/i }));
    
    expect(screen.queryByTestId('mock-decision-table')).not.toBeInTheDocument();
    expect(screen.getByTestId('mock-portfolio-optimizer')).toBeInTheDocument();
    
    // Click causal tab
    fireEvent.click(screen.getByRole('button', { name: /Causal \(1\)/i }));
    expect(screen.getByTestId('mock-causal-chains')).toBeInTheDocument();
  });

  it('handles decision status change from child component', async () => {
    const mockMutateKernel = vi.fn();
    swrHooks.useKernel.mockReturnValue({ data: MOCK_KERNEL_DATA, isLoading: false, mutate: mockMutateKernel });
    api.updateDecisionStatus.mockResolvedValue({});
    
    render(<StrategyPage />);
    
    const rejectBtn = screen.getByRole('button', { name: 'Mock Reject Decision' });
    fireEvent.click(rejectBtn);
    
    await waitFor(() => {
      expect(api.updateDecisionStatus).toHaveBeenCalledWith(1, { status: 'rejected', human_validation_note: expect.any(String) });
      expect(mockMutateKernel).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith('Decisión actualizada: ❌ Rechazada');
    });
  });
});
