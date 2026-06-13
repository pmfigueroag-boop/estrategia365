import { useState, useEffect } from 'react';
import { useToast } from '@/features/plan/context/ToastContext';
import api from '@/core/infrastructure/api';

const RISK_CATEGORIES = [
  { value: 'strategic', label: '🎯 Estratégico' },
  { value: 'operational', label: '⚙️ Operacional' },
  { value: 'financial', label: '💰 Financiero' },
  { value: 'regulatory', label: '📜 Regulatorio' },
  { value: 'reputational', label: '🛡️ Reputacional' },
  { value: 'technological', label: '💻 Tecnológico' },
];

const LIKELIHOOD_LEVELS = [
  { value: 'low', label: 'Baja', color: 'text-emerald-400' },
  { value: 'medium', label: 'Media', color: 'text-yellow-400' },
  { value: 'high', label: 'Alta', color: 'text-red-400' },
];

const IMPACT_LEVELS = [
  { value: 'low', label: 'Bajo', color: 'text-emerald-400' },
  { value: 'medium', label: 'Medio', color: 'text-yellow-400' },
  { value: 'high', label: 'Alto', color: 'text-red-400' },
];

const CULTURE_DIMENSIONS = [
  {
    key: 'leadership_style', label: '🎖️ Estilo de Liderazgo',
    options: [
      { value: 'directive', label: 'Directivo', desc: 'Instrucciones claras y control' },
      { value: 'participative', label: 'Participativo', desc: 'Consulta y consenso' },
      { value: 'delegative', label: 'Delegativo', desc: 'Autonomía y confianza' },
      { value: 'transformational', label: 'Transformacional', desc: 'Visión e inspiración' },
    ]
  },
  {
    key: 'change_readiness', label: '🔄 Disposición al Cambio',
    options: [
      { value: 'resistant', label: 'Resistente', desc: 'Prefiere el status quo' },
      { value: 'cautious', label: 'Cauteloso', desc: 'Cambio gradual y probado' },
      { value: 'open', label: 'Abierto', desc: 'Receptivo a nuevas ideas' },
      { value: 'eager', label: 'Entusiasta', desc: 'Busca activamente innovar' },
    ]
  },
  {
    key: 'innovation_culture', label: '💡 Cultura de Innovación',
    options: [
      { value: 'traditional', label: 'Tradicional', desc: 'Métodos probados' },
      { value: 'emerging', label: 'Emergente', desc: 'Abierta a experimentar' },
      { value: 'innovative', label: 'Innovadora', desc: 'Innovación sistemática' },
      { value: 'disruptive', label: 'Disruptiva', desc: 'Transformación radical' },
    ]
  },
  {
    key: 'execution_discipline', label: '📋 Disciplina de Ejecución',
    options: [
      { value: 'ad_hoc', label: 'Ad-hoc', desc: 'Sin procesos formales' },
      { value: 'reactive', label: 'Reactivo', desc: 'Responde cuando hay problemas' },
      { value: 'structured', label: 'Estructurado', desc: 'Procesos definidos y medidos' },
      { value: 'optimized', label: 'Optimizado', desc: 'Mejora continua basada en datos' },
    ]
  },
  {
    key: 'collaboration_level', label: '🤝 Nivel de Colaboración',
    options: [
      { value: 'siloed', label: 'En Silos', desc: 'Departamentos aislados' },
      { value: 'functional', label: 'Funcional', desc: 'Colaboración dentro de funciones' },
      { value: 'cross_functional', label: 'Transfuncional', desc: 'Equipos interdisciplinarios' },
      { value: 'networked', label: 'En Red', desc: 'Colaboración abierta y fluida' },
    ]
  },
  {
    key: 'strategic_maturity', label: '🧭 Madurez Estratégica',
    options: [
      { value: 'intuitive', label: 'Intuitiva', desc: 'Decisiones por instinto' },
      { value: 'periodic', label: 'Periódica', desc: 'Planificación anual' },
      { value: 'systematic', label: 'Sistemática', desc: 'Proceso estratégico continuo' },
      { value: 'continuous', label: 'Continua', desc: 'Estrategia adaptativa en tiempo real' },
    ]
  },
];

