'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useToast } from '@/features/plan/context/ToastContext';
import { usePlanContext } from '@/features/plan/context/PlanContext';
import BudgetGauge from '@/features/governance/components/BudgetGauge';
import QualityGatePanel from '@/features/governance/components/QualityGatePanel';
import MaturityRadar from '@/features/governance/components/MaturityRadar';
import ReasoningTimeline from '@/features/governance/components/ReasoningTimeline';
import { SectionErrorBoundary } from '@/components/ErrorBoundary';

export default function GovernancePage() {
  const toast = useToast();
  const { planId } = usePlanContext();
  const [activeView, setActiveView] = useState('ai-budget');
  const [logs, setLogs] = useState([]);
  const [chainStatus, setChainStatus] = useState(null);
  const [kernelHistory, setKernelHistory] = useState([]);
  const [kernelStatus, setKernelStatus] = useState(null);
  const [ssoStatus, setSsoStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [tenantId, setTenantId] = useState(1); // TODO: from auth context

  useEffect(() => {
    if (!planId) { setIsLoading(false); return; }
    Promise.all([
      api.getAuditTrail(planId).catch(() => ({ logs: [], is_valid: null })),
      api.getKernelHistory(planId).catch(() => []),
      api.getKernelStatus(planId).catch(() => null),
      api.getSsoStatus().catch(() => null),
    ]).then(([audit, history, status, sso]) => {
      setLogs(audit.logs || []);
      setChainStatus(audit.is_valid);
      setKernelHistory(Array.isArray(history) ? history : []);
      setKernelStatus(status);
      setSsoStatus(sso);
      setIsLoading(false);
    });
  }, [planId]);

  const handleVerifyChain = async () => {
    setIsVerifying(true);
    try {
      const data = await api.getAuditTrail(planId);
      setChainStatus(data.is_valid);
      if (data.is_valid) toast.success("Cadena verificada: Integridad Criptográfica 100%");
      else toast.error("Cadena comprometida — revisar inmediatamente.");
    } catch (e) { toast.error(e.message); }
    setIsVerifying(false);
  };

  if (!planId) return <div className="animate-fade-in glass-panel empty-state">No hay un plan activo. Ve a <a href="/formulation" className="text-gradient" style={{ fontWeight: 600 }}>Formulación</a>.</div>;
  if (isLoading) return <div className="animate-fade-in glass-panel empty-state">Cargando módulo de Gobernanza...</div>;

  const VIEWS = [
    { id: 'ai-budget', label: '🔋 Presupuesto IA', group: 'ai' },
    { id: 'quality', label: '🛡️ Quality Gate', group: 'ai' },
    { id: 'maturity', label: '🧠 Madurez IA', group: 'ai' },
    { id: 'reasoning', label: '🔗 Razonamiento', group: 'ai' },
    { id: 'audit', label: `📋 Auditoría (${logs.length})`, group: 'gov' },
    { id: 'history', label: '📜 Historial Kernel', group: 'gov' },
    { id: 'exports', label: '📥 Exportaciones', group: 'gov' },
    { id: 'security', label: '🔐 Seguridad', group: 'gov' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🛡️ Gobernanza & AI Governance</h1>
        <p className="page-subtitle">Control Institucional, Inteligencia Artificial y Compliance <span className="plan-badge">(Plan #{planId})</span></p>
      </div>

      {/* Chain Status Banner */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${chainStatus ? 'var(--success-color)' : chainStatus === false ? 'var(--danger-color)' : 'var(--text-tertiary)'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '1.5rem' }}>{chainStatus ? '🔒' : chainStatus === false ? '🚨' : '❓'}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: chainStatus ? 'var(--success-color)' : chainStatus === false ? 'var(--danger-color)' : 'var(--text-secondary)' }}>
              Cadena SHA-256: {chainStatus ? 'VÁLIDA' : chainStatus === false ? 'COMPROMETIDA' : 'Sin verificar'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{logs.length} eventos · {logs.filter(l => l.actor !== 'system').length} firma humana</div>
          </div>
        </div>
        <button onClick={handleVerifyChain} disabled={isVerifying} className="btn" style={{ fontSize: '0.8rem' }}>
          {isVerifying ? '⏳ Verificando...' : '🔄 Re-Verificar'}
        </button>
      </div>

      {/* Tab Groups */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginBottom: '0.4rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Governance</div>
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          {VIEWS.filter(v => v.group === 'ai').map(v => (
            <button key={v.id} onClick={() => setActiveView(v.id)} className={`btn ${activeView === v.id ? 'btn-primary' : ''}`} style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}>
              {v.label}
            </button>
          ))}
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginBottom: '0.4rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gobernanza Institucional</div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {VIEWS.filter(v => v.group === 'gov').map(v => (
            <button key={v.id} onClick={() => setActiveView(v.id)} className={`btn ${activeView === v.id ? 'btn-primary' : ''}`} style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══════ AI GOVERNANCE VIEWS ══════ */}

      {activeView === 'ai-budget' && (
        <SectionErrorBoundary label="Presupuesto IA">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            <BudgetGauge tenantId={tenantId} />
          </div>
        </SectionErrorBoundary>
      )}

      {activeView === 'quality' && (
        <SectionErrorBoundary label="Quality Gate">
          <QualityGatePanel planId={planId} />
        </SectionErrorBoundary>
      )}

      {activeView === 'maturity' && (
        <SectionErrorBoundary label="Madurez IA">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            <MaturityRadar tenantId={tenantId} />
          </div>
        </SectionErrorBoundary>
      )}

      {activeView === 'reasoning' && (
        <SectionErrorBoundary label="Razonamiento">
          <ReasoningTimeline planId={planId} />
        </SectionErrorBoundary>
      )}

      {/* ══════ INSTITUTIONAL GOVERNANCE VIEWS ══════ */}

      {activeView === 'audit' && (
        <div className="glass-panel governance-panel animate-fade-in">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Registro Forense (Event Sourcing)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="exec-table">
              <thead>
                <tr>
                  <th>Timestamp</th><th>Actor</th><th>Acción</th><th>Entidad</th><th>Hash SHA-256</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} style={{ backgroundColor: log.actor === 'system' ? 'transparent' : 'rgba(16,185,129,0.04)' }}>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-tertiary)' }}>{new Date(log.created_at).toLocaleString()}</td>
                    <td style={{ fontWeight: 600, color: log.actor === 'system' ? 'var(--text-secondary)' : 'var(--accent-primary)' }}>{log.actor}</td>
                    <td>{log.action}</td>
                    <td style={{ color: 'var(--accent-secondary)' }}>{log.entity} #{log.entity_id}</td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-tertiary)', fontSize: '0.75rem' }} title={log.hash_signature}>
                      {log.hash_signature?.substring(0, 16)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No hay eventos registrados.</p>}
          </div>
        </div>
      )}

      {activeView === 'history' && (
        <div className="animate-fade-in">
          {kernelStatus && (
            <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-primary)' }}>
              <div style={{ fontSize: '0.85rem' }}>
                <strong>Estado Actual:</strong> <span className={`governance-badge ${kernelStatus.status === 'active' ? 'valid' : 'pending'}`}>{kernelStatus.status}</span>
                {kernelStatus.version && <span style={{ marginLeft: '1rem', color: 'var(--text-secondary)' }}>Versión: {kernelStatus.version}</span>}
              </div>
            </div>
          )}
          <h3 style={{ marginBottom: '1rem' }}>📜 Historial de Versiones del Kernel</h3>
          {kernelHistory.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No hay versiones históricas disponibles.</p>
          ) : (
            kernelHistory.map((k, i) => (
              <div key={i} className="timeline-item" style={{ marginLeft: '0.5rem' }}>
                <div className="glass-panel" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong>v{k.version || i + 1}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{k.created_at ? new Date(k.created_at).toLocaleString() : ''}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{k.diagnosis?.substring(0, 150)}...</p>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.4rem', color: 'var(--text-tertiary)' }}>
                    Confianza: {k.confidence_score ? `${(k.confidence_score * 100).toFixed(0)}%` : '—'} · Decisiones: {k.decision_count || '—'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeView === 'exports' && (
        <div className="animate-fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {[
              { format: 'pei', label: 'Plan Estratégico Institucional (PEI)', desc: 'Formato MEPyD conforme Decreto 267-08', icon: '🏛️', color: '#3b82f6' },
              { format: 'snpip', label: 'Ficha SNPIP', desc: 'Sistema Nacional de Planificación e Inversión Pública', icon: '📋', color: '#10b981' },
              { format: 'opp', label: 'Informe OPP', desc: 'Oficina de Productividad — Presupuesto por Resultados', icon: '💰', color: '#f59e0b' },
            ].map(exp => (
              <div key={exp.format} className="glass-panel" style={{ padding: '1.5rem', borderTop: `3px solid ${exp.color}` }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{exp.icon}</div>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{exp.label}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{exp.desc}</p>
                <a href={api.getInstitutionalExportUrl(planId, exp.format)} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ textDecoration: 'none', fontSize: '0.85rem', display: 'inline-block' }}>
                  📥 Exportar {exp.format.toUpperCase()}
                </a>
              </div>
            ))}
            <div className="glass-panel" style={{ padding: '1.5rem', borderTop: '3px solid var(--color-governance)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔍</div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Audit Trail Export</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Registro forense inmutable para la Contraloría General.</p>
              <a href={api.getAuditExportUrl(planId)} target="_blank" rel="noreferrer" className="btn" style={{ textDecoration: 'none', fontSize: '0.85rem', display: 'inline-block', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--surface-border)' }}>
                📥 Exportar HTML/PDF
              </a>
            </div>
          </div>
        </div>
      )}

      {activeView === 'security' && (
        <div className="animate-fade-in">
          {ssoStatus && (
            <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: `4px solid ${ssoStatus.sso_status === 'CONFIGURED' ? 'var(--success-color)' : 'var(--warning-color)'}` }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>🔐 SSO/SAML — {ssoStatus.sso_status}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{ssoStatus.detail}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>Protocolos Soportados</div>
                  {ssoStatus.supported_protocols?.map(p => (
                    <div key={p} className="domain-badge governance" style={{ display: 'block', marginBottom: '0.3rem' }}>{p}</div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>Proveedores Soportados</div>
                  {ssoStatus.supported_providers?.map(p => (
                    <div key={p} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>• {p}</div>
                  ))}
                </div>
              </div>
              {ssoStatus.sector_publico?.supported && (
                <div className="evidence-block" style={{ marginTop: '1rem' }}>
                  <div className="evidence-label">Sector Público</div>
                  {ssoStatus.sector_publico.note}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
