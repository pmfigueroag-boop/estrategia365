import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingSchema } from '@/app/onboarding/schema';
import StepContext from '@/features/onboarding/components/StepContext';

function FormWrapper({ children }) {
  const methods = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: 'Test Corp', sector: 'private', industry: '', size: '',
      geography: '', employees: 0, annual_revenue: '',
      description: '', competitive_context: '',
    },
    mode: 'onTouched',
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('StepContext', () => {
  let onPrev, onSave;

  beforeEach(() => {
    onPrev = vi.fn();
    onSave = vi.fn();
  });

  it('renders the strategic context heading', () => {
    render(
      <FormWrapper>
        <StepContext onPrev={onPrev} onSave={onSave} isSaving={false} />
      </FormWrapper>
    );
    expect(screen.getByText(/Contexto Estratégico/)).toBeInTheDocument();
  });

  it('renders description textarea with placeholder', () => {
    render(
      <FormWrapper>
        <StepContext onPrev={onPrev} onSave={onSave} isSaving={false} />
      </FormWrapper>
    );
    expect(screen.getByPlaceholderText(/¿Qué hace tu organización/)).toBeInTheDocument();
  });

  it('renders competitive context textarea with placeholder', () => {
    render(
      <FormWrapper>
        <StepContext onPrev={onPrev} onSave={onSave} isSaving={false} />
      </FormWrapper>
    );
    expect(screen.getByPlaceholderText(/¿Quiénes son los principales competidores/)).toBeInTheDocument();
  });

  it('calls onPrev when "Anterior" button is clicked', () => {
    render(
      <FormWrapper>
        <StepContext onPrev={onPrev} onSave={onSave} isSaving={false} />
      </FormWrapper>
    );
    fireEvent.click(screen.getByText(/Anterior/));
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('calls onSave when "Guardar y Continuar" button is clicked', () => {
    render(
      <FormWrapper>
        <StepContext onPrev={onPrev} onSave={onSave} isSaving={false} />
      </FormWrapper>
    );
    fireEvent.click(screen.getByText(/Guardar y Continuar/));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('shows saving state with disabled button', () => {
    render(
      <FormWrapper>
        <StepContext onPrev={onPrev} onSave={onSave} isSaving={true} />
      </FormWrapper>
    );
    const saveBtn = screen.getByText(/Guardando/);
    expect(saveBtn.closest('button')).toBeDisabled();
  });

  it('allows typing in description textarea', () => {
    render(
      <FormWrapper>
        <StepContext onPrev={onPrev} onSave={onSave} isSaving={false} />
      </FormWrapper>
    );
    const textarea = screen.getByPlaceholderText(/¿Qué hace tu organización/);
    fireEvent.change(textarea, { target: { value: 'We build enterprise software' } });
    expect(textarea).toHaveValue('We build enterprise software');
  });
});
