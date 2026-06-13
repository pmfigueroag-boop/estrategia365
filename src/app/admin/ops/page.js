'use client';
import { useState } from 'react';
import { usePlanContext } from '@/features/plan/context/PlanContext';
import SLODashboard from '@/features/ops/components/SLODashboard';
import AIHealthPanel from '@/features/ops/components/AIHealthPanel';
import LogViewer from '@/features/ops/components/LogViewer';
import PerformanceMetrics from '@/features/ops/components/PerformanceMetrics';
import { SectionErrorBoundary } from '@/components/ErrorBoundary';

export default function OpsPage() {
  const { planId } = usePlanContext();
  const [activeView, setActiveView] = useState('slos');

  const VIEWS = [
    { id: 'slos', label: '🎯 SLOs', icon: '🎯' },
    { id: 'ai-health', label: '🤖 AI Health', icon: '🤖' },
    { id: 'logs', label: '📋 Logs', icon: '📋' },
    { id: 'performance', label: '⚡ Performance', icon: '⚡' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🖥️ Operations Console</h1>
        <p className="page-subtitle">
          Observabilidad, SLOs, Health Checks y Performance en Tiempo Real
          {planId && <span className="plan-badge" style={{ marginLeft: 8 }}>(Plan #{planId})</span>}
        </p>
      </div>

      {/* Status bar */}
      <div className="glass-panel" style={{
        padding: '0.75rem 1.5rem', marginBottom: '1.5rem',
        display: 'flex', alignItems: 'center', gap: '1.5rem',
        borderLeft: '4px solid #10b981',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>Sistema Operativo</span>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
          Última actualización: {new Date().toLocaleTimeString()}
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {VIEWS.map(v => (
          <button key={v.id} onClick={() => setActiveView(v.id)}
            className={`btn ${activeView === v.id ? 'btn-primary' : ''}`}
            style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}>
            {v.label}
          </button>
        ))}
      </div>

      {/* Views */}
      {activeView === 'slos' && (
        <SectionErrorBoundary label="SLO Dashboard">
          <SLODashboard />
        </SectionErrorBoundary>
      )}

      {activeView === 'ai-health' && (
        <SectionErrorBoundary label="AI Health">
          <AIHealthPanel planId={planId} />
        </SectionErrorBoundary>
      )}

      {activeView === 'logs' && (
        <SectionErrorBoundary label="Log Viewer">
          <LogViewer />
        </SectionErrorBoundary>
      )}

      {activeView === 'performance' && (
        <SectionErrorBoundary label="Performance">
          <PerformanceMetrics />
        </SectionErrorBoundary>
      )}
    </div>
  );
}
