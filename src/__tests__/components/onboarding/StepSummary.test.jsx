import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StepSummary from '@/components/onboarding/StepSummary';

// Mock ToastContext
const mockToast = { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() };
vi.mock('@/context/ToastContext', () => ({ useToast: () => mockToast }));

// Mock API
const mockTwin = {
  institution_id: 1,
  identity: { name: 'Test Corp', sector: 'private', industry: 'Tech', size: 'large', country: 'US', employees: 100, tier: 'enterprise' },
  mission_vision: { mission: 'Test mission', vision: 'Test vision', values: 'Innovation', products_services: 'SaaS', market_position: 'leader' },
  stakeholders: [{ id: 1, name: 'Client A', type: 'client' }],
  governance: { board_size: 5, ceo_name: 'CEO', org_units: [], capabilities: [] },
  risk_culture: { known_risks: [], culture_profile: null },
  operations: { value_chain: [], dependencies: [], tech_systems: [] },
  metrics: { strategic_budget: 1000000, time_horizon_months: 36, kpis: [{ name: 'Rev', current: 10, target: 20, unit: '%' }] },
  documents: [],
  completeness: { overall: 72, dimensions: { identity: 100, mission_vision: 100, stakeholders: 40, governance: 40, risk_culture: 0, operations: 0, metrics: 60, documents: 0 } },
};

const mockMaturity = {
  id: 1, institution_id: 1, overall_score: 5.8, level: 'intermediate',
  dimension_scores: {
    organization: 7, governance: 5, strategy: 6, stakeholders: 4, operations: 3,
    culture: 0, talent: 4, risk: 2, digital: 3, transformation: 3, analytics: 5, ai: 6, staas: 4,
  },
  recommendations: [
    { dimension: 'culture', dimension_label: 'Cultura', gap: 'Complete el perfil cultural', priority: 'high' },
    { dimension: 'risk', dimension_label: 'Riesgo', gap: 'Registre riesgos conocidos', priority: 'high' },
  ],
  assessed_at: '2026-06-06T12:00:00',
};

vi.mock('@/lib/api', () => ({
  default: {
    getDigitalTwin: vi.fn(),
    getMaturityAssessment: vi.fn(),
    triggerMaturityAssessment: vi.fn(),
  },
}));

import api from '@/lib/api';

describe('StepSummary', () => {
  const onPrev = vi.fn();
  const onNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    api.getDigitalTwin.mockResolvedValue(mockTwin);
    api.getMaturityAssessment.mockResolvedValue(mockMaturity);
    api.triggerMaturityAssessment.mockResolvedValue(mockMaturity);
  });

  it('renders loading state initially', () => {
    api.getDigitalTwin.mockReturnValue(new Promise(() => {})); // Never resolves
    api.getMaturityAssessment.mockReturnValue(new Promise(() => {}));
    render(<StepSummary onPrev={onPrev} onNext={onNext} institutionId={1} tier="enterprise" />);
    expect(screen.getByText(/Ensamblando tu Gemelo Digital/i)).toBeTruthy();
  });

  it('renders completeness score', async () => {
    render(<StepSummary onPrev={onPrev} onNext={onNext} institutionId={1} tier="enterprise" />);
    await waitFor(() => expect(screen.getByText('72%')).toBeTruthy());
  });

  it('renders completeness bar title', async () => {
    render(<StepSummary onPrev={onPrev} onNext={onNext} institutionId={1} tier="enterprise" />);
    await waitFor(() => expect(screen.getByText(/Completitud del Perfil/i)).toBeTruthy());
  });

  it('renders maturity level badge', async () => {
    render(<StepSummary onPrev={onPrev} onNext={onNext} institutionId={1} tier="enterprise" />);
    await waitFor(() => expect(screen.getByText('Intermedio')).toBeTruthy());
  });

  it('renders maturity score', async () => {
    render(<StepSummary onPrev={onPrev} onNext={onNext} institutionId={1} tier="enterprise" />);
    await waitFor(() => expect(screen.getByText('5.8')).toBeTruthy());
  });

  it('renders high priority recommendations', async () => {
    render(<StepSummary onPrev={onPrev} onNext={onNext} institutionId={1} tier="enterprise" />);
    await waitFor(() => expect(screen.getByText(/Complete el perfil cultural/i)).toBeTruthy());
  });

  it('renders tier badge', async () => {
    render(<StepSummary onPrev={onPrev} onNext={onNext} institutionId={1} tier="enterprise" />);
    await waitFor(() => expect(screen.getByText('Enterprise')).toBeTruthy());
  });

  it('shows upgrade CTA for free tier', async () => {
    render(<StepSummary onPrev={onPrev} onNext={onNext} institutionId={1} tier="free" />);
    await waitFor(() => expect(screen.getByText(/Upgrade a Professional/i)).toBeTruthy());
  });

  it('does NOT show upgrade CTA for enterprise tier', async () => {
    render(<StepSummary onPrev={onPrev} onNext={onNext} institutionId={1} tier="enterprise" />);
    await waitFor(() => {
      expect(screen.queryByText(/Upgrade a/i)).toBeFalsy();
    });
  });

  it('triggers maturity assessment on button click', async () => {
    api.getMaturityAssessment.mockRejectedValueOnce(new Error('Not found')); // No initial assessment
    render(<StepSummary onPrev={onPrev} onNext={onNext} institutionId={1} tier="enterprise" />);
    await waitFor(() => expect(screen.getByText(/Ejecutar Diagnóstico/i)).toBeTruthy());
    fireEvent.click(screen.getByText(/Ejecutar Diagnóstico/i));
    await waitFor(() => expect(api.triggerMaturityAssessment).toHaveBeenCalledWith(1));
  });

  it('calls onNext when Crear Plan clicked', async () => {
    render(<StepSummary onPrev={onPrev} onNext={onNext} institutionId={1} tier="enterprise" />);
    await waitFor(() => expect(screen.getByText(/Crear Plan/i)).toBeTruthy());
    fireEvent.click(screen.getByText(/Crear Plan/i));
    expect(onNext).toHaveBeenCalled();
  });

  it('calls onPrev when Anterior clicked', async () => {
    render(<StepSummary onPrev={onPrev} onNext={onNext} institutionId={1} tier="enterprise" />);
    await waitFor(() => expect(screen.getByText(/Anterior/i)).toBeTruthy());
    fireEvent.click(screen.getByText(/Anterior/i));
    expect(onPrev).toHaveBeenCalled();
  });
});
