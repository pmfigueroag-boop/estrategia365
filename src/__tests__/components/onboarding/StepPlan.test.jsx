import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StepPlan from '@/features/onboarding/components/StepPlan';

// Mock the ParadigmContext
vi.mock('@/context/ParadigmContext', () => ({
  useParadigm: () => ({
    paradigms: [
      { id: 'competitive', name: 'Competitiva (Porter / 5 Fuerzas)', short: 'Porter' },
      { id: 'harvard', name: 'Clásica Harvard (FODA / Ajuste)', short: 'Harvard / FODA' },
      { id: 'resources', name: 'Recursos Internos (VRIO / RBV)', short: 'RBV / VRIO' },
      { id: 'ocean', name: 'Océano Azul (Innovación en Valor)', short: 'Blue Ocean' },
    ],
    activeParadigm: { id: 'competitive' },
    setActiveParadigm: vi.fn(),
  }),
}));

describe('StepPlan', () => {
  let onPrev, onFinish;

  beforeEach(() => {
    onPrev = vi.fn();
    onFinish = vi.fn();
  });

  it('renders the plan configuration heading', () => {
    render(<StepPlan onPrev={onPrev} onFinish={onFinish} isSaving={false} />);
    expect(screen.getByText(/Configuración del Plan Estratégico/)).toBeInTheDocument();
  });

  it('renders all paradigm options as buttons', () => {
    render(<StepPlan onPrev={onPrev} onFinish={onFinish} isSaving={false} />);
    expect(screen.getByText('Porter')).toBeInTheDocument();
    expect(screen.getByText('Harvard / FODA')).toBeInTheDocument();
    expect(screen.getByText('RBV / VRIO')).toBeInTheDocument();
    expect(screen.getByText('Blue Ocean')).toBeInTheDocument();
  });

  it('renders the informational note about next steps', () => {
    render(<StepPlan onPrev={onPrev} onFinish={onFinish} isSaving={false} />);
    expect(screen.getByText(/Al completar este paso se creará el plan/)).toBeInTheDocument();
  });

  it('calls onPrev when "Anterior" button is clicked', () => {
    render(<StepPlan onPrev={onPrev} onFinish={onFinish} isSaving={false} />);
    fireEvent.click(screen.getByText(/Anterior/));
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('calls onFinish with selected paradigm when finish button is clicked', () => {
    render(<StepPlan onPrev={onPrev} onFinish={onFinish} isSaving={false} />);
    // Default selection is 'competitive'
    fireEvent.click(screen.getByText(/Completar y Comenzar Análisis/));
    expect(onFinish).toHaveBeenCalledWith('competitive');
  });

  it('calls onFinish with changed paradigm after selection', () => {
    render(<StepPlan onPrev={onPrev} onFinish={onFinish} isSaving={false} />);
    // Click Harvard paradigm
    fireEvent.click(screen.getByText('Harvard / FODA'));
    // Then finish
    fireEvent.click(screen.getByText(/Completar y Comenzar Análisis/));
    expect(onFinish).toHaveBeenCalledWith('harvard');
  });

  it('shows saving state with disabled button', () => {
    render(<StepPlan onPrev={onPrev} onFinish={onFinish} isSaving={true} />);
    const finishBtn = screen.getByText(/Creando plan/);
    expect(finishBtn.closest('button')).toBeDisabled();
  });

  it('highlights the selected paradigm visually', () => {
    render(<StepPlan onPrev={onPrev} onFinish={onFinish} isSaving={false} />);
    // Default 'competitive' should have active border
    const porterBtn = screen.getByText('Porter').closest('button');
    expect(porterBtn).toHaveClass('border-indigo-500');
  });

  it('switches highlight when a different paradigm is clicked', () => {
    render(<StepPlan onPrev={onPrev} onFinish={onFinish} isSaving={false} />);
    const harvardBtn = screen.getByText('Harvard / FODA').closest('button');
    fireEvent.click(harvardBtn);
    expect(harvardBtn).toHaveClass('border-indigo-500');
    // Porter should no longer be highlighted
    const porterBtn = screen.getByText('Porter').closest('button');
    expect(porterBtn).not.toHaveClass('border-indigo-500');
  });
});
