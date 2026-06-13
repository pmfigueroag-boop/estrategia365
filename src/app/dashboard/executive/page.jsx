'use client';

/**
 * Executive Command Center — Fase 4: Strategic OS
 * ==================================================
 * Role-based executive dashboards with 4 tabs (CEO/COO/CFO/CRO),
 * strategy cycle status, and real-time health indicators.
 */

import { useState } from 'react';
import {
  useCycleStatus,
  useExecutiveDashboard,
  usePulseTrend,
  useDoctrineCompliance,
  useMutation,
} from '@/features/shared/hooks/swr-hooks';
import api from '@/core/infrastructure/api';

const ROLES = [
  { key: 'ceo', label: 'CEO', icon: '👁️', desc: 'Salud Estratégica' },
  { key: 'coo', label: 'COO', icon: '⚙️', desc: 'Ejecución & Operaciones' },
  { key: 'cfo', label: 'CFO', icon: '💰', desc: 'Recursos & Exposición' },
  { key: 'cro', label: 'CRO', icon: '🛡️', desc: 'Riesgo & Resiliencia' },
];

const PHASE_LABELS = {
  sense: { label: 'SENSE', icon: '📡', color: 'var(--color-info)' },
  analyze: { label: 'ANALYZE', icon: '🔬', color: 'var(--color-warning)' },
  decide: { label: 'DECIDE', icon: '⚡', color: 'var(--color-accent)' },
  execute: { label: 'EXECUTE', icon: '🚀', color: 'var(--color-success)' },
  learn: { label: 'LEARN', icon: '📚', color: 'var(--color-secondary)' },
};

