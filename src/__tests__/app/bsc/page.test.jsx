import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import BSCPage from '@/app/bsc/page';
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
    createBsc: vi.fn(),
    synthesizeBsc: vi.fn(),
  }
}));

// Mock child components
vi.mock('@/components/execution/BscPerspectives', () => ({
  default: () => <div data-testid="mock-bsc-perspectives" />
}));
vi.mock('@/components/execution/StrategyMap', () => ({
  default: () => <div data-testid="mock-strategy-map" />
}));
vi.mock('@/components/execution/BscForm', () => ({
  default: ({ onSubmit, onCancel }) => (
    <div data-testid="mock-bsc-form">
      <button onClick={() => onSubmit({ name: 'New KPI' })}>Submit KPI</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}));
vi.mock('@/components/charts', () => ({
  BscGauge: () => <div data-testid="mock-bsc-gauge" />
}));

describe('BSCPage', () => {
  const mockToast = { success: vi.fn(), error: vi.fn(), warning: vi.fn() };
  const mockMutateBsc = vi.fn();
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    useToast.mockReturnValue(mockToast);
    usePlanContext.mockReturnValue({
      planId: 'plan-123',
    });
    
    // Default SWR mocks
    swrHooks.useBsc.mockReturnValue({
      data: [],
      mutate: mockMutateBsc,
      isLoading: false,
    });
    swrHooks.useProgress.mockReturnValue({
      data: { objectives: [] },
    });
  });

  it('renders empty state if no plan is active', () => {
    usePlanContext.mockReturnValue({ planId: null });
    render(<BSCPage />);
    expect(screen.getByText(/No hay un plan activo/i)).toBeInTheDocument();
  });

  it('renders loading state', () => {
    swrHooks.useBsc.mockReturnValue({
      data: [],
      mutate: mockMutateBsc,
      isLoading: true, // loading
    });
    render(<BSCPage />);
    expect(screen.getByText(/Cargando datos del BSC.../i)).toBeInTheDocument();
  });

  it('renders default BSC tab', () => {
    render(<BSCPage />);
    expect(screen.getByRole('heading', { name: /Diseño de Arquitectura Estratégica/i })).toBeInTheDocument();
    
    // Default tab components should be visible
    expect(screen.getByTestId('mock-bsc-gauge')).toBeInTheDocument();
    expect(screen.getByTestId('mock-bsc-perspectives')).toBeInTheDocument();
    
    // Strategy Map should not be visible
    expect(screen.queryByTestId('mock-strategy-map')).not.toBeInTheDocument();
  });

  it('switches to Strategy Map tab', () => {
    render(<BSCPage />);
    
    const mapTab = screen.getByRole('button', { name: /Mapa Estratégico/i });
    fireEvent.click(mapTab);
    
    expect(screen.getByTestId('mock-strategy-map')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-bsc-perspectives')).not.toBeInTheDocument();
  });

  it('toggles BSC form', () => {
    render(<BSCPage />);
    
    const createBtn = screen.getByRole('button', { name: /Crear KPI/i });
    fireEvent.click(createBtn);
    
    // Form should appear
    expect(screen.getByTestId('mock-bsc-form')).toBeInTheDocument();
    
    // Cancel form
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);
    
    expect(screen.queryByTestId('mock-bsc-form')).not.toBeInTheDocument();
  });

  it('submits new KPI', async () => {
    api.createBsc.mockResolvedValue({});
    
    render(<BSCPage />);
    
    // Open form
    fireEvent.click(screen.getByRole('button', { name: /Crear KPI/i }));
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Submit KPI/i }));
    
    await waitFor(() => {
      expect(api.createBsc).toHaveBeenCalledWith('plan-123', { name: 'New KPI' });
      expect(mockMutateBsc).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith('KPI BSC creado');
      expect(screen.queryByTestId('mock-bsc-form')).not.toBeInTheDocument();
    });
  });

  it('synthesizes BSC', async () => {
    api.synthesizeBsc.mockResolvedValue({ kpis_created: 5 });
    
    render(<BSCPage />);
    
    const synthesizeBtn = screen.getByRole('button', { name: /Sintetizar BSC/i });
    fireEvent.click(synthesizeBtn);
    
    expect(screen.getByRole('button', { name: /Generando BSC/i })).toBeInTheDocument();
    
    await waitFor(() => {
      expect(api.synthesizeBsc).toHaveBeenCalledWith('plan-123');
      expect(mockMutateBsc).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith('5 KPIs BSC generados desde Formulación P2W.');
    });
  });
});
