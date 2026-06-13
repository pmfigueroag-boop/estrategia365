"use client";
import { useToast } from '@/context/ToastContext';
import { usePlanContext } from '@/context/PlanContext';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import DiagnosticReadiness from '@/components/DiagnosticReadiness';

const TABS = [
  { id: 'p2w', label: '🏆 Playing to Win' },
];

export default function FormulationPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('p2w');
  const [isSaving, setIsSaving] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mission, setMission] = useState("");
  const [vision, setVision] = useState("");
  const [whereToPlay, setWhereToPlay] = useState("");
  const [howToWin, setHowToWin] = useState("");
  const [sourceSummary, setSourceSummary] = useState("");
  const [hasExtracted, setHasExtracted] = useState(false);
  const [existingPlanId, setExistingPlanId] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [planSelected, setPlanSelected] = useState(false);
  const [planParadigm, setPlanParadigm] = useState('competitive');

  const isPublicSector = planParadigm === 'cepal' || planParadigm === 'mepyd';
  const { planId: storedPlanId, institutionId, setPlanId: setGlobalPlanId } = usePlanContext();
  const planId = existingPlanId || storedPlanId;

  // Load available plans once institutionId is known
  useEffect(() => {
    if (!institutionId) return;
    const loadPlans = async () => {
      try {
        const plans = await api.getPlans(institutionId);
        setAvailablePlans(plans || []);
        
        // Auto-select the active plan if one is stored
        const activePlanId = localStorage.getItem('current_plan_id');
        if (activePlanId) {
          const activePlan = (plans || []).find(p => String(p.id) === activePlanId);
          if (activePlan) {
            setMission(activePlan.mission || "");
            setVision(activePlan.vision || "");
            setWhereToPlay(activePlan.where_to_play || "");
            setHowToWin(activePlan.how_to_win || "");
            setExistingPlanId(activePlan.id);
            setPlanParadigm(activePlan.paradigm_id || 'competitive');
            setHasExtracted(true);
            setPlanSelected(true);
          }
        }
      } catch (e) { /* no plans */ }
      setIsLoading(false);
    };
    loadPlans();
  }, [institutionId]);

  const selectPlan = (plan) => {
    setMission(plan.mission || "");
    setVision(plan.vision || "");
    setWhereToPlay(plan.where_to_play || "");
    setHowToWin(plan.how_to_win || "");
    setExistingPlanId(plan.id);
    setPlanParadigm(plan.paradigm_id || 'competitive');
    localStorage.setItem('current_plan_id', plan.id);
    setHasExtracted(true);
    setPlanSelected(true);
  };

  const startNewPlan = () => {
    setMission(""); setVision(""); setWhereToPlay(""); setHowToWin("");
    setExistingPlanId(null);
    setHasExtracted(false);
    setPlanSelected(true);
  };

  const handleExtractFromDocs = async () => {
    if (!institutionId) { toast.warning("Completa el Onboarding primero para cargar documentos."); return; }
    setIsExtracting(true);
    try {
      const data = await api.extractFormulation(institutionId);
      if (data.mission) setMission(data.mission);
      if (data.vision) setVision(data.vision);
      if (data.where_to_play) setWhereToPlay(data.where_to_play);
      if (data.how_to_win) setHowToWin(data.how_to_win);
      setSourceSummary(data.source_summary || "");
      setHasExtracted(true);
      toast.success("Formulación extraída de tus documentos. Revisa y edita.");
    } catch (e) { toast.error(e.message); }
    setIsExtracting(false);
  };

  const [capabilities, setCapabilities] = useState("");
  const [managementSystems, setManagementSystems] = useState("");
  const [evidenceMap, setEvidenceMap] = useState({});
  const [modulesUsed, setModulesUsed] = useState(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const handleSave = async () => {
    if (!existingPlanId) { toast.warning('No hay plan activo. Crea uno desde Onboarding.'); return; }
    setIsSaving(true);
    try {
      const data = await api.updatePlan(existingPlanId, {
        paradigm_id: planParadigm, mission, vision,
        where_to_play: whereToPlay, how_to_win: howToWin,
        capabilities, management_systems: managementSystems,
      });
      localStorage.setItem('current_plan_id', data.id);
      toast.success('Plan actualizado exitosamente.');
    } catch(err) { toast.error(err.message || 'Error de conexión.'); }
    setIsSaving(false);
  };

  const handleSynthesize = async () => {
    if (!existingPlanId) { toast.warning('No hay plan activo.'); return; }
    setIsSynthesizing(true);
    try {
      const data = await api.synthesizeFormulation(existingPlanId);
      setMission(data.mission || "");
      setVision(data.vision || "");
      setWhereToPlay(data.where_to_play || "");
      setHowToWin(data.how_to_win || "");
      setCapabilities(data.capabilities || "");
      setManagementSystems(data.management_systems || "");
      setEvidenceMap(data.evidence_map || {});
      setModulesUsed(data.modules_used || null);
      setHasExtracted(true);
      toast.success('Formulación sintetizada desde 7 módulos diagnósticos.');
    } catch (e) { toast.error(e.message); }
    setIsSynthesizing(false);
  };

  const texts = {
    title: isPublicSector ? "Formulación del Plan (SNPIP/ILPES)" : "Strategic Formulation & Choice",
    desc: isPublicSector ? "5 Cascadas Estratégicas — Propósito, Alcance, Mecanismo, Capacidades, Sistemas." : "5 Cascading Choices — Lafley & Martin (2013) Playing to Win.",
  };

  const CASCADE_META = [
    { key: 'mission', num: 1, label: isPublicSector ? 'Misión Institucional' : 'Winning Aspiration — Misión', icon: '🎯', color: '#8b5cf6', sources: ['PESTEL', 'Documentos'], get: mission, set: setMission, placeholder: 'Propósito fundamental de la organización...' },
    { key: 'vision', num: 1, label: isPublicSector ? 'Visión de Desarrollo' : 'Winning Aspiration — Visión', icon: '🔭', color: '#8b5cf6', sources: ['PESTEL', 'Blue Ocean'], get: vision, set: setVision, placeholder: 'Estado futuro deseado al 2030...' },
    { key: 'where_to_play', num: 2, label: isPublicSector ? 'Población y Ámbito Territorial' : 'Where to Play', icon: '🗺️', color: '#3b82f6', sources: ['Porter', 'BCG', 'Blue Ocean'], get: whereToPlay, set: setWhereToPlay, placeholder: 'Mercados, segmentos, geografías, canales específicos...' },
    { key: 'how_to_win', num: 3, label: isPublicSector ? 'Mecanismo de Entrega' : 'How to Win', icon: '🏆', color: '#10b981', sources: ['TOWS', 'VRIO', 'Blue Ocean'], get: howToWin, set: setHowToWin, placeholder: 'Propuesta de valor diferenciada, ventaja competitiva...' },
    { key: 'capabilities', num: 4, label: isPublicSector ? 'Capacidades Institucionales' : 'Core Capabilities', icon: '💪', color: '#f59e0b', sources: ['VRIO', 'Blue Ocean ERRC'], get: capabilities, set: setCapabilities, placeholder: 'Recursos, competencias y activos que deben existir...' },
    { key: 'management_systems', num: 5, label: isPublicSector ? 'Sistemas de Gestión (BSC/PEI)' : 'Management Systems', icon: '⚙️', color: '#ec4899', sources: ['FODA debilidades', 'VRIO brechas'], get: managementSystems, set: setManagementSystems, placeholder: 'Métricas, procesos, estructura organizacional requerida...' },
  ];

  const SOURCE_ICONS = { PESTEL: '🌍', Porter: '⚔️', BCG: '📊', 'Blue Ocean': '🌊', TOWS: '🔀', VRIO: '🔑', FODA: '🎯', Documentos: '📄', 'Blue Ocean ERRC': '🌊', 'FODA debilidades': '🎯', 'VRIO brechas': '🔑' };

  if (isLoading) return <div className="animate-fade-in" style={{textAlign:'center',padding:'4rem'}}><p style={{color:'var(--text-secondary)'}}>⏳ Cargando planes...</p></div>;

  // Plan Selector Screen
  if (!planSelected && availablePlans.length > 0) {
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">{texts.title}</h1>
          <p className="page-subtitle">Selecciona un plan existente para editar su formulación estratégica.</p>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'1rem', marginBottom:'1.5rem'}}>
          {availablePlans.map(plan => (
            <button key={plan.id} onClick={() => selectPlan(plan)} className="glass-panel" style={{padding:'1.5rem', textAlign:'left', cursor:'pointer', border:'1px solid transparent', transition:'all 0.2s'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem'}}>
                <span style={{fontSize:'0.8rem', padding:'0.25rem 0.6rem', borderRadius:6, background:'rgba(59,130,246,0.15)', color:'var(--accent-primary)', fontWeight:600}}>Plan #{plan.id}</span>
                <span style={{fontSize:'0.75rem', color:'var(--text-secondary)'}}>{plan.paradigm_id}</span>
              </div>
              <p style={{fontSize:'0.9rem', fontWeight:500, marginBottom:'0.5rem', lineHeight:1.4}}>{(plan.mission || 'Sin misión definida').substring(0, 100)}...</p>
              <p style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>Visión: {(plan.vision || 'Sin visión').substring(0, 80)}...</p>
              <p style={{fontSize:'0.7rem', color:'var(--text-secondary)', marginTop:'0.5rem'}}>📅 {new Date(plan.created_at).toLocaleDateString('es-DO', {year:'numeric', month:'short', day:'numeric'})}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // If no plans exist, show message
  if (!planSelected && availablePlans.length === 0) {
    return (
      <div className="animate-fade-in glass-panel empty-state">
        No hay planes creados. Ve a <a href="/onboarding" className="text-gradient" style={{fontWeight:600}}>Onboarding</a> para crear tu primer plan estratégico.
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <h1 className="page-title">{texts.title}</h1>
            <p className="page-subtitle">{texts.desc}</p>
          </div>
          <div style={{display:'flex', gap:'0.75rem', alignItems:'center'}}>
            {existingPlanId && (
              <span style={{fontSize:'0.8rem', padding:'0.4rem 0.8rem', borderRadius:8, background:'rgba(16,185,129,0.15)', color:'var(--success-color)', fontWeight:600}}>Plan #{existingPlanId}</span>
            )}
            {availablePlans.length > 0 && (
              <button onClick={() => setPlanSelected(false)} className="btn" style={{fontSize:'0.8rem'}}>
                📋 Cambiar Plan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Diagnostic Readiness Gate */}
      {existingPlanId && <DiagnosticReadiness planId={existingPlanId} />}

      {/* AI Synthesis Banner */}
      <div className="glass-panel" style={{
        padding:'1.25rem 1.5rem', marginBottom:'1.5rem',
        borderLeft:'4px solid var(--accent-primary)',
        display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem',
      }}>
        <div style={{flex:1}}>
          <p style={{fontWeight:600, marginBottom:'0.25rem'}}>🧠 Síntesis Inteligente</p>
          <p style={{fontSize:'0.85rem', color:'var(--text-secondary)', lineHeight:1.5}}>
            La IA sintetiza los 7 módulos diagnósticos (PESTEL, Porter, FODA, TOWS, VRIO, BCG, Blue Ocean) 
            en las 5 cascadas P2W con evidencia trazable. Puedes editar todo después.
          </p>
        </div>
        <div style={{display:'flex', gap:'0.5rem', flexShrink:0}}>
          <button onClick={handleExtractFromDocs} disabled={isExtracting} className="btn" style={{fontSize:'0.8rem', opacity:isExtracting?0.5:1, whiteSpace:'nowrap'}}>
            {isExtracting ? '⏳...' : '📄 Extraer de Docs'}
          </button>
          <button onClick={handleSynthesize} disabled={isSynthesizing} className="btn btn-primary" style={{fontSize:'0.85rem', opacity:isSynthesizing?0.5:1, whiteSpace:'nowrap'}}>
            {isSynthesizing ? '⏳ Sintetizando...' : '🧠 Sintetizar desde Diagnóstico'}
          </button>
        </div>
      </div>

      {/* Modules Used Badge */}
      {modulesUsed && (
        <div className="animate-fade-in" style={{display:'flex', gap:'0.4rem', flexWrap:'wrap', marginBottom:'1.25rem'}}>
          {Object.entries(modulesUsed).map(([mod, count]) => (
            <span key={mod} style={{
              fontSize:'0.7rem', padding:'0.2rem 0.5rem', borderRadius:6,
              background: count > 0 ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)',
              color: count > 0 ? '#10b981' : 'var(--text-secondary)',
              border: `1px solid ${count > 0 ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.06)'}`,
              fontWeight: count > 0 ? 600 : 400,
            }}>
              {SOURCE_ICONS[mod.toUpperCase()] || '📦'} {mod} ({count})
            </span>
          ))}
        </div>
      )}

      {/* 5 Cascades */}
      <div style={{display:'grid', gap:'1rem'}}>
        {CASCADE_META.map(cascade => (
          <div key={cascade.key} className="glass-panel" style={{
            padding:'1.25rem 1.5rem',
            borderLeft:`4px solid ${cascade.color}`,
          }}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem'}}>
              <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                <span style={{
                  width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                  background:`${cascade.color}20`, color:cascade.color, fontSize:'0.85rem', fontWeight:700,
                }}>{cascade.num}</span>
                <span style={{fontSize:'1rem'}}>{cascade.icon}</span>
                <span style={{fontWeight:600, fontSize:'0.95rem'}}>{cascade.label}</span>
              </div>
              <div style={{display:'flex', gap:'0.3rem'}}>
                {cascade.sources.map(src => (
                  <span key={src} style={{
                    fontSize:'0.65rem', padding:'0.15rem 0.4rem', borderRadius:4,
                    background:'rgba(255,255,255,0.05)', color:'var(--text-secondary)',
                  }}>{SOURCE_ICONS[src] || '📦'} {src}</span>
                ))}
              </div>
            </div>
            <textarea
              className="form-textarea"
              value={cascade.get}
              onChange={e => cascade.set(e.target.value)}
              placeholder={cascade.placeholder}
              style={{minHeight:80, background:'rgba(0,0,0,0.15)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:8, padding:'0.75rem', width:'100%', color:'var(--text-primary)', fontSize:'0.9rem', lineHeight:1.6, resize:'vertical'}}
            />
            {/* Evidence from AI */}
            {evidenceMap[cascade.key] && evidenceMap[cascade.key].length > 0 && (
              <div style={{marginTop:'0.5rem', display:'flex', gap:'0.3rem', flexWrap:'wrap'}}>
                {evidenceMap[cascade.key].map((ev, i) => (
                  <span key={i} style={{
                    fontSize:'0.7rem', padding:'0.2rem 0.5rem', borderRadius:4,
                    background:`${cascade.color}10`, color:cascade.color, border:`1px solid ${cascade.color}30`,
                  }}>📎 {ev}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Save */}
      <div style={{marginTop:'1.5rem', display:'flex', justifyContent:'flex-end', gap:'0.75rem', alignItems:'center'}}>
        {existingPlanId && <span style={{fontSize:'0.75rem', color:'var(--text-secondary)'}}>Plan #{existingPlanId} · {planParadigm?.toUpperCase()}</span>}
        <button onClick={handleSave} disabled={isSaving || !existingPlanId} className="btn btn-primary" style={{opacity:isSaving?0.5:1, padding:'0.6rem 2rem'}}>
          {isSaving ? '⏳ Guardando...' : '✅ Guardar Formulación'}
        </button>
      </div>
    </div>
  );
}
