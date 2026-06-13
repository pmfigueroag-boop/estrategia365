'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function SelectPlanPage() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const data = await api.getTenantPlans();
        
        setPlans(data);
      } catch (err) {
        setError('No se pudieron cargar los planes estratégicos. Por favor intenta de nuevo.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPlans();
  }, [router]);

  const handleSelectPlan = (plan) => {
    localStorage.setItem('e365_active_plan_id', plan.id);
    localStorage.setItem('e365_active_plan_name', plan.mission || `Plan ${plan.id}`);
    router.push('/');
  };

  if (isLoading && plans.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Cargando planes estratégicos...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: 700, padding: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Selecciona un Plan Estratégico</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Elige el plan estratégico sobre el cual deseas trabajar</p>
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

        {plans.length === 0 && !isLoading && !error && (
          <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Sin planes estratégicos</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
              No hay planes estratégicos disponibles en esta organización. Inicia el proceso de Onboarding para formular el primero.
            </p>
            <button 
              onClick={() => router.push('/onboarding')}
              className="btn btn-primary"
            >
              + Crear mi primer Plan Estratégico
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {plans.map(plan => (
            <button
              key={plan.id}
              onClick={() => handleSelectPlan(plan)}
              disabled={isLoading}
              style={{
                display: 'flex', flexDirection: 'column',
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
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                }}>{plan.mission || 'Plan sin Misión Definida'}</span>
                <div style={{ color: 'var(--accent-primary)', fontSize: '1.2rem', marginLeft: '0.5rem' }}>→</div>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Horizonte: {plan.time_horizon_months} meses
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem' }}>
                 <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(59, 130, 246, 0.2)', color: 'rgb(147, 197, 253)', borderRadius: 4 }}>
                   Paradigma: {plan.paradigm_id}
                 </span>
              </div>
            </button>
          ))}
        </div>
        
        {plans.length > 0 && !isLoading && !error && (
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button 
              onClick={() => router.push('/onboarding')}
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
              + Crear nuevo Plan Estratégico
            </button>
          </div>
        )}

        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <button 
            onClick={() => router.push('/select-tenant')}
            style={{ 
              background: 'transparent', border: 'none', color: 'var(--text-secondary)', 
              cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' 
            }}
          >
            ← Volver a selección de Organización
          </button>
        </div>
      </div>
    </div>
  );
}
