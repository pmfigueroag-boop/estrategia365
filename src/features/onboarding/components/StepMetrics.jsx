'use client';
import { useState } from 'react';
import { useToast } from '@/features/plan/context/ToastContext';
import api from '@/core/infrastructure/api';

const HORIZON_OPTIONS = [
  { value: 12, label: '1 año', desc: 'Corto plazo — táctico' },
  { value: 24, label: '2 años', desc: 'Medio plazo — operativo' },
  { value: 36, label: '3 años', desc: 'Estándar — recomendado', recommended: true },
  { value: 48, label: '4 años', desc: 'Largo plazo — institucional' },
  { value: 60, label: '5 años', desc: 'Visión estratégica extendida' },
];

const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'DOP', 'MXN', 'COP', 'BRL', 'ARS', 'CLP', 'PEN'];

const SUGGESTED_KPIS = {
  private: [
    { name: 'Ingresos Anuales', unit: 'USD' },
    { name: 'Margen Operativo', unit: '%' },
    { name: 'Satisfacción del Cliente (NPS)', unit: 'puntos' },
    { name: 'Retención de Empleados', unit: '%' },
    { name: 'Cuota de Mercado', unit: '%' },
  ],
  public: [
    { name: 'Cobertura de Servicio', unit: '%' },
    { name: 'Satisfacción Ciudadana', unit: 'puntos' },
    { name: 'Ejecución Presupuestaria', unit: '%' },
    { name: 'Tiempo de Respuesta', unit: 'días' },
    { name: 'Transparencia (Índice)', unit: 'puntos' },
  ],
};

