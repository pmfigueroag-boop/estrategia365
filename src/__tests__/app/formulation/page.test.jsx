import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import FormulationPage from '@/app/formulation/page';
import { usePlanContext } from '@/features/plan/context/PlanContext';
import { useToast } from '@/features/plan/context/ToastContext';
import api from '@/core/infrastructure/api';

// Mocks
vi.mock('@/features/plan/context/PlanContext');
vi.mock('@/features/plan/context/ToastContext');
vi.mock('@/core/infrastructure/api', () => ({
  default: {
    getPlans: vi.fn(),
    updatePlan: vi.fn(),
    extractFormulation: vi.fn(),
    synthesizeFormulation: vi.fn(),
  }
}));

// Mock DiagnosticReadiness component to avoid deeper rendering issues
vi.mock('@/components/layout/DiagnosticReadiness', () => ({
  default: () => <div data-testid="readiness-mock" />
}));

describe('FormulationPage', () => {
  const mockToast = { success: vi.fn(), error: vi.fn(), warning: vi.fn() };
  
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  beforeEach(() => {
    useToast.mockReturnValue(mockToast);
    usePlanContext.mockReturnValue({
      planId: 'plan-123',
      institutionId: 'inst-1',
      setPlanId: vi.fn()
    });
    
    // Default API mock implementations
    api.getPlans.mockResolvedValue([
      { id: 'plan-123', paradigm_id: 'competitive', mission: 'Mision Test', vision: 'Vision Test', created_at: '2026-01-01T00:00:00Z' },
      { id: 'plan-456', paradigm_id: 'cepal', mission: 'Mision Publica', vision: 'Vision Publica', created_at: '2026-01-02T00:00:00Z' }
    ]);
  });

  it('renders loading state initially', () => {
    // API is not yet resolved in this render tick
    render(<FormulationPage />);
    expect(screen.getByText(/Cargando planes.../i)).toBeInTheDocument();
  });

  it('renders plan selector if no plan is selected in context/localStorage', async () => {
    // Clear localStorage to simulate no active plan
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    
    render(<FormulationPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Selecciona un plan existente/i)).toBeInTheDocument();
      expect(screen.getByText('Plan #plan-123')).toBeInTheDocument();
      expect(screen.getByText('Plan #plan-456')).toBeInTheDocument();
    });
  });

  it('auto-selects plan if stored in localStorage', async () => {
    localStorage.setItem('current_plan_id', 'plan-123');

    render(<FormulationPage />);

    await waitFor(() => {
      // Check that it skipped the selector and shows the form
      expect(screen.getByText(/Strategic Formulation & Choice/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('Mision Test')).toBeInTheDocument();
    });
  });

  it('calls extractFormulation when clicking "Extraer de Docs"', async () => {
    api.extractFormulation.mockResolvedValue({
      mission: 'Mision extraida',
      vision: 'Vision extraida'
    });

    render(<FormulationPage />);
    
    // Select plan manually
    const planBtn = await screen.findByText('Plan #plan-123');
    fireEvent.click(planBtn);

    await waitFor(() => {
      expect(screen.getByText(/Strategic Formulation & Choice/i)).toBeInTheDocument();
    });

    const extractBtn = screen.getByText(/Extraer de Docs/i);
    fireEvent.click(extractBtn);

    await waitFor(() => {
      expect(api.extractFormulation).toHaveBeenCalledWith('inst-1');
      expect(mockToast.success).toHaveBeenCalledWith(expect.stringContaining('Formulación extraída'));
      // The textareas should update
      expect(screen.getByDisplayValue('Mision extraida')).toBeInTheDocument();
    });
  });

  it('calls synthesizeFormulation when clicking "Sintetizar desde Diagnóstico"', async () => {
    api.synthesizeFormulation.mockResolvedValue({
      where_to_play: 'Mercado global',
      how_to_win: 'Liderazgo en costos',
      modules_used: { PESTEL: 12, Porter: 5 }
    });

    render(<FormulationPage />);
    
    // Select plan manually
    const planBtn = await screen.findByText('Plan #plan-123');
    fireEvent.click(planBtn);

    await waitFor(() => {
      expect(screen.getByText(/Strategic Formulation & Choice/i)).toBeInTheDocument();
    });

    const synthesizeBtn = screen.getByText(/Sintetizar desde Diagnóstico/i);
    fireEvent.click(synthesizeBtn);

    await waitFor(() => {
      expect(api.synthesizeFormulation).toHaveBeenCalledWith('plan-123');
      expect(mockToast.success).toHaveBeenCalledWith(expect.stringContaining('sintetizada'));
      expect(screen.getByDisplayValue('Mercado global')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Liderazgo en costos')).toBeInTheDocument();
      // Verify modules badge rendering
      expect(screen.getByText(/PESTEL \(12\)/i)).toBeInTheDocument();
    });
  });

  it('calls updatePlan when clicking "Guardar Formulación"', async () => {
    api.updatePlan.mockResolvedValue({ id: 'plan-123' });

    render(<FormulationPage />);
    
    // Select plan manually
    const planBtn = await screen.findByText('Plan #plan-123');
    fireEvent.click(planBtn);

    await waitFor(() => {
      expect(screen.getByText(/Strategic Formulation & Choice/i)).toBeInTheDocument();
    });

    // Click the badge or button to change plan? No, the save button!
    const saveBtn = screen.getByText(/Guardar Formulación/i);
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(api.updatePlan).toHaveBeenCalledWith('plan-123', expect.objectContaining({
        mission: 'Mision Test',
        vision: 'Vision Test',
        paradigm_id: 'competitive'
      }));
      expect(mockToast.success).toHaveBeenCalledWith(expect.stringContaining('Plan actualizado'));
    });
  });

  it('renders CEPAL/MEPYD paradigm if selected plan is public sector', async () => {
    render(<FormulationPage />);
    
    // Select the public sector plan
    const planBtn = await screen.findByText('Plan #plan-456');
    fireEvent.click(planBtn);
    
    await waitFor(() => {
      // Check for public sector wording
      expect(screen.getByText(/Formulación del Plan \(SNPIP\/ILPES\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Misión Institucional/i)).toBeInTheDocument();
      expect(screen.getByText(/Visión de Desarrollo/i)).toBeInTheDocument();
    });
  });
});
