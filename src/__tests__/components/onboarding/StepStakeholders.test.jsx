import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StepStakeholders from '@/features/onboarding/components/StepStakeholders';

// Mock the toast and api modules
vi.mock('@/features/plan/context/ToastContext', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() }),
}));

vi.mock('@/core/infrastructure/api', () => ({
  default: {
    getStakeholders: vi.fn().mockResolvedValue([]),
    addStakeholder: vi.fn().mockResolvedValue({ id: 1, name: 'Test', type: 'client', influence: 'medium', interest: 'medium' }),
    deleteStakeholder: vi.fn().mockResolvedValue({}),
  },
}));

describe('StepStakeholders', () => {
  const defaultProps = {
    onPrev: vi.fn(),
    onNext: vi.fn(),
    institutionId: 1,
    stakeholders: [],
    setStakeholders: vi.fn(),
  };

  it('renders stakeholder form', () => {
    render(<StepStakeholders {...defaultProps} />);

    expect(screen.getByText(/Partes Interesadas/i)).toBeInTheDocument();
    expect(screen.getByText(/Nombre \*/i)).toBeInTheDocument();
    expect(screen.getByText('Tipo')).toBeInTheDocument();
    expect(screen.getByText('Influencia')).toBeInTheDocument();
    expect(screen.getByText(/Interés/)).toBeInTheDocument();
  });

  it('renders all stakeholder type options', () => {
    render(<StepStakeholders {...defaultProps} />);

    expect(screen.getByText(/Cliente/)).toBeInTheDocument();
    expect(screen.getByText(/Regulador/)).toBeInTheDocument();
    expect(screen.getByText(/Accionista/)).toBeInTheDocument();
    expect(screen.getByText(/Proveedor/)).toBeInTheDocument();
    expect(screen.getByText(/Aliado/)).toBeInTheDocument();
    expect(screen.getByText(/Comunidad/)).toBeInTheDocument();
    expect(screen.getByText(/Junta Directiva/)).toBeInTheDocument();
  });

  it('renders existing stakeholders', () => {
    const stakeholders = [
      { id: 1, name: 'DGII', type: 'regulator', influence: 'critical', interest: 'high', notes: '' },
      { id: 2, name: 'Clientes', type: 'client', influence: 'high', interest: 'high', notes: 'B2B' },
    ];
    render(<StepStakeholders {...defaultProps} stakeholders={stakeholders} />);

    expect(screen.getByText('DGII')).toBeInTheDocument();
    expect(screen.getByText('Clientes')).toBeInTheDocument();
    expect(screen.getByText(/Stakeholders Registrados \(2\)/)).toBeInTheDocument();
  });

  it('shows empty state when no stakeholders', () => {
    render(<StepStakeholders {...defaultProps} />);
    expect(screen.getByText(/No se han registrado stakeholders/i)).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    render(<StepStakeholders {...defaultProps} />);
    expect(screen.getByText(/← Anterior/)).toBeInTheDocument();
    expect(screen.getByText(/Siguiente →/)).toBeInTheDocument();
  });

  it('renders add button', () => {
    render(<StepStakeholders {...defaultProps} />);
    expect(screen.getByText(/Agregar Stakeholder/i)).toBeInTheDocument();
  });
});
