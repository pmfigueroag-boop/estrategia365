"use client";
import { useParadigm } from '@/features/plan/context/ParadigmContext';
import { useToast } from '@/features/plan/context/ToastContext';
import { usePlanContext } from '@/features/plan/context/PlanContext';
import { useState } from 'react';
import { usePestel } from '@/lib/swr-hooks';
import api from '@/lib/api';
import { PestelRadar } from '@/features/charts/components';

const SEVERITY_COLORS = {
  high: 'var(--danger-color)',
  medium: 'var(--warning-color)',
  low: 'var(--success-color)',
};

const SEVERITY_LABELS = {
  high: 'Alta Volatilidad',
  medium: 'Moderada',
  low: 'Oportunidad',
};

const FACTOR_LABELS = {
  P: 'P — Político & Legal',
  E: 'E — Económico',
  S: 'S — Social & Demográfico',
  T: 'T — Tecnológico',
  E2: 'E2 — Ecológico / Ambiental',
  L: 'L — Legal & Regulatorio',
};

export default function AwarenessPage() {
  const { activeParadigm } = useParadigm();
  const toast = useToast();
  const { planId } = usePlanContext();
  const { data: signals = [], mutate: mutateSignals } = usePestel(planId);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);

  const handleScan = async () => {
    if (!planId) {
      toast.warning("No hay un plan activo. Ve a Formulación primero.");
      return;
    }
    setIsScanning(true);
    setError(null);
    try {
      await api.clearSignals(planId);
      const data = await api.scanPESTEL(parseInt(planId));
      mutateSignals(data, false);
    } catch (err) {
      setError(err.message || 'Error al escanear el entorno.');
    }
    setIsScanning(false);
  };

  // Separate signals into threats/opportunities for FODA sidebar
  const threats = signals.filter(s => s.severity === 'high');
  const opportunities = signals.filter(s => s.severity === 'low');

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Strategic Awareness</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Diagnóstico Dinámico: PESTEL 2.0 y Señales de Inteligencia Competitiva
            {planId && <span style={{ color: 'var(--accent-primary)', marginLeft: '0.5rem' }}>(Plan #{planId})</span>}
          </p>
        </div>
        <div>
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isScanning ? 0.5 : 1 }}
          >
            {isScanning ? '⏳ Escaneando con IA...' : '🔄 Sincronizar Señales IA'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-color)', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--danger-color)' }}>
          {error}
        </div>
      )}

      {!planId && (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
            No hay un plan estratégico activo. Ve a <a href="/formulation" className="text-gradient" style={{ fontWeight: 600 }}>Formulación</a> para crear uno.
          </p>
        </div>
      )}

      {planId && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 2fr) 1fr', gap: '2rem' }}>
          
          {/* PESTEL Radar/List */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
              Radar PESTEL
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                {signals.length > 0 ? `${signals.length} señales · ${signals[0]?.source || 'AI'}` : 'Sin datos — ejecuta un escaneo'}
              </span>
            </h2>
            
            <div className="flex-col gap-6">
              {signals.length === 0 && !isScanning && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  Presiona "Sincronizar Señales IA" para generar el análisis PESTEL con Inteligencia Artificial.
                </div>
              )}

              {signals.map((signal, idx) => (
                <div
                  key={signal.id || idx}
                  className="animate-fade-in"
                  style={{
                    background: 'rgba(0,0,0,0.2)',
                    padding: '1rem',
                    borderRadius: '12px',
                    borderLeft: `4px solid ${SEVERITY_COLORS[signal.severity] || 'var(--surface-border)'}`,
                    animationDelay: `${idx * 80}ms`
                  }}
                >
                  <div className="flex justify-between" style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '1.1rem' }}>{FACTOR_LABELS[signal.factor] || signal.factor}</strong>
                    <span style={{ color: SEVERITY_COLORS[signal.severity], fontSize: '0.85rem', fontWeight: 600 }}>
                      {SEVERITY_LABELS[signal.severity] || signal.severity}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>{signal.title}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{signal.description}</p>
                  {signal.strategic_impact && (
                    <strong style={{ display: 'block', marginTop: '0.5rem', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                      Impacto Estratégico: {signal.strategic_impact}
                    </strong>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic SWOT Synthesis */}
          <div className="flex-col gap-6">
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>FODA Vectorizado</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Oportunidades y Amenazas extraídas del análisis IA.
              </p>
              
              <div className="flex-col gap-4">
                {opportunities.map((sig, i) => (
                  <div key={`opp-${i}`} style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success-color)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--success-color)', textTransform: 'uppercase', letterSpacing: '1px' }}>Oportunidad</span>
                    <p style={{ fontSize: '0.95rem', marginTop: '0.25rem' }}>{sig.title}</p>
                  </div>
                ))}
                
                {threats.map((sig, i) => (
                  <div key={`thr-${i}`} style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-color)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--danger-color)', textTransform: 'uppercase', letterSpacing: '1px' }}>Amenaza</span>
                    <p style={{ fontSize: '0.95rem', marginTop: '0.25rem' }}>{sig.title}</p>
                  </div>
                ))}

                {signals.length === 0 && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>
                    Ejecuta un escaneo para poblar.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
