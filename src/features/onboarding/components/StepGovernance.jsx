import { useState } from 'react';
import { useToast } from '@/features/plan/context/ToastContext';
import api from '@/lib/api';

const AUTHORITY_STRUCTURES = [
  { value: 'centralized', label: '🏛️ Centralizado', desc: 'Decisiones concentradas en la cúpula' },
  { value: 'decentralized', label: '🌐 Descentralizado', desc: 'Autonomía distribuida' },
  { value: 'matrix', label: '📐 Matricial', desc: 'Reporte dual funcional/proyectos' },
  { value: 'hybrid', label: '🔄 Híbrido', desc: 'Mixto según unidad o función' },
];

const DECISION_SPEEDS = [
  { value: 'fast', label: '⚡ Rápida' },
  { value: 'moderate', label: '⏱️ Moderada' },
  { value: 'slow', label: '🐢 Lenta' },
  { value: 'bureaucratic', label: '📋 Burocrática' },
];

const COMMITTEE_OPTIONS = [
  { value: 'audit', label: 'Auditoría' },
  { value: 'risk', label: 'Riesgos' },
  { value: 'compensation', label: 'Compensación' },
  { value: 'strategy', label: 'Estrategia' },
  { value: 'technology', label: 'Tecnología' },
  { value: 'governance', label: 'Gobierno Corporativo' },
];

const UNIT_TYPES = [
  { value: 'holding', label: 'Holding' },
  { value: 'subsidiary', label: 'Subsidiaria' },
  { value: 'division', label: 'División' },
  { value: 'department', label: 'Departamento' },
  { value: 'team', label: 'Equipo' },
];

const MATURITY_LEVELS = [
  { value: 'initial', label: '1 — Inicial', color: 'text-red-400' },
  { value: 'developing', label: '2 — En Desarrollo', color: 'text-orange-400' },
  { value: 'defined', label: '3 — Definido', color: 'text-yellow-400' },
  { value: 'managed', label: '4 — Gestionado', color: 'text-blue-400' },
  { value: 'optimizing', label: '5 — Optimizado', color: 'text-emerald-400' },
];

const CRITICALITY_LEVELS = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'critical', label: 'Crítica' },
];

