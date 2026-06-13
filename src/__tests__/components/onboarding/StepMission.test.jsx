import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, it, expect, vi } from 'vitest';
import StepMission from '@/components/onboarding/StepMission';

function Wrapper({ children }) {
  const methods = useForm({
    defaultValues: {
      mission: '', vision: '', values: '',
      products_services: '', market_position: '',
    },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('StepMission', () => {
  it('renders all strategic foundation fields', () => {
    render(
      <Wrapper>
        <StepMission onPrev={vi.fn()} onNext={vi.fn()} />
      </Wrapper>
    );

    expect(screen.getByText(/Fundamento Estratégico/i)).toBeInTheDocument();
    expect(screen.getByText(/Misión Actual/i)).toBeInTheDocument();
    expect(screen.getByText(/Visión Actual/i)).toBeInTheDocument();
    expect(screen.getByText(/Valores Organizacionales/i)).toBeInTheDocument();
    expect(screen.getByText(/Productos y Servicios/i)).toBeInTheDocument();
    expect(screen.getByText(/Posición en el Mercado/i)).toBeInTheDocument();
  });

  it('renders market position options', () => {
    render(
      <Wrapper>
        <StepMission onPrev={vi.fn()} onNext={vi.fn()} />
      </Wrapper>
    );

    expect(screen.getByText(/Líder del mercado/i)).toBeInTheDocument();
    expect(screen.getByText(/Retador/i)).toBeInTheDocument();
    expect(screen.getByText(/Seguidor/i)).toBeInTheDocument();
    expect(screen.getByText(/Nicho especializado/i)).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    render(
      <Wrapper>
        <StepMission onPrev={vi.fn()} onNext={vi.fn()} />
      </Wrapper>
    );

    expect(screen.getByText(/← Anterior/)).toBeInTheDocument();
    expect(screen.getByText(/Siguiente →/)).toBeInTheDocument();
  });

  it('renders reformulation disclaimer', () => {
    render(
      <Wrapper>
        <StepMission onPrev={vi.fn()} onNext={vi.fn()} />
      </Wrapper>
    );

    expect(screen.getByText(/podrán reformularse/i)).toBeInTheDocument();
  });
});
