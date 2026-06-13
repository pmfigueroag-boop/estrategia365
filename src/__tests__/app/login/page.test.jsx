import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import LoginPage from '@/app/login/page';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock the API library
vi.mock('@/lib/api', () => ({
  default: {
    login: vi.fn(),
    getSSOProviders: vi.fn(() => Promise.resolve([])),
  }
}));

describe('LoginPage Unit Tests', () => {
  let mockPush;

  beforeEach(() => {
    mockPush = vi.fn();
    useRouter.mockReturnValue({ push: mockPush });
    vi.clearAllMocks();
  });

  test('Renderiza los elementos iniciales correctamente', () => {
    render(<LoginPage />);
    
    // Verifies elements load
    expect(screen.getByText('Estrategia 365')).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Contraseña$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument();
  });

  test('Bloquea el envío si las credenciales están vacías (Validación HTML5 y Estado)', async () => {
    render(<LoginPage />);
    
    const submitBtn = screen.getByRole('button', { name: /Iniciar Sesión/i });
    
    // Attempt submit with empty fields
    fireEvent.click(submitBtn);

    // Assert API is NOT called because fields are empty (handled by browser validity or internal state)
    expect(api.login).not.toHaveBeenCalled();
    
    // Optional: Could test checkValidity here, but DOM interactions usually catch required fields
  });
});
