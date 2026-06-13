import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StepRiskCulture from '@/components/onboarding/StepRiskCulture';

vi.mock('@/context/ToastContext', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() }),
}));

vi.mock('@/lib/api', () => ({
  default: {
    addKnownRisk: vi.fn().mockResolvedValue({ id: 1, risk: 'Test', category: 'strategic' }),
    deleteKnownRisk: vi.fn().mockResolvedValue({}),
    updateCultureProfile: vi.fn().mockResolvedValue({}),
  },
}));

describe('StepRiskCulture', () => {
  const defaultProps = {
    onPrev: vi.fn(), onNext: vi.fn(), institutionId: 1,
    knownRisks: [], setKnownRisks: vi.fn(),
    cultureProfile: null, setCultureProfile: vi.fn(),
  };

  it('renders risk section', () => {
    render(<StepRiskCulture {...defaultProps} />);
    expect(screen.getByText(/Riesgo & Cultura/)).toBeInTheDocument();
    expect(screen.getByText(/Riesgos Conocidos/)).toBeInTheDocument();
    expect(screen.getByText(/Top 3-5 recomendado/)).toBeInTheDocument();
  });

  it('renders risk category options', () => {
    render(<StepRiskCulture {...defaultProps} />);
    expect(screen.getByText('🎯 Estratégico')).toBeInTheDocument();
    expect(screen.getByText('⚙️ Operacional')).toBeInTheDocument();
    expect(screen.getByText('💰 Financiero')).toBeInTheDocument();
    expect(screen.getByText('📜 Regulatorio')).toBeInTheDocument();
    expect(screen.getByText('🛡️ Reputacional')).toBeInTheDocument();
    expect(screen.getByText('💻 Tecnológico')).toBeInTheDocument();
  });

  it('renders existing risks', () => {
    const knownRisks = [
      { id: 1, risk: 'Cambio regulatorio', category: 'regulatory', likelihood: 'high', impact: 'high', current_mitigation: '' },
      { id: 2, risk: 'Ciberataque', category: 'technological', likelihood: 'medium', impact: 'high', current_mitigation: '' },
    ];
    render(<StepRiskCulture {...defaultProps} knownRisks={knownRisks} />);
    expect(screen.getByText('Cambio regulatorio')).toBeInTheDocument();
    expect(screen.getByText('Ciberataque')).toBeInTheDocument();
  });

  it('renders empty state for risks', () => {
    render(<StepRiskCulture {...defaultProps} />);
    expect(screen.getByText(/No se han registrado riesgos/)).toBeInTheDocument();
  });

  it('renders culture profile section with 6 dimensions', () => {
    render(<StepRiskCulture {...defaultProps} />);
    expect(screen.getAllByText(/Perfil Cultural/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Estilo de Liderazgo/)).toBeInTheDocument();
    expect(screen.getByText(/Disposición al Cambio/)).toBeInTheDocument();
    expect(screen.getByText(/Cultura de Innovación/)).toBeInTheDocument();
    expect(screen.getByText(/Disciplina de Ejecución/)).toBeInTheDocument();
    expect(screen.getByText(/Nivel de Colaboración/)).toBeInTheDocument();
    expect(screen.getByText(/Madurez Estratégica/)).toBeInTheDocument();
  });

  it('renders leadership style options', () => {
    render(<StepRiskCulture {...defaultProps} />);
    expect(screen.getByText('Directivo')).toBeInTheDocument();
    expect(screen.getByText('Participativo')).toBeInTheDocument();
    expect(screen.getByText('Delegativo')).toBeInTheDocument();
    expect(screen.getByText('Transformacional')).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    render(<StepRiskCulture {...defaultProps} />);
    expect(screen.getByText(/← Anterior/)).toBeInTheDocument();
    expect(screen.getByText(/Siguiente →/)).toBeInTheDocument();
  });

  it('renders save culture button', () => {
    render(<StepRiskCulture {...defaultProps} />);
    expect(screen.getAllByText(/Guardar/).length).toBeGreaterThanOrEqual(1);
  });
});