export default function StepRiskCulture({ onPrev, onNext, institutionId, knownRisks, setKnownRisks, cultureProfile, setCultureProfile }) {
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // ── Risk form state ──
  const [riskDesc, setRiskDesc] = useState('');
  const [riskCategory, setRiskCategory] = useState('strategic');
  const [riskLikelihood, setRiskLikelihood] = useState('medium');
  const [riskImpact, setRiskImpact] = useState('medium');
  const [riskMitigation, setRiskMitigation] = useState('');

  // ── Culture state ──
  const [culture, setCulture] = useState({
    leadership_style: cultureProfile?.leadership_style || '',
    change_readiness: cultureProfile?.change_readiness || '',
    innovation_culture: cultureProfile?.innovation_culture || '',
    execution_discipline: cultureProfile?.execution_discipline || '',
    collaboration_level: cultureProfile?.collaboration_level || '',
    strategic_maturity: cultureProfile?.strategic_maturity || '',
    notes: cultureProfile?.notes || '',
  });

  const [prevProfile, setPrevProfile] = useState(cultureProfile);
  if (cultureProfile !== prevProfile) {
    setPrevProfile(cultureProfile);
    if (cultureProfile) {
      setCulture({
        leadership_style: cultureProfile.leadership_style || '',
        change_readiness: cultureProfile.change_readiness || '',
        innovation_culture: cultureProfile.innovation_culture || '',
        execution_discipline: cultureProfile.execution_discipline || '',
        collaboration_level: cultureProfile.collaboration_level || '',
        strategic_maturity: cultureProfile.strategic_maturity || '',
        notes: cultureProfile.notes || '',
      });
    }
  }

  const handleAddRisk = async () => {
    if (!riskDesc.trim()) { toast.warning('Descripción del riesgo requerida'); return; }
    try {
      const risk = await api.addKnownRisk(institutionId, {
        risk: riskDesc, category: riskCategory,
        likelihood: riskLikelihood, impact: riskImpact,
        current_mitigation: riskMitigation,
      });
      setKnownRisks([...knownRisks, risk]);
      setRiskDesc(''); setRiskMitigation('');
      setRiskCategory('strategic'); setRiskLikelihood('medium'); setRiskImpact('medium');
      toast.success('Riesgo registrado');
    } catch (e) { toast.error(e.message); }
  };

  const handleDeleteRisk = async (id) => {
    try {
      await api.deleteKnownRisk(id);
      setKnownRisks(knownRisks.filter(r => r.id !== id));
    } catch (e) { toast.error(e.message); }
  };

  const handleSaveCulture = async () => {
    setIsSaving(true);
    try {
      const result = await api.updateCultureProfile(institutionId, culture);
      setCultureProfile(result);
      toast.success('Perfil cultural guardado');
    } catch (e) { toast.error(e.message || 'Error al guardar'); }
    setIsSaving(false);
  };

  const filledDimensions = CULTURE_DIMENSIONS.filter(d => culture[d.key]).length;

  return (
    <div className="glass-panel card animate-fade-in">
      <h2 className="text-xl font-bold mb-2">🛡️ Riesgo & Cultura</h2>
      <p className="text-sm text-gray-400 mb-6">Riesgos conocidos y autodiagnóstico cultural de la organización.</p>

      {/* ── SECTION A: Known Risks ── */}
      <div className="border border-gray-700/50 rounded-lg p-5 mb-6">
        <h3 className="text-lg font-semibold text-red-400 mb-2">⚠️ Riesgos Conocidos ({knownRisks.length})</h3>
        <p className="text-xs text-gray-500 mb-4">¿Cuáles son los principales riesgos que enfrenta tu organización? (Top 3-5 recomendado)</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <input className="form-textarea min-h-[auto] p-2 text-sm md:col-span-2" value={riskDesc} onChange={e => setRiskDesc(e.target.value)} placeholder="Descripción del riesgo *" />
          <select className="form-textarea min-h-[auto] p-2 text-sm" value={riskCategory} onChange={e => setRiskCategory(e.target.value)}>
            {RISK_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <div className="flex gap-2">
            <select className="form-textarea min-h-[auto] p-2 text-sm flex-1" value={riskLikelihood} onChange={e => setRiskLikelihood(e.target.value)}>
              {LIKELIHOOD_LEVELS.map(l => <option key={l.value} value={l.value}>Prob: {l.label}</option>)}
            </select>
            <select className="form-textarea min-h-[auto] p-2 text-sm flex-1" value={riskImpact} onChange={e => setRiskImpact(e.target.value)}>
              {IMPACT_LEVELS.map(i => <option key={i.value} value={i.value}>Imp: {i.label}</option>)}
            </select>
          </div>
          <textarea className="form-textarea min-h-[60px] text-sm md:col-span-2" value={riskMitigation} onChange={e => setRiskMitigation(e.target.value)} placeholder="Mitigación actual (opcional)" />
        </div>
        <button type="button" onClick={handleAddRisk} className="btn btn-primary text-xs mb-4">+ Agregar Riesgo</button>

        {knownRisks.length > 0 ? (
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {knownRisks.map(r => (
              <div key={r.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xs bg-red-600/20 text-red-300 px-2 py-0.5 rounded whitespace-nowrap">
                    {RISK_CATEGORIES.find(c => c.value === r.category)?.label || r.category}
                  </span>
                  <span className="text-sm truncate">{r.risk}</span>
                  <span className={`text-xs ${LIKELIHOOD_LEVELS.find(l => l.value === r.likelihood)?.color || ''}`}>P:{r.likelihood}</span>
                  <span className={`text-xs ${IMPACT_LEVELS.find(i => i.value === r.impact)?.color || ''}`}>I:{r.impact}</span>
                </div>
                <button type="button" onClick={() => handleDeleteRisk(r.id)} className="text-red-400 text-sm hover:text-red-300 ml-2">✕</button>
              </div>
            ))}
          </div>
        ) : <p className="text-xs text-gray-500 italic">No se han registrado riesgos conocidos.</p>}
      </div>

      {/* ── SECTION B: Culture Profile ── */}
      <div className="border border-gray-700/50 rounded-lg p-5 mb-6">
        <h3 className="text-lg font-semibold text-violet-400 mb-2">🧬 Perfil Cultural ({filledDimensions}/6 dimensiones)</h3>
        <p className="text-xs text-gray-500 mb-4">Autodiagnóstico: ¿Cómo funciona realmente tu organización hoy?</p>

        <div className="space-y-5">
          {CULTURE_DIMENSIONS.map(dim => (
            <div key={dim.key}>
              <label className="form-label text-sm">{dim.label}</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {dim.options.map(opt => (
                  <button key={opt.value} type="button"
                    onClick={() => setCulture({ ...culture, [dim.key]: opt.value })}
                    className={`p-2.5 text-left rounded-lg transition-all border ${
                      culture[dim.key] === opt.value
                        ? 'bg-violet-600/20 text-violet-300 border-violet-500'
                        : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'
                    }`}>
                    <div className="font-medium text-xs">{opt.label}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <button type="button" onClick={handleSaveCulture} disabled={isSaving}
            className={`btn btn-primary text-sm ${isSaving ? 'opacity-50' : ''}`}>
            {isSaving ? '⏳ Guardando...' : '💾 Guardar Perfil Cultural'}
          </button>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button type="button" onClick={onPrev} className="btn glass-panel bg-transparent border-transparent hover:bg-gray-800">← Anterior</button>
        <button type="button" onClick={onNext} className="btn btn-primary">Siguiente →</button>
      </div>
    </div>
  );
}
