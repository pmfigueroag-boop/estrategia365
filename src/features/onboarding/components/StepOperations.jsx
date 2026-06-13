'use client';
import { useState } from 'react';
import { useToast } from '@/features/plan/context/ToastContext';
import api from '@/lib/api';

const PORTER_PRIMARY = [
  { key: 'inbound_logistics', label: 'Logística de Entrada', icon: '📦', desc: 'Recepción, almacenamiento y distribución interna de insumos' },
  { key: 'operations', label: 'Operaciones', icon: '⚙️', desc: 'Transformación de insumos en el producto/servicio final' },
  { key: 'outbound_logistics', label: 'Logística de Salida', icon: '🚚', desc: 'Almacenamiento y distribución del producto al cliente' },
  { key: 'marketing_sales', label: 'Marketing & Ventas', icon: '📢', desc: 'Actividades de promoción, publicidad y venta' },
  { key: 'service', label: 'Servicio', icon: '🤝', desc: 'Soporte post-venta, mantenimiento y atención al cliente' },
];

const PORTER_SUPPORT = [
  { key: 'firm_infrastructure', label: 'Infraestructura', icon: '🏗️', desc: 'Gestión general, finanzas, legal, planificación' },
  { key: 'human_resources', label: 'Recursos Humanos', icon: '👥', desc: 'Reclutamiento, formación, desarrollo de talento' },
  { key: 'technology_development', label: 'Desarrollo Tecnológico', icon: '💻', desc: 'I+D, automatización, innovación tecnológica' },
  { key: 'procurement', label: 'Adquisiciones', icon: '🛒', desc: 'Compras, contratos, gestión de proveedores' },
];

const STRENGTH_OPTIONS = [
  { value: 'weak', label: '🔴 Débil', color: 'text-red-400 border-red-500/50' },
  { value: 'adequate', label: '🟡 Adecuado', color: 'text-yellow-400 border-yellow-500/50' },
  { value: 'strong', label: '🟢 Fuerte', color: 'text-emerald-400 border-emerald-500/50' },
  { value: 'differentiator', label: '⭐ Diferenciador', color: 'text-purple-400 border-purple-500/50' },
];

const DEP_TYPES = [
  { value: 'supplier', label: '📦 Proveedor' },
  { value: 'technology', label: '💻 Tecnología' },
  { value: 'regulatory', label: '📜 Regulatorio' },
  { value: 'partner', label: '🤝 Socio' },
  { value: 'infrastructure', label: '🏗️ Infraestructura' },
  { value: 'talent', label: '👥 Talento' },
];

const TECH_TYPES = [
  { value: 'erp', label: 'ERP' },
  { value: 'crm', label: 'CRM' },
  { value: 'bi', label: 'BI / Analytics' },
  { value: 'hrms', label: 'HRMS' },
  { value: 'cms', label: 'CMS' },
  { value: 'ecommerce', label: 'E-Commerce' },
  { value: 'custom', label: 'Custom / In-House' },
  { value: 'other', label: 'Otro' },
];

const INTEGRATION_LEVELS = [
  { value: 'isolated', label: '🔴 Aislado' },
  { value: 'partial', label: '🟡 Parcial' },
  { value: 'integrated', label: '🟢 Integrado' },
  { value: 'real_time', label: '⚡ Tiempo Real' },
];