export default function StepGovernance({ onPrev, onNext, institutionId, governance, setGovernance, orgUnits, setOrgUnits, capabilities, setCapabilities }) {
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // ── Governance form state ──
  const [govForm, setGovForm] = useState({
    board_size: governance?.board_size || 0,
    ceo_name: governance?.ceo_name || '',
    ceo_title: governance?.ceo_title || 'CEO',
    committees: governance?.committees || '',
    authority_structure: governance?.authority_structure || '',
    decision_speed: governance?.decision_speed || '',
    notes: governance?.notes || '',
  });

  // ── Inline form states ──
  const [unitName, setUnitName] = useState('');
  const [unitType, setUnitType] = useState('department');
  const [unitLeader, setUnitLeader] = useState('');
  const [unitHeadcount, setUnitHeadcount] = useState(0);
  const [capName, setCapName] = useState('');
  const [capMaturity, setCapMaturity] = useState('developing');
  const [capCriticality, setCapCriticality] = useState('medium');

  const handleSaveGovernance = async () => {
    setIsSaving(true);
    try {
      const result = await api.updateGovernance(institutionId, govForm);
      setGovernance(result);
      toast.success('Gobernanza guardada');
    } catch (e) { toast.error(e.message || 'Error al guardar'); }
    setIsSaving(false);
  };

  const handleAddUnit = async () => {
    if (!unitName.trim()) { toast.warning('Nombre de unidad requerido'); return; }
    try {
      const unit = await api.addOrgUnit(institutionId, { name: unitName, type: unitType, leader: unitLeader, headcount: unitHeadcount });
      setOrgUnits([...orgUnits, unit]);
      setUnitName(''); setUnitLeader(''); setUnitHeadcount(0); setUnitType('department');
      toast.success('Unidad añadida');
    } catch (e) { toast.error(e.message); }
  };

  const handleDeleteUnit = async (id) => {
    try {
      await api.deleteOrgUnit(id);
      setOrgUnits(orgUnits.filter(u => u.id !== id));
    } catch (e) { toast.error(e.message); }
  };

  const handleAddCapability = async () => {
    if (!capName.trim()) { toast.warning('Nombre de capacidad requerido'); return; }
    try {
      const cap = await api.addCapability(institutionId, { capability: capName, maturity_level: capMaturity, criticality: capCriticality });
      setCapabilities([...capabilities, cap]);
      setCapName(''); setCapMaturity('developing'); setCapCriticality('medium');
      toast.success('Capacidad añadida');
    } catch (e) { toast.error(e.message); }
  };

  const handleDeleteCapability = async (id) => {
    try {
      await api.deleteCapability(id);
      setCapabilities(capabilities.filter(c => c.id !== id));
    } catch (e) { toast.error(e.message); }
  };

  const selectedCommittees = govForm.committees ? govForm.committees.split(',').filter(Boolean) : [];
  const toggleCommittee = (val) => {
    const set = new Set(selectedCommittees);
    set.has(val) ? set.delete(val) : set.add(val);
    setGovForm({ ...govForm, committees: [...set].join(',') });
  };

  return (
    <div className="glass-panel card animate-fade-in">
      <h2 className="text-xl font-bold mb-2">⚖️ Gobernanza & Talento</h2>
      <p className="text-sm text-gray-400 mb-6">Estructura de gobierno, unidades organizacionales y capacidades institucionales.</p>

      {/* ── SECTION A: Governance ── */}
      <div className="border border-gray-700/50 rounded-lg p-5 mb-6">
        <h3 className="text-lg font-semibold text-indigo-400 mb-4">🏛️ Estructura de Gobierno</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="form-label">Líder Ejecutivo</label>
            <input className="form-textarea min-h-[auto] p-3" value={govForm.ceo_name} onChange={e => setGovForm({...govForm, ceo_name: e.target.value})} placeholder="Nombre del CEO / Director General" />
          </div>
          <div>
            <label className="form-label">Título</label>
            <select className="form-textarea min-h-[auto] p-3" value={govForm.ceo_title} onChange={e => setGovForm({...govForm, ceo_title: e.target.value})}>
              <option value="CEO">CEO</option>
              <option value="Director General">Director General</option>
              <option value="Presidente">Presidente</option>
              <option value="Secretario">Secretario</option>
              <option value="Ministro">Ministro</option>
            </select>
          </div>
          <div>
            <label className="form-label">Tamaño de Junta Directiva</label>
            <input type="number" className="form-textarea min-h-[auto] p-3" value={govForm.board_size} onChange={e => setGovForm({...govForm, board_size: parseInt(e.target.value) || 0})} />
          </div>
          <div>
            <label className="form-label">Velocidad de Decisión</label>
            <div className="flex gap-2 flex-wrap">
              {DECISION_SPEEDS.map(s => (
                <button key={s.value} type="button" onClick={() => setGovForm({...govForm, decision_speed: s.value})}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all border ${govForm.decision_speed === s.value ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label">Estructura de Autoridad</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {AUTHORITY_STRUCTURES.map(a => (
              <button key={a.value} type="button" onClick={() => setGovForm({...govForm, authority_structure: a.value})}
                className={`p-3 text-left rounded-lg transition-all border ${govForm.authority_structure === a.value ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500' : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'}`}>
                <div className="font-medium text-sm">{a.label}</div>
                <div className="text-xs text-gray-500 mt-1">{a.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label">Comités Activos</label>
          <div className="flex gap-2 flex-wrap">
            {COMMITTEE_OPTIONS.map(c => (
              <button key={c.value} type="button" onClick={() => toggleCommittee(c.value)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all border ${selectedCommittees.includes(c.value) ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500' : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'}`}>
                {selectedCommittees.includes(c.value) ? '✓ ' : ''}{c.label}
              </button>
            ))}
          </div>
        </div>

        <button type="button" onClick={handleSaveGovernance} disabled={isSaving}
          className={`btn btn-primary text-sm ${isSaving ? 'opacity-50' : ''}`}>
          {isSaving ? '⏳ Guardando...' : '💾 Guardar Gobernanza'}
        </button>
      </div>

      {/* ── ORG UNITS ── */}
      <div className="border border-gray-700/50 rounded-lg p-5 mb-6">
        <h3 className="text-lg font-semibold text-purple-400 mb-4">🏢 Unidades Organizacionales ({orgUnits.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <input className="form-textarea min-h-[auto] p-2 text-sm" value={unitName} onChange={e => setUnitName(e.target.value)} placeholder="Nombre *" />
          <select className="form-textarea min-h-[auto] p-2 text-sm" value={unitType} onChange={e => setUnitType(e.target.value)}>
            {UNIT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input className="form-textarea min-h-[auto] p-2 text-sm" value={unitLeader} onChange={e => setUnitLeader(e.target.value)} placeholder="Líder" />
          <div className="flex gap-2">
            <input type="number" className="form-textarea min-h-[auto] p-2 text-sm w-20" value={unitHeadcount} onChange={e => setUnitHeadcount(parseInt(e.target.value) || 0)} placeholder="HC" />
            <button type="button" onClick={handleAddUnit} className="btn btn-primary text-xs px-3">+ Añadir</button>
          </div>
        </div>
        {orgUnits.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {orgUnits.map(u => (
              <div key={u.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-0.5 rounded">{u.type}</span>
                  <span className="text-sm font-medium">{u.name}</span>
                  {u.leader && <span className="text-xs text-gray-500">— {u.leader}</span>}
                  {u.headcount > 0 && <span className="text-xs text-gray-500">({u.headcount})</span>}
                </div>
                <button type="button" onClick={() => handleDeleteUnit(u.id)} className="text-red-400 text-sm hover:text-red-300">✕</button>
              </div>
            ))}
          </div>
        ) : <p className="text-xs text-gray-500 italic">No se han registrado unidades organizacionales.</p>}
      </div>

      {/* ── CAPABILITIES ── */}
      <div className="border border-gray-700/50 rounded-lg p-5 mb-6">
        <h3 className="text-lg font-semibold text-amber-400 mb-4">💡 Capacidades Institucionales ({capabilities.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <input className="form-textarea min-h-[auto] p-2 text-sm" value={capName} onChange={e => setCapName(e.target.value)} placeholder="Capacidad *" />
          <select className="form-textarea min-h-[auto] p-2 text-sm" value={capMaturity} onChange={e => setCapMaturity(e.target.value)}>
            {MATURITY_LEVELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select className="form-textarea min-h-[auto] p-2 text-sm" value={capCriticality} onChange={e => setCapCriticality(e.target.value)}>
            {CRITICALITY_LEVELS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <button type="button" onClick={handleAddCapability} className="btn btn-primary text-xs">+ Añadir</button>
        </div>
        {capabilities.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {capabilities.map(c => (
              <div key={c.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono ${MATURITY_LEVELS.find(m => m.value === c.maturity_level)?.color || 'text-gray-400'}`}>{c.maturity_level}</span>
                  <span className="text-sm font-medium">{c.capability}</span>
                  <span className="text-xs bg-amber-600/20 text-amber-300 px-2 py-0.5 rounded">{c.criticality}</span>
                </div>
                <button type="button" onClick={() => handleDeleteCapability(c.id)} className="text-red-400 text-sm hover:text-red-300">✕</button>
              </div>
            ))}
          </div>
        ) : <p className="text-xs text-gray-500 italic">No se han registrado capacidades.</p>}
      </div>

      <div className="mt-6 flex justify-between">
        <button type="button" onClick={onPrev} className="btn glass-panel bg-transparent border-transparent hover:bg-gray-800">← Anterior</button>
        <button type="button" onClick={onNext} className="btn btn-primary">Siguiente →</button>
      </div>
    </div>
  );
}
