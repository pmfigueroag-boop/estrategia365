'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/core/infrastructure/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ssoProviders, setSsoProviders] = useState([]);

  useEffect(() => {
    // Fetch available SSO providers on mount
    api.getSSOProviders()
      .then(providers => setSsoProviders(providers.filter(p => p.enabled)))
      .catch(err => console.error("Could not fetch SSO providers:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await api.login(email, password);
      router.push('/select-tenant');
    } catch (err) {
      setError(err.message || 'Error de autenticación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSSO = (provider) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    // redirect to the backend SSO endpoint
    window.location.href = `${baseUrl}${provider.login_url}`;
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
            <span className="text-gradient">Estrategia 365</span>
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Inicia sesión para continuar
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '0.75rem 1rem', marginBottom: '1.5rem', borderRadius: 8,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            color: 'var(--danger-color)', fontSize: '0.85rem',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label className="form-label" htmlFor="login-email">Correo electrónico</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@estrategia365.local"
              required
              autoFocus
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

          <div style={{ position: 'relative' }}>
            <label className="form-label" htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              style={{
                width: '100%', padding: '0.75rem 2.5rem 0.75rem 1rem', borderRadius: 10,
                background: 'rgba(0,0,0,0.2)', border: '1px solid var(--surface-border)',
                color: 'var(--text-primary)', fontSize: '0.95rem',
                outline: 'none', transition: 'border-color 0.2s',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--surface-border)'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', right: '0.75rem', top: '2.5rem',
                background: 'rgba(255,255,255,0.1)', border: '1px solid var(--surface-border)', 
                color: 'var(--text-primary)', borderRadius: '6px',
                cursor: 'pointer', padding: '0.3rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 10
              }}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? "Ocultar" : "Ver"}
            </button>
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
            {isLoading ? '⏳ Autenticando...' : '🔐 Iniciar Sesión'}
          </button>
          
          <div style={{ textAlign: 'center', fontSize: '0.85rem', marginTop: '-0.5rem' }}>
            <button 
              type="button"
              onClick={() => router.push('/forgot-password')} 
              style={{ 
                background: 'none', border: 'none',
                color: 'var(--text-secondary)', textDecoration: 'none', 
                transition: 'color 0.2s', cursor: 'pointer', fontFamily: 'inherit'
              }} 
              onMouseEnter={(e) => e.target.style.color = 'var(--accent-primary)'} 
              onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </form>

        {/* Register Link */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>¿No tienes una cuenta? </span>
          <button 
            type="button"
            onClick={() => router.push('/register')} 
            style={{ 
              background: 'none', border: 'none',
              color: 'var(--accent-primary)', textDecoration: 'none', 
              fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit'
            }}>
            Regístrate aquí
          </button>
        </div>

        {/* SSO Options */}
        {ssoProviders.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--surface-border)' }}></div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                O entra con
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--surface-border)' }}></div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {ssoProviders.map(provider => (
                <button
                  key={provider.name}
                  type="button"
                  onClick={() => handleSSO(provider)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                    width: '100%', padding: '0.75rem', borderRadius: 8,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--surface-border)',
                    color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 500,
                    cursor: 'pointer', transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.borderColor = 'var(--text-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.borderColor = 'var(--surface-border)';
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{provider.icon}</span>
                  Continuar con {provider.display_name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem',
          color: 'var(--text-tertiary)',
        }}>
          Strategic Portfolio Management Platform
        </div>
      </div>
    </div>
  );
}

