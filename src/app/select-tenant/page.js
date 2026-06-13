'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function SelectTenantPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTenants() {
      try {
        const data = await api.getMyTenants();
        
        // Fast-track logic: If only 1 tenant, auto-select it
        if (data.length === 1) {
          await api.switchTenant(data[0].id);
          router.push('/select-plan');
          return;
        }
        
        setTenants(data);
      } catch (err) {
        setError('No se pudieron cargar los tenants. Por favor intenta de nuevo.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTenants();
  }, [router]);

  const handleSelectTenant = async (tenantId) => {
    setIsLoading(true);
    try {
      await api.switchTenant(tenantId);
      router.push('/select-plan');
    } catch (err) {
      setError('Error al cambiar de tenant.');
      setIsLoading(false);
    }
  };

  if (isLoading && tenants.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Cargando tus entornos...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: 600, padding: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Selecciona un Entorno</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Elige la organización o tenant al que deseas acceder</p>
        </div>

        {error && (
          <div style={{
            padding: '1rem', marginBottom: '1.5rem', borderRadius: 8,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            color: 'var(--danger-color)',
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tenants.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Sin acceso</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                No tienes ninguna organización asignada en este momento. Por favor contacta al administrador.
              </p>
              <button onClick={() => { api.logout(); router.push('/login'); }} className="btn btn-primary">
                Volver al inicio
              </button>
            </div>
          ) : (
            tenants.map(tenant => (
              <button
                key={tenant.id}
                onClick={() => handleSelectTenant(tenant.id)}
                disabled={isLoading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '1.5rem', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--surface-border)', borderRadius: 12,
                  cursor: isLoading ? 'wait' : 'pointer', transition: 'all 0.2s',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.borderColor = 'var(--surface-border)';
                  }
                }}
              >
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {tenant.name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ padding: '0.15rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>
                      Rol: {tenant.role}
                    </span>
                  </div>
                </div>
                <div style={{ color: 'var(--accent-primary)', fontSize: '1.5rem' }}>→</div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
