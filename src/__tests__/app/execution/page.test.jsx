import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ExecutionPage from '@/app/execution/page';
import { usePlanContext } from '@/features/plan/context/PlanContext';
import { useToast } from '@/features/plan/context/ToastContext';
import * as swrHooks from '@/lib/swr-hooks';
import api from '@/lib/api';

// Mocks
vi.mock('@/context/PlanContext');
vi.mock('@/context/ToastContext');
vi.mock('@/lib/swr-hooks');
vi.mock('@/lib/api', () => ({
  default: {
    createObjective: vi.fn(),
    synthesizeOkrs: vi.fn(),
  }
}));

// Mock child components
vi.mock('@/components/execution/ObjectiveCard', () => ({
  default: ({ obj }) => <div data-testid="mock-objective-card">{obj.title}</div>
}));
vi.mock('@/components/execution/OkrForm', () => ({
  default: ({ onSubmit, onCancel }) => (
    <div data-testid="mock-okr-form">
      <button onClick={() => onSubmit({ title: 'New Objective' })}>Submit Objective</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}));

describe('ExecutionPage', () => {
  const mockToast = { success: vi.fn(), error: vi.fn(), warning: vi.fn() };
  const mockMutateProgress = vi.fn();
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    useToast.mockReturnValue(mockToast);
    usePlanContext.mockReturnValue({
      planId: 'plan-123',
    });
    
    // Default SWR mocks
    swrHooks.useProgress.mockReturnValue({
      data: {
        overall_progress: 45,
        total_objectives: 2,
        total_key_results: 5,
        objectives: [
          { id: 1, title: 'Obj 1' },
          { id: 2, title: 'Obj 2' }
        ]
      },
      mutate: mockMutateProgress,
      isLoading: false,
    });
  });

  it('renders empty state if no plan is active', () => {
    usePlanContext.mockReturnValue({ planId: null });
    render(<ExecutionPage />);
    expect(screen.getByText(/No hay un plan activo/i)).toBeInTheDocument();
  });

  it('renders loading state', () => {
    swrHooks.useProgress.mockReturnValue({
      data: null,
      mutate: mockMutateProgress,
      isLoading: true,
    });
    render(<ExecutionPage />);
    expect(screen.getByText(/Cargando datos de ejecución/i)).toBeInTheDocument();
  });

  it('renders main dashboard with global progress', () => {
    render(<ExecutionPage />);
    
    expect(screen.getByRole('heading', { name: /Ejecución Ágil de OKRs/i })).toBeInTheDocument();
    
    // Overall Progress
    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText('2 objetivos · 5 key results')).toBeInTheDocument();
    
    // Rendered Objectives
    expect(screen.getByText('Obj 1')).toBeInTheDocument();
    expect(screen.getByText('Obj 2')).toBeInTheDocument();
  });

  it('toggles OKR form', () => {
    render(<ExecutionPage />);
    
    const createBtn = screen.getByRole('button', { name: /Crear Manual/i });
    fireEvent.click(createBtn);
    
    // Form should appear
    expect(screen.getByTestId('mock-okr-form')).toBeInTheDocument();
    
    // Cancel form
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);
    
    expect(screen.queryByTestId('mock-okr-form')).not.toBeInTheDocument();
  });

  it('submits new Objective', async () => {
    api.createObjective.mockResolvedValue({});
    
    render(<ExecutionPage />);
    
    // Open form
    fireEvent.click(screen.getByRole('button', { name: /Crear Manual/i }));
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Submit Objective/i }));
    
    await waitFor(() => {
      expect(api.createObjective).toHaveBeenCalledWith('plan-123', { title: 'New Objective' });
      expect(mockMutateProgress).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith('Objetivo creado');
      expect(screen.queryByTestId('mock-okr-form')).not.toBeInTheDocument();
    });
  });

  it('synthesizes OKRs from Formulation', async () => {
    api.synthesizeOkrs.mockResolvedValue({ objectives_created: 3 });
    
    render(<ExecutionPage />);
    
    const synthesizeBtn = screen.getByRole('button', { name: /Sintetizar OKRs/i });
    fireEvent.click(synthesizeBtn);
    
    // Should be in loading state
    expect(screen.getByRole('button', { name: /Generando OKRs/i })).toBeInTheDocument();
    
    await waitFor(() => {
      expect(api.synthesizeOkrs).toHaveBeenCalledWith('plan-123');
      expect(mockMutateProgress).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith('3 OKRs generados desde Formulación + Kernel.');
    });
  });
});
