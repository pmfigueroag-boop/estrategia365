import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import SelectTenantPage from '@/app/select-tenant/page';
import api from '@/core/infrastructure/api';
import { useRouter } from 'next/navigation';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/core/infrastructure/api', () => ({
  default: {
    getMyTenants: vi.fn(),
    logout: vi.fn(),
  }
}));

describe('SelectTenantPage Unit Tests', () => {
  let mockPush;

  beforeEach(() => {
    mockPush = vi.fn();
    useRouter.mockReturnValue({ push: mockPush });
    vi.clearAllMocks();
  });

  test('Renderiza estado vacío cuando no hay tenants', async () => {
    // Mock zero tenants
    api.getMyTenants.mockResolvedValue([]);

    render(<SelectTenantPage />);
    
    // initially loading
    expect(screen.getByText('Cargando tus entornos...')).toBeInTheDocument();

    // wait for the UI to update and show empty state
    await waitFor(() => {
      expect(screen.getByText('Aún no perteneces a ninguna organización')).toBeInTheDocument();
      expect(screen.getByText(/Para comenzar a utilizar Estrategia 365, necesitas crear tu espacio/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Volver al inicio/i })).toBeInTheDocument();
    });
  });
});
