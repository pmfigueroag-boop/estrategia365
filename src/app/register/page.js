'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/core/infrastructure/api';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await api.register({
        email: email,
        full_name: fullName,
        password: password
      });
      setSuccess(true);
      // Optional: Auto login can be done here, or redirect to login.
      // We will redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err) {
      setError(err.message || 'Error al registrar la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>
      <div className="glass-panel" style={{
        width: '100%', maxWidth: 420, padding: '3rem',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            <span className="text-gradient">Crear Cuenta</span>
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Únete a Estrategia 365
          </p>
        </div>

        {/* Error / Success */}
        {error && (
          <div style={{
            padding: '0.75rem 1rem', marginBottom: '1.5rem', borderRadius: 8,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            color: 'var(--danger-color)', fontSize: '0.85rem',
          }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: '0.75rem 1rem', marginBottom: '1.5rem', borderRadius: 8,
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
            color: '#4ade80', fontSize: '0.85rem', textAlign: 'center'
          }}>
            ✅ ¡Cuenta creada con éxito! Redirigiendo...
          </div>
        )}

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="form-label" htmlFor="register-name">Nombre completo</label>
              <input
                id="register-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Juan Pérez"
                required
                autoFocus
                autoComplete="name"
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
                  background: 'rgba(0,0,0,0.2)', border: '1px solid var(--surface-border)',
                  color: 'var(--text-primary)', fontSize: '0.95rem',
                  outline: 'none', transition: 'border-color 0.2s',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--surface-border)'}
              />
            </div>

            <div>
              <label className="form-label" htmlFor="register-email">Correo electrónico</label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@empresa.com"
                required
                autoComplete="email"
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
                  background: 'rgba(0,0,0,0.2)', border: '1px solid var(--surface-border)',
                  color: 'var(--text-primary)', fontSize: '0.95rem',
                  outline: 'none', transition: 'border-color 0.2s',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--surface-border)'}
              />
            </div>

            <div>
              <label className="form-label" htmlFor="register-password">Contraseña</label>
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength="8"
                autoComplete="new-password"
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
                  background: 'rgba(0,0,0,0.2)', border: '1px solid var(--surface-border)',
                  color: 'var(--text-primary)', fontSize: '0.95rem',
                  outline: 'none', transition: 'border-color 0.2s',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--surface-border)'}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{
                width: '100%', padding: '0.85rem', fontSize: '1rem',
                marginTop: '0.5rem', opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? '⏳ Registrando...' : '🚀 Crear cuenta'}
            </button>
          </form>
        )}

        {/* Login Link */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>¿Ya tienes una cuenta? </span>
          <Link href="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>
            Inicia sesión
          </Link>
        </div>

      </div>
    </div>
  );
}
