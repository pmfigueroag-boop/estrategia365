import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingSchema } from '@/app/onboarding/schema';
import StepIdentity from '@/components/onboarding/StepIdentity';

// Wrapper that provides FormProvider context (required by useFormContext)
function FormWrapper({ children, defaultValues = {} }) {
  const methods = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: '', sector: 'private', industry: '', size: '',
      geography: '', country: '', international_presence: '',
      employees: 0, annual_revenue: '',
      annual_revenue_amount: 0, annual_revenue_currency: 'USD',
      mission: '', vision: '', values: '',
      products_services: '', market_position: '',
      description: '', competitive_context: '',
      ...defaultValues,
    },
    mode: 'onTouched',
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('StepIdentity', () => {
  let onNext;

  beforeEach(() => {
    onNext = vi.fn();
  });

  it('renders the organization name input', () => {
    render(
      <FormWrapper>
        <StepIdentity onNext={onNext} />
      </FormWrapper>
    );
    expect(screen.getByPlaceholderText(/Ministerio de Economía/)).toBeInTheDocument();
  });

  it('renders sector selector with private and public options', () => {
    render(
      <FormWrapper>
        <StepIdentity onNext={onNext} />
      </FormWrapper>
    );
    expect(screen.getByText(/Sector Privado/)).toBeInTheDocument();
    expect(screen.getByText(/Sector Público/)).toBeInTheDocument();
  });

  it('renders industry dropdown with options', () => {
    render(
      <FormWrapper>
        <StepIdentity onNext={onNext} />
      </FormWrapper>
    );
    const selects = screen.getAllByText('Seleccionar...');
    expect(selects.length).toBeGreaterThanOrEqual(1);
    // Verify some industry options exist
    expect(screen.getByText('Tecnología')).toBeInTheDocument();
    expect(screen.getByText('Finanzas')).toBeInTheDocument();
    expect(screen.getByText('Salud')).toBeInTheDocument();
  });

  it('renders size dropdown with options', () => {
    render(
      <FormWrapper>
        <StepIdentity onNext={onNext} />
      </FormWrapper>
    );
    expect(screen.getByText('Startup (1-50)')).toBeInTheDocument();
    expect(screen.getByText('PYME (51-250)')).toBeInTheDocument();
    expect(screen.getByText('Corporación (250+)')).toBeInTheDocument();
  });

  it('renders geography and employees inputs', () => {
    render(
      <FormWrapper>
        <StepIdentity onNext={onNext} />
      </FormWrapper>
    );
    expect(screen.getByPlaceholderText(/Caribe/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('250')).toBeInTheDocument();
  });

  it('renders annual revenue input', () => {
    render(
      <FormWrapper>
        <StepIdentity onNext={onNext} />
      </FormWrapper>
    );
    expect(screen.getByPlaceholderText('10000000')).toBeInTheDocument();
  });

  it('calls onNext when "Siguiente" button is clicked', () => {
    render(
      <FormWrapper>
        <StepIdentity onNext={onNext} />
      </FormWrapper>
    );
    fireEvent.click(screen.getByText(/Siguiente/));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('toggles sector when public button is clicked', () => {
    render(
      <FormWrapper>
        <StepIdentity onNext={onNext} />
      </FormWrapper>
    );
    const publicBtn = screen.getByText(/Sector Público/);
    fireEvent.click(publicBtn);
    // After click, the public button should have the active styling class
    expect(publicBtn.closest('button')).toHaveClass('bg-indigo-600');
  });

  it('allows typing in the name field', () => {
    render(
      <FormWrapper>
        <StepIdentity onNext={onNext} />
      </FormWrapper>
    );
    const nameInput = screen.getByPlaceholderText(/Ministerio de Economía/);
    fireEvent.change(nameInput, { target: { value: 'Test Corp' } });
    expect(nameInput).toHaveValue('Test Corp');
  });

  it('renders with pre-filled values from form context', () => {
    render(
      <FormWrapper defaultValues={{ name: 'Existing Corp', sector: 'public' }}>
        <StepIdentity onNext={onNext} />
      </FormWrapper>
    );
    expect(screen.getByPlaceholderText(/Ministerio de Economía/)).toHaveValue('Existing Corp');
  });
});
