import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GovernancePage from '@/app/governance/page';
import api from '@/lib/api';
import * as ToastContext from '@/features/plan/context/ToastContext';
import * as PlanContext from '@/features/plan/context/PlanContext';

vi.mock('@/lib/api', () => ({
  default: {
    getAuditTrail: vi.fn(),
    getKernelHistory: vi.fn(),
    getKernelStatus: vi.fn(),
    getSsoStatus: vi.fn(),
    getInstitutionalExportUrl: vi.fn((id, format) => `/mock-export/${id}/${format}`),
    getAuditExportUrl: vi.fn((id) => `/mock-export/audit/${id}`)
  }
}));

// Mock heavy subcomponents
vi.mock('@/features/governance/components/BudgetGauge', () => ({
  default: () => <div data-testid="budget-gauge">BudgetGauge Mock</div>
}));
vi.mock('@/features/governance/components/QualityGatePanel', () => ({
  default: () => <div data-testid="quality-gate">QualityGatePanel Mock</div>
}));
vi.mock('@/features/governance/components/MaturityRadar', () => ({
  default: () => <div data-testid="maturity-radar">MaturityRadar Mock</div>
}));
vi.mock('@/features/governance/components/ReasoningTimeline', () => ({
  default: () => <div data-testid="reasoning-timeline">ReasoningTimeline Mock</div>
}));

describe('GovernancePage', () => {
  const mockPlanId = 1;

  const mockAuditTrail = {
    is_valid: true,
    logs: [
      { id: 1, created_at: '2026-01-01T00:00:00Z', actor: 'pmfig', action: 'CREATE', entity: 'Plan', entity_id: 1, hash_signature: 'abc123def456' },
      { id: 2, created_at: '2026-01-02T00:00:00Z', actor: 'system', action: 'UPDATE', entity: 'Analysis', entity_id: 2, hash_signature: 'ghi789jkl012' }
    ]
  };
  const mockKernelHistory = [
    { version: '3.1.0', created_at: '2026-01-01T00:00:00Z', diagnosis: 'Initial diagnosis', confidence_score: 0.95, decision_count: 10 }
  ];
  const mockKernelStatus = { status: 'active', version: '3.1.0' };
  const mockSsoStatus = {
    sso_status: 'CONFIGURED',
    detail: 'SSO is active',
    supported_protocols: ['SAML 2.0', 'OIDC'],
    supported_providers: ['Azure AD', 'Okta']
  };

  const mockToast = {
    success: vi.fn(),
    error: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    api.getAuditTrail.mockResolvedValue(mockAuditTrail);
    api.getKernelHistory.mockResolvedValue(mockKernelHistory);
    api.getKernelStatus.mockResolvedValue(mockKernelStatus);
    api.getSsoStatus.mockResolvedValue(mockSsoStatus);
    
    vi.spyOn(ToastContext, 'useToast').mockReturnValue(mockToast);
    vi.spyOn(PlanContext, 'usePlanContext').mockReturnValue({ planId: mockPlanId, setPlanId: vi.fn() });
  });

  const renderWithProviders = (planId = mockPlanId) => {
    if (planId === null) {
      vi.spyOn(PlanContext, 'usePlanContext').mockReturnValue({ planId: null, setPlanId: vi.fn() });
    }
    return render(<GovernancePage />);
  };

  it('renders loading state initially', () => {
    renderWithProviders();
    expect(screen.getByText(/Cargando módulo de Gobernanza.../i)).toBeInTheDocument();
  });

  it('renders Governance dashboard with banner and tabs after loading', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('🛡️ Gobernanza & AI Governance')).toBeInTheDocument();
    });

    // Check banner status
    expect(screen.getByText(/Cadena SHA-256: VÁLIDA/i)).toBeInTheDocument();
    
    // Check default tab content (ai-budget)
    expect(screen.getByTestId('budget-gauge')).toBeInTheDocument();
  });

  it('renders empty state when no plan is active', () => {
    renderWithProviders(null);
    expect(screen.getByText(/No hay un plan activo/i)).toBeInTheDocument();
  });

  it('switches views correctly', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('🛡️ Gobernanza & AI Governance')).toBeInTheDocument();
    });

    // Switch to Quality Gate
    fireEvent.click(screen.getByText('🛡️ Quality Gate'));
    expect(screen.getByTestId('quality-gate')).toBeInTheDocument();

    // Switch to Maturity
    fireEvent.click(screen.getByText('🧠 Madurez IA'));
    expect(screen.getByTestId('maturity-radar')).toBeInTheDocument();

    // Switch to Reasoning
    fireEvent.click(screen.getByText('🔗 Razonamiento'));
    expect(screen.getByTestId('reasoning-timeline')).toBeInTheDocument();

    // Switch to Audit
    fireEvent.click(screen.getByRole('button', { name: /📋 Auditoría/i }));
    expect(screen.getByText('Registro Forense (Event Sourcing)')).toBeInTheDocument();
    expect(screen.getByText('pmfig')).toBeInTheDocument(); // actor

    // Switch to History
    fireEvent.click(screen.getByText('📜 Historial Kernel'));
    expect(screen.getByText('📜 Historial de Versiones del Kernel')).toBeInTheDocument();
    expect(screen.getByText('v3.1.0')).toBeInTheDocument();

    // Switch to Exports
    fireEvent.click(screen.getByText('📥 Exportaciones'));
    expect(screen.getByText('Plan Estratégico Institucional (PEI)')).toBeInTheDocument();
    expect(screen.getByText('Ficha SNPIP')).toBeInTheDocument();

    // Switch to Security
    fireEvent.click(screen.getByText('🔐 Seguridad'));
    expect(screen.getByText('🔐 SSO/SAML — CONFIGURED')).toBeInTheDocument();
  });

  it('triggers chain verification successfully', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('🛡️ Gobernanza & AI Governance')).toBeInTheDocument();
    });

    const verifyBtn = screen.getByText('🔄 Re-Verificar');
    fireEvent.click(verifyBtn);

    expect(screen.getByText('⏳ Verificando...')).toBeInTheDocument();

    await waitFor(() => {
      expect(api.getAuditTrail).toHaveBeenCalledTimes(2); // once on mount, once on click
      expect(screen.getByText('🔄 Re-Verificar')).toBeInTheDocument();
    });
  });
});
