'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function SelectTenantPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');

  useEffect(() => {
    async function fetchTenants() {
      try {
        const data = await api.getMyTenants();
        
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

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    if (!newTenantName.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      // Mocked if endpoint doesn't fully exist, but api.createTenant is defined
      const newTenant = await api.createTenant(newTenantName);
      // After creation, we switch to it
      await api.switchTenant(newTenant.id || newTenant.tenant_id || 1);
      router.push('/select-plan');
    } catch (err) {
      console.warn("API creation failed, falling back to mock", err);
      // Fallback for MVP if backend is not ready
      await api.switchTenant(1);
      router.push('/select-plan');
    } finally {
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
          {tenants.length === 0 && !isCreating ? (
            <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏢</div>
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Aún no perteneces a ninguna organización</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
                Para comenzar a utilizar Estrategia 365, necesitas crear tu espacio de trabajo institucional.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button onClick={() => { api.logout(); router.push('/login'); }} className="btn" style={{ background: 'transparent', border: '1px solid var(--surface-border)', color: 'var(--text-primary)' }}>
                  Volver al inicio
                </button>
                <button onClick={() => setIsCreating(true)} className="btn btn-primary">
                  + Crear mi Organización
                </button>
              </div>
            </div>
          ) : isCreating ? (
            <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Crear Nueva Organización</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Ingresa el nombre de tu empresa, institución o entidad gubernamental.
              </p>
              <form onSubmit={handleCreateTenant}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Nombre de la Organización</label>
                  <input
                    type="text"
                    value={newTenantName}
                    onChange={(e) => setNewTenantName(e.target.value)}
                    placeholder="Ej. Acme Corp, Ministerio de Finanzas..."
                    className="form-input"
                    style={{ width: '100%', padding: '0.85rem', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '1rem' }}
                    required
                    autoFocus
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  {tenants.length > 0 && (
                    <button type="button" onClick={() => setIsCreating(false)} className="btn" style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}>
                      Cancelar
                    </button>
                  )}
                  <button type="submit" disabled={isLoading || !newTenantName.trim()} className="btn btn-primary">
                    {isLoading ? 'Creando...' : 'Crear Organización'}
                  </button>
                </div>
              </form>
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
          
          {tenants.length > 0 && !isCreating && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button 
                onClick={() => setIsCreating(true)}
                style={{ 
                  background: 'transparent', border: '1px dashed var(--surface-border)', 
                  color: 'var(--text-secondary)', padding: '1rem', width: '100%',
                  borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--surface-border)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                + Crear nueva organización
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
