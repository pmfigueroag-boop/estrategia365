'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

/**
 * AuthGuard — Wraps pages that require authentication.
 * Redirects to /login if no valid token exists.
 * In DEV_MODE (backend), auth may be bypassed, so this guard
 * is permissive: it attempts /auth/me and only redirects on hard 401.
 */
export default function AuthGuard({ children }) {
  const router = useRouter();
  const [status, setStatus] = useState('checking'); // checking | authenticated | redirecting

  useEffect(() => {
    // If no token at all, go straight to login
    if (!api.isAuthenticated()) {
      // Check if backend is in DEV_MODE by trying a public endpoint
      api.getHealth()
        .then(() => {
          // Backend is up — try to access without auth (DEV_MODE check)
          return api.getWorkspaceSummary();
        })
        .then(() => {
          // If this works without token, DEV_MODE is on — allow through
          setStatus('authenticated');
        })
        .catch(() => {
          setStatus('redirecting');
          router.replace('/login');
        });
      return;
    }

    // Validate the existing token
    api.getMe()
      .then(() => setStatus('authenticated'))
      .catch(() => {
        // Token expired/invalid — clear and redirect
        api.clearTokens();
        setStatus('redirecting');
        router.replace('/login');
      });
  }, [router]);

  if (status === 'checking') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: 'var(--text-secondary)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔒</div>
          <div>Verificando sesión...</div>
        </div>
      </div>
    );
  }

  if (status === 'redirecting') return null;

  return children;
}