export default function StepOperations({
  onPrev, onNext, institutionId,
  valueChain, setValueChain,
  dependencies, setDependencies,
  techSystems, setTechSystems,
}) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  // ── Value Chain ────────────────────────────────────────────
  const handleInitValueChain = async () => {
    if (valueChain.length > 0) return;
    setSaving(true);
    try {
      const allActivities = [
        ...PORTER_PRIMARY.map(a => ({ activity_type: 'primary', activity_name: a.key })),
        ...PORTER_SUPPORT.map(a => ({ activity_type: 'support', activity_name: a.key })),
      ];
      const created = [];
      for (const act of allActivities) {
        const result = await api.addValueChainActivity(institutionId, act);
        created.push(result);
      }
      setValueChain(created);
      toast.success('Cadena de valor inicializada con 9 actividades de Porter');
    } catch (e) { toast.error(e.message); }
    setSaving(false);
  };

  const handleUpdateActivity = async (activityId, data) => {
    try {
      const updated = await api.updateValueChainActivity(activityId, data);
      setValueChain(prev => prev.map(a => a.id === activityId ? updated : a));
    } catch (e) { toast.error(e.message); }
  };

  // ── Dependencies ──────────────────────────────────────────
  const [depName, setDepName] = useState('');
  const [depType, setDepType] = useState('technology');
  const [depProvider, setDepProvider] = useState('');
  const [depCriticality, setDepCriticality] = useState('medium');

  const handleAddDep = async () => {
    if (!depName.trim()) return;
    try {
      const dep = await api.addDependency(institutionId, {
        name: depName.trim(), type: depType, provider: depProvider.trim(), criticality: depCriticality,
      });
      setDependencies(prev => [...prev, dep]);
      setDepName(''); setDepProvider('');
      toast.success('Dependencia registrada');
    } catch (e) { toast.error(e.message); }
  };

  const handleDeleteDep = async (id) => {
    try {
      await api.deleteDependency(id);
      setDependencies(prev => prev.filter(d => d.id !== id));
    } catch (e) { toast.error(e.message); }
  };

  // ── Tech Systems ──────────────────────────────────────────
  const [techName, setTechName] = useState('');
  const [techType, setTechType] = useState('other');
  const [techVendor, setTechVendor] = useState('');
  const [techIntegration, setTechIntegration] = useState('isolated');

  const handleAddTech = async () => {
    if (!techName.trim()) return;
    try {
      const sys = await api.addTechSystem(institutionId, {
        name: techName.trim(), type: techType, vendor: techVendor.trim(), integration_status: techIntegration,
      });
      setTechSystems(prev => [...prev, sys]);
      setTechName(''); setTechVendor('');
      toast.success('Sistema registrado');
    } catch (e) { toast.error(e.message); }
  };

  const handleDeleteTech = async (id) => {
    try {
      await api.deleteTechSystem(id);
      setTechSystems(prev => prev.filter(s => s.id !== id));
    } catch (e) { toast.error(e.message); }
  };

  const allActivities = [...PORTER_PRIMARY, ...PORTER_SUPPORT];

  return (
    <div className="glass-panel card animate-fade-in space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-1">🔗 Operaciones & Ecosistema</h2>
        <p className="text-gray-400 text-sm">Cadena de valor, dependencias críticas y sistemas tecnológicos.</p>
      </div>

      {/* ── SECCIÓN A: Cadena de Valor ──────────────────────── */}
      <div>
        <h3 className="text-lg font-semibold text-indigo-400 mb-3">📊 Cadena de Valor (Porter)</h3>
        <p className="text-gray-500 text-xs mb-4">Evalúa la fortaleza de cada actividad de la cadena de valor de tu organización.</p>

        {valueChain.length === 0 ? (
          <button type="button" onClick={handleInitValueChain} disabled={saving}
            className="btn btn-primary w-full py-3">
            {saving ? '⏳ Inicializando...' : '🚀 Inicializar Cadena de Valor (9 actividades de Porter)'}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Actividades Primarias</div>
            {valueChain.filter(a => a.activity_type === 'primary').map(act => {
              const def = allActivities.find(d => d.key === act.activity_name);
              return (
                <div key={act.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700">
                  <span className="text-lg">{def?.icon || '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">{def?.label || act.activity_name}</div>
                    <div className="text-xs text-gray-500">{def?.desc || ''}</div>
                  </div>
                  <div className="flex gap-1.5">
                    {STRENGTH_OPTIONS.map(s => (
                      <button key={s.value} type="button"
                        onClick={() => handleUpdateActivity(act.id, { strength_level: s.value })}
                        className={`px-2 py-1 text-xs rounded border transition-all ${
                          act.strength_level === s.value 
                            ? `${s.color} bg-white/5 font-semibold` 
                            : 'text-gray-500 border-gray-700 hover:border-gray-500'
                        }`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="text-xs text-gray-500 uppercase tracking-wider mt-4 mb-2">Actividades de Soporte</div>
            {valueChain.filter(a => a.activity_type === 'support').map(act => {
              const def = allActivities.find(d => d.key === act.activity_name);
              return (
                <div key={act.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700">
                  <span className="text-lg">{def?.icon || '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">{def?.label || act.activity_name}</div>
                    <div className="text-xs text-gray-500">{def?.desc || ''}</div>
                  </div>
                  <div className="flex gap-1.5">
                    {STRENGTH_OPTIONS.map(s => (
                      <button key={s.value} type="button"
                        onClick={() => handleUpdateActivity(act.id, { strength_level: s.value })}
                        className={`px-2 py-1 text-xs rounded border transition-all ${
                          act.strength_level === s.value 
                            ? `${s.color} bg-white/5 font-semibold` 
                            : 'text-gray-500 border-gray-700 hover:border-gray-500'
                        }`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── SECCIÓN B: Dependencias Críticas ────────────────── */}
      <div>
        <h3 className="text-lg font-semibold text-amber-400 mb-3">⚠️ Dependencias Críticas</h3>
        <p className="text-gray-500 text-xs mb-4">¿De qué depende críticamente tu organización? Proveedores, reguladores, tecnología, talento.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <input value={depName} onChange={e => setDepName(e.target.value)} placeholder="Nombre de la dependencia"
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
          <input value={depProvider} onChange={e => setDepProvider(e.target.value)} placeholder="Proveedor / Fuente (opcional)"
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {DEP_TYPES.map(t => (
            <button key={t.value} type="button" onClick={() => setDepType(t.value)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                depType === t.value ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}>{t.label}</button>
          ))}
        </div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-gray-500">Criticidad:</span>
          {['low', 'medium', 'high', 'critical'].map(c => (
            <button key={c} type="button" onClick={() => setDepCriticality(c)}
              className={`px-2.5 py-1 text-xs rounded border transition-all ${
                depCriticality === c ? 'border-amber-500 bg-amber-500/10 text-amber-400 font-semibold' : 'border-gray-700 text-gray-400'
              }`}>{c === 'low' ? 'Baja' : c === 'medium' ? 'Media' : c === 'high' ? 'Alta' : 'Crítica'}</button>
          ))}
          <button type="button" onClick={handleAddDep} disabled={!depName.trim()}
            className="ml-auto btn btn-primary text-xs px-4 py-1.5">+ Agregar</button>
        </div>

        {dependencies.length === 0 ? (
          <div className="text-center py-4 text-gray-600 text-sm border border-dashed border-gray-700 rounded-lg">
            No se han registrado dependencias aún
          </div>
        ) : (
          <div className="space-y-2">
            {dependencies.map(d => (
              <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700">
                <span className="text-sm">{DEP_TYPES.find(t => t.value === d.type)?.label?.split(' ')[0] || '📌'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{d.name}</div>
                  <div className="text-xs text-gray-500">{d.provider && `${d.provider} · `}{d.criticality}</div>
                </div>
                <button type="button" onClick={() => handleDeleteDep(d.id)} className="text-red-400 hover:text-red-300 text-xs">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SECCIÓN C: Ecosistema Tecnológico ──────────────── */}
      <div>
        <h3 className="text-lg font-semibold text-cyan-400 mb-3">💻 Ecosistema Tecnológico</h3>
        <p className="text-gray-500 text-xs mb-4">¿Qué sistemas usa tu organización hoy? ERP, CRM, BI, plataformas propias.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <input value={techName} onChange={e => setTechName(e.target.value)} placeholder="Nombre del sistema"
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
          <input value={techVendor} onChange={e => setTechVendor(e.target.value)} placeholder="Vendor (SAP, Oracle, Salesforce...)"
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {TECH_TYPES.map(t => (
            <button key={t.value} type="button" onClick={() => setTechType(t.value)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                techType === t.value ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}>{t.label}</button>
          ))}
        </div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-gray-500">Integración:</span>
          {INTEGRATION_LEVELS.map(i => (
            <button key={i.value} type="button" onClick={() => setTechIntegration(i.value)}
              className={`px-2.5 py-1 text-xs rounded border transition-all ${
                techIntegration === i.value ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 font-semibold' : 'border-gray-700 text-gray-400'
              }`}>{i.label}</button>
          ))}
          <button type="button" onClick={handleAddTech} disabled={!techName.trim()}
            className="ml-auto btn btn-primary text-xs px-4 py-1.5">+ Agregar</button>
        </div>

        {techSystems.length === 0 ? (
          <div className="text-center py-4 text-gray-600 text-sm border border-dashed border-gray-700 rounded-lg">
            No se han registrado sistemas aún
          </div>
        ) : (
          <div className="space-y-2">
            {techSystems.map(s => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700">
                <span className="text-sm">💻</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{s.name}</div>
                  <div className="text-xs text-gray-500">
                    {s.vendor && `${s.vendor} · `}{TECH_TYPES.find(t => t.value === s.type)?.label || s.type} · {INTEGRATION_LEVELS.find(i => i.value === s.integration_status)?.label || s.integration_status}
                  </div>
                </div>
                <button type="button" onClick={() => handleDeleteTech(s.id)} className="text-red-400 hover:text-red-300 text-xs">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Navigation ────────────────────────────────────────── */}
      <div className="flex justify-between pt-4">
        <button type="button" onClick={onPrev} className="btn glass-panel bg-transparent border-transparent hover:bg-gray-800">← Anterior</button>
        <button type="button" onClick={onNext} className="btn btn-primary">Siguiente →</button>
      </div>
    </div>
  );
}
