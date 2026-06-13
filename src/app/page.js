'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { usePlanContext } from '@/features/plan/context/PlanContext';

const SECTOR_META = {
  public: { icon: '🏛️', label: 'Sector Público', color: '#8b5cf6' },
  private: { icon: '🏢', label: 'Sector Privado', color: '#3b82f6' },
};

const PARADIGMS = [
  { id: 'competitive', label: 'Competitive (Porter/Harvard)' },
  { id: 'mepyd', label: 'MEPyD (Sector Público RD)' },
  { id: 'cepal', label: 'CEPAL (Planificación Regional)' },
];

export default function Home() {
  const router = useRouter();
  const { setPlanId, setInstitutionId } = usePlanContext();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPlanId, setEditingPlanId] = useState(null);

  useEffect(() => {
    api.getWorkspaceSummary()
      .then(setProjects)
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSelectProject = (inst, plan) => {
    setInstitutionId(inst.id);
    if (plan) {
      setPlanId(plan.id);
      router.push('/strategy');
    } else {
      setPlanId(null);
      router.push('/formulation');
    }
  };

  const handleNewProject = () => {
    setInstitutionId(null);
    setPlanId(null);
    router.push('/onboarding');
  };

  const handleDeletePlan = async (e, plan) => {
    e.stopPropagation();
    if (!confirm(`¿Eliminar plan "${plan.paradigm_id?.toUpperCase() || 'Plan'} #${plan.id}"? Se borrarán TODOS los análisis (PESTEL, Porter, FODA, TOWS, VRIO, BCG, Blue Ocean). Esta acción es irreversible.`)) return;
    try {
      await api.deletePlan(plan.id);
      setProjects(prev => prev.map(inst => ({
        ...inst,
        plans: inst.plans?.filter(p => p.id !== plan.id) || []
      })));
      if (localStorage.getItem('current_plan_id') === String(plan.id)) {
        setPlanId(null);
      }
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const handleDeleteProject = async (e, inst) => {
    e.stopPropagation();
    const planCount = inst.plans?.length || 0;
    const docCount = inst.document_count || 0;
    if (!confirm(
      `¿Eliminar "${inst.name}" y TODO su contenido?\n\n` +
      `• ${planCount} plan${planCount !== 1 ? 'es' : ''} estratégico${planCount !== 1 ? 's' : ''}\n` +
      `• ${docCount} documento${docCount !== 1 ? 's' : ''}\n` +
      `• Todos los análisis (PESTEL, Porter, FODA, TOWS, VRIO, BCG, Blue Ocean)\n\n` +
      `Esta acción es IRREVERSIBLE.`
    )) return;
    try {
      await api.deleteInstitution(inst.id);
      setProjects(prev => prev.filter(i => i.id !== inst.id));
      if (localStorage.getItem('current_institution_id') === String(inst.id)) {
        setInstitutionId(null);
        setPlanId(null);
      }
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const handleChangeParadigm = async (e, plan) => {
    e.stopPropagation();
    const newParadigm = e.target.value;
    if (newParadigm === plan.paradigm_id) { setEditingPlanId(null); return; }
    try {
      await api.updatePlan(plan.id, { paradigm_id: newParadigm });
      setProjects(prev => prev.map(inst => ({
        ...inst,
        plans: inst.plans?.map(p => p.id === plan.id ? { ...p, paradigm_id: newParadigm } : p) || []
      })));
      setEditingPlanId(null);
    } catch (err) {
      alert('Error al cambiar lente: ' + err.message);
    }
  };

  const [currentInstId, setCurrentInstId] = useState(null);

  useEffect(() => {
    setCurrentInstId(localStorage.getItem('current_institution_id'));
  }, []);

  return (
    <div className="animate-fade-in" style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 0' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.8rem', marginBottom: '0.75rem', lineHeight: 1.1 }}>
          <span className="text-gradient">Estrategia 365</span>
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
          Selecciona un proyecto existente o inicia uno nuevo desde cero.
        </p>
      </div>

      {/* New Project Card */}
      <button
        onClick={handleNewProject}
        style={{
          width: '100%', padding: '1.5rem', marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))',
          border: '2px dashed rgba(139,92,246,0.4)', borderRadius: 16,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1.5rem',
          transition: 'all 0.25s', color: 'var(--text-primary)',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))'; }}
      >
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', flexShrink: 0,
        }}>➕</div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem' }}>Nuevo Proyecto</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Crea un perfil institucional y comienza el proceso de planificación estratégica desde cero.
          </div>
        </div>
      </button>

      {/* Loading / Error */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          Cargando proyectos...
        </div>
      )}

      {error && (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderLeft: '4px solid var(--danger-color)' }}>
          <p style={{ color: 'var(--danger-color)' }}>⚠️ No se pudo conectar al servidor: {error}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Verifica que el backend esté corriendo en el puerto 8000.
          </p>
        </div>
      )}

      {/* Project List */}
      {!isLoading && projects.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Proyectos existentes</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.6rem', borderRadius: 20 }}>
              {projects.length}
            </span>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {projects.map(inst => {
              const sector = SECTOR_META[inst.sector] || SECTOR_META.private;
              const isActive = String(inst.id) === currentInstId;
              const topPlan = inst.plans?.sort((a, b) => (b.decision_count - a.decision_count))[0];

              return (
                <div
                  key={inst.id}
                  className="glass-panel"
                  style={{
                    padding: '1.5rem',
                    borderLeft: `4px solid ${isActive ? '#10b981' : sector.color}`,
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                >
                  <div style={{ position: 'absolute', top: 12, right: 16, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isActive && (
                      <span style={{
                        fontSize: '0.7rem', background: '#10b981', color: '#000',
                        padding: '0.15rem 0.5rem', borderRadius: 10, fontWeight: 600,
                      }}>ACTIVO</span>
                    )}
                    <button
                      onClick={(e) => handleDeleteProject(e, inst)}
                      title={`Eliminar proyecto "${inst.name}"`}
                      style={{
                        width: 28, height: 28, borderRadius: 6,
                        background: 'transparent', border: '1px solid transparent',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', opacity: 0.25, transition: 'all 0.2s', color: 'var(--danger-color)',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '0.25'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                    >🗑️</button>
                  </div>

                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                    {/* Icon */}
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: `${sector.color}20`, color: sector.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.5rem', flexShrink: 0,
                    }}>{sector.icon}</div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem' }}>{inst.name}</div>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                        <span>{sector.label}</span>
                        {inst.industry && <span>· {inst.industry}</span>}
                        {inst.geography && <span>· 📍 {inst.geography}</span>}
                        <span>· 📄 {inst.document_count} docs</span>
                      </div>

                      {/* Plans */}
                      {inst.plans?.length > 0 ? (
                        <>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          {inst.plans.map(plan => (
                            <div key={plan.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <button
                              onClick={() => handleSelectProject(inst, plan)}
                              style={{
                                padding: '0.6rem 1rem', borderRadius: 10,
                                background: plan.has_kernel ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${plan.has_kernel ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`,
                                cursor: 'pointer', color: 'var(--text-primary)',
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                fontSize: '0.85rem', transition: 'all 0.2s', flex: 1,
                              }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = plan.has_kernel ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'none'; }}
                            >
                              <span>{plan.has_kernel ? '🧠' : '📋'}</span>
                              <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                  {editingPlanId === plan.id ? (
                                    <select
                                      value={plan.paradigm_id || 'competitive'}
                                      onChange={(e) => handleChangeParadigm(e, plan)}
                                      onBlur={() => setEditingPlanId(null)}
                                      onClick={(e) => e.stopPropagation()}
                                      autoFocus
                                      style={{
                                        background: 'var(--surface-color)', color: 'var(--text-primary)',
                                        border: '1px solid var(--accent-primary)', borderRadius: 6,
                                        padding: '0.2rem 0.4rem', fontSize: '0.8rem', cursor: 'pointer',
                                      }}
                                    >
                                      {PARADIGMS.map(p => (
                                        <option key={p.id} value={p.id}>{p.label}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    <span
                                      onClick={(e) => { e.stopPropagation(); setEditingPlanId(plan.id); }}
                                      title="Click para cambiar el lente doctrinal"
                                      style={{ cursor: 'pointer', borderBottom: '1px dashed rgba(255,255,255,0.3)' }}
                                    >
                                      {plan.paradigm_id?.toUpperCase() || 'Plan'}
                                    </span>
                                  )}
                                  {plan.has_kernel && <span style={{ color: '#10b981', marginLeft: 4 }}>({(plan.confidence * 100).toFixed(0)}%)</span>}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                  {plan.decision_count > 0 ? `${plan.decision_count} decisiones` : 'Sin kernel'}
                                </div>
                              </div>
                              <span style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.5 }}>→</span>
                            </button>
                            <button
                              onClick={(e) => handleDeletePlan(e, plan)}
                              title="Eliminar plan"
                              style={{
                                width: 32, height: 32, borderRadius: 8,
                                background: 'transparent', border: '1px solid transparent',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.85rem', opacity: 0.3, transition: 'all 0.2s', color: 'var(--danger-color)', flexShrink: 0,
                              }}
                              onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                              onMouseLeave={e => { e.currentTarget.style.opacity = '0.3'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                            >🗑️</button>
                            </div>
                          ))}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.5rem', opacity: 0.5 }}>
                          {inst.plans.length} plan{inst.plans.length !== 1 ? 'es' : ''}
                        </div>
                        </>
                      ) : (
                        <button
                          onClick={() => handleSelectProject(inst, null)}
                          className="btn"
                          style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                        >
                          📝 Crear primer plan →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Empty state */}
      {!isLoading && !error && projects.length === 0 && (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏗️</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Sin proyectos todavía</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Presiona "Nuevo Proyecto" arriba para comenzar tu primer plan estratégico.
          </p>
        </div>
      )}

      {/* Footer info */}
      <div style={{ marginTop: '3rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0.6 }}>
        Analizar → Formular → Implementar · Porter · PESTEL · FODA · Blue Ocean · BCG · OKRs · BSC · 7S
      </div>
    </div>
  );
}
