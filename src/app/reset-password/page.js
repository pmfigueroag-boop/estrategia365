'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/core/infrastructure/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;
    if (!token) {
      Promise.resolve().then(() => {
        if (!active) return;
        setErrorMessage('Enlace inválido o expirado. Falta el token de recuperación.');
        setStatus('error');
      });
    }
    return () => { active = false; };
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden');
      setStatus('error');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');
    
    try {
      await api.resetPassword(token, password);
      setStatus('success');
    } catch (err) {
      setErrorMessage(err.message || 'El enlace ha expirado o es inválido');
      setStatus('error');
    }
  };

  if (!token && status === 'error') {
    return (
      <div className="animate-fade-in" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: 420, padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h3 style={{ marginBottom: '1rem', color: 'var(--danger-color)' }}>Enlace Inválido</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            El enlace de recuperación es inválido o falta el token de seguridad. Por favor, solicita uno nuevo.
          </p>
          <Link href="/forgot-password" className="btn btn-primary" style={{ textDecoration: 'none' }}>Solicitar nuevo enlace</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>
      <div className="glass-panel" style={{
        width: '100%', maxWidth: 420, padding: '3rem',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            <span className="text-gradient">Estrategia 365</span>
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Establecer nueva contraseña
          </p>
        </div>

        {status === 'success' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--success-color)' }}>Contraseña actualizada</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: '1.5' }}>
              Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tus nuevas credenciales.
            </p>
            <Link href="/login" className="btn btn-primary" style={{ width: '100%', textDecoration: 'none' }}>
              Iniciar Sesión
            </Link>
          </div>
        ) : (
          <>
            {status === 'error' && (
              <div style={{
                padding: '0.75rem 1rem', marginBottom: '1.5rem', borderRadius: 8,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                color: 'var(--danger-color)', fontSize: '0.85rem',
              }}>
                ⚠️ {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ position: 'relative' }}>
                <label className="form-label" htmlFor="new-password">Nueva Contraseña</label>
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
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
                    position: 'absolute', right: '0.75rem', top: '2.1rem',
                    background: 'none', border: 'none', color: 'var(--text-secondary)',
                    cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? "👁️‍🗨️" : "👁️"}
                </button>
              </div>

              <div>
                <label className="form-label" htmlFor="confirm-password">Confirmar Contraseña</label>
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
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
                disabled={status === 'loading'}
                className="btn btn-primary"
                style={{
                  width: '100%', padding: '0.85rem', fontSize: '1rem',
                  marginTop: '0.5rem', opacity: status === 'loading' ? 0.7 : 1,
                }}
              >
                {status === 'loading' ? '⏳ Guardando...' : 'Guardar nueva contraseña'}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
              <Link href="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--accent-primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
                Volver al inicio de sesión
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