export default function ExecutivePage() {
  const institutionId = 1;
  const [activeRole, setActiveRole] = useState('ceo');

  const { data: cycleStatus, isLoading: cycleLoading } = useCycleStatus(institutionId);
  const { data: dashboard, isLoading: dashLoading } = useExecutiveDashboard(institutionId, activeRole);
  const { data: pulseData } = usePulseTrend(institutionId);
  const { data: doctrineData } = useDoctrineCompliance(institutionId);
  const { trigger: runCycle, isSubmitting } = useMutation(api.triggerStrategyCycle);

  const currentPhase = cycleStatus?.current_phase || 'sense';
  const phaseInfo = PHASE_LABELS[currentPhase] || PHASE_LABELS.sense;

  return (
    <div className="page-container">
      {/* ── Header ────────────────────────────────── */}
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <h1 className="page-title">Executive Command Center</h1>
          <span className="badge" style={{
            background: phaseInfo.color, color: '#fff', padding: '0.4rem 1rem',
            borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600,
          }}>
            {phaseInfo.icon} {phaseInfo.label}
          </span>
        </div>
        <p className="page-subtitle">
          Sistema operativo estratégico — ciclo continuo Sense → Analyze → Decide → Execute → Learn
        </p>
      </header>

      {/* ── Cycle Status Bar ──────────────────────── */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {Object.entries(PHASE_LABELS).map(([key, info]) => (
              <div key={key} style={{
                padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem',
                fontWeight: currentPhase === key ? 700 : 400,
                background: currentPhase === key ? info.color : 'var(--bg-elevated)',
                color: currentPhase === key ? '#fff' : 'var(--text-secondary)',
                opacity: currentPhase === key ? 1 : 0.6,
                transition: 'all 0.3s ease',
              }}>
                {info.icon} {info.label}
              </div>
            ))}
          </div>
          <button
            className="btn btn-primary"
            onClick={() => runCycle(institutionId)}
            disabled={isSubmitting}
            style={{ minWidth: '140px' }}
          >
            {isSubmitting ? '⏳ Ejecutando...' : '▶ Ejecutar Ciclo'}
          </button>
        </div>
        {cycleStatus?.recommended_action && (
          <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            💡 {cycleStatus.recommended_action}
          </p>
        )}
      </div>

      {/* ── Health KPIs ───────────────────────────── */}
      <div className="grid grid-3" style={{ marginBottom: '1.5rem' }}>
        <HealthCard
          label="Ejecución"
          value={cycleStatus?.execution_health || 0}
          icon="📊"
          loading={cycleLoading}
        />
        <HealthCard
          label="Inteligencia"
          value={cycleStatus?.intelligence_coverage || 0}
          icon="🧠"
          loading={cycleLoading}
        />
        <HealthCard
          label="Digital Twin"
          value={cycleStatus?.twin_completeness || 0}
          icon="🧬"
          loading={cycleLoading}
        />
      </div>

      {/* ── Role Tabs ─────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
        {ROLES.map(role => (
          <button
            key={role.key}
            onClick={() => setActiveRole(role.key)}
            className={`tab ${activeRole === role.key ? 'tab-active' : ''}`}
            style={{
              padding: '0.75rem 1.5rem', borderRadius: '10px', border: 'none',
              cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
              background: activeRole === role.key ? 'var(--color-primary)' : 'var(--bg-elevated)',
              color: activeRole === role.key ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s ease', whiteSpace: 'nowrap',
            }}
          >
            {role.icon} {role.label}
            <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 400, opacity: 0.8 }}>
              {role.desc}
            </span>
          </button>
        ))}
      </div>

      {/* ── Dashboard Content ─────────────────────── */}
      <div className="card" style={{ padding: '1.5rem', minHeight: '300px' }}>
        {dashLoading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Cargando dashboard {activeRole.toUpperCase()}...</p>
        ) : dashboard ? (
          <RoleDashboard role={activeRole} data={dashboard} />
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>
            Sin datos disponibles. Cree un plan estratégico para activar el dashboard ejecutivo.
          </p>
        )}
      </div>

      {/* ── Doctrine Compliance ───────────────────── */}
      <div className="grid grid-2" style={{ marginTop: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>📜 Cumplimiento Doctrinal</h3>
          {doctrineData ? (
            <>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: doctrineData.compliance_score >= 70 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                {doctrineData.compliance_score}%
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {doctrineData.compliant_decisions || 0}/{doctrineData.total_decisions || 0} decisiones cumplen
              </p>
              {doctrineData.balance_warning && (
                <p style={{ fontSize: '0.8rem', color: 'var(--color-warning)', marginTop: '0.5rem' }}>
                  ⚠️ {doctrineData.balance_warning}
                </p>
              )}
            </>
          ) : <p style={{ color: 'var(--text-secondary)' }}>Sin kernel activo</p>}
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>📈 Tendencia de Pulsos</h3>
          {pulseData?.trend?.length > 0 ? (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {pulseData.trend.map((p, i) => (
                <div key={i} style={{
                  padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem',
                  background: p.execution_health >= 60 ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
                  color: p.execution_health >= 60 ? 'var(--color-success)' : 'var(--color-warning)',
                }}>
                  {p.phase} — {p.execution_health}%
                </div>
              ))}
            </div>
          ) : <p style={{ color: 'var(--text-secondary)' }}>Sin pulsos registrados</p>}
        </div>
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════

function HealthCard({ label, value, icon, loading }) {
  const color = value >= 70 ? 'var(--color-success)' : value >= 40 ? 'var(--color-warning)' : 'var(--color-danger)';
  return (
    <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
      <div style={{ fontSize: '1.5rem' }}>{icon}</div>
      <div style={{ fontSize: '2rem', fontWeight: 700, color }}>
        {loading ? '—' : `${Math.round(value)}%`}
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{label}</div>
    </div>
  );
}


function RoleDashboard({ role, data }) {
  switch (role) {
    case 'ceo': return <CEOView data={data} />;
    case 'coo': return <COOView data={data} />;
    case 'cfo': return <CFOView data={data} />;
    case 'cro': return <CROView data={data} />;
    default: return null;
  }
}


function CEOView({ data }) {
  const health = data.health_indicators || {};
  const decisions = data.top_decisions || [];
  return (
    <>
      <h3 style={{ marginBottom: '1rem' }}>👁️ Vista CEO — Salud Estratégica</h3>
      <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
        <MetricRow label="Salud de ejecución" value={`${health.execution_health || 0}%`} />
        <MetricRow label="Cobertura inteligencia" value={`${health.intelligence_coverage || 0}%`} />
        <MetricRow label="Completitud Twin" value={`${health.twin_completeness || 0}%`} />
        <MetricRow label="Confianza del Kernel" value={`${((health.kernel_confidence || 0) * 100).toFixed(0)}%`} />
        <MetricRow label="Cumplimiento doctrinal" value={`${health.doctrine_compliance || 0}%`} />
      </div>
      {decisions.length > 0 && (
        <>
          <h4 style={{ marginBottom: '0.5rem' }}>Top Decisiones</h4>
          {decisions.map((d, i) => (
            <div key={i} style={{
              padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-elevated)',
              marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <strong>{d.title}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                  [{d.category}] {d.status}
                </span>
              </div>
              <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                {d.composite_score?.toFixed(1) || '—'}
              </span>
            </div>
          ))}
        </>
      )}
    </>
  );
}


function COOView({ data }) {
  const pipeline = data.decision_pipeline || {};
  const gaps = data.capability_gaps || [];
  return (
    <>
      <h3 style={{ marginBottom: '1rem' }}>⚙️ Vista COO — Ejecución & Operaciones</h3>
      <div className="grid grid-3" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
        <MetricRow label="Salud ejecución" value={`${data.execution_health || 0}%`} />
        <MetricRow label="Progreso OKR" value={`${data.okr?.avg_kr_progress || 0}%`} />
        <MetricRow label="Progreso BSC" value={`${data.bsc?.avg_progress || 0}%`} />
      </div>
      {data.has_drift && (
        <div style={{
          padding: '0.75rem', borderRadius: '8px', background: 'var(--color-danger-bg)',
          color: 'var(--color-danger)', marginBottom: '1rem', fontSize: '0.9rem',
        }}>
          ⚠️ DRIFT DETECTADO — La ejecución se ha desviado del plan. Revise OKRs estancados.
        </div>
      )}
      {pipeline.stages && (
        <>
          <h4 style={{ marginBottom: '0.5rem' }}>Pipeline de Decisiones ({pipeline.total || 0})</h4>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {Object.entries(pipeline.stages).map(([stage, count]) => (
              <span key={stage} style={{
                padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem',
                background: 'var(--bg-elevated)', color: 'var(--text-primary)',
              }}>
                {stage}: <strong>{count}</strong>
              </span>
            ))}
          </div>
        </>
      )}
      {gaps.length > 0 && (
        <>
          <h4 style={{ marginBottom: '0.5rem' }}>Brechas de Capacidad</h4>
          {gaps.map((g, i) => (
            <div key={i} style={{
              padding: '0.5rem', borderLeft: `3px solid ${g.severity === 'critical' ? 'var(--color-danger)' : 'var(--color-warning)'}`,
              marginBottom: '0.5rem', paddingLeft: '0.75rem',
            }}>
              <strong>{g.capability}</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                [{g.severity}]
              </span>
            </div>
          ))}
        </>
      )}
    </>
  );
}


function CFOView({ data }) {
  const summary = data.resource_summary || {};
  return (
    <>
      <h3 style={{ marginBottom: '1rem' }}>💰 Vista CFO — Recursos & Exposición</h3>
      <div className="grid grid-3" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
        <MetricRow label="Presupuesto total" value={`${summary.total_budget_m || 0}M`} />
        <MetricRow label="Exposición negativa" value={`${summary.total_downside_m || 0}M`} />
        <MetricRow label="FTEs requeridos" value={summary.total_fte || 0} />
      </div>
      <MetricRow label="Ratio exposición/presupuesto" value={`${((summary.exposure_ratio || 0) * 100).toFixed(0)}%`} />
      {data.high_risk_decisions?.length > 0 && (
        <>
          <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
            🔴 Decisiones de Alto Riesgo ({data.high_risk_decisions.length})
          </h4>
          {data.high_risk_decisions.map((d, i) => (
            <div key={i} style={{
              padding: '0.75rem', borderRadius: '8px', background: 'var(--color-danger-bg)',
              marginBottom: '0.5rem', fontSize: '0.85rem',
            }}>
              <strong>{d.title}</strong> — Budget: {d.budget}M | Risk: {d.risk}/10 | Downside: {d.downside}M
            </div>
          ))}
        </>
      )}
    </>
  );
}


function CROView({ data }) {
  const summary = data.risk_summary || {};
  return (
    <>
      <h3 style={{ marginBottom: '1rem' }}>🛡️ Vista CRO — Riesgo & Resiliencia</h3>
      <div className="grid grid-3" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
        <MetricRow label="Riesgos totales" value={summary.total_risks || 0} />
        <MetricRow label="Riesgos críticos" value={summary.critical_risks || 0} />
        <MetricRow label="Risk Score" value={`${summary.risk_score || 0}%`} />
      </div>
      {data.heat_map?.length > 0 && (
        <>
          <h4 style={{ marginBottom: '0.5rem' }}>Heat Map de Riesgos</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {data.heat_map.map((r, i) => (
              <div key={i} style={{
                padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem',
                background: r.quadrant === 'critical' ? 'var(--color-danger-bg)' :
                             r.quadrant === 'mitigate' ? 'var(--color-warning-bg)' : 'var(--bg-elevated)',
                color: r.quadrant === 'critical' ? 'var(--color-danger)' :
                       r.quadrant === 'mitigate' ? 'var(--color-warning)' : 'var(--text-secondary)',
              }}>
                {r.risk.slice(0, 40)}
                <span style={{ marginLeft: '0.5rem', fontWeight: 600 }}>
                  [{r.quadrant.toUpperCase()}]
                </span>
              </div>
            ))}
          </div>
        </>
      )}
      {data.pestel_urgency?.length > 0 && (
        <>
          <h4 style={{ marginBottom: '0.5rem' }}>PESTEL — Señales Urgentes</h4>
          {data.pestel_urgency.slice(0, 5).map((s, i) => (
            <div key={i} style={{
              padding: '0.5rem', borderLeft: '3px solid var(--color-warning)',
              marginBottom: '0.5rem', paddingLeft: '0.75rem', fontSize: '0.85rem',
            }}>
              [{s.factor}] <strong>{s.title}</strong>
              <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                Severidad: {s.severity}
              </span>
            </div>
          ))}
        </>
      )}
    </>
  );
}


function MetricRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{label}</span>
      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{value}</span>
    </div>
  );
}
