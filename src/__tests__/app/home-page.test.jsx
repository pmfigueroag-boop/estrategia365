import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from '@/app/page';
import api from '@/lib/api';
import { usePlanContext } from '@/context/PlanContext';
import { useRouter } from 'next/navigation';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/context/PlanContext', () => ({
  usePlanContext: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  default: {
    getWorkspaceSummary: vi.fn(),
    deletePlan: vi.fn(),
    deleteInstitution: vi.fn(),
    updatePlan: vi.fn(),
  }
}));

describe('Home Page (Workspace Summary)', () => {
  const mockRouter = { push: vi.fn() };
  const mockSetPlanId = vi.fn();
  const mockSetInstitutionId = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useRouter.mockReturnValue(mockRouter);
    usePlanContext.mockReturnValue({
      setPlanId: mockSetPlanId,
      setInstitutionId: mockSetInstitutionId,
    });
    // Mock window.confirm
    window.confirm = vi.fn(() => true);
    // Mock localStorage
    Storage.prototype.getItem = vi.fn(() => null);
  });

  it('renders loading state initially', () => {
    // Return a promise that doesn't resolve immediately to keep loading state active
    api.getWorkspaceSummary.mockReturnValue(new Promise(() => {}));
    render(<Home />);
    expect(screen.getByText(/Cargando proyectos/i)).toBeInTheDocument();
  });

  it('renders empty state when no projects exist', async () => {
    api.getWorkspaceSummary.mockResolvedValue([]);
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('Sin proyectos todavía')).toBeInTheDocument();
    });
    expect(screen.getByText(/Presiona "Nuevo Proyecto" arriba/i)).toBeInTheDocument();
  });

  it('renders projects and plans correctly', async () => {
    const mockProjects = [
      {
        id: 1,
        name: 'Global Corp',
        sector: 'private',
        document_count: 5,
        plans: [
          { id: 101, paradigm_id: 'competitive', has_kernel: true, confidence: 0.85, decision_count: 10 }
        ]
      }
    ];
    api.getWorkspaceSummary.mockResolvedValue(mockProjects);
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('Proyectos existentes')).toBeInTheDocument();
    });

    // Check tenant details
    expect(screen.getByText('Global Corp')).toBeInTheDocument();
    expect(screen.getByText('Sector Privado')).toBeInTheDocument();
    expect(screen.getByText(/5 docs/i)).toBeInTheDocument();

    // Check plan details
    expect(screen.getByText('COMPETITIVE')).toBeInTheDocument(); // .toUpperCase()
    expect(screen.getByText('(85%)')).toBeInTheDocument();
    expect(screen.getByText('10 decisiones')).toBeInTheDocument();
  });

  it('navigates to onboarding when Nuevo Proyecto is clicked', async () => {
    api.getWorkspaceSummary.mockResolvedValue([]);
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('Nuevo Proyecto')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Nuevo Proyecto'));
    
    expect(mockSetInstitutionId).toHaveBeenCalledWith(null);
    expect(mockSetPlanId).toHaveBeenCalledWith(null);
    expect(mockRouter.push).toHaveBeenCalledWith('/onboarding');
  });

  it('navigates to strategy when an existing plan is clicked', async () => {
    const mockProjects = [
      {
        id: 1,
        name: 'Global Corp',
        plans: [
          { id: 101, paradigm_id: 'competitive', decision_count: 1 }
        ]
      }
    ];
    api.getWorkspaceSummary.mockResolvedValue(mockProjects);
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('COMPETITIVE')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('COMPETITIVE').closest('button'));
    
    expect(mockSetInstitutionId).toHaveBeenCalledWith(1);
    expect(mockSetPlanId).toHaveBeenCalledWith(101);
    expect(mockRouter.push).toHaveBeenCalledWith('/strategy');
  });

  it('handles project deletion', async () => {
    const mockProjects = [
      {
        id: 1,
        name: 'Global Corp',
        plans: []
      }
    ];
    api.getWorkspaceSummary.mockResolvedValue(mockProjects);
    api.deleteInstitution.mockResolvedValue();
    
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('Global Corp')).toBeInTheDocument();
    });

    const deleteBtn = screen.getByTitle('Eliminar proyecto "Global Corp"');
    fireEvent.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalled();
    expect(api.deleteInstitution).toHaveBeenCalledWith(1);

    await waitFor(() => {
      expect(screen.queryByText('Global Corp')).not.toBeInTheDocument();
    });
  });

  it('handles error state when API fails', async () => {
    api.getWorkspaceSummary.mockRejectedValue(new Error('Network error'));
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText(/No se pudo conectar al servidor/i)).toBeInTheDocument();
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });
});
