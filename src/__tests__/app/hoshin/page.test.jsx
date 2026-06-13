import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HoshinPage from '@/app/hoshin/page';
import * as PlanContext from '@/context/PlanContext';
import * as SwrHooks from '@/lib/swr-hooks';
import api from '@/lib/api';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@/context/ToastContext', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn() }),
}));
vi.mock('@/lib/api', () => ({
  default: {
    getHoshinCascade: vi.fn(),
    synthesizeHoshin: vi.fn(),
  }
}));

describe('HoshinPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(PlanContext, 'usePlanContext').mockReturnValue({ planId: 'plan-123' });
    api.getHoshinCascade.mockResolvedValue({
      alignment: { agreed_pct: 85, total_objectives: 10, negotiating_count: 2, fully_deployed: false },
      cascade: { corporate: [], division: [], department: [], team: [] }
    });
  });

  it('should show empty state if no planId', () => {
    vi.spyOn(PlanContext, 'usePlanContext').mockReturnValue({ planId: null });
    vi.spyOn(SwrHooks, 'useXMatrix').mockReturnValue({ data: null, isLoading: false });
    vi.spyOn(SwrHooks, 'useCatchball').mockReturnValue({ data: [] });

    render(<HoshinPage />);
    expect(screen.getByText(/No hay un plan activo/i)).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    vi.spyOn(SwrHooks, 'useXMatrix').mockReturnValue({ data: null, isLoading: true });
    vi.spyOn(SwrHooks, 'useCatchball').mockReturnValue({ data: [] });

    render(<HoshinPage />);
    expect(screen.getByText(/Cargando Hoshin Kanri\.\.\./i)).toBeInTheDocument();
  });

  it('should render synthesis prompt if no hoshin data exists', () => {
    vi.spyOn(SwrHooks, 'useXMatrix').mockReturnValue({ data: { stats: { total_objectives: 0 } }, isLoading: false });
    vi.spyOn(SwrHooks, 'useCatchball').mockReturnValue({ data: [] });

    render(<HoshinPage />);
    expect(screen.getByText(/Generar Sistema Hoshin Kanri/i)).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /Sintetizar Hoshin/i });
    expect(btn).toBeInTheDocument();
  });

  it('should render Hoshin Kanri X-Matrix when data is loaded', () => {
    vi.spyOn(SwrHooks, 'useXMatrix').mockReturnValue({ 
      data: { 
        stats: { total_objectives: 5, breakthroughs: 2, fundamentals: 3, total_cells: 10, strong_correlations: 4 },
        summary: 'Achieve market dominance by 2030',
        north: [ { id: 1, title: 'Expand to LATAM', catchball_status: 'agreed', progress_pct: 50, current_value: 5, target_value: 10, unit: 'M' } ],
        cells: [ { id: 10, correlation: 'strong', quadrant_pair: 'north-west', notes: 'Direct link' } ]
      }, 
      isLoading: false 
    });
    vi.spyOn(SwrHooks, 'useCatchball').mockReturnValue({ data: [] });

    render(<HoshinPage />);
    expect(screen.getByText('🏯 Hoshin Kanri — X-Matrix')).toBeInTheDocument();
    expect(screen.getByText('Achieve market dominance by 2030')).toBeInTheDocument();
    
    // Check north axis
    expect(screen.getByText(/Estrategias/i)).toBeInTheDocument();
    expect(screen.getByText('Expand to LATAM')).toBeInTheDocument();
    
    // Check correlations
    expect(screen.getByText(/Correlaciones del X-Matrix/i)).toBeInTheDocument();
    expect(screen.getByText('north-west')).toBeInTheDocument();
  });

  it('should switch between tabs', async () => {
    vi.spyOn(SwrHooks, 'useXMatrix').mockReturnValue({ 
      data: { stats: { total_objectives: 5 } }, 
      isLoading: false 
    });
    vi.spyOn(SwrHooks, 'useCatchball').mockReturnValue({ 
      data: [ { id: 1, action: 'propose', direction: 'down', from_level: 'corporate', to_level: 'division', objective_title: 'Increase Sales' } ] 
    });

    render(<HoshinPage />);
    
    // Click Cascada
    fireEvent.click(screen.getByText('🏢 Cascada'));
    await waitFor(() => {
      expect(screen.getByText(/Alineación:/i)).toBeInTheDocument();
    });

    // Click Catchball
    fireEvent.click(screen.getByText('🎾 Catchball'));
    await waitFor(() => {
      expect(screen.getByText(/Historial Catchball/i)).toBeInTheDocument();
      expect(screen.getByText(/Increase Sales/i)).toBeInTheDocument();
    });
  });

  it('should call API when synthesize button is clicked', async () => {
    vi.spyOn(SwrHooks, 'useXMatrix').mockReturnValue({ data: { stats: { total_objectives: 0 } }, isLoading: false, mutate: vi.fn() });
    vi.spyOn(SwrHooks, 'useCatchball').mockReturnValue({ data: [] });
    api.synthesizeHoshin.mockResolvedValue({ stats: { total_objectives: 10 } });

    render(<HoshinPage />);
    const btn = screen.getByRole('button', { name: /Sintetizar Hoshin/i });
    fireEvent.click(btn);

    expect(btn).toHaveTextContent(/Sintetizando Hoshin/i);
    await waitFor(() => {
      expect(api.synthesizeHoshin).toHaveBeenCalledWith('plan-123');
    });
  });
});
