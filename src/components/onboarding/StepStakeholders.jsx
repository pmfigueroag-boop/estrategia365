import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';

const STAKEHOLDER_TYPES = [
  { value: 'client', label: '👤 Cliente' },
  { value: 'regulator', label: '⚖️ Regulador' },
  { value: 'shareholder', label: '💼 Accionista / Inversionista' },
  { value: 'supplier', label: '📦 Proveedor' },
  { value: 'partner', label: '🤝 Aliado Estratégico' },
  { value: 'community', label: '🌐 Comunidad / Sociedad' },
  { value: 'employee_group', label: '👥 Grupo de Empleados / Sindicato' },
  { value: 'board', label: '🏛️ Junta Directiva / Consejo' },
];

const LEVELS = [
  { value: 'low', label: 'Bajo' },
  { value: 'medium', label: 'Medio' },
  { value: 'high', label: 'Alto' },
  { value: 'critical', label: 'Crítico' },
];

const INITIAL_FORM = { name: '', type: 'client', influence: 'medium', interest: 'medium', notes: '' };

export default function StepStakeholders({ onPrev, onNext, institutionId, stakeholders, setStakeholders }) {
  const toast = useToast();
  const [form, setForm] = useState(INITIAL_FORM);
  const [adding, setAdding] = useState(false);

  // Load stakeholders on mount
  useEffect(() => {
    if (institutionId) {
      api.getStakeholders(institutionId).then(setStakeholders).catch(() => {});
    }
  }, [institutionId, setStakeholders]);

  const handleAdd = async () => {
    if (!form.name.trim()) {
      toast.warning('El nombre del stakeholder es requerido');
      return;
    }
    if (!institutionId) {
      toast.error('Guarda el perfil institucional primero');
      return;
    }
    setAdding(true);
    try {
      const sh = await api.addStakeholder(institutionId, form);
      setStakeholders(prev => [...prev, sh]);
      setForm(INITIAL_FORM);
      toast.success(`"${sh.name}" agregado como stakeholder`);
    } catch (err) {
      toast.error(err.message || 'Error al agregar stakeholder');
    }
    setAdding(false);
  };

  const handleDelete = async (id, name) => {
    try {
      await api.deleteStakeholder(id);
      setStakeholders(prev => prev.filter(s => s.id !== id));
      toast.info(`"${name}" eliminado`);
    } catch (err) {
      toast.error(err.message || 'Error al eliminar stakeholder');
    }
  };

  const typeLabel = (val) => STAKEHOLDER_TYPES.find(t => t.value === val)?.label || val;
  const levelLabel = (val) => LEVELS.find(l => l.value === val)?.label || val;

  return (
    <div className="glass-panel card animate-fade-in">
      <h2 className="text-xl font-bold mb-2">👥 Partes Interesadas (Stakeholders)</h2>
      <p className="text-gray-400 text-sm mb-6">
        Identifica las personas, grupos y organizaciones que influyen o son afectados por las decisiones estratégicas. 
        Esto permite que la IA genere análisis contextualizados y recomendaciones alineadas.
      </p>

      {/* Add stakeholder form */}
      <div className="glass-panel p-4 rounded-xl bg-gray-800/30 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="form-label text-sm">Nombre *</label>
            <input 
              type="text" 
              className="form-textarea min-h-[auto] py-2 px-3" 
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Ej: Ministerio de Industria, Clientes Corporativos, Junta de Directores"
            />
          </div>
          <div>
            <label className="form-label text-sm">Tipo</label>
            <select 
              className="form-textarea min-h-[auto] py-2 px-3"
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            >
              {STAKEHOLDER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label text-sm">Influencia</label>
            <select 
              className="form-textarea min-h-[auto] py-2 px-3"
              value={form.influence}
              onChange={e => setForm(f => ({ ...f, influence: e.target.value }))}
            >
              {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label text-sm">Interés</label>
            <select 
              className="form-textarea min-h-[auto] py-2 px-3"
              value={form.interest}
              onChange={e => setForm(f => ({ ...f, interest: e.target.value }))}
            >
              {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className="form-label text-sm">Notas (opcional)</label>
          <input 
            type="text"
            className="form-textarea min-h-[auto] py-2 px-3"
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Contexto adicional sobre la relación con este stakeholder"
          />
        </div>
        <button 
          type="button" 
          onClick={handleAdd} 
          disabled={adding || !form.name.trim()}
          className={`btn btn-primary w-full ${adding || !form.name.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {adding ? '⏳ Agregando...' : '➕ Agregar Stakeholder'}
        </button>
      </div>

      {/* Stakeholder list */}
      {stakeholders.length > 0 && (
        <div className="flex flex-col gap-3 mt-4">
          <h3 className="text-md text-gray-400">Stakeholders Registrados ({stakeholders.length})</h3>
          {stakeholders.map(sh => (
            <div key={sh.id} className="glass-panel p-4 flex justify-between items-center rounded-xl bg-gray-800/30">
              <div>
                <strong className="text-white block">{sh.name}</strong>
                <span className="text-xs text-gray-400 block mt-1">
                  {typeLabel(sh.type)} · Influencia: {levelLabel(sh.influence)} · Interés: {levelLabel(sh.interest)}
                </span>
                {sh.notes && <span className="text-xs text-gray-500 block mt-1">{sh.notes}</span>}
              </div>
              <button 
                onClick={() => handleDelete(sh.id, sh.name)} 
                className="text-red-400 hover:text-red-300 transition-colors p-2 text-xl"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      {stakeholders.length === 0 && (
        <div className="glass-panel p-4 rounded-xl bg-gray-800/20 text-center text-gray-500 text-sm">
          No se han registrado stakeholders aún. Puedes continuar y agregarlos después.
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button type="button" onClick={onPrev} className="btn glass-panel bg-transparent border-transparent hover:bg-gray-800">← Anterior</button>
        <button type="button" onClick={onNext} className="btn btn-primary">Siguiente →</button>
      </div>
    </div>
  );
}
