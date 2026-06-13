'use client';
import { useState } from 'react';
import Link from 'next/link';
import api from '@/core/infrastructure/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    
    try {
      await api.recoverPassword(email);
      setStatus('success');
    } catch (err) {
      setErrorMessage(err.message || 'Error al intentar recuperar la contraseña');
      setStatus('error');
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
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            <span className="text-gradient">Estrategia 365</span>
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Recuperar contraseña
          </p>
        </div>

        {status === 'success' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--success-color)' }}>Correo enviado</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: '1.5' }}>
              Si el correo <strong>{email}</strong> está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
            </p>
            <Link href="/login" className="btn btn-primary" style={{ width: '100%', textDecoration: 'none' }}>
              Volver al inicio de sesión
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
              <div>
                <label className="form-label" htmlFor="recovery-email">Correo electrónico</label>
                <input
                  id="recovery-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  autoFocus
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
                {status === 'loading' ? '⏳ Enviando...' : 'Enviar enlace de recuperación'}
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
