import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TwinPage from '@/app/twin/page';
import * as SwrHooks from '@/lib/swr-hooks';
import api from '@/lib/api';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@/lib/api', () => ({
  default: {
    captureSnapshot: vi.fn(),
  }
}));

// Provide default container size for Recharts
vi.mock('recharts', async () => {
  const OriginalRechartsModule = await vi.importActual('recharts');
  return {
    ...OriginalRechartsModule,
    ResponsiveContainer: ({ children }) => (
      <OriginalRechartsModule.ResponsiveContainer width={800} height={400}>
        {children}
      </OriginalRechartsModule.ResponsiveContainer>
    ),
  };
});

describe('TwinPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mocks
    vi.spyOn(SwrHooks, 'useTwinHealth').mockReturnValue({ 
      data: { completeness: { overall: 85, data_quality: 90, alignment: 80 }, trend: { direction: 'up', delta: 2.5 } }, 
      isLoading: false,
      mutate: vi.fn()
    });
    vi.spyOn(SwrHooks, 'useTwinSnapshots').mockReturnValue({ 
      data: [ { id: 'snap-1', version: 1, trigger: 'manual', captured_at: '2026-01-01T10:00:00Z', completeness_score: 85 } ], 
      isLoading: false,
      mutate: vi.fn()
    });
    vi.spyOn(SwrHooks, 'useTwinTimeline').mockReturnValue({ 
      data: [ { id: 'evt-1', event_type: 'strategic_shift', severity: 'medium', occurred_at: '2026-01-01T10:00:00Z', snapshot_version: 1, description: 'Shift in policy' } ], 
      isLoading: false 
    });
    vi.spyOn(SwrHooks, 'useTwinMetrics').mockReturnValue({ 
      data: [ { recorded_at: '2026-01-01T10:00:00Z', value: 85 } ], 
      isLoading: false 
    });
    
    // Mock useMutation hook since it's exported from swr-hooks
    vi.spyOn(SwrHooks, 'useMutation').mockReturnValue({
      trigger: vi.fn().mockResolvedValue({}),
      isSubmitting: false
    });
  });

  it('should show skeleton loaders initially', () => {
    vi.spyOn(SwrHooks, 'useTwinHealth').mockReturnValue({ data: null, isLoading: true });
    vi.spyOn(SwrHooks, 'useTwinSnapshots').mockReturnValue({ data: null, isLoading: true });
    vi.spyOn(SwrHooks, 'useTwinTimeline').mockReturnValue({ data: null, isLoading: true });
    
    const { container } = render(<TwinPage />);
    expect(container.querySelectorAll('.skeleton-kpi').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('.skeleton-card').length).toBeGreaterThan(0);
  });

  it('should show empty state if no health data exists', () => {
    vi.spyOn(SwrHooks, 'useTwinHealth').mockReturnValue({ data: null, isLoading: false });
    render(<TwinPage />);
    expect(screen.getByText(/No hay datos de twin disponibles/i)).toBeInTheDocument();
  });

  it('should render Digital Twin dashboard when data is loaded', () => {
    render(<TwinPage />);
    expect(screen.getByRole('heading', { name: /Digital Twin/i })).toBeInTheDocument();
    
    // Check KPIs
    expect(screen.getAllByText('85%')[0]).toBeInTheDocument();
    expect(screen.getByText(/Completitud General/i)).toBeInTheDocument();
    expect(screen.getByText('Excelente')).toBeInTheDocument(); // 85 is Excelente
    expect(screen.getByText('1')).toBeInTheDocument(); // 1 snapshot
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 dimensions tracked (data_quality, alignment)
    
    // Check Trends
    expect(screen.getByText(/↑ \+2\.5%/i)).toBeInTheDocument();

    // Check Dimensions
    expect(screen.getByText(/data quality/i)).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText(/alignment/i)).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();

    // Check History & Timeline
    expect(screen.getByText('v1')).toBeInTheDocument();
    expect(screen.getByText('manual')).toBeInTheDocument();
    expect(screen.getByText('strategic shift')).toBeInTheDocument();
    expect(screen.getByText('Shift in policy')).toBeInTheDocument();
  });

  it('should handle capturing snapshot', async () => {
    const triggerMock = vi.fn().mockResolvedValue({});
    vi.spyOn(SwrHooks, 'useMutation').mockReturnValue({
      trigger: triggerMock,
      isSubmitting: false
    });
    const mutateHealth = vi.fn();
    const mutateSnaps = vi.fn();
    vi.spyOn(SwrHooks, 'useTwinHealth').mockReturnValue({ data: { completeness: { overall: 85 } }, isLoading: false, mutate: mutateHealth });
    vi.spyOn(SwrHooks, 'useTwinSnapshots').mockReturnValue({ data: [], isLoading: false, mutate: mutateSnaps });

    render(<TwinPage />);
    
    const captureBtn = screen.getByRole('button', { name: /Capturar Snapshot/i });
    fireEvent.click(captureBtn);
    
    await waitFor(() => {
      expect(triggerMock).toHaveBeenCalled();
      expect(mutateHealth).toHaveBeenCalled();
      expect(mutateSnaps).toHaveBeenCalled();
    });
  });
});
