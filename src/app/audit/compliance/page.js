'use client';
import { useState } from 'react';
import { usePlanContext } from '@/context/PlanContext';
import api from '@/lib/api';
import SOC2Matrix from '@/components/compliance/SOC2Matrix';
import RiskHeatmap from '@/components/compliance/RiskHeatmap';
import DoctrineViewer from '@/components/compliance/DoctrineViewer';
import { SectionErrorBoundary } from '@/components/ErrorBoundary';

export default function CompliancePage() {
  const { planId } = usePlanContext();
  const [activeView, setActiveView] = useState('soc2');

  const VIEWS = [
    { id: 'soc2', label: '🏛️ SOC2 Controls' },
    { id: 'risks', label: '🔥 Risk Register' },
    { id: 'doctrine', label: '📖 Doctrinas' },
    { id: 'exports', label: '📥 Exportar Auditoría' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">📋 Compliance & Audit</h1>
        <p className="page-subtitle">
          Controles SOC2, Registro de Riesgos, Doctrinas y Exportaciones de Auditoría
          {planId && <span className="plan-badge" style={{ marginLeft: 8 }}>(Plan #{planId})</span>}
        </p>
      </div>

      {/* Compliance summary bar */}
      <div className="glass-panel" style={{
        padding: '0.75rem 1.5rem', marginBottom: '1.5rem',
        display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap',
        borderLeft: '4px solid #6366f1',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.3rem' }}>🏛️</span>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Framework</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>SOC2 Type II + ISO 27001</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.3rem' }}>📖</span>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Doctrinas</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>7 Principios Institucionales</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.3rem' }}>🔐</span>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Trazabilidad</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>SHA-256 Immutable Chain</div>
          </div>
        </div>
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
      {activeView === 'soc2' && (
        <SectionErrorBoundary label="SOC2 Matrix">
          <SOC2Matrix />
        </SectionErrorBoundary>
      )}

      {activeView === 'risks' && (
        <SectionErrorBoundary label="Risk Register">
          <RiskHeatmap />
        </SectionErrorBoundary>
      )}

      {activeView === 'doctrine' && (
        <SectionErrorBoundary label="Doctrine Engine">
          <DoctrineViewer />
        </SectionErrorBoundary>
      )}

      {activeView === 'exports' && (
        <SectionErrorBoundary label="Audit Export">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {[
              { format: 'json', label: 'Audit Trail — JSON', desc: 'Registro completo en formato JSON para integración con sistemas SIEM.', icon: '📄', color: '#6366f1' },
              { format: 'csv', label: 'Audit Trail — CSV', desc: 'Formato tabular para auditoría manual y análisis en Excel.', icon: '📊', color: '#10b981' },
              { format: 'html', label: 'AI Audit Report — HTML', desc: 'Informe completo de auditoría IA con trazabilidad y decisiones.', icon: '🌐', color: '#f59e0b' },
            ].map(exp => (
              <div key={exp.format} className="glass-panel" style={{ padding: '1.5rem', borderTop: `3px solid ${exp.color}` }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{exp.icon}</div>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{exp.label}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{exp.desc}</p>
                {planId ? (
                  <a
                    href={exp.format === 'html'
                      ? api.getAuditExportUrl ? api.getAuditExportUrl(planId) : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/ai-governance/${planId}/audit-report/html`
                      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/ai-governance/${planId}/audit-report?format=${exp.format}`
                    }
                    target="_blank" rel="noreferrer"
                    className="btn btn-primary" style={{ textDecoration: 'none', fontSize: '0.85rem', display: 'inline-block' }}
                  >
                    📥 Exportar {exp.format.toUpperCase()}
                  </a>
                ) : (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Seleccione un plan primero</span>
                )}
              </div>
            ))}
          </div>
        </SectionErrorBoundary>
      )}
    </div>
  );
}
