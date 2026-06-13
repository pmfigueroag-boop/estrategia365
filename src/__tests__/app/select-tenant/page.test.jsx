import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import SelectTenantPage from '@/app/select-tenant/page';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
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
      expect(screen.getByText('Sin acceso')).toBeInTheDocument();
      expect(screen.getByText(/No tienes ninguna organización asignada/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Volver al inicio/i })).toBeInTheDocument();
    });
  });
});
