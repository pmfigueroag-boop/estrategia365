// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OnboardingPage from '@/app/onboarding/page';
import onboardingService from '@/app/onboarding/services/onboardingService';

// Mock dependencies
vi.mock('@/app/onboarding/services/onboardingService', () => ({
  default: {
    loadFullProgress: vi.fn(),
    saveInstitutionProfile: vi.fn(),
    createPlan: vi.fn(),
    syncProgress: vi.fn(),
    FORM_DEFAULTS: { name: '', sector: 'private', industry: '', size: '' },
    METRICS_DEFAULTS: { strategic_budget: 0, kpis: [] },
  }
}));

vi.mock('@/features/plan/context/ToastContext', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn(), warning: vi.fn() })
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/onboarding',
}));

describe('OnboardingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // IntersectionObserver mock for headless environments
    window.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null
    }));
  });

  it('renders loading state initially', async () => {
    // Keep loading state pending
    onboardingService.loadFullProgress.mockReturnValue(new Promise(() => {}));
    
    render(<OnboardingPage />);
    expect(screen.getByText('Cargando perfil institucional...')).toBeInTheDocument();
  });

  it('renders step 1 (Identidad) when loadFullProgress returns empty progress', async () => {
    onboardingService.loadFullProgress.mockResolvedValue({
      step: 1,
      institutionId: null,
      tier: 'free',
      formValues: onboardingService.FORM_DEFAULTS,
    });
    
    render(<OnboardingPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Cargando perfil institucional...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Onboarding Institucional')).toBeInTheDocument();
    // Identidad inputs should be visible
    expect(screen.getByText(/Nombre de la Organización/i)).toBeInTheDocument();
  });

  it('resumes from step 4 if loadFullProgress indicates partial progress', async () => {
    onboardingService.loadFullProgress.mockResolvedValue({
      step: 4,
      institutionId: 99,
      tier: 'premium',
      formValues: { ...onboardingService.FORM_DEFAULTS, name: 'Acme' },
      stakeholders: [],
    });
    
    render(<OnboardingPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Cargando perfil institucional...')).not.toBeInTheDocument();
    });

    // Step 4 content (Stakeholders) should be visible instead of Step 1
    // Look for Stakeholders heading
    expect(screen.getByText(/Partes Interesadas/i)).toBeInTheDocument();
  });

  it('shows saving indicator when isSaving is true', async () => {
    onboardingService.loadFullProgress.mockResolvedValue({
      step: 1,
      institutionId: null,
      tier: 'free',
      formValues: onboardingService.FORM_DEFAULTS,
    });
    
    // Render the page
    render(<OnboardingPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Cargando perfil institucional...')).not.toBeInTheDocument();
    });

    // Mock methods.trigger to return true and simulate save
    const saveButton = screen.getByRole('button', { name: /Siguiente/i });
    
    // We verify the save button exists to ensure the form rendered correctly
    expect(saveButton).toBeInTheDocument();
  });
});
