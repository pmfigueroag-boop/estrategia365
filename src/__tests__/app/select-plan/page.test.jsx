import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import SelectPlanPage from '@/app/select-plan/page';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

// Mock dependencias
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  default: {
    getTenantPlans: vi.fn(),
  }
}));

describe('SelectPlanPage', () => {
  let mockPush;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    mockPush = vi.fn();
    useRouter.mockReturnValue({ push: mockPush });
    
    // Reset localStorage
    localStorage.clear();
  });

  test('Renderizado inicial (Loading)', async () => {
    // Retrasar la promesa para probar el estado de loading
    api.getTenantPlans.mockReturnValue(new Promise(resolve => setTimeout(() => resolve([]), 100)));
    
    render(<SelectPlanPage />);
    expect(screen.getByText('Cargando planes estratégicos...')).toBeInTheDocument();
  });

  test('Estado Vacío (0 planes)', async () => {
    api.getTenantPlans.mockResolvedValue([]);
    
    render(<SelectPlanPage />);
    
    // Espera a que se quite el loading
    await waitFor(() => {
      expect(screen.queryByText('Cargando planes estratégicos...')).not.toBeInTheDocument();
      expect(screen.getByText('Sin planes estratégicos')).toBeInTheDocument();
      expect(screen.getByText(/No hay planes estratégicos disponibles en esta organización/i)).toBeInTheDocument();
    });
    
    const continueBtn = screen.getByText('+ Crear mi primer Plan Estratégico');
    expect(continueBtn).toBeInTheDocument();
    
    fireEvent.click(continueBtn);
    expect(mockPush).toHaveBeenCalledWith('/onboarding');
  });

  test('Flujo Estándar (N planes)', async () => {
    const multiplePlans = [
      { id: 'plan-1', mission: 'Misión Uno', time_horizon_months: 12, paradigm_id: 'p1' },
      { id: 'plan-2', mission: 'Misión Dos', time_horizon_months: 24, paradigm_id: 'p2' }
    ];
    api.getTenantPlans.mockResolvedValue(multiplePlans);
    
    render(<SelectPlanPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Cargando planes estratégicos...')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('Selecciona un Plan Estratégico')).toBeInTheDocument();
    expect(screen.getByText('Misión Uno')).toBeInTheDocument();
    expect(screen.getByText('Misión Dos')).toBeInTheDocument();
    expect(screen.getByText('Horizonte: 12 meses')).toBeInTheDocument();
    expect(screen.getByText('Horizonte: 24 meses')).toBeInTheDocument();
  });

  test('Selección Manual de Plan', async () => {
    const multiplePlans = [
      { id: 'plan-1', mission: 'Misión Uno', time_horizon_months: 12, paradigm_id: 'p1' },
      { id: 'plan-2', mission: 'Misión Dos', time_horizon_months: 24, paradigm_id: 'p2' }
    ];
    api.getTenantPlans.mockResolvedValue(multiplePlans);
    
    render(<SelectPlanPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Misión Dos')).toBeInTheDocument();
    });
    
    // Click en la tarjeta de Misión Dos
    const plan2Button = screen.getByText('Misión Dos').closest('button');
    fireEvent.click(plan2Button);
    
    expect(localStorage.getItem('e365_active_plan_id')).toBe('plan-2');
    expect(localStorage.getItem('e365_active_plan_name')).toBe('Misión Dos');
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  test('Manejo de Errores de API', async () => {
    api.getTenantPlans.mockRejectedValue(new Error('API error'));
    
    render(<SelectPlanPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Cargando planes estratégicos...')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('No se pudieron cargar los planes estratégicos. Por favor intenta de nuevo.')).toBeInTheDocument();
  });
  
  test('Navegar volver a selección de tenant', async () => {
    const multiplePlans = [
      { id: 'plan-1', mission: 'Misión Uno', time_horizon_months: 12, paradigm_id: 'p1' },
      { id: 'plan-2', mission: 'Misión Dos', time_horizon_months: 24, paradigm_id: 'p2' }
    ];
    api.getTenantPlans.mockResolvedValue(multiplePlans);
    
    render(<SelectPlanPage />);
    
    await waitFor(() => {
      expect(screen.getByText('← Volver a selección de Organización')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('← Volver a selección de Organización'));
    
    expect(mockPush).toHaveBeenCalledWith('/select-tenant');
  });
});
