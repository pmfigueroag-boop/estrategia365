import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AnalysisPage from '@/app/analysis/page';
import { usePlanContext } from '@/context/PlanContext';
import { useToast } from '@/context/ToastContext';
import { useAnalysis } from '@/app/analysis/hooks/useAnalysis';

// Mocks
vi.mock('@/context/PlanContext');
vi.mock('@/context/ToastContext');
vi.mock('@/app/analysis/hooks/useAnalysis');
vi.mock('@/components/DiagnosticReadiness', () => ({ default: () => <div data-testid="readiness-mock" /> }));

// Mock the Tabs to keep tests fast and focused on the Page orchestrator
vi.mock('@/components/analysis/tabs/PestelTab', () => ({ default: () => <div data-testid="pestel-tab" /> }));
vi.mock('@/components/analysis/tabs/PorterTab', () => ({ default: () => <div data-testid="porter-tab" /> }));
vi.mock('@/components/analysis/tabs/SwotTab', () => ({ default: () => <div data-testid="swot-tab" /> }));
vi.mock('@/components/analysis/tabs/InstitucionalTab', () => ({ default: () => <div data-testid="inst-tab" /> }));
vi.mock('@/components/analysis/VrioTabWrapper', () => ({ default: () => <div data-testid="vrio-tab" /> }));
vi.mock('@/components/analysis/BcgTabWrapper', () => ({ default: () => <div data-testid="bcg-tab" /> }));
vi.mock('@/components/analysis/BlueOceanTabWrapper', () => ({ default: () => <div data-testid="ocean-tab" /> }));

describe('AnalysisPage Orchestrator', () => {
  const mockToast = { success: vi.fn(), error: vi.fn(), warning: vi.fn() };
  let mockState, mockActions;

  beforeEach(() => {
    vi.clearAllMocks();
    useToast.mockReturnValue(mockToast);
    
    mockState = {
      planId: 'test-plan-1',
      activeTab: 'institucional',
      readinessKey: 0
    };
    
    mockActions = {
      setActiveTab: vi.fn()
    };

    useAnalysis.mockReturnValue({ state: mockState, actions: mockActions });
    usePlanContext.mockReturnValue({ planId: 'test-plan-1' });
  });

  it('renders Empty State if no planId exists', () => {
    usePlanContext.mockReturnValue({ planId: null });
    render(<AnalysisPage />);
    expect(screen.getByText(/No hay un plan activo/i)).toBeInTheDocument();
    expect(screen.queryByText(/Análisis Estratégico/i)).not.toBeInTheDocument();
  });

  it('renders Header and Tabs when planId is present', () => {
    render(<AnalysisPage />);
    expect(screen.getByText(/Análisis Estratégico/i)).toBeInTheDocument();
    expect(screen.getByTestId('readiness-mock')).toBeInTheDocument();
    
    // Check tab buttons
    expect(screen.getByText(/Institucional/i)).toBeInTheDocument();
    expect(screen.getByText(/PESTEL/i)).toBeInTheDocument();
    expect(screen.getByText(/Porter 5F/i)).toBeInTheDocument();
    
    // Check that institutional tab is rendered by default
    expect(screen.getByTestId('inst-tab')).toBeInTheDocument();
  });

  it('calls setActiveTab when a tab button is clicked', () => {
    render(<AnalysisPage />);
    const pestelBtn = screen.getByText(/PESTEL/i);
    
    fireEvent.click(pestelBtn);
    expect(mockActions.setActiveTab).toHaveBeenCalledWith('pestel');
  });

  it('renders the correct tab component based on activeTab state', () => {
    mockState.activeTab = 'pestel';
    useAnalysis.mockReturnValue({ state: mockState, actions: mockActions });
    
    render(<AnalysisPage />);
    expect(screen.getByTestId('pestel-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('inst-tab')).not.toBeInTheDocument();
  });
});
