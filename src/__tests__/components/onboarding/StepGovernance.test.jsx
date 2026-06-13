import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StepGovernance from '@/features/onboarding/components/StepGovernance';

vi.mock('@/features/plan/context/ToastContext', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() }),
}));

vi.mock('@/core/infrastructure/api', () => ({
  default: {
    updateGovernance: vi.fn().mockResolvedValue({}),
    addOrgUnit: vi.fn().mockResolvedValue({ id: 1, name: 'IT', type: 'department' }),
    deleteOrgUnit: vi.fn().mockResolvedValue({}),
    addCapability: vi.fn().mockResolvedValue({ id: 1, capability: 'Test', maturity_level: 'developing', criticality: 'medium' }),
    deleteCapability: vi.fn().mockResolvedValue({}),
  },
}));

describe('StepGovernance', () => {
  const defaultProps = {
    onPrev: vi.fn(), onNext: vi.fn(), institutionId: 1,
    governance: null, setGovernance: vi.fn(),
    orgUnits: [], setOrgUnits: vi.fn(),
    capabilities: [], setCapabilities: vi.fn(),
  };

  it('renders governance section', () => {
    render(<StepGovernance {...defaultProps} />);
    expect(screen.getByText(/Gobernanza & Talento/)).toBeInTheDocument();
    expect(screen.getByText(/Estructura de Gobierno/)).toBeInTheDocument();
    expect(screen.getByText(/Líder Ejecutivo/)).toBeInTheDocument();
  });

  it('renders authority structure options', () => {
    render(<StepGovernance {...defaultProps} />);
    expect(screen.getByText('🏛️ Centralizado')).toBeInTheDocument();
    expect(screen.getByText('🌐 Descentralizado')).toBeInTheDocument();
    expect(screen.getByText('📐 Matricial')).toBeInTheDocument();
    expect(screen.getByText('🔄 Híbrido')).toBeInTheDocument();
  });

  it('renders decision speed options', () => {
    render(<StepGovernance {...defaultProps} />);
    expect(screen.getByText('⚡ Rápida')).toBeInTheDocument();
    expect(screen.getByText('⏱️ Moderada')).toBeInTheDocument();
    expect(screen.getByText('📋 Burocrática')).toBeInTheDocument();
  });

  it('renders committee options', () => {
    render(<StepGovernance {...defaultProps} />);
    expect(screen.getByText('Auditoría')).toBeInTheDocument();
    expect(screen.getByText('Riesgos')).toBeInTheDocument();
    expect(screen.getByText('Estrategia')).toBeInTheDocument();
    expect(screen.getByText('Tecnología')).toBeInTheDocument();
  });

  it('renders org units section', () => {
    render(<StepGovernance {...defaultProps} />);
    expect(screen.getByText(/Unidades Organizacionales/)).toBeInTheDocument();
    expect(screen.getByText(/No se han registrado unidades/)).toBeInTheDocument();
  });

  it('renders existing org units', () => {
    const orgUnits = [
      { id: 1, name: 'División IT', type: 'division', leader: 'Carlos', headcount: 50 },
      { id: 2, name: 'RRHH', type: 'department', leader: '', headcount: 0 },
    ];
    render(<StepGovernance {...defaultProps} orgUnits={orgUnits} />);
    expect(screen.getByText('División IT')).toBeInTheDocument();
    expect(screen.getByText('RRHH')).toBeInTheDocument();
  });

  it('renders capabilities section', () => {
    render(<StepGovernance {...defaultProps} />);
    expect(screen.getByText(/Capacidades Institucionales/)).toBeInTheDocument();
    expect(screen.getByText(/No se han registrado capacidades/)).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    render(<StepGovernance {...defaultProps} />);
    expect(screen.getByText(/← Anterior/)).toBeInTheDocument();
    expect(screen.getByText(/Siguiente →/)).toBeInTheDocument();
  });
});