export default function StepMetrics({
  onPrev, onNext, institutionId,
  metrics, setMetrics,
  sector,
}) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const budget = metrics.strategic_budget || 0;
  const budgetCurrency = metrics.strategic_budget_currency || 'USD';
  const horizon = metrics.time_horizon_months || 36;
  const kpis = metrics.kpis || [];

  // ── KPI State ────────────────────────────────────────────
  const [kpiName, setKpiName] = useState('');
  const [kpiCurrent, setKpiCurrent] = useState('');
  const [kpiTarget, setKpiTarget] = useState('');
  const [kpiUnit, setKpiUnit] = useState('');

  const updateMetrics = (updates) => {
    setMetrics(prev => ({ ...prev, ...updates }));
  };

  const handleAddKpi = () => {
    if (!kpiName.trim()) return;
    const newKpi = {
      id: Date.now(),
      name: kpiName.trim(),
      current: parseFloat(kpiCurrent) || 0,
      target: parseFloat(kpiTarget) || 0,
      unit: kpiUnit.trim() || '',
    };
    updateMetrics({ kpis: [...kpis, newKpi] });
    setKpiName(''); setKpiCurrent(''); setKpiTarget(''); setKpiUnit('');
  };

  const handleDeleteKpi = (id) => {
    updateMetrics({ kpis: kpis.filter(k => k.id !== id) });
  };

  const handleUseSuggested = (suggestion) => {
    setKpiName(suggestion.name);
    setKpiUnit(suggestion.unit);
  };

  const handleSaveMetrics = async () => {
    setSaving(true);
    try {
      await api.updateInstitution(institutionId, {
        strategic_budget: budget,
        strategic_budget_currency: budgetCurrency,
        time_horizon_months: horizon,
        baseline_kpis: JSON.stringify(kpis),
      });
      toast.success('Métricas guardadas');
    } catch (e) { toast.error(e.message); }
    setSaving(false);
  };

  const sectorSuggestions = SUGGESTED_KPIS[sector] || SUGGESTED_KPIS.private;

  return (
    <div className="glass-panel card animate-fade-in space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-1">📊 Métricas & Horizonte</h2>
        <p className="text-gray-400 text-sm">Presupuesto estratégico, horizonte temporal y KPIs baseline de tu organización.</p>
      </div>

      {/* ── SECCIÓN A: Presupuesto Estratégico ────────────── */}
      <div>
        <h3 className="text-lg font-semibold text-emerald-400 mb-3">💰 Presupuesto Estratégico</h3>
        <p className="text-gray-500 text-xs mb-4">Presupuesto asignado o estimado para iniciativas estratégicas (transformación, innovación, consultoría).</p>

        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Monto</label>
            <input type="number" value={budget || ''} onChange={e => updateMetrics({ strategic_budget: parseFloat(e.target.value) || 0 })}
              placeholder="0" min="0" step="1000"
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white w-full" />
          </div>
          <div className="w-28">
            <label className="text-xs text-gray-500 mb-1 block">Moneda</label>
            <select value={budgetCurrency} onChange={e => updateMetrics({ strategic_budget_currency: e.target.value })}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white w-full">
              {CURRENCY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── SECCIÓN B: Horizonte Temporal ────────────────── */}
      <div>
        <h3 className="text-lg font-semibold text-blue-400 mb-3">🗓️ Horizonte Temporal</h3>
        <p className="text-gray-500 text-xs mb-4">¿Cuánto tiempo abarca tu ciclo estratégico?</p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {HORIZON_OPTIONS.map(h => (
            <button key={h.value} type="button" onClick={() => updateMetrics({ time_horizon_months: h.value })}
              className={`p-3 text-left rounded-lg transition-all border ${
                horizon === h.value
                  ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                  : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'
              }`}>
              <div className="font-semibold text-sm">{h.label}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{h.desc}</div>
              {h.recommended && <div className="text-[9px] text-blue-500 mt-1 font-semibold">⭐ RECOMENDADO</div>}
            </button>
          ))}
        </div>
      </div>

      {/* ── SECCIÓN C: KPIs Baseline ────────────────────── */}
      <div>
        <h3 className="text-lg font-semibold text-purple-400 mb-3">📈 KPIs Baseline</h3>
        <p className="text-gray-500 text-xs mb-4">3-5 métricas actuales que importan a tu organización. Estos serán los puntos de referencia para medir el progreso.</p>

        {/* Suggested KPIs */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-2">Sugeridos para tu sector:</div>
          <div className="flex flex-wrap gap-2">
            {sectorSuggestions.map(s => (
              <button key={s.name} type="button" onClick={() => handleUseSuggested(s)}
                className="px-3 py-1 text-xs rounded-full border border-gray-700 text-gray-400 hover:border-purple-500 hover:text-purple-400 transition-all">
                + {s.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <input value={kpiName} onChange={e => setKpiName(e.target.value)} placeholder="Nombre del KPI"
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
          <input type="number" value={kpiCurrent} onChange={e => setKpiCurrent(e.target.value)} placeholder="Valor actual"
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
          <input type="number" value={kpiTarget} onChange={e => setKpiTarget(e.target.value)} placeholder="Meta / Target"
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
          <div className="flex gap-2">
            <input value={kpiUnit} onChange={e => setKpiUnit(e.target.value)} placeholder="Unidad (%,USD...)"
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white flex-1" />
            <button type="button" onClick={handleAddKpi} disabled={!kpiName.trim()}
              className="btn btn-primary text-xs px-3">+</button>
          </div>
        </div>

        {kpis.length === 0 ? (
          <div className="text-center py-4 text-gray-600 text-sm border border-dashed border-gray-700 rounded-lg">
            No se han registrado KPIs aún — usa las sugerencias o agrega manualmente
          </div>
        ) : (
          <div className="space-y-2">
            {kpis.map(k => (
              <div key={k.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700">
                <span className="text-sm">📈</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{k.name}</div>
                  <div className="text-xs text-gray-500">
                    Actual: <span className="text-purple-400">{k.current} {k.unit}</span> · Meta: <span className="text-emerald-400">{k.target} {k.unit}</span>
                  </div>
                </div>
                <button type="button" onClick={() => handleDeleteKpi(k.id)} className="text-red-400 hover:text-red-300 text-xs">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Save & Navigate ──────────────────────────────── */}
      <div className="flex justify-between pt-4">
        <button type="button" onClick={onPrev} className="btn glass-panel bg-transparent border-transparent hover:bg-gray-800">← Anterior</button>
        <div className="flex gap-3">
          <button type="button" onClick={handleSaveMetrics} disabled={saving}
            className="btn glass-panel border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10">
            {saving ? '⏳ Guardando...' : '💾 Guardar Métricas'}
          </button>
          <button type="button" onClick={onNext} className="btn btn-primary">Siguiente →</button>
        </div>
      </div>
    </div>
  );
}
