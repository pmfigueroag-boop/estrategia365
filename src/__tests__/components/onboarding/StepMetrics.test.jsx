import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StepMetrics from '@/features/onboarding/components/StepMetrics';

vi.mock('@/features/plan/context/ToastContext', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() }),
}));

vi.mock('@/lib/api', () => ({
  default: {
    updateInstitution: vi.fn().mockResolvedValue({}),
  },
}));

describe('StepMetrics', () => {
  const defaultProps = {
    onPrev: vi.fn(), onNext: vi.fn(), institutionId: 1,
    metrics: { strategic_budget: 0, strategic_budget_currency: 'USD', time_horizon_months: 36, kpis: [] },
    setMetrics: vi.fn(),
    sector: 'private',
  };

  it('renders main heading', () => {
    render(<StepMetrics {...defaultProps} />);
    expect(screen.getByText(/Métricas & Horizonte/)).toBeInTheDocument();
  });

  it('renders budget section', () => {
    render(<StepMetrics {...defaultProps} />);
    expect(screen.getByText(/Presupuesto Estratégico/)).toBeInTheDocument();
    expect(screen.getByText('Monto')).toBeInTheDocument();
    expect(screen.getByText('Moneda')).toBeInTheDocument();
  });

  it('renders horizon options', () => {
    render(<StepMetrics {...defaultProps} />);
    expect(screen.getByText(/Horizonte Temporal/)).toBeInTheDocument();
    expect(screen.getByText('1 año')).toBeInTheDocument();
    expect(screen.getByText('2 años')).toBeInTheDocument();
    expect(screen.getByText('3 años')).toBeInTheDocument();
    expect(screen.getByText('4 años')).toBeInTheDocument();
    expect(screen.getByText('5 años')).toBeInTheDocument();
  });

  it('renders recommended badge on 3 years', () => {
    render(<StepMetrics {...defaultProps} />);
    expect(screen.getByText('⭐ RECOMENDADO')).toBeInTheDocument();
  });

  it('renders KPIs section', () => {
    render(<StepMetrics {...defaultProps} />);
    expect(screen.getByText(/KPIs Baseline/)).toBeInTheDocument();
    expect(screen.getByText(/No se han registrado KPIs/)).toBeInTheDocument();
  });

  it('renders sector-specific KPI suggestions for private', () => {
    render(<StepMetrics {...defaultProps} />);
    expect(screen.getByText(/Ingresos Anuales/)).toBeInTheDocument();
    expect(screen.getByText(/Margen Operativo/)).toBeInTheDocument();
    expect(screen.getByText(/Satisfacción del Cliente/)).toBeInTheDocument();
  });

  it('renders sector-specific KPI suggestions for public', () => {
    render(<StepMetrics {...defaultProps} sector="public" />);
    expect(screen.getByText(/Cobertura de Servicio/)).toBeInTheDocument();
    expect(screen.getByText(/Ejecución Presupuestaria/)).toBeInTheDocument();
  });

  it('renders existing KPIs', () => {
    const metricsWithKpis = {
      ...defaultProps.metrics,
      kpis: [
        { id: 1, name: 'Revenue', current: 1000000, target: 1500000, unit: 'USD' },
        { id: 2, name: 'NPS', current: 45, target: 70, unit: 'puntos' },
      ],
    };
    render(<StepMetrics {...defaultProps} metrics={metricsWithKpis} />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('NPS')).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    render(<StepMetrics {...defaultProps} />);
    expect(screen.getByText(/← Anterior/)).toBeInTheDocument();
    expect(screen.getByText(/Siguiente →/)).toBeInTheDocument();
  });

  it('renders save metrics button', () => {
    render(<StepMetrics {...defaultProps} />);
    expect(screen.getByText(/Guardar Métricas/)).toBeInTheDocument();
  });
});
