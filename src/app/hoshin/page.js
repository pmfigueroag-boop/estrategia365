'use client';
import { useState } from 'react';
import api from '@/lib/api';
import { useToast } from '@/features/plan/context/ToastContext';
import { usePlanContext } from '@/features/plan/context/PlanContext';
import { useXMatrix, useCatchball } from '@/lib/swr-hooks';

const AXIS_META = {
  north: { label: 'Estrategias (3-5 años)', icon: '⬆️', color: '#3b82f6' },
  west: { label: 'Tácticas Anuales', icon: '⬅️', color: '#10b981' },
  south: { label: 'KPIs', icon: '⬇️', color: '#f59e0b' },
  east: { label: 'Responsables', icon: '➡️', color: '#8b5cf6' },
};

const STATUS_COLORS = {
  proposed: '#6b7280', negotiating: '#f59e0b', agreed: '#10b981', completed: '#3b82f6',
};

export default function HoshinPage() {
  const toast = useToast();
  const { planId } = usePlanContext();
  const [activeView, setActiveView] = useState('xmatrix');
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // SWR hooks
  const { data: xMatrix, isLoading, mutate: mutateXMatrix } = useXMatrix(planId);
  const { data: catchball = [] } = useCatchball(planId);
  const [cascade, setCascade] = useState(null);

  // Load cascade on mount (no dedicated hook yet)
  useState(() => {
    if (planId) api.getHoshinCascade(planId).then(setCascade).catch(() => {});
  });

  const handleSynthesize = async () => {
    setIsSynthesizing(true);
    try {
      const data = await api.synthesizeHoshin(planId);
      mutateXMatrix(data, false);
      toast.success(`Hoshin Kanri sintetizado: ${data.stats?.total_objectives || 0} objetivos, ${data.stats?.total_cells || 0} correlaciones.`);
      // Refresh cascade
      api.getHoshinCascade(planId).then(setCascade).catch(() => {});
    } catch (e) { toast.error(e.message); }
    setIsSynthesizing(false);
  };

  if (!planId) return <div className="animate-fade-in glass-panel empty-state">No hay un plan activo. Ve a <a href="/formulation" className="text-gradient" style={{ fontWeight: 600 }}>Formulación</a>.</div>;
  if (isLoading) return <div className="animate-fade-in glass-panel empty-state">Cargando Hoshin Kanri...</div>;

  const VIEWS = [
    { id: 'xmatrix', label: '🔲 X-Matrix' },
    { id: 'cascade', label: '🏢 Cascada' },
    { id: 'catchball', label: '🎾 Catchball' },
  ];

  const hasData = xMatrix && xMatrix.stats?.total_objectives > 0;

  // Empty state
  if (!hasData) {
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">🏯 Hoshin Kanri — Policy Deployment</h1>
          <p className="page-subtitle">Despliegue estratégico basado en Akao (1991) — X-Matrix & Catchball</p>
        </div>
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏯</div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>Generar Sistema Hoshin Kanri</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            El motor sintetizará el sistema completo de Policy Deployment a partir de tu Strategy Kernel, decisiones, TOWS, BSC y OKRs existentes. Incluye objetivos breakthrough, tácticas anuales, KPIs y correlaciones del X-Matrix.
          </p>
          <button onClick={handleSynthesize} disabled={isSynthesizing} className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '0.85rem 2.5rem' }}>
            {isSynthesizing ? '⏳ Sintetizando Hoshin...' : '🏯 Sintetizar Hoshin desde Kernel'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">🏯 Hoshin Kanri — X-Matrix</h1>
          <p className="page-subtitle">Policy Deployment (Akao, 1991) — Plan #{planId}</p>
        </div>
        <button onClick={handleSynthesize} disabled={isSynthesizing} className="btn" style={{ fontSize: '0.8rem' }}>
          {isSynthesizing ? '⏳ Regenerando...' : '🔄 Regenerar Hoshin'}
        </button>
      </div>

      {/* Stats Banner */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap', borderLeft: '4px solid var(--color-hoshin)' }}>
        {[
          { label: 'Objetivos', value: xMatrix.stats.total_objectives, color: 'var(--text-primary)' },
          { label: 'Breakthroughs', value: xMatrix.stats.breakthroughs, color: '#3b82f6' },
          { label: 'Fundamentals', value: xMatrix.stats.fundamentals, color: '#10b981' },
          { label: 'Correlaciones', value: xMatrix.stats.total_cells, color: '#f59e0b' },
          { label: 'Fuertes', value: xMatrix.stats.strong_correlations, color: '#ef4444' },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Narrative */}
      {xMatrix.summary && (
        <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-secondary)', fontSize: '0.9rem' }}>
          <strong style={{ color: 'var(--accent-secondary)' }}>🏯 True North:</strong> {xMatrix.summary}
        </div>
      )}

      {/* View Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {VIEWS.map(v => (
          <button key={v.id} onClick={() => setActiveView(v.id)}
            className={`btn ${activeView === v.id ? 'btn-primary' : ''}`}
            style={{ fontSize: '0.9rem' }}>
            {v.label}
          </button>
        ))}
      </div>

      {/* X-Matrix View */}
      {activeView === 'xmatrix' && (
        <div className="animate-fade-in">
          {Object.entries(AXIS_META).map(([axis, meta]) => {
            const items = xMatrix[axis] || [];
            if (!items.length) return null;
            return (
              <div key={axis} style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: meta.color, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {meta.icon} {meta.label} ({items.length})
                </h3>
                {items.map(obj => (
                  <div key={obj.id} className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '0.5rem', borderLeft: `4px solid ${meta.color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div>
                        <strong style={{ fontSize: '0.95rem' }}>{obj.title}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          <span className={`governance-badge ${obj.catchball_status === 'agreed' ? 'valid' : obj.status === 'negotiating' ? 'pending' : 'pending'}`}>
                            {obj.catchball_status}
                          </span>
                          <span style={{ marginLeft: '0.5rem' }}>👤 {obj.owner || '—'}</span>
                          <span style={{ marginLeft: '0.5rem' }}>📅 {obj.deadline || '—'}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: obj.progress_pct >= 70 ? 'var(--success-color)' : obj.progress_pct >= 40 ? 'var(--warning-color)' : 'var(--text-secondary)' }}>
                          {obj.progress_pct?.toFixed(0)}%
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{obj.current_value}/{obj.target_value} {obj.unit}</div>
                      </div>
                    </div>
                    {obj.description && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{obj.description}</p>}
                  </div>
                ))}
              </div>
            );
          })}

          {/* Correlation Summary */}
          {xMatrix.cells?.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>🔗 Correlaciones del X-Matrix ({xMatrix.cells.length})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.75rem' }}>
                {xMatrix.cells.map(cell => (
                  <div key={cell.id} className="glass-panel" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className={`corr-cell ${cell.correlation}`} title={cell.correlation}>
                      {cell.correlation === 'strong' ? '●' : cell.correlation === 'moderate' ? '◐' : '○'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{cell.quadrant_pair}</div>
                      {cell.notes && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{cell.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cascade View */}
      {activeView === 'cascade' && cascade && (
        <div className="animate-fade-in">
          <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--success-color)' }}>
            <div style={{ display: 'flex', gap: '2rem', fontSize: '0.85rem' }}>
              <span>🎯 Alineación: <strong style={{ color: cascade.alignment?.agreed_pct >= 80 ? 'var(--success-color)' : 'var(--warning-color)' }}>{cascade.alignment?.agreed_pct?.toFixed(0)}%</strong></span>
              <span>📋 Total: <strong>{cascade.alignment?.total_objectives}</strong></span>
              <span>🤝 Negociando: <strong style={{ color: 'var(--warning-color)' }}>{cascade.alignment?.negotiating_count}</strong></span>
              <span>{cascade.alignment?.fully_deployed ? '✅ Completamente Desplegado' : '⏳ En Proceso'}</span>
            </div>
          </div>
          {['corporate', 'division', 'department', 'team'].map(level => {
            const items = cascade.cascade?.[level] || [];
            const labels = { corporate: '🏢 Corporativo', division: '🏭 División', department: '🏛️ Departamento', team: '👥 Equipo' };
            if (!items.length) return null;
            return (
              <div key={level} style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>{labels[level]} ({items.length})</h3>
                {items.map(obj => (
                  <div key={obj.id} className="glass-panel" style={{ padding: '0.75rem 1rem', marginBottom: '0.5rem', borderLeft: `3px solid ${STATUS_COLORS[obj.status] || '#6b7280'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{obj.title}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{obj.progress_pct?.toFixed(0)}% — {obj.owner}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Catchball View */}
      {activeView === 'catchball' && (
        <div className="animate-fade-in">
          {catchball.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎾</div>
              <h3>Proceso Catchball</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 500, margin: '0.5rem auto' }}>
                No hay negociaciones registradas. Propón objetivos desde la vista X-Matrix para iniciar el Catchball entre niveles organizacionales.
              </p>
            </div>
          ) : (
            <div>
              <h3 style={{ marginBottom: '1rem' }}>🎾 Historial Catchball ({catchball.length})</h3>
              {catchball.map(cb => {
                const actionColors = { propose: '#3b82f6', counter: '#f59e0b', accept: '#10b981', escalate: '#ef4444' };
                const actionLabels = { propose: '📤 Propuesta', counter: '🔄 Contraoferta', accept: '✅ Aceptado', escalate: '⬆️ Escalado' };
                const dirIcon = cb.direction === 'down' ? '⬇️' : '⬆️';
                return (
                  <div key={cb.id} className="timeline-item" style={{ marginLeft: '0.5rem' }}>
                    <div className="glass-panel" style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{actionLabels[cb.action] || cb.action} {dirIcon}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{new Date(cb.created_at).toLocaleString()}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem' }}>
                        <span>De: <strong>{cb.from_level}</strong></span>
                        <span>A: <strong>{cb.to_level}</strong></span>
                        <span>Obj: <em>{cb.objective_title}</em></span>
                      </div>
                      {cb.message && <p style={{ fontSize: '0.85rem', marginTop: '0.4rem', color: 'var(--text-primary)' }}>{cb.message}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
