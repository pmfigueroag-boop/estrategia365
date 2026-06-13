import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StepOperations from '@/components/onboarding/StepOperations';

vi.mock('@/context/ToastContext', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() }),
}));

vi.mock('@/lib/api', () => ({
  default: {
    addValueChainActivity: vi.fn().mockResolvedValue({ id: 1, activity_name: 'operations', activity_type: 'primary', strength_level: 'adequate' }),
    updateValueChainActivity: vi.fn().mockResolvedValue({}),
    deleteValueChainActivity: vi.fn().mockResolvedValue({}),
    addDependency: vi.fn().mockResolvedValue({ id: 1, name: 'Test', type: 'technology' }),
    deleteDependency: vi.fn().mockResolvedValue({}),
    addTechSystem: vi.fn().mockResolvedValue({ id: 1, name: 'SAP', type: 'erp' }),
    deleteTechSystem: vi.fn().mockResolvedValue({}),
  },
}));

describe('StepOperations', () => {
  const defaultProps = {
    onPrev: vi.fn(), onNext: vi.fn(), institutionId: 1,
    valueChain: [], setValueChain: vi.fn(),
    dependencies: [], setDependencies: vi.fn(),
    techSystems: [], setTechSystems: vi.fn(),
  };

  it('renders main heading', () => {
    render(<StepOperations {...defaultProps} />);
    expect(screen.getByText(/Operaciones & Ecosistema/)).toBeInTheDocument();
  });

  it('renders value chain section', () => {
    render(<StepOperations {...defaultProps} />);
    expect(screen.getByText(/Cadena de Valor \(Porter\)/)).toBeInTheDocument();
    expect(screen.getByText(/Inicializar Cadena de Valor/)).toBeInTheDocument();
  });

  it('renders dependencies section', () => {
    render(<StepOperations {...defaultProps} />);
    expect(screen.getByText(/Dependencias Críticas/)).toBeInTheDocument();
    expect(screen.getByText(/No se han registrado dependencias/)).toBeInTheDocument();
  });

  it('renders tech systems section', () => {
    render(<StepOperations {...defaultProps} />);
    expect(screen.getByText(/Ecosistema Tecnológico/)).toBeInTheDocument();
    expect(screen.getByText(/No se han registrado sistemas/)).toBeInTheDocument();
  });

  it('renders dependency type buttons', () => {
    render(<StepOperations {...defaultProps} />);
    expect(screen.getByText('📦 Proveedor')).toBeInTheDocument();
    expect(screen.getByText('💻 Tecnología')).toBeInTheDocument();
    expect(screen.getByText('📜 Regulatorio')).toBeInTheDocument();
    expect(screen.getByText('🤝 Socio')).toBeInTheDocument();
  });

  it('renders tech type buttons', () => {
    render(<StepOperations {...defaultProps} />);
    expect(screen.getByText('ERP')).toBeInTheDocument();
    expect(screen.getByText('CRM')).toBeInTheDocument();
    expect(screen.getByText('BI / Analytics')).toBeInTheDocument();
  });

  it('renders existing dependencies', () => {
    const deps = [
      { id: 1, name: 'AWS Hosting', type: 'technology', provider: 'AWS', criticality: 'critical' },
      { id: 2, name: 'Regulador', type: 'regulatory', provider: '', criticality: 'high' },
    ];
    render(<StepOperations {...defaultProps} dependencies={deps} />);
    expect(screen.getByText('AWS Hosting')).toBeInTheDocument();
    expect(screen.getByText('Regulador')).toBeInTheDocument();
  });

  it('renders existing tech systems', () => {
    const systems = [
      { id: 1, name: 'SAP S/4HANA', type: 'erp', vendor: 'SAP', integration_status: 'integrated' },
    ];
    render(<StepOperations {...defaultProps} techSystems={systems} />);
    expect(screen.getByText('SAP S/4HANA')).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    render(<StepOperations {...defaultProps} />);
    expect(screen.getByText(/← Anterior/)).toBeInTheDocument();
    expect(screen.getByText(/Siguiente →/)).toBeInTheDocument();
  });

  it('renders value chain activities when populated', () => {
    const chain = [
      { id: 1, activity_type: 'primary', activity_name: 'operations', strength_level: 'strong', is_active: 1 },
      { id: 2, activity_type: 'support', activity_name: 'procurement', strength_level: 'weak', is_active: 1 },
    ];
    render(<StepOperations {...defaultProps} valueChain={chain} />);
    expect(screen.getByText('Operaciones')).toBeInTheDocument();
    expect(screen.getByText('Adquisiciones')).toBeInTheDocument();
  });
});
